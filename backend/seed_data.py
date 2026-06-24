"""
Seed 3 months of realistic financial data for FinanceAI demo users.
Run: python seed_data.py
"""
import os
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


def seed_transactions(conn, uid, salary):
    rent   = 25000 if salary >= 80000 else 20000
    scale  = 1.0   if salary >= 80000 else 0.78

    # Three full months
    for yr, mo, max_day in [(2026, 2, 28), (2026, 3, 31), (2026, 4, 30)]:
        d = lambda day: date(yr, mo, min(day, max_day))

        # Income
        ins(conn, uid, -salary,                    "Income",        "Monthly Salary Credit",      d(1))

        # Housing
        ins(conn, uid, rent,                        "Housing",       "Monthly Rent Payment",       d(2))

        # Utilities
        ins(conn, uid, 999,                         "Utilities",     "ACT Broadband Internet",     d(3))
        ins(conn, uid, 399,                         "Utilities",     "Jio Mobile Recharge",        d(5))
        ins(conn, uid, round((1200 + mo*40)*scale), "Utilities",     "BESCOM Electricity Bill",    d(10))

        # Food — grocery
        ins(conn, uid, round(3400 * scale),         "Food",          "BigBasket Grocery",          d(6))

        # Food — delivery (Swiggy repeated so it shows as recurring)
        for day in [8, 13, 17, 22, 27]:
            ins(conn, uid, round((420 + day*7)*scale), "Food",       "Swiggy Food Delivery",       d(day))

        # Food — dining out
        for day in [9, 16, 23]:
            ins(conn, uid, round(1700 * scale),     "Food",          "Restaurant Dining",          d(day))

        # Food — coffee
        for day in [11, 19, 26]:
            ins(conn, uid, round(190 * scale),      "Food",          "Starbucks Coffee",           d(day))

        # Transport — Uber (repeated = recurring)
        for day in [7, 10, 14, 18, 22, 28]:
            ins(conn, uid, round(370 * scale),      "Transport",     "Uber Cab",                   d(day))
        ins(conn, uid, round(2100 * scale),         "Transport",     "HPCL Fuel",                  d(20))

        # Entertainment — subscriptions (recurring)
        ins(conn, uid, 649,                         "Entertainment", "Netflix Subscription",       d(12))
        ins(conn, uid, 119,                         "Entertainment", "Spotify Premium",            d(22))
        if mo in [2, 4]:
            ins(conn, uid, round(750 * scale),      "Entertainment", "PVR Cinema Tickets",         d(14))

        # Health — gym (recurring)
        ins(conn, uid, round(1500 * scale),         "Health",        "Cult.fit Gym Membership",    d(15))
        ins(conn, uid, round(480 * scale),          "Health",        "Apollo Pharmacy",            d(18))

        # Shopping
        ins(conn, uid, round(3400 * scale),         "Shopping",      "Amazon Shopping",            d(16))
        if mo in [3, 4]:
            ins(conn, uid, round(2800 * scale),     "Shopping",      "Flipkart Shopping",          d(25))

    # May partial (1–7)
    ins(conn, uid, -salary,              "Income",    "Monthly Salary Credit",   date(2026, 5, 1))
    ins(conn, uid, rent,                 "Housing",   "Monthly Rent Payment",    date(2026, 5, 2))
    ins(conn, uid, 999,                  "Utilities", "ACT Broadband Internet",  date(2026, 5, 3))
    ins(conn, uid, round(3400*scale),    "Food",      "BigBasket Grocery",       date(2026, 5, 5))
    ins(conn, uid, round(420*scale),     "Food",      "Swiggy Food Delivery",    date(2026, 5, 6))
    ins(conn, uid, round(370*scale),     "Transport", "Uber Cab",                date(2026, 5, 7))


def seed_budgets(conn, uid):
    m, y = 5, 2026
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
