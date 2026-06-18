#!/usr/bin/env python3
"""
Migration script to add creator-specific fields to the users table.
Adds platform_fee_pct and affiliate_mode columns for per-creator configuration.
"""
import os
from sqlalchemy import text, create_engine
from app.core.config import settings

def migrate():
    """Add creator fields to users table"""
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL statements to add the new columns
    alter_statements = [
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS platform_fee_pct NUMERIC DEFAULT 0;',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS affiliate_mode BOOLEAN DEFAULT FALSE;',
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
    print("Starting migration to add creator fields...")
    migrate()
