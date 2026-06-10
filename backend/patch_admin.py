"""
Patches the admin user row in the backend DB:
- Sets password_hash from the plaintext password
- Ensures role=admin, status=active
Run from the backend/ directory: python patch_admin.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.core.security import get_password_hash

EMAIL = 'soumyaofficial2004@gmail.com'
PASSWORD = 'ARABINDA123'

engine = create_engine(settings.DATABASE_URL)

with engine.connect() as conn:
    # Check current state
    row = conn.execute(
        text("SELECT id, name, email, role, status, password_hash FROM public.users WHERE email = :e"),
        {"e": EMAIL}
    ).fetchone()

    if not row:
        print(f"ERROR: No user found with email {EMAIL}")
        print("Run create_admin.py first, then re-run this script.")
        sys.exit(1)

    print(f"Found user: {row.id} | role={row.role} | status={row.status} | has_hash={bool(row.password_hash)}")

    hashed = get_password_hash(PASSWORD)
    conn.execute(
        text("""
            UPDATE public.users
            SET password_hash = :h,
                role = 'admin',
                status = 'active'
            WHERE email = :e
        """),
        {"h": hashed, "e": EMAIL}
    )
    conn.commit()
    print(f"Done. password_hash set, role=admin, status=active.")
