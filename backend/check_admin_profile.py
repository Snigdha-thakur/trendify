#!/usr/bin/env python3
"""Check what data exists for admin user in database"""

from app.core.database import SessionLocal
from app.models.models import User

db = SessionLocal()

try:
    # Get admin user
    admin = db.query(User).filter(User.role == 'admin').first()
    
    if not admin:
        print("❌ No admin user found")
    else:
        print("✓ Admin User Found:")
        print(f"  ID: {admin.id}")
        print(f"  Name: {admin.name}")
        print(f"  Email: {admin.email}")
        print(f"  Phone: {admin.phone}")
        print(f"  Address: {admin.address}")
        print(f"  Disclaimer: {admin.disclaimer}")
        print(f"  Instagram: {admin.instagram}")
        print(f"  Facebook: {admin.facebook}")
        print(f"  YouTube: {admin.youtube}")
        print(f"  LinkedIn: {admin.linkedin}")
        
        # Check if any of the new fields have values
        has_data = any([
            admin.address,
            admin.disclaimer, 
            admin.instagram,
            admin.facebook,
            admin.youtube,
            admin.linkedin
        ])
        
        if has_data:
            print("\n✓ Profile fields have data!")
        else:
            print("\n⚠️ Profile fields are empty/NULL - you need to save data first")

finally:
    db.close()
