"""Migration: update payouts status check constraint to include 'Rejected'"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE public.payouts DROP CONSTRAINT IF EXISTS payouts_status_check"))
    conn.execute(text(
        "ALTER TABLE public.payouts ADD CONSTRAINT payouts_status_check "
        "CHECK (status IN ('Pending', 'Paid', 'Rejected'))"
    ))
    conn.commit()
    print("Done: payouts status constraint updated to include 'Rejected'.")
