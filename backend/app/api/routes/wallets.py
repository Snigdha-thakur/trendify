from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.models.models import User, WalletLog, Payout, ReferralEarning, PayoutWebhook
from app.schemas.schemas import (
    WalletLogResponse, PayoutResponse, ReferralEarningResponse,
    PayoutWebhookCreate, PayoutWebhookResponse,
)
from app.api.routes.users import get_current_user
from decimal import Decimal
import uuid

router = APIRouter(prefix="/api/wallets", tags=["Wallets"])


@router.get("/balance")
def get_balance(current_user: User = Depends(get_current_user)):
    return {
        "wallet_balance": float(current_user.wallet_balance or 0),
        "referral_wallet_balance": float(current_user.referral_wallet_balance or 0),
    }


@router.get("/logs", response_model=list[WalletLogResponse])
def get_wallet_logs(
    skip: int = 0,
    limit: int = 500,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(WalletLog)
        .filter(WalletLog.user_id == current_user.id)
        .order_by(WalletLog.created_at.desc())
        .offset(skip).limit(min(limit, 1000)).all()
    )


@router.post("/withdraw")
def request_withdrawal(
    amount: float,
    payout_type: str = "creator",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    amount_dec = Decimal(str(amount))
    if amount_dec <= 0:
        raise HTTPException(status_code=400, detail="Amount must be > 0")

    if payout_type == "referral":
        balance = current_user.referral_wallet_balance or Decimal(0)
        if balance < amount_dec:
            raise HTTPException(status_code=400, detail="Insufficient referral wallet balance")
        old_bal = balance
        current_user.referral_wallet_balance = balance - amount_dec
    else:
        balance = current_user.wallet_balance or Decimal(0)
        if balance < amount_dec:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        old_bal = balance
        current_user.wallet_balance = balance - amount_dec

    wallet_type = "Referral Wallet" if payout_type == "referral" else "Main Wallet"
    new_balance = current_user.referral_wallet_balance if payout_type == "referral" else current_user.wallet_balance

    payout_id = f"payout-{uuid.uuid4()}"
    payout = Payout(
        id=payout_id,
        user_id=current_user.id,
        amount=amount_dec,
        status="Pending",
        payout_type=payout_type,
    )
    db.add(payout)
    db.add(WalletLog(
        user_id=current_user.id,
        wallet_type=wallet_type,
        type="Debit",
        existing_balance=old_bal,
        amount=amount_dec,
        new_balance=new_balance,
    ))
    db.commit()
    return {"message": "Withdrawal requested", "payout_id": payout_id, "status": "Pending"}


@router.get("/payouts", response_model=list[PayoutResponse])
def get_payouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(Payout).filter(Payout.user_id == current_user.id).order_by(Payout.created_at.desc()).all()


@router.get("/referral-earnings", response_model=list[ReferralEarningResponse])
def get_referral_earnings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    earnings = (
        db.query(ReferralEarning)
        .filter(ReferralEarning.referrer_id == current_user.id)
        .order_by(ReferralEarning.created_at.desc())
        .all()
    )

    return [
        {
            "id": earn.id,
            "transaction_id": earn.transaction_id,
            "referrer_id": earn.referrer_id,
            "from_creator_id": earn.from_creator_id,
            "from_creator_email": earn.from_creator.email if earn.from_creator else None,
            "amount": float(earn.amount or 0),
            "percentage": earn.percentage,
            "source": earn.source,
            "created_at": earn.created_at,
        }
        for earn in earnings
    ]


# Payout Webhooks
@router.get("/webhooks", response_model=list[PayoutWebhookResponse])
def get_webhooks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(PayoutWebhook).filter(PayoutWebhook.user_id == current_user.id).all()


@router.post("/webhooks", response_model=PayoutWebhookResponse)
def create_webhook(
    data: PayoutWebhookCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    webhook = PayoutWebhook(user_id=current_user.id, webhook_url=data.webhook_url)
    db.add(webhook)
    db.commit()
    db.refresh(webhook)
    return webhook


@router.delete("/webhooks/{webhook_id}")
def delete_webhook(
    webhook_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    webhook = db.query(PayoutWebhook).filter(
        PayoutWebhook.id == webhook_id, PayoutWebhook.user_id == current_user.id
    ).first()
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    db.delete(webhook)
    db.commit()
    return {"message": "Deleted"}
