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


def ensure_coupons_table() -> None:
    create_table_sql = text(
        """
        CREATE TABLE IF NOT EXISTS public.coupons (
            id UUID PRIMARY KEY,
            creator_id UUID NOT NULL REFERENCES public.users(id),
            product_id UUID REFERENCES public.digital_products(id),
            name TEXT NOT NULL,
            code TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL DEFAULT 'active',
            discount_type TEXT NOT NULL DEFAULT 'fixed',
            discount_value NUMERIC DEFAULT 0,
            limited BOOLEAN DEFAULT FALSE,
            usage_limit NUMERIC DEFAULT 0,
            usage_count NUMERIC DEFAULT 0,
            valid_from DATE,
            valid_until DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        )
        """
    )
    with engine.connect() as conn:
        conn.execute(create_table_sql)
        conn.commit()


def ensure_platform_settings_table() -> None:
    create_table_sql = text(
        """
        CREATE TABLE IF NOT EXISTS public.platform_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )
    with engine.connect() as conn:
        conn.execute(create_table_sql)
        conn.commit()


def ensure_bank_details_table() -> None:
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS public.bank_details (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID UNIQUE REFERENCES public.users(id),
                bank_name TEXT,
                account_holder_name TEXT,
                account_number TEXT,
                ifsc_code TEXT,
                created_at TIMESTAMPTZ DEFAULT now()
            )
        """))
        conn.commit()
