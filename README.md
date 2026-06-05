# Financial AI

A full-stack personal finance tracker with real bank connectivity, AI-powered insights, and a premium dark UI. Connect your bank accounts via Plaid, track spending and budgets across all accounts, and get intelligent analysis of your financial health.

**Live:** https://financial-ai.pages.dev/

## Features

- **Bank integration** — connect real accounts via Plaid, supports multiple institutions simultaneously
- **Transaction tracking** — automatic Plaid sync + manual entry, full edit/delete, notes and custom tags
- **Budget management** — set monthly limits per spending category, track progress visually
- **AI insights** — spending pattern analysis, anomaly detection, personalised recommendations
- **Command palette** — Cmd+K (or Ctrl+K) for instant navigation and quick actions from anywhere
- **Keyboard shortcuts** — `g+d/a/t/b/r/s` to navigate pages, `n` for new transaction, `?` for shortcut reference
- **Multi-currency** — displays transactions in their native currency via `Intl.NumberFormat`

## Stack

### Frontend

| Technology | Role |
|-----------|------|
| React + Vite + TypeScript | SPA framework |
| Tailwind CSS v4 | Styling |
| Framer Motion | Page transitions + animated backgrounds |
| cmdk | Command palette |
| Radix UI | Accessible modals and tooltips |
| Recharts | Charts and data visualisation |
| Sonner | Toast notifications |
| canvas-confetti | Milestone celebrations |
| Lenis | Smooth scroll on landing page |

### Backend

| Technology | Role |
|-----------|------|
| FastAPI | REST API |
| PostgreSQL | Relational database |
| JWT | Authentication (bcrypt password hashing, rate limiting) |
| Plaid SDK | Bank account connectivity |

## Running locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on port 3000 and proxies `/api/*` to the backend on port 8000.

## Environment variables

```env
JWT_SECRET=your_jwt_secret_here
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
ALLOWED_ORIGINS=http://localhost:3000
```

## Project structure

```
Financial_AI/
├── frontend/    # React + Vite + TypeScript SPA
└── backend/     # FastAPI + PostgreSQL + Plaid
```
