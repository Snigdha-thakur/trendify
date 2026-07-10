"""
Fix mismatched creator_id on existing transactions.

For every transaction where the wallet was credited to a user whose id
doesn't match transaction.creator_id, this script updates creator_id
to match the wallet log's user_id.

Run from the backend/ directory:
    python fix_transaction_creator_ids.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.models.models import Transaction, WalletLog

def fix():
    db = SessionLocal()
    try:
        # Find all wallet credits that have a transaction_id
        wallet_credits = (
            db.query(WalletLog)
            .filter(
                WalletLog.wallet_type == "Main Wallet",
                WalletLog.type == "Credit",
                WalletLog.transaction_id.isnot(None),
            )
            .all()
        )

        fixed = 0
        for log in wallet_credits:
            txn = db.query(Transaction).filter(Transaction.id == log.transaction_id).first()
            if txn is None:
                continue
            if txn.creator_id != log.user_id:
                print(f"Fixing txn {txn.id}: creator_id {txn.creator_id} -> {log.user_id}")
                txn.creator_id = log.user_id
                fixed += 1

        if fixed:
            db.commit()
            print(f"\nDone. Fixed {fixed} transaction(s).")
        else:
            print("No mismatched transactions found. Nothing to fix.")
    finally:
        db.close()

if __name__ == "__main__":
    fix()
