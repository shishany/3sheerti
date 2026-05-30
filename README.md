# 3sheerti (عشيرتي)

> A digital home for the Chechen diaspora — and eventually any displaced people who want to keep their family, identity, and culture alive across borders.

## Vision

3sheerti is **identity preservation infrastructure** built around three pillars:

- **Identity** — a verified family tree organized by Chechen tradition (teip → family name → person)
- **Connection** — diaspora-spanning relationships, mutual aid, and emergency support
- **Memory** — language preservation, oral history archives, memorial pages, and cultural artifacts

The platform is invite-only, privacy-first, and community-governed. It is not a social network.

## Phased Roadmap

| Phase | Scope |
|-------|-------|
| 1 | Chechen family/tribe launch in Jordan |
| 2 | Chechen language module + global Chechen diaspora |
| 3 | Circassian (Adyghe, Kabardian) onboarding |
| 4 | Other Caucasian peoples (Ingush, Dagestani, Karachay-Balkar, Ossetian) |
| 5 | Generalized platform for any displaced community |

Currently building **Phase 1**.

## Quick Start (for developers)

See `AGENTS.md` for the full setup contract and conventions.

```bash
pnpm install
docker-compose up -d
pnpm dev  # runs backend + mobile in parallel
```

## Documentation

- **[AGENTS.md](./AGENTS.md)** — Instructions for AI coding agents (Codex). Read first.
- **[docs/PRD.md](./docs/PRD.md)** — Product Requirements Document.
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — System architecture, data model, security.
- **[docs/TASKS.md](./docs/TASKS.md)** — Sequenced development task queue.
- **[docs/CULTURAL_GLOSSARY.md](./docs/CULTURAL_GLOSSARY.md)** — Cultural terms reference.

## Tech Stack

**Mobile:** React Native (Expo) + TypeScript
**Backend:** NestJS + PostgreSQL + Redis
**Auth:** Phone OTP + JWT
**Hosting:** AWS Frankfurt (dev) → AWS Bahrain / Oracle Cloud Jordan (prod)

## Compliance

Built for **Jordan Personal Data Protection Law (No. 24 of 2023)** compliance from day one.

## License

Private — not yet open-sourced. All rights reserved.

## Owner

**Moneer** — Founder and Product Lead
