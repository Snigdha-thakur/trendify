"""Add website, phone, email to kyc table"""
import psycopg2
import os

DATABASE_URL = os.environ.get("DATABASE_URL", "")

def run():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    for col, typ in [("website", "TEXT"), ("phone", "TEXT"), ("email", "TEXT")]:
        cur.execute(f"""
            ALTER TABLE public.kyc ADD COLUMN IF NOT EXISTS {col} {typ};
        """)
    conn.commit()
    cur.close()
    conn.close()
    print("Migration complete: kyc.website, kyc.phone, kyc.email added")

if __name__ == "__main__":
    run()
