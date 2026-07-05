from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash, decode_token
from app.models.models import User
from app.schemas.schemas import UserLogin, UserRegister, TokenResponse, TokenRequest, UserLoginResponse, UserProfile, UserUpdate
from app.core.config import settings
import secrets, string, httpx
import traceback

router = APIRouter(prefix="/api/auth", tags=["Auth"])


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """Get current user from JWT token in Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authorization scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


from sqlalchemy import func


def _gen_referral_code(name: str, db: Session) -> str:
    for _ in range(10):
        suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
        code = f"{name.replace(' ', '').upper()[:4]}{suffix}"
        if not db.query(User).filter(func.upper(User.referral_code) == code).first():
            return code
    raise HTTPException(status_code=500, detail="Unable to generate unique referral code")


def _resolve_referrer(referral_code: str, db: Session):
    if not referral_code:
        return None
    normalized = referral_code.strip().upper().replace('REF-', '').replace(' ', '')
    return db.query(User).filter(func.upper(User.referral_code) == normalized).first()


@router.post("/login", response_model=UserLoginResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.email == data.email).first()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        if user.status == "inactive":
            raise HTTPException(status_code=403, detail="Account is inactive")
        if not user.password_hash or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token({"sub": str(user.id), "role": user.role})
        return UserLoginResponse(
            access_token=token,
            token_type="bearer",
            user=UserProfile(
                id=str(user.id),
                name=user.name,
                email=user.email,
                phone=user.phone or "",
                role=user.role,
                status=user.status,
                wallet_balance=float(user.wallet_balance or 0),
                referral_wallet_balance=float(user.referral_wallet_balance or 0),
                referral_code=user.referral_code or "",
                address=user.address or "",
                disclaimer=user.disclaimer or "",
                instagram=user.instagram or "",
                facebook=user.facebook or "",
                youtube=user.youtube or "",
                linkedin=user.linkedin or "",
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"LOGIN ERROR: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: TokenRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/register", response_model=UserLoginResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    # basic validation and uniqueness check
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = get_password_hash(data.password)
    referrer = _resolve_referrer(data.referral_code or "", db)
    ref_code = data.referral_code or _gen_referral_code(data.name or data.email.split("@")[0], db)

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hashed,
        role=getattr(data, 'role', 'user') or 'user',
        referral_code=ref_code,
        referred_by=referrer.id if referrer else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return UserLoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone or "",
            role=user.role,
            status=user.status,
            wallet_balance=float(user.wallet_balance or 0),
            referral_wallet_balance=float(user.referral_wallet_balance or 0),
            referral_code=user.referral_code or "",
            address=user.address or "",
            disclaimer=user.disclaimer or "",
            instagram=user.instagram or "",
            facebook=user.facebook or "",
            youtube=user.youtube or "",
            linkedin=user.linkedin or "",
        )
    )


@router.post("/google", response_model=UserLoginResponse)
async def google_signin(payload: dict, db: Session = Depends(get_db)):
    """Verify Google ID token and sign in or register the user."""
    id_token = payload.get("id_token")
    if not id_token:
        raise HTTPException(status_code=400, detail="id_token required")

    # Verify token with Google
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": id_token},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    info = resp.json()
    allowed_auds = [a.strip() for a in (settings.GOOGLE_CLIENT_ID or "").split(",") if a.strip()]
    if allowed_auds and info.get("aud") not in allowed_auds:
        raise HTTPException(status_code=401, detail="Token audience mismatch")

    email = info.get("email")
    name = info.get("name") or email.split("@")[0]
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        ref_code = _gen_referral_code(name, db)
        user = User(
            name=name,
            email=email,
            phone="",
            password_hash=None,
            role="user",
            referral_code=ref_code,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return UserLoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(
            id=str(user.id),
            name=user.name,
            email=user.email,
            phone=user.phone or "",
            role=user.role,
            status=user.status,
            wallet_balance=float(user.wallet_balance or 0),
            referral_wallet_balance=float(user.referral_wallet_balance or 0),
            referral_code=user.referral_code or "",
            address=user.address or "",
            disclaimer=user.disclaimer or "",
            instagram=user.instagram or "",
            facebook=user.facebook or "",
            youtube=user.youtube or "",
            linkedin=user.linkedin or "",
        )
    )


@router.post("/logout")
def logout():
    return {"message": "Logged out"}


@router.post("/impersonate/{user_id}")
def impersonate_user(
    user_id: str,
    admin: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if admin.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    from uuid import UUID
    target = db.query(User).filter(User.id == UUID(user_id)).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    token = create_access_token({"sub": str(target.id), "role": target.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(target.id),
            "name": target.name,
            "email": target.email,
            "phone": target.phone or "",
            "role": target.role,
            "status": target.status,
            "wallet_balance": float(target.wallet_balance or 0),
            "referral_wallet_balance": float(target.referral_wallet_balance or 0),
            "referral_code": target.referral_code or "",
        }
    }


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserProfile(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone or "",
        role=user.role,
        status=user.status,
        wallet_balance=float(user.wallet_balance or 0),
        referral_wallet_balance=float(user.referral_wallet_balance or 0),
        referral_code=user.referral_code or "",
        address=user.address or "",
        disclaimer=user.disclaimer or "",
        instagram=user.instagram or "",
        facebook=user.facebook or "",
        youtube=user.youtube or "",
        linkedin=user.linkedin or "",
    )


@router.patch("/me", response_model=UserProfile)
def update_current_user_profile(
    data: UserUpdate, 
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    # Update only provided fields
    for field, value in data.model_dump(exclude_none=True).items():
        if field == "password" and value:
            setattr(user, "password_hash", get_password_hash(value))
        else:
            setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return UserProfile(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone or "",
        role=user.role,
        status=user.status,
        wallet_balance=float(user.wallet_balance or 0),
        referral_wallet_balance=float(user.referral_wallet_balance or 0),
        referral_code=user.referral_code or "",
        address=user.address or "",
        disclaimer=user.disclaimer or "",
        instagram=user.instagram or "",
        facebook=user.facebook or "",
        youtube=user.youtube or "",
        linkedin=user.linkedin or "",
    )
