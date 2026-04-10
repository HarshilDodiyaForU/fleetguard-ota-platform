# FleetGuard — OTA Command Center

Production-ready **fleet IoT + OTA** platform: live telemetry, controlled rollouts, risk signals, and JWT-secured APIs. The stack targets **Vercel** (SPA), **Render or Railway** (API + WebSockets), and **Supabase** (PostgreSQL).

---

## Project overview

FleetGuard gives operators a single place to watch device health (CPU, latency, firmware), trigger canary / rolling / immediate deployments, and review a data-informed risk panel. Field devices (e.g. **ESP32**) can push telemetry into the same pipeline the dashboard consumes in real time via **Socket.IO**.

---

## Features

| Area | Capability |
|------|------------|
| **Fleet** | Search, sort, grid/list views; status, region, metrics, firmware |
| **Dashboard** | KPIs, success trend chart, distribution, live activity feed |
| **Rollout** | Strategy selection, firmware version, progress + deployment history |
| **Risk** | Score, factors (including telemetry volume), recommendations |
| **Settings** | Profile-oriented UI (password flows depend on backend policy) |
| **Realtime** | `devices:update`, `deploy:update` over Socket.IO |
| **IoT** | `POST /api/telemetry` with ingest key; auto-registers unknown `device_id` |
| **Auth** | Register / login, JWT, protected REST routes |

---

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS, React Router, Axios, Socket.IO client, Recharts, Framer Motion  
- **Backend:** Node.js, Express, Socket.IO, Helmet, express-rate-limit, morgan, bcryptjs, jsonwebtoken  
- **Database:** Supabase (PostgreSQL)  
- **Edge:** Vercel (static SPA), Render or Railway (Node + WebSocket)

---

## Architecture (text)

```
┌─────────────┐     HTTPS + JWT      ┌──────────────────┐
│   Browser   │ ───────────────────► │  Vercel (Vite)   │
│  (React)    │                      └────────┬─────────┘
└──────┬──────┘                               │
       │ Socket.IO                            │ VITE_API_BASE_URL
       │ (same API host, no /api)             ▼
       │                              ┌──────────────────┐
       └────────────────────────────►│ Render/Railway │
                                      │ Express + IO     │
                                      └────────┬─────────┘
                                               │ service role
                                               ▼
                                      ┌──────────────────┐
                                      │ Supabase (PG)    │
                                      │ users, devices,  │
                                      │ deployments,     │
                                      │ telemetry        │
                                      └──────────────────┘
        ┌─────────────┐
        │ ESP32 / GW  │ ──POST /api/telemetry + ingest key
        └─────────────┘
```

---

## Repository layout

```
fleetguard-ota-platform/
├── frontend/                 # Vite + React
├── backend/                  # Express + Socket.IO
│   ├── config/               # env, cors, supabase, errors
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/             # device, deploy, risk, telemetry, stats
│   └── data/schema.sql
├── firmware/esp32/           # Sample telemetry client
├── DEPLOYMENT.md             # Render, Railway, Vercel, env vars
└── README.md
```

---

## Setup

### Database (Supabase)

1. Create a Supabase project.  
2. Run `backend/data/schema.sql` in the SQL Editor.

### Backend

```bash
cd backend
cp .env.example .env
# Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, TELEMETRY_INGEST_KEY, FRONTEND_URL
npm install
npm run dev
```

- API base (local): `http://localhost:5000/api`  
- Health: `GET http://localhost:5000/health`

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api
npm install
npm run dev
```

App: `http://localhost:5173` — register, log in, open Dashboard / Fleet.

---

## Deployment guide

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step **Render**, **Railway**, and **Vercel** instructions, including:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`  
- `JWT_SECRET`, `FRONTEND_URL`, `TELEMETRY_INGEST_KEY`  
- `VITE_API_BASE_URL` and optional `VITE_SOCKET_URL`

---

## API documentation

### Public

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Create user (`email`, `password`) |
| `POST` | `/api/auth/login` | Returns JWT |
| `POST` | `/api/telemetry` | Ingest device metrics (header `X-FleetGuard-Telemetry-Key`) |

### JWT required (`Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/devices` | Fleet list (UI fields include `firmware`; `cpu` / `latency` may be null) |
| `GET` | `/api/stats` | Aggregated stats + time series |
| `POST` | `/api/deploy` | Body: `strategy` (canary/rolling/immediate), `firmwareVersion` or `version` (persisted). Strategy is not a DB column; it is attached to Socket.IO events for the live rollout UI. |
| `GET` | `/api/deploy/history` | Recent deployments (`version`, `status`, `progress`, timestamps) |
| `GET` | `/api/risk` | Risk report |

### Socket.IO events (client ← server)

- `devices:update` — full device array after DB refresh / telemetry  
- `deploy:update` — deployment progress payload  

---

## ESP32 integration

1. Configure `firmware/esp32/FleetGuardTelemetry/FleetGuardTelemetry.ino` (WiFi, `serverUrl`, `apiKey` = `TELEMETRY_INGEST_KEY`, `DEVICE_ID`).  
2. Flash the board; telemetry arrives every 5–10 seconds.  
3. Backend stores rows in `telemetry`, updates `devices`, emits `devices:update`.  
4. Open the dashboard (logged in) to see live fleet updates.

---

## Screenshots

_Add screenshots here (Dashboard, Fleet, Rollout, Risk) for your GitHub or portfolio._

---

## Future improvements

- Row Level Security policies per tenant in Supabase  
- Certificate pinning on ESP32 for stricter TLS  
- OTA binary upload + signed artifact pipeline  
- Audit log and role-based admin APIs  
- Device grouping and staged rollout targets from DB  

---

## Author

**Your name / team** — update this section for your repository or résumé.

---

## License

MIT (adjust as needed).
