from fastapi import FastAPI, Depends, HTTPException, Query, Request, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, text
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, date, timedelta
from collections import defaultdict
from typing import Optional
import csv, io, os, secrets, smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Plaid
from plaid.api import plaid_api
from plaid.configuration import Configuration
from plaid.api_client import ApiClient
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest

# ── Config ────────────────────────────────────────────────────────────────────
app = FastAPI(title="FinanceAI API")

# CORS: lock to known origins. Override with ALLOWED_ORIGINS env (comma-separated) for prod.
_default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", ",".join(_default_origins)).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# JWT secret MUST come from env in production. Dev fallback warns loudly.
JWT_SECRET = os.getenv("JWT_SECRET", "")
if not JWT_SECRET:
    JWT_SECRET = "dev-only-fallback-do-not-use-in-prod"
    print("[warn] JWT_SECRET env var not set — using dev fallback. Set JWT_SECRET in prod.")
JWT_ALG = "HS256"

# Simple in-memory rate limiter (per-IP, per-endpoint). Not durable, but stops bursts.
from collections import deque as _deque
_RATE_BUCKETS: dict = {}

def rate_limit(key: str, max_calls: int, window_seconds: int):
    """Sliding-window rate limit. Raises HTTPException 429 if exceeded."""
    import time
    now = time.time()
    bucket = _RATE_BUCKETS.setdefault(key, _deque())
    while bucket and bucket[0] < now - window_seconds:
        bucket.popleft()
    if len(bucket) >= max_calls:
        raise HTTPException(status_code=429, detail="Too many requests — please slow down")
    bucket.append(now)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:KP_123456@localhost:5432/finance_tracker",
)
# Some providers (Render, Heroku) give `postgres://` — SQLAlchemy 2.x wants `postgresql://`
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql://" + DATABASE_URL[len("postgres://"):]

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    with engine.connect() as c:
        c.execute(text("SELECT 1"))
    print("[ok] Database connected")
except Exception as e:
    print(f"[err] Database error: {e}")

# Email config — set these env vars or they'll just print to console
SMTP_HOST   = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT   = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER   = os.getenv("SMTP_USER", "")
SMTP_PASS   = os.getenv("SMTP_PASS", "")
APP_URL     = os.getenv("APP_URL", "http://localhost:3000")

# Plaid config
PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID", "")
PLAID_SECRET    = os.getenv("PLAID_SECRET", "")
PLAID_ENV       = os.getenv("PLAID_ENV", "sandbox")

_plaid_host_map = {
    "sandbox":     "https://sandbox.plaid.com",
    "development": "https://development.plaid.com",
    "production":  "https://production.plaid.com",
}

def _plaid_client():
    if not PLAID_CLIENT_ID or not PLAID_SECRET:
        raise HTTPException(status_code=503, detail="Plaid credentials not configured on server")
    cfg = Configuration(
        host=_plaid_host_map.get(PLAID_ENV, _plaid_host_map["sandbox"]),
        api_key={"clientId": PLAID_CLIENT_ID, "secret": PLAID_SECRET},
    )
    return plaid_api.PlaidApi(ApiClient(cfg))

# ── DB bootstrap ──────────────────────────────────────────────────────────────
def bootstrap_db():
    """
    Idempotent schema setup. Safe to run on every boot.
    Creates every table the app needs, then applies in-place migrations
    for newer columns we've added over time.
    """
    with engine.connect() as conn:
        # ── Core tables ───────────────────────────────────────────────────────
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id       SERIAL PRIMARY KEY,
                name     VARCHAR(120),
                email    VARCHAR(200) UNIQUE NOT NULL,
                password VARCHAR(200) NOT NULL
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS transactions (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount      FLOAT NOT NULL,
                category    VARCHAR(64),
                description TEXT,
                timestamp   TIMESTAMP NOT NULL DEFAULT NOW()
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS budgets (
                id            SERIAL PRIMARY KEY,
                user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                category      VARCHAR(64) NOT NULL,
                monthly_limit FLOAT NOT NULL,
                month         INTEGER NOT NULL,
                year          INTEGER NOT NULL,
                UNIQUE (user_id, category, month, year)
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS savings_goals (
                id             SERIAL PRIMARY KEY,
                user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                goal_name      VARCHAR(120) NOT NULL,
                target_amount  FLOAT NOT NULL,
                current_saved  FLOAT DEFAULT 0,
                deadline       DATE,
                created_at     TIMESTAMP DEFAULT NOW()
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS user_tokens (
                id               SERIAL PRIMARY KEY,
                user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                access_token     VARCHAR(200),
                item_id          VARCHAR(64) UNIQUE,
                institution_name VARCHAR(120),
                created_at       TIMESTAMP DEFAULT NOW()
            )
        """))
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id         SERIAL PRIMARY KEY,
                user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token      VARCHAR(64) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                used       BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT NOW()
            )
        """))

        # ── In-place migrations (additive columns on transactions) ────────────
        for stmt in (
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS plaid_tx_id        VARCHAR(64) UNIQUE",
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS logo_url           VARCHAR(500)",
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS iso_currency_code  VARCHAR(8) DEFAULT 'USD'",
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS pending            BOOLEAN DEFAULT FALSE",
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id         VARCHAR(64)",
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS notes              TEXT",
            "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tags               TEXT[] DEFAULT '{}'",
        ):
            try:
                conn.execute(text(stmt))
            except Exception as e:
                print(f"[migrate-skip] {stmt[:60]}…: {e}")

        # Helpful indexes
        for stmt in (
            "CREATE INDEX IF NOT EXISTS idx_tx_user_time ON transactions (user_id, timestamp DESC)",
            "CREATE INDEX IF NOT EXISTS idx_tx_user_cat  ON transactions (user_id, category)",
            "CREATE INDEX IF NOT EXISTS idx_tokens_user  ON user_tokens (user_id)",
        ):
            try:
                conn.execute(text(stmt))
            except Exception:
                pass

        conn.commit()

try:
    bootstrap_db()
except Exception as e:
    print(f"[err] bootstrap_db failed: {e}")

# ── Auth ──────────────────────────────────────────────────────────────────────
security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        return jwt.decode(creds.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# ── Pydantic models ───────────────────────────────────────────────────────────
class SignupReq(BaseModel):
    name: str
    email: str
    password: str

class LoginReq(BaseModel):
    email: str
    password: str

class ForgotReq(BaseModel):
    email: str

class ResetReq(BaseModel):
    token: str
    new_password: str

class TxCreate(BaseModel):
    amount: float
    category: str
    description: str
    date: str  # YYYY-MM-DD

class BudgetCreate(BaseModel):
    category: str
    amount: float
    month: int
    year: int

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float
    deadline: str  # YYYY-MM-DD

class OccasionReq(BaseModel):
    occasion: str
    budget: float

class PlaidExchangeReq(BaseModel):
    public_token: str

class TxUpdate(BaseModel):
    amount: float
    category: str
    description: str
    date: str

class TxPatch(BaseModel):
    notes: Optional[str] = None
    tags: Optional[list[str]] = None
    category: Optional[str] = None

class BulkDeleteReq(BaseModel):
    ids: list[int]

class BulkTagReq(BaseModel):
    ids: list[int]
    tag: str

class UpdateProfileReq(BaseModel):
    name: Optional[str] = None

class ChangePasswordReq(BaseModel):
    current_password: str
    new_password: str

# ── Email helper ──────────────────────────────────────────────────────────────
def send_reset_email(to_email: str, token: str):
    reset_url = f"{APP_URL}/reset-password?token={token}"
    if not SMTP_USER:
        # Dev mode — just print
        print(f"\n{'='*60}")
        print(f"[DEV] Password reset for {to_email}")
        print(f"[DEV] Reset URL: {reset_url}")
        print(f"[DEV] Token: {token}")
        print(f"{'='*60}\n")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "FinanceAI — Reset your password"
    msg["From"] = SMTP_USER
    msg["To"] = to_email

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:40px auto;color:#111">
      <div style="background:#000;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
        <span style="color:#fff;font-size:18px;font-weight:900;letter-spacing:-0.02em">FinanceAI</span>
      </div>
      <h2 style="font-size:22px;font-weight:800;margin:0 0 8px">Reset your password</h2>
      <p style="color:#555;margin:0 0 24px">Click the button below to set a new password. This link expires in 15 minutes.</p>
      <a href="{reset_url}" style="display:inline-block;padding:12px 28px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">
        Reset Password
      </a>
      <p style="color:#999;font-size:12px;margin-top:32px">If you didn't request this, ignore this email.</p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
            s.starttls()
            s.login(SMTP_USER, SMTP_PASS)
            s.sendmail(SMTP_USER, to_email, msg.as_string())
    except Exception as e:
        print(f"Email send error: {e}")

# ── Auth endpoints ────────────────────────────────────────────────────────────
def _client_ip(request: Request) -> str:
    return request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown").split(",")[0].strip()

@app.post("/signup")
def signup(req: SignupReq, request: Request):
    rate_limit(f"signup:{_client_ip(request)}", max_calls=5, window_seconds=60)
    hashed = pwd_context.hash(req.password)
    try:
        with engine.connect() as conn:
            conn.execute(
                text("INSERT INTO users (name, email, password) VALUES (:n,:e,:p)"),
                {"n": req.name, "e": req.email, "p": hashed}
            )
            conn.commit()
        return {"message": "Account created successfully"}
    except Exception:
        raise HTTPException(status_code=400, detail="Email already registered")

@app.post("/login")
def login(req: LoginReq, request: Request):
    rate_limit(f"login:{_client_ip(request)}", max_calls=10, window_seconds=60)
    with engine.connect() as conn:
        row = conn.execute(text("SELECT * FROM users WHERE email=:e"), {"e": req.email}).fetchone()
    if row and pwd_context.verify(req.password, row._mapping["password"]):
        token = jwt.encode({"user_id": row._mapping["id"], "email": row._mapping["email"]}, JWT_SECRET, algorithm=JWT_ALG)
        return {"access_token": token}
    return {"error": "Invalid credentials"}

@app.post("/forgot-password")
def forgot_password(req: ForgotReq, request: Request):
    rate_limit(f"forgot:{_client_ip(request)}", max_calls=3, window_seconds=300)
    with engine.connect() as conn:
        row = conn.execute(text("SELECT id FROM users WHERE email=:e"), {"e": req.email}).fetchone()
    if row:
        token = secrets.token_urlsafe(32)
        expires = datetime.now() + timedelta(minutes=15)
        with engine.connect() as conn:
            conn.execute(
                text("INSERT INTO password_reset_tokens (user_id,token,expires_at) VALUES (:uid,:t,:exp)"),
                {"uid": row._mapping["id"], "t": token, "exp": expires}
            )
            conn.commit()
        send_reset_email(req.email, token)
    # Always return same message (security)
    return {"message": "If that email exists, a reset link has been sent."}

@app.post("/reset-password")
def reset_password(req: ResetReq):
    with engine.connect() as conn:
        row = conn.execute(
            text("SELECT * FROM password_reset_tokens WHERE token=:t AND used=FALSE AND expires_at > NOW()"),
            {"t": req.token}
        ).fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        hashed = pwd_context.hash(req.new_password)
        conn.execute(text("UPDATE users SET password=:p WHERE id=:uid"), {"p": hashed, "uid": row._mapping["user_id"]})
        conn.execute(text("UPDATE password_reset_tokens SET used=TRUE WHERE token=:t"), {"t": req.token})
        conn.commit()
    return {"message": "Password updated successfully"}

# ── User profile ──────────────────────────────────────────────────────────────
@app.get("/me")
def me(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        row = conn.execute(text("SELECT id, name, email FROM users WHERE id=:uid"),
                           {"uid": uid}).fetchone()
        tx_count = conn.execute(text("SELECT COUNT(*) FROM transactions WHERE user_id=:uid"),
                                {"uid": uid}).scalar() or 0
        bank_count = conn.execute(text("SELECT COUNT(*) FROM user_tokens WHERE user_id=:uid"),
                                  {"uid": uid}).scalar() or 0
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id":          row._mapping["id"],
        "name":        row._mapping["name"],
        "email":       row._mapping["email"],
        "stats": {
            "transactions": tx_count,
            "banks":        bank_count,
        },
    }

@app.patch("/me")
def update_profile(req: UpdateProfileReq, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    if req.name is None:
        raise HTTPException(status_code=400, detail="No fields to update")
    name = req.name.strip()
    if len(name) < 1 or len(name) > 80:
        raise HTTPException(status_code=400, detail="Name must be 1-80 characters")
    with engine.connect() as conn:
        conn.execute(text("UPDATE users SET name=:n WHERE id=:uid"), {"n": name, "uid": uid})
        conn.commit()
    return {"message": "Profile updated", "name": name}

@app.patch("/me/password")
def change_password(req: ChangePasswordReq, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    with engine.connect() as conn:
        row = conn.execute(text("SELECT password FROM users WHERE id=:uid"), {"uid": uid}).fetchone()
        if not row or not pwd_context.verify(req.current_password, row._mapping["password"]):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        hashed = pwd_context.hash(req.new_password)
        conn.execute(text("UPDATE users SET password=:p WHERE id=:uid"), {"p": hashed, "uid": uid})
        conn.commit()
    return {"message": "Password changed"}

@app.delete("/me")
def delete_account(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        # Cascade-style cleanup
        conn.execute(text("DELETE FROM transactions    WHERE user_id=:uid"), {"uid": uid})
        conn.execute(text("DELETE FROM budgets         WHERE user_id=:uid"), {"uid": uid})
        conn.execute(text("DELETE FROM savings_goals   WHERE user_id=:uid"), {"uid": uid})
        conn.execute(text("DELETE FROM user_tokens     WHERE user_id=:uid"), {"uid": uid})
        conn.execute(text("DELETE FROM password_reset_tokens WHERE user_id=:uid"), {"uid": uid})
        conn.execute(text("DELETE FROM users           WHERE id=:uid"), {"uid": uid})
        conn.commit()
    return {"message": "Account deleted"}

# ── Transactions ──────────────────────────────────────────────────────────────
@app.get("/transactions")
def list_transactions(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str]   = Query(None),
    limit:    Optional[int]   = Query(None, ge=1, le=500),
    offset:   int             = Query(0,   ge=0),
    account_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user)
):
    uid = user["user_id"]
    where = ["user_id = :uid"]
    params: dict = {"uid": uid}
    if start_date and end_date:
        where.append("timestamp BETWEEN :s AND :e")
        params["s"] = start_date
        params["e"] = end_date + " 23:59:59"
    if account_id:
        where.append("account_id = :acct")
        params["acct"] = account_id
    where_clause = " AND ".join(where)

    with engine.connect() as conn:
        total = conn.execute(text(f"SELECT COUNT(*) FROM transactions WHERE {where_clause}"),
                              params).scalar() or 0

        sql = f"""
            SELECT id, amount, category, description,
                   DATE(timestamp) as date, timestamp,
                   logo_url, iso_currency_code, pending, account_id, notes, tags,
                   plaid_tx_id
            FROM transactions
            WHERE {where_clause}
            ORDER BY timestamp DESC
        """
        if limit is not None:
            sql += " LIMIT :lim OFFSET :off"
            params["lim"] = limit
            params["off"] = offset
        rows = conn.execute(text(sql), params).mappings().all()

    items = [{
        "id": r["id"], "amount": r["amount"], "category": r["category"],
        "description": r["description"], "date": str(r["date"]),
        "logo_url": r["logo_url"],
        "currency": r["iso_currency_code"] or "USD",
        "pending": bool(r["pending"]),
        "account_id": r["account_id"],
        "notes": r["notes"],
        "tags": r["tags"] or [],
        "is_plaid": r["plaid_tx_id"] is not None,
    } for r in rows]

    # Back-compat: when no `limit` requested, return bare array (frontend old shape).
    # When `limit` requested, return paginated envelope.
    if limit is None:
        return items
    return {"items": items, "total": total, "offset": offset, "limit": limit}

@app.post("/transactions")
def create_transaction(tx: TxCreate, user: dict = Depends(get_current_user)):
    with engine.connect() as conn:
        result = conn.execute(text("""
            INSERT INTO transactions (user_id, amount, category, description, timestamp)
            VALUES (:uid, :amt, :cat, :desc, :ts) RETURNING id
        """), {"uid": user["user_id"], "amt": tx.amount, "cat": tx.category,
               "desc": tx.description, "ts": tx.date})
        new_id = result.fetchone()[0]
        conn.commit()
    return {"id": new_id, "amount": tx.amount, "category": tx.category,
            "description": tx.description, "date": tx.date}

@app.put("/transactions/{tx_id}")
def update_transaction(tx_id: int, tx: TxUpdate, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        result = conn.execute(text("""
            UPDATE transactions SET amount=:amt, category=:cat, description=:desc, timestamp=:ts
            WHERE id=:id AND user_id=:uid RETURNING id
        """), {"id": tx_id, "uid": uid, "amt": tx.amount, "cat": tx.category,
               "desc": tx.description, "ts": tx.date})
        row = result.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Transaction not found")
        conn.commit()
    return {"id": tx_id, "amount": tx.amount, "category": tx.category,
            "description": tx.description, "date": tx.date}

@app.patch("/transactions/{tx_id}")
def patch_transaction(tx_id: int, patch: TxPatch, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    sets, params = [], {"id": tx_id, "uid": uid}
    if patch.notes is not None:
        sets.append("notes=:notes"); params["notes"] = patch.notes
    if patch.tags is not None:
        sets.append("tags=:tags"); params["tags"] = patch.tags
    if patch.category is not None:
        sets.append("category=:cat"); params["cat"] = patch.category
    if not sets:
        raise HTTPException(status_code=400, detail="No fields to update")
    with engine.connect() as conn:
        result = conn.execute(text(f"UPDATE transactions SET {', '.join(sets)} WHERE id=:id AND user_id=:uid RETURNING id"), params)
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Transaction not found")
        conn.commit()
    return {"message": "Updated"}

@app.delete("/transactions/{tx_id}")
def delete_transaction(tx_id: int, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        result = conn.execute(text("""
            DELETE FROM transactions WHERE id=:id AND user_id=:uid RETURNING id
        """), {"id": tx_id, "uid": uid})
        if not result.fetchone():
            raise HTTPException(status_code=404, detail="Transaction not found")
        conn.commit()
    return {"message": "Transaction deleted"}

@app.post("/transactions/bulk-delete")
def bulk_delete_transactions(req: BulkDeleteReq, user: dict = Depends(get_current_user)):
    if not req.ids:
        return {"deleted": 0}
    uid = user["user_id"]
    with engine.connect() as conn:
        result = conn.execute(text(
            "DELETE FROM transactions WHERE user_id = :uid AND id = ANY(:ids) RETURNING id"
        ), {"uid": uid, "ids": req.ids})
        deleted = len(result.fetchall())
        conn.commit()
    return {"deleted": deleted}

@app.post("/transactions/bulk-tag")
def bulk_tag_transactions(req: BulkTagReq, user: dict = Depends(get_current_user)):
    tag = req.tag.strip().lower()
    if not tag or not req.ids:
        raise HTTPException(status_code=400, detail="ids and tag required")
    uid = user["user_id"]
    with engine.connect() as conn:
        result = conn.execute(text("""
            UPDATE transactions
            SET tags = CASE WHEN tags @> ARRAY[:tag]::text[] THEN tags ELSE array_append(COALESCE(tags, '{}'::text[]), :tag) END
            WHERE user_id = :uid AND id = ANY(:ids)
            RETURNING id
        """), {"uid": uid, "ids": req.ids, "tag": tag})
        tagged = len(result.fetchall())
        conn.commit()
    return {"tagged": tagged, "tag": tag}

@app.post("/transactions/import-csv")
async def import_csv(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    """
    Accepts a CSV with columns: Date, Description, Category, Amount.
    - Date: YYYY-MM-DD
    - Amount: positive = expense, negative = income (Plaid convention)
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a .csv file")
    raw = (await file.read()).decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(io.StringIO(raw))
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="Empty CSV")

    # Tolerant column lookup
    cols = {c.lower().strip(): c for c in reader.fieldnames}
    def col(*names):
        for n in names:
            if n in cols:
                return cols[n]
        return None
    c_date = col("date", "transaction date", "posted date")
    c_desc = col("description", "merchant", "name", "memo")
    c_amt  = col("amount", "value")
    c_cat  = col("category", "type")
    if not c_date or not c_desc or not c_amt:
        raise HTTPException(status_code=400, detail="CSV must have Date, Description, Amount columns")

    uid = user["user_id"]
    inserted, errors = 0, []
    with engine.connect() as conn:
        for i, row in enumerate(reader, start=2):  # row 1 = header
            try:
                d_raw = (row.get(c_date) or "").strip()
                # Try common date formats
                tx_date = None
                for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%m-%d-%Y", "%d-%m-%Y"):
                    try:
                        tx_date = datetime.strptime(d_raw, fmt).date()
                        break
                    except Exception:
                        continue
                if not tx_date:
                    errors.append(f"Row {i}: invalid date '{d_raw}'")
                    continue
                amt = float((row.get(c_amt) or "0").replace(",", "").replace("$", "").strip())
                desc = (row.get(c_desc) or "Imported transaction").strip()
                cat = ((row.get(c_cat) if c_cat else None) or "Other").strip() or "Other"
                conn.execute(text("""
                    INSERT INTO transactions (user_id, amount, category, description, timestamp)
                    VALUES (:uid, :amt, :cat, :desc, :ts)
                """), {"uid": uid, "amt": amt, "cat": cat, "desc": desc, "ts": str(tx_date)})
                inserted += 1
            except Exception as e:
                errors.append(f"Row {i}: {e}")
        conn.commit()
    return {"inserted": inserted, "errors": errors[:20]}

@app.post("/transactions/refresh")
def refresh_transactions(user: dict = Depends(get_current_user)):
    # If a Plaid item is connected, do an incremental sync; otherwise no-op
    uid = user["user_id"]
    with engine.connect() as conn:
        row = conn.execute(text("SELECT access_token FROM user_tokens WHERE user_id=:uid"),
                           {"uid": uid}).fetchone()
    if row and row[0]:
        try:
            count = _plaid_sync_for_user(uid, row[0])
            return {"message": f"Synced {count} new transactions from your bank."}
        except Exception as e:
            return {"message": f"Sync error: {e}"}
    return {"message": "Transactions are up to date"}

# ── Plaid ─────────────────────────────────────────────────────────────────────
def _plaid_sync_for_user(uid: int, access_token: str) -> int:
    """Pull all available transactions for a user and upsert into transactions table.
    Returns count of new rows inserted."""
    client = _plaid_client()
    cursor = ""
    added_all, modified_all, removed_all = [], [], []
    has_more = True
    while has_more:
        req = TransactionsSyncRequest(access_token=access_token, cursor=cursor)
        resp = client.transactions_sync(req)
        added_all.extend(resp["added"])
        modified_all.extend(resp["modified"])
        removed_all.extend(resp["removed"])
        has_more = resp["has_more"]
        cursor = resp["next_cursor"]

    # Map Plaid PFC primary categories to our app's category set
    PFC_MAP = {
        "FOOD_AND_DRINK":            "Food",
        "GENERAL_MERCHANDISE":       "Shopping",
        "TRANSPORTATION":            "Transport",
        "TRAVEL":                    "Transport",
        "ENTERTAINMENT":             "Entertainment",
        "MEDICAL":                   "Health",
        "PERSONAL_CARE":             "Health",
        "RENT_AND_UTILITIES":        "Utilities",
        "HOME_IMPROVEMENT":          "Housing",
        "INCOME":                    "Income",
        "TRANSFER_IN":               "Income",
        "TRANSFER_OUT":              "Other",
        "LOAN_PAYMENTS":             "Other",
        "BANK_FEES":                 "Other",
        "GENERAL_SERVICES":          "Other",
        "GOVERNMENT_AND_NON_PROFIT": "Other",
    }

    inserted = 0
    with engine.connect() as conn:
        # Ensure plaid_tx_id column exists for idempotency
        conn.execute(text("ALTER TABLE transactions ADD COLUMN IF NOT EXISTS plaid_tx_id VARCHAR(64) UNIQUE"))
        conn.commit()

        for tx in added_all + modified_all:
            d = tx.to_dict() if hasattr(tx, "to_dict") else tx
            plaid_id = d["transaction_id"]
            # Plaid: positive = money OUT (expense), negative = money IN. Same sign convention as our app.
            amount = float(d["amount"])

            pfc = d.get("personal_finance_category") or {}
            primary = pfc.get("primary") if isinstance(pfc, dict) else None
            category = PFC_MAP.get(primary, "Other") if primary else "Other"

            description = d.get("merchant_name") or d.get("name") or "Plaid Transaction"
            tx_date = d["date"]
            logo_url = d.get("logo_url") or (d.get("personal_finance_category_icon_url") if not d.get("logo_url") else None)
            currency = d.get("iso_currency_code") or "USD"
            pending = bool(d.get("pending", False))
            account_id = d.get("account_id")

            result = conn.execute(text("""
                INSERT INTO transactions (user_id, amount, category, description, timestamp, plaid_tx_id,
                                          logo_url, iso_currency_code, pending, account_id)
                VALUES (:uid, :amt, :cat, :desc, :ts, :pid, :logo, :cur, :pend, :acct)
                ON CONFLICT (plaid_tx_id) DO UPDATE
                  SET amount=EXCLUDED.amount, category=EXCLUDED.category,
                      description=EXCLUDED.description, timestamp=EXCLUDED.timestamp,
                      logo_url=EXCLUDED.logo_url, iso_currency_code=EXCLUDED.iso_currency_code,
                      pending=EXCLUDED.pending, account_id=EXCLUDED.account_id
                RETURNING (xmax = 0) AS inserted
            """), {"uid": uid, "amt": amount, "cat": category, "desc": description,
                   "ts": str(tx_date), "pid": plaid_id, "logo": logo_url, "cur": currency,
                   "pend": pending, "acct": account_id})
            r = result.fetchone()
            if r and r[0]:
                inserted += 1

        for tx in removed_all:
            d = tx.to_dict() if hasattr(tx, "to_dict") else tx
            conn.execute(text("DELETE FROM transactions WHERE plaid_tx_id=:pid AND user_id=:uid"),
                         {"pid": d["transaction_id"], "uid": uid})
        conn.commit()
    return inserted

@app.post("/plaid/link-token")
def plaid_link_token(user: dict = Depends(get_current_user)):
    client = _plaid_client()
    req = LinkTokenCreateRequest(
        products=[Products("transactions")],
        client_name="FinanceAI",
        country_codes=[CountryCode("US")],
        language="en",
        user=LinkTokenCreateRequestUser(client_user_id=str(user["user_id"])),
    )
    try:
        resp = client.link_token_create(req)
        return {"link_token": resp["link_token"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plaid error: {e}")

@app.post("/plaid/exchange-token")
def plaid_exchange_token(req: PlaidExchangeReq, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    client = _plaid_client()
    try:
        exch = client.item_public_token_exchange(
            ItemPublicTokenExchangeRequest(public_token=req.public_token)
        )
        access_token = exch["access_token"]
        item_id = exch["item_id"]

        inst_name = "Bank"
        try:
            item_resp = client.item_get(ItemGetRequest(access_token=access_token))
            inst_id = item_resp["item"]["institution_id"]
            if inst_id:
                inst_resp = client.institutions_get_by_id(
                    InstitutionsGetByIdRequest(institution_id=inst_id, country_codes=[CountryCode("US")])
                )
                inst_name = inst_resp["institution"]["name"]
        except Exception:
            pass

        with engine.connect() as conn:
            # Multi-bank: same user can have many items; unique key is item_id
            conn.execute(text("""
                INSERT INTO user_tokens (user_id, access_token, item_id, institution_name)
                VALUES (:uid, :at, :iid, :inst)
                ON CONFLICT (item_id) DO UPDATE
                  SET access_token=EXCLUDED.access_token,
                      institution_name=EXCLUDED.institution_name
            """), {"uid": uid, "at": access_token, "iid": item_id, "inst": inst_name})
            conn.commit()

        synced = _plaid_sync_for_user(uid, access_token)
        return {"message": f"Connected to {inst_name}", "synced_transactions": synced, "institution": inst_name, "item_id": item_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plaid exchange error: {e}")

@app.post("/plaid/sync")
def plaid_sync(user: dict = Depends(get_current_user)):
    """Sync across ALL connected items for the user."""
    uid = user["user_id"]
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT access_token, institution_name FROM user_tokens WHERE user_id=:uid"),
                            {"uid": uid}).fetchall()
    if not rows:
        raise HTTPException(status_code=400, detail="No bank connected")
    total = 0
    per_item = []
    for r in rows:
        try:
            n = _plaid_sync_for_user(uid, r[0])
            total += n
            per_item.append({"institution": r[1] or "Bank", "synced": n})
        except Exception as e:
            per_item.append({"institution": r[1] or "Bank", "error": str(e)})
    return {"synced_transactions": total, "per_item": per_item}

@app.get("/plaid/status")
def plaid_status(user: dict = Depends(get_current_user)):
    """Return list of all connected institutions for the user."""
    uid = user["user_id"]
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT item_id, institution_name, created_at
            FROM user_tokens WHERE user_id=:uid
            ORDER BY created_at ASC
        """), {"uid": uid}).mappings().all()
    items = [{
        "item_id":     r["item_id"],
        "institution": r["institution_name"] or "Bank",
        "connected_at": str(r["created_at"]),
    } for r in rows]
    # Back-compat: top-level connected/institution reflects first item
    return {
        "connected":   len(items) > 0,
        "institution": items[0]["institution"] if items else None,
        "items":       items,
        "count":       len(items),
    }

@app.get("/plaid/accounts")
def plaid_accounts(user: dict = Depends(get_current_user)):
    """Aggregate accounts across ALL items for the user."""
    uid = user["user_id"]
    with engine.connect() as conn:
        rows = conn.execute(text("SELECT access_token, institution_name, item_id FROM user_tokens WHERE user_id=:uid"),
                            {"uid": uid}).fetchall()
    if not rows:
        return []
    client = _plaid_client()
    all_accounts = []
    for r in rows:
        try:
            resp = client.accounts_get(AccountsGetRequest(access_token=r[0]))
            for a in resp["accounts"]:
                all_accounts.append({
                    "account_id":  a["account_id"],
                    "name":        a["name"],
                    "type":        str(a["type"]),
                    "subtype":     str(a["subtype"]) if a.get("subtype") else None,
                    "balance":     float(a["balances"]["current"] or 0),
                    "currency":    a["balances"].get("iso_currency_code") or "USD",
                    "institution": r[1] or "Bank",
                    "item_id":     r[2],
                })
        except Exception as e:
            print(f"Plaid accounts error for item {r[2]}: {e}")
    return all_accounts

@app.delete("/plaid/disconnect")
def plaid_disconnect(item_id: Optional[str] = Query(None), user: dict = Depends(get_current_user)):
    """If item_id passed, disconnect just that bank; otherwise disconnect all."""
    uid = user["user_id"]
    with engine.connect() as conn:
        if item_id:
            conn.execute(text("DELETE FROM user_tokens WHERE user_id=:uid AND item_id=:iid"),
                          {"uid": uid, "iid": item_id})
        else:
            conn.execute(text("DELETE FROM user_tokens WHERE user_id=:uid"), {"uid": uid})
        conn.commit()
    return {"message": "Bank disconnected"}

@app.get("/recurring-transactions")
def recurring_transactions(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    cutoff = date.today() - timedelta(days=90)
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT description, category, amount, COUNT(*) as cnt,
                   AVG(amount) as avg_amt
            FROM transactions
            WHERE user_id=:uid AND timestamp >= :c AND amount > 0
            GROUP BY description, category, amount
            HAVING COUNT(*) >= 2
            ORDER BY cnt DESC
        """), {"uid": uid, "c": cutoff}).mappings().all()

    result = []
    seen = set()
    for r in rows:
        key = r["description"].lower().strip()
        if key in seen:
            continue
        seen.add(key)
        result.append({
            "description": r["description"],
            "category": r["category"],
            "amount": round(float(r["avg_amt"]), 2),
            "frequency": "monthly",
            "count": r["cnt"],
            "annual_cost": round(float(r["avg_amt"]) * 12, 2)
        })
    return result

# ── Insights ──────────────────────────────────────────────────────────────────
def _aggregate(rows):
    """Sum income/expenses/category breakdown over a set of rows."""
    cat = defaultdict(float)
    income, expenses = 0.0, 0.0
    for r in rows:
        amt = float(r["amount"])
        if amt < 0:
            income += abs(amt)
        else:
            expenses += amt
            cat[r["category"]] += amt
    return income, expenses, dict(cat)

@app.get("/insights")
def insights(
    start_date: str = Query(...),
    end_date:   str = Query(...),
    user: dict = Depends(get_current_user)
):
    uid = user["user_id"]
    s = datetime.strptime(start_date, "%Y-%m-%d").date()
    e = datetime.strptime(end_date,   "%Y-%m-%d").date()
    span_days = max((e - s).days + 1, 1)
    # Previous period of the same length, immediately before the current range
    prev_e = s - timedelta(days=1)
    prev_s = prev_e - timedelta(days=span_days - 1)

    with engine.connect() as conn:
        rows_now = conn.execute(text("""
            SELECT amount, category, description, DATE(timestamp) as date
            FROM transactions
            WHERE user_id=:uid AND timestamp BETWEEN :s AND :e
        """), {"uid": uid, "s": start_date, "e": end_date + " 23:59:59"}).mappings().all()

        rows_prev = conn.execute(text("""
            SELECT amount, category
            FROM transactions
            WHERE user_id=:uid AND timestamp BETWEEN :s AND :e
        """), {"uid": uid, "s": str(prev_s), "e": str(prev_e) + " 23:59:59"}).mappings().all()

    merchant_totals: dict = defaultdict(float)
    weekly: dict = defaultdict(float)

    for r in rows_now:
        amt = float(r["amount"])
        if amt > 0:
            merchant_totals[r["description"]] += amt
            d = r["date"]
            if isinstance(d, str):
                d = datetime.strptime(d, "%Y-%m-%d").date()
            week_key = f"{d.isocalendar()[0]}-W{d.isocalendar()[1]:02d}"
            weekly[week_key] += amt

    income, expenses, cat_now = _aggregate(rows_now)
    prev_income, prev_expenses, cat_prev = _aggregate(rows_prev)

    def pct_change(curr: float, prev: float):
        if prev <= 0:
            return None  # undefined (no prior data)
        return round(((curr - prev) / prev) * 100, 1)

    cat_delta = {
        k: {
            "current":  round(v, 2),
            "previous": round(cat_prev.get(k, 0.0), 2),
            "pct":      pct_change(v, cat_prev.get(k, 0.0)),
        }
        for k, v in cat_now.items()
    }

    top_merchants = sorted(
        [{"name": k, "total": round(v, 2)} for k, v in merchant_totals.items()],
        key=lambda x: x["total"], reverse=True
    )[:8]

    weekly_trend = [
        {"week": k, "total": round(v, 2)}
        for k, v in sorted(weekly.items())
    ]

    return {
        "category_breakdown": {k: round(v, 2) for k, v in cat_now.items()},
        "category_deltas":    cat_delta,
        "top_merchants":      top_merchants,
        "weekly_trend":       weekly_trend,
        "total_income":       round(income, 2),
        "total_expenses":     round(expenses, 2),
        "previous_period": {
            "start":    str(prev_s),
            "end":      str(prev_e),
            "income":   round(prev_income, 2),
            "expenses": round(prev_expenses, 2),
        },
        "deltas": {
            "income_pct":   pct_change(income, prev_income),
            "expenses_pct": pct_change(expenses, prev_expenses),
            "net_pct":      pct_change(income - expenses, prev_income - prev_expenses),
        },
    }

@app.get("/net-worth")
def net_worth(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        row = conn.execute(text("""
            SELECT
              SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_income,
              SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_expenses
            FROM transactions WHERE user_id=:uid
        """), {"uid": uid}).fetchone()
    income   = float(row[0] or 0)
    expenses = float(row[1] or 0)
    return {"net_worth": round(income - expenses, 2), "total_assets": round(income, 2), "total_liabilities": round(expenses, 2)}

@app.get("/anomalies")
def anomalies(
    start_date: str = Query(...),
    end_date:   str = Query(...),
    user: dict = Depends(get_current_user)
):
    uid = user["user_id"]
    cutoff = (datetime.strptime(end_date, "%Y-%m-%d") - timedelta(days=14)).strftime("%Y-%m-%d")
    week_start = (datetime.strptime(end_date, "%Y-%m-%d") - timedelta(days=7)).strftime("%Y-%m-%d")

    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT category, amount, DATE(timestamp) as date
            FROM transactions
            WHERE user_id=:uid AND amount>0 AND timestamp BETWEEN :s AND :e
        """), {"uid": uid, "s": cutoff, "e": end_date + " 23:59:59"}).mappings().all()

    this_week: dict = defaultdict(float)
    prev_week: dict = defaultdict(float)
    for r in rows:
        d = str(r["date"])
        if d >= week_start:
            this_week[r["category"]] += float(r["amount"])
        else:
            prev_week[r["category"]] += float(r["amount"])

    result = []
    for cat, amt in this_week.items():
        prev = prev_week.get(cat, 0)
        if prev > 0 and amt > 2 * prev:
            result.append({
                "category": cat,
                "this_week": round(amt, 2),
                "previous_avg": round(prev, 2),
                "ratio": round(amt / prev, 1),
                "date": end_date
            })
    return result

# ── Budget ────────────────────────────────────────────────────────────────────
@app.post("/budget")
def set_budget(req: BudgetCreate, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        conn.execute(text("""
            INSERT INTO budgets (user_id, category, monthly_limit, month, year)
            VALUES (:uid, :cat, :lim, :m, :y)
            ON CONFLICT (user_id, category, month, year) DO UPDATE SET monthly_limit=:lim
        """), {"uid": uid, "cat": req.category, "lim": req.amount, "m": req.month, "y": req.year})
        conn.commit()
    return {"message": f"Budget set for {req.category}"}

@app.get("/budget/status")
def budget_status(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    today = date.today()
    m, y = today.month, today.year
    month_start = f"{y}-{m:02d}-01"
    month_end   = f"{y}-{m:02d}-{today.day}"

    with engine.connect() as conn:
        budgets = conn.execute(text("""
            SELECT category, monthly_limit FROM budgets
            WHERE user_id=:uid AND month=:m AND year=:y
        """), {"uid": uid, "m": m, "y": y}).mappings().all()

        spending = conn.execute(text("""
            SELECT category, SUM(amount) as total FROM transactions
            WHERE user_id=:uid AND amount>0 AND timestamp BETWEEN :s AND :e
            GROUP BY category
        """), {"uid": uid, "s": month_start, "e": month_end + " 23:59:59"}).mappings().all()

    spent_map = {r["category"]: float(r["total"]) for r in spending}

    result, alerts = [], []
    for b in budgets:
        cat = b["category"]
        lim = float(b["monthly_limit"])
        spent = round(spent_map.get(cat, 0.0), 2)
        pct = round((spent / lim) * 100, 1) if lim > 0 else 0
        entry = {"category": cat, "limit": lim, "spent": spent,
                 "remaining": round(lim - spent, 2), "percent_used": pct, "alert": pct >= 80}
        result.append(entry)
        if pct >= 80:
            alerts.append({"category": cat, "percent_used": pct})

    return {"budgets": result, "alerts": alerts}

@app.get("/budget/optimizer")
def budget_optimizer(
    income: float = Query(...),
    expenses: float = Query(...),
    user: dict = Depends(get_current_user)
):
    uid = user["user_id"]
    cutoff = date.today() - timedelta(days=90)
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT category, AVG(monthly_total) as avg_spend FROM (
                SELECT category,
                       DATE_TRUNC('month', timestamp) as month,
                       SUM(amount) as monthly_total
                FROM transactions
                WHERE user_id=:uid AND amount>0 AND timestamp>=:c
                GROUP BY category, DATE_TRUNC('month', timestamp)
            ) sub GROUP BY category ORDER BY avg_spend DESC
        """), {"uid": uid, "c": cutoff}).mappings().all()

    suggestions = []
    total_savings = 0.0
    for r in rows:
        avg = float(r["avg_spend"])
        suggested = round(avg * 0.8, 2)
        saving = round(avg - suggested, 2)
        suggestions.append({
            "category": r["category"],
            "current_monthly": round(avg, 2),
            "suggested_budget": suggested,
            "monthly_savings": saving,
            "yearly_savings": round(saving * 12, 2)
        })
        total_savings += saving

    return {
        "suggestions": suggestions[:8],
        "total_monthly_savings": round(total_savings, 2),
        "total_yearly_savings": round(total_savings * 12, 2)
    }

# ── Savings Goals ─────────────────────────────────────────────────────────────
@app.get("/savings-goals")
def list_goals(user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT id, goal_name as name, target_amount, current_saved as current_amount,
                   deadline, created_at
            FROM savings_goals WHERE user_id=:uid ORDER BY deadline
        """), {"uid": uid}).mappings().all()
    result = []
    for r in rows:
        target = float(r["target_amount"])
        current = float(r["current_amount"])
        days_left = (r["deadline"] - date.today()).days if r["deadline"] else 365
        result.append({
            "id": r["id"],
            "name": r["name"],
            "target_amount": target,
            "current_amount": current,
            "deadline": str(r["deadline"]),
            "percent_complete": round((current / target) * 100, 1) if target > 0 else 0,
            "remaining": round(target - current, 2),
            "days_left": days_left,
            "needed_per_month": round(max((target - current) / max(days_left / 30, 1), 0), 2)
        })
    return result

@app.post("/savings-goals")
def create_goal(req: GoalCreate, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    with engine.connect() as conn:
        result = conn.execute(text("""
            INSERT INTO savings_goals (user_id, goal_name, target_amount, current_saved, deadline)
            VALUES (:uid, :name, :target, :current, :deadline) RETURNING id
        """), {"uid": uid, "name": req.name, "target": req.target_amount,
               "current": req.current_amount, "deadline": req.deadline})
        new_id = result.fetchone()[0]
        conn.commit()
    return {"id": new_id, "name": req.name, "target_amount": req.target_amount,
            "current_amount": req.current_amount, "deadline": req.deadline}

# ── Reports ───────────────────────────────────────────────────────────────────
@app.get("/reports/monthly")
def monthly_report(month: int = Query(...), year: int = Query(...), user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    month_start = f"{year}-{month:02d}-01"
    if month == 12:
        month_end = f"{year+1}-01-01"
    else:
        month_end = f"{year}-{month+1:02d}-01"

    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT amount, category, description, DATE(timestamp) as date
            FROM transactions
            WHERE user_id=:uid AND timestamp>=:s AND timestamp<:e
        """), {"uid": uid, "s": month_start, "e": month_end}).mappings().all()

    cat_totals: dict = defaultdict(float)
    merchant_totals: dict = defaultdict(float)
    total_income = total_expenses = 0.0

    for r in rows:
        amt = float(r["amount"])
        if amt < 0:
            total_income += abs(amt)
        else:
            total_expenses += amt
            cat_totals[r["category"]] += amt
            merchant_totals[r["description"]] += amt

    savings = total_income - total_expenses
    savings_rate = (savings / total_income * 100) if total_income > 0 else 0

    return {
        "month": month, "year": year,
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "savings": round(savings, 2),
        "savings_rate": round(savings_rate, 1),
        "category_breakdown": {k: round(v, 2) for k, v in sorted(cat_totals.items(), key=lambda x: x[1], reverse=True)},
        "top_merchants": sorted(
            [{"name": k, "total": round(v, 2)} for k, v in merchant_totals.items()],
            key=lambda x: x["total"], reverse=True
        )[:10]
    }

@app.get("/reports/export")
def export_csv(
    start_date: str = Query(...),
    end_date:   str = Query(...),
    user: dict = Depends(get_current_user)
):
    uid = user["user_id"]
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT amount, category, description, DATE(timestamp) as date
            FROM transactions
            WHERE user_id=:uid AND timestamp BETWEEN :s AND :e
            ORDER BY timestamp DESC
        """), {"uid": uid, "s": start_date, "e": end_date + " 23:59:59"}).mappings().all()

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Date", "Description", "Category", "Amount"])
    for r in rows:
        writer.writerow([str(r["date"]), r["description"], r["category"], r["amount"]])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=transactions_{start_date}_{end_date}.csv"}
    )

# ── Smart ─────────────────────────────────────────────────────────────────────
@app.post("/occasion-planner")
def occasion_planner(req: OccasionReq, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    cutoff = date.today() - timedelta(days=90)
    with engine.connect() as conn:
        rows = conn.execute(text("""
            SELECT category, SUM(amount)/3.0 as monthly_avg
            FROM transactions
            WHERE user_id=:uid AND amount>0 AND timestamp>=:c
            GROUP BY category ORDER BY monthly_avg DESC
        """), {"uid": uid, "c": cutoff}).mappings().all()

    monthly_total = sum(float(r["monthly_avg"]) for r in rows)
    monthly_saving_needed = req.budget / 12

    cuts = []
    for r in rows:
        avg = float(r["monthly_avg"])
        cut = round(avg * 0.2, 2)
        cuts.append({
            "category": r["category"],
            "current_monthly": round(avg, 2),
            "suggested_cut": cut,
            "new_monthly": round(avg - cut, 2)
        })

    return {
        "occasion": req.occasion,
        "budget": req.budget,
        "monthly_saving_needed": round(monthly_saving_needed, 2),
        "current_monthly_spend": round(monthly_total, 2),
        "suggested_cuts": cuts[:5],
        "plan_achievable": monthly_total * 0.2 >= monthly_saving_needed
    }
