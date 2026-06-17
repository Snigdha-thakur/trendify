"""Migration: update price_type check constraint to include 'Customer Decided'"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE public.digital_products DROP CONSTRAINT IF EXISTS digital_products_price_type_check"))
    conn.execute(text(
        "ALTER TABLE public.digital_products ADD CONSTRAINT digital_products_price_type_check "
        "CHECK (price_type IN ('Fixed', 'Free', 'Open', 'Customer Decided'))"
    ))
    conn.commit()
    print("Done: price_type constraint updated.")
