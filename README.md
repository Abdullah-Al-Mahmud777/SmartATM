# SmartBank

A customer-only online banking application built with Next.js, Express and MongoDB Atlas.

SmartBank is being delivered in phases. **Phase 1 is complete**: Atlas-backed data, secure
authentication, account dashboard, transaction history and downloadable statements.

**Phase 2 is complete**: customer deposits, pending withdrawals with a cancellation window,
automatic withdrawal completion, own-account transfers, idempotent money movements, transaction
status filters and the dashboard money-action UI.

There is no administrator portal. Every user has the same customer role, and every API route is
scoped to the signed-in customer's own accounts.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI primitives,
  TanStack Query, Axios, React Hook Form, Zod
- **Backend:** Express 4, TypeScript, Mongoose 8, Zod, JWT in httpOnly cookies, bcrypt, Helmet,
  express-rate-limit, node-cron, PDFKit, ExcelJS
- **Database:** MongoDB Atlas only (`bank_dev` for development, `bank_test` for tests)
- **Currency:** BDT (`৳`), stored as integer paisa
- **Timezone:** Asia/Dhaka for display

## Phase 1 features

- Self-service registration with User ID, email, mobile, date of birth, password, transaction PIN
  and security question; a new zero-balance savings account is created automatically
- Login with User ID or email, account lockout after 5 failed attempts
- Short-lived access token plus rotating refresh token, both in httpOnly cookies
- CSRF double-submit protection on every state-changing request
- Password recovery with a hashed security question answer
- Login history, audit log and new-device notification
- Customer dashboard: total balance, monthly inflow/outflow, unread alerts, recent activity
- Multiple accounts with a per-account activity view
- Transaction search, type/direction/date/amount filters and pagination
- PDF and Excel statement downloads
- In-app notification menu with read tracking
- Responsive customer portal and automatic sign-out after 10 minutes of inactivity

## Phase 2 backend features

- Main-account balance endpoint with available balance, daily withdrawal usage and configured limits
- Customer deposits credited immediately with a generated reference and in-app notification
- Withdrawals debited immediately and held as pending for a configurable 2-minute cancellation window
- Atomic customer cancellation that restores the balance and prevents double cancellation
- Instant own-account transfers with matched debit/credit ledger entries and a transaction PIN
- Customer money exchange from BDT into a foreign currency (USD/EUR/GBP) at a configured bank rate
- `node-cron` worker that completes withdrawals after the cancellation window expires
- Required `Idempotency-Key` header for deposit, withdrawal, transfer, exchange and cancellation requests
- Idempotency records with request hashing, replay protection and a 7-day TTL
- Transaction status filter (`completed`, `pending`, `cancelled`, `failed`) in addition to type,
  direction, date, amount and text filters
- Configurable deposit/withdrawal minimums and maximums plus a daily withdrawal limit
- All balance changes run inside MongoDB transactions; cancellations restored atomically

Not yet part of the product: external-bank transfers, bill payments, cards, loans, FDR/DPS,
beneficiaries, support tickets and profile editing. Their schemas and demo seed records exist for
later phases.

## Repository layout

```
SmartATM/
├── backend/
│   ├── src/
│   │   ├── config/          # environment validation
│   │   ├── db/              # Atlas connection and demo seed
│   │   ├── jobs/            # pending withdrawal completion cron
│   │   ├── middleware/      # auth, CSRF, rate limits, validation, errors
│   │   ├── models/          # all Mongoose collections and indexes
│   │   ├── modules/         # auth, banking, dashboard, accounts, transactions, notifications
│   │   ├── utils/           # cookies, security, idempotency, serializers, audit
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── app/
    │   ├── (auth)/          # login, register, forgot password
    │   └── (portal)/        # dashboard, accounts, transactions
    ├── components/
    │   ├── auth/
    │   ├── portal/
    │   └── ui/
    ├── lib/                 # API client, hooks, types, formatting
    ├── .env.example
    └── package.json
```

## Prerequisites

- Node.js 20 or newer
- A MongoDB Atlas cluster
  - Create a free cluster at <https://www.mongodb.com/cloud/atlas>
  - Add your IP under **Network Access**
  - Create a database user
  - Copy the `mongodb+srv://...` connection string

No local MongoDB, Docker database, PostgreSQL, Prisma, Redis or SQLite is used or required.

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```dotenv
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/?retryWrites=true&w=majority
MONGODB_DB_NAME=bank_dev
JWT_SECRET=<openssl rand -hex 48>
JWT_REFRESH_SECRET=<openssl rand -hex 48>
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000
COOKIE_SAME_SITE=lax
COOKIE_SECURE=false
BCRYPT_ROUNDS=12
DEPOSIT_MIN_PAISA=1000
DEPOSIT_MAX_PAISA=50000000
WITHDRAW_MIN_PAISA=1000
WITHDRAW_MAX_PAISA=10000000
WITHDRAW_DAILY_LIMIT_PAISA=5000000
TRANSFER_MIN_PAISA=1000
TRANSFER_MAX_PAISA=10000000
WITHDRAW_CANCEL_WINDOW_SECONDS=120
PENDING_WITHDRAWAL_CRON=*/15 * * * * *
```

Amounts are in paisa (`1000` = `৳10.00`). The cron expression runs every 15 seconds by default.

Seed the demo data and start the API:

```bash
npm run seed
npm run dev
```

API: <http://localhost:4000/api/v1> · Health: <http://localhost:4000/api/v1/health>

`npm run seed` **deletes all documents** in the application collections before inserting fresh
demo data. Use it only with the development database.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

`frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

Open <http://localhost:3000>. You will be redirected to `/login`.

### Production cookies

For a cross-site deployment (frontend and API on different domains), set:

```dotenv
COOKIE_SAME_SITE=none
COOKIE_SECURE=true
CLIENT_URL=https://your-frontend-domain
```

## Demo access

All demo users share the same password, transaction PIN and security answer.

| User ID | Email | Name |
| --- | --- | --- |
| `rahim` | `rahim@example.com` | Rahim Ahmed |
| `nusrat` | `nusrat@example.com` | Nusrat Jahan |
| `karim` | `karim@example.com` | Karim Hossain |

- Password: `Demo@1234`
- Transaction PIN: `123456`
- Security answer: `khan`

The seed includes transactions from the last 7 days. Rahim has one pending withdrawal that can be
cancelled, and Nusrat has one already-cancelled withdrawal for status-filter testing.

The login page includes a **Fill demo credentials** shortcut for `rahim`.

Registration is self-service. Open `/register`, enter your details and choose a User ID, and
SmartBank creates a new savings account with a BDT 0.00 opening balance. Sign in with the new
User ID afterwards. No OTP, email or SMS verification is required.

Password recovery demo: account `1001000101` (Rahim's savings account), date of birth
`1990-01-15`, security answer `khan`.

## API

Base URL: `/api/v1`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API and database health (`{ "status": "ok", "db": "connected" }`) |
| `GET` | `/auth/csrf` | Issue CSRF cookie/token |
| `GET` | `/auth/session` | Lightweight public session-status check |
| `GET` | `/auth/security-questions` | List active recovery questions |
| `POST` | `/auth/register` | Create a customer and zero-balance account |
| `POST` | `/auth/login` | Sign in |
| `POST` | `/auth/refresh` | Rotate refresh token |
| `POST` | `/auth/logout` | Revoke session |
| `GET` | `/auth/me` | Current customer and accounts |
| `GET` | `/auth/recovery/question` | Resolve recovery question by account + DOB |
| `POST` | `/auth/recovery/reset` | Reset password with security answer |
| `GET` | `/balance` | Main-account balance, available balance and limits |
| `GET` | `/exchange/rates` | List available foreign exchange rates |
| `POST` | `/deposit` | Credit the main account |
| `POST` | `/withdraw` | Debit the main account into a pending withdrawal |
| `POST` | `/transfer` | Transfer between two owned active accounts |
| `POST` | `/exchange` | Exchange BDT into a foreign currency |
| `POST` | `/transactions/:id/cancel` | Cancel an owned pending withdrawal |
| `GET` | `/dashboard` | Balances, monthly summary, recent activity |
| `GET` | `/accounts` | Customer accounts |
| `GET` | `/accounts/:id` | One owned account |
| `GET` | `/accounts/:id/transactions` | Account transactions |
| `GET` | `/accounts/:id/statement?format=pdf\|xlsx` | Download statement |
| `GET` | `/transactions` | Search/filter transactions across accounts |
| `GET` | `/notifications` | List notifications |
| `POST` | `/notifications/:id/read` | Mark one read |
| `POST` | `/notifications/read-all` | Mark all read |

All protected routes require the access cookie. State-changing requests must include the
`X-CSRF-Token` header matching the `bank_csrf` cookie.

`POST /deposit`, `POST /withdraw`, `POST /transfer`, `POST /exchange` and
`POST /transactions/:id/cancel` also require an `Idempotency-Key` header with 8-120 letters, numbers, dots, colons, underscores or hyphens. Reusing
the same key with the same body returns the original response and sets `Idempotent-Replayed: true`.
Reusing the key with a different body returns `409 IDEMPOTENCY_CONFLICT`.

### Example: sign in

```bash
curl -c cookies.txt http://localhost:4000/api/v1/auth/csrf
CSRF=$(awk '$6=="bank_csrf"{print $7}' cookies.txt)

curl -b cookies.txt -c cookies.txt \
  -H 'Content-Type: application/json' \
  -H "X-CSRF-Token: $CSRF" \
  -H 'Origin: http://localhost:3000' \
  -d '{"identifier":"rahim","password":"Demo@1234"}' \
  http://localhost:4000/api/v1/auth/login
```

## Security model

- Access tokens are short-lived and never exposed to JavaScript.
- Refresh tokens are hashed in MongoDB and rotated on every refresh.
- CSRF uses a signed double-submit cookie and is required for `POST`, `PUT`, `PATCH` and `DELETE`.
- Passwords use bcrypt with a configurable cost; PINs and security answers are hashed.
- Five failed logins lock the account for 15 minutes.
- Rate limits apply to login, registration, password recovery, money operations, PIN attempts and general API traffic.
- Helmet, strict CORS allowlisting, Mongo query sanitization and Zod validation are enabled.
- Every account/transaction query is filtered by the authenticated user's ID; foreign account IDs return `403`.
- Audit logs and login history are written server-side.

## Money and data conventions

- Monetary fields end in `Paisa` and are integers, e.g. `balancePaisa: 125050` = `৳1,250.50`.
- Display conversion happens only in the frontend or statement generators.
- All money movements use MongoDB transactions and a required idempotency key.
- Pending withdrawals are completed by a `node-cron` job after their cancellation window.
- `bank_dev` and `bank_test` are separate databases in the same Atlas cluster.

## Scripts

Backend:

```bash
npm run dev        # tsx watch
npm run build      # compile to dist/
npm run start      # run compiled API
npm run seed       # reset and seed Atlas database
npm run typecheck  # tsc --noEmit
```

Frontend:

```bash
npm run dev        # Next.js dev server
npm run build      # production build
npm run start      # production server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

## Roadmap

1. **Phase 1 (complete)** - foundation, auth, dashboard, accounts, transactions, statements
2. **Phase 2 (complete)** - deposits, pending withdrawals, cancellation, own-account transfers,
   money exchange and dashboard money actions
3. Beneficiaries and external transfers
4. Cards, bills, mobile recharge, scheduled payments
5. Loans, FDR/DPS and support tickets
6. Profile, security settings and notification preferences
