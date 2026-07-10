import re
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.models import Transaction, DigitalProduct, User, WalletLog, ReferralEarning, GatewayLog, PlatformSetting
from app.schemas.schemas import TransactionCreate, TransactionResponse
from app.api.routes.users import get_current_user
from app.services.cashfree_service import CashfreeService
from app.core.config import settings
from app.utils.email import send_purchase_confirmation
from decimal import Decimal

router = APIRouter(prefix="/api/payments", tags=["Payments"])


def _get_commission_rate(db: Session, creator_id=None) -> Decimal:
    # If a creator-specific fee is configured, use it first.
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
async def initiate_payment(
    data: TransactionCreate,
    db: Session = Depends(get_db),
):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == data.product_id).first()
    if not product or product.status != "Active":
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    amount = Decimal(str(data.amount))
    commission = (amount * _get_commission_rate(db, creator_id=product.creator_id)).quantize(Decimal("0.01"))
    creator_amount = amount - commission

    import time, random, string
    cashfree_order_id = "order-" + str(int(time.time() * 1000)) + "-" + ''.join(random.choices(string.ascii_lowercase + string.digits, k=5))

    order_payload = {
        "order_id": data.id,
        "amount": float(amount),
        "currency": "INR",
        "customer_details": {
            "customer_id": "cust_" + re.sub(r'[^a-zA-Z0-9_-]', '_', str(data.buyer_email))[:45],
            "customer_email": data.buyer_email,
            "customer_phone": data.buyer_phone or "",
            "customer_name": data.buyer_name or "",
        },
    }

    cashfree_result = await CashfreeService.create_order(
        order_id=cashfree_order_id,
        amount=float(amount),
        currency="INR",
        customer_details=order_payload["customer_details"],
    )

    if not cashfree_result.get("success"):
        raise HTTPException(status_code=502, detail=f"Cashfree order creation failed: {cashfree_result.get('error')}")

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
        cashfree_order_id=cashfree_result.get("order_id"),
        payment_link=cashfree_result.get("payment_link"),
    )
    db.add(txn)

    db.add(GatewayLog(transaction_id=data.id, log_type="Request"))
    db.commit()
    db.refresh(txn)

    # Return extra fields needed by frontend SDK
    from app.schemas.schemas import TransactionResponse
    txn_dict = TransactionResponse.model_validate(txn).model_dump()
    txn_dict["payment_session_id"] = cashfree_result.get("payment_session_id")
    txn_dict["env"] = cashfree_result.get("env", "PROD")
    return txn_dict


@router.post("/webhook/cashfree")
async def cashfree_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.json()
    order_id = payload.get("data", {}).get("order", {}).get("order_id") or payload.get("orderId")
    payment_status = payload.get("data", {}).get("payment", {}).get("payment_status") or payload.get("txStatus")
    cf_payment_id = str(payload.get("data", {}).get("payment", {}).get("cf_payment_id") or "")

    if not order_id:
        return {"status": "ignored"}

    txn = db.query(Transaction).filter(
        (Transaction.id == order_id) | (Transaction.cashfree_order_id == order_id)
    ).first()

    if not txn:
        return {"status": "not_found"}

    # Eagerly load product name before session closes
    product_name = None
    try:
        product_name = txn.product.name if txn.product else str(txn.product_id)
    except Exception:
        product_name = str(txn.product_id)

    db.add(GatewayLog(transaction_id=txn.id, log_type="Webhook"))

    if cf_payment_id:
        txn.cf_payment_id = cf_payment_id

    if payment_status in ("SUCCESS", "PAID"):
        if txn.status != "Success":  # idempotency guard
            txn.status = "Success"
            _credit_wallets(txn, db)
            db.commit()
            await _broadcast_wallet_update(txn)
        try:
            _send_confirmation_email(txn, product_name=product_name)
        except Exception as e:
            print(f"[email] EXCEPTION in webhook: {e}")
        return {"status": "ok"}
    elif payment_status in ("FAILED", "CANCELLED", "VOID"):
        # Never downgrade to Failed if wallet was already credited
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
    # Also include transactions credited to this user's wallet (handles creator_id mismatch)
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


@router.get("/return")
async def payment_return(order_id: str, product_id: str = None, db: Session = Depends(get_db)):
    """Cashfree return URL handler - verifies payment, sends email, redirects to frontend."""
    from fastapi.responses import RedirectResponse
    import httpx

    txn = db.query(Transaction).filter(
        (Transaction.id == order_id) | (Transaction.cashfree_order_id == order_id)
    ).first()

    if not txn:
        return RedirectResponse(f"{settings.FRONTEND_URL}/payment-failed.html")

    # Query Cashfree for payment status
    env = (settings.CASHFREE_ENV or "TEST").upper()
    base = "https://api.cashfree.com" if env == "PROD" else "https://sandbox.cashfree.com"
    cf_order_id = txn.cashfree_order_id or txn.id
    headers = {
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
    }

    paid = False
    for _ in range(3):  # retry up to 3 times with delay (Cashfree may lag)
        try:
            import asyncio
            await asyncio.sleep(2)
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(f"{base}/pg/orders/{cf_order_id}/payments", headers=headers)
            payments = resp.json() if resp.is_success else []
            paid = any(p.get("payment_status") in ("SUCCESS", "PAID") for p in (payments if isinstance(payments, list) else []))
            if paid:
                break
        except Exception:
            pass

    pid = txn.product_id
    product = txn.product
    pname = encodeURIComponent_py(product.name if product else "")

    # If already marked Success (by webhook), trust it and send email
    if txn.status == "Success":
        try:
            _send_confirmation_email(txn)
        except Exception as e:
            print(f"[email] EXCEPTION in return: {e}")
        dest = f"{settings.FRONTEND_URL}/payment-success.html?product_id={pid}&order_id={txn.id}&amount={float(txn.amount or 0)}&product_name={pname}"
    elif paid:
        if txn.status != "Success":
            txn.status = "Success"
            _credit_wallets(txn, db)
            db.add(GatewayLog(transaction_id=txn.id, log_type="Return"))
            db.commit()
            await _broadcast_wallet_update(txn)
        _send_confirmation_email(txn)
        dest = f"{settings.FRONTEND_URL}/payment-success.html?product_id={pid}&order_id={txn.id}&amount={float(txn.amount or 0)}&product_name={pname}"
    else:
        dest = f"{settings.FRONTEND_URL}/payment-failed.html?product_id={pid}"

    return RedirectResponse(dest)


def encodeURIComponent_py(s: str) -> str:
    from urllib.parse import quote
    return quote(str(s), safe='')


@router.post("/transactions/{txn_id}/verify")
async def verify_transaction(txn_id: str, db: Session = Depends(get_db)):
    """Manually verify a payment status with Cashfree and credit wallet if successful."""
    import httpx
    from app.core.config import settings

    txn = db.query(Transaction).filter(
        (Transaction.id == txn_id) | (Transaction.cashfree_order_id == txn_id)
    ).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if txn.status == "Success":
        _send_confirmation_email(txn)  # resend email even if already marked success
        return {"status": "already_success", "message": "Transaction already marked as successful"}

    # Query Cashfree for the latest order status
    env = (settings.CASHFREE_ENV or "TEST").upper()
    base = "https://api.cashfree.com" if env == "PROD" else "https://sandbox.cashfree.com"
    order_id = txn.cashfree_order_id or txn.id
    headers = {
        "x-client-id": settings.CASHFREE_APP_ID,
        "x-client-secret": settings.CASHFREE_SECRET_KEY,
        "x-api-version": "2023-08-01",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.get(f"{base}/pg/orders/{order_id}/payments", headers=headers)

    if not resp.is_success:
        raise HTTPException(status_code=502, detail="Could not reach Cashfree")

    payments = resp.json()
    paid = any(
        p.get("payment_status") in ("SUCCESS", "PAID")
        for p in (payments if isinstance(payments, list) else [])
    )

    if paid:
        if txn.status != "Success":  # idempotency guard
            txn.status = "Success"
            _credit_wallets(txn, db)
            db.add(GatewayLog(transaction_id=txn.id, log_type="Verify"))
            db.commit()
            await _broadcast_wallet_update(txn)
        _send_confirmation_email(txn)  # always send email on verify
        return {"status": "success", "message": "Payment verified and wallet credited"}

    return {"status": txn.status.lower(), "message": "Payment not yet successful"}


# ---------- internal helpers ----------

def _send_confirmation_email(txn: Transaction, product_name: str = None):
    if not product_name:
        try:
            product_name = txn.product.name if txn.product else str(txn.product_id)
        except Exception:
            product_name = str(txn.product_id)
    # Use Cashfree transaction ID if available, else internal ID
    display_txn_id = str(txn.cf_payment_id) if txn.cf_payment_id else str(txn.id)
    # View Purchase → product's success_redirect (e.g. skillinspire login) or fallback to product page
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
    # Idempotency: skip if already credited for this transaction
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

    # Referral payout
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
