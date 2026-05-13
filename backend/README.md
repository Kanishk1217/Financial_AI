# FinanceAI — Backend

FastAPI + PostgreSQL + Plaid sandbox.

Frontend lives in a separate repo: [finance-tracker-ui](../finance-tracker-ui).
Full deploy guide: see [`DEPLOY.md`](./DEPLOY.md).

## Local development

### Prerequisites
- Python 3.12
- PostgreSQL 14+ running locally
- A Plaid sandbox account (https://dashboard.plaid.com — free)

### Setup

```bash
# 1. Install Python deps
python -m pip install -r requirements.txt

# 2. Create the database
createdb finance_tracker     # or: psql -c "CREATE DATABASE finance_tracker;"

# 3. Set env vars (PowerShell example)
$env:DATABASE_URL     = "postgresql://postgres:YOUR_PW@localhost:5432/finance_tracker"
$env:JWT_SECRET       = "any-long-random-string"
$env:PLAID_CLIENT_ID  = "from plaid dashboard"
$env:PLAID_SECRET     = "sandbox secret from plaid dashboard"
$env:PLAID_ENV        = "sandbox"
$env:ALLOWED_ORIGINS  = "http://localhost:3000"
$env:PYTHONIOENCODING = "utf-8"

# 4. Run it
python -m uvicorn main:app --reload --port 8000
```

The schema bootstraps automatically on first boot.

### Seed demo data (optional)

```bash
python seed_data.py        # 3 months of fake transactions for the demo users
python seed_anomalies.py   # spikes that trigger Smart AI → Anomalies
```

## Environment variables

| Var | Required | Notes |
|---|---|---|
| `DATABASE_URL`     | yes (prod) | Postgres connection string |
| `JWT_SECRET`       | yes (prod) | Long random string; tokens are invalidated when this changes |
| `PLAID_CLIENT_ID`  | yes (Plaid)| From Plaid Dashboard → Team Settings → Keys |
| `PLAID_SECRET`     | yes (Plaid)| Sandbox secret (30 char hex) |
| `PLAID_ENV`        | no  | `sandbox` (default) / `development` / `production` |
| `ALLOWED_ORIGINS`  | no  | Comma-separated list. Defaults to `http://localhost:3000,http://127.0.0.1:3000` |
| `SMTP_HOST/PORT/USER/PASS` | no | If unset, password-reset emails print to console |
| `APP_URL`          | no  | Used in password-reset email links |
| `PYTHONIOENCODING` | yes (Windows) | Must be `utf-8` on Windows or uvicorn crashes on first log line |

## Endpoints (highlights)

- `POST /signup`, `POST /login`, `POST /forgot-password`, `POST /reset-password`
- `GET/PATCH/DELETE /me`, `PATCH /me/password`
- `GET/POST /transactions`, `PATCH/PUT/DELETE /transactions/{id}`
- `POST /transactions/bulk-delete`, `/bulk-tag`, `/import-csv`
- `GET /insights`, `/net-worth`, `/anomalies`, `/recurring-transactions`
- `GET/POST /budget`, `GET /budget/status`, `GET /budget/optimizer`
- `GET/POST /savings-goals`
- `GET /reports/monthly`, `/reports/export`
- `POST /plaid/link-token`, `/plaid/exchange-token`, `/plaid/sync`
- `GET /plaid/status`, `/plaid/accounts`, `DELETE /plaid/disconnect`

Full OpenAPI docs at `http://localhost:8000/docs` when the server is running.
