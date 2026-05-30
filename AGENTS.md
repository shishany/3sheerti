# AGENTS.md — Instructions for AI Coding Agents (Codex)

> **Read this file first before touching any code.**
> This is the contract between you (the agent) and the project. Follow it precisely.
> When in doubt, re-read this file. If still in doubt, stop and ask.

---

## 1. Project Identity

**Name:** 3sheerti (عشيرتي — "my tribe / my clan")
**Tagline:** A digital home for the Chechen diaspora, expanding to Circassian (Adyghe) and other displaced peoples.
**Type:** Mobile application (iOS + Android) with backend API.
**Owner:** Moneer (private project, AlgoNova-affiliated build).
**Primary market (Phase 1):** Jordan-based Chechen diaspora, expanding to global Chechen community.

### Mission

3sheerti is **identity preservation infrastructure** for displaced peoples. It is not a social network. Every feature must serve three pillars:

1. **Identity** — a verified family tree organized by Chechen tradition (teip → family name → person).
2. **Connection** — relatives find each other across the global diaspora; mutual aid through blood type registry, skills directory, and family fund.
3. **Memory** — language preservation, elder oral history archives, memorial pages, cultural artifacts, historical commemoration (Aardakh).

### Phasing

- **Phase 1** — Chechen tribe / family launch in Jordan.
- **Phase 2** — Chechen language module + global Chechen diaspora.
- **Phase 3** — Circassian (Adyghe, Kabardian) onboarding.
- **Phase 4** — Other Caucasian peoples.
- **Phase 5** — Generalized platform for any displaced community.

You are currently building **Phase 1**. Do not build features outside Phase 1 scope unless explicitly approved.

---

## 2. Cultural Constraints (Non-Negotiable)

These are correctness requirements, not preferences.

- **Arabic-first, English-secondary** at launch. Full RTL layout support. Never hard-code text direction.
- **Cyrillic script support** is required infrastructure even though Chechen UI ships in Phase 2. Plan accordingly — the i18n framework and fonts must support Cyrillic from day one.
- **Patrilineal lineage model** — children belong to the father's family. A woman keeps her birth family name forever (Arab/Chechen convention). Cross-ethnic marriages create bridge links rather than reassigning identity. See `docs/CULTURAL_GLOSSARY.md`.
- **Modesty controls** for user profiles. Photo visibility, name visibility, and even existence visibility must be granular and default to *most private*.
- **Elder authority is central.** Teip elders and family-name admins govern verification. Code respects this hierarchy. Do not bypass.
- **Invite-only.** No public discoverability. No "public profile" concept. Search is restricted to verified members within the user's accessible network (default: up to 4 degrees).
- **Hijri calendar** must be available alongside Gregorian throughout the application.
- **Jordan PDP Law compliance** (Personal Data Protection Law No. 24 of 2023). Data minimization, explicit consent for sensitive data (blood type, location, photos), breach notification within 72 hours, data subject rights (access, correction, deletion).
- **No advertising, no third-party data sharing, no behavioral tracking. Ever.**

For cultural terms used throughout the codebase (teip, aul, vird, kunya, Aardakh, etc.), see `docs/CULTURAL_GLOSSARY.md`. Always link to the glossary on first use of any cultural term in code comments.

---

## 3. Tech Stack (Authoritative)

Do not introduce new frameworks or replace these without explicit human approval. If you believe a change is needed, document the case in `docs/QUESTIONS.md` and wait.

### Mobile Application
- **React Native 0.74+** with **Expo SDK 51+** (managed workflow; eject only if absolutely necessary)
- **TypeScript** (strict mode enabled)
- **Expo Router** for navigation (file-based routing)
- **TanStack Query** for server state, **Zustand** for local UI state
- **react-i18next** + **i18next** for localization
- **react-native-reanimated** + **react-native-gesture-handler** for animations and tree gestures
- **react-native-svg** for family tree visualization
- **expo-secure-store** for token storage
- **expo-notifications** for push
- **expo-localization** for locale detection

### Backend
- **NestJS 10+** with **TypeScript** (strict mode)
- **Prisma** ORM (better Codex tooling than TypeORM)
- **PostgreSQL 16+** (primary database)
- **Redis 7+** (sessions, cache, rate limiting, OTP storage)
- **BullMQ** for background jobs (notification dispatch, verification expiry, duplicate scans)
- **Socket.IO** for real-time (notifications, presence)
- **class-validator** + **class-transformer** for DTO validation
- **Helmet**, **express-rate-limit**, **CORS** for security middleware

### Authentication
- **Phone OTP** via Twilio Verify (production) or a mock provider (development)
- **JWT** access token (15 minutes) + **refresh token** (30 days, rotated on each use)
- Tokens stored in `expo-secure-store` on device

### Storage
- **S3-compatible** object storage. Dev: AWS S3 (Frankfurt region). Production: migrate to Jordan/Bahrain region.
- Signed URLs for all media access (no public bucket policies, ever)
- Image processing via Sharp on backend: resize, optimize, **strip EXIF metadata** on upload

### Infrastructure
- **Docker** + **docker-compose** for local development
- **GitHub Actions** for CI/CD
- **Sentry** for error tracking (add in Phase 1 final task)
- Production hosting: **AWS Frankfurt** for development, migrate to AWS Bahrain or Oracle Cloud Jordan for production

### Shared
- **pnpm workspaces** (monorepo)
- **Zod** for shared validation schemas between mobile and backend
- **Day.js** for date handling
- **hijri-converter** for Hijri ↔ Gregorian conversion

---

## 4. The Lineage Model (Core Data Concept)

This is the heart of the application. Internalize it before writing any tree-related code.

```
Teip (clan)                — e.g. Benoy, Beltoy, Tsentaroy
  └── Family Name (line)   — e.g. Dawlat, Khalidov
        └── Person          — individual; may or may not have an account
              └── User      — verified app account claiming one Person spot
```

**Key rules:**

- Every Person belongs to exactly one Family Name (their patrilineal family).
- Every Family Name belongs to exactly one Teip.
- A User claims exactly one Person spot (their own).
- Women keep their birth Family Name permanently. Their `family_name_id` never changes.
- Children's `family_name_id` is always their father's family.
- A Person has both `father_person_id` and `mother_person_id` foreign keys (nullable for unknown ancestors).
- A Marriage table tracks spouse links separately from the parent links.
- Cross-ethnic marriages: mother's family is captured via `mother_person_id`; the system surfaces bridge links between trees automatically.

See `docs/ARCHITECTURE.md` for full schema and `docs/PRD.md` Section 4 for the onboarding lineage walk-up that builds this data.

---

## 5. Repository Structure

```
3sheerti/
├── AGENTS.md                       # This file (READ FIRST)
├── README.md                       # Human onboarding
├── package.json                    # Workspace root
├── pnpm-workspace.yaml
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── mobile-ci.yml
├── docs/
│   ├── PRD.md                      # Product requirements (READ BEFORE BUILDING FEATURES)
│   ├── ARCHITECTURE.md             # System architecture + data model (READ BEFORE STRUCTURAL CHANGES)
│   ├── TASKS.md                    # Sequenced task queue (READ TO PICK NEXT WORK)
│   ├── CULTURAL_GLOSSARY.md        # Cultural terms reference
│   ├── DECISIONS.md                # Append-only decision log (you add to this)
│   └── QUESTIONS.md                # Append-only question log (you add to this)
├── apps/
│   ├── mobile/                     # React Native + Expo
│   │   ├── app/                    # File-based routing
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── features/           # Feature folders: auth, onboarding, profile, tree, etc.
│   │   │   ├── lib/                # API client, utils
│   │   │   ├── locales/            # ar.json, en.json (ce.json future)
│   │   │   ├── theme/              # Colors, typography, spacing
│   │   │   └── types/
│   │   └── package.json
│   └── backend/                    # NestJS API
│       ├── src/
│       │   ├── modules/            # Feature modules: auth, users, lineage, tree, verification, etc.
│       │   ├── common/             # Guards, interceptors, decorators
│       │   ├── config/
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   ├── migrations/
│       │   └── seed.ts
│       └── package.json
└── packages/
    ├── shared-types/               # Shared TypeScript types (Person, Teip, etc.)
    ├── shared-validation/          # Zod schemas used by both apps
    └── shared-constants/           # Built-in teip list, language codes, etc.
```

---

## 6. Coding Conventions

### TypeScript
- Strict mode is mandatory. No `any` unless justified in an inline comment.
- Prefer `type` over `interface` for object shapes; use `interface` only when declaration merging is needed.
- Always type function returns explicitly for exported functions.
- Use Zod schemas as the source of truth for runtime types; derive TS types via `z.infer`.

### Naming
- **Files:** kebab-case (`user-profile.tsx`, `auth.service.ts`)
- **Components:** PascalCase (`UserProfile`, `TeipBadge`)
- **Functions and variables:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **Database tables:** snake_case, plural (`users`, `family_names`, `parent_links`)
- **API routes:** kebab-case (`/api/v1/family-tree`, `/api/v1/lineage-walk-up`)

### File Organization
- One component per file (except small co-located helpers).
- Feature folders contain: `screens/`, `components/`, `hooks/`, `api.ts`, `types.ts`, `index.ts` (barrel export).
- Never import across feature folders directly — always go through `index.ts`.

### Comments
- Comment **why**, not what.
- All cultural terms must be commented on first use, with a reference to `docs/CULTURAL_GLOSSARY.md`.
- All non-obvious business rules must be commented (especially in verification, duplicate detection, and lineage logic).

### Error Handling
- Backend: throw NestJS `HttpException` subclasses with proper status codes. Never leak internal errors to clients in production.
- Mobile: all API calls go through a typed client surfacing typed errors. User-facing error messages must be localized.

### Testing
- Backend: **Jest** + **Supertest**. Every endpoint must have at least one happy-path and one auth-failure test. Verification logic must have edge-case tests.
- Mobile: **Jest** + **React Native Testing Library**. Critical flows (login, lineage walk-up, tree navigation, blood type request) need integration tests.
- Coverage target: 70% backend, 50% mobile. Will increase post-MVP.

---

## 7. Localization Rules (i18n)

- **Never hard-code user-facing strings.** Every string goes through `t('key.path')`.
- Translation keys use dot-notation: `onboarding.lineage.father_name_question`.
- Default locale: `ar` (Arabic). Fallback: `en` (English).
- All new strings must be added to **both** `ar` and `en` locale files in the same commit.
- Locale files: `apps/mobile/src/locales/{ar,en}/{namespace}.json`, organized by feature.
- Direction (RTL/LTR) is automatic based on locale. Components must work in both directions — test layouts in both.
- Future locales: `ce` (Chechen, Cyrillic), `ady` (Adyghe), `kbd` (Kabardian), `tr` (Turkish), `de` (German), `ru` (Russian).
- All cultural terms (teip, aul, vird, etc.) are treated as proper nouns, not translated — they appear in all locales as-is.

---

## 8. Privacy & Security Rules

These match the six-layer security architecture in `docs/ARCHITECTURE.md` Section 7. Always implement.

- **PII minimization** — only collect what is necessary. Justify each new PII field in the PR description.
- **Sensitive fields** (blood type, exact location, phone, photos): require explicit user consent toggles. Default to most private.
- **No logging of PII.** Log user IDs only. Sanitize all logs.
- **EXIF stripping** is mandatory on every photo upload.
- **Token storage:** never AsyncStorage. Always `expo-secure-store`.
- **Rate limiting:** every public endpoint. OTP: 5/phone/hour. General read: 60/min/user. Bulk operations: 10/min/user.
- **Step-up authentication** for sensitive actions: viewing full phone numbers, exporting tree data, removing verified relatives, changing modesty settings.
- **Audit log** is immutable. Every verification, every tree edit, every elder approval is logged with user ID, hashed IP, device ID, timestamp.
- **Photo watermarking** on display (optional, configurable): "Viewed by [user] on [date]" — discourages screenshot leaks.
- **Field-level encryption** for the most sensitive columns (phone, blood type, exact location). KMS-managed keys.

---

## 9. Verification Rules

Three verification types govern data integrity. Enforce these in code; do not bypass.

### Family Name Creation
- Any verified user can request a new family name.
- Request must specify: name (AR + EN), teip, oldest known ancestor's name, optional origin aul.
- Approval requires: **teip elder confirmation** (1 elder is enough; council if no elder exists for that teip).
- Once approved, the requester becomes the **family admin**.

### Position Claim (User claims an existing Person spot)
- User completes the lineage walk-up and identifies a Person they believe to be themselves (or a stub created by their relative).
- Verification requires: family admin approval + 1 witness, OR teip elder override.
- If no family admin yet (first user in family), teip elder is the verifier.
- Pending claims expire after 30 days if no verifier acts; user is notified and can resubmit.

### New Person Addition (adding a relative who is not a user)
- First-degree relatives (father, mother, siblings, spouse, children): require family admin + 1 witness.
- Deceased ancestors: require family admin + 2 witnesses + teip elder.
- Female stubs (until the woman herself joins): default modesty applies — initials + family name only, no photo, restricted visibility.
- Conflicts (two users adding different parents for same Person): flagged to family admin and teip elder; resolution recorded.

### Duplicate Detection
- Real-time fuzzy match at input time (Arabic phonetic + transliteration tables + lineage chain context).
- Background scan runs nightly for missed duplicates.
- Suspected duplicates surfaced to family admin in a merge queue.
- Merging requires admin action + audit log entry preserving both source records.

---

## 10. Working With Tasks

1. Read `docs/TASKS.md`. Tasks are sequenced. Always pick the next unfinished task unless explicitly told otherwise.
2. Each task has:
   - **Title**
   - **Goal** — what success looks like
   - **Acceptance Criteria** — testable outcomes
   - **Files to Touch** — likely scope
   - **References** — which docs to read first
3. Before starting a task:
   - Re-read this AGENTS.md
   - Read the linked doc references for the task
   - Confirm the task is not blocked by an incomplete earlier task
4. While working:
   - Make small atomic commits
   - Write tests alongside code (not after)
   - If you encounter ambiguity: document it in code as a `TODO(human):` comment, choose the most conservative interpretation, and add an entry to `docs/QUESTIONS.md`
5. Before opening a PR:
   - Run `pnpm lint && pnpm typecheck && pnpm test`
   - Update `docs/TASKS.md` to mark the task complete
   - Write a PR description summarizing what was done, what was decided, and what was deferred

---

## 11. Boundaries — What You Must NOT Do

- **Do not add features that are not in `docs/PRD.md`.** If you think a feature is missing, open a note in `docs/QUESTIONS.md`. Do not build it.
- **Do not change the tech stack** (Section 3) without explicit human approval.
- **Do not bypass verification logic** in the family tree, even for "testing convenience". Use proper seed scripts for test data.
- **Do not add third-party SDKs** that track users (analytics, ads, social SDKs). The application is privacy-first.
- **Do not commit secrets.** Use `.env` files (gitignored). Required environment variables are documented in `.env.example`.
- **Do not modify Prisma migrations** that have already been applied. Always create new migrations.
- **Do not assume cultural context.** When in doubt about a Chechen/Circassian/Arab cultural detail, read `docs/CULTURAL_GLOSSARY.md` or leave a comment for human review.
- **Do not bundle multiple features into one task.** One task = one focused change.
- **Do not delete records.** Use soft delete with `deleted_at` timestamps. The audit history is sacred.

---

## 12. Local Development Setup

```bash
# Prerequisites: Node 20+, pnpm 9+, Docker Desktop, Expo CLI, iOS Simulator or Android Emulator

git clone <repo>
cd 3sheerti
pnpm install

# Start infrastructure (Postgres, Redis)
docker-compose up -d

# Backend
cd apps/backend
cp .env.example .env
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev

# Mobile (in a new terminal)
cd apps/mobile
cp .env.example .env
pnpm start
# Press 'i' for iOS simulator, 'a' for Android, or scan QR with Expo Go
```

---

## 13. Definition of Done (per task)

A task is complete when **all** of these are true:

- [ ] Acceptance criteria from `docs/TASKS.md` are met
- [ ] Code follows conventions in Section 6
- [ ] Tests written and passing
- [ ] Linter and typecheck pass with no errors
- [ ] All new user-facing strings translated (AR + EN minimum)
- [ ] No PII logged
- [ ] Cultural terms commented with glossary references
- [ ] PR description complete
- [ ] `docs/TASKS.md` updated to mark task complete

---

## 14. Decision Log Protocol

When you make a non-trivial decision (library choice, data shape, naming convention not in this file), add an entry to `docs/DECISIONS.md`:

```
## YYYY-MM-DD — [Short title]
**Context:** What problem prompted this decision.
**Decision:** What was decided.
**Rationale:** Why this choice.
**Alternatives considered:** What else was on the table.
**Consequences:** What this enables or blocks.
```

Future agents (and humans) will thank you.

---

## 15. Asking for Help

If you are blocked or genuinely unsure about a product decision, **stop and ask.** Do not invent product behavior. Do not "make it work somehow."

Add a `TODO(human):` comment in the code AND an entry in `docs/QUESTIONS.md`:

```
## YYYY-MM-DD — [Short title]
**Task:** [Task ID from TASKS.md]
**Question:** [The actual question]
**Why it matters:** [What downstream decisions depend on the answer]
**Your interim choice:** [What you did in the meantime, if anything]
```

---

**End of AGENTS.md** — This is the source of truth. When in doubt, re-read this file.
