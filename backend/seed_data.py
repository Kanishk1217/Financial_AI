"""
Seed 3 months of realistic financial data for FinanceAI demo users.
Run: python seed_data.py
"""
import os
import calendar
from sqlalchemy import create_engine, text
from datetime import date

# Honor DATABASE_URL (e.g. a Neon connection string for the deployed DB);
# fall back to the local Postgres for local-dev seeding.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:KP_123456@localhost:5432/finance_tracker",
)
# Render/Heroku-style `postgres://` → SQLAlchemy 2.x wants `postgresql://`
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def get_uid(conn, email):
    row = conn.execute(text("SELECT id FROM users WHERE email=:e"), {"e": email}).fetchone()
    return row[0] if row else None


def ins(conn, uid, amount, category, description, d):
    conn.execute(
        text("INSERT INTO transactions (user_id, amount, category, description, timestamp) VALUES (:u,:a,:c,:d,:t)"),
        {"u": uid, "a": amount, "c": category, "d": description, "t": str(d)},
    )


def _months_back(d, n):
    """(year, month) n calendar months before d's month."""
    m, y = d.month - n, d.year
    while m <= 0:
        m += 12
        y -= 1
    return y, m


def seed_transactions(conn, uid, salary):
    rent   = 25000 if salary >= 80000 else 20000
    scale  = 1.0   if salary >= 80000 else 0.78
    today  = date.today()

    # Anchor on the current date so the demo is always "fresh": the three
    # prior months are seeded in full, the current month up to today.
    months = [(_months_back(today, k)) for k in (3, 2, 1)]
    months = [(y, m, calendar.monthrange(y, m)[1]) for (y, m) in months]
    months.append((today.year, today.month, today.day))  # current month, capped at today

    for yr, mo, cap in months:
        max_day = calendar.monthrange(yr, mo)[1]

        def tx(day, amount, category, description):
            # Only insert days that have actually happened in the current month.
            if day <= cap:
                ins(conn, uid, amount, category, description, date(yr, mo, min(day, max_day)))

        # Income / Housing
        tx(1,  -salary, "Income",   "Monthly Salary Credit")
        tx(2,  rent,    "Housing",  "Monthly Rent Payment")

        # Utilities
        tx(3,  999, "Utilities", "ACT Broadband Internet")
        tx(5,  399, "Utilities", "Jio Mobile Recharge")
        tx(10, round((1200 + mo * 40) * scale), "Utilities", "BESCOM Electricity Bill")

        # Food — grocery
        tx(6,  round(3400 * scale), "Food", "BigBasket Grocery")
        # Food — delivery (Swiggy repeated so it shows as recurring)
        for day in [8, 13, 17, 22, 27]:
            tx(day, round((420 + day * 7) * scale), "Food", "Swiggy Food Delivery")
        # Food — dining out
        for day in [9, 16, 23]:
            tx(day, round(1700 * scale), "Food", "Restaurant Dining")
        # Food — coffee
        for day in [11, 19, 26]:
            tx(day, round(190 * scale), "Food", "Starbucks Coffee")

        # Transport — Uber (repeated = recurring)
        for day in [7, 10, 14, 18, 22, 28]:
            tx(day, round(370 * scale), "Transport", "Uber Cab")
        tx(20, round(2100 * scale), "Transport", "HPCL Fuel")

        # Entertainment — subscriptions (recurring)
        tx(12, 649, "Entertainment", "Netflix Subscription")
        tx(22, 119, "Entertainment", "Spotify Premium")
        tx(14, round(750 * scale), "Entertainment", "PVR Cinema Tickets")

        # Health — gym (recurring)
        tx(15, round(1500 * scale), "Health", "Cult.fit Gym Membership")
        tx(18, round(480 * scale),  "Health", "Apollo Pharmacy")

        # Shopping
        tx(16, round(3400 * scale), "Shopping", "Amazon Shopping")
        tx(25, round(2800 * scale), "Shopping", "Flipkart Shopping")


def seed_budgets(conn, uid):
    today = date.today()
    m, y = today.month, today.year
    budgets = [
        ("Food",          15000),
        ("Shopping",       8000),
        ("Transport",      6000),
        ("Entertainment",  3500),
        ("Health",         4000),
        ("Utilities",      3200),
        ("Housing",       26000),
    ]
    for cat, lim in budgets:
        updated = conn.execute(
            text("UPDATE budgets SET monthly_limit=:lim WHERE user_id=:u AND category=:c AND month=:m AND year=:y"),
            {"u": uid, "c": cat, "lim": lim, "m": m, "y": y},
        )
        if updated.rowcount == 0:
            try:
                conn.execute(
                    text("INSERT INTO budgets (user_id, category, monthly_limit, month, year) VALUES (:u,:c,:lim,:m,:y)"),
                    {"u": uid, "c": cat, "lim": lim, "m": m, "y": y},
                )
            except Exception:
                pass  # conflict — already exists


def seed_goals(conn, uid, salary):
    if salary >= 80000:
        goals = [
            ("Emergency Fund",   150000, 45000,  "2026-12-31"),
            ("Europe Vacation",  200000, 32000,  "2027-06-30"),
            ("New MacBook Pro",  150000, 75000,  "2026-09-30"),
        ]
    else:
        goals = [
            ("Emergency Fund",   100000, 20000,  "2026-12-31"),
            ("Bike Upgrade",      80000, 15000,  "2026-12-31"),
        ]
    for name, target, current, deadline in goals:
        conn.execute(
            text("INSERT INTO savings_goals (user_id, goal_name, target_amount, current_saved, deadline) VALUES (:u,:n,:t,:c,:d)"),
            {"u": uid, "n": name, "t": target, "c": current, "d": deadline},
        )


def main():
    print("Seeding FinanceAI database...")
    with engine.connect() as conn:
        users = [
            ("kanishkpansari1217@gmail.com", 85000),
            ("test@test.com",                65000),
        ]
        for email, salary in users:
            uid = get_uid(conn, email)
            if not uid:
                print(f"   [!] User not found: {email} - skipping")
                continue

            # Clear existing
            conn.execute(text("DELETE FROM transactions  WHERE user_id=:u"), {"u": uid})
            conn.execute(text("DELETE FROM savings_goals WHERE user_id=:u"), {"u": uid})

            seed_transactions(conn, uid, salary)
            seed_budgets(conn, uid)
            seed_goals(conn, uid, salary)

            print(f"   OK  {email}  (uid={uid}, salary={salary})")

        conn.commit()

    print("Done! Restart the backend and refresh the app.")


if __name__ == "__main__":
    main()
