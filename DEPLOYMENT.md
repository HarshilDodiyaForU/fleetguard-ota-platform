# FleetGuard — Production deployment

Deploy the **Node.js API** (Render or Railway) and the **Vite React app** (Vercel). Data lives in **Supabase PostgreSQL**.

---

## Prerequisites

- GitHub repository with `frontend/` and `backend/`.
- [Supabase](https://supabase.com) project — run `backend/data/schema.sql` in the SQL Editor.
- Accounts on your chosen host (Render and/or Railway, Vercel).

---

## Supabase

1. Create a project → **SQL Editor** → paste and run `backend/data/schema.sql`.
2. Copy **Project URL** and keys from **Settings → API**:
   - `SUPABASE_URL`
   - `anon` → `SUPABASE_ANON_KEY` (optional for future RLS client use)
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**server only**, never in the browser)

---

## Backend — Render

1. **New** → **Web Service** → connect the repo.
2. **Root Directory:** `backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`
5. **Environment** (minimum):

   | Variable | Notes |
   | -------- | ----- |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Service role secret |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (comma-separated for multiple origins) |
   | `TELEMETRY_INGEST_KEY` | Shared secret for `POST /api/telemetry` (ESP32 / gateways) |
   | `TELEMETRY_EMIT_MS` | Optional; default `15000` — server-side simulated jitter interval |

6. Render sets `PORT` automatically; the server binds `0.0.0.0`.

### Backend checks

- `GET https://your-service.onrender.com/` → plain text health banner  
- `GET https://your-service.onrender.com/health` → JSON  

### WebSockets (Socket.IO)

Use the **same origin** as HTTPS (no `/api`). The frontend derives the socket URL from `VITE_API_BASE_URL` or you can set `VITE_SOCKET_URL` explicitly.

---

## Backend — Railway

1. **New Project** → **Deploy from GitHub** → select the repo.  
2. Set **Root Directory** to `backend`.  
3. **Variables:** same table as Render (including `TELEMETRY_INGEST_KEY`).  
4. **Start command:** `npm start`  

See also historical notes in this file — behavior matches Render.

---

## Frontend — Vercel

1. **Add New Project** → import repo.  
2. **Root Directory:** `frontend`  
3. **Framework:** Vite  
4. **Environment variables:**

   | Variable | Example |
   | -------- | ------- |
   | `VITE_API_BASE_URL` | `https://your-api.onrender.com/api` |
   | `VITE_SOCKET_URL` | Optional: `https://your-api.onrender.com` (no `/api`) |

   Legacy: `VITE_API_URL` still works if `VITE_API_BASE_URL` is unset.

5. Deploy. `vercel.json` rewrites all routes to `index.html` for the SPA.

### Local `.env`

Copy `frontend/.env.example` → `.env`.

---

## Telemetry ingest (ESP32)

1. Set `TELEMETRY_INGEST_KEY` on the backend (required in production).  
2. Devices POST JSON to `/api/telemetry` with header:

   `X-FleetGuard-Telemetry-Key: <same value>`

3. Example sketch: `firmware/esp32/FleetGuardTelemetry/FleetGuardTelemetry.ino`

---

## Post-deploy smoke test

1. Open the Vercel URL → **Register** / **Login**.  
2. **Dashboard** loads stats and devices from Supabase.  
3. Start a **Rollout** → Socket.IO should stream `deploy:update`.  
4. (Optional) Run the ESP32 sketch → **Fleet** / **Dashboard** should update on `devices:update`.

---

## Optional: Docker (backend)

From `backend/`:

```bash
docker build -t fleetguard-api .
docker run -p 5000:5000 --env-file .env fleetguard-api
```

---

## Security checklist

- Never commit `.env`; use `.env.example` only as a template.  
- Strong `JWT_SECRET` in production; server exits if missing when `NODE_ENV=production`.  
- **Service role** only on the backend; never expose it to the SPA.  
- Set **`FRONTEND_URL`** so CORS and Socket.IO origins match your live frontend.  

---

## Troubleshooting

| Issue | What to check |
| ----- | ------------- |
| API 401 on protected routes | Logged in? Axios sends `Authorization: Bearer`. |
| CORS errors | `FRONTEND_URL` matches Vercel origin exactly (scheme + host). |
| Socket never connects | `VITE_SOCKET_URL` or derived origin has **no** `/api` path. |
| Telemetry 401/503 | `TELEMETRY_INGEST_KEY` set in production; header matches. |
| Boot crash | `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; schema applied. |
