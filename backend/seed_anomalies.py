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
import sys, io
import psycopg2
from datetime import date, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

DB = dict(host="localhost", database="finance_tracker", user="postgres", password="KP_123456")

# Today is 2026-05-14 (per memory). Pick the past 14 days dynamically.
TODAY = date(2026, 5, 14)
THIS_WEEK_START = TODAY - timedelta(days=6)  # 2026-05-08 .. 2026-05-14
PREV_WEEK_START = TODAY - timedelta(days=13) # 2026-05-01 .. 2026-05-07

# Per-category baseline (prev week) and spike (this week)
# (category, prev_week_txs [list of (offset_days, amount, desc)], this_week_txs ...)
PLAN = {
    "Food": {
        "prev": [(0, 12, "Starbucks"), (3, 18, "Subway"), (5, 14, "Chipotle")],
        # ~5x prev: 44 -> 240
        "this": [(0, 95, "Sushi Omakase"), (2, 68, "Steakhouse dinner"),
                 (4, 42, "Wine bar"), (6, 35, "Pizza delivery")],
    },
    "Shopping": {
        "prev": [(1, 38, "Target")],
        # ~6x: 38 -> 230
        "this": [(2, 129, "Amazon — gadgets"), (5, 102, "Best Buy headphones")],
    },
    "Entertainment": {
        "prev": [(2, 12, "Spotify")],
        # ~4x: 12 -> 52
        "this": [(1, 28, "Concert tickets"), (4, 24, "Theatre night")],
    },
    "Transport": {
        # NOT an anomaly: roughly flat between weeks (~28 prev, ~32 this)
        "prev": [(0, 14, "Uber pool"), (4, 14, "Uber pool")],
        "this": [(2, 16, "Uber pool"), (5, 16, "Uber pool")],
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
    with psycopg2.connect(**DB) as conn:
        cur = conn.cursor()
        cur.execute("SELECT id, email FROM users WHERE id IN (1, 3) ORDER BY id")
        users = cur.fetchall()
        if not users:
            print("No demo users found (expected user_id 1 and 3).")
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
