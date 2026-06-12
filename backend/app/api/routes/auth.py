from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import create_access_token, verify_password, get_password_hash, decode_token
from app.models.models import User
from app.schemas.schemas import UserLogin, UserRegister, TokenResponse, TokenRequest, UserLoginResponse, UserProfile, UserUpdate
import secrets, string
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


def _gen_referral_code(name: str) -> str:
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
    return f"{name.replace(' ', '').upper()[:4]}{suffix}"


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
    # generate referral code if not provided
    ref_code = data.referral_code or _gen_referral_code(data.name or data.email.split("@")[0])

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=hashed,
        role=getattr(data, 'role', 'user') or 'user',
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
