import re
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Transaction, DigitalProduct, User, WalletLog, ReferralEarning, GatewayLog, PlatformSetting
from app.schemas.schemas import TransactionCreate, TransactionResponse
from app.api.routes.users import get_current_user
from app.services.payu_service import PayUService
from app.core.config import settings
from app.utils.email import send_purchase_confirmation
from decimal import Decimal

router = APIRouter(prefix="/api/payments", tags=["Payments"])


def _get_commission_rate(db: Session, creator_id=None) -> Decimal:
    if creator_id:
        creator = db.query(User).filter(User.id == creator_id).first()
        if creator is not None:
            try:
                creator_fee = float(creator.platform_fee_pct or 0)
                if creator_fee > 0:
                    return Decimal(str(creator_fee)) / Decimal("100")
            except (TypeError, ValueError):
                pass

    row = db.query(PlatformSetting).filter(PlatformSetting.key == "platform_fee_pct").first()
    try:
        pct = float(row.value) if row else 10.0
    except (TypeError, ValueError):
        pct = 10.0
    return Decimal(str(pct)) / Decimal("100")


@router.post("/initiate")
def initiate_payment(
    data: TransactionCreate,
    db: Session = Depends(get_db),
):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == data.product_id).first()
    if not product or product.status != "Active":
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    amount = Decimal(str(data.amount))
    commission = (amount * _get_commission_rate(db, creator_id=product.creator_id)).quantize(Decimal("0.01"))
    creator_amount = amount - commission

    payu_result = PayUService.create_payment_params(
        txn_id=data.id,
        amount=float(amount),
        product_name=product.name,
        buyer_name=data.buyer_name or "",
        buyer_email=data.buyer_email,
        buyer_phone=data.buyer_phone or "",
    )

    if not payu_result.get("success"):
        raise HTTPException(status_code=502, detail=f"PayU setup failed: {payu_result.get('error')}")

    txn = Transaction(
        id=data.id,
        creator_id=product.creator_id,
        product_id=product.id,
        buyer_email=data.buyer_email,
        buyer_name=data.buyer_name,
        buyer_phone=data.buyer_phone,
        amount=amount,
        status="Pending",
        commission_amount=commission,
        creator_amount=creator_amount,
        gateway="PayU",
    )
    db.add(txn)
    db.add(GatewayLog(transaction_id=data.id, log_type="Request", gateway="PayU"))
    db.commit()
    db.refresh(txn)

    from app.schemas.schemas import TransactionResponse
    txn_dict = TransactionResponse.model_validate(txn).model_dump()
    txn_dict["payu_params"] = {k: v for k, v in payu_result.items() if k != "success"}
    return txn_dict


@router.post("/webhook/payu")
async def payu_webhook(request: Request, db: Session = Depends(get_db)):
    form = await request.form()
    payload = dict(form)

    if not PayUService.verify_webhook_hash(payload):
        return {"status": "invalid_hash"}

    order_id = payload.get("txnid")
    payment_status = payload.get("status", "").upper()
    payu_txn_id = payload.get("mihpayid", "")

    if not order_id:
        return {"status": "ignored"}

    txn = db.query(Transaction).filter(Transaction.id == order_id).first()
    if not txn:
        return {"status": "not_found"}

    product_name = None
    try:
        product_name = txn.product.name if txn.product else str(txn.product_id)
    except Exception:
        product_name = str(txn.product_id)

    db.add(GatewayLog(transaction_id=txn.id, log_type="Webhook", gateway="PayU"))

    if payu_txn_id:
        txn.cf_payment_id = payu_txn_id

    if payment_status == "SUCCESS":
        if txn.status != "Success":
            txn.status = "Success"
            _credit_wallets(txn, db)
            db.commit()
            await _broadcast_wallet_update(txn)
        try:
            _send_confirmation_email(txn, product_name=product_name)
        except Exception as e:
            print(f"[email] EXCEPTION in webhook: {e}")
        return {"status": "ok"}
    elif payment_status in ("FAILED", "CANCELLED"):
        already_credited = db.query(WalletLog).filter(
            WalletLog.transaction_id == txn.id,
            WalletLog.wallet_type == "Main Wallet",
            WalletLog.type == "Credit",
        ).first()
        if not already_credited:
            txn.status = "Failed"

    db.commit()
    return {"status": "ok"}


@router.get("/transactions")
def get_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    import json
    wallet_txn_ids = (
        db.query(WalletLog.transaction_id)
        .filter(
            WalletLog.user_id == current_user.id,
            WalletLog.transaction_id.isnot(None),
            WalletLog.wallet_type == "Main Wallet",
            WalletLog.type == "Credit",
        )
        .subquery()
    )
    txns = (
        db.query(Transaction)
        .filter(
            (Transaction.creator_id == current_user.id) |
            (Transaction.id.in_(wallet_txn_ids))
        )
        .order_by(Transaction.created_at.desc())
        .all()
    )
    result = []
    for txn in txns:
        txn_dict = TransactionResponse.model_validate(txn).model_dump()
        txn_dict["product_name"] = txn.product.name if txn.product else None
        txn_dict["form_fields"] = None
        if txn.product and txn.product.form_fields:
            try:
                txn_dict["form_fields"] = json.loads(txn.product.form_fields)
            except Exception:
                pass
        result.append(txn_dict)
    return result


@router.get("/transactions/{txn_id}", response_model=TransactionResponse)
def get_transaction(txn_id: str, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    txn_dict = TransactionResponse.model_validate(txn).model_dump()
    txn_dict["product_name"] = txn.product.name if txn.product else None
    return txn_dict


@router.post("/return/payu")
async def payu_return(request: Request, db: Session = Depends(get_db)):
    """PayU return URL handler - processes payment and redirects to custom URL."""
    from fastapi.responses import RedirectResponse
    from urllib.parse import quote

    try:
        form = await request.form()
        payload = dict(form)

        order_id = payload.get("txnid")
        payment_status = payload.get("status", "").upper()
        payu_txn_id = payload.get("mihpayid", "")

        if not order_id:
            return RedirectResponse(f"{settings.FRONTEND_URL}/payment-failed.html", status_code=303)

        txn = db.query(Transaction).filter(Transaction.id == order_id).first()
        if not txn:
            return RedirectResponse(f"{settings.FRONTEND_URL}/payment-failed.html", status_code=303)

        product = txn.product
        success_redirect = product.success_redirect if product else None
        failed_redirect = product.failed_redirect if product else None

        hash_valid = PayUService.verify_webhook_hash(payload)
        paid = hash_valid and payment_status == "SUCCESS"

        if payu_txn_id:
            txn.cf_payment_id = payu_txn_id

        if payment_status in ("FAILED", "CANCELLED"):
            db.add(GatewayLog(transaction_id=txn.id, log_type="Return", gateway="PayU"))
            db.commit()
            if failed_redirect:
                encoded_url = quote(failed_redirect, safe=":/?#[]@!$&'()*+,;=")
                return RedirectResponse(f"{settings.BACKEND_URL}/api/payments/redirect?url={encoded_url}", status_code=303)
            return RedirectResponse(f"{settings.FRONTEND_URL}/payment-failed.html?product_id={txn.product_id}", status_code=303)
        
        if txn.status == "Success" or paid:
            if txn.status != "Success":
                txn.status = "Success"
                _credit_wallets(txn, db)
                db.add(GatewayLog(transaction_id=txn.id, log_type="Return", gateway="PayU"))
                db.commit()
                await _broadcast_wallet_update(txn)
            try:
                _send_confirmation_email(txn)
            except Exception as e:
                print(f"[email] EXCEPTION in return: {e}")
            if success_redirect:
                encoded_url = quote(success_redirect, safe=":/?#[]@!$&'()*+,;=")
                return RedirectResponse(f"{settings.BACKEND_URL}/api/payments/redirect?url={encoded_url}", status_code=303)
            return RedirectResponse(f"{settings.FRONTEND_URL}/payment-success.html?product_id={txn.product_id}&order_id={txn.id}&amount={float(txn.amount or 0)}", status_code=303)
        
        db.add(GatewayLog(transaction_id=txn.id, log_type="Return", gateway="PayU"))
        db.commit()
        if failed_redirect:
            encoded_url = quote(failed_redirect, safe=":/?#[]@!$&'()*+,;=")
            return RedirectResponse(f"{settings.BACKEND_URL}/api/payments/redirect?url={encoded_url}", status_code=303)
        return RedirectResponse(f"{settings.FRONTEND_URL}/payment-failed.html?product_id={txn.product_id}", status_code=303)
    except Exception as e:
        print(f"[payu_return] ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return RedirectResponse(f"{settings.FRONTEND_URL}/payment-failed.html", status_code=303)


@router.get("/redirect")
async def redirect_endpoint(url: str):
    """Redirect endpoint that takes URL as query parameter."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=url, status_code=303)


def encodeURIComponent_py(s: str) -> str:
    from urllib.parse import quote
    return quote(str(s), safe='')


@router.post("/transactions/{txn_id}/verify")
async def verify_transaction(txn_id: str, db: Session = Depends(get_db)):
    """Manually verify a transaction status and credit wallet if successful."""
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if txn.status == "Success":
        _send_confirmation_email(txn)
        return {"status": "already_success", "message": "Transaction already marked as successful"}

    return {"status": txn.status.lower(), "message": "Payment not yet successful"}


def _send_confirmation_email(txn: Transaction, product_name: str = None):
    if not product_name:
        try:
            product_name = txn.product.name if txn.product else str(txn.product_id)
        except Exception:
            product_name = str(txn.product_id)
    display_txn_id = str(txn.cf_payment_id) if txn.cf_payment_id else str(txn.id)
    product = txn.product
    view_url = (product.success_redirect if product and product.success_redirect else f"{settings.FRONTEND_URL}/product.html?id={txn.product_id}")
    print(f"[email] Sending to {txn.buyer_email} for product {product_name}")
    send_purchase_confirmation(
        buyer_email=txn.buyer_email,
        buyer_name=txn.buyer_name or "Customer",
        product_name=product_name,
        transaction_id=display_txn_id,
        amount=float(txn.amount or 0),
        view_url=view_url,
    )


async def _broadcast_wallet_update(txn: Transaction):
    """Broadcast wallet update event to all connected WebSocket clients."""
    try:
        from app.api.routes.realtime import manager
        await manager.broadcast_to_all({
            "type": "wallet_update",
            "transaction_id": str(txn.id),
            "creator_id": str(txn.creator_id),
            "amount": float(txn.creator_amount or 0),
        })
    except Exception as e:
        print(f"[broadcast] wallet_update failed: {e}")


def _credit_wallets(txn: Transaction, db: Session):
    """Credit creator wallet and referral wallet on successful payment."""
    already = db.query(WalletLog).filter(
        WalletLog.transaction_id == txn.id,
        WalletLog.wallet_type == "Main Wallet",
        WalletLog.type == "Credit",
    ).first()
    if already:
        return

    creator = db.query(User).filter(User.id == txn.creator_id).first()
    if not creator:
        return

    old_bal = creator.wallet_balance or Decimal(0)
    creator.wallet_balance = old_bal + (txn.creator_amount or Decimal(0))
    db.add(WalletLog(
        user_id=creator.id,
        transaction_id=txn.id,
        wallet_type="Main Wallet",
        type="Credit",
        existing_balance=old_bal,
        amount=txn.creator_amount,
        new_balance=creator.wallet_balance,
    ))

    if creator.referred_by:
        referrer = db.query(User).filter(User.id == creator.referred_by).first()
        if referrer:
            ref_amount = (txn.commission_amount or Decimal(0)) * Decimal("0.30")
            old_ref_bal = referrer.referral_wallet_balance or Decimal(0)
            referrer.referral_wallet_balance = old_ref_bal + ref_amount
            db.add(WalletLog(
                user_id=referrer.id,
                transaction_id=txn.id,
                wallet_type="Referral Wallet",
                type="Credit",
                existing_balance=old_ref_bal,
                amount=ref_amount,
                new_balance=referrer.referral_wallet_balance,
            ))
            db.add(ReferralEarning(
                transaction_id=txn.id,
                referrer_id=referrer.id,
                from_creator_id=creator.id,
                amount=ref_amount,
                percentage="30",
            ))
