#!/usr/bin/env python3
"""
Migration script to add GST and UDYAM fields to the KYC table.
"""
import os
from sqlalchemy import text, create_engine
from app.core.config import settings

def migrate():
    """Add GST and UDYAM columns to kyc table"""
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL statements to add the new columns
    alter_statements = [
        'ALTER TABLE public.kyc ADD COLUMN IF NOT EXISTS gst TEXT;',
        'ALTER TABLE public.kyc ADD COLUMN IF NOT EXISTS udyam TEXT;',
    ]
    
    with engine.connect() as conn:
        for statement in alter_statements:
            try:
                conn.execute(text(statement))
                print(f"✓ Executed: {statement.strip()}")
            except Exception as e:
                print(f"✗ Error executing '{statement.strip()}': {str(e)}")
        
        # Commit the transaction
        conn.commit()
        print("\n✓ Migration completed successfully!")

if __name__ == "__main__":
    print("Starting migration to add GST and UDYAM fields...")
    migrate()
