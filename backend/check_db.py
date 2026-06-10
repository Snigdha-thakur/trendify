from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    r = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
    tables = [row[0] for row in r]
    print('Tables:', tables)

    for tbl in tables:
        r2 = conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name='{tbl}' AND table_schema='public'"))
        print(f"\n{tbl}:")
        for row in r2:
            print(" ", row[0], "->", row[1])
