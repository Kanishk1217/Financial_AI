# FinanceAI — Frontend

React 19 + Vite + TypeScript + Tailwind + Framer Motion.
Backend lives in a separate repo: [finance-tracker](../finance-tracker).
Full deploy guide: see the backend repo's [`DEPLOY.md`](../finance-tracker/DEPLOY.md).

## Local development

### Prerequisites
- Node 20+
- The backend running on `http://localhost:8000` (see backend README)

### Setup

```bash
npm install
npm run dev -- --port 3000
```

Open http://localhost:3000. In dev, Vite proxies `/api/*` to `http://localhost:8000`.

Demo credentials (after running the backend's `seed_data.py`):
- `kanishkpansari1217@gmail.com` / `FinanceAI@2025`
- `test@test.com` / `test123`

## Environment variables

| Var | Required | Notes |
|---|---|---|
| `VITE_API_URL` | only in prod | Full backend URL, e.g. `https://your-app.onrender.com`. In dev the Vite proxy handles it, so leave unset locally. |

In Cloudflare Pages, set this in **Settings → Environment variables** for the `Production` environment.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve dist/ locally to verify
```

## Key features

- Bento dashboard with hero net worth, MoM deltas, animated charts
- Plaid sandbox connect — real transactions imported
- Multi-bank support, transaction detail panel with notes + tags
- Bulk select, CSV import/export, command palette (`⌘K`), keyboard shortcuts
- Account settings (profile, password, data, danger zone)
- Onboarding checklist on first run
