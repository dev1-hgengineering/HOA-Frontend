# HOA Management SaaS — Project Context

## How to use this

1. Create your project folder: `mkdir hoa-app && cd hoa-app`
2. Create the file: `touch CLAUDE.md`
3. Paste everything below the divider line into it
4. Run `claude` in the terminal — Claude Code reads it automatically every session

---

# HOA Management SaaS — Project Context

## Product

- HOA management tool for self-managed HOAs in Dallas TX
- Target: volunteer board presidents, treasurers, board members, and residents
- Sweet spot: self-managed HOAs under 150 units
- Pricing: $39 / $89 / $169 per month (based on unit count, not resident count)
- 60-day free trial — starts only AFTER super_admin approves the HOA

## Business Context

- Market: Dallas TX, 5,000+ HOAs in DFW metro
- Competitors: Buildium, PayHOA, HOA Express (all weak on small HOAs)
- Go-to-market: Nextdoor, Facebook HOA groups, CAI Texas Chapter
- Texas law (Property Code Ch. 209) mandates annual meetings, financial disclosures, violation notices

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + shadcn/ui (Slate theme)
- Backend: Go monolith (Fiber or Chi router)
- Database: PostgreSQL on EBS volume (migrate to Aurora at $5K MRR)
- Auth: JWT (15min access token) + refresh tokens (30 days, stored in DB)
- Payments: Stripe (subscriptions + webhooks)
- SMS: Twilio
- Email: AWS SES
- Hosting: EC2 t3.small + Nginx
- File storage: S3 for documents
- DB migrations: golang-migrate
- DB queries: SQLC (type-safe, raw SQL)

## Architecture

- Monolith — no microservices until $1M ARR
- React build served as static files by Go backend
- JWT stored in httpOnly cookies — never in localStorage
- All DB queries scoped by org_id (multi-tenancy)
- Never trust client input for org_id — always use JWT claims
- EBS volume mounted at /pgdata for PostgreSQL data
- systemd manages Go app process (auto-restarts on reboot)
- Elastic IP assigned so domain never changes on restart

---

## Units vs Residents — Core Mental Model

**This is the most important data model decision. Read carefully.**

Units are the fixed asset. Residents are temporary occupants. These are separate concepts.

```
HOA (organization)
  └── Units (fixed — 48 units never changes unless HOA expands)
        └── unit_occupancies (who lives there right now)
              └── users (optional login account for the resident)
```

- A **unit** always exists whether occupied or not
- A **resident** is whoever currently occupies that unit
- A unit can be **vacant** — no occupant assigned
- A unit can have **multiple occupants** — co-owners, couples (both get accounts)
- Moving a resident out sets `move_out_date` — never hard delete
- **Dues are tied to unit_id NOT user_id** — if vacant, board tracks manually
- **Users table NO LONGER has unit_number field** — unit assignment is in unit_occupancies
- The resident directory is **unit-first** sorted by unit number, not resident name

## Key Database Tables

```sql
-- Organizations (one per HOA)
organizations (
  id, name, subdomain, plan, unit_ceiling,
  stripe_customer_id, stripe_subscription_id, subscription_status,
  approval_status,        -- pending | approved | rejected | resubmitted
  onboarding_step,        -- 1-5, tracks where board admin left off
  onboarding_complete,    -- boolean
  trial_ends_at,          -- set when super_admin approves, not at signup
  submitted_at,           -- when board admin clicked Submit for Approval
  reviewed_at,            -- when super_admin approved or rejected
  reviewed_by,            -- super_admin user_id
  rejection_reason,       -- shown in rejection email
  created_at
)

-- Users (all roles)
users (
  id, org_id, email, password_hash, role,
  first_name, last_name, phone,
  sms_opt_in, is_active,
  invited_by, last_login_at, created_at
  -- NO unit_number field — unit assignment is in unit_occupancies
)

-- Units (fixed per HOA — never deleted, only deactivated)
units (
  id, org_id, unit_number, unit_type,
  square_footage, bedrooms, notes,
  is_active, created_at
  UNIQUE(org_id, unit_number)
)

-- Occupancies (who lives in a unit and when)
unit_occupancies (
  id, unit_id, org_id,
  user_id NULL,           -- NULL if resident has no login
  first_name, last_name, email, phone,
  occupancy_type,         -- owner | tenant | co-owner
  move_in_date,
  move_out_date NULL,     -- NULL = currently living here
  is_primary,             -- primary contact for the unit
  invite_sent_at, invite_accepted_at,
  created_at
)

-- Dues (tied to unit_id not user_id)
dues_records (
  id, org_id, unit_id, unit_number,
  amount, due_date, paid_at,
  payment_method, status,  -- pending | paid | overdue
  notes, created_at
)

-- Maintenance requests
maintenance_requests (
  id, org_id, unit_id, submitted_by,
  category, description, photo_url,
  status,                 -- open | in_progress | resolved
  assigned_to, resolution_notes,
  resolved_at, created_at
)

-- Announcements
announcements (
  id, org_id, title, body,
  send_email, send_sms,
  scheduled_at, sent_at,
  created_by, created_at
)

-- Documents
documents (
  id, org_id, title, s3_key, category,
  visible_to_residents, uploaded_by, created_at
)

-- Auth tables
refresh_tokens (id, user_id, token_hash, expires_at, created_at)
invite_tokens (id, org_id, user_id, token, role, expires_at, used_at, created_at)
reset_tokens (id, user_id, token, expires_at, used_at, created_at)
terms_acceptance (id, user_id, terms_version, accepted_at, ip_address, user_agent)
board_verifications (id, org_id, submitted_by, document_url, status, submission_number, reviewed_by, reviewed_at, notes, created_at)
```

---

## User Roles (5 total)

| Role | How they get access | Landing page after login |
| --- | --- | --- |
| super_admin | Manually seeded in DB | /admin |
| board_admin | Self-signup via /signup | /dashboard (or /onboarding if incomplete) |
| treasurer | Invited by board_admin | /dues |
| board_member | Invited by board_admin | /dashboard (read-only) |
| resident | Invited by board_admin | /portal/welcome (first time), /portal |

---

## HOA Approval Process — 3 Gates

**No HOA goes live until all 3 gates pass. This is non-negotiable.**

Gate 1: Stripe card added (required on Step 4 — cannot skip)

Gate 2: Stripe card verified (automated — blocks Step 5 if fails)

Gate 3: super_admin manual review (you review doc + Stripe status + HOA details)

Board admin flow after Step 5:

- Lands on /pending screen — NO dashboard access
- Invite emails to residents and board members are HELD — not sent until approved
- 60-day trial does NOT start until you approve
- You get email notification immediately on submission
- You approve or reject with a reason in /admin/verify
- On approval: HOA activated, trial starts, held invite emails are released
- On rejection: board admin emailed with reason, can resubmit with new document

```go
// RequireApproved middleware — add to all protected HOA routes
func RequireApproved(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        claims := r.Context().Value("claims").(*Claims)
        org, _ := db.GetOrg(r.Context(), claims.OrgID)
        if org.ApprovalStatus != "approved" {
            http.Error(w, `{"status":"pending"}`, 202)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

---

## Plan Limits — Unit-Based Billing

Plans are based on unit count, not resident count.

| Plan | Price | Unit ceiling |
| --- | --- | --- |
| starter | $39/mo | 50 units |
| growth | $89/mo | 150 units |
| pro | $169/mo | 400 units |
| enterprise | custom | unlimited |

**When board admin tries to add a unit that exceeds their plan ceiling:**

- Server returns 402 with `{"error":"plan_limit_reached"}`
- React shows upgrade modal — cannot bypass
- Upgrade handled by Stripe proration (charge difference immediately)
- Stripe webhook `customer.subscription.updated` updates org.plan in DB

**80% warning:** Send SES email when unit count hits 80% of ceiling (e.g. 40/50 units on Starter)

```go
func getPlanCeiling(plan string) int {
    switch plan {
    case "starter":  return 50
    case "growth":   return 150
    case "pro":      return 400
    default:         return 999999
    }
}
```

---

## Frontend — React Routes

```jsx
// All routes with role protection
// Public
/login                   → LoginPage
/signup                  → SignupPage (board_admin onboarding)
/forgot-password         → ForgotPasswordPage
/reset-password          → ResetPasswordPage
/invite                  → AcceptInvitePage (board_member, treasurer)
/accept                  → AcceptResidentPage (resident)
/pending                 → PendingApprovalPage (board_admin waiting for review)

// Board admin + board member
/onboarding              → OnboardingPage (board_admin only, 5-step wizard)
/dashboard               → DashboardPage (board_admin + board_member)
/units                   → UnitDirectoryPage (unit-first view, board_admin)
/units/:id               → UnitDetailPage (board_admin)
/dues                    → DuesPage (board_admin + treasurer)
/maintenance             → MaintenancePage (board_admin + board_member)
/announcements           → AnnouncementsPage (board_admin + board_member)
/documents               → DocumentsPage (board_admin + board_member + resident)
/board-members           → BoardMembersPage (board_admin)
/settings                → SettingsPage (board_admin)
/reports                 → ReportsPage (board_admin + treasurer)

// Treasurer only
/payments                → PaymentHistoryPage
/overdue                 → OverduePage

// Resident
/portal                  → ResidentPortalPage
/portal/welcome          → WelcomePage (first login only)
/portal/request          → SubmitRequestPage

// Shared
/profile                 → ProfilePage (all roles)

// Super admin
/admin                   → AdminDashboardPage
/admin/orgs              → OrgListPage
/admin/orgs/:id          → OrgDetailPage
/admin/verify            → VerificationQueuePage
/admin/billing           → BillingOverviewPage
```

## Frontend — Key Components to Build Once

- `ProtectedRoute` — wraps routes, checks role from JWT, redirects if unauthorized
- `BoardAdminRoute` — additionally checks approval_status, shows PendingApprovalPage if pending
- `PlanLimitGuard` — checks unit count vs plan ceiling before unit add, shows upgrade modal
- `Sidebar` — role-aware nav, shows correct links per role automatically
- `UnitStatusBadge` — occupied (green) / vacant (gray) / overdue (red)
- `DuesStatusBadge` — paid (green) / unpaid (amber) / overdue (red)
- `DataTable` — reusable table for units, dues, requests (same base component)
- `ConfirmModal` — reused for move-out, deactivate, send reminder
- `EmptyState` — no units yet, no requests yet, etc.
- `UpgradeModal` — shown when plan_limit_reached error returned from API

## Frontend — Unit Directory (unit-first, NOT resident-first)

The directory sorts by unit number and always shows all units including vacant ones.

```jsx
// Correct column order
Unit | Occupant(s) | Type | Dues Status | Actions

// Vacant units show clearly
103 | VACANT | — | N/A | [Add resident]

// Occupied units
101 | Jane Smith | Owner | Paid ✓ | ...
102 | Bob + Mary Johnson | Owners | Overdue | ...
```

Never sort or filter such that vacant units disappear — board needs to see all units always.

## Frontend — Onboarding Stepper (5 steps)

Progress bar + step indicator already designed. Steps:

1. HOA info (name, address, state, unit count, their name/email/password, terms checkbox)
2. Invite board members (name, email, role — can skip)
3. Add residents (CSV upload or manual — can skip)
4. Payment setup (Stripe card — REQUIRED, cannot skip, blocks Step 5 if card fails)
5. Review & submit for approval (upload HOA doc — required, click Submit not Launch)

After Step 5 → redirect to /pending (not /dashboard)

## Frontend — Post-Login Routing Logic

```jsx
function BoardAdminRoute({ children }) {
  const { org } = useCurrentOrg();

  if (org.approvalStatus === 'pending' || org.approvalStatus === 'resubmitted') {
    return <PendingApprovalScreen />;
  }
  if (org.approvalStatus === 'rejected') {
    return <RejectedScreen reason={org.rejectionReason} />;
  }
  if (!org.onboardingComplete) {
    return <Navigate to={`/onboarding?step=${org.onboardingStep}`} />;
  }
  return children;
}
```

---

## Code Conventions

- Go: handler → service → db layer separation
- Always scope DB queries by org_id from JWT claims
- Never trust client-supplied org_id — always pull from JWT
- React: React Query for server state, no Redux
- All forms use shadcn/ui components
- Error responses always return JSON `{"error": "message"}`
- Plan limit errors return 402 with `{"error": "plan_limit_reached", "ceiling": 50}`
- Migrations are never destructive — always additive
- All routes under /api are authenticated except /api/auth/*
- Use SQLC generated code for all DB queries — no raw strings in handlers
- Units are never hard deleted — only `is_active = false`
- Occupants are never hard deleted — `move_out_date` is set on move-out
- Dues records are never deleted — permanent audit trail

---

## Auth Flow

- POST /api/auth/login → verify bcrypt hash → JWT access (15min) + refresh (30d) in httpOnly cookies
- POST /api/auth/refresh → validate refresh token from DB → issue new access token
- POST /api/auth/logout → delete refresh token from DB → clear cookies
- POST /api/auth/accept-invite → validate invite token → activate user → set password
- POST /api/auth/accept-resident → same but for residents → redirect to /portal/welcome
- All protected routes → AuthMiddleware validates JWT in memory (no DB call needed)
- Role checks → RequireRole middleware reads role from JWT claims
- Approval checks → RequireApproved middleware reads org.approval_status

---

## Stripe Integration

- Use stripe-go SDK
- Webhook endpoint: POST /api/webhooks/stripe
- Handle: customer.subscription.created, updated, deleted, invoice.payment_failed
- Upgrade flow: POST /api/billing/upgrade → stripe.Subscriptions.Update with ProrationBehavior: always_invoice
- Downgrade blocked if current unit count > new plan ceiling
- Failed payment → suspend access, do NOT delete data
- Plan ceiling stored in organizations.unit_ceiling, updated via webhook

---

## Infrastructure

- EC2 t3.small (~$15/mo) running Go + Nginx
- PostgreSQL on separate EBS gp3 volume (20GB) mounted at /pgdata
- Daily EBS snapshots to S3 via AWS Data Lifecycle Manager
- WAL archiving to S3 for point-in-time recovery
- Elastic IP so domain never changes on EC2 restart
- systemd: sudo systemctl enable hoa && sudo systemctl start hoa
- Certbot for free SSL via Let's Encrypt
- Total fixed cost: ~$33/mo

---

## Environment Variables (.env)

```
PORT=8080
DATABASE_URL=postgres://user:pass@localhost:5432/hoa_db
JWT_SECRET=your-long-random-secret-here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=720h
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_GROWTH_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
AWS_REGION=us-east-1
AWS_SES_FROM=noreply@yourdomain.com
S3_BUCKET=hoa-documents
SUPER_ADMIN_EMAIL=your@email.com
APP_ENV=production
```

---

## Design

- Theme: shadcn/ui Slate Clean
- Philosophy: minimal, intuitive, built for non-technical volunteer board members
- No mobile app at MVP — responsive web is sufficient
- Unit directory is always unit-first, sorted by unit number
- Vacant units always visible — never hidden by filters
- Upgrade modal is non-dismissible when plan ceiling is hit