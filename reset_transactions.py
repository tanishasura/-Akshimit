"""
reset_transactions.py
---------------------
Clears all rows from the `transactions` and `transactions_items` tables
in local_billing.db WITHOUT touching the `products` (inventory) table.

Run from the Classifabs-Billing-BE directory:
    python reset_transactions.py

A timestamped backup of the database is created before any changes are made.
"""

import sqlite3
import shutil
import os
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "local_billing.db")

# ── Safety backup ─────────────────────────────────────────────────────────────
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup_path = DB_PATH.replace(".db", f"_backup_{timestamp}.db")
shutil.copy2(DB_PATH, backup_path)
print(f"[✓] Backup created: {backup_path}")

# ── Reset ─────────────────────────────────────────────────────────────────────
conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

try:
    # Delete child rows first (FK constraint order)
    cur.execute("DELETE FROM transactions_items")
    items_deleted = cur.rowcount
    print(f"[✓] Deleted {items_deleted} row(s) from 'transactions_items'")

    cur.execute("DELETE FROM transactions")
    txn_deleted = cur.rowcount
    print(f"[✓] Deleted {txn_deleted} row(s) from 'transactions'")

    # Reset autoincrement counters only if sqlite_sequence table exists
    cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence'"
    )
    if cur.fetchone():
        cur.execute(
            "DELETE FROM sqlite_sequence WHERE name IN ('transactions', 'transactions_items')"
        )

    conn.commit()
    print("\n[✓] Transactions reset complete. Inventory (products) is untouched.")

except Exception as e:
    conn.rollback()
    print(f"[✗] Error: {e}. All changes rolled back.")
    # Remove the backup since nothing changed
    os.remove(backup_path)
    raise

finally:
    conn.close()
