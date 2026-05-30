# Architecture

> System design, data model, and security architecture for 3sheerti.
> Read this before making any structural change.

---

## 1. System Overview

3sheerti is a mobile-first application with the following high-level architecture:

```
┌─────────────────────────────────────────────────────────────┐
│  Mobile App (React Native + Expo, iOS + Android)            │
│  - Onboarding wizard (lineage walk-up)                       │
│  - Family tree visualization (SVG)                           │
│  - Profile, search, notifications, blood request, memorials  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS (TLS 1.3, JWT-authenticated)
                         │ WebSocket (Socket.IO) for real-time
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  API Gateway (Cloudflare or AWS WAF + ALB)                   │
│  - DDoS protection, rate limiting, request inspection        │
└────────────────────────┬────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Backend (NestJS, TypeScript) — stateless, horizontally      │
│   scalable                                                    │
│  - Auth module, lineage module, tree module, verification    │
│    module, notification module, media module                 │
└──┬──────────────┬─────────────┬────────────┬────────────────┘
   ▼              ▼             ▼            ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐
│Postgres│  │  Redis   │  │  S3 (or  │  │  Twilio    │
│  16+   │  │  cache + │  │   compat │  │  Verify    │
│ primary│  │  sessions│  │  storage)│  │  OTP)      │
│        │  │  + queues│  │          │  │            │
└────────┘  └──────────┘  └──────────┘  └────────────┘
```

The mobile app is **the only client** in Phase 1. A web admin panel for elders and platform council is a Phase 2 addition (will reuse the same API).

All data flows through the API. The mobile app has no direct database, storage, or third-party access.

---

## 2. The Lineage Data Model

This is the core of the system. Understand it deeply.

### Conceptual model

```
Teip (clan)
  └── Family Name (line)
        └── Person
              └── User (claims one Person)
```

A `Person` represents an individual human (living or deceased, user or not). A `User` represents an authenticated account that has claimed a Person spot.

### Primary entities

#### `teips`
```
id              UUID PRIMARY KEY
name_ar         TEXT NOT NULL          -- بينوي
name_en         TEXT NOT NULL          -- Benoy
name_ce         TEXT                   -- Беной (Cyrillic, Phase 2)
description_ar  TEXT
description_en  TEXT
origin_region   TEXT                   -- e.g. "Vedeno district"
elder_user_ids  UUID[]                 -- assigned teip elders
created_at      TIMESTAMP
created_by      UUID                   -- platform council member
```

The list of teips is seeded at platform launch (built-in registry of ~150 known Chechen teips). New teips can only be added by platform council action.

#### `family_names`
```
id                          UUID PRIMARY KEY
teip_id                     UUID NOT NULL REFERENCES teips
name_ar                     TEXT NOT NULL          -- دولات
name_en                     TEXT NOT NULL          -- Dawlat
name_ce                     TEXT                   -- Cyrillic future
name_alt_spellings          TEXT[]                 -- alternate spellings
oldest_known_ancestor       TEXT                   -- e.g. "Ibrahim, 1820s"
origin_aul_id               UUID REFERENCES auls
family_admin_user_ids       UUID[]                 -- family admins (1+ required)
description                 TEXT
status                      ENUM('pending','approved','rejected')
approved_by                 UUID                   -- teip elder user
approved_at                 TIMESTAMP
created_by                  UUID                   -- requester user
created_at                  TIMESTAMP
```

Family names are user-requested. A request must be approved by at least one teip elder before becoming active.

#### `persons`
```
id                          UUID PRIMARY KEY
family_name_id              UUID NOT NULL REFERENCES family_names  -- patrilineal family
mother_family_name_id       UUID REFERENCES family_names           -- maternal family (cross-link)
mother_teip_id              UUID REFERENCES teips                  -- maternal teip
given_name_ar               TEXT NOT NULL
given_name_en               TEXT
given_name_ce               TEXT
nickname                    TEXT                                   -- kunya, e.g. "Abu Omar"
alt_spellings               TEXT[]
canonical_name              TEXT NOT NULL                          -- normalized form for matching
gender                      ENUM('male','female')
is_alive                    BOOLEAN NOT NULL
birth_date_gregorian        DATE
birth_date_hijri            TEXT                                   -- formatted
death_date_gregorian        DATE
death_date_hijri            TEXT
father_person_id            UUID REFERENCES persons                -- nullable for unknown ancestors
mother_person_id            UUID REFERENCES persons                -- nullable
origin_aul_id               UUID REFERENCES auls
current_country             TEXT                                   -- ISO country code
current_city                TEXT
blood_type                  ENUM('O+','O-','A+','A-','B+','B-','AB+','AB-')
photo_url                   TEXT
visibility                  JSONB                                  -- privacy settings per field
profession                  TEXT
vird                        ENUM('qadiri','naqshbandi','other','none')   -- optional
verification_status         ENUM('pending','witnessed','elder_verified','documented')
verification_score          INT                                    -- 0-100
notes                       TEXT
deleted_at                  TIMESTAMP                              -- soft delete
created_at                  TIMESTAMP
created_by                  UUID                                   -- user who added this person
```

Notes:
- **`family_name_id`** is the patrilineal family (always the father's family).
- **`mother_family_name_id`** preserves the maternal lineage and powers cross-family bridge visualization.
- **`canonical_name`** is computed on every insert/update by the name normalization service — used for duplicate detection.
- **`visibility`** is a JSONB blob: `{"photo": "family_only", "phone": "first_degree", "blood_type": "all_verified", ...}`.

#### `marriages`
```
id                  UUID PRIMARY KEY
spouse_a_person_id  UUID NOT NULL REFERENCES persons
spouse_b_person_id  UUID NOT NULL REFERENCES persons
marriage_date       DATE
divorce_date        DATE
status              ENUM('married','divorced','widowed')
verification_status ENUM('pending','witnessed','elder_verified')
notes               TEXT
created_at          TIMESTAMP
created_by          UUID
deleted_at          TIMESTAMP
```

Supports multiple marriages per person, divorce, and widowhood. Each marriage is its own row.

#### `users`
```
id                          UUID PRIMARY KEY
phone                       TEXT NOT NULL UNIQUE          -- E.164 format, encrypted
phone_hash                  TEXT NOT NULL UNIQUE          -- searchable index
claimed_person_id           UUID REFERENCES persons       -- the Person this user claims to be
preferred_language          ENUM('ar','en','ce','tr','de','ru')
role                        ENUM('member','family_admin','teip_elder','council','platform_admin')
created_at                  TIMESTAMP
last_login_at               TIMESTAMP
status                      ENUM('active','suspended','deleted')
deleted_at                  TIMESTAMP
```

#### `auls`
```
id              UUID PRIMARY KEY
name_ar         TEXT NOT NULL
name_en         TEXT NOT NULL
name_ce         TEXT
region          TEXT                              -- e.g. "Vedeno district, Chechnya"
country         TEXT                              -- present-day country
latitude        DECIMAL(9,6)
longitude       DECIMAL(9,6)
description     TEXT
```

The aul registry is seeded at launch with known Caucasian villages; users can request new auls.

### Verification entities

#### `verification_events`
```
id                  UUID PRIMARY KEY
target_type         ENUM('person','parent_link','marriage','family_name','position_claim')
target_id           UUID NOT NULL
verifier_user_id    UUID NOT NULL REFERENCES users
verification_kind   ENUM('witness','family_admin','teip_elder','document')
evidence_url        TEXT                          -- optional uploaded document
notes               TEXT
signature           TEXT                          -- cryptographic signature
created_at          TIMESTAMP
```

Immutable. Every verification action is one row.

#### `position_claims`
```
id                  UUID PRIMARY KEY
user_id             UUID NOT NULL REFERENCES users
claimed_person_id   UUID NOT NULL REFERENCES persons
status              ENUM('pending','approved','rejected','expired')
evidence            JSONB                         -- lineage walk-up data
approvers_needed    INT NOT NULL                  -- typically 2 (admin + witness)
approver_user_ids   UUID[]                        -- who has approved
created_at          TIMESTAMP
resolved_at         TIMESTAMP
expires_at          TIMESTAMP                     -- typically +30 days
```

#### `family_name_requests`
```
id                          UUID PRIMARY KEY
requested_name_ar           TEXT NOT NULL
requested_name_en           TEXT NOT NULL
requested_teip_id           UUID NOT NULL REFERENCES teips
oldest_known_ancestor       TEXT
origin_aul_id               UUID REFERENCES auls
description                 TEXT
requester_user_id           UUID NOT NULL
status                      ENUM('pending','approved','rejected')
approved_by                 UUID
approved_at                 TIMESTAMP
rejection_reason            TEXT
created_at                  TIMESTAMP
```

#### `merge_proposals`
```
id                  UUID PRIMARY KEY
source_person_id    UUID NOT NULL REFERENCES persons   -- to be merged INTO canonical
canonical_person_id UUID NOT NULL REFERENCES persons   -- the kept record
confidence_score    INT                                -- system-computed 0-100
reason              TEXT                               -- "phonetic match + family + lineage chain"
status              ENUM('pending','merged','rejected')
proposed_by         UUID                               -- user_id OR 'system'
resolved_by         UUID
resolved_at         TIMESTAMP
created_at          TIMESTAMP
```

### Operational entities

#### `audit_log`
```
id              BIGSERIAL PRIMARY KEY
user_id         UUID
action          TEXT NOT NULL                     -- e.g. "person.created", "verification.granted"
entity_type     TEXT NOT NULL
entity_id       UUID
before_state    JSONB
after_state     JSONB
ip_address_hash TEXT
device_id       UUID
created_at      TIMESTAMP NOT NULL
```

**Append-only.** No update, no delete. Ever.

#### `notifications`
```
id              UUID PRIMARY KEY
user_id         UUID NOT NULL REFERENCES users
kind            TEXT NOT NULL                     -- e.g. "verification_request", "blood_request"
payload         JSONB NOT NULL
read_at         TIMESTAMP
created_at      TIMESTAMP
```

### Indexing strategy

- `persons.canonical_name` — for fuzzy duplicate matching (pg_trgm GIN index)
- `persons.family_name_id` — for family-tree queries
- `persons.father_person_id`, `persons.mother_person_id` — for tree traversal
- `users.phone_hash` — for login lookup
- `audit_log.user_id`, `audit_log.entity_id` — for audit queries
- Closure table (materialized): `person_ancestors(descendant_id, ancestor_id, depth)` — recomputed on parent_link changes via trigger, enables O(1) ancestor/descendant queries

---

## 3. Onboarding & Lineage Walk-Up Logic

The onboarding wizard is the primary tree-building mechanism. The detailed UX is in `docs/PRD.md` Section 4. Here is the logic flow at the backend level:

```
1. User authenticates (phone OTP → JWT issued).
2. Profile basics captured (name, gender, DOB, language).
3. Teip selection (from built-in list, or "I don't know" path).
4. Family Name discovery:
   a. Search registered family names within selected teip.
   b. If found: proceed to lineage walk-up against that family.
   c. If not found: family name creation flow → family_name_request created → pending elder approval.
5. Lineage walk-up loop:
   For each generation upward:
     - Ask father's name.
     - Run duplicate detection (canonical_name + family_name_id) against existing persons in this family.
     - Show matches with confidence scores.
     - User selects: "yes match", "no different", or "elder help me".
     - If match: link user's claimed Person to this branch.
     - If no match: create stub Person; move up to grandfather.
     - Stop when: matched existing branch, reached oldest known ancestor, or user can't go further.
6. Horizontal enumeration:
   - Siblings (create stub Persons)
   - Mother (capture mother's family_name and teip cross-link)
   - Paternal uncles and aunts
   - Spouse (cross-family link)
   - Children
7. Origin and current location capture.
8. Profile privacy defaults set.
9. position_claim record created in pending state.
10. Verification notifications dispatched to: family admin, named relatives who are users, teip elder.
```

---

## 4. Duplicate Detection Architecture

Real-time fuzzy matching during entry + background scanning + admin merge queue. Five layers:

1. **Name normalization service** (`packages/shared-validation/name-normalization.ts`):
   - Strip diacritics, normalize hamza forms, remove shadda/tanwin
   - Lowercase, trim
   - Produce `canonical_name` for storage

2. **Phonetic and transliteration pair tables** (`packages/shared-constants/name-variants.ts`):
   - Curated table of known equivalent pairs: ahmad↔ahmed, mohammed↔muhammad, etc.
   - 500-1000 pairs covers >95% of common cases
   - Community-extendable via admin tool

3. **Lineage chain matching** (`apps/backend/src/modules/lineage/duplicate-matcher.service.ts`):
   - Match not just on name but on (name + father_name + grandfather_name + family_name)
   - Confidence scoring: name match (40 pts) + father match (30 pts) + grandfather match (20 pts) + family match (10 pts) = 100 pts
   - Threshold: >80 = surface as match; 60-80 = surface as possible; <60 = ignore

4. **Search index** (PostgreSQL pg_trgm GIN index on `canonical_name`):
   - Used for fuzzy substring matching as user types
   - Sub-100ms query times for families up to 50k persons

5. **Background scan + admin merge queue**:
   - Nightly job runs `merge-proposal-scanner.job.ts`
   - Scans persons added in the last 24h against existing for high-confidence duplicates
   - Creates `merge_proposals` rows surfaced in family-admin dashboard
   - Merge action atomically re-points all child relationships, marriages, etc.

---

## 5. Authentication Flow

```
1. User enters phone number.
2. Mobile app calls POST /auth/otp/request { phone }.
3. Backend rate-limits (5/hour/phone), generates 6-digit OTP, calls Twilio Verify, stores hash + expiry in Redis.
4. User receives SMS, enters OTP.
5. Mobile calls POST /auth/otp/verify { phone, code }.
6. Backend verifies, issues:
   - access_token (JWT, 15 min, signed with rotating secret)
   - refresh_token (random opaque, 30 days, stored in DB hashed)
7. Mobile stores tokens in expo-secure-store.
8. Subsequent requests: Authorization: Bearer <access_token>.
9. When access_token expires: POST /auth/refresh with refresh_token → new pair, old refresh_token revoked.
10. Device binding: each refresh_token is bound to a device_id; max 2 active devices per user.
```

Sensitive actions (export, modesty change, removing verified relatives) require **step-up auth**: a fresh OTP within 5 minutes.

---

## 6. API Design Principles

- **Versioned**: all routes under `/api/v1`. Future v2 lives at `/api/v2`.
- **REST-style** for resources, **RPC-style** for workflows (e.g. `/api/v1/lineage/walk-up/next-step`).
- **JSON request/response** with strict Zod validation on every endpoint.
- **Pagination** via cursor (not offset) for any list endpoint: `?after=<cursor>&limit=20`.
- **Errors** use standard HTTP status + structured body: `{ "error": { "code": "PERSON_NOT_FOUND", "message": "...", "details": {} } }`.
- **Idempotency keys** required for any mutating POST that should not be retried blindly (e.g. blood request, position claim).
- **No N+1 queries**. Use Prisma's `include` / `select` carefully; add unit tests that assert query counts.

---

## 7. Security Architecture (Six Layers)

### Layer 1 — Identity & Access
- Phone OTP + biometric unlock on every app open
- Device binding (max 2 devices per account)
- Session anomaly detection (login from new country → re-verify)
- Trusted device list visible to user with remote revoke
- Step-up authentication for sensitive actions
- No password recovery via email; recovery via elder verification chain

### Layer 2 — Application
- Strict RBAC: member / family_admin / teip_elder / council / platform_admin
- Relationship-based visibility filter at query layer (default: 4 degrees)
- Rate limiting (Redis-backed) on every endpoint
- Input validation via Zod schemas (shared between frontend and backend)
- Output filtering — server decides what fields to send based on viewer's relationship to viewee
- Never trust the client

### Layer 3 — Data
- Encryption at rest: PostgreSQL TDE or field-level encryption for sensitive columns (phone, blood_type, exact_location, photo_url)
- Encryption in transit: TLS 1.3 only, HSTS, certificate pinning in mobile app
- EXIF stripping on every photo upload (Sharp library)
- Photo watermarking on display (configurable): "Viewed by [user] on [date]"
- Field-level encryption keys in KMS (AWS KMS); engineers cannot read sensitive data directly
- Daily encrypted backups, geographic separation, monthly restoration tests

### Layer 4 — Network & Infrastructure
- WAF in front of API (AWS WAF or Cloudflare)
- DDoS protection
- API gateway with throttling
- Backend in private subnet, no direct internet access
- VPN-only admin access to production
- All secrets in vault (AWS Secrets Manager or HashiCorp Vault); never env files in production
- Container security scanning in CI

### Layer 5 — Operational Security
- Audit log (immutable, append-only)
- Anomaly alerting (Sentry + custom rules)
- Dependency scanning (Dependabot, Snyk)
- Quarterly penetration tests (internal first, external by Phase 1 launch)
- Incident response runbook from day one
- Backup restoration drills monthly

### Layer 6 — User-Facing Security UX
- Security tab in profile: active sessions, recent logins, recent profile views
- Login alerts via push for any new device
- Panic button: lock account + sign out everywhere
- Modesty quick-toggle prominent in UI
- Verification transparency: see who verified your profile, when, and how

---

## 8. Mobile App Architecture

### Layered structure
```
app/                  -- Expo Router pages (file-based routing)
  (auth)/             -- pre-auth screens (phone, OTP)
  (onboarding)/       -- post-auth onboarding wizard
  (tabs)/             -- main authenticated UI
    tree.tsx          -- family tree screen
    profile.tsx
    notifications.tsx
    settings.tsx

src/
  components/         -- shared UI primitives (Button, Avatar, TeipBadge, etc.)
  features/
    auth/
      api.ts
      hooks/
      screens/
      components/
      index.ts        -- barrel export
    onboarding/       -- lineage walk-up wizard
    tree/             -- family tree visualization
    profile/
    verification/
    memorial/
    blood-request/
    notifications/
  lib/
    api-client.ts     -- typed Axios instance
    auth-storage.ts   -- secure token store wrapper
    i18n.ts
    rtl.ts
  theme/
    colors.ts
    typography.ts
    spacing.ts
  locales/
    ar/
    en/
  types/
```

### State management
- **Server state**: TanStack Query (cached, refetched, paginated automatically)
- **Local UI state**: Zustand stores (auth, theme, onboarding wizard state)
- **No Redux**. Zustand is lighter and Codex handles it well.

### Tree rendering
- `react-native-svg` for SVG primitives
- Tree layout computed client-side using `d3-hierarchy`
- Gestures via `react-native-gesture-handler` (pinch zoom, pan, tap, long-press)
- Animations via `react-native-reanimated` (re-center transitions, expand/collapse)
- Tree data fetched as a single GraphQL-style normalized payload from `/api/v1/tree/hourglass`
- Lazy loading: load 3 generations up + 2 generations down by default; fetch more on demand

---

## 9. Backend Architecture

### NestJS modules
```
src/modules/
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    otp.service.ts
    jwt.strategy.ts
    dto/
  users/
  lineage/                       -- teips, family_names, persons, walk-up
    lineage.module.ts
    teips.service.ts
    family-names.service.ts
    persons.service.ts
    walk-up.service.ts
    duplicate-matcher.service.ts
  tree/                          -- visualization queries
    tree.module.ts
    tree.controller.ts
    tree.service.ts              -- builds normalized graph responses
    closure-table.service.ts
  verification/
    verification.module.ts
    position-claims.service.ts
    verification-events.service.ts
    merge-proposals.service.ts
  marriages/
  memorial/
  blood/
  notifications/
  media/                         -- photo uploads, EXIF stripping, signed URLs
  audit/
common/
  guards/
    jwt-auth.guard.ts
    rbac.guard.ts
    step-up-auth.guard.ts
  interceptors/
    audit-log.interceptor.ts
    visibility-filter.interceptor.ts
  decorators/
    current-user.decorator.ts
    roles.decorator.ts
config/
prisma/
```

### Cross-cutting concerns
- All controllers use Zod-validated DTOs via a custom `ZodValidationPipe`.
- Every mutating endpoint passes through `AuditLogInterceptor` automatically.
- Every read endpoint passes through `VisibilityFilterInterceptor` to strip fields the requester is not authorized to see.
- Background jobs use BullMQ; defined in `src/modules/jobs/`.

---

## 10. Deployment Topology

### Development
- Local: Docker Compose (Postgres, Redis, Backend, Mobile via Expo)
- Shared dev: AWS Frankfurt (eu-central-1)

### Production (Phase 1 launch)
- Region: AWS Bahrain (me-south-1) or Oracle Cloud Jordan (Amman)
- Application: ECS Fargate or Kubernetes (EKS)
- Database: RDS PostgreSQL Multi-AZ with read replicas
- Cache: ElastiCache Redis
- Storage: S3 with KMS encryption
- CDN: CloudFront with signed URLs for media
- Monitoring: Sentry (errors) + CloudWatch (logs/metrics) + custom dashboard
- DPO contact: documented in privacy policy (Jordan PDP Law requirement)

### CI/CD (GitHub Actions)
- Push to feature branch → run lint + typecheck + tests
- PR opened → above + dependency scan + Docker build
- Merge to main → deploy to dev environment automatically
- Tag release → deploy to production (manual approval gate)
