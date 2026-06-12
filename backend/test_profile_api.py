#!/usr/bin/env python3
"""Test if /api/auth/me endpoint returns user profile data"""

import os
import sys
import json
import requests
from app.core.security import create_access_token
from app.core.database import SessionLocal
from app.models.models import User

# Get database session
db = SessionLocal()

try:
    # Find admin user
    admin = db.query(User).filter(User.role == 'admin').first()
    
    if not admin:
        print("❌ No admin user found in database")
        sys.exit(1)
    
    print(f"✓ Found admin user: {admin.name} ({admin.email})")
    print(f"  ID: {admin.id}")
    print(f"  Role: {admin.role}")
    
    # Show all profile fields
    print("\n📋 Profile Data in Database:")
    print(f"  name: {admin.name}")
    print(f"  email: {admin.email}")
    print(f"  phone: {admin.phone}")
    print(f"  address: {admin.address}")
    print(f"  disclaimer: {admin.disclaimer}")
    print(f"  instagram: {admin.instagram}")
    print(f"  facebook: {admin.facebook}")
    print(f"  youtube: {admin.youtube}")
    print(f"  linkedin: {admin.linkedin}")
    
    # Create a test token
    token = create_access_token({"sub": str(admin.id), "role": admin.role})
    print(f"\n🔐 Generated Test Token: {token[:50]}...")
    
    # Test the API endpoint
    api_url = "http://localhost:8000/api/auth/me"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🔌 Testing API endpoint: {api_url}")
    try:
        response = requests.get(api_url, headers=headers, timeout=5)
        print(f"  Status Code: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print("\n✓ API Response:")
            print(json.dumps(data, indent=2))
            
            # Check if all fields are present
            fields = ['name', 'email', 'phone', 'address', 'disclaimer', 'instagram', 'facebook', 'youtube', 'linkedin']
            missing = [f for f in fields if f not in data]
            if missing:
                print(f"\n⚠️  Missing fields in API response: {missing}")
            else:
                print("\n✓ All profile fields present in API response")
        else:
            print(f"  ❌ Error: {response.text}")
    except requests.exceptions.ConnectionError:
        print(f"  ❌ Could not connect to backend. Make sure it's running on port 8000")
    
finally:
    db.close()
