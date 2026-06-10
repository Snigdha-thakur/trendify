import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create database engine
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    print("Checking database connection...")
    print(f"Database URL: {settings.DATABASE_URL}")
    
    # Test connection
    result = db.execute("SELECT 1")
    print("✓ Database connection successful")
    
    # Check if users table exists
    users_exists = db.execute("SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'users')").scalar()
    print(f"Users table exists: {users_exists}")
    
    if users_exists:
        # Check admin user
        from app.models.models import User
        admin_user = db.query(User).filter(User.email == 'soumyaofficial2004@gmail.com').first()
        
        if admin_user:
            print(f"\n✓ Admin user found:")
            print(f"  ID: {admin_user.id}")
            print(f"  Name: {admin_user.name}")
            print(f"  Email: {admin_user.email}")
            print(f"  Role: {admin_user.role}")
            print(f"  Status: {admin_user.status}")
            print(f"  Wallet Balance: {admin_user.wallet_balance}")
        else:
            print(f"\n✗ Admin user NOT found in users table")
            print("You need to create the admin user:")
            print("1. Run python create_admin.py")
            print("2. Or manually insert user into database")
            
        # Show all users
        all_users = db.query(User).limit(10).all()
        print(f"\nFirst 10 users in database:")
        for i, user in enumerate(all_users):
            print(f"  {i+1}. {user.name} ({user.email}) - Role: {user.role}")
            
    else:
        print("Users table doesn't exist. Did you run database migrations?")
        
except Exception as e:
    print(f"Error: {type(e).__name__}: {str(e)}")
finally:
    db.close()