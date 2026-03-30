# HOA Management SaaS — Project Context

## Product
- HOA management tool for self-managed HOAs in Dallas TX
- Target: volunteer board presidents, treasurers, residents
- Pricing: $39 / $89 / $169 per month

## Tech Stack
- Frontend: React + Vite + Tailwind + shadcn/ui (Slate theme)
- Backend: Go monolith (Fiber or Chi router)
- Database: PostgreSQL on EBS volume (migrate to Aurora at $5K MRR)
- Auth: JWT (15min access token) + refresh tokens (30 days)
- Payments: Stripe (subscriptions + webhooks)
- SMS: Twilio
- Email: AWS SES
- Hosting: EC2 t3.small + Nginx
- Storage: S3 for documents

## Architecture
- Monolith — no microservices until $1M ARR
- React build served as static files by Go backend
- JWT stored in httpOnly cookies
- All queries scoped by org_id for multi-tenancy

## Database
- PostgreSQL on separate EBS volume mounted at /pgdata
- Daily EBS snapshots to S3
- WAL archiving to S3 for point-in-time recovery
- golang-migrate for migrations
- SQLC for type-safe queries

## User Roles
- super_admin (you)
- board_admin
- treasurer
- board_member
- resident

## Screens (28 total, build 15 for MVP)
- Auth: Login, Forgot Password, Reset Password, Accept Invite, Onboarding
- Board Admin: Dashboard, Resident Directory, Dues Management,
  Maintenance Requests, Announcements, Documents,
  Board Members, Settings, Reports
- Resident: Dashboard, Submit Request, My Profile

## MVP Build Order
1. Auth screens
2. Board admin core (dashboard, residents, dues)
3. Communications (announcements, maintenance)
4. Resident portal
5. Super admin + reports

## Business Context
- Market: Dallas TX, 5000+ HOAs in DFW
- Sweet spot: self-managed HOAs under 150 units
- Key competitors: Buildium, PayHOA, HOA Express (all weak on small HOAs)
- Go-to-market: Nextdoor, Facebook HOA groups, CAI Texas Chapter

## Design
- Theme: shadcn/ui Slate Clean
- Philosophy: minimal, intuitive, non-flashy
- No mobile app at MVP — PWA is fine

## Legal
- Terms of Service at /terms
- Privacy Policy at /privacy
- Store terms acceptance timestamp + IP in DB
- Not legal advice disclaimer on governance features
- Not financial advice disclaimer on dues features

## Monthly Infrastructure Cost
- EC2 t3.small: $15/mo
- EBS volume (20GB gp3): $2/mo
- S3 + SES: $5/mo
- Twilio: $10/mo
- Stripe: 2.9% + $0.30 per transaction
- Total fixed: ~$32/mo


## Code Conventions
- Go: handler → service → db layer separation
- Always scope DB queries by org_id
- Never trust client input for org_id — always use JWT claims
- React: React Query for server state, no Redux
- All forms use shadcn/ui components
- Error responses always return JSON {error: "message"}
- Migrations are never destructive — always additive

## Dev setup

```bash
npm install
npm run dev        # starts Vite dev server (MSW mocks active)
npm run build
npm run lint
```

API base URL is set via `VITE_API_URL` in `.env` (default: `http://localhost:8080/api`).
All requests go through `src/lib/api.js` (Axios, `withCredentials: true`).
In development, **MSW** intercepts every request — handlers in `src/mocks/handlers.js`, data in `src/mocks/data.js`.

Test credentials (mock only):
| Email | Password | Role |
|---|---|---|
| board@test.com | password | board_admin |
| treasurer@test.com | password | treasurer |
| resident@test.com | password | resident |

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| React | 19 | UI |
| React Router | v7 | Routing |
| TanStack React Query | v5 | Data fetching & caching |
| Axios | — | HTTP client |
| React Hook Form + Zod | — | Forms & validation |
| shadcn/ui | — | Component library (Tailwind v4) |
| Tailwind CSS | v4 | Styling (via `@tailwindcss/vite`) |
| Lucide React | — | Icons |
| Sonner | — | Toast notifications |
| MSW | v2 | Mock API (dev only) |
| Geist | — | Font (`@fontsource-variable/geist`) |

Path alias: `@` → `src/`

## Project structure

```
src/
├── App.jsx                  # Router, RequireAuth, route definitions
├── main.jsx                 # Entry point (MSW boot)
├── contexts/
│   └── AuthContext.jsx      # user, loading, login(), acceptInvite(), logout()
├── lib/
│   ├── api.js               # Axios instance + 401 interceptor
│   └── utils.js             # cn() classname helper
├── pages/
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── AcceptInvite.jsx  # Step 1 of new-user flow → /onboarding
│   │   ├── Onboarding.jsx    # Multi-step post-invite wizard
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── board/
│   │   ├── Dashboard.jsx
│   │   ├── Residents.jsx     # Invite residents
│   │   ├── Dues.jsx
│   │   ├── Maintenance.jsx
│   │   ├── Announcements.jsx
│   │   ├── Documents.jsx
│   │   ├── BoardMembers.jsx  # Invite board members
│   │   ├── Settings.jsx      # HOA name, dues amount/day
│   │   └── Reports.jsx
│   └── resident/
│       ├── Dashboard.jsx
│       ├── SubmitRequest.jsx
│       └── Profile.jsx
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx     # Sidebar nav + layout wrapper
│   │   └── PageHeader.jsx   # Title + optional action button
│   └── ui/                  # shadcn components
└── mocks/
    ├── browser.js
    ├── handlers.js
    └── data.js
```

## Routing

```
Public:
  /login
  /forgot-password
  /reset-password
  /invite            → AcceptInvite (creates account, redirects to /onboarding)
  /onboarding        → RequireAuth — post-invite wizard

Board (RequireAuth, boardRoles):
  /board/dashboard | /board/residents | /board/dues | /board/maintenance
  /board/announcements | /board/documents | /board/members
  /board/settings | /board/reports

Resident (RequireAuth):
  /resident/dashboard | /resident/request | /resident/profile

/ and * → redirect /login
```

Board roles: `board_admin`, `treasurer`, `board_member`, `super_admin`

## Auth flow

1. **Login** → `AuthContext.login()` → sets user in context → dashboard
2. **Invite** → `AcceptInvite` → `AuthContext.acceptInvite()` → sets user in context → `/onboarding`
3. **Onboarding** — residents: phone number step then welcome; board: welcome only → dashboard
4. **Session check** — `AuthContext` calls `GET /auth/me` on mount
5. **401 interceptor** — on any 401 (outside public pages) → redirect `/login`

## Coding conventions

- Pages fetch data with `useQuery`, mutate with `useMutation` (React Query)
- All pages inside `AppShell` for layout; use `PageHeader` for title + action button
- Loading states use `<Skeleton>` components
- Modals via shadcn `<Dialog>` / `<AlertDialog>`
- User feedback via `toast.success()` / `toast.error()` (Sonner)
- Forms: controlled `useState` inputs for simple forms; React Hook Form + Zod for complex ones
- Invalidate queries after mutations: `queryClient.invalidateQueries({ queryKey: [...] })`
- No default exports from `lib/` — named exports only (exception: `api.js` default-exports the Axios instance)
