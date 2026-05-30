# Codex Task Queue

> Sequenced development tasks for Phase 1.
> Tasks are atomic — one task = one focused change, one PR.
> Always pick the next unfinished task unless explicitly told otherwise.
> Update this file (status field) when a task is completed.

---

## Task Protocol

Each task follows this format:

```
### T-XX — Title
**Status:** [ ] not started | [~] in progress | [x] complete
**Goal:** What success looks like.
**Acceptance criteria:** Specific testable outcomes.
**Files to touch:** Likely scope.
**References:** Which docs to read first.
**Dependencies:** Earlier tasks that must be complete.
```

When starting a task: re-read `AGENTS.md`, then the referenced docs, then execute.
When complete: run lint + typecheck + tests, update this file, open PR.

---

## Phase 0 — Foundation Setup (T-01 through T-08)

### T-01 — Initialize monorepo with pnpm workspaces
**Status:** [x] complete
**Goal:** Create the root repository structure with pnpm workspaces, base tooling, and CI scaffolding.
**Acceptance criteria:**
- Root `package.json` with workspace declaration
- `pnpm-workspace.yaml` configuring `apps/*` and `packages/*`
- `apps/mobile/`, `apps/backend/`, `packages/shared-types/`, `packages/shared-validation/`, `packages/shared-constants/` directories with empty `package.json` in each
- Root `.gitignore`, `.editorconfig`, `tsconfig.base.json`
- ESLint + Prettier config at root, inherited by sub-packages
- `pnpm install` succeeds with no errors
**Files to touch:** root configs only
**References:** AGENTS.md sections 3, 5, 6
**Dependencies:** none

### T-02 — Backend scaffolding (NestJS)
**Status:** [x] complete
**Goal:** Create the NestJS backend application with TypeScript, Prisma, and basic health endpoint.
**Acceptance criteria:**
- `apps/backend/` is a working NestJS app
- TypeScript strict mode enabled
- Prisma installed and configured pointing to PostgreSQL
- `GET /api/v1/health` returns `{ status: "ok", time: <iso> }`
- `pnpm dev` (in apps/backend) starts the server on port 3000
- Jest configured with at least one passing test (health endpoint)
**Files to touch:** `apps/backend/**`
**References:** AGENTS.md section 3 (backend stack), ARCHITECTURE.md section 9
**Dependencies:** T-01

### T-03 — Mobile scaffolding (Expo + React Native)
**Status:** [x] complete
**Goal:** Create the Expo-managed React Native app with TypeScript, navigation, and a placeholder landing screen.
**Acceptance criteria:**
- `apps/mobile/` is a working Expo SDK 51 app with TypeScript strict mode
- Expo Router file-based navigation configured
- A simple landing screen displays "3sheerti" + version
- App runs on iOS Simulator and Android Emulator
- ESLint passes; Jest configured with at least one passing component test
**Files to touch:** `apps/mobile/**`
**References:** AGENTS.md section 3 (mobile stack), ARCHITECTURE.md section 8
**Dependencies:** T-01

### T-04 — Docker Compose infrastructure
**Status:** [ ] not started
**Goal:** Local PostgreSQL 16 and Redis 7 via Docker Compose.
**Acceptance criteria:**
- `docker-compose.yml` at repo root defines `postgres` (port 5432) and `redis` (port 6379) services
- Persistent volumes for postgres data
- `.env.example` files in `apps/backend/` and `apps/mobile/` documenting all required env vars
- `docker-compose up -d` brings both services online
- Backend can connect to both via env vars
**Files to touch:** `docker-compose.yml`, `apps/backend/.env.example`, `apps/mobile/.env.example`
**References:** AGENTS.md section 12
**Dependencies:** T-02

### T-05 — Prisma schema: initial data model
**Status:** [ ] not started
**Goal:** Define the core schema for teips, family_names, persons, users, auls, marriages, and audit_log per ARCHITECTURE.md section 2.
**Acceptance criteria:**
- `apps/backend/prisma/schema.prisma` includes all primary entities from ARCHITECTURE.md section 2
- Foreign keys and indexes match the architecture doc
- `pnpm prisma migrate dev --name initial` succeeds and produces a migration file
- Generated Prisma client compiles
- Schema includes appropriate enums (gender, verification_status, role, blood_type, vird)
- Soft-delete columns (`deleted_at`) on persons, marriages, family_names
**Files to touch:** `apps/backend/prisma/schema.prisma`
**References:** ARCHITECTURE.md section 2
**Dependencies:** T-04

### T-06 — Seed data: built-in teips and auls
**Status:** [ ] not started
**Goal:** Populate the teips and auls tables with a curated initial set.
**Acceptance criteria:**
- `apps/backend/prisma/seed.ts` inserts approximately 30 well-known Chechen teips (start with a curated subset; expand later)
- Inserts approximately 20 known Chechen auls with coordinates where available
- Seed is idempotent (safe to run multiple times)
- `pnpm prisma db seed` succeeds
- Data verifiable via Prisma Studio
**Files to touch:** `apps/backend/prisma/seed.ts`, `packages/shared-constants/src/teips.ts`, `packages/shared-constants/src/auls.ts`
**References:** docs/CULTURAL_GLOSSARY.md, ARCHITECTURE.md section 2
**Dependencies:** T-05

### T-07 — Shared types and Zod schemas package
**Status:** [ ] not started
**Goal:** Establish the shared validation/types package used by both backend and mobile.
**Acceptance criteria:**
- `packages/shared-validation/src/` exports Zod schemas for: Person, Teip, FamilyName, User, BloodType, Gender, VerificationStatus
- `packages/shared-types/src/` exports TypeScript types derived from those Zod schemas via `z.infer`
- Both packages build and are consumable by backend and mobile
**Files to touch:** `packages/shared-validation/**`, `packages/shared-types/**`
**References:** AGENTS.md section 6 (TypeScript), ARCHITECTURE.md section 2
**Dependencies:** T-05

### T-08 — GitHub Actions CI
**Status:** [ ] not started
**Goal:** Continuous integration on every PR.
**Acceptance criteria:**
- `.github/workflows/backend-ci.yml`: runs lint, typecheck, prisma generate, test on backend changes
- `.github/workflows/mobile-ci.yml`: runs lint, typecheck, test on mobile changes
- Both workflows trigger on PRs touching their respective paths
- Pass status posted to GitHub PR view
**Files to touch:** `.github/workflows/*.yml`
**References:** AGENTS.md section 13
**Dependencies:** T-02, T-03

---

## Phase 1A — Core Backend (T-09 through T-15)

### T-09 — Authentication module: phone OTP request
**Status:** [ ] not started
**Goal:** Backend endpoint to request an OTP for a given phone number.
**Acceptance criteria:**
- `POST /api/v1/auth/otp/request` accepts `{ phone: string (E.164) }`
- Validates phone format via Zod
- Stores hashed OTP + expiry in Redis (5-minute TTL)
- Rate-limited to 5 requests/hour/phone (Redis-backed)
- In dev mode, returns the OTP in response; in prod, integrates with Twilio Verify (use feature flag)
- Returns `{ requestId: string, expiresAt: iso }`
- Integration tests cover happy path, rate limit, invalid format
**Files to touch:** `apps/backend/src/modules/auth/**`
**References:** ARCHITECTURE.md section 5, AGENTS.md section 9 (rate limiting)
**Dependencies:** T-02, T-04

### T-10 — Authentication module: OTP verification + JWT issuance
**Status:** [ ] not started
**Goal:** Backend endpoint to verify OTP and issue tokens.
**Acceptance criteria:**
- `POST /api/v1/auth/otp/verify` accepts `{ phone, code, requestId }`
- Verifies OTP against Redis store
- On success: creates or fetches User record, issues access JWT (15 min) + refresh token (30 days)
- Refresh token bound to a device_id (passed in headers)
- Max 2 active devices per user — oldest device is invalidated when a third joins
- Returns `{ accessToken, refreshToken, user: { id, role, hasOnboarded } }`
- Integration tests cover: valid OTP, expired OTP, wrong code, device limit
**Files to touch:** `apps/backend/src/modules/auth/**`
**References:** ARCHITECTURE.md section 5
**Dependencies:** T-09

### T-11 — JWT auth guard and current-user decorator
**Status:** [ ] not started
**Goal:** Reusable NestJS guard and decorator to protect endpoints.
**Acceptance criteria:**
- `JwtAuthGuard` validates bearer token
- `@CurrentUser()` parameter decorator provides typed user object to controllers
- `@Roles(...)` decorator + `RbacGuard` enforce role-based access
- Health endpoint remains public; all other endpoints require auth
**Files to touch:** `apps/backend/src/common/guards/**`, `apps/backend/src/common/decorators/**`
**References:** ARCHITECTURE.md section 7 (Layer 2)
**Dependencies:** T-10

### T-12 — Audit log interceptor
**Status:** [ ] not started
**Goal:** Every mutating request automatically writes to audit_log.
**Acceptance criteria:**
- `AuditLogInterceptor` registered globally
- Captures user_id, action (route name), entity_type, entity_id (from response), before/after states (from a configurable decorator), hashed IP, device_id, timestamp
- Writes asynchronously to `audit_log` table
- No PII other than user_id and device_id is recorded; raw IP is hashed
- Read endpoints are not audited (avoid log volume)
**Files to touch:** `apps/backend/src/common/interceptors/audit-log.interceptor.ts`, `apps/backend/src/modules/audit/**`
**References:** AGENTS.md section 8, ARCHITECTURE.md section 7 (Layer 5)
**Dependencies:** T-11

### T-13 — Name normalization service
**Status:** [ ] not started
**Goal:** A utility that produces canonical name forms for matching.
**Acceptance criteria:**
- `packages/shared-validation/src/name-normalization.ts` exports `normalizeName(input: string): string`
- Handles Arabic: strips diacritics, normalizes hamza variants (إ أ آ → ا), removes shadda/tanwin/sukoon
- Handles Latin: lowercases, strips diacritics, removes punctuation
- Curated variant pairs (`packages/shared-constants/src/name-variants.ts`) maps common variants to a canonical key (ahmad/ahmed → "ahmd", mohammed/muhammad → "mhmd", etc.)
- Unit tests cover 50+ name pairs across both scripts
**Files to touch:** `packages/shared-validation/src/name-normalization.ts`, `packages/shared-constants/src/name-variants.ts`
**References:** ARCHITECTURE.md section 4
**Dependencies:** T-07

### T-14 — Teips API
**Status:** [ ] not started
**Goal:** Read-only API for the teip registry.
**Acceptance criteria:**
- `GET /api/v1/teips` returns paginated list of teips
- `GET /api/v1/teips/:id` returns one teip with its families count
- `GET /api/v1/teips/search?q=...` returns fuzzy matches using `canonical_name`
- All endpoints require auth
- Integration tests
**Files to touch:** `apps/backend/src/modules/lineage/teips.*`
**References:** PRD.md section 4.2, ARCHITECTURE.md section 2
**Dependencies:** T-11, T-13

### T-15 — Family names API (read + request creation)
**Status:** [ ] not started
**Goal:** API to browse family names within a teip and request creation of new ones.
**Acceptance criteria:**
- `GET /api/v1/teips/:teipId/family-names` returns family names within a teip
- `GET /api/v1/family-names/:id` returns one with full details
- `POST /api/v1/family-names/requests` creates a `family_name_request` (status pending)
- `GET /api/v1/family-names/requests/mine` returns user's requests
- Approval endpoint deferred to T-30
- Integration tests for happy paths and validation
**Files to touch:** `apps/backend/src/modules/lineage/family-names.*`
**References:** PRD.md section 4.3
**Dependencies:** T-14

---

## Phase 1B — Mobile Foundation (T-16 through T-20)

### T-16 — Mobile: i18n setup (AR + EN) with RTL support
**Status:** [ ] not started
**Goal:** Localization framework in place; sample strings in both languages; RTL toggle works.
**Acceptance criteria:**
- `react-i18next` configured with AR (default) and EN locale files
- A simple home screen demonstrates translated strings
- Language picker in a debug/settings screen toggles language and persists it
- RTL layout activates automatically when AR is selected (via `I18nManager`)
- Test that key components render correctly in both directions
**Files to touch:** `apps/mobile/src/lib/i18n.ts`, `apps/mobile/src/locales/**`, `apps/mobile/app/**`
**References:** AGENTS.md section 7
**Dependencies:** T-03

### T-17 — Mobile: secure token storage and API client
**Status:** [ ] not started
**Goal:** Typed API client with automatic token injection and refresh.
**Acceptance criteria:**
- `apps/mobile/src/lib/api-client.ts` exports a typed Axios instance
- Tokens stored via `expo-secure-store` (never AsyncStorage)
- Automatic Authorization header injection
- 401 response → automatic refresh attempt → retry once → on failure, sign out
- Base URL configurable per environment
**Files to touch:** `apps/mobile/src/lib/api-client.ts`, `apps/mobile/src/lib/auth-storage.ts`
**References:** AGENTS.md section 3 (auth), ARCHITECTURE.md section 5
**Dependencies:** T-03, T-10

### T-18 — Mobile: phone OTP login flow
**Status:** [ ] not started
**Goal:** User can sign in via phone OTP from the mobile app.
**Acceptance criteria:**
- Phone entry screen with country code picker (Jordan default)
- OTP entry screen with 6-digit code input + auto-submit on completion
- Calls backend `/auth/otp/request` and `/auth/otp/verify`
- On success: stores tokens, routes to onboarding (if user.hasOnboarded === false) or home (if true)
- Error states: invalid phone, wrong code, rate limited, network error — all localized
- Loading and disabled states
**Files to touch:** `apps/mobile/src/features/auth/**`, `apps/mobile/app/(auth)/*`
**References:** PRD.md section 4.1
**Dependencies:** T-16, T-17

### T-19 — Mobile: home screen scaffolding (tabs)
**Status:** [ ] not started
**Goal:** Post-auth home with bottom tab navigation.
**Acceptance criteria:**
- Authenticated route group with bottom tabs: Tree, Profile, Notifications, Settings
- Placeholder content per tab (real content in later tasks)
- Sign-out button in Settings clears tokens and returns to login
**Files to touch:** `apps/mobile/app/(tabs)/**`
**References:** PRD.md section 4
**Dependencies:** T-18

### T-20 — Mobile: theme system
**Status:** [ ] not started
**Goal:** Centralized colors, typography, and spacing tokens.
**Acceptance criteria:**
- `apps/mobile/src/theme/` exports colors, typography, spacing constants
- Supports light mode at minimum (dark mode hooks in place for later)
- Verification badge colors (gold/silver/bronze) defined here
- Teip badge color tokens defined here
**Files to touch:** `apps/mobile/src/theme/**`
**References:** PRD.md section 4.5
**Dependencies:** T-19

---

## Phase 1C — Lineage & Tree (T-21 through T-28)

### T-21 — Backend: Persons API (read + duplicate suggestions)
**Status:** [ ] not started
**Goal:** API to list, search, and get persons, with real-time duplicate suggestion endpoint.
**Acceptance criteria:**
- `GET /api/v1/persons/:id` returns one person (visibility-filtered)
- `POST /api/v1/persons/search-similar` accepts `{ givenName, fatherName?, familyNameId }` and returns ranked candidates with confidence scores
- Confidence scoring per ARCHITECTURE.md section 4
- p95 search latency under 300ms for families up to 5k persons
- Integration tests with multiple name variants
**Files to touch:** `apps/backend/src/modules/lineage/persons.*`
**References:** ARCHITECTURE.md section 4, PRD.md section 4.2
**Dependencies:** T-13, T-15

### T-22 — Backend: Lineage walk-up endpoint
**Status:** [ ] not started
**Goal:** Stateful walk-up wizard endpoint that drives the onboarding flow.
**Acceptance criteria:**
- `POST /api/v1/lineage/walk-up/start` accepts `{ teipId, familyNameId, userGivenName, ... }` returns walk-up session
- `POST /api/v1/lineage/walk-up/step` accepts `{ sessionId, fatherName, confirmedExistingPersonId? }` and returns next state (next question, suggested matches, or completion)
- `POST /api/v1/lineage/walk-up/finalize` creates the user's claimed Person + sibling/uncle/mother stubs + position_claim
- Session state in Redis with 24h TTL
- Comprehensive integration tests covering happy path, matched-existing-ancestor path, and create-new-stubs path
**Files to touch:** `apps/backend/src/modules/lineage/walk-up.*`
**References:** PRD.md section 4.2, ARCHITECTURE.md section 3
**Dependencies:** T-21

### T-23 — Mobile: onboarding wizard (Steps 1-3)
**Status:** [ ] not started
**Goal:** Personal basics, teip selection, family name discovery screens.
**Acceptance criteria:**
- Step 1: name, gender, birth year, country/city
- Step 2: searchable teip picker
- Step 3: family name picker within selected teip; "Create new family name" path
- State persisted per step (resume on app reopen)
- Bilingual UI
- Visual progress indicator
**Files to touch:** `apps/mobile/src/features/onboarding/**`, `apps/mobile/app/(onboarding)/**`
**References:** PRD.md section 4.2
**Dependencies:** T-19, T-22

### T-24 — Mobile: onboarding wizard (Step 4 - lineage walk-up)
**Status:** [ ] not started
**Goal:** The lineage walk-up loop screen with real-time duplicate suggestions.
**Acceptance criteria:**
- Father's name input with debounced calls to `/persons/search-similar`
- Suggested matches displayed as cards with confidence indicator, family context, and "Yes" / "No different" / "Not sure" actions
- "Not sure" path creates a help request and lets user continue
- Loop continues with grandfather, great-grandfather, etc.
- "Stop here" option at each step
- Matches RTL layout
**Files to touch:** `apps/mobile/src/features/onboarding/**`
**References:** PRD.md section 4.2
**Dependencies:** T-23

### T-25 — Mobile: onboarding wizard (Steps 5-8)
**Status:** [ ] not started
**Goal:** Horizontal enumeration (siblings, mother, uncles, spouse, children), origin aul, cross-references, privacy defaults.
**Acceptance criteria:**
- Each sub-step is a separate screen with clear progress
- Modesty default toggle prominent for female users in Step 8
- "Skip" option on optional sub-steps
- All entered data submitted via `/lineage/walk-up/finalize`
**Files to touch:** `apps/mobile/src/features/onboarding/**`
**References:** PRD.md section 4.2
**Dependencies:** T-24

### T-26 — Backend: Tree query endpoint (Personal Hourglass)
**Status:** [ ] not started
**Goal:** Return normalized graph data for the Personal Hourglass view.
**Acceptance criteria:**
- `GET /api/v1/tree/hourglass?personId=<me>&ancestorsUp=3&descendantsDown=2&includeSpouses=true`
- Returns `{ nodes: Person[], edges: { type, fromId, toId }[] }`
- Visibility-filtered server-side
- p95 latency under 500ms for trees up to 200 nodes
- Integration tests covering visibility, missing relatives, deceased nodes
**Files to touch:** `apps/backend/src/modules/tree/**`
**References:** PRD.md section 4.5, ARCHITECTURE.md section 8 (tree rendering)
**Dependencies:** T-22

### T-27 — Mobile: family tree screen (Personal Hourglass view)
**Status:** [ ] not started
**Goal:** Render the user's Personal Hourglass in SVG.
**Acceptance criteria:**
- Loads tree data from `/tree/hourglass`
- Renders generations stacked vertically: ancestors above, user (highlighted) centered, descendants below
- Person cards show: avatar/initials, AR + EN names, teip badge, verification badge, deceased pattern if applicable, blood type chip (per visibility), origin → current location
- Pinch zoom, pan, tap-to-recenter
- Long-press opens a quick-actions sheet
- Works in RTL and LTR
**Files to touch:** `apps/mobile/src/features/tree/**`, `apps/mobile/app/(tabs)/tree.tsx`
**References:** PRD.md section 4.5
**Dependencies:** T-20, T-26

### T-28 — Mobile: profile screen with privacy settings
**Status:** [ ] not started
**Goal:** Users can view and edit their profile with granular privacy controls.
**Acceptance criteria:**
- View: shows all profile fields with current values
- Edit: tap a field to edit; sensitive changes (gender, modesty toggle) require step-up auth
- Privacy controls: per-field visibility dropdown
- Photo upload with EXIF stripping on backend
- All changes audit-logged
**Files to touch:** `apps/mobile/src/features/profile/**`, `apps/mobile/app/(tabs)/profile.tsx`
**References:** PRD.md section 4.4
**Dependencies:** T-19

---

## Phase 1D — Verification & Notifications (T-29 through T-34)

### T-29 — Backend: position claim approval workflow
**Status:** [ ] not started
**Goal:** Family admins and teip elders can approve or reject position claims.
**Acceptance criteria:**
- `GET /api/v1/verification/queue` lists pending items for the current user's verifier roles
- `POST /api/v1/verification/position-claims/:id/approve` and `/reject` actions
- Approval threshold: 1 family admin + 1 witness, OR 1 teip elder
- On full approval, user's claimed Person verification_status moves to "elder_verified"
- Audit log entry per action
**Files to touch:** `apps/backend/src/modules/verification/**`
**References:** PRD.md section 4.6, ARCHITECTURE.md section 2
**Dependencies:** T-22

### T-30 — Backend: family name request approval
**Status:** [ ] not started
**Goal:** Teip elders approve or reject family name creation requests.
**Acceptance criteria:**
- `GET /api/v1/family-names/requests/pending` (teip elder only)
- `POST /api/v1/family-names/requests/:id/approve` and `/reject`
- On approval: family_name row created, requester becomes family admin
- Notification dispatched to requester
**Files to touch:** `apps/backend/src/modules/lineage/family-names.*`
**References:** PRD.md section 4.3
**Dependencies:** T-15

### T-31 — Backend: notifications module + push dispatch
**Status:** [ ] not started
**Goal:** Notification model + delivery via FCM/APNs.
**Acceptance criteria:**
- Notification rows created for all relevant events (verification request, family name approval, etc.)
- Expo push tokens stored per user device
- `POST /api/v1/notifications/register-token` registers a device's push token
- Background job dispatches notifications via Expo Push API
- `GET /api/v1/notifications` returns user's notifications (paginated)
- `POST /api/v1/notifications/:id/read` marks as read
**Files to touch:** `apps/backend/src/modules/notifications/**`
**References:** PRD.md section 4.10
**Dependencies:** T-11

### T-32 — Mobile: verification queue screen + actions
**Status:** [ ] not started
**Goal:** Family admins and teip elders can act on pending verifications.
**Acceptance criteria:**
- Verification tab visible only for users with verifier roles
- Shows pending position claims with full lineage context
- Approve / Reject / Request more info actions
- Filters by type (position claims, family name requests, merge proposals)
**Files to touch:** `apps/mobile/src/features/verification/**`
**References:** PRD.md section 4.6
**Dependencies:** T-29, T-30

### T-33 — Mobile: notifications screen
**Status:** [ ] not started
**Goal:** In-app notification center.
**Acceptance criteria:**
- Lists notifications grouped by date
- Tap to mark read and navigate to the relevant screen (tree position, verification queue, etc.)
- Per-category enable/disable in Settings
**Files to touch:** `apps/mobile/src/features/notifications/**`, `apps/mobile/app/(tabs)/notifications.tsx`
**References:** PRD.md section 4.10
**Dependencies:** T-31

### T-34 — Push notification delivery (FCM + APNs)
**Status:** [ ] not started
**Goal:** Real push notifications work end-to-end.
**Acceptance criteria:**
- Verification request notification reaches verifier within 5 seconds in dev
- Login alert push when new device signs in
- Background-state handling on iOS and Android
- Localized notification content (AR/EN per recipient preference)
**Files to touch:** `apps/mobile/src/lib/push.ts`, `apps/backend/src/modules/notifications/push.service.ts`
**References:** PRD.md section 4.10
**Dependencies:** T-31, T-33

---

## Phase 1E — Memorial, Blood, Language Seed (T-35 through T-40)

### T-35 — Memorial pages (backend + mobile)
**Status:** [ ] not started
**Goal:** Deceased relatives have rich memorial pages.
**Acceptance criteria:**
- Memorial generated automatically for any Person with is_alive=false
- `GET /api/v1/memorials/:personId` returns full memorial data
- Mobile screen renders memorial with photos, biography, du'a count, memories
- Family members can submit memories (text or audio)
- Death anniversary notifications dispatched 7 days before and on the day
**Files to touch:** `apps/backend/src/modules/memorial/**`, `apps/mobile/src/features/memorial/**`
**References:** PRD.md section 4.7
**Dependencies:** T-27

### T-36 — Blood type registry consent + visibility
**Status:** [ ] not started
**Goal:** Users opt into blood type registry with visibility controls.
**Acceptance criteria:**
- Consent toggle in profile privacy settings
- Blood type chip shown on profile and tree cards per visibility rules
- Audit log entry on consent change
**Files to touch:** `apps/mobile/src/features/profile/**`, `apps/backend/src/modules/users/**`
**References:** PRD.md section 4.8
**Dependencies:** T-28

### T-37 — Emergency blood request flow
**Status:** [ ] not started
**Goal:** Users can request blood and matching family members are notified.
**Acceptance criteria:**
- `POST /api/v1/blood-requests` creates request with blood type + city + reason
- Matching algorithm finds compatible family members in same city
- Push notifications dispatched
- Responses tracked (Available / Not available / On the way)
- Mobile screens to create, view, and respond to requests
- 1 request per user per 24h limit
**Files to touch:** `apps/backend/src/modules/blood/**`, `apps/mobile/src/features/blood-request/**`
**References:** PRD.md section 4.8
**Dependencies:** T-36
### T-38 — Language seed content + Word of the Day
**Status:** [ ] not started
**Goal:** Seed Chechen language module with word of the day and phrase library.
**Acceptance criteria:**
- Backend stores ~100 phrases with AR/EN/CE translations and audio file URLs
- "Word of the day" cycles deterministically (one per day)
- Mobile home screen shows today's word
- Phrase library screen with search + categorical browse
- Audio playback works offline once cached
**Files to touch:** `apps/backend/src/modules/language/**`, `apps/mobile/src/features/language/**`
**References:** PRD.md section 4.9
**Dependencies:** T-19

### T-39 — Settings, privacy export, account deletion
**Status:** [ ] not started
**Goal:** Compliance with Jordan PDP Law data subject rights.
**Acceptance criteria:**
- Settings screen includes: language, notification preferences, privacy controls, security tab, "Export my data", "Delete my account"
- Export produces a JSON of user's data (profile, relationships, audit history of own actions)
- Deletion is soft-delete + scheduled hard purge after 30 days; user is logged out and tokens revoked
- All compliance actions audit-logged
**Files to touch:** `apps/mobile/src/features/settings/**`, `apps/backend/src/modules/users/**`
**References:** PRD.md section 5.4
**Dependencies:** T-28

### T-40 — Production readiness checklist
**Status:** [ ] not started
**Goal:** Pre-launch hardening.
**Acceptance criteria:**
- Sentry installed and configured (mobile + backend)
- All env vars verified in production config
- Database backup configuration documented
- Rate limiting verified on all endpoints
- Security headers (Helmet) verified
- TLS pinning enabled in mobile production builds
- Privacy policy and terms of use copy finalized (in AR + EN)
- DPO contact published
**Files to touch:** Multiple
**References:** AGENTS.md section 8, ARCHITECTURE.md section 7
**Dependencies:** All above

---

## After T-40 — Phase 1 Launch

Soft launch to founding elders → invite waves expand → telemetry observation → Phase 2 planning kicks off.

**Next milestones for Phase 2 will be added as a separate `TASKS-PHASE-2.md` once Phase 1 is in user hands.**
