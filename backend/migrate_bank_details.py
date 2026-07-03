from app.core.database import engine
from sqlalchemy import text

with engine.begin() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS public.bank_details (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID UNIQUE REFERENCES public.users(id),
            bank_name TEXT,
            account_holder_name TEXT,
            account_number TEXT,
            ifsc_code TEXT,
            created_at TIMESTAMPTZ DEFAULT now()
        );
    """))
print("bank_details table created successfully.")
