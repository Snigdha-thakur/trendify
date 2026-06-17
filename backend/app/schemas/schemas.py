from pydantic import BaseModel, EmailStr
from datetime import datetime, date
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
    status: Optional[str] = 'active'


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
    address: Optional[str] = None
    disclaimer: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    linkedin: Optional[str] = None


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

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    status: Optional[str] = None
    role: Optional[str] = None
    address: Optional[str] = None
    disclaimer: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    youtube: Optional[str] = None
    linkedin: Optional[str] = None


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

    model_config = {"from_attributes": True}


# Digital Product
class ProductCreate(BaseModel):
    name: str
    creator_name: Optional[str] = None
    profile_picture: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    button_text: Optional[str] = "Make Payment"
    price_type: Optional[str] = None
    amount: Optional[float] = 0
    discount_price: Optional[float] = 0
    offer_discount: Optional[bool] = False
    testimonials: Optional[str] = None
    faqs: Optional[str] = None
    benefits: Optional[str] = None
    social_links: Optional[str] = None
    form_fields: Optional[str] = None
    digital_files: Optional[str] = None
    success_redirect: Optional[str] = None
    failed_redirect: Optional[str] = None
    support_phone: Optional[str] = None
    support_email: Optional[str] = None
    limit_quantity: Optional[bool] = False
    max_quantity: Optional[float] = 0
    meta_pixel_id: Optional[str] = None
    google_analytics_id: Optional[str] = None
    webhook_url: Optional[str] = None
    webhook_key: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    creator_name: Optional[str] = None
    profile_picture: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    button_text: Optional[str] = None
    price_type: Optional[str] = None
    amount: Optional[float] = None
    discount_price: Optional[float] = None
    offer_discount: Optional[bool] = None
    status: Optional[str] = None
    whitelabeled: Optional[bool] = None
    testimonials: Optional[str] = None
    faqs: Optional[str] = None
    benefits: Optional[str] = None
    social_links: Optional[str] = None
    form_fields: Optional[str] = None
    digital_files: Optional[str] = None
    success_redirect: Optional[str] = None
    failed_redirect: Optional[str] = None
    support_phone: Optional[str] = None
    support_email: Optional[str] = None
    limit_quantity: Optional[bool] = None
    max_quantity: Optional[float] = None
    meta_pixel_id: Optional[str] = None
    google_analytics_id: Optional[str] = None
    webhook_url: Optional[str] = None
    webhook_key: Optional[str] = None


class ProductResponse(BaseModel):
    id: UUID
    creator_id: Optional[UUID]
    name: str
    creator_name: Optional[str]
    profile_picture: Optional[str]
    category: Optional[str]
    price_type: Optional[str]
    status: str
    whitelabeled: Optional[bool]
    description: Optional[str]
    cover_image: Optional[str]
    button_text: Optional[str]
    amount: Optional[float]
    discount_price: Optional[float]
    offer_discount: Optional[bool]
    payment_link: Optional[str]
    cashfree_link_id: Optional[str]
    qr_code: Optional[str]
    testimonials: Optional[str]
    faqs: Optional[str]
    benefits: Optional[str]
    social_links: Optional[str]
    form_fields: Optional[str]
    digital_files: Optional[str]
    success_redirect: Optional[str]
    failed_redirect: Optional[str]
    support_phone: Optional[str]
    support_email: Optional[str]
    limit_quantity: Optional[bool]
    max_quantity: Optional[float]
    meta_pixel_id: Optional[str]
    google_analytics_id: Optional[str]
    webhook_url: Optional[str]
    webhook_key: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


class CouponCreate(BaseModel):
    name: str
    code: str
    product_id: Optional[UUID] = None
    status: Optional[str] = "active"
    discount_type: Optional[str] = "fixed"
    discount_value: Optional[float] = 0
    limited: Optional[bool] = False
    usage_limit: Optional[float] = 0
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None


class CouponUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    product_id: Optional[UUID] = None
    status: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    limited: Optional[bool] = None
    usage_limit: Optional[float] = None
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None


class CouponResponse(BaseModel):
    id: UUID
    creator_id: Optional[UUID]
    product_id: Optional[UUID]
    product_name: Optional[str] = None
    name: str
    code: str
    status: str
    discount_type: Optional[str]
    discount_value: Optional[float]
    limited: Optional[bool]
    usage_limit: Optional[float]
    usage_count: Optional[float]
    valid_from: Optional[date]
    valid_until: Optional[date]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


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
    product_name: Optional[str] = None
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

    model_config = {"from_attributes": True}


# Payout
class PayoutResponse(BaseModel):
    id: str
    user_id: Optional[UUID]
    amount: float
    status: str
    payout_type: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# Creator Payout
class CreatorPayoutResponse(BaseModel):
    id: str
    creator_id: Optional[UUID]
    buyer_email: Optional[str]
    amount: float
    status: str
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# Referral Earning
class ReferralEarningResponse(BaseModel):
    id: UUID
    transaction_id: Optional[str]
    referrer_id: Optional[UUID]
    from_creator_id: Optional[UUID]
    from_creator_email: Optional[str] = None
    amount: Optional[float]
    percentage: Optional[str]
    source: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


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

    model_config = {"from_attributes": True}


# Payout Webhook
class PayoutWebhookCreate(BaseModel):
    webhook_url: str


class PayoutWebhookResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    webhook_url: str
    is_active: Optional[bool]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# Gateway Log
class GatewayLogResponse(BaseModel):
    id: UUID
    transaction_id: Optional[str]
    txn_type: Optional[str]
    gateway: Optional[str]
    log_type: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
