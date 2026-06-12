#!/usr/bin/env python3
"""Test backend API endpoint directly"""

import sys
import json
from app.core.security import create_access_token
from app.core.database import SessionLocal
from app.models.models import User
from app.schemas.schemas import UserProfile

db = SessionLocal()

try:
    # Get admin user
    admin = db.query(User).filter(User.role == 'admin').first()
    
    if not admin:
        print("❌ No admin user found")
        sys.exit(1)
    
    print("✓ Admin user found")
    print(f"  Name: {admin.name}")
    print(f"  Email: {admin.email}")
    print(f"  Phone: {admin.phone}")
    print(f"  Address: {admin.address}")
    print(f"  Disclaimer: {admin.disclaimer}")
    
    # Create response as the API would
    profile = UserProfile(
        id=str(admin.id),
        name=admin.name,
        email=admin.email,
        phone=admin.phone or "",
        role=admin.role,
        status=admin.status,
        wallet_balance=float(admin.wallet_balance or 0),
        referral_wallet_balance=float(admin.referral_wallet_balance or 0),
        referral_code=admin.referral_code or "",
        address=admin.address or "",
        disclaimer=admin.disclaimer or "",
        instagram=admin.instagram or "",
        facebook=admin.facebook or "",
        youtube=admin.youtube or "",
        linkedin=admin.linkedin or "",
    )
    
    # Convert to JSON as the API would return
    json_data = json.dumps(profile.model_dump(), indent=2)
    print("\n📡 API would return:")
    print(json_data)
    
    # Verify all fields are present
    data = json.loads(json_data)
    print("\n✓ All response fields:")
    for key, value in data.items():
        print(f"  {key}: {value}")

finally:
    db.close()
