# TradeGame — Phased Roadmap

Sequence-based. No dates. Each phase completes when exit criteria are met; capacity varies
across a solo founder + AI-agent build team.

---

## Phase 0 — Docs, Governance, Social Audit

**Goals**
- Core documents in place: CONCEPT, ROADMAP, RISK_REGISTER, GDD, COMMUNITY, GOVERNANCE.
- Social-presence audit complete: Facebook page reviewed/claimed, Telegram channels
  catalogued per `docs/COMMUNITY.md`, Discord server created with skeleton channel
  structure and roles.
- Governance scaffold applied: Tier B designation noted (community data in third-party
  platforms; own-platform trigger documented in RISK_REGISTER → Operational).
- Legal framing locked: education/process-coaching language adopted everywhere; no
  per-person trade advice in any published material (RISK_REGISTER → Regulatory).

**Exit Criteria**
- All core docs committed to HQ repo.
- Discord server live with `#rules`, `#start-here`, `#announcements`, and at least one
  channel per market (crypto, stocks, forex) — all gated behind rules-acceptance.
- Social-audit notes committed.
- Phase 0 compliance gate passed (see below).

**Dependencies**
- None; this phase is the foundation.

**Compliance Gate**
- Confirm "education + process-coaching only" framing is reflected in Discord rules,
  Facebook page bio, and Telegram channel descriptions before any public invitation.
- Review RISK_REGISTER §Regulatory and §No-Signal-Selling before proceeding.

---

## Phase 1 — Community Soft-Launch

**Goals**
- Discord open to an invited seed cohort (not public-facing yet).
- Seed content live for all three markets: crypto, stocks, forex — at minimum one
  pinned resource thread per market covering market structure, risk basics, and
  paper-trading pointers.
- Coaching ladder v0 defined: tiers, how members advance, what "coaching" means
  (process review, not trade advice).
- Weekly cadence established: one recurring community event per week (replay review (process) session, market-structure walkthrough, or replay-session placeholder).
- Moderation playbook drafted and at least one moderator beyond the founder trained.

**Exit Criteria**
- Legal entity formed before any public-facing activity (Discord invites, social posts, website launch).
- Seed cohort active (members posting; at least two weekly cadence events completed).
- Coaching ladder v0 documented and linked in Discord `#start-here`.
- Scam-defense measures in place: "coaches never DM first" pinned rule, scam-report
  channel live, verification system active (RISK_REGISTER → Reputational).
- No signal channels exist; any ad-hoc signal posts removed under documented policy
  (RISK_REGISTER → No-Signal-Selling).
- Phase 1 compliance gate passed.

**Dependencies**
- Phase 0 complete (docs, Discord scaffold, governance framing).

**Compliance Gate**
- Coaching ladder language reviewed against RISK_REGISTER §Regulatory: confirm no
  tier or coaching description implies personalized investment advice.
- Geo-sensitivity check: Discord channel descriptions note that leveraged forex access
  varies by jurisdiction; no brokerage referrals posted (RISK_REGISTER → Jurisdiction).

---

## Phase 2 — Game Vertical Slice

**Goals**
- Paper-trading sandbox built for ONE scenario per market: one crypto scenario, one
  stocks scenario, one forex scenario (see `docs/GDD.md` for scenario spec).
- Scenario replay prototype functional: a completed trade scenario can be replayed
  with annotated decision points.
- "Sim is not the market" friction points implemented per GDD — visible in UI at
  scenario start, end, and any leaderboard view (RISK_REGISTER → Game-Specific).
- Process-based scoring implemented; outcome-only leaderboards explicitly not used
  (RISK_REGISTER → Game-Specific).

**Exit Criteria**
- Three playable scenarios (one per market) deployed to a staging environment.
- Replay prototype demoed to at least three community members; feedback captured.
- Sim/market disclaimer visible at every scenario entry point.
- GDD updated to reflect any design decisions made during build.
- Phase 2 compliance gate passed.

**Dependencies**
- Phase 1 community active (real users to demo to).
- GDD finalized for vertical-slice scope.

**Compliance Gate**
- Confirm game mechanics contain no real-money transactions, no gambling mechanic,
  no referral-to-broker integration (RISK_REGISTER → Regulatory, Game-Specific).
- Review Discord ToS on embedded tools or linked external apps if game is web-hosted
  and linked from Discord (RISK_REGISTER → Platform).
- **Hard gate — must be cleared BEFORE the vertical slice ships with user accounts or any real/historical market data:**
  - Tier B data governance in place: privacy policy published, data retention schedule documented, breach response plan written, COPPA analysis complete (see GDD §9 governance note).
  - Age screen at account creation implemented and verified.
  - Market-data license review complete for any non-synthetic data source (see GDD §11 Q1/Q2 hard gate); "educational use" is not a recognized carve-out — do not use unlicensed data.

---

## Phase 3 — Game Beta in Community

**Goals**
- Game progression wired to coaching ladder: advancing in-game unlocks coaching
  resources or coaching-tier recognition (not trade advice).
- Beta open to full Discord community.
- Replay-review sessions live: weekly or bi-weekly structured session where a
  scenario replay is walked through by a coach in voice/video.
- Moderation playbook updated for game-adjacent behavior: overconfidence signals,
  gambling-adjacent language, leaderboard toxicity.
- Member mailing list established (own the list, not solely Discord) as continuity
  hedge (RISK_REGISTER → Platform).

**Exit Criteria**
- At least two replay-review sessions run with recorded notes.
- Progression↔coaching-ladder integration confirmed working end-to-end.
- Mailing list onboarding flow live in `#start-here`.
- No real-money trade outcomes surfaced in game or coaching channels without
  disclaimer; paper-first culture enforced (RISK_REGISTER → Community Harm).
- Phase 3 compliance gate passed.

**Dependencies**
- Phase 2 vertical slice stable and playtested.
- Coaching ladder v0 in active use by community.

**Compliance Gate**
- Review RISK_REGISTER §Community Harm: confirm addiction/gambling-adjacent
  moderation playbook is current.
- Confirm minor-exclusion measures remain effective at current community scale
  (Discord age gate, no targeting minors).

---

## Phase 4 — Public Launch + Optional Paid Cohorts

**Goals**
- Community opens to public discovery: Discord invite public, social presence
  (Facebook, Telegram, potential YouTube/TikTok) active and consistent.
- Revive or replace social channels audited in Phase 0; apply current branding and
  community framing.
- Game publicly accessible (linked from website and social).
- Optional: paid coaching cohorts — structured, time-limited, process-focused cohorts
  with explicit disclaimers.

**Exit Criteria**
- Public invite live; first wave of organic members onboarded without major moderation
  incidents.
- If paid cohorts launched: legal review completed and documented (RISK_REGISTER →
  Regulatory marks this as REQUIRED before any monetization).
- Platform contingency tested: website live with its own signup/mailing-list path
  independent of Discord (RISK_REGISTER → Platform).
- Affiliate link policy decided and documented if any referral links are used
  (RISK_REGISTER → Jurisdiction).
- Phase 4 compliance gate passed.

**Dependencies**
- Phase 3 community and game beta stable.
- Legal review completed if paid cohorts are in scope.

**Compliance Gate — HARD GATE**
- ANY revenue stream — paid cohorts, cosmetics, donations, server subscriptions,
  paid roles — requires attorney review before launch. Not optional. See RISK_REGISTER §4.
  The org does not launch any paid tier without this gate explicitly cleared and documented.
- E&O (errors and omissions) and media-liability insurance in place before public launch.
- Crypto regulatory status check at time of launch (rules change; a check done at
  Phase 0 is stale by Phase 4).
- Reconfirm no signal-selling, no brokerage referrals, no RIA-triggering language
  in any paid-tier collateral.

---

## Cross-Phase Standing Rules

These apply at every phase and are not re-litigated at each gate:
- No signal channels. Ever. (RISK_REGISTER → No-Signal-Selling)
- Paper-first culture in all beginner spaces.
- Coaches never DM first.
- Sim ≠ market friction points present in any game surface.
- Risk register reviewed whenever a new platform, market, or revenue stream is added.
