from sqlalchemy import text
from app.core.database import engine


def ensure_digital_product_columns() -> None:
    cols = [
        ("creator_name", "TEXT"),
        ("profile_picture", "TEXT"),
        ("category", "TEXT"),
        ("cover_image", "TEXT"),
        ("button_text", "TEXT DEFAULT 'Make Payment'"),
        ("discount_price", "NUMERIC DEFAULT 0"),
        ("offer_discount", "BOOLEAN DEFAULT FALSE"),
        ("testimonials", "TEXT"),
        ("faqs", "TEXT"),
        ("benefits", "TEXT"),
        ("social_links", "TEXT"),
        ("form_fields", "TEXT"),
        ("digital_files", "TEXT"),
        ("success_redirect", "TEXT"),
        ("failed_redirect", "TEXT"),
        ("support_phone", "TEXT"),
        ("support_email", "TEXT"),
        ("limit_quantity", "BOOLEAN DEFAULT FALSE"),
        ("max_quantity", "NUMERIC DEFAULT 0"),
        ("meta_pixel_id", "TEXT"),
        ("google_analytics_id", "TEXT"),
        ("webhook_url", "TEXT"),
        ("webhook_key", "TEXT"),
    ]

    with engine.connect() as conn:
        for col, typ in cols:
            conn.execute(text(f"ALTER TABLE public.digital_products ADD COLUMN IF NOT EXISTS {col} {typ}"))
        conn.commit()
