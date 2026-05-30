# Product Requirements Document (PRD)

> Phase 1 product specification for 3sheerti.
> This is the source of truth for what to build. If a feature is not in this document, it is not in scope.

---

## 1. Vision and Mission

3sheerti is **identity preservation infrastructure** for the Chechen diaspora — and eventually for any displaced people.

### Mission

To give every Chechen — wherever they were born or now live — a verified, lasting connection to their family, their teip, their homeland, their language, and their ancestors. The platform is the digital extension of what elders have always done: holding the knowledge of who belongs to whom, and passing it on.

### Non-mission

3sheerti is **not** a social network. It is not built for posting, scrolling, advertising, dating, or any engagement-maximizing behavior. Every feature must directly serve identity, connection, or memory. Features that maximize time-on-app at the expense of dignity or privacy are out of scope forever.

---

## 2. Target Audience (Phase 1)

### Primary launch community
Chechen families currently living in Jordan, with strong concentrations in:
- Sweileh (Amman)
- Zarqa
- Suwayfiyya (Amman)
- Greater Amman

### Personas

#### "Founding Elder" — Hajj Ibrahim, 68, Sweileh
Senior member of the Dawlat family. Has tribal genealogical knowledge passed orally from his father. Cares deeply that his grandchildren know their lineage. Speaks Arabic and some Chechen. Uses WhatsApp. Smartphone-capable but not heavy-tech user. The first person who must adopt the platform — without him, no one trusts it.

#### "Branch Admin" — Khalid, 45, Amman
Younger middle-generation, IT-comfortable. Becomes a family administrator. Maintains the family tree on behalf of his branch. Adds deceased relatives. Verifies position claims from cousins. Recruits cousins to join.

#### "Adult Member" — Moneer, 35, Riyadh (diaspora)
Living abroad, wants to stay connected to extended family in Jordan and Chechnya. Onboards via the lineage walk-up. Browses tree, contacts cousins, checks who's traveling near him, donates blood when needed.

#### "Diaspora Cousin" — Aslan, 50, Berlin
Born in Jordan, moved to Germany. Has children who speak no Chechen and barely Arabic. Joins 3sheerti specifically to give his kids access to their language module and family identity.

#### "Young Generation" — Layla, 17, Amman
Granddaughter of Hajj Ibrahim. Curious about her grandmother's stories. Uses the elder voice-bank feature, plays the language learning module, sees her cousins worldwide.

#### "Lost Lineage" — Yusuf, 28, refugee from Syria
Family of Chechen descent, displaced from Syria. Knows his father and grandfather's names but not the family name or teip. Uses the "elder help me trace my family" flow to reconnect with his lineage.

---

## 3. Phased Roadmap

This PRD covers **Phase 1** in detail. Future phases are sketched here for context only.

| Phase | Scope | Status |
|-------|-------|--------|
| **1** | Chechen family/tribe launch in Jordan: identity, tree, verification, memorial, blood, language seed | **CURRENT** |
| 2 | Chechen language module, global Chechen diaspora, mutual aid features expanded | Future |
| 3 | Circassian (Adyghe, Kabardian) onboarding | Future |
| 4 | Other Caucasian peoples | Future |
| 5 | Generalized platform for any displaced community | Future |

---

## 4. Phase 1 — Functional Requirements

Phase 1 ships the following modules. Each is fully specified below.

1. Authentication and Onboarding
2. Lineage Walk-Up Wizard
3. Family Name Discovery and Creation
4. User Profile and Privacy Settings
5. Family Tree Visualization
6. Verification and Approval Workflows
7. Memorial Pages
8. Blood Type Registry and Emergency Requests
9. Language Module (Seed)
10. Notifications
11. Search (Restricted)

---

### 4.1 Authentication and Onboarding

**Goal:** A new user can sign up, verify their identity, and begin onboarding within 3 minutes.

#### Functional requirements

- Phone-based registration. International format (E.164). Default country: Jordan (+962).
- 6-digit OTP via SMS. 5-minute expiry. Maximum 5 OTP requests per hour per phone.
- Existing user re-login: same OTP flow.
- Language selection on first launch: Arabic (default) or English.
- Optional biometric unlock setup after first successful login.
- No email, no password, no social login.

#### Acceptance criteria

- User can request OTP within 5 seconds of submitting phone number.
- User can verify OTP and reach onboarding wizard within 10 seconds.
- Rate limiting blocks abuse without blocking legitimate retries.
- Sign-out clears all stored tokens; re-login is required.

---

### 4.2 Lineage Walk-Up Wizard

**Goal:** Every new user is placed into the correct position in the family tree through a guided lineage interview.

#### The wizard flow

**Step 1 — Personal basics**
- Given name (in preferred language)
- Gender
- Birth year (year only initially; full date optional later)
- Current country and city

**Step 2 — Teip selection**
- Searchable dropdown of built-in teips
- Show teip info card on selection: name (AR/EN), origin region, notable history
- "I don't know my teip" path: marks the user as unknown_teip and routes to elder help

**Step 3 — Family name discovery**
- Searchable list of registered family names within the selected teip
- If found: proceed to Step 4 (lineage walk-up against this family)
- If not found: offer "Request to create your family name" flow
  - User provides: family name (AR + EN), oldest known ancestor, optional origin aul, optional description
  - Submission creates a `family_name_request` in pending state
  - User can continue with onboarding, but their position remains in pending state until family is approved
  - Notification sent to teip elders for review

**Step 4 — Lineage walk-up loop**
- Wizard asks: "What is your father's first name?"
- Real-time duplicate detection: as the user types, candidates from the selected family appear with confidence scores
- Each candidate shows: name (AR/EN), birth/death year, father's name, photo (if available), verification badge, who added them
- User selects:
  - "Yes, this is my father" → user's claimed Person is linked as this person's child
  - "No, different [name]" → continue to add new Person stub
  - "Not sure, ask family elder" → routes to elder help, user can continue
- If continuing with new stub: wizard creates a stub Person and asks for father's father (grandfather)
- Loop continues upward until: matched existing branch, reached oldest known ancestor of the family, or user can't go further
- Maximum walk-up depth: 6 generations (configurable)

**Step 5 — Horizontal enumeration**
- "Do you have brothers?" → user enters count, then names (one per row)
- "Do you have sisters?" → same (modesty default applies for stubs)
- "What is your mother's first name?" → captures maternal connection
- "What is your mother's family name and teip?" → if known, creates cross-family link
- "Do you have father's brothers (paternal uncles)?" → optional; helps fill the tree
- "Do you have father's sisters (paternal aunts)?" → optional
- "Are you married?" → if yes, spouse first name, family name, teip (if Chechen) or "non-Chechen"
- "Do you have children?" → count and names

**Step 6 — Origin and current location**
- "What is your family's original aul?" → searchable list + free-text fallback
- "Where do you live now?" → already collected in Step 1, confirm

**Step 7 — Cross-references**
- "Do you know any other relatives already on 3sheerti?" → search + invite if not yet
- "Anyone you'd like to invite right now?" → contact picker, sends invites

**Step 8 — Profile privacy defaults**
- Photo visibility: family only / first-degree only / verified members within N degrees / nobody
- Phone visibility: same options
- Blood type visibility: all verified by default (opt-out to most private)
- For female users: modesty mode toggle (initials only externally) prominently presented

**Step 9 — Tree preview**
- Render the user's position in the family tree (Personal Hourglass view)
- Show current verification status: Pending
- Show who has been notified to verify (family admin, named relatives who are users, teip elder)
- Explain expected wait time

#### Acceptance criteria

- Wizard can be completed in 5-10 minutes for an average user.
- Wizard state is saved per step; user can leave and resume.
- Every step is fully bilingual (AR + EN).
- Duplicate detection returns matches within 500ms of input.
- All stubs created are marked Pending and respect modesty defaults.

---

### 4.3 Family Name Discovery and Creation

**Goal:** Users can find existing family names within their teip, or request creation of new ones with proper governance.

#### Requirements

- Searchable, paginated list of registered family names per teip
- Each family name shows: name (AR/EN), teip, oldest known ancestor, origin aul, family admin(s), member count (visible to verified users)
- Family name creation flow as described in Step 3 above
- Family name request approval flow:
  - Teip elders for that teip receive a notification
  - Elder reviews: name, requester, lineage info
  - Elder approves (becomes the registry-approver) or rejects with reason
  - Requester is notified of decision
  - On approval: requester becomes family admin; family name becomes active in registry
- Duplicate family name handling: if name already exists in same teip, system warns requester and offers walk-up to determine if same family or distinct parallel family

#### Acceptance criteria

- Search returns results within 300ms.
- Approval flow completes in under 60 seconds of elder action.
- Audit log captures every approval/rejection with elder identity.

---

### 4.4 User Profile and Privacy Settings

**Goal:** Every user can view and edit their profile with granular privacy controls.

#### Profile fields

- Name (AR/EN, optional CE)
- Gender (read-only after onboarding; change requires step-up auth)
- Birth date (Gregorian + Hijri)
- Photo (optional)
- Current location (country + city)
- Origin aul (their family's ancestral village)
- Family name (read-only — assigned via lineage)
- Teip (read-only)
- Blood type (optional)
- Profession (optional)
- Nickname / kunya (optional)
- Vird (optional, hidden by default)
- Languages spoken (optional)

#### Privacy controls (per field)

- **All verified members** (within their accessible network)
- **Within N degrees** (configurable, default 4)
- **First-degree only** (immediate family)
- **Family-only** (same family_name_id)
- **Mahram only** (close blood relatives + spouse, for sensitive fields)
- **Private** (only the user)

#### Special: Modesty mode

Female users have a one-tap modesty toggle that, when on:
- Photo hidden from all except mahram + spouse
- Profile name shown as initials + family name to non-family
- Phone hidden except first-degree

#### Acceptance criteria

- Privacy changes take effect immediately for all viewers.
- Step-up auth required for: modesty changes, photo upload changes, gender changes, removing verified relatives.
- All changes audit-logged.

---

### 4.5 Family Tree Visualization

**Goal:** Users see their family tree in an intuitive, beautiful, culturally-respectful interface.

#### Views (toggleable)

- **Personal Hourglass** (default): centered on user, 3 generations above + 2 generations below, spouses adjacent, siblings on horizontal strip
- **Teip View**: browse everyone in the user's teip, grouped by family name
- **Aul View**: map-based view of everyone whose origin is in a selected village
- **Path View**: given any two persons, show the relationship path between them

#### Person card elements (in tree)

- Avatar circle (initials if no photo, photo if visible to viewer)
- Name in primary language (Arabic by default)
- Transliteration in secondary language
- Teip badge (purple chip)
- Family name (small text)
- Verification badge (gold/silver/bronze corner indicator)
- Living/deceased state (subtle diagonal pattern for deceased)
- Origin → current location (e.g. "Vedeno → Sweileh")
- Blood type chip (if visibility permits)

#### Interactions

- Tap a card → re-center tree on that person (with animation)
- Long-press → quick actions menu (view profile, request connection, propose edit, view memorial if deceased)
- Pinch zoom; pan
- Expand collapsed branches (uncles, distant cousins) with explicit user action

#### Acceptance criteria

- Tree renders within 1 second for families up to 500 persons.
- Smooth 60fps animations on mid-range Android (e.g. Samsung A52).
- Verification badges visible without need to inspect a profile.
- All elements work in RTL and LTR layouts.

---

### 4.6 Verification and Approval Workflows

**Goal:** Every claim on the tree is verified before becoming part of the trusted graph.

#### Types of verification (recap)

1. **Family name creation request** — approved by teip elder
2. **Position claim** — approved by family admin + 1 witness, OR teip elder
3. **New Person addition** — approved per Section 9 of AGENTS.md
4. **Edit to verified Person** — minor edits immediate (audit logged), major edits require admin approval
5. **Merge proposal** — admin reviews suspected duplicates

#### Verifier dashboard

Family admins and teip elders see a dedicated dashboard:
- Pending position claims (with proposed lineage and evidence)
- Pending Person additions
- Pending family name requests (elders only)
- Suspected duplicate merge proposals
- Recently completed actions

Each item has clear Approve / Reject / Request More Info actions.

#### Notifications

- Verifiers notified immediately upon a pending action
- Requester notified within 1 minute of resolution
- Expiry: pending position claims auto-expire after 30 days

#### Acceptance criteria

- All verifications produce an immutable audit_log entry.
- Rejected actions include a structured reason; requester can resubmit with corrections.
- Verifier UI works on mobile (no dedicated web admin in Phase 1).

---

### 4.7 Memorial Pages

**Goal:** Honor deceased relatives with rich, lasting memorial profiles.

#### Functional requirements

- Every deceased Person automatically gets a memorial page
- Memorial pages contain:
  - Full name (AR/EN/CE), dates
  - Photo(s)
  - Family lineage (parents, siblings, spouses, children)
  - Biography (community-contributed)
  - Photos and memories from family members
  - Stories submitted by relatives (text, audio, or video)
  - Du'a (prayers) submitted by family members — counted publicly
  - Hijri-aware death anniversary reminders to relatives
- Comments / stories are moderated by family admin
- Memorial visibility follows family privacy rules

#### Acceptance criteria

- Family member can submit a memory in under 30 seconds.
- Audio memories can be recorded in-app (up to 5 min).
- Death anniversaries trigger gentle notifications 7 days before, on the day, and on Hijri equivalent.

---

### 4.8 Blood Type Registry and Emergency Requests

**Goal:** A relative who needs blood can find compatible family members instantly.

#### Functional requirements

- Users opt-in to blood type registry with consent toggle
- Blood type visible on profile (per privacy settings)
- Emergency request flow:
  - User initiates: "I need [blood type] in [city] for [reason]"
  - System identifies compatible family members in the same city (or within N km)
  - Push notification sent to matches: "Urgent: cousin Moneer needs O- blood in Amman"
  - Matches can respond: Available / Not available / On the way
  - Requester sees responses in real time
- Request auto-closes after 24 hours
- All requests are audit-logged
- Anti-abuse: max 1 emergency request per user per 24h

#### Acceptance criteria

- Request reaches matched users within 5 seconds.
- Notifications work even when app is closed (push).
- Privacy: requester sees only first names of responders unless responder explicitly shares more.

---

### 4.9 Language Module (Seed)

**Goal:** A read-only seed of Chechen language content to demonstrate the value before full language learning launches in Phase 2.

#### Phase 1 content

- "Word of the day" (one Chechen word per day with: pronunciation audio, meaning in Arabic and English, example sentence, cultural note)
- 100 essential phrases (family terms, greetings, courtesies)
- Audio pronunciation by native speakers
- Searchable phrase library

#### Phase 2 (out of scope here but informs schema design)

- Interactive lessons, pronunciation scoring, kids' mode, elder voice-bank contributions

#### Acceptance criteria

- Word of the day visible on home screen.
- Phrase library searchable in AR/EN.
- Audio playback works offline once cached.

---

### 4.10 Notifications

**Goal:** Users receive timely, contextual notifications about events that matter.

#### Notification kinds (Phase 1)

- **Verification request** — "Your cousin needs you to confirm their relationship"
- **Verification result** — "Your position has been verified by [admin]"
- **Family name approval** — "Your family name request has been [approved/rejected]"
- **Blood request** — "Urgent: Cousin Moneer needs blood"
- **Birthday reminder** — "It's [relative]'s birthday today"
- **Death anniversary** — "Today is [relative]'s death anniversary"
- **New relative joined** — "Your cousin [name] just joined 3sheerti"
- **Memorial activity** — "[relative] shared a memory of [deceased]"
- **Invitation accepted** — "[name] joined via your invitation"

#### Delivery channels

- Push notifications (FCM + APNs)
- In-app notification center
- No email notifications (no email collected)

#### User controls

- Per-category enable/disable in settings
- Do-not-disturb hours (silent push during sleep)

---

### 4.11 Search (Restricted)

**Goal:** Users can find people, family names, and auls within their accessible network — never beyond.

#### Search scopes (segregated)

- **People** — only within user's verified accessible network (default: up to 4 degrees of relationship)
- **Family names** — all registered family names visible
- **Teips** — all registered teips visible
- **Auls** — all registered auls visible

#### Constraints

- No global "find anyone" search
- No reverse phone lookup
- Search results respect each individual's privacy settings (hidden fields stay hidden)

---

## 5. Cross-Cutting Requirements

### 5.1 Localization
- AR (default), EN (fallback) at launch
- All UI strings via i18next
- RTL layout fully supported
- Hijri calendar throughout

### 5.2 Accessibility
- Minimum WCAG 2.1 AA equivalent on mobile
- Screen reader support (TalkBack, VoiceOver)
- Sufficient contrast in both light and dark modes
- Font scaling respected up to 200%

### 5.3 Performance
- App cold start under 3 seconds on mid-range Android
- Tree view interactive within 1 second of opening
- API p95 response time under 500ms

### 5.4 Privacy (Jordan PDP Law)
- Explicit consent for sensitive data
- Data subject rights: access, correction, deletion (via settings → privacy → my data)
- Breach notification protocol documented and rehearsed
- DPO contact published in privacy policy

### 5.5 Reliability
- 99% uptime target for Phase 1 (will increase post-launch)
- Daily encrypted backups, monthly restoration tests
- Graceful offline mode: users can view cached tree even without network

---

## 6. Out of Scope for Phase 1

Explicitly NOT in Phase 1:

- Web application (mobile only)
- Marketplace and commerce (Phase 2-3)
- Real-time chat / messaging (use existing platforms like WhatsApp)
- Public discoverability of users
- Email-based communication
- Payments
- DNA matching integration
- AI chatbot or conversational assistant
- Circassian onboarding
- Advanced language learning (gamified lessons, pronunciation scoring)
- Group video calling
- Wedding planner / event RSVP
- Skills directory / profession matching (Phase 2)
- Family fund / sandooq (Phase 2)
- Travel notifications ("I'm visiting Amman")

---

## 7. Success Metrics (Phase 1)

- **Adoption**: 200 verified members from at least 30 family names within the first 6 months
- **Tree completeness**: average family has 70% of living adult members verified
- **Verification time**: 90% of position claims resolved within 7 days
- **Engagement**: 60% of users return weekly in the first 3 months
- **Trust**: zero confirmed cases of false identity in the verified tree
- **Safety**: zero data breach incidents
- **Cultural fit**: positive review by 5 founding elders before public expansion

---

**End of PRD.**

For implementation guidance see `docs/ARCHITECTURE.md` and `docs/TASKS.md`.
