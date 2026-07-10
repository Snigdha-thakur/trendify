"""
Fix transactions that are marked Failed or Pending but have a wallet credit
(meaning the payment actually succeeded). Updates their status to 'Success'.

Run from the backend/ directory:
    python fix_transaction_statuses.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.models import Transaction, WalletLog

def fix():
    db = SessionLocal()
    try:
        # Find wallet credits linked to a transaction
        credits = (
            db.query(WalletLog)
            .filter(
                WalletLog.wallet_type == "Main Wallet",
                WalletLog.type == "Credit",
                WalletLog.transaction_id.isnot(None),
            )
            .all()
        )

        fixed = 0
        for log in credits:
            txn = db.query(Transaction).filter(Transaction.id == log.transaction_id).first()
            if txn is None:
                continue
            if txn.status != "Success":
                print(f"Fixing txn {txn.id}: status '{txn.status}' -> 'Success'")
                txn.status = "Success"
                fixed += 1

        if fixed:
            db.commit()
            print(f"\nDone. Fixed {fixed} transaction(s).")
        else:
            print("All credited transactions already marked Success. Nothing to fix.")
    finally:
        db.close()

if __name__ == "__main__":
    fix()
