#!/usr/bin/env python3
"""Add sample profile data to admin user for testing"""

from app.core.database import SessionLocal
from app.models.models import User

db = SessionLocal()

try:
    admin = db.query(User).filter(User.role == 'admin').first()
    
    if admin:
        # Update with sample data
        admin.phone = "9876543210"
        admin.address = "123 Main Street, New York, NY 10001"
        admin.disclaimer = "I am a content creator and business advisor"
        admin.instagram = "https://instagram.com/soumya"
        admin.facebook = "https://facebook.com/soumya"
        admin.youtube = "https://youtube.com/@soumya"
        admin.linkedin = "https://linkedin.com/in/soumya"
        
        db.commit()
        db.refresh(admin)
        
        print("✅ Sample data added to admin profile!")
        print(f"  Phone: {admin.phone}")
        print(f"  Address: {admin.address}")
        print(f"  Disclaimer: {admin.disclaimer}")
        print(f"  Instagram: {admin.instagram}")
        print(f"  Facebook: {admin.facebook}")
        print(f"  YouTube: {admin.youtube}")
        print(f"  LinkedIn: {admin.linkedin}")
        print("\n🔄 Refresh the page in the browser to see the data!")
    else:
        print("❌ No admin user found")

finally:
    db.close()
