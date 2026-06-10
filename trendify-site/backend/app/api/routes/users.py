from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.security import decode_token, get_password_hash
from app.models.models import User, KYC
from app.schemas.schemas import UserResponse, UserUpdate, KYCCreate, KYCResponse

router = APIRouter(prefix="/api/users", tags=["Users"])


def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")

    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found in database")
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserResponse)
def update_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.password is not None:
        current_user.password_hash = get_password_hash(user_update.password)
    db.commit()
    db.refresh(current_user)
    return current_user


# KYC
@router.post("/kyc", response_model=KYCResponse)
def submit_kyc(
    kyc_data: KYCCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(KYC).filter(KYC.user_id == current_user.id).first()
    if existing:
        existing.aadhar = kyc_data.aadhar
        existing.pan = kyc_data.pan
        existing.bank_type = kyc_data.bank_type
        existing.status = "Pending"
        db.commit()
        db.refresh(existing)
        return existing

    kyc = KYC(
        user_id=current_user.id,
        aadhar=kyc_data.aadhar,
        pan=kyc_data.pan,
        bank_type=kyc_data.bank_type,
    )
    db.add(kyc)
    db.commit()
    db.refresh(kyc)
    return kyc


@router.get("/kyc", response_model=KYCResponse)
def get_my_kyc(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    kyc = db.query(KYC).filter(KYC.user_id == current_user.id).first()
    if not kyc:
        raise HTTPException(status_code=404, detail="KYC not found")
    return kyc
