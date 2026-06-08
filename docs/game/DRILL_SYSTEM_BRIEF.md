# TradeGame — Drill System Brief

**Version:** 1.0
**Status:** Design — feeds Phase 3 build wave + red-team pass
**Branch:** work/drill-design
**Date:** 2026-06-07
**Feeds:** rank.ts `drillsRequired` fill, gating.ts advisory→hard flip, Phase 3 DrillScene build

---

## Table of Contents

1. [Drill Catalog v1](#1-drill-catalog-v1)
2. [Economy Math](#2-economy-math)
3. [Rank Gate Assignments](#3-rank-gate-assignments)
4. [Anti-Headcanon Protocol](#4-anti-headcanon-protocol)
5. [Retry and Failure Rules](#5-retry-and-failure-rules)
6. [Scenario Prereq Flip](#6-scenario-prereq-flip)
7. [Engine and UI Surface Inventory](#7-engine-and-ui-surface-inventory)
8. [Posture Rails](#8-posture-rails)
9. [Open Questions for the Owner](#9-open-questions-for-the-owner)

---

## 1. Drill Catalog v1

### 1.1 Canonical Drill IDs — Reconciliation with Live Manifest

Four drill IDs are live in shipping scenario prereqs (scn001–006). This brief adopts them
verbatim. No renames; no migration needed.

| Live ID (canonical) | Scenario that requires it |
|---|---|
| `drill:position-sizing-crypto` | SCN-001, SCN-004 |
| `drill:position-sizing-stocks` | SCN-002, SCN-005 |
| `drill:position-sizing-forex` | SCN-003, SCN-006 |
| `drill:stop-placement-v1` | All six scenarios (market-agnostic v1) |

The remaining catalog entries below are new IDs introduced by this brief.

---

### 1.2 Drill Type A — Position Sizing Puzzle

**Teaching objective:** Given account size, declared risk percentage, and stop distance,
calculate the correct position size. Understand why overleveraging is a process failure
independent of outcome.

**Core interaction — what the player sees and does:**

The drill opens an input screen (not a live chart). Three labeled fields are presented:
- Account size: e.g. "Sim account: $10,000"
- Declared risk: e.g. "Your rule: 1% per trade"
- Stop distance: expressed in market-appropriate units (pips for forex, $ for stocks,
  % for crypto)

The player enters their calculated position size in a fourth field. A submit button is
available after the field is non-empty. No time pressure.

Below the input fields, a reference card is shown: the formula that was taught in the
prerequisite lesson (provenance-tagged — see §4). The reference card is always visible
during the drill; it is not a crutch, it is the lesson. Players are expected to apply
a shown formula, not recall it under stress.

On submit, the drill shows: player's answer, correct answer, step-by-step calculation,
and an explanation of what the input values represented in a real trading context.
The explanation is always shown regardless of pass or fail.

**Pass criteria — process predicates only:**

The player's submitted position size is within TUNABLE: ±10% of the formula-correct value.
This matches the `size_compliance` metric tolerance already in the scoring engine.

No time limit. No penalty for re-reading the reference card. Pass is binary (within
tolerance or not).

**Market variants:**

| Drill ID | Market | Stop distance unit | Formula shown |
|---|---|---|---|
| `drill:position-sizing-crypto` | Crypto | % from entry | `qty = (account × risk%) / (entry × stop%)` |
| `drill:position-sizing-stocks` | Stocks | $ per share | `shares = (account × risk%) / stop_distance_$` |
| `drill:position-sizing-forex` | Forex | Pips | `lots = (account × risk%) / (pip_value × stop_pips)` |

TUNABLE: the numeric scenario for each variant (account size, risk %, stop distance).
Values are re-rolled on retry (see §5). Three problem sets per variant are sufficient
for v1; authoring more is additive, not breaking.

**Difficulty tier:** Beginner (all three variants)

**XP award:** TUNABLE: 40 XP each. See §2 for economy rationale.

**Provenance:** Foundation Track lesson F-05 (risk sizing) and the market-specific pillar
introduction lessons.

---

### 1.3 Drill Type B — Stop Placement Challenge

**Teaching objective:** Identify a technically sound stop placement relative to
support/resistance levels and normal price structure. Understand why stops placed
inside noise get hit before the trade thesis is invalidated.

**Core interaction — what the player sees and does:**

A static annotated chart is displayed (no live feed, no order book). The chart shows
a candlestick sequence with two or three labeled S/R zones. A directional entry arrow
is shown at a labeled price. The player drags a stop line to their chosen level using
the chart's existing order-ticket affordance (reuse the TradingScene stop-price field
in a non-live context — see §7).

On submit, a coach annotation overlay (scenario_authored type, per SIM_ENGINE_SPEC §5.3)
explains the placed stop relative to the structure shown. The explanation covers: whether
the stop was inside a wick-range (likely noise), whether it was below the S/R zone with
margin, and what a normal adverse wick looks like at this instrument/market.

The stop-placement assessment is structural only: "above/below the key level + margin
vs. inside the level." It is never a price-target statement.

**Pass criteria — process predicates only:**

Pass = stop placed beyond the authored key S/R level in the correct direction (below
support for a long, above resistance for a short), with at least TUNABLE: one average
candle body of clearance. The authored clearance zone is defined in the drill config
as a price range, not a single number, to accommodate different interpretations of
structure.

Fail = stop placed inside the consolidation range, inside the nearest wick, or on the
wrong side of the S/R level.

**Market variants:**

| Drill ID | Market | Chart context |
|---|---|---|
| `drill:stop-placement-v1` | All markets (v1 is market-agnostic) | Synthetic generic structure, introduced pre-market-specific drills |
| `drill:stop-placement-crypto` | Crypto | High-volatility wick environment, larger clearance expectation |
| `drill:stop-placement-stocks` | Stocks | Session-open candle range, earnings-gap gap-fill context |
| `drill:stop-placement-forex` | Forex | Session-open sweep context (London open, matching SCN-003 archetype) |

The live `drill:stop-placement-v1` ID retains its current function as the first-touch
cross-market drill. The three market-specific variants are new, gating Practitioner and
above (see §3).

**Difficulty tier:**
- `drill:stop-placement-v1`: Beginner
- `drill:stop-placement-crypto/stocks/forex`: Intermediate

**XP award:** TUNABLE: 40 XP (Beginner variant), TUNABLE: 55 XP (Intermediate variants).
See §2.

**Provenance:** Foundation Track lesson F-06 (stop placement), market-specific pillar
beginner lessons on structure.

---

### 1.4 Drill Type C — Drawdown Survival

**Teaching objective:** Distinguish between: (a) a normal drawdown within a sound plan,
and (b) a drawdown caused by process failure (no stop, oversizing, adding to losers).
Demonstrate that the path back from drawdown is through discipline, not through larger
bets.

**Core interaction — what the player sees and does:**

A live TradingScene session loads with the sim account already in a configured drawdown
state (TUNABLE: -8% from starting balance for the Beginner variant; TUNABLE: -15% for
Intermediate). The player sees the account equity display and the existing Position Panel.

An authored rule card is shown at session start (dismissible after reading — requires one
explicit "I have read this" click, logged as an EventLog event, but not a multi-step gate):

> "Rule for this drill: you may not add to an existing losing position. You may close
> positions, open new ones, or hold. The drill ends when you reach your starting balance
> or exhaust the account."

The player manages the position over TUNABLE: 15 minutes of sim time. Normal TradingScene
tools are available: order ticket, journal, time compression. The journal is not required
to pass, but using it earns the `journal_before_trade` XP event as normal.

The drill ends at session close, win or loss.

**Pass criteria — process predicates only:**

Pass is NOT reaching breakeven. Pass = demonstrating the rule was followed:
- `no_add_to_losers`: no `order_submit` on an instrument where the player already holds
  an open position at a loss (evaluated at submit time: unrealized PnL < 0 for the
  position in that instrument). This requires a new process predicate — see §7.
- `stop_honored` on any new position opened during the drill.

Fail = any `order_submit` that violates `no_add_to_losers`.

The debrief shows whether the rule was honored and the final account equity — not as a
PnL score, but as context for understanding what the rule permitted and constrained. The
coaching copy explains the Kelly Criterion logic (why adding to losers increases ruin
probability) without referencing the player's specific dollar result.

**Market variants:**

| Drill ID | Market | Starting drawdown | Sim duration |
|---|---|---|---|
| `drill:drawdown-survival-crypto` | Crypto | TUNABLE: -8% | TUNABLE: 15 min sim |
| `drill:drawdown-survival-stocks` | Stocks | TUNABLE: -8% | TUNABLE: 15 min sim |
| `drill:drawdown-survival-forex` | Forex | TUNABLE: -10% (leverage amplifies) | TUNABLE: 15 min sim |

**Difficulty tier:** Intermediate (all three variants)

**XP award:** TUNABLE: 55 XP each. See §2.

**Provenance:** Foundation Track lessons F-07 (drawdown) and the risk-management pillar
content.

---

### 1.5 Drill Type D — "Blow Up on Purpose"

**Teaching objective:** Experience the mechanical sequence of account ruin from
overleveraging — feel the speed, understand the math, see which specific decisions caused
it. The goal is visceral understanding of the margin model, not entertainment.

**Core interaction — what the player sees and does:**

A live TradingScene session. The player is given an explicit instruction card at session
start:

> "This drill asks you to try to empty this sim account. Use any method. The drill ends
> when the account is empty or when you choose to stop. The debrief will show exactly
> which decisions caused the loss."

The instruction card must include a one-sentence reminder: "This is a practice account —
no real money involved." This is non-dismissible for TUNABLE: 5 seconds, then becomes
dismissible.

Normal trading tools are available. There is no additional constraint: the player can do
anything the engine permits.

At session end (account zero or player ends it), the debrief is the product. It shows a
decision-by-decision annotated replay of every order: size relative to account, effective
leverage, which order triggered the margin call sequence, and the tick at which the stop-
out fired. The coaching copy uses the blowup as the teaching context — naming the
mechanics (overleveraging, no stop, adding to losers), not the specific bad outcome.

**Pass criteria — process predicates only:**

This drill has a non-standard pass definition. Because the instruction is to blow up the
account, the traditional process metrics are inverted for scoring purposes.

Pass = debrief completed. The learning is in the debrief; the session outcome is
irrelevant to the XP award. There is no pass/fail on the trading session itself.

Two additional process metrics are checked in the debrief:
- `blowup_mechanism_identified`: the player selects, from a multiple-choice prompt in
  the debrief screen, which mechanism primarily caused the loss (overleveraging /
  no stop / adding to losers / combined). This is not a trick question — the debrief
  shows the annotated sequence before the question is asked. This is the anti-headcanon
  protocol in action: the correct answer is derivable solely from what the player just
  observed. TUNABLE: +10 XP bonus for selecting the mechanically correct option.
- `debrief_completed` (standard, +30 XP): always awarded on debrief reach.

The debrief question is the only knowledge-check in this drill. It must comply with
§4 (anti-headcanon protocol) in full.

**Market variants:**

| Drill ID | Market | Starting account | Notes |
|---|---|---|---|
| `drill:blowup-crypto` | Crypto | TUNABLE: $10,000 | High sigma increases speed of ruin |
| `drill:blowup-stocks` | Stocks | TUNABLE: $10,000 | Cash account; ruin requires full capital loss |
| `drill:blowup-forex` | Forex | TUNABLE: $10,000 | Leverage makes ruin fastest; most instructive |

**Difficulty tier:** Intermediate (all three variants)

**XP award:** TUNABLE: 40 XP base (debrief_completed) + TUNABLE: 10 XP bonus
(blowup_mechanism_identified). See §2.

**Provenance:** Foundation Track F-08 (leverage and margin), forex pillar leverage
content, risk-management module.

---

### 1.6 Drill Type E — Correlation Awareness

**Teaching objective:** Observe that multiple positions in different instruments can
behave as a single correlated position in a crisis. Understand that diversification
across correlated assets does not reduce risk during a correlated shock.

**Core interaction — what the player sees and does:**

A live TradingScene session. The player is shown three open positions already in their
sim account (pre-authored starting state — player did not open them). The positions are
in instruments that appear uncorrelated under normal conditions but are correlated during
a crisis. The drill brief card names the instruments and asks the player to observe and
journal their prediction: "What do you expect to happen to each position if a sharp
market-wide move occurs?"

The player writes a journal entry (required — the journal prompt is the interaction).
They can observe the market, adjust positions, or hold. A scripted flash-crash event
fires at TUNABLE: T+5 minutes. All three positions are affected. The session ends at
TUNABLE: T+12 minutes.

The debrief shows the correlation in the crisis explicitly: a chart overlay of all three
positions during the event, annotated with a coach note explaining why crisis correlation
collapsed the diversification assumption. The debrief references the player's pre-event
journal prediction.

**Pass criteria — process predicates only:**

- `pre_event_journal`: a journal entry with tag `hypothesis` or `pre_event` exists
  before the flash crash event fires (before T+5). TUNABLE: +20 XP.
- `debrief_completed`: +30 XP.
- `correlation_observation_written`: a journal entry exists after the flash crash
  event, tagged `exit` or `post_event`. TUNABLE: +15 XP.

The debrief does not quiz the player on the correlation value or the instrument names.
The journal entries are the mechanism; the debrief coaching text is the teaching.
No knowledge-check questions in this drill — the process predicate is journaling, not
recall.

**Market variants:**

| Drill ID | Market | Correlation archetype |
|---|---|---|
| `drill:correlation-crypto` | Crypto | BTC-correlated altcoins (FICTIONAL_CANON instruments) |
| `drill:correlation-stocks` | Stocks | Sector correlation under index shock (same sector, different names) |
| `drill:correlation-forex` | Forex | USD-correlated pairs (ANDU/HarborUSD + KORVA/HarborUSD) |

**Difficulty tier:** Intermediate (all three variants)

**XP award:** TUNABLE: 65 XP maximum (20 + 30 + 15). Base (debrief only) = 30 XP.
See §2.

**Provenance:** Advanced-tier prerequisites. Correlation awareness is an advanced-beginner
concept; prereq lesson to be confirmed by curriculum (OPEN-2 below).

---

### 1.7 Drill Catalog Summary Table

| Drill ID | Type | Market | Tier | XP | Prereq lesson(s) |
|---|---|---|---|---|---|
| `drill:position-sizing-crypto` | Pos. sizing puzzle | Crypto | Beginner | 40 | F-05, crypto pillar intro |
| `drill:position-sizing-stocks` | Pos. sizing puzzle | Stocks | Beginner | 40 | F-05, stocks pillar intro |
| `drill:position-sizing-forex` | Pos. sizing puzzle | Forex | Beginner | 40 | F-05, forex pillar intro |
| `drill:stop-placement-v1` | Stop placement | All (generic) | Beginner | 40 | F-06 |
| `drill:stop-placement-crypto` | Stop placement | Crypto | Intermediate | 55 | F-06 + crypto beginner |
| `drill:stop-placement-stocks` | Stop placement | Stocks | Intermediate | 55 | F-06 + stocks beginner |
| `drill:stop-placement-forex` | Stop placement | Forex | Intermediate | 55 | F-06 + forex beginner |
| `drill:drawdown-survival-crypto` | Drawdown survival | Crypto | Intermediate | 55 | F-07 |
| `drill:drawdown-survival-stocks` | Drawdown survival | Stocks | Intermediate | 55 | F-07 |
| `drill:drawdown-survival-forex` | Drawdown survival | Forex | Intermediate | 55 | F-07 |
| `drill:blowup-crypto` | Blow up on purpose | Crypto | Intermediate | 40+10 | F-08 |
| `drill:blowup-stocks` | Blow up on purpose | Stocks | Intermediate | 40+10 | F-08 |
| `drill:blowup-forex` | Blow up on purpose | Forex | Intermediate | 40+10 | F-08 |
| `drill:correlation-crypto` | Correlation awareness | Crypto | Intermediate | 30–65 | Advanced-beginner |
| `drill:correlation-stocks` | Correlation awareness | Stocks | Intermediate | 30–65 | Advanced-beginner |
| `drill:correlation-forex` | Correlation awareness | Forex | Intermediate | 30–65 | Advanced-beginner |

Total catalog: 16 drills (the 4 live IDs plus 12 new). All 5 GDD types covered across
all 3 markets.

---

## 2. Economy Math

### 2.1 Existing Scenario XP Reference

Scenario rubrics (from live scn00*.ts files, trading-path totals):

| Scenario | Market | Trade-path XP | Patience-path XP |
|---|---|---|---|
| SCN-001 | Crypto | 95 (trade) + 30 + 10 = 135 | 95 + 30 + 10 = 135 |
| SCN-002 | Stocks | 110 (trade) + 30 + 10 = 150 (approx) | 125 + 30 + 10 = 165 |
| SCN-003 | Forex | 120 (trade) + 30 + 10 = 160 (approx) | 135 + 30 + 10 = 175 |
| SCN-004 | Crypto | 100 (trade) + 30 + 10 = 140 | 80 + 30 + 10 = 120 |
| SCN-005 | Stocks | 120 (trade) + 30 + 10 = 160 | 125 + 30 + 10 = 165 |
| SCN-006 | Forex | 170 (trade) + 30 + 10 = 210 | 135 + 30 + 10 = 175 |

Approximate scenario range: 120–210 XP per scenario.

### 2.2 Rank Thresholds (from rank.ts CANONICAL_LADDER)

| Rank | XP Required | Gap from previous |
|---|---|---|
| Observer | 0 | — |
| Trainee | 200 | 200 |
| Practitioner | 800 | 600 |
| Journeyman | 2,000 | 1,200 |
| Strategist | 4,500 | 2,500 |
| Senior Strategist | 8,000 | 3,500 |

All thresholds TUNABLE.

### 2.3 Intended Player Progression Curve

**Design intent:** a player who completes the recommended on-ramp (Foundation lessons +
the Beginner drills + one scenario per market) reaches Trainee before they encounter
the first Intermediate scenario.

**Foundation lessons XP estimate:** TUNABLE: 9 lessons × TUNABLE: 15 XP average = ~135 XP.
(Lesson XP is "fixed by lesson length" per GDD §7; this brief assumes short Foundation
lessons at ~15 XP each. Curriculum brief holds the authoritative lesson XP values.)

**Beginner drills:** 4 drills × 40 XP = 160 XP.
(`drill:position-sizing-crypto`, `drill:position-sizing-stocks`,
`drill:position-sizing-forex`, `drill:stop-placement-v1`)

**First scenario (SCN-001):** ~135 XP (patience path — safe default for first play).

**Running total before Intermediate scenarios:**

```
Foundation lessons:  ~135 XP  (TUNABLE)
Beginner drills:      160 XP  (4 × 40)
SCN-001 first play:  ~135 XP
─────────────────────────────
Subtotal:            ~430 XP
```

Trainee threshold = 200 XP. Player reaches Trainee after Foundation lessons + two
Beginner drills (200 XP). They reach Practitioner (800 XP) after completing the full
Beginner drill set, Foundation lessons, and approximately 3–4 scenarios. This is the
intended pacing.

**Intermediate drills (12 drills):**
- Stop placement intermediate (3 × 55 XP) = 165 XP
- Drawdown survival (3 × 55 XP) = 165 XP
- Blow up on purpose (3 × 40 XP base) = 120 XP
- Correlation awareness (3 × ~55 XP average, partial earn likely) = ~165 XP
- Total intermediate drill XP available: ~615 XP

**Drill XP as fraction of total economy:** At 160 (Beginner) + ~615 (Intermediate) = 775
XP from drills, vs. ~1,050 XP from six scenarios (mid-path estimate), drills represent
~42% of the pre-Journeyman economy. This is intentional: drills are load-bearing but
never dominate scenario play.

TUNABLE: all drill XP values above. Primary tuning levers: if playtest shows players
drill-grinding past scenario gates, reduce drill XP. If players are blocked on scenario
gates despite completing drills, increase drill XP or reduce XP thresholds.

### 2.4 XP Formula

```
drill_xp(tier) = base_xp(tier) ± bonus(optional process predicates)

base_xp:
  Beginner     = TUNABLE: 40
  Intermediate = TUNABLE: 55

bonus predicates (drill-specific, optional):
  blowup mechanism identified = TUNABLE: +10
  correlation observation written = TUNABLE: +15
  correlation pre-event journal = TUNABLE: +20

GDD §7 rule: XP is fixed by difficulty tier, not by outcome.
Bonuses above are process predicates (journaling, identifying mechanics),
not outcome predicates (profit, accuracy of prediction).
```

---

## 3. Rank Gate Assignments

### 3.1 Proposed drillsRequired per Rank

This table fills the empty `drillsRequired: []` arrays in rank.ts CANONICAL_LADDER.
All IDs are from the catalog in §1. Gates are cumulative (rank.ts `currentRank` already
enforces this correctly).

| Rank | XP Required | drillsRequired |
|---|---|---|
| Observer | 0 | `[]` — no drill gate; always playable |
| Trainee | 200 | `["drill:position-sizing-crypto", "drill:position-sizing-stocks", "drill:position-sizing-forex", "drill:stop-placement-v1"]` |
| Practitioner | 800 | `["drill:stop-placement-crypto", "drill:stop-placement-stocks", "drill:stop-placement-forex", "drill:drawdown-survival-crypto", "drill:drawdown-survival-stocks", "drill:drawdown-survival-forex"]` |
| Journeyman | 2,000 | `["drill:blowup-crypto", "drill:blowup-stocks", "drill:blowup-forex"]` |
| Strategist | 4,500 | `["drill:correlation-crypto", "drill:correlation-stocks", "drill:correlation-forex"]` |
| Senior Strategist | 8,000 | `[]` — no additional drill gate; top rank earned by scenario volume |

All IDs TUNABLE pending playtest. The market-balanced rule (GDD §6) is satisfied:
each rank gate requires equal representation across Crypto, Stocks, and Forex.

### 3.2 Market-Balance Check

Each gate tier requiring drills has equal count per market:

| Gate (rank) | Crypto | Stocks | Forex |
|---|---|---|---|
| Trainee | 1 | 1 | 1 + stop-v1 (all) |
| Practitioner | 2 | 2 | 2 |
| Journeyman | 1 | 1 | 1 |
| Strategist | 1 | 1 | 1 |

`drill:stop-placement-v1` gates Trainee as a single cross-market drill (it is market-
agnostic by design). It does not favor any market; it is a prerequisite to all three
market-specific stop-placement drills.

### 3.3 rank.ts Patch (authoritative diff)

Replace each `drillsRequired: []` in CANONICAL_LADDER with the following:

```typescript
// Observer — no change, keep []
{ rankId: "observer", displayLabel: "Observer", xpRequired: 0, drillsRequired: [] },

// Trainee — 4 Beginner drills
{ rankId: "trainee", displayLabel: "Trainee", xpRequired: 200, drillsRequired: [
  "drill:position-sizing-crypto",
  "drill:position-sizing-stocks",
  "drill:position-sizing-forex",
  "drill:stop-placement-v1",
]},

// Practitioner — 6 Intermediate stop/drawdown drills
{ rankId: "practitioner", displayLabel: "Practitioner", xpRequired: 800, drillsRequired: [
  "drill:stop-placement-crypto",
  "drill:stop-placement-stocks",
  "drill:stop-placement-forex",
  "drill:drawdown-survival-crypto",
  "drill:drawdown-survival-stocks",
  "drill:drawdown-survival-forex",
]},

// Journeyman — 3 blowup drills
{ rankId: "journeyman", displayLabel: "Journeyman", xpRequired: 2000, drillsRequired: [
  "drill:blowup-crypto",
  "drill:blowup-stocks",
  "drill:blowup-forex",
]},

// Strategist — 3 correlation drills
{ rankId: "strategist", displayLabel: "Strategist", xpRequired: 4500, drillsRequired: [
  "drill:correlation-crypto",
  "drill:correlation-stocks",
  "drill:correlation-forex",
]},

// Senior Strategist — no drill gate
{ rankId: "senior_strategist", displayLabel: "Senior Strategist", xpRequired: 8000, drillsRequired: [] },
```

Each ID above is TUNABLE (swap or add drill IDs based on playtest; the gate logic in
rank.ts `currentRank` is ID-agnostic).

---

## 4. Anti-Headcanon Protocol

**The live risk (COMPETITOR_RESEARCH #4):** Trade Bots' most credentialed reviewers
cited quiz questions with developer-headcanon answers not covered by the shown material
(41-vote complaint). This killed a direct competitor. The protocol below is a hard
authoring requirement, not a style guide.

### 4.1 Four Required Properties of Every Knowledge-Check Question

Any question presented in a drill (currently: only the `blowup_mechanism_identified`
debrief prompt in Drill Type D) must satisfy all four:

| Property | Requirement |
|---|---|
| **Shown-material only** | The correct answer must be derivable solely from content the player has already seen in-game — a lesson, a drill card, a debrief explanation, or the current session's own data. No answer may require prior trading knowledge not taught in the game. |
| **Single defensible correct answer** | Exactly one option must be correct. The wrong options must be plausible but distinguishable by the shown material. Trick questions and "most correct" patterns are prohibited. |
| **Provenance tag** | Each question carries a `provenance` field: the lesson or in-game screen that teaches the answer. Format: `{ lessonId: "F-08", screen: "debrief-blowup-sequence" }`. |
| **Rationale shown always** | The correct answer and a one-paragraph explanation are shown after the player answers — regardless of whether they answered correctly. The rationale is the primary teaching moment, not the answer itself. |

### 4.2 Authoring Pipeline

```
Author writes question
  → Self-check: can I point to the exact screen/lesson where this is taught? (if no: cut)
  → Second author reads question + reviews lesson/screen provenance
    → Can the second author derive the answer WITHOUT prior trading knowledge? (if no: revise)
    → Does the question have exactly one defensible correct answer? (if no: revise)
  → Attach provenance tag
  → Write rationale copy (shown post-answer, 2–4 sentences)
  → Red-team checklist (see §4.3)
  → Merge to content
```

### 4.3 Red-Team Checklist (per question, required before merge)

- [ ] Correct answer appears in the labeled provenance source (lesson, drill card, or
      this session's own debrief sequence) — verified by a second reader
- [ ] Wrong answers are plausible but distinguishable from the shown material
- [ ] No option requires interpreting a chart pattern not taught in the game
- [ ] No option requires external market knowledge (e.g., "BTC always does X during Y")
- [ ] Rationale copy does not introduce new concepts not already in the game
- [ ] Rationale copy does not use directive language ("you should have done X")
- [ ] Rationale copy does not reference PnL, win rate, or outcome
- [ ] Question stem is not leading (does not hint at the correct answer)
- [ ] Question passes a plain-language read at a high-school reading level

### 4.4 Current Question Bank (v1)

Currently one knowledge-check question exists in the drill system:

**Drill:** `drill:blowup-{market}` debrief prompt
**Question:** "Looking at the annotated replay you just saw, what was the primary
mechanism that caused the account to reach zero?"
**Options (shown after the debrief sequence has already labeled each decision):**

```
A. No stop placed — the position ran against me with no protection
B. Position size too large relative to account — a normal adverse move was fatal
C. Added to a losing position — compounded the loss
D. All three contributed equally
```

**Provenance:** `{ lessonId: "F-08", screen: "debrief-blowup-sequence-annotated" }`
**Rationale (always shown):** Authored per market variant, referencing the specific
annotated tick from the session. Template: "In this session, the annotated sequence
showed [mechanism]. This is the [mechanism name] pattern: [one-sentence explanation
of why this pattern leads to ruin, using the session data]."

Note: the correct answer for each play-through is derived from the player's own session
EventLog, not from a static authored answer. The drill engine reads the session's dominant
failure mechanism from the `blowup_mechanism_identified` scoring predicate and sets the
"correct" option at runtime. This eliminates headcanon entirely for this question — the
correct answer is always the one that matches what actually happened in the session.

COSTLY: runtime-derived correct-answer generation requires a scoring predicate that
classifies the dominant mechanism from the EventLog. This is a new scoring function;
see §7 for the engine surface it needs.

---

## 5. Retry and Failure Rules

### 5.1 Core Policy

| Rule | Requirement | Rationale |
|---|---|---|
| **No grind-as-punishment** | Retries are immediate; no cooldown, no attempt counter visible to the player | GDD P5; COMPETITOR_RESEARCH #1 |
| **Failure strips nothing** | A failed drill does not remove any previously earned drill completions, XP, or scenario access | SIM_ENGINE_SPEC §4.4; COMPETITOR_RESEARCH #2 |
| **Retries vary** | On retry, the drill's numeric parameters are re-rolled from a new seed (not the same problem). For static-chart drills (stop placement), a different chart configuration from the authored problem set is shown | Prevents memorization of the answer rather than understanding the concept |
| **One-attempt minimum** | Scenarios list drills in `prereqs[]` as one-attempt requirements — the player must attempt the drill, not necessarily pass it, before the advisory flips to a hard lock. See §6. | Ensures forward progress; the prerequisite is engagement, not perfection |

### 5.2 Pass vs. Completion

Two distinct states tracked by ProgressStore:

| State | Meaning | Tracked by |
|---|---|---|
| `attempted` | Player has submitted at least one answer | Not currently stored; logged in EventLog only |
| `completed` (passed) | Player has met the pass criteria | `markDrillCompleted(id)` in ProgressStore |

`drillsRequired` in rank gates uses `completedDrillIds` (passed), not attempted.
Scenario prereqs flip to hard locks (§6) on first attempt OR pass — the brief's intent
is that attempting the drill is the minimum gate, not mastery. If the owner prefers
pass-only hard locks, see OPEN-1.

### 5.3 Parameter Re-Roll on Retry

For Drill Type A (Position Sizing Puzzle), re-roll selects from a pre-authored set of
TUNABLE: 3 problem configurations per market variant. The re-roll is seeded from
`session_start_timestamp XOR attempt_count` for determinism. The formula shown is
always the same (the lesson is the formula, not the specific numbers).

For Drill Type B (Stop Placement), the re-roll selects a different chart from the
authored problem set (TUNABLE: 3 static charts per market variant).

For Drills C, D, E (live-session drills), the market seed is re-rolled at retry start.
The starting account state and authored events use the same authored template but
different PRNG seed, so the exact price path varies.

---

## 6. Scenario Prereq Flip

### 6.1 Current Advisory State (gating.ts as shipped)

Currently in gating.ts, `drill:` and `lesson:` prereqs render as ADVISORY (informational
only, not enforced). This is the correct temporary posture: SCN-001 requires
`drill:position-sizing-crypto` and `drill:stop-placement-v1`, but those drills do not
yet exist, so enforcing them would softlock every new player.

### 6.2 Flip Criteria

The advisory becomes a hard lock for a given drill ID when ALL of the following are true:

1. The drill is defined in the drill catalog (this brief) and has been built and deployed.
2. The drill is accessible to a fresh Observer player with zero completed drills/scenarios
   (the no-softlock guarantee — see §6.3).
3. The drill has been tested end-to-end (pass criteria fire correctly, XP awarded,
   `markDrillCompleted` called on pass).

When all three conditions are met for a drill ID, the ID moves from the advisory list to
the hard-lock list in gating.ts. This is a per-ID flip, not a system-wide flip.

### 6.3 No-Softlock Guarantee

A fresh player (zero completions, zero XP, rank = Observer) must always have at least
one fully playable path. The playable path at zero state:

```
Zero state → Beginner drills (all 4) are open — no prereqs required
           → After passing Beginner drills: SCN-001, SCN-002, SCN-003 unlock
             (their drill prereqs are all in the Beginner set)
           → SCN-004, SCN-005, SCN-006 require their V0 counterpart (hard lock
             on scenario completion, not drills) — playable after one V0 scenario
```

The Beginner drills (`drill:position-sizing-{market}` and `drill:stop-placement-v1`)
must never acquire drill prereqs of their own. They are the entry point; any
prerequisite added to them creates a softlock. If a lesson prereq is added to them
(e.g., "must complete F-05 first"), that lesson must also be accessible at zero state
with no prior completions.

### 6.4 gating.ts Patch (delta from current)

When drills ship, the `drill:` and `lesson:` prereq branch in `scenarioLockState` changes
from advisory-only to hard-lock for completed drill IDs:

```typescript
// Current (advisory):
const supportCount = manifest.prereqs.filter(
  (p) => p.startsWith("drill:") || p.startsWith("lesson:")
).length;
if (supportCount > 0) {
  advisories.push(`${supportCount} supporting drill/lesson recommended`);
}

// Replace with (hard lock when drills ship):
for (const prereq of manifest.prereqs) {
  if (prereq.startsWith("drill:")) {
    const drillId = prereq; // full ID including "drill:" prefix
    if (!completedDrillIds.includes(drillId)) {
      reasons.push(`Complete ${drillId} first`);
    }
  }
  if (prereq.startsWith("lesson:")) {
    // Lesson gating: advisory-only until lesson completion tracking ships.
    // Add to advisories for now; flip to hard lock when lesson system ships.
    advisories.push(`Recommended: ${prereq}`);
  }
}
```

The function signature must gain `completedDrillIds: readonly string[]` as a parameter.
This is a non-breaking change: the caller (MenuScene) already has access to
`ProgressStore.completedDrillIds()`.

---

### 6.x Gate-flip demotion policy (added post red-team, 2026-06-08)

When a future wave flips Practitioner/Journeyman/Strategist drill gates in,
players already ABOVE those XP thresholds will display a lower rank until the
new drills are completed (currentRank is pure; gates are cumulative). The
flip wave's brief MUST decide deliberately between (a) grandfathering
(seed completedDrillIds for affected players) and (b) demote-with-messaging
(an explicit one-time notice naming the new drills). Shipping a flip without
this decision is a player-trust regression — red-team F4, drill wave D.

**OWNER RULED 2026-06-08: (b) demote-with-messaging.** Honest-XP
consistency — rank reflects current requirements; the one-time notice names
exactly which new drills restore the rank. Applies to every future gate
flip, not only Practitioner's.

## 7. Engine and UI Surface Inventory

### 7.1 Recommended Architecture — Drills as Micro-Scenarios

**Recommendation:** implement drills as micro-scenarios using the existing TradingScene
and scenario harness, with a drill manifest type extending ScenarioManifest.

Rationale:
- The scoring engine, EventLog, and process metrics already exist and are tested.
- TradingScene provides the chart, order ticket, and journal — all used by drill types
  C, D, and E.
- Phaser's scene management handles the transition (MenuScene → DrillScene → DebriefScene).
- Drill Type A (Position Sizing Puzzle) and Type B (Stop Placement) do not need a live
  feed; they use a stripped-down scene (DrillInputScene) with no tick pipeline.
- Building a separate, parallel system for drills would duplicate the scoring engine and
  create two sources of truth for process metrics.

### 7.2 New Scenes Required

| Scene | Drills served | Reuse | Build cost |
|---|---|---|---|
| `DrillInputScene` | Position sizing (Type A), Stop placement static (Type B) | Order ticket input component; no tick pipeline | Low — mostly UI |
| `DrillTradingScene` | Drawdown survival (C), Blowup (D), Correlation (E) | Full TradingScene with a drill manifest instead of scenario manifest | Very low — TradingScene + drill config |
| `DrillDebriefScene` | All drills | Debrief screen components; adds drill-specific panels (blowup annotated replay, correlation overlay) | Medium — shared debrief structure, drill-specific panels |

`DrillTradingScene` is TradingScene parameterized with a drill config. The simplest
implementation is a drill-config wrapper passed to TradingScene at load time, with
drill-specific event handlers for starting state (pre-loaded account drawdown, pre-loaded
positions).

### 7.3 New Scoring Metrics Required

The following new process predicates are required for this drill system. Each must go
through the red-team rail before shipping (SIM_ENGINE_SPEC §4.1 ethics rail applies).

| Metric ID | Description | Extraction logic | Used by |
|---|---|---|---|
| `no_add_to_losers` | No order submitted on an instrument where player holds an open losing position | At each `order_submit`: check PositionLedger for an existing position in same instrument with unrealized PnL < 0. Flag = false if found. | Drill C (Drawdown Survival) |
| `pre_event_journal` | Journal entry with hypothesis tag written before a scripted event fires | EventLog: `journal_entry` with tag `hypothesis` or `pre_event` before the first authored event's simTimeMs | Drill E (Correlation) |
| `correlation_observation_written` | Journal entry written after the scripted event fires | EventLog: `journal_entry` with tag `exit` or `post_event` after the event's simTimeMs | Drill E (Correlation) |
| `blowup_mechanism_identified` | Player selected the mechanically correct primary mechanism in the debrief | Debrief screen emits a `drill_answer` event; scoring compares player's selection to the EventLog-derived mechanism | Drill D (Blow Up) |

**Ethics note on `no_add_to_losers`:** this predicate reads unrealized PnL to determine
whether a position is losing. This is the only case where the scoring engine approaches
PnL data. The predicate is permitted because it reads PnL as a binary state (losing vs.
not losing) for a process-rule evaluation (the rule is "do not add to losers"), not as
a score component. The predicate must not emit the PnL value itself — it emits only a
boolean compliance event. Code review must verify this when it ships.

### 7.4 Drill Manifest Type

Extend `types.ts` with a `DrillManifest` type that wraps or extends `ScenarioManifest`:

```typescript
export interface DrillManifest {
  id: string;                       // canonical drill ID, e.g. "drill:position-sizing-crypto"
  drillType: "position-sizing" | "stop-placement" | "drawdown-survival" | "blowup" | "correlation";
  market: "crypto" | "stocks" | "forex" | "all";
  difficulty: "Beginner" | "Intermediate";
  xpOnPass: number;                 // base XP on pass criteria met
  bonusMetrics?: XpRubricEntry[];   // optional bonus predicates
  passCriteria: string[];           // metric IDs that must be true for pass
  prereqLessons: string[];          // lesson IDs (advisory gate, not hard lock yet)
  parameterSets: DrillParams[];     // TUNABLE: ≥3 sets; re-rolled on retry
  referenceCardContent: string;     // ID of authored reference card shown during drill
  debriefContentIds: string[];
}
```

COSTLY: the full drill manifest authoring tooling (if a CMS is used). For v1, flat-file
JSON configs matching the schema above are sufficient.

### 7.5 COSTLY Flags

| Item | Cost level | Reason |
|---|---|---|
| `DrillInputScene` | Low | New scene, no tick pipeline; mostly form UI |
| `DrillTradingScene` | Very low | Wrapper around TradingScene with drill config |
| `DrillDebriefScene` | Medium | Shared structure but drill-specific panels per type |
| Pre-loaded account state for Drills C/D/E | Low | PositionLedger initialization at session start |
| `blowup_mechanism_identified` runtime derivation | Medium | Requires EventLog analysis function classifying dominant failure mode |
| Per-market stop-placement static charts (3 × 3 = 9 charts) | Medium (art/content) | Authored annotated charts; each needs S/R zones and coach overlay copy |
| Correlation drill: 3-position pre-loaded state + flash crash event | Low-Medium | Uses existing EventInjector; pre-loaded state is new |
| Provenance tag system for question bank | Low | Metadata field on question objects |

---

## 8. Posture Rails

### 8.1 Education-Not-Advice Copy Rules

All drill copy (instructions, reference cards, debrief text, coaching overlays) must:

- Describe mechanics, not predictions. "A stop placed inside the wick range is often
  triggered before the trade thesis is invalidated" is permitted.
  "Place your stop here to avoid being stopped out" is a directive — prohibited.
- Use past tense or conditional framing for market events. "When price gaps through
  a limit stop, the order may not fill" is permitted.
  "The price will fill your stop at this level" is a prediction — prohibited.
- Not name real assets, real events, or real traders.
- Carry the standard friction copy on every session start and debrief: "This is a
  practice simulation. It is not financial advice and does not reflect real market
  conditions."

### 8.2 No Directive Language

Prohibited in all drill copy:

| Prohibited | Permitted alternative |
|---|---|
| "You should have placed your stop here" | "A stop placed at this level would have been outside the wick range" |
| "The correct position size is X" | "Applying the formula to these inputs gives X" |
| "You should have closed early" | "Closing before the event reduced exposure to the correlated shock" |
| "The best trade here was..." | "The scenario debrief shows what happened to participants who [action]" |

### 8.3 Equal Standing — Observation Path

Every drill that involves a live session (Types C, D, E) must be passable without
trading. Specifically:

- **Drawdown survival (Type C):** Pass requires `no_add_to_losers` compliance. A player
  who closes all positions immediately and journals the remaining session passes cleanly.
  The drill does not require holding positions or opening new ones.
- **Blowup (Type D):** Pass requires debrief completion only. A player who opens the
  session, journals, and immediately ends it without trading passes (with reduced XP —
  the bonus metrics are not earned). The instruction asks the player to try to blow up
  the account; it does not compel it.
- **Correlation (Type E):** The pre-event journal is required for full XP but the
  observation path (no trade taken, journal written) is explicitly equal-standing per
  SIM_ENGINE_SPEC §4.1.

This satisfies GDD P2 (process over outcome) and the equal-ceilings owner ruling
(SIM_ENGINE_SPEC §4.1, 2026-06-08).

### 8.4 Anti-PnL in Pass Criteria

A summary of how each drill type achieves process-only pass criteria:

| Drill type | Pass criteria category | PnL involvement |
|---|---|---|
| Position Sizing Puzzle | Formula accuracy (±10% tolerance) | None — no live session |
| Stop Placement | Structural placement (beyond S/R level) | None — no live session |
| Drawdown Survival | Rule compliance (`no_add_to_losers`, `stop_honored`) | Drill starts with a defined drawdown state but PnL at session end is not a pass criterion |
| Blow Up on Purpose | Debrief completion + mechanism identification | The mechanism identified is a process classification, not a PnL amount |
| Correlation Awareness | Journal before + journal after event | PnL of pre-loaded positions is not a pass criterion; observation and journaling are |

The "Blow Up on Purpose" drill requires special care: the debrief will visibly show
that the account reached zero. The coaching copy must frame this as mechanical
demonstration ("the margin model closed your position at the stop-out level") and must
not use the word "loss" or "profit" in any evaluative sense. The debrief is an
engineering diagram, not a grade.

The "Drawdown Survival" drill starts the player at a deficit. The debrief must not
frame the ending equity as a score. The coaching copy frames the ending state as
"account was in drawdown; the rule was honored / not honored." Whether the account
recovered is noted as context, not as a result.

---

## 9. Open Questions for the Owner

**OPEN-1. Prereq flip: attempt or pass?**
Section 6.2 proposes that scenario prereqs flip to hard locks on first attempt (not
pass). The rationale: progress requires engagement, not mastery. The alternative (pass-
only hard lock) is stricter and closer to a mastery gate. Which does the owner prefer?
This decision affects how many retries a player might need before accessing scenarios.

**OPEN-2. Correlation awareness drill — prerequisite lessons.**
The correlation drills are classified Intermediate. What prerequisite lessons should
gate them? The curriculum brief (docs/CURRICULUM.md) should have the answer, but the
correlation concept does not appear in the Foundation Track (F-01 through F-09 reviewed).
Is correlation covered in a Pillar Intermediate lesson, or does it need a new lesson
authored? This affects whether the correlation drills can ship before or after the
Advanced Tier scenarios (ACN-001 / ACN-006 are the scenario-level equivalents).

**OPEN-3. Stop Placement drill chart art pipeline.**
Nine static annotated charts are needed (3 per market variant for stop placement drills).
These are content assets, not code. Who authors and reviews them, and against which
fictional canon instruments? Confirm whether FICTIONAL_CANON.md instruments are
appropriate for all three market variants or whether new fictional instruments are needed.

**OPEN-4. `drill:stop-placement-v1` scope — keep market-agnostic or split?**
The live ID is market-agnostic (used by all six scenarios as a prereq). This brief
retains it as a Beginner cross-market drill. The alternative is to split it into three
market-specific Beginner variants and remove the shared ID. Splitting would simplify
the progression model but would require a manifest update on all six live scenarios.
Owner preference?

**OPEN-5. Drawdown survival starting account state — authored vs. procedural.**
The drill starts with a pre-configured drawdown. Two implementation options: (a) the
drawdown is a static authored state (specific positions, specific prices), giving
consistent player experience; or (b) the drawdown state is generated procedurally
(PRNG-seeded, re-rolled on retry). Option (a) is more controllable for content/debrief
authoring; option (b) creates more variety. The blowup mechanism identification debrief
question is simpler under option (a). Recommend (a) for v1 with option (b) as a
future variant.

---

## Appendix A — Drill ID Cross-Reference (Live Manifests)

| Scenario | Market | Drill prereqs (live in scn*.ts) | Status after this brief |
|---|---|---|---|
| SCN-001 | Crypto | `drill:position-sizing-crypto`, `drill:stop-placement-v1` | Both defined in catalog; IDs unchanged |
| SCN-002 | Stocks | `drill:position-sizing-stocks`, `drill:stop-placement-v1` | Both defined; IDs unchanged |
| SCN-003 | Forex | `drill:position-sizing-forex`, `drill:stop-placement-v1` | Both defined; IDs unchanged |
| SCN-004 | Crypto | `drill:position-sizing-crypto`, `drill:stop-placement-v1` | Both defined; IDs unchanged |
| SCN-005 | Stocks | `drill:position-sizing-stocks`, `drill:stop-placement-v1` | Both defined; IDs unchanged |
| SCN-006 | Forex | `drill:position-sizing-forex`, `drill:stop-placement-v1` | Both defined; IDs unchanged |

No existing scenario manifest requires a change. All live drill IDs are defined in
this catalog without modification.

---

*End of DRILL_SYSTEM_BRIEF.md*
