import asyncio
import sys
from app.core.database import SessionLocal
from app.models.models import User
from sqlalchemy import text

async def test_db():
    db = SessionLocal()
    try:
        # Test connection
        print("Testing database connection...")
        result = db.execute(text("SELECT 1"))
        print("OK Database connected")
        
        # Check if users table exists
        print("\nChecking users table...")
        result = db.execute(text("SELECT COUNT(*) FROM users"))
        count = result.scalar()
        print(f"OK Users table exists with {count} users")
        
        # Try to find the admin user
        print("\nLooking for admin user...")
        user = db.query(User).filter(User.email == "soumyaofficial2004@gmail.com").first()
        if user:
            print(f"OK Found user: {user.name} ({user.email})")
            print(f"  Role: {user.role}")
            print(f"  Status: {user.status}")
            print(f"  Has password: {'Yes' if user.password_hash else 'No'}")
        else:
            print("ERROR User not found!")
            
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test_db())
