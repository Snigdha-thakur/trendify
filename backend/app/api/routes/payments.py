import re
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.models import Transaction, DigitalProduct, User, WalletLog, ReferralEarning, GatewayLog
from app.schemas.schemas import TransactionCreate, TransactionResponse
from app.api.routes.users import get_current_user
from app.services.cashfree_service import CashfreeService
from app.core.config import settings
from decimal import Decimal

router = APIRouter(prefix="/api/payments", tags=["Payments"])

COMMISSION_RATE = Decimal("0.10")  # 10% platform commission


@router.post("/initiate")
async def initiate_payment(
    data: TransactionCreate,
    db: Session = Depends(get_db),
):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == data.product_id).first()
    if not product or product.status != "Active":
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    amount = Decimal(str(data.amount))
    commission = (amount * COMMISSION_RATE).quantize(Decimal("0.01"))
    creator_amount = amount - commission

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
        order_id=data.id,
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

    if not order_id:
        return {"status": "ignored"}

    txn = db.query(Transaction).filter(
        (Transaction.id == order_id) | (Transaction.cashfree_order_id == order_id)
    ).first()

    if not txn:
        return {"status": "not_found"}

    db.add(GatewayLog(transaction_id=txn.id, log_type="Webhook"))

    if payment_status in ("SUCCESS", "PAID"):
        txn.status = "Success"
        _credit_wallets(txn, db)
        db.commit()
        await _broadcast_wallet_update(txn)
        return {"status": "ok"}
    elif payment_status in ("FAILED", "CANCELLED", "VOID"):
        txn.status = "Failed"

    db.commit()
    return {"status": "ok"}


@router.get("/transactions", response_model=list[TransactionResponse])
def get_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txns = (
        db.query(Transaction)
        .filter(Transaction.creator_id == current_user.id)
        .order_by(Transaction.created_at.desc())
        .all()
    )
    result = []
    for txn in txns:
        txn_dict = TransactionResponse.model_validate(txn).model_dump()
        txn_dict["product_name"] = txn.product.name if txn.product else None
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
        txn.status = "Success"
        _credit_wallets(txn, db)
        db.add(GatewayLog(transaction_id=txn.id, log_type="Verify"))
        db.commit()
        await _broadcast_wallet_update(txn)
        return {"status": "success", "message": "Payment verified and wallet credited"}

    return {"status": txn.status.lower(), "message": "Payment not yet successful"}


# ---------- internal helpers ----------

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
