# Steel Manufacturing Management System

A full-stack MERN application for steel plant operations — production scheduling, furnace monitoring, raw material tracking, and quality inspection.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js · Express.js · Mongoose |
| Frontend | React 18 · Vite · Pure CSS |
| Database | MongoDB (local) / MongoDB Atlas (production) |

---

## Local Development

### 1. Install dependencies

```bash
# From project root
npm install --prefix backend
npm install --prefix frontend
```

### 2. Configure environment

```bash
# backend/.env (already present)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/steel_db
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running locally, then:

```bash
# Seed sample data (one-time)
node backend/seed.js
```

### 4. Run development servers

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend && node server.js

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open → `http://localhost:5173`

---

## Production Deployment

### Strategy: Single server (backend serves frontend build)

In production, the backend statically serves the compiled React app from `frontend/dist/`. Only **one server** is needed.

```
Browser → Render/Railway → Express (port 10000)
                               ├── /api/*   → MongoDB Atlas
                               └── /*       → frontend/dist/index.html
```

---

## Deploy to Render.com (recommended — free tier)

### Step 1 — MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user (username + password)
3. Whitelist `0.0.0.0/0` in Network Access
4. Copy the **Connection String** (`mongodb+srv://...`)

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/<your-user>/steel-mms.git
git push -u origin main
```

### Step 3 — Create Web Service on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Render auto-detects `render.yaml` — click **Apply**
4. Add environment variables in the Render dashboard:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGO_URI` | your Atlas connection string |
| `PORT` | `10000` |

5. Click **Deploy** — Render runs:
   ```
   npm install --prefix backend
   npm install --prefix frontend
   npm run build --prefix frontend
   NODE_ENV=production node backend/server.js
   ```

Your app will be live at `https://steel-mms.onrender.com`

---

## Deploy to Railway.app (alternative)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub**
3. Add variables: `NODE_ENV=production`, `MONGO_URI=<atlas-uri>`
4. Set **Start Command**: `NODE_ENV=production node backend/server.js`
5. Set **Build Command**: `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Dev value | Production value |
|---|---|---|
| `PORT` | `5000` | Set by host (e.g. `10000`) |
| `NODE_ENV` | _(unset)_ | `production` |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/steel_db` | Atlas URI |
| `CLIENT_URL` | `http://localhost:5173` | _(optional, your domain)_ |

### Frontend (`frontend/.env` / `.env.production`)

| Variable | Dev value | Production value |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | `/api` (relative — same origin) |

---

## Available Scripts

```bash
# From project root
npm run install:all   # Install all dependencies
npm run build         # Build the frontend
npm run start         # Start production server
npm run seed          # Seed sample data
npm run dev:backend   # Start backend with nodemon
npm run dev:frontend  # Start Vite dev server
```
