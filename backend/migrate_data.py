import psycopg2
import psycopg2.extras

OLD_DB = "postgresql://postgres.hzukzpxelruvdmporrak:Snigdhathakur@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
NEW_DB = "postgresql://postgres.cpwoxcwvherdofgsrvrc:ARABINDA%40123@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Order matters due to foreign key dependencies
TABLES = [
    "users",
    "kyc",
    "bank_details",
    "digital_products",
    "transactions",
    "payouts",
    "creator_payouts",
    "referral_earnings",
    "wallet_logs",
    "webhook_logs",
    "payout_webhooks",
    "gateway_logs",
    "coupons",
    "platform_settings",
]

def migrate():
    print("Connecting to old database...")
    old_conn = psycopg2.connect(OLD_DB)
    old_cur = old_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    print("Connecting to new database...")
    new_conn = psycopg2.connect(NEW_DB)
    new_cur = new_conn.cursor()

    for table in TABLES:
        print(f"\nMigrating {table}...")
        old_cur.execute(f"SELECT * FROM public.{table}")
        rows = old_cur.fetchall()

        if not rows:
            print(f"  No data in {table}, skipping.")
            continue

        columns = list(rows[0].keys())
        col_str = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))

        insert_sql = f"INSERT INTO public.{table} ({col_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"

        data = [tuple(row[col] for col in columns) for row in rows]
        psycopg2.extras.execute_batch(new_cur, insert_sql, data)
        new_conn.commit()
        print(f"  Inserted {len(data)} rows into {table}.")

    old_cur.close()
    old_conn.close()
    new_cur.close()
    new_conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate()
