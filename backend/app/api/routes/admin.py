from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.models import (
    User, KYC, DigitalProduct, Transaction, Payout,
    CreatorPayout, ReferralEarning, WalletLog, WebhookLog,
    PayoutWebhook, GatewayLog, PlatformSetting,
)
from app.schemas.schemas import (
    UserResponse, UserUpdate, UserRegister, KYCResponse, ProductResponse,
    ProductCreate,
    TransactionResponse, PayoutResponse, CreatorPayoutResponse,
    ReferralEarningResponse, WalletLogResponse, GatewayLogResponse,
    PayoutWebhookResponse,
)
from app.api.routes.users import get_current_user, require_admin
from decimal import Decimal

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# --- Platform Settings ---
def _get_setting(db: Session, key: str, default: str) -> str:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    return row.value if row else default


@router.get("/settings")
def get_platform_settings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return {"platform_fee_pct": float(_get_setting(db, "platform_fee_pct", "10"))}


@router.put("/settings")
def update_platform_settings(
    data: dict,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    fee = float(data.get("platform_fee_pct", 10))
    if fee < 0 or fee > 100:
        raise HTTPException(status_code=400, detail="Fee must be between 0 and 100")
    row = db.query(PlatformSetting).filter(PlatformSetting.key == "platform_fee_pct").first()
    if row:
        row.value = str(fee)
    else:
        db.add(PlatformSetting(key="platform_fee_pct", value=str(fee)))
    db.commit()
    return {"platform_fee_pct": fee}


# --- Dashboard ---
@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
    since: str | None = None,
):
    query = db.query(Transaction)
    if since:
        try:
            cutoff = datetime.fromisoformat(since.replace('Z', '+00:00'))
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid since parameter")
        query = query.filter(Transaction.created_at >= cutoff)

    if since:
        total_creators = db.query(func.count(func.distinct(Transaction.creator_id))).filter(Transaction.creator_id != None, Transaction.created_at >= cutoff).scalar()
        total_users = db.query(func.count(func.distinct(Transaction.buyer_email))).filter(Transaction.buyer_email != None, Transaction.created_at >= cutoff).scalar()
        total_products = db.query(func.count(func.distinct(Transaction.product_id))).filter(Transaction.product_id != None, Transaction.created_at >= cutoff).scalar()
        total_txns = query.count()
        total_revenue = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.status == "Success",
            Transaction.created_at >= cutoff,
        ).scalar()
    else:
        total_creators = db.query(func.count(User.id)).filter(User.role == 'creator').scalar()
        total_users = db.query(func.count(User.id)).scalar()
        total_products = db.query(func.count(DigitalProduct.id)).scalar()
        total_txns = query.count()
        total_revenue = db.query(func.coalesce(func.sum(Transaction.amount), 0)).filter(
            Transaction.status == "Success"
        ).scalar()

    pending_kyc = db.query(func.count(KYC.id)).filter(KYC.status == "Pending").scalar()

    return {
        "total_creators": total_creators,
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


@router.post("/users", response_model=UserResponse)
def create_user(
    data: UserRegister,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    import uuid, random, string
    ref_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    new_user = User(
        id=uuid.uuid4(),
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=get_password_hash(data.password),
        role=data.role or 'user',
        status=data.status or 'active',
        referral_code=ref_code,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.put("/users/{user_id}/wallet", response_model=UserResponse)
def update_user_wallet(
    user_id: UUID, data: dict,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    amount = Decimal(str(data.get('amount', 0)))
    if data.get('type') == 'debit':
        user.wallet_balance = max(Decimal('0'), (user.wallet_balance or Decimal('0')) - amount)
    else:
        user.wallet_balance = (user.wallet_balance or Decimal('0')) + amount
    db.commit()
    db.refresh(user)
    return user


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


@router.post("/products", response_model=ProductResponse)
def admin_create_product(
    data: ProductCreate,
    creator_id: UUID | None = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    # Admin can create a product for any creator by passing creator_id
    chosen_creator = None
    if creator_id:
        chosen_creator = db.query(User).filter(User.id == creator_id).first()
        if not chosen_creator:
            raise HTTPException(status_code=404, detail="Creator not found")
    # default to admin user as creator if none provided
    cid = chosen_creator.id if chosen_creator else _.id

    product = DigitalProduct(
        creator_id=cid,
        name=data.name,
        description=data.description,
        price_type=data.price_type,
        amount=data.amount,
        status="Under review",
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/products/{product_id}/whitelabel")
def update_product_whitelabel(
    product_id: UUID, data: dict,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    product = db.query(DigitalProduct).filter(DigitalProduct.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.whitelabeled = bool(data.get("whitelabeled", False))
    db.commit()
    return {"message": "Whitelabel updated"}

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
@router.get("/transactions")
def list_transactions(
    skip: int = 0, limit: int = 20, status: str = None, since: str = None,
    db: Session = Depends(get_db), _: User = Depends(require_admin),
):
    import json
    from datetime import datetime
    q = db.query(Transaction)
    if status:
        q = q.filter(Transaction.status == status)
    if since:
        try:
            q = q.filter(Transaction.created_at >= datetime.fromisoformat(since.replace('Z', '+00:00')))
        except ValueError:
            pass
    txns = q.order_by(Transaction.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for t in txns:
        d = TransactionResponse.model_validate(t).model_dump()
        d["product_name"] = t.product.name if t.product else None
        # creator info
        creator = t.creator
        d["creator_name"] = creator.name if creator else None
        d["creator_email"] = creator.email if creator else None
        d["creator_phone"] = creator.phone if creator else None
        # custom form fields submitted by buyer (stored as JSON on product)
        d["form_fields"] = None
        if t.product and t.product.form_fields:
            try:
                d["form_fields"] = json.loads(t.product.form_fields)
            except Exception:
                d["form_fields"] = None
        # payout / platform fee
        result.append(d)
    return result


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
    if status not in ("Paid", "Pending", "Rejected"):
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
    earnings = db.query(ReferralEarning).order_by(ReferralEarning.created_at.desc()).offset(skip).limit(limit).all()
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
