# TradeGame — Positioning & Pitch Package

**Version:** 0.1 (Internal go-to-market strategy)
**Status:** Draft — strategy, not outbound. Internal HQ only.
**Scope:** How TradeGame is positioned and pitched to three audiences — players,
publishers/storefronts, and B2B educational licensees (brokerages, exchanges,
banks, schools) — plus the deck outline and the compliance posture that makes a
regulated-buyer pitch credible.

> ## ⛔ GATE BANNER — READ FIRST
>
> This is an **internal positioning document**, not an executed pitch and not
> outbound material. **Nothing here may be sent, published, or used in a sales
> conversation until ALL of the following are cleared:**
>
> - **Legal entity formed** (RISK_REGISTER §19 / ROADMAP Phase 1) — no commercial
>   pitching before the entity exists.
> - **Attorney review** of any revenue stream, B2B license, or brokerage/exchange
>   relationship (RISK_REGISTER §4 — *required, not optional*).
> - **Governance Tier B** in place before any product holding user data ships
>   (GOVERNANCE.md; GDD §9; ROADMAP Phase 2 hard gate).
> - **Broker/exchange integration** remains permanently excluded absent the
>   RISK_REGISTER §16a override path (owner + counsel + red-team + register
>   amendment). A *licensing/education* relationship is **not** an integration —
>   the distinction is drawn in §7 and is itself attorney-gated.
>
> Per WAVES.md worker rails, broker/referral relationships and compliance wording
> are **owner-queue** items. This doc *documents strategy*; it authorizes nothing.
> Nothing here reaches `TradeGame---Preview`.

---

## 1. The pitch in one line

**For players:** *Learn to trade the way gamers learn games — a joyful, 120-hour
journey that makes risk discipline the most satisfying skill in the game, with no
real money and no signals.*

**For partners:** *A process-honest trading-education game that regulated
institutions can stand behind, because it is built — structurally, in code — to be
incapable of giving advice, ranking by profit, or promising returns.*

**Logline:** *The trading game that teaches you to keep your head — not to get
rich.*

---

## 2. The thesis (why this, why now)

1. **Financial literacy is in demand and badly served.** The existing market is
   split between dry courses nobody finishes and dopamine apps that train ruin.
   There is a clean gap for *entertainment-first, integrity-first* education.
2. **Gamers already have the learning machinery.** Progression, replays,
   incremental mastery, studying losses without ego — the exact skills markets
   reward. TradeGame ports that culture (CONCEPT.md core insight).
3. **Regulators and institutions are increasingly hostile to hype.** A product
   whose *non-features* are guaranteed (no advice, no signals, no PnL ranking)
   is, paradoxically, the easiest trading product for a bank/broker/exchange to
   associate with — it lowers their risk instead of raising it.
4. **The integrity rails are a moat, not a tax.** Anyone can copy the art. Almost
   no one will copy the structural refusal to monetize advice — it's against the
   grain of the whole category. That refusal is the brand.

---

## 3. What it is (product summary)

A stylized 2D trading-education game across three first-class markets (crypto,
stocks, forex). Core systems, **already built or specced**:

- Deterministic, seeded sim engine with golden-replay test coverage
  (`sim/`, SIM_ENGINE_SPEC, 500+ tests).
- Four modes: paper sandboxes, scenario replays, strategy sandboxes, risk drills
  (GDD §5), each across all three markets.
- 36 authored lessons; ~13 drills; 6 authored scenarios + 6 advanced specced.
- Process-only progression: a six-rank ladder gated by skill, not profit
  (`rank.ts`), with a `lint-pnl` rail that *fails the build* if PnL scoring leaks
  in.
- A designed game-first experience layer and 120-hour campaign
  (`docs/game/EXPERIENCE_DESIGN.md`).

The full feel/vision lives in EXPERIENCE_DESIGN.md; this doc is how we *talk about*
the product to each buyer.

---

## 4. Audience & market

| Segment | Who | What they want | Our hook |
|---------|-----|----------------|----------|
| **Players** | Gamers curious about markets; burned-out retail traders; complete beginners | A fun, safe way in that won't scam them | "Practice freely, lose nothing real, learn the boring superpower." |
| **Publishers / storefronts** | Indie-friendly publishers; PC/mobile storefronts; education-game catalogs | A differentiated, defensible edutainment title with depth | A 120-hour progression game in an underserved, evergreen category, with built-in compliance. |
| **B2B licensees** | Brokerages, exchanges, banks, schools/universities | Credible, liability-lowering financial-education content for their users/students | A white-labelable education layer that *cannot* give advice — reducing, not adding, regulatory exposure. |

The three segments are sequenced, not parallel: **players first** (build the
product and proof), **publisher** as it matures, **B2B** only once the entity,
counsel, and Tier B gates are cleared (§10).

---

## 5. Go-to-market channels (each gated)

### A. Consumer game
- **Path:** community beta (ROADMAP Phase 3) → public launch (Phase 4) → storefront
  release.
- **Gate:** Phase 4 is a HARD revenue gate — any monetization needs attorney review
  + E&O/media-liability insurance (ROADMAP Phase 4; RISK_REGISTER §4).
- **Promo assets we already have:** WEBSITE_ONEPAGER, YOUTUBE_PLAN, CONTENT_CALENDAR.
  This package adds the *publisher-facing* framing those don't cover.

### B. B2B educational license
- **Path:** the same game, white-labelled or co-branded, offered to a broker /
  exchange / bank / school as the *education* surface for their users — explicitly
  decoupled from any trading account or order flow.
- **Gate:** attorney review (RISK_REGISTER §4) **and** confirmation it does not
  cross into broker integration (§16a) or advice. This is the highest-value and
  highest-risk channel; it does not open until §10's gates clear. See §7.

### C. Community (already in motion, gated)
- The Discord coaching community is the top of the funnel and the proof of culture
  (COMMUNITY.md). It feeds player acquisition and, eventually, B2B credibility
  ("here is a real, healthy, no-signals community").

---

## 6. Differentiation — the integrity moat

| vs. | They do | We do |
|-----|---------|-------|
| Guru Discords / signal sellers | Sell calls, flex PnL, "lifetime access" funnels | Structurally cannot sell advice; losses are curriculum (CONCEPT.md) |
| Paper-trading apps (broker sims) | A price-feed tool, no pedagogy | A designed *game* with a mentor, campaign, and process scoring |
| Dopamine trading apps | Reward outcome/chance, train ruin | Reward *process*; reckless wins feel hollow by design (EXPERIENCE_DESIGN §13) |
| Dry courses / certifications | Watch-and-forget | 120-hour playable progression; failure is safe and repeatable |

**The one-sentence moat:** *competitors would have to give up their primary
revenue model (selling advice/outcome dopamine) to copy us.* They won't.

---

## 7. B2B licensing posture (the part that needs counsel)

This is the channel that makes the prompt's "sellable to brokerages, exchanges,
and banks" real — and it is the channel most exposed to regulatory risk. The
posture that makes it *credible to a regulated buyer* is precisely our restraint:

- **What we offer:** a sealed *education* product — lessons, scenarios, drills, the
  game — that lowers the partner's customer-harm and complaint risk.
- **What we never offer:** order routing, account linkage, signals, advice,
  referral-for-commission, or any PnL-ranked surface. These are the very things
  that create the partner's liability.
- **The line (attorney-gated):** an *educational license* is content the partner
  shows their users. A *broker integration* is connecting the sim to real
  accounts/order flow — **permanently excluded** absent RISK_REGISTER §16a. The
  pitch must never blur these, and counsel must confirm the framing per
  jurisdiction (advice/RIA-trigger, marketing rules, suitability).
- **Affiliate/referral:** if any partner relationship involves compensation, it
  triggers the org-wide RISK_REGISTER §4 analysis and the affiliate-link policy
  (ROADMAP Phase 4). Not decided here.

**Bottom line:** the B2B story is strong *because* of the rails. We sell the
refusal. But not a word of this channel is actioned before §10.

---

## 8. Pitch deck outline (for when the gates clear)

A 10–12 slide deck, to be built and **legal-reviewed** before any external use:

1. **Hook** — "The trading game that teaches you to keep your head, not get rich."
2. **Problem** — education graveyard + dopamine-ruin apps (§2).
3. **Insight** — gamers already learn the way markets reward (CONCEPT.md).
4. **Product** — the four modes, three markets, the mentor & campaign (one screen
   of real gameplay, not mockups).
5. **The inversion** — process is the dopamine; reckless wins feel hollow
   (EXPERIENCE_DESIGN §13) — the demo moment.
6. **Depth** — the 120-hour progression and six-rank ladder.
7. **The moat** — the integrity rails as a defensible, hard-to-copy position (§6).
8. **Proof** — what's actually built: engine, tests, 36 lessons, scenarios,
   community (honest, current numbers only — no projections).
9. **Audience & channels** — players → publisher → B2B (§4–§5).
10. **Why partners win** — risk *reduction* for regulated buyers (§7).
11. **The lines we don't cross** — shown as a feature (WEBSITE_ONEPAGER §5).
12. **Ask** — tailored per audience; left blank until counsel + entity exist.

**Promo collateral checklist (all legal-reviewed, all entity-gated):** one-pager
(have draft), gameplay trailer, press kit, screenshot set, the deck above, a B2B
fact sheet on the compliance posture.

---

## 9. Honest current-state ("proof") rules

Because we will pitch to sophisticated, skeptical buyers, the proof section follows
strict honesty rules (and the no-performance-promise rail):

- State only what is **built and verifiable** (engine, tests, authored content,
  community size) — current numbers, never projections dressed as facts.
- **Never** show or imply trading performance, win rates, or returns — there are
  none, by design, and claiming any would violate the core posture.
- Clearly label what is *designed/specced* vs. *shipped* (this package and the
  briefs already do).
- Sim ≠ market disclaimer present in any demo (ROADMAP Phase 2).

---

## 10. Risks & gates (the checklist before anything ships outward)

| Gate | Source | Blocks |
|------|--------|--------|
| Legal entity formed | RISK_REGISTER §19, ROADMAP Phase 1 | Any commercial pitch at all |
| Attorney review of revenue/B2B | RISK_REGISTER §4 | Channels A (paid) and B entirely |
| Governance Tier B (data) | GOVERNANCE.md, GDD §9, Phase 2 | Any product holding user data |
| Broker-integration exclusion | RISK_REGISTER §16a | Any account/order-flow linkage (permanently, absent override) |
| E&O / media-liability insurance | ROADMAP Phase 4 | Public launch |
| Jurisdiction / RIA-trigger review | RISK_REGISTER §Regulatory | B2B framing per region |

Until these are green, this document's only job is to be *ready* — sharp
positioning the owner and counsel can act on the moment the gates clear.

---

## 11. AAR

**DESIGNED:**
- A positioning & pitch package covering all three audiences the prompt named
  (players, publishers/retailers, and B2B brokerages/exchanges/banks), with a
  deck outline and promo-collateral checklist.
- The B2B posture that makes a regulated-buyer pitch *credible* — selling the
  integrity rails as risk reduction (§7), the highest-value/highest-risk channel.
- The "integrity moat" articulation (§6) and the honesty rules for proof (§9).

**HELD THE LINE:**
- A prominent gate banner; every channel and the entire B2B story explicitly
  blocked behind entity (§19), attorney (§4), Tier B, and §16a gates. The doc
  authorizes nothing; it documents strategy, consistent with how the repo treats
  YOUTUBE_PLAN / WEBSITE_ONEPAGER (entity/deploy-gated drafts).

**OPEN (owner / counsel):**
1. Sequencing of publisher vs. B2B once gates clear — which first?
2. White-label vs. co-brand model for B2B (affects §7 framing) — counsel input.
3. Whether to commission the trailer/press kit now (cost) or post-vertical-slice.
4. Any monetization model at all — fully deferred to RISK_REGISTER §4.

---

*Internal strategy document. NOT outbound. Do not publish to the
`TradeGame---Preview` repo. No commercial use before the §10 gates clear.*
