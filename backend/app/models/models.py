from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Numeric, TIMESTAMP, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True)
    phone = Column(Text)
    password_hash = Column(Text, nullable=True)
    role = Column(Text, nullable=False, default="user")
    status = Column(Text, nullable=False, default="active")
    referral_code = Column(Text, unique=True)
    referred_by = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    wallet_balance = Column(Numeric, default=0)
    referral_wallet_balance = Column(Numeric, default=0)
    # Admin profile fields
    address = Column(Text)
    disclaimer = Column(Text)
    instagram = Column(Text)
    facebook = Column(Text)
    youtube = Column(Text)
    linkedin = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    kyc = relationship("KYC", back_populates="user", uselist=False)
    products = relationship("DigitalProduct", back_populates="creator", foreign_keys="DigitalProduct.creator_id")
    transactions = relationship("Transaction", back_populates="creator", foreign_keys="Transaction.creator_id")
    payouts = relationship("Payout", back_populates="user")
    creator_payouts = relationship("CreatorPayout", back_populates="creator")
    coupons = relationship("Coupon", back_populates="creator")
    referral_earnings = relationship("ReferralEarning", back_populates="referrer", foreign_keys="ReferralEarning.referrer_id")
    wallet_logs = relationship("WalletLog", back_populates="user")
    webhook_logs = relationship("WebhookLog", back_populates="user")
    payout_webhooks = relationship("PayoutWebhook", back_populates="user")


class KYC(Base):
    __tablename__ = "kyc"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    aadhar = Column(Text)
    pan = Column(Text)
    bank_type = Column(Text)
    website = Column(Text)
    phone = Column(Text)
    email = Column(Text)
    status = Column(Text, nullable=False, default="Pending")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="kyc")


class DigitalProduct(Base):
    __tablename__ = "digital_products"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    name = Column(Text, nullable=False)
    creator_name = Column(Text)
    profile_picture = Column(Text)
    category = Column(Text)
    price_type = Column(Text)
    status = Column(Text, nullable=False, default="Under review")
    whitelabeled = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    description = Column(Text)
    amount = Column(Numeric, default=0)
    discount_price = Column(Numeric, default=0)
    offer_discount = Column(Boolean, default=False)
    button_text = Column(Text, default="Make Payment")
    cover_image = Column(Text)
    payment_link = Column(Text)
    cashfree_link_id = Column(Text)
    qr_code = Column(Text)
    # Sections
    testimonials = Column(Text)  # JSON string
    faqs = Column(Text)  # JSON string
    benefits = Column(Text)  # JSON string
    social_links = Column(Text)  # JSON string
    # Registration
    form_fields = Column(Text)  # JSON string
    # Digital files
    digital_files = Column(Text)  # JSON string
    # Redirection
    success_redirect = Column(Text)
    failed_redirect = Column(Text)
    # Support
    support_phone = Column(Text)
    support_email = Column(Text)
    # Limit
    limit_quantity = Column(Boolean, default=False)
    max_quantity = Column(Numeric, default=0)
    # Tracking
    meta_pixel_id = Column(Text)
    google_analytics_id = Column(Text)
    # Webhook
    webhook_url = Column(Text)
    webhook_key = Column(Text)

    creator = relationship("User", back_populates="products", foreign_keys=[creator_id])
    transactions = relationship("Transaction", back_populates="product")
    coupons = relationship("Coupon", back_populates="product")


class Coupon(Base):
    __tablename__ = "coupons"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.digital_products.id"), nullable=True)
    name = Column(Text, nullable=False)
    code = Column(Text, nullable=False, unique=True)
    status = Column(Text, nullable=False, default="active")
    discount_type = Column(Text, nullable=False, default="fixed")
    discount_value = Column(Numeric, default=0)
    limited = Column(Boolean, default=False)
    usage_limit = Column(Numeric, default=0)
    usage_count = Column(Numeric, default=0)
    valid_from = Column(Date)
    valid_until = Column(Date)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    creator = relationship("User", back_populates="coupons", foreign_keys=[creator_id])
    product = relationship("DigitalProduct", back_populates="coupons", foreign_keys=[product_id])


class Transaction(Base):
    __tablename__ = "transactions"
    __table_args__ = {"schema": "public"}

    id = Column(Text, primary_key=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("public.digital_products.id", use_alter=True, name="fk_transaction_product"))
    buyer_email = Column(Text)
    amount = Column(Numeric, nullable=False)
    status = Column(Text, nullable=False)
    gateway = Column(Text, default="Cashfree")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    cashfree_order_id = Column(Text)
    payment_link = Column(Text)
    commission_amount = Column(Numeric, default=0)
    creator_amount = Column(Numeric, default=0)
    buyer_name = Column(Text)
    buyer_phone = Column(Text)

    creator = relationship("User", back_populates="transactions", foreign_keys=[creator_id])
    product = relationship("DigitalProduct", back_populates="transactions")
    referral_earnings = relationship("ReferralEarning", back_populates="transaction")


class Payout(Base):
    __tablename__ = "payouts"
    __table_args__ = {"schema": "public"}

    id = Column(Text, primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    amount = Column(Numeric, nullable=False)
    status = Column(Text, nullable=False, default="Pending")
    payout_type = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payouts")


class CreatorPayout(Base):
    __tablename__ = "creator_payouts"
    __table_args__ = {"schema": "public"}

    id = Column(Text, primary_key=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    buyer_email = Column(Text)
    amount = Column(Numeric, nullable=False)
    status = Column(Text, nullable=False, default="Pending")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    creator = relationship("User", back_populates="creator_payouts")


class ReferralEarning(Base):
    __tablename__ = "referral_earnings"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(Text, ForeignKey("public.transactions.id"))
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    from_creator_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    amount = Column(Numeric)
    percentage = Column(Text)
    source = Column(Text, default="referral")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    transaction = relationship("Transaction", back_populates="referral_earnings")
    referrer = relationship("User", back_populates="referral_earnings", foreign_keys=[referrer_id])
    from_creator = relationship("User", foreign_keys=[from_creator_id])


class WalletLog(Base):
    __tablename__ = "wallet_logs"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    transaction_id = Column(Text)
    wallet_type = Column(Text)
    type = Column(Text)
    existing_balance = Column(Numeric)
    amount = Column(Numeric)
    new_balance = Column(Numeric)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="wallet_logs")


class WebhookLog(Base):
    __tablename__ = "webhook_logs"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    transaction_id = Column(Text)
    webhook_url = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="webhook_logs")


class PayoutWebhook(Base):
    __tablename__ = "payout_webhooks"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("public.users.id"))
    webhook_url = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payout_webhooks")


class GatewayLog(Base):
    __tablename__ = "gateway_logs"
    __table_args__ = {"schema": "public"}

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(Text)
    txn_type = Column(Text, default="Purchase")
    gateway = Column(Text, default="Cashfree")
    log_type = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
