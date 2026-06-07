# TradeGame — Advanced Tier Design Brief

**Version:** 0.1 (Design brief — not scenario specs)
**Status:** Draft. Answers V1 open items 3 and 4 and positions Intermediate tier
correctly before V1 locks.
**Scope:** What "advanced" means in TradeGame, 4–6 scenario concepts (one per market
minimum), NG+ hook, prereq philosophy, and the News Policy Card backport decision.
**Ethics rail:** All definitions, concepts, and scenario frames here comply with
GDD ethics pillars P2 and P5. No signals product. No PnL scoring. No gambling loops.

---

## 1. What "Advanced" Means in TradeGame

Advanced does not mean advanced signals. It does not mean access to more
"alpha." Advanced means the player is managing more variables simultaneously
over longer timeframes, operating in market conditions where a single clean
process rule is insufficient and where the player must hold competing hypotheses,
track correlated exposure across multiple positions, and make active drawdown
decisions across sessions rather than single-event windows.

Three specific capabilities distinguish advanced from intermediate:

**Multi-position management.** The player holds more than one open position, possibly
in different instruments or correlated assets, and must track how they interact. An
intermediate scenario isolates one instrument and one event. An advanced scenario
requires the player to decide whether a second position increases or compounds the
risk of the first.

**Correlated exposure across instruments.** Instruments in the same market or across
markets can move together under stress. Advanced scenarios make this visible: a player
running two positions that looked independent discovers their effective exposure under
a scenario stress event. The lesson is recognizing the hidden correlation before it
becomes a realized loss, not predicting which instrument moves.

**Regime recognition across longer arcs.** V0 and V1 scenarios run 40–90 minutes of
sim time and teach event-level pattern recognition (a depeg, a sweep, an earnings fade).
Advanced scenarios run multiple sessions or compress longer time arcs and ask the player
to recognize that the market regime has shifted — trending to ranging, trending up to
trending down — and to adjust their position management policy accordingly, not just
their entry timing.

**Drawdown-recovery campaigns.** The player begins a scenario with an account already in
drawdown and must navigate back toward a recovery threshold without overleveraging or
revenge-trading. The lesson is structured: what does a sound drawdown-recovery policy
look like, and what behaviors in a drawdown constitute process errors versus defensible
decisions under constraint?

What advanced does NOT mean: access to "advanced signals," pattern libraries with
predictive power, or any mechanic that implies certain chart configurations reliably
predict price. The no-signals-product rule is permanent across all tiers.

---

## 2. Advanced Tier and the NG+ / Recursive Progression Idea

The GDD's rank progression (`Observer → Trainee → Practitioner → Journeyman →
Strategist → Senior Strategist`) positions Advanced scenarios as the Strategist and
Senior Strategist tiers. The GDD's gamification notes (memory: MeniscusMaximus
gamification design) reference a recursive NG+ loop — the idea that completion
unlocks a replayable layer with harder conditions.

The Advanced tier plugs directly into that loop:

- An Advanced scenario may be replayed in "NG+ mode" where one or more parameters
  are altered: starting account size reduced, starting correlation level elevated,
  drawdown depth increased, or a second instrument added to the position panel. The
  core scenario structure is preserved; the added variable tests whether the player's
  process generalizes or was tuned to the first-pass conditions.
- Senior Strategist rank can unlock a "Blind Replay" mode: the scenario's event type
  is not announced in the title card. The player must diagnose the regime from price
  and volume alone before the first decision point. This is pure process mastery, not
  pattern memorization.
- Completion of a full advanced campaign (one scenario per market, clean process run)
  unlocks a "coach candidate" flag, consistent with GDD §7's coach-role design intention.
  This is a progression hook, not a separate account type.

NG+ does not add content cost — it reuses authored scenarios with parameterized
difficulty modifiers. That is its design virtue.

---

## 3. Prerequisite Philosophy: Process Mastery Gates, Not PnL

Advanced scenarios are gated on demonstrated process mastery, never on profit
milestones. Specific gating philosophy:

A player unlocks an advanced scenario by completing the full prerequisite chain from
the relevant Intermediate scenario, PLUS demonstrating the specific process skill that
the advanced scenario extends. Examples:

- Multi-position management unlock requires that the player has completed at least two
  Intermediate scenarios in the same market and has the `stop_before_entry` and
  `stop_honored` process metrics at 100% across their last three scored runs in that
  market. The metric check is per the ScoreTracker output, not the player's self-report.
- Regime recognition unlock requires that the player has completed both a trending and
  a ranging variant of the relevant market's Intermediate scenarios, so the contrast
  is established before the advanced scenario layers in the ambiguity of recognizing
  which regime is active.
- Drawdown-recovery campaign unlock requires the player has completed the "Drawdown
  Survival" risk drill at the current rank level. The drill is the conceptual
  prerequisite; the campaign is the extended application.

TUNABLE: The specific process-metric thresholds (e.g., 100% stop_honored across last
three runs vs. a lower bar) are first-pass design. Playtest will reveal whether the
bar is appropriately challenging or gatekeeps without developmental purpose.

No XP threshold unlocks an advanced scenario. A player who has earned large XP totals
from non-process paths (repeated observation-only runs) is not automatically eligible.
The gate is specific metric compliance on the prerequisite chain.

---

## 4. Scenario Concepts

Six concepts are outlined below, one per market minimum (two crypto, two stocks, two
forex). These are design concepts — not full scenarios. Each concept identifies the
teaching target, the multi-position or regime element that makes it advanced, the
canon fictional instruments from V0/V1, the approximate sim window, and a first-pass
prerequisite chain.

---

### ACN-001: The Correlated Cascade — HarborUSD and GLIMMER Under Stress
**Market:** Crypto
**Teaching target:** Hidden correlation between a stablecoin position and a volatile
asset position under market stress. The player holds or enters two positions: a
GLIMMER spot long (from the AMM scenario's instrument, now in spot) and a HarborUSD
short hedge. The advanced insight is that in a crypto market stress event, both
positions can move against the player simultaneously — the hedge is not a hedge when
correlation spikes to 1. The scenario teaches that portfolio-level exposure in crypto
is not the sum of individual position risks when a structural event is occurring.
**Multi-position element:** Two concurrent positions, both in the player's portfolio
at the same time. The position panel must show combined notional exposure, not just
individual positions.
**Regime arc:** A slow-range regime that the player misreads as safe, transitioning
abruptly to a correlated-crash regime triggered by an EventInjector stress hook.
**Canon instruments:** GLIMMER (spot), HarborUSD/USVC
**Approx sim window:** 120 minutes at 1x (3 sessions worth of crypto time, 24/7)
**Prerequisite chain:** SCN-001 clean, SCN-004 clean, Correlation Awareness drill
completed; `stop_before_entry` and `stop_honored` at 100% across last 3 scored runs

COSTLY: The position panel must display aggregate notional exposure across multiple
open positions simultaneously. This is a new UI surface not present in V0/V1.
SPEC GAP: SIM_ENGINE_SPEC §3.4 specifies position and margin models per market but
does not specify a multi-position aggregate exposure display. This is an implicit
requirement of advanced scenarios and needs to be added to the spec before ACN-001
is implemented.

---

### ACN-002: The Drawdown Campaign — Recovering on HarborUSD/GLIMMER
**Market:** Crypto
**Teaching target:** Structured drawdown recovery without revenge-trading or
overleveraging. The player begins the scenario with a simulated account at -18% from
a prior peak (the session opens with this context stated explicitly — it is not a
consequence of play within the scenario, it is the starting condition). The player
must reach -8% or better (a partial recovery) over the scenario window without
triggering a stop-out at -25%. The lesson is that drawdown recovery requires sizing
DOWN, not up — the math of drawdown means a loss of 20% requires a gain of 25% to
recover, and adding leverage to accelerate recovery amplifies the risk of going further
into drawdown first.
**Multi-position element:** The player may run at most one open position at a time in
this scenario. The constraint is designed to prevent the common error of "running
multiple positions to recover faster."
**Regime arc:** Multiple regime transitions across the window; the player must adapt
sizing and exposure to each without the option of simply riding a single trend.
**Canon instruments:** HarborUSD/GLIMMER spot pair
**Approx sim window:** 90 minutes at 1x
**Prerequisite chain:** ACN-001 clean (or Intermediate crypto campaign complete);
Drawdown Survival drill at Practitioner level

TUNABLE: The -18% starting drawdown and -8% recovery target and -25% stop-out level
are first-pass. The numbers must be calibrated so that an aggressive "average down"
strategy reliably fails the scenario more than 60% of the time, while a disciplined
sized approach reliably succeeds more than 50% of the time. These are the playtest
calibration targets.

---

### ACN-003: Five Sessions, Two Positions — NGSM and VLDI Concurrent Exposure
**Market:** Stocks
**Teaching target:** Managing concurrent equity positions across multiple sessions
when both instruments exhibit sector correlation. NGSM (from SCN-002, the earnings
gap stock) and VLDI (from SCN-005, the index inclusion stock) are both in the player's
portfolio simultaneously. The scenario compresses to cover three trading sessions. On
session 2, a simulated sector rotation event hits the fictional "industrial and
technology" sector containing both stocks. The player must decide whether their
combined exposure is within their session risk budget, and whether to reduce one or
both positions before the rotation event becomes visible in price.
**Multi-position element:** Two concurrent equity positions with a common sector factor.
The process score includes a metric for whether the player checked combined exposure
at the start of each session (a "daily review" behavior).
**Regime arc:** Sector-level regime shift across three sessions; the intraday dynamics
of each session differ from the prior.
**Canon instruments:** NGSM and VLDI
**Approx sim window:** 90 minutes at 1x (three simulated sessions, each 30 minutes)
**Prerequisite chain:** SCN-002 clean, SCN-005 clean; `stop_before_entry` and
`stop_honored` at 100% across last 3 stocks-market scored runs

COSTLY: SCN-005 already requires multi-session engine capability flagged as COSTLY in
V1. ACN-003 extends that requirement with two concurrent equity positions. Confirm
multi-session engine is implemented before this scenario enters authoring.

---

### ACN-004: The Reversal Campaign — NMX 100 Regime Shift
**Market:** Stocks
**Teaching target:** Recognizing that a market index (the NMX 100, a fictional index
used as a market regime indicator in this scenario) has transitioned from a trending
to a mean-reverting regime, and adjusting position management policy accordingly. The
player holds a VLDI long from a prior session-entry. The scenario runs across two
sessions during which the NMX 100 transitions from a trending up regime to a ranging
regime. The lesson: a trend-following stop strategy appropriate for a trending market
becomes a series of whipsaws in a ranging market. The player must recognize the regime
change and decide whether to tighten, flatten, or exit based on what they observe, not
on prediction.
**Multi-position element:** Single position in VLDI, but the NMX 100 index serves as a
second data stream the player must monitor to contextualize the single-position
management decision. This is an information-management challenge, not a second trade.
**Regime arc:** The central teaching element. Two distinct regimes across the sim window.
**Canon instruments:** VLDI (fictional equity), NMX 100 (fictional index, used here as
a contextual indicator, not a tradeable instrument in this scenario)
**Approx sim window:** 80 minutes at 1x (two sessions, each 40 minutes)
**Prerequisite chain:** SCN-005 clean, ACN-003 concept familiar (regime labeling)

SPEC GAP: SIM_ENGINE_SPEC does not define a non-tradeable index display surface. For
ACN-004 to work as designed, the NMX 100 must be renderable as a read-only reference
chart alongside the primary VLDI chart. This is a new UI panel requirement. Flag before
authoring.

---

### ACN-005: Multi-Session Carry — ANDU Across Three Sessions
**Market:** Forex
**Teaching target:** Managing a multi-session position on ANDU across three London
sessions, including an overnight carry cost, a surprise regime shift on session 2, and
a scheduled-event choice on session 3 (the News Policy Card from SCN-006 returns here).
The player must decide at the end of each session whether to hold overnight (incurring
carry cost), flatten, or reduce. The advanced insight: holding a forex position through
session boundaries is not the same as holding through intraday noise — carry cost,
weekend gap risk, and regime changes between sessions are all live variables.
**Multi-position element:** Single ANDU position held across sessions. The "multiple
positions" complexity here is temporal, not simultaneous — managing the same position
as the market context changes between sessions. This is a deliberate stepping-stone
to ACN-006's simultaneous positions.
**Regime arc:** Session-to-session regime variation across three London sessions; a
ranging session 1, a trending session 2, and a news-event session 3.
**Canon instruments:** ANDU
**Approx sim window:** 120 minutes at 1x (three compressed sessions)
**Prerequisite chain:** SCN-003 clean, SCN-006 clean (News Policy Card familiarity
required — it recurs here); `stop_honored` at 100% across last 3 forex scored runs

TUNABLE: Carry cost rate for ANDU overnight positions is a new mechanic not specified
in the current order model or sim engine. First-pass: carry cost = TUNABLE: 0.5 pips
per overnight hold per lot. Needs calibration against the scenario's teaching target
(carry cost should be visible and meaningful, but not dominant — it is a factor to
weigh, not an automatic penalty).

COSTLY: Overnight carry cost is a new mechanic in the order model. SIM_ENGINE_SPEC §3
does not include carry cost calculation. This requires an addition to the forex position
and margin model before ACN-005 can be implemented.

---

### ACN-006: The Correlation Crisis — ANDU and a Second Pair
**Market:** Forex
**Teaching target:** Two concurrent forex positions in pairs that look independent
(ANDU and a second fictional major, here designated SOLU — a fictional pair with a
high-liquidity profile) are revealed to share a common factor exposure during a
simulated macro stress event. The player holds both positions and must manage combined
pip exposure, not just the individual positions. The lesson: forex position sizing
must account for correlation, not just individual stop-to-account-size calculations.
**Multi-position element:** Two concurrent forex positions. The aggregate margin and
combined pip exposure must be visible. The scenario includes a point at which the player
is required to calculate — and journal — their total account exposure in percentage
terms across both positions before proceeding.
**Regime arc:** A two-phase structure: a normal-session phase where the positions appear
independent, followed by a macro-event phase where correlation becomes visible.
**Canon instruments:** ANDU; SOLU (fictional major pair — new addition to canon,
described as fictional in the scenario, not modeled on or named after a real pair)
**Approx sim window:** 90 minutes at 1x
**Prerequisite chain:** ACN-005 clean; Correlation Awareness drill (Forex variant,
to be authored); `stop_before_entry` and `stop_honored` at 100% across last 3 forex
scored runs

COSTLY: SOLU is a new canon fictional instrument. Its introduction requires a second
forex adapter config and a new instrument entry in the fictional instrument registry.
Moderate cost — reuses the forex synthetic generator, just needs a new seed profile
and pip value.

OPEN: Should SOLU be named here or left as a placeholder for the owner to name? The
pattern from existing canon (HarborUSD, GLIMMER, NGSM, VLDI, ANDU, NMX 100) suggests
a name before authoring begins. Defer to owner.

---

## 5. Answering V1 Open Items

### V1 Open Item 4: Advanced Tier Design Brief

The brief above answers V1 open item 4 directly. Recommendation: open this brief now
(before V1 scenarios lock) so that:

a. Intermediate scenario difficulty can be calibrated against what comes after it.
   The dead-cat bounce in SCN-001 and the no-trade-zone in SCN-002 are deliberate
   "intermediate traps" — they make sense as traps only if the player has a visible
   advanced tier to progress toward.

b. The multi-position aggregate display surface (flagged as a new UI requirement in
   ACN-001 and ACN-006) can be planned in the Phase 2 UI sprint rather than
   retrofitted later. If the spec team knows this panel is coming, they can stub it
   in Phase 2.

c. The NMX 100 fictional instrument and SOLU fictional instrument can be registered in
   the fictional instrument registry alongside existing canon names before any scenario
   references them, preventing naming drift.

No intermediate scenario needs to be modified as a consequence of opening this brief.
Intermediate content is correctly positioned as-is; the brief clarifies what comes after.

### V1 Open Item 3: News Policy Card as a Reusable Pre-Event Pattern

V1 asked: should the News Policy Card (introduced in SCN-006) become a reusable
component — a "pre-event declaration" pattern — that V0 scenarios could adopt?

**Recommendation: Yes, generalize it. Backport as a "Plan Card" to V0 scenarios. Here
is the specification.**

#### Rationale

The News Policy Card is not news-specific. It is a structured pre-commitment mechanic:
before a scenario event window that the player can see coming, they declare their
policy and journal their reasoning. This behavior maps directly to GDD pillar P2
(process over outcome) and is one of the most measurable process behaviors in the
scoring engine.

V0 scenarios already have journal prompts (the SCN-002 pre-open journal, the SCN-003
hypothesis journal at 07:45). The difference is that those are prompts — they are
dismissible and do not require a declared policy. The Plan Card upgrades a dismissible
prompt into a non-blocking declaration that is tracked for policy-adherence XP (the
same `policy_match` metric introduced for the News Policy Card in SCN-006).

The pattern generalizes as: "Plan Card — before this event window, declare what you
will do and why."

#### Backport Spec: Plan Card in SCN-001, SCN-002, SCN-003

**What changes in each scenario:**

**SCN-001 (HarborUSD Depegging):**
Trigger: T-10 to T0 (the lesson card phase). Currently, a lesson card is shown and
must be dismissed before trading. Replace the lesson card dismiss with a Plan Card.

Plan Card text:
> "HarborUSD is near its peg. The setup you observed could resolve without a depeg —
> or this could be the beginning of a structural break. Before T0 (first price deviation):
> choose one option and write your reasoning (minimum 20 characters).
> (A) I will not trade unless the second confirmation leg appears (T+6 or later).
> (B) I will enter with a position at most 1% account risk, stop pre-defined, if a clear
>     signal appears at T0.
> (C) I will observe only and journal. I will not trade this scenario."

Policy-adherence metric: same pattern as SCN-006. If the player selects A and trades
at T0, it is a mismatch. If they select B and enter with no stop, it is a mismatch.
Mismatches are flagged in debrief; no XP subtracted; the flag is informational.

XP impact: +20 XP for completing the Plan Card with journal entry (new line in the
rubric). The no-trade-with-observation XP line (+40 XP) already in the rubric maps to
option C and is preserved. The Plan Card completion is a prerequisite for that XP to
be awarded (same as News Policy Card in SCN-006).

**SCN-002 (Northgate Systems Earnings Gap):**
Trigger: Decision Point A (09:00 pre-market drift, "plan phase"). Currently, the
journal panel auto-opens with a prompt the player can dismiss. Replace with a Plan Card.

Plan Card text:
> "NGSM gaps up at open. You have 30 minutes before the regular session. Write your
> plan for the session.
> (A) I will not trade in the first 5 minutes of the regular session (no-trade-zone rule).
> (B) I will look for a breakout above [player-stated level] with a stop at [player-stated
>     level] and at most 1% account risk.
> (C) I will observe only. If I see a fade develop, I will journal the observation."

Note: options B requires the player to fill in their own levels — this is a plan, not a
pick-one template. The Plan Card accepts free text for B; the scoring engine flags whether
a level and a stop were named (word-count check on "stop" token in the journal text,
same approach as SCN-006's 30-character minimum).

XP impact: +20 XP for Plan Card completed with journal. The existing +25 XP for "trade
plan written before 09:30 open" becomes the policy-match XP: awarded when the declared
plan matches the player's actual behavior through the session.

**SCN-003 (London Open Sweep on ANDU):**
Trigger: 07:45 context phase. Currently, a lesson card is shown and an order book
observation is prompted. Add a Plan Card at the end of the lesson card, before the
08:00 event window opens.

Plan Card text:
> "The Asian session range is marked. London opens in approximately 15 minutes. Session
> opens often test the Asian range extremes.
> (A) I will wait for a sweep below 1.2790 and a confirmed rejection before considering
>     any entry. I will not trade during the spread spike at 08:00.
> (B) I will observe only. I expect spread cost to be high at open and will not trade
>     until spread normalizes.
> (C) I have no hypothesis yet. I will observe and journal what I see."

XP impact: +20 XP for completing the Plan Card. Existing "hypothesis journaled before
first trade" (+25 XP) is refined: for Plan Card option A or B to earn the hypothesis XP,
the journal entry in the Plan Card must contain the reasoning (not just the option label).

#### Cost Estimate for Backport

**Small (S):** If the Plan Card is implemented as a configuration-driven variant of
the News Policy Card modal (same component, different text and option labels per
scenario), the engineering cost is:
- 1 new UI component (Plan Card modal, variant of the News Policy Card modal already
  specced for SCN-006)
- 3 scenario config updates (SCN-001, SCN-002, SCN-003): add `plan_card` block to the
  scenario YAML, referencing the modal component
- Scoring engine addition: `plan_card_completed` and `policy_match` metrics wired into
  the ScoreTracker (same pattern as the News Policy Card metrics in SCN-006)
- New XP rubric rows in each of the three scenarios (+20 XP lines)
- No changes to tick pipeline, order model, or replay format

Total estimated effort: **S (small)** — one sprint for a developer with Phaser
familiarity and access to the scenario config files. The News Policy Card in SCN-006
is the functional prototype; the backport is a configuration exercise, not a new build.

If the Plan Card is built as a bespoke component per scenario rather than reusing the
News Policy Card pattern, cost increases to **M (medium)** — three separate implementations
rather than one configurable component. Recommend the shared-component approach.

---

## AAR

**DESIGNED:**
- Advanced tier definition (multi-position management, correlated exposure, regime
  recognition across longer arcs, drawdown-recovery campaigns; no "advanced signals").
- Six scenario concepts covering all three markets (two crypto: ACN-001, ACN-002;
  two stocks: ACN-003, ACN-004; two forex: ACN-005, ACN-006) using only canon fictional
  instruments plus one new instrument placeholder (SOLU).
- NG+ recursive loop hook: parameterized difficulty replay and Blind Replay mode for
  Senior Strategist rank.
- Prerequisite philosophy: process-metric gates not PnL, specific metric thresholds,
  no XP-total unlock.
- V1 open item 4 answered: brief opened before V1 locks.
- V1 open item 3 answered: News Policy Card generalizes to a "Plan Card" for V0
  scenarios; full backport spec with per-scenario changes; cost estimate S (small)
  using shared component pattern.

**TUNABLE:**
- Drawdown campaign numbers (ACN-002): -18% start, -8% target, -25% stop-out.
  Calibrate so aggressive averaging fails >60% of the time.
- Process-metric gate thresholds for advanced unlock: 100% stop_honored across
  last 3 runs is first-pass; validate in playtest.
- Overnight carry cost for ANDU (ACN-005): 0.5 pips per lot per overnight hold.
- Plan Card journal minimums: 20 characters for SCN-001/003; free-text with level/stop
  requirement for SCN-002. Validate in playtest (same concern as News Policy Card's
  30-character minimum).

**COSTLY:**
- Multi-position aggregate exposure display (new UI panel, needed for ACN-001 and
  ACN-006 — not present in V0/V1 UI surface; flag for Phase 3 UI sprint).
- Multi-session persistent position state (needed for ACN-003/004/005 — already
  flagged COSTLY in SCN-005/V1; confirm engine capability before advanced authoring).
- Overnight carry cost in the forex order model (new mechanic, not in
  SIM_ENGINE_SPEC §3.4; needed for ACN-005).
- SOLU instrument registration (new forex config; moderate cost — reuses generator).

**OPEN:**
1. SOLU instrument name: accept placeholder or owner names it now?
2. NMX 100 as a non-tradeable reference chart (ACN-004): does this require a new
   chart panel mode in Phaser, or is a second read-only IMarketFeed display sufficient?
3. Correlation Awareness drill (Forex variant): not yet authored. ACN-006 requires it
   as a prerequisite. Add to drill backlog.
4. Advanced tier rank names: "Strategist" and "Senior Strategist" are in the GDD
   progression. Do advanced scenarios map one-per-rank, or does a Strategist-tier player
   unlock the full advanced campaign?
5. Plan Card backport: owner approval needed before V0 scenario configs are modified.
   Backport is S-cost but changes authored scenario files — treat as a design decision,
   not a refactor.
