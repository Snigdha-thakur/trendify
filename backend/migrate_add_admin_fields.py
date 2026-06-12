#!/usr/bin/env python3
"""
Migration script to add admin profile fields to the users table.
Run this once after updating the models to add the new columns to the database.
"""
import os
from sqlalchemy import text, create_engine
from app.core.config import settings

def migrate():
    """Add new admin profile fields to users table"""
    engine = create_engine(settings.DATABASE_URL)
    
    # SQL statements to add the new columns
    alter_statements = [
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS address TEXT;',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS disclaimer TEXT;',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instagram TEXT;',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS facebook TEXT;',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS youtube TEXT;',
        'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS linkedin TEXT;',
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
    print("Starting migration to add admin profile fields...")
    migrate()
