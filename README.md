# SmartATM Dashboard

A complete, production-style ATM network management dashboard for Dhaka, Bangladesh.

- **Frontend:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Recharts · React Leaflet · TanStack Query · Axios
- **Backend:** Express.js (TypeScript) · Mongoose · Zod · JWT (httpOnly cookie) · bcrypt
- **Database:** MongoDB (Atlas or local)
- **Currency:** ৳ (BDT) · **Timezone:** Asia/Dhaka

> This repository previously contained an unrelated ATM simulator. Both `backend/` and `frontend/`
> were rebuilt in place for this dashboard (the previous source remains recoverable from git history).

## Features

- Email/password login with JWT stored in an **httpOnly cookie**; roles: `admin`, `manager`, `operator`
- Protected routes via client-side `GET /auth/me` guard + role-based sidebar menu and route guards
- Dashboard: 4 stat cards, transaction combo chart (bars + line), ATM status map with coloured
  markers, cash availability bars, recent transactions table, quick actions, top-5 ATMs chart, alerts list
- Pages: Dashboard, ATM Monitoring, Transactions, Reports, Cash Management, Alerts, Users, Settings
- Auto-refresh every 30s, loading skeletons, empty/error states, responsive layouts
- Transaction filters + pagination + CSV export, ATM CRUD, cash refills, alert acknowledgement/resolution
- Aggregation pipelines, Zod validation, helmet, CORS, rate limiting, consistent `{ success, data, message, meta }` responses

## Project structure

```
SmartATM/
├── backend/
│   ├── src/
│   │   ├── config/        # env + database
│   │   ├── models/        # User, Atm, Transaction, Alert, Maintenance, Settings
│   │   ├── middleware/    # auth, validate, error, rate limit
│   │   ├── controllers/   # auth, dashboard, atm, transaction, cash, alert, report, user, settings, maintenance
│   │   ├── routes/        # /api/v1/*
│   │   ├── validators/    # zod schemas
│   │   ├── utils/         # ApiError, asyncHandler, response, token, csv
│   │   ├── seed.ts        # database seeder
│   │   └── server.ts      # express app + bootstrap
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── login/
    │   └── (dashboard)/   # dashboard, atm-monitoring, transactions, reports,
    │                      # cash-management, alerts, users, settings
    ├── components/        # ui/ (shadcn), layout/, dashboard/, shared/, feature dialogs
    ├── hooks/             # useApi (TanStack Query), useDebounce
    ├── lib/               # api client, types, utils, navigation
    ├── .env.example
    └── package.json
```

## Prerequisites

- Node.js 18+ (tested on Node 20)
- A MongoDB connection string (MongoDB Atlas free tier works)

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env      # then edit .env with your MongoDB URI + JWT secret
npm run seed              # drops stale collections, creates 48 ATMs, 7 days of data, users, alerts
npm run dev               # http://localhost:10000
```

### Backend environment (`backend/.env`)

| Variable | Description |
| --- | --- |
| `MONGODB_URI` (or `MONGO_URI`) | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `COOKIE_NAME` | Auth cookie name (default `atm_token`) |
| `CLIENT_URL` | Frontend origin for CORS (default `http://localhost:3000`) |
| `PORT` | API port (default `10000`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Admin credentials created by the seeder |

## 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:10000
npm run dev                  # http://localhost:3000
```

Open http://localhost:3000 — you will be redirected to `/login`.

## Seeded accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@smartatm.com` | `admin123` |
| Manager | `manager@smartatm.com` | `manager123` |
| Operator | `operator@smartatm.com` | `operator123` |

Seed data: **48 ATMs in Dhaka (44 online, 4 offline)**, 7 days of transactions, cash stocks,
alerts and maintenance records.

## One login, three role-based dashboards

There is a single login page (`/login`). After signing in you are always taken to `/dashboard`,
which renders the dashboard that matches your role. Role is read from the JWT (httpOnly cookie)
via `GET /auth/me`; the same role drives the sidebar menu and the client-side route guards in
`app/(dashboard)/layout.tsx`.

| | Admin | Manager | Operator |
| --- | --- | --- | --- |
| Dashboard title | Admin Dashboard | Manager Dashboard | Operator Dashboard |
| Focus | Full network oversight | Operations & performance | Day-to-day operations |
| Stat cards | ✓ | ✓ | ✓ |
| Transaction combo chart | ✓ | ✓ | — |
| ATM status map | ✓ | ✓ | ✓ (primary) |
| Cash availability | ✓ | ✓ (primary) | ✓ |
| Recent transactions | ✓ | ✓ | ✓ |
| Top 5 ATMs chart | ✓ | ✓ | — |
| Alerts list | ✓ | ✓ | ✓ (primary) |
| Quick actions | All | No system admin | Operations only |
| Menu: ATM Monitoring / Transactions / Cash / Alerts | ✓ | ✓ | ✓ |
| Menu: Reports | ✓ | ✓ | — |
| Menu: Users | ✓ | ✓ (read/limited) | — |
| Menu: Settings | ✓ | — | — |

**Route guards (client-side, `app/(dashboard)/layout.tsx`)**

Because the auth cookie is set on the API domain (Render) while the app runs on another origin
(Vercel), the browser cannot read it from edge middleware. Protection is therefore enforced
client-side: the dashboard layout calls `GET /auth/me` and redirects to `/login` on 401.

- `GET /auth/me` returns 401 (no/expired session) → redirect to `/login`.
- `/reports`, `/users` → `admin`, `manager` only.
- `/settings` → `admin` only.
- Wrong role → redirect to `/dashboard`.

**API permissions (enforced server-side, independent of UI)**

- `authorize('admin','manager')` — create/update ATMs, cash refill/adjust, manage alerts, list users.
- `authorize('admin')` — create/update/delete users, delete ATMs, update settings.
- `authorize('admin','manager','operator')` — record transactions, acknowledge/resolve alerts, read dashboards.

The three dashboard variants are composed from the same reusable widgets in
`frontend/components/dashboard/`:

- `AdminDashboard` — stat cards, transaction chart, quick actions, ATM map, cash availability,
  recent transactions, top ATMs, alerts.
- `ManagerDashboard` — stat cards, transaction chart, top ATMs, cash availability, alerts,
  recent transactions, ATM map.
- `OperatorDashboard` — stat cards, ATM map, quick actions, alerts, cash availability,
  recent transactions.

## Useful scripts

Backend:

```bash
npm run dev        # tsx watch
npm run build      # tsc -> dist/
npm start          # run compiled server
npm run seed       # reset + seed database
npm run typecheck  # tsc --noEmit
```

Frontend:

```bash
npm run dev        # next dev
npm run build      # production build
npm start          # serve production build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

## API overview (`/api/v1`)

| Group | Endpoints |
| --- | --- |
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Dashboard | `/dashboard/summary`, `/transaction-overview`, `/atm-status-map`, `/cash-availability`, `/recent-transactions`, `/top-atms`, `/alerts` |
| ATMs | `GET /atms`, `GET /atms/:id`, `GET /atms/stats`, `POST/PUT/DELETE /atms[/:id]` |
| Transactions | `GET /transactions`, `GET /transactions/:id`, `POST /transactions`, `GET /transactions/export` (CSV) |
| Cash | `GET /cash/overview`, `GET /cash/low`, `POST /cash/:id/refill`, `POST /cash/:id/adjust` |
| Alerts | `GET /alerts`, `GET /alerts/stats`, `GET/POST/PATCH/DELETE /alerts[/:id]` |
| Reports | `GET /reports/overview?period=7d|30d|90d` |
| Users | `GET/POST/PUT/DELETE /users[/:id]` |
| Settings | `GET /settings`, `PUT /settings` |
| Maintenance | `GET/POST/PUT/DELETE /maintenance[/:id]` |

All authenticated routes require the `atm_token` cookie (or a `Bearer` token).

## Notes

- The ATM map uses OpenStreetMap tiles, which requires internet access in the browser.
- The API port is `10000` to match the frontend's `NEXT_PUBLIC_API_URL`; change both consistently if needed.
- In development the API accepts any `localhost` origin; in production set `CLIENT_URL` explicitly.
