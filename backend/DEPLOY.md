# Deploying FinanceAI

This guide walks through a free-tier deploy:

| Piece | Service | Cost |
|---|---|---|
| Frontend (Vite static build) | **Cloudflare Pages** | $0 |
| Backend (FastAPI) | **Render** Web Service (free) | $0 |
| Database (PostgreSQL) | **Neon** | $0 |

Total: **$0/month**. Render's free Web Service spins down after 15 min of inactivity — the first request after wakes it in ~30 seconds. If that's a problem upgrade to Render's $7/mo Starter or move backend to Railway.

You'll need three accounts (free, ~2 minutes each to sign up):
- https://github.com
- https://neon.tech
- https://render.com
- https://dash.cloudflare.com

---

## 0. Push the code to GitHub

You have two folders that become two repos:

```
finance-tracker/        →  github.com/<you>/finance-tracker-backend
finance-tracker-ui/     →  github.com/<you>/finance-tracker-ui
```

Open each folder in a terminal and run:

```bash
git init
git add .
git commit -m "initial commit"
gh repo create finance-tracker-backend --public --source=. --push   # backend folder
# or for the frontend folder:
gh repo create finance-tracker-ui      --public --source=. --push
```

(Don't have `gh`? Create the repos manually on github.com → "New repository" → then `git remote add origin <url>` and `git push -u origin main`.)

Confirm before pushing: `.env`, `__pycache__/`, `node_modules/`, and `dist/` should be ignored. The `.gitignore` we shipped covers all of these.

---

## 1. Database — Neon

1. Go to https://neon.tech → **Sign up with GitHub**.
2. **Create Project**. Pick the closest region. Name it `financeai`.
3. On the project dashboard, find the **Connection string** (starts with `postgresql://...?sslmode=require`).
4. **Copy it somewhere safe — you'll paste it into Render in the next step.**

That's it. Neon gives you a free Postgres database with no expiry. The schema bootstraps automatically when the backend first connects.

---

## 2. Backend — Render

1. Go to https://render.com → **Sign up with GitHub** (or log in).
2. **New +** → **Web Service** → **Connect** your `finance-tracker-backend` repo.
3. Settings:
   - **Name**: `financeai-backend` (this becomes part of your URL)
   - **Region**: same continent as Neon if possible
   - **Branch**: `main`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance type**: Free
4. **Environment** → **Add Environment Variable**. Set each of these:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | (paste the Neon connection string from step 1) |
   | `JWT_SECRET` | Generate one: `python -c "import secrets; print(secrets.token_urlsafe(48))"` |
   | `PLAID_CLIENT_ID` | From Plaid Dashboard → Team Settings → Keys → **Client ID** |
   | `PLAID_SECRET` | From Plaid Dashboard → Team Settings → Keys → **Sandbox secret** |
   | `PLAID_ENV` | `sandbox` |
   | `ALLOWED_ORIGINS` | Leave blank for now — we'll set it after Cloudflare gives us a URL |
   | `PYTHONIOENCODING` | `utf-8` |

5. **Create Web Service**. First deploy takes ~3 minutes.
6. When it's green, your backend lives at `https://financeai-backend.onrender.com` (or whatever name you chose). Test it: open `https://<your-app>.onrender.com/docs` — you should see the FastAPI Swagger UI.

**Copy your Render URL** — you'll paste it into Cloudflare in the next step.

---

## 3. Frontend — Cloudflare Pages

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize Cloudflare to read your GitHub repos, pick `finance-tracker-ui`.
3. **Set up builds and deployments**:
   - **Production branch**: `main`
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: (leave blank)
4. **Environment variables (advanced)** → **Add variable** for **Production**:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-render-url>.onrender.com` (from step 2.6) |

5. **Save and Deploy**. First build takes ~2 minutes.
6. When it's green, you'll have a URL like `https://finance-tracker-ui-abc.pages.dev`. **Copy it.**

---

## 4. Wire CORS — back to Render

Now the backend needs to know it can accept requests from your Cloudflare domain.

1. Render → your backend service → **Environment** → edit `ALLOWED_ORIGINS`:
   ```
   https://finance-tracker-ui-abc.pages.dev,http://localhost:3000
   ```
   (Comma-separated. Keep `http://localhost:3000` so local dev still works.)
2. Render redeploys automatically when env vars change. Wait ~30 sec.

---

## 5. Smoke test

Open your Cloudflare Pages URL in a browser:

1. Click **Sign up** → create an account
2. Should redirect to Dashboard (empty, since no transactions yet)
3. Try **Accounts → Connect a Bank** → Plaid Link should open
4. Use Plaid sandbox creds: username `user_good`, password `pass_good`
5. After ~5 seconds you should see balances and transactions

If anything 500s, check Render's **Logs** tab — usually a missing env var.

---

## 6. (Optional) Custom domain

### Frontend
- Cloudflare Pages → your project → **Custom domains** → **Set up a custom domain**.
- You'll likely already own the domain on Cloudflare, so DNS auto-configures.

### Backend
- Render → your service → **Settings** → **Custom Domain** → add `api.yourdomain.com`.
- Cloudflare DNS → add a CNAME `api` → `<your-render-app>.onrender.com`.
- Update `VITE_API_URL` on Cloudflare Pages to the new `https://api.yourdomain.com`.
- Update `ALLOWED_ORIGINS` on Render to include your new frontend domain.

---

## Troubleshooting

**Frontend loads but every API call 404s**
→ `VITE_API_URL` isn't set on Cloudflare Pages, or it's missing the `https://` prefix.

**Login works locally but fails in production with CORS error**
→ Your Cloudflare URL isn't in `ALLOWED_ORIGINS` on Render. Add it (with `https://`, no trailing slash).

**Render keeps crashing on boot**
→ Check Render logs. 99% of the time it's a missing `DATABASE_URL` or a typo in the Neon connection string. The whole string must start with `postgresql://` (not `postgres://` — though our code handles that).

**First request after idle takes 30 seconds**
→ That's Render's free-tier spin-down. Either upgrade to Render Starter ($7/mo) or use Railway ($5/mo) which doesn't spin down.

**Plaid Link won't open in production**
→ Plaid requires HTTPS. Cloudflare Pages gives you HTTPS automatically, and Render's `.onrender.com` is HTTPS. If you set up custom domains, make sure both are HTTPS.

**"Database error" in Render logs on first boot**
→ The schema bootstrap needs write permission. Neon's free tier grants this by default. Double-check the connection string includes the correct database name and `?sslmode=require`.

**JWT_SECRET keeps changing → users get logged out**
→ Set `JWT_SECRET` as a real env var (not generated per-boot). Don't change it once set.

---

## Updating after deploy

Both Render and Cloudflare watch the `main` branch. Just `git push` and they redeploy automatically.

For schema changes, the `bootstrap_db()` function in `main.py` handles additive migrations (new tables, new columns) on every boot — no manual step.
