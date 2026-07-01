# Delivery Reporter

Enterprise daily delivery reporting tool. Analysts log requirements/deliveries per LOB per day,
generate a branded PNG "ledger" report, and share it to the LOB Head over WhatsApp via a
pre-filled `wa.me` link (no paid WhatsApp Business API required for v1).

## Stack
- **Backend:** Node.js, Express, PostgreSQL, Prisma ORM, JWT auth, `@napi-rs/canvas` for
  server-side PNG rendering (no native build tools needed — ships prebuilt binaries).
- **Frontend:** React 18, Vite, React Router, CSS Modules, Axios.
- **Roles:** `SUPER_ADMIN` (manages LOBs/users, sees everything), `ANALYST` (logs entries and
  generates/shares the report). The LOB Head has no login — they receive the report as an image
  over WhatsApp.

## Local setup

```bash
# 1. Postgres
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env       # edit if your DB/JWT settings differ
npm install
npx prisma migrate dev --name init
npm run seed                # creates demo LOB + 3 demo users, password: password123
npm run dev                 # http://localhost:4000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

Demo logins (all password `password123`):
- `admin@deliveryreporter.com` — Super Admin
- `analyst@deliveryreporter.com` — Analyst (Auto LOB)

## How the workflow runs
1. Analyst signs in, picks the date (defaults to today), logs requirements received and
   deliveries completed against their LOB.
2. Clicking **Generate report** calls `POST /api/reports/generate`, which:
   - aggregates that day's requirements/deliveries for the LOB,
   - renders the branded PNG via `backend/src/lib/renderReport.js`,
   - saves it to `backend/src/uploads/` and serves it at `/reports/<file>.png`,
   - builds a `wa.me` deep link pre-filled with the summary text + image link, using the
     LOB's `headPhone` (set by an admin in the Admin Console).
3. **Share on WhatsApp** opens that link — the analyst hits send from their own WhatsApp
   Web/App. **Download PNG** saves the image directly. The LOB Head never signs in — they just
   receive the image over WhatsApp.

## Upgrading WhatsApp delivery later
Swapping to direct server-side sending (no manual "hit send" step) means adding either:
- **Meta WhatsApp Cloud API** — official, needs a verified Meta Business account and
  pre-approved message templates for the image.
- **Twilio WhatsApp API** — faster to provision, per-message cost, sandbox available
  immediately for testing.

Either drops into `backend/src/routes/reports.js` — after the PNG is rendered, call the
provider's send endpoint with `imageUrl` instead of only returning the `wa.me` link.

## Project layout
```
backend/
  prisma/schema.prisma     User, LOB, Requirement, Delivery, DailyReport
  src/
    routes/                auth, lobs+users, entries (requirements/deliveries), reports
    lib/renderReport.js    server-side PNG renderer ("Daily Delivery Ledger" design)
    middleware/auth.js     JWT verification + role guard
frontend/
  src/
    pages/                 Login, AnalystDashboard, AdminConsole
    components/            TopBar, MetricStrip, EntryPanel, ReportPanel
    styles/                shared design tokens + dashboard layout
```

## Notes
- `npx prisma generate` / `migrate` needs normal internet access to Prisma's binary mirror —
  this only fails inside network-restricted sandboxes, not on a normal dev machine or server.
- Multi-LOB is supported end to end: Super Admin creates LOBs and assigns each LOB Head's
  WhatsApp number once in the Admin Console; every Analyst is scoped to one LOB via their
  user record.
