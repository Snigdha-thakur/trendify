from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import (
    User, KYC, DigitalProduct, Transaction, Payout,
    CreatorPayout, ReferralEarning, WalletLog, WebhookLog,
    PayoutWebhook, GatewayLog,
)
from app.schemas.schemas import (
    UserResponse, UserUpdate, KYCResponse, ProductResponse,
    TransactionResponse, PayoutResponse, CreatorPayoutResponse,
    ReferralEarningResponse, WalletLogResponse, GatewayLogResponse,
    PayoutWebhookResponse,
)
from app.api.routes.users import get_current_user, require_admin
from decimal import Decimal

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# --- Dashboard ---
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    total_users = db.query(func.count(User.id)).scalar()
    total_products = db.query(func.count(DigitalProduct.id)).scalar()
    total_txns = db.query(func.count(Transaction.id)).scalar()
    total_revenue = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
        Transaction.status == "Success"
    ).scalar()
    pending_kyc = db.query(func.count(KYC.id)).filter(KYC.status == "Pending").scalar()

    return {
        "total_users": total_users,
        "total_products": total_products,
        "total_transactions": total_txns,
        "total_revenue": float(total_revenue),
        "pending_kyc": pending_kyc,
    }


# --- Users ---
@router.get("/users", response_model=list[UserResponse])
def list_users(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: UUID, data: UserUpdate,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    for field, value in data.model_dump(exclude_none=True).items():
        if field == "password" and value:
            setattr(user, "password_hash", get_password_hash(value))
        else:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


# --- KYC ---
@router.get("/kyc", response_model=list[KYCResponse])
def list_kyc(
    status: str = None, skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    q = db.query(KYC)
    if status:
        q = q.filter(KYC.status == status)
    return q.order_by(KYC.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/kyc/{kyc_id}")
def update_kyc_status(
    kyc_id: UUID, status: str,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    if status not in ("Approved", "Rejected", "Pending"):
        raise HTTPException(status_code=400, detail="Invalid status")
    kyc = db.query(KYC).filter(KYC.id == kyc_id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    kyc.status = status
    db.commit()
    return {"message": f"KYC {status}"}


# --- Products ---
@router.get("/products", response_model=list[ProductResponse])
def list_products(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    return db.query(DigitalProduct).order_by(DigitalProduct.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/products/{product_id}/status")
def update_product_status(
    product_id: UUID, status: str,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    if status not in ("Active", "Under review"):
        raise HTTPException(status_code=400, detail="Invalid status")
    product = db.query(DigitalProduct).filter(DigitalProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.status = status
    db.commit()
    return {"message": f"Product status set to {status}"}


# --- Transactions ---
@router.get("/transactions", response_model=list[TransactionResponse])
def list_transactions(
    skip: int = 0, limit: int = 20, status: str = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    q = db.query(Transaction)
    if status:
        q = q.filter(Transaction.status == status)
    return q.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()


# --- Payouts ---
@router.get("/payouts", response_model=list[PayoutResponse])
def list_payouts(
    skip: int = 0, limit: int = 20, status: str = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    q = db.query(Payout)
    if status:
        q = q.filter(Payout.status == status)
    return q.order_by(Payout.created_at.desc()).offset(skip).limit(limit).all()


@router.put("/payouts/{payout_id}/status")
def update_payout_status(
    payout_id: str, status: str,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    if status not in ("Paid", "Pending", "Failed"):
        raise HTTPException(status_code=400, detail="Invalid status")
    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout not found")
    payout.status = status
    db.commit()
    return {"message": f"Payout marked as {status}"}


# --- Creator Payouts ---
@router.get("/creator-payouts", response_model=list[CreatorPayoutResponse])
def list_creator_payouts(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    return db.query(CreatorPayout).order_by(CreatorPayout.created_at.desc()).offset(skip).limit(limit).all()


# --- Referral Earnings ---
@router.get("/referral-earnings", response_model=list[ReferralEarningResponse])
def list_referral_earnings(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    return db.query(ReferralEarning).order_by(ReferralEarning.created_at.desc()).offset(skip).limit(limit).all()


# --- Wallet Logs ---
@router.get("/wallet-logs", response_model=list[WalletLogResponse])
def list_wallet_logs(
    user_id: UUID = None, skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    q = db.query(WalletLog)
    if user_id:
        q = q.filter(WalletLog.user_id == user_id)
    return q.order_by(WalletLog.created_at.desc()).offset(skip).limit(limit).all()


# --- Gateway Logs ---
@router.get("/gateway-logs", response_model=list[GatewayLogResponse])
def list_gateway_logs(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    return db.query(GatewayLog).order_by(GatewayLog.created_at.desc()).offset(skip).limit(limit).all()


# --- Webhook Logs ---
@router.get("/webhook-logs")
def list_webhook_logs(
    skip: int = 0, limit: int = 20,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    logs = db.query(WebhookLog).order_by(WebhookLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": str(log.id),
            "user_id": str(log.user_id) if log.user_id else None,
            "transaction_id": log.transaction_id,
            "webhook_url": log.webhook_url,
            "created_at": str(log.created_at),
        }
        for log in logs
    ]
