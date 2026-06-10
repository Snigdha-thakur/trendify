from app.core.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    # Check users
    users = db.execute(text('SELECT COUNT(*) FROM users')).scalar()
    transactions = db.execute(text('SELECT COUNT(*) FROM transactions')).scalar()
    products = db.execute(text('SELECT COUNT(*) FROM digital_products')).scalar()
    print(f'Users: {users}')
    print(f'Transactions: {transactions}')
    print(f'Digital Products: {products}')
    
    # Check admin user
    admin = db.execute(text('SELECT id, email, role FROM users WHERE role = "admin" LIMIT 1')).fetchone()
    if admin:
        print(f'Admin user: {admin[1]} (role: {admin[2]})')
    else:
        print('No admin user found')
finally:
    db.close()
