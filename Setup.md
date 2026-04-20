# Setup Guide — CareerConnect Job Portal

---

## Part 1: Local Development Setup

### Prerequisites

| Tool | Version | How to get it |
|------|---------|---------------|
| **Node.js** | v20+ (recommended v22) | [nodejs.org](https://nodejs.org) or use `nvm install 20` |
| **npm** | Comes with Node.js | — |
| **MongoDB Atlas** account | Free tier works | [mongodb.com/atlas](https://www.mongodb.com/atlas) |
| **Cloudinary** account | Free tier works | [cloudinary.com](https://cloudinary.com) |
| **OpenRouter** API key | For AI features | [openrouter.ai](https://openrouter.ai) |

### Step 1 — Clone the repo

```bash
git clone https://github.com/prafulthe85/JOB-Portal.git
cd JOB-Portal
```

### Step 2 — Backend setup

```bash
cd backend
npm install
```

Create the config file:

```bash
mkdir -p config
cp .env.example config/config.env
```

Now open `backend/config/config.env` and fill in your values:

```env
PORT=4000
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
FRONTEND_URL=http://localhost:5173
DB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
JWT_SECRET_KEY=<any-random-secret-string>
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
OPEN_ROUTER_KEY=sk-or-v1-<your-openrouter-api-key>
```

**Where to get each value:**

| Variable | Where |
|----------|-------|
| `CLOUDINARY_*` | Cloudinary Dashboard → Settings → API Keys |
| `DB_URL` | MongoDB Atlas → Cluster → Connect → Drivers → Connection string |
| `JWT_SECRET_KEY` | Any random string (e.g. `mysecretkey123`) |
| `OPEN_ROUTER_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) → Create Key |

Start the backend:

```bash
npm run dev
```

You should see:
```
Server running at port 4000
MongoDB Connected Successfully !
```

### Step 3 — Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create the env file:

```bash
cp .env.example .env
```

Open `frontend/.env` and fill in:

```env
VITE_SERVER_URL=http://127.0.0.1:4000
VITE_OPEN_ROUTER_KEY=<your-openrouter-api-key>
```

> **Important:** Use `127.0.0.1` not `localhost` for `VITE_SERVER_URL` to avoid CORS cookie issues.

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Step 4 — Verify everything works

1. Register a new account or use demo credentials
2. Try posting a job (tests Cloudinary + MongoDB)
3. Try "Generate with AI" on Post Job page (tests OpenRouter)
4. Try "Check Content Score" on a blog (tests OpenRouter)

---

## Part 2: Deploy to Render (Backend) + Netlify (Frontend)

### A. Deploy Backend to Render

1. **Push code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "ready for deployment"
   git push origin main
   ```

2. **Go to [render.com](https://render.com)** → New → Web Service

3. **Connect your GitHub repo** and select the repository

4. **Configure the service:**

   | Setting | Value |
   |---------|-------|
   | **Name** | `job-portal-backend` (or anything) |
   | **Root Directory** | `backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Node Version** | `20` (set in Environment or `.nvmrc`) |

5. **Add Environment Variables** (in Render dashboard → Environment):

   ```
   PORT                 = 4000
   CLOUDINARY_API_KEY   = <your-value>
   CLOUDINARY_API_SECRET = <your-value>
   CLOUDINARY_CLOUD_NAME = <your-value>
   FRONTEND_URL         = https://<your-netlify-app>.netlify.app
   DB_URL               = mongodb+srv://<your-atlas-connection-string>
   JWT_SECRET_KEY       = <your-secret>
   JWT_EXPIRE           = 7d
   COOKIE_EXPIRE        = 7
   OPEN_ROUTER_KEY      = sk-or-v1-<your-key>
   NODE_VERSION         = 20
   ```

   > **FRONTEND_URL** must match your Netlify URL exactly (no trailing slash).

6. **Click Deploy** — wait for it to go live. Note the URL (e.g. `https://job-portal-backend-xxxx.onrender.com`).

7. **Important:** Render free tier spins down after inactivity. Set up a cron job at [cron-job.org](https://console.cron-job.org) to ping `https://<your-render-url>/health` every 14 minutes to keep it alive.

### B. Deploy Frontend to Netlify

1. **Go to [netlify.com](https://app.netlify.com)** → Add new site → Import from Git

2. **Connect your GitHub repo**

3. **Configure build settings:**

   | Setting | Value |
   |---------|-------|
   | **Base directory** | `frontend` |
   | **Build command** | `npm run build` |
   | **Publish directory** | `frontend/dist` |

4. **Add Environment Variables** (Site settings → Environment variables):

   ```
   VITE_SERVER_URL      = https://<your-render-backend-url>
   VITE_OPEN_ROUTER_KEY = sk-or-v1-<your-key>
   ```

   > Replace `<your-render-backend-url>` with the actual Render URL from step A.6.

5. **Click Deploy site** — Netlify builds and deploys automatically.

6. **Fix client-side routing:** Create a `frontend/public/_redirects` file (if it doesn't exist):
   ```
   /*    /index.html   200
   ```
   This ensures React Router works on Netlify (otherwise refreshing any page gives a 404).

7. **Update Render's `FRONTEND_URL`** to match the Netlify URL:
   - Go to Render dashboard → your service → Environment
   - Set `FRONTEND_URL` = `https://<your-site-name>.netlify.app`
   - Redeploy the backend

### C. Update CORS for production

In `backend/app.js`, the allowed origins array should include your Netlify URL. It currently has:

```js
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
```

Since `FRONTEND_URL` is set to your Netlify URL in Render's env vars, this already works. No code change needed.

---

## Quick Reference: All Environment Variables

### Backend (`backend/config/config.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `646565459351871` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `G7m-xxxxx` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dpdn1bb2v` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` (local) or `https://yoursite.netlify.app` (prod) |
| `DB_URL` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET_KEY` | JWT signing secret | Any random string |
| `JWT_EXPIRE` | JWT token expiry | `7d` |
| `COOKIE_EXPIRE` | Cookie expiry in days | `7` |
| `OPEN_ROUTER_KEY` | OpenRouter API key for AI | `sk-or-v1-...` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend API base URL | `http://127.0.0.1:4000` (local) or `https://yourbackend.onrender.com` (prod) |
| `VITE_OPEN_ROUTER_KEY` | OpenRouter API key (unused in frontend currently, kept for reference) | `sk-or-v1-...` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| **CORS errors in browser** | Make sure `FRONTEND_URL` in backend env matches the exact frontend origin (including `https://`) |
| **Login works but redirects back to login** | Use `127.0.0.1` instead of `localhost` in `VITE_SERVER_URL` for local dev |
| **AI features not working** | Check `OPEN_ROUTER_KEY` is set in **backend** `config/config.env`. Restart the backend server after changing env. |
| **"ReadableStream is not defined"** | Use Node.js v20+. Run `node -v` to check. Use `nvm use 20` if needed. |
| **Port already in use** | Run `lsof -ti :4000 \| xargs kill -9` to free port 4000 |
| **Render backend sleeping** | Set up a cron job to ping `/health` endpoint every 14 min |
| **404 on Netlify page refresh** | Add `frontend/public/_redirects` file with `/*  /index.html  200` |
