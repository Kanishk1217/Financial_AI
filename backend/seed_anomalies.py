"""
Seed transactions that will trigger the /anomalies endpoint.

Anomaly logic (from main.py):
  - Take the last 14 days ending at end_date.
  - For each category, sum the last 7 days (`this_week`) and the 7 days before that (`prev_week`).
  - Flag any category where `this_week > 2 * prev_week` (and prev_week > 0).

This script inserts:
  - A small baseline of "normal" spending for the prior week.
  - Larger spikes in the current week so several categories trip the rule.
"""
import os, sys, io
import psycopg2
from datetime import date, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

# Honor DATABASE_URL (e.g. a Neon connection string) so this can seed the
# deployed DB; fall back to local Postgres for local-dev seeding.
_DB_URL = os.getenv("DATABASE_URL")
if _DB_URL:
    if _DB_URL.startswith("postgresql://"):
        _DB_URL = "postgres://" + _DB_URL[len("postgresql://"):]
    DB = _DB_URL  # psycopg2.connect accepts a DSN string directly
else:
    DB = dict(host="localhost", database="finance_tracker", user="postgres", password="KP_123456")

# Anchor on the real current date so the spikes land inside the /anomalies
# detection window (last 7 days vs the 7 before that, ending today).
TODAY = date.today()
THIS_WEEK_START = TODAY - timedelta(days=6)   # last 7 days incl. today
PREV_WEEK_START = TODAY - timedelta(days=13)  # the 7 days before that

# Per-category baseline (prev week) and spike (this week). Amounts are INR-scale
# and deliberately large so this_week clearly exceeds 2× prev_week even on top of
# the regular spending that seed_data.py lays down across both weeks.
# (category, prev_week_txs [list of (offset_days, amount, desc)], this_week_txs ...)
PLAN = {
    "Food": {
        "prev": [(0, 400, "Cafe Coffee Day"), (3, 600, "Subway")],
        "this": [(0, 9000, "Sushi Omakase party"), (2, 7000, "Steakhouse dinner"),
                 (5, 4500, "Wine bar tab")],
    },
    "Shopping": {
        "prev": [(1, 1200, "Local store")],
        "this": [(2, 32000, "Amazon — electronics splurge"),
                 (5, 22000, "Best Buy — monitor & headphones")],
    },
    "Entertainment": {
        "prev": [(2, 119, "Spotify Premium")],
        "this": [(1, 6500, "Concert VIP tickets"), (4, 4200, "Theatre night")],
    },
    "Transport": {
        # NOT an anomaly: roughly flat between weeks.
        "prev": [(0, 300, "Uber pool"), (4, 320, "Uber pool")],
        "this": [(2, 340, "Uber pool"), (5, 360, "Uber pool")],
    },
}

def insert(conn, uid: int, d: date, amount: float, category: str, description: str):
    conn.execute("""
        INSERT INTO transactions (user_id, amount, category, description, timestamp)
        VALUES (%s, %s, %s, %s, %s)
    """, (uid, amount, category, description, d.isoformat()))

def seed_for_user(conn, uid: int, email: str):
    cur = conn.cursor()

    # Idempotency: remove anything we previously inserted via this script
    cur.execute("""
        DELETE FROM transactions
        WHERE user_id = %s AND plaid_tx_id IS NULL AND tags @> ARRAY['anomaly-demo']::text[]
    """, (uid,))

    inserted = 0
    for cat, plan in PLAN.items():
        for off, amt, desc in plan["prev"]:
            d = PREV_WEEK_START + timedelta(days=off)
            insert(cur, uid, d, amt, cat, desc)
            inserted += 1
        for off, amt, desc in plan["this"]:
            d = THIS_WEEK_START + timedelta(days=off)
            insert(cur, uid, d, amt, cat, desc)
            inserted += 1

    # Tag them so we can clean up later
    cur.execute("""
        UPDATE transactions SET tags = array_append(COALESCE(tags, '{}'::text[]), 'anomaly-demo')
        WHERE user_id = %s AND plaid_tx_id IS NULL AND tags IS DISTINCT FROM ARRAY['anomaly-demo']::text[]
          AND timestamp >= %s AND timestamp <= %s
          AND NOT (tags @> ARRAY['anomaly-demo']::text[])
    """, (uid, PREV_WEEK_START.isoformat(), (TODAY + timedelta(days=1)).isoformat()))

    conn.commit()
    print(f"  [{email}] inserted {inserted} rows across {len(PLAN)} categories")

def main():
    _conn = psycopg2.connect(DB) if isinstance(DB, str) else psycopg2.connect(**DB)
    with _conn as conn:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email FROM users WHERE email IN (%s, %s) ORDER BY id",
            ("test@test.com", "kanishkpansari1217@gmail.com"),
        )
        users = cur.fetchall()
        if not users:
            print("No demo users found (expected test@test.com / kanishkpansari1217@gmail.com).")
            return
        for uid, email in users:
            seed_for_user(conn, uid, email)
        print(f"\nAnomaly window:")
        print(f"  this week (spikes): {THIS_WEEK_START} .. {TODAY}")
        print(f"  prev week (baseline): {PREV_WEEK_START} .. {THIS_WEEK_START - timedelta(days=1)}")
        print(f"\nExpected categories flagged by /anomalies for both users:")
        print(f"  Food (~5×), Shopping (~6×), Entertainment (~4×).")
        print(f"  Transport intentionally NOT flagged (flat).")

if __name__ == "__main__":
    main()
