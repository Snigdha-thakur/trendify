from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID


# Auth
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    referral_code: Optional[str] = None
    role: Optional[str] = 'user'


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenRequest(BaseModel):
    refresh_token: str


class UserProfile(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = ""
    role: str
    status: str
    wallet_balance: Optional[float] = 0
    referral_wallet_balance: Optional[float] = 0
    referral_code: Optional[str] = ""


class UserLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


# User
class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str]
    password_hash: Optional[str]
    role: str
    status: str
    referral_code: Optional[str]
    referred_by: Optional[UUID]
    wallet_balance: Optional[float]
    referral_wallet_balance: Optional[float]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    status: Optional[str] = None
    role: Optional[str] = None


# KYC
class KYCCreate(BaseModel):
    aadhar: Optional[str] = None
    pan: Optional[str] = None
    bank_type: Optional[str] = None


class KYCResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    aadhar: Optional[str]
    pan: Optional[str]
    bank_type: Optional[str]
    status: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Digital Product
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price_type: Optional[str] = None
    amount: Optional[float] = 0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_type: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[str] = None
    whitelabeled: Optional[bool] = None


class ProductResponse(BaseModel):
    id: UUID
    creator_id: Optional[UUID]
    name: str
    price_type: Optional[str]
    status: str
    whitelabeled: Optional[bool]
    description: Optional[str]
    amount: Optional[float]
    payment_link: Optional[str]
    cashfree_link_id: Optional[str]
    qr_code: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Transaction
class TransactionCreate(BaseModel):
    id: str
    product_id: UUID
    buyer_email: str
    buyer_name: Optional[str] = None
    buyer_phone: Optional[str] = None
    amount: float
    cashfree_order_id: Optional[str] = None
    payment_link: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    creator_id: Optional[UUID]
    product_id: Optional[UUID]
    buyer_email: Optional[str]
    buyer_name: Optional[str]
    buyer_phone: Optional[str]
    amount: float
    status: str
    gateway: Optional[str]
    commission_amount: Optional[float]
    creator_amount: Optional[float]
    cashfree_order_id: Optional[str]
    payment_link: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Payout
class PayoutResponse(BaseModel):
    id: str
    user_id: Optional[UUID]
    amount: float
    status: str
    payout_type: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Creator Payout
class CreatorPayoutResponse(BaseModel):
    id: str
    creator_id: Optional[UUID]
    buyer_email: Optional[str]
    amount: float
    status: str
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Referral Earning
class ReferralEarningResponse(BaseModel):
    id: UUID
    transaction_id: Optional[str]
    referrer_id: Optional[UUID]
    from_creator_id: Optional[UUID]
    amount: Optional[float]
    percentage: Optional[str]
    source: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Wallet Log
class WalletLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    transaction_id: Optional[str]
    wallet_type: Optional[str]
    type: Optional[str]
    existing_balance: Optional[float]
    amount: Optional[float]
    new_balance: Optional[float]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Payout Webhook
class PayoutWebhookCreate(BaseModel):
    webhook_url: str


class PayoutWebhookResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    webhook_url: str
    is_active: Optional[bool]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# Gateway Log
class GatewayLogResponse(BaseModel):
    id: UUID
    transaction_id: Optional[str]
    txn_type: Optional[str]
    gateway: Optional[str]
    log_type: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
