# TradeGame — Live-Session Drill Engine Brief

**Version:** 1.0
**Status:** Design — feeds Phase 3 build wave
**Date:** 2026-06-08
**Scope:** Engine and UI machinery for Drawdown Survival (Type C) and Blow Up on Purpose
(Type D) drills that run inside a live sim session. Input-screen drills (Types A and B)
are out of scope — they are covered by DRILL_SYSTEM_BRIEF.md §7.
**Owner Ruling (recorded):** Drawdown Survival pass predicate = ZERO-PNL PROXY. No PnL
reads, even binary. Graded exclusively on process-observable facts from the EventLog.
Source: ~/fleet/questions.md, 2026-06-08 entry, "ANSWERED 2026-06-08 (tradegame)."

---

## Table of Contents

1. [Micro-Scenario Mechanism](#1-micro-scenario-mechanism)
2. [Position Seeding for Drawdown Survival](#2-position-seeding-for-drawdown-survival)
3. [Pass Predicates — Zero-PnL Proxy (Owner-Ruled)](#3-pass-predicates--zero-pnl-proxy-owner-ruled)
4. [XP and Completion Wiring](#4-xp-and-completion-wiring)
5. [Build-Wave Shopping List](#5-build-wave-shopping-list)
6. [Open Questions](#6-open-questions)

---

## 1. Micro-Scenario Mechanism

### 1.1 DrillScenarioDef — Type Contract

A live-session drill is expressed as a `DrillScenarioDef`: a standard `ScenarioManifest`
(SIM_ENGINE_SPEC §1.4 beat-schedule contract) extended with drill metadata. The harness
(`runScenario`) is the golden-fixture surface — the drill loads through the same entry
point as scenarios, so all existing determinism, replay, and scoring rails apply without
modification.

```typescript
// Extends the existing ScenarioManifest shape from types.ts
// Add to types.ts alongside ScenarioManifest — do NOT duplicate the base fields.

export interface DrillScenarioDef extends ScenarioManifest {
  // Drill identity
  drillId:         string;           // canonical ID, e.g. "drill:drawdown-survival-crypto"
  drillType:       "drawdown-survival" | "blowup";

  // Session parameters
  simDurationTicks: number;          // TUNABLE: see §1.2 table
  briefingText:    string;           // rule card shown at session start
  briefingRequiresAck: boolean;      // true = "I have read this" click required (logged)

  // Pass predicate list — metric IDs evaluated at session end
  // Each ID must resolve to a metric in ScoreTracker; no freeform strings.
  passCriteriaMetricIds: string[];

  // Seeding configuration (Drawdown Survival only; null for Blowup)
  seedConfig:      DrillSeedConfig | null;

  // Completion routing — replaces scenario debrief flow
  completionRoute: "drill_debrief";  // sentinel: signals DrillDebriefScene, not ScenarioDebriefScene
  xpOnPass:        number;
  bonusMetrics:    XpRubricEntry[];  // optional bonus awards (see §4)
}

export interface DrillSeedConfig {
  seedMethod:      "scripted_fill"; // §2 seeding: this brief recommends scripted_fill only
  positionSide:    "buy" | "sell";
  quantity:        number;          // in market-appropriate units
  entryTickIndex:  number;          // tick at which the seed fill appears in EventLog
                                    // always 0 (tick zero of the session)
  fillPrice:       number;          // authored price; must be above current price for a
                                    // losing long, below for a losing short (see §2.3)
  stopPrice:       number;          // companion stop order placed at same tick
  stopOrderId:     string;          // authored UUID so golden fixtures are byte-stable
  entryOrderId:    string;          // authored UUID
}
```

**Canonical session parameters per drill:**

| Drill ID | simDurationTicks | Wall time at 1x | briefingRequiresAck |
|---|---|---|---|
| `drill:drawdown-survival-crypto` | TUNABLE: 900 | 15 min | true |
| `drill:drawdown-survival-stocks` | TUNABLE: 900 | 15 min | true |
| `drill:drawdown-survival-forex` | TUNABLE: 900 | 15 min | true |
| `drill:blowup-crypto` | TUNABLE: 600 | 10 min (or account-zero, whichever first) | true |
| `drill:blowup-stocks` | TUNABLE: 600 | 10 min | true |
| `drill:blowup-forex` | TUNABLE: 600 | 10 min | true |

TUNABLE: all tick counts. The 15-min / 10-min targets are from DRILL_SYSTEM_BRIEF.md §1.4–1.5.
One tick = one sim second at default compression. Players can use time compression controls
normally (SIM_ENGINE_SPEC §1.3) — wall time is therefore shorter in practice.

---

### 1.2 How TradingScene Runs a DrillScenarioDef

TradingScene is scenario-agnostic (DRILL_SYSTEM_BRIEF.md §7.1 ruling). A drill loads
through the same `runScenario(manifest)` path. The following additions are needed:

**Init path changes (at scene load):**

1. Detect `manifest.completionRoute === "drill_debrief"` and set a local flag
   `isDrillMode = true`.
2. If `manifest.seedConfig !== null`, call `applyDrillSeed(manifest.seedConfig)` before
   the first tick runs. This is the seeding surface — see §2 for full specification.
3. If `manifest.briefingRequiresAck === true`, show the briefing overlay and suppress
   the first tick until the ack event fires. The ack is logged:

```typescript
// New event type — add to SimEvent discriminated union in types.ts
interface DrillBriefingAckEvent {
  type:        'drill_briefing_ack';
  drillId:     string;
  tickIndex:   0;          // always fires at tick 0, before first market tick
  timestamp:   0;
}
```

**Session-end path changes:**

When `isDrillMode = true` and the session ends (tick limit reached, account zeroed, or
player ends it):

1. Evaluate pass predicates against the EventLog (see §3 for exact logic).
2. Write a `drill_session_end` event to the EventLog (new type, see below).
3. Transition to `DrillDebriefScene` (not the standard ScenarioDebriefScene).
4. On debrief completion, call `ProgressStore.completeDrill(drillId, xpOnPass)` if
   pass predicates are all satisfied; otherwise call `ProgressStore.recordDrillAttempt(drillId)`.

```typescript
// New event type
interface DrillSessionEndEvent {
  type:            'drill_session_end';
  drillId:         string;
  passPredicates:  { metricId: string; passed: boolean }[];  // one entry per passCriteriaMetricId
  overallPass:     boolean;       // AND of all passPredicate.passed values
  tickIndex:       number;
  timestamp:       number;
  // No PnL, no account balance, no equity value — §3 owner ruling
}
```

**What DrillDebriefScene shows:**

| Panel | Content | Anti-PnL rule |
|---|---|---|
| Rule recap | The briefing text shown at session start | — |
| Process compliance checklist | One row per pass predicate: green check / red cross + factual description of what the engine observed | No PnL values |
| Coaching copy | Authored per drill type; explains the mechanic demonstrated | Uses session's own EventLog facts, never dollar amounts |
| XP award summary | XP earned + which predicates contributed | No PnL |
| Retry affordance | "Try again" button; re-rolls seed per DRILL_SYSTEM_BRIEF.md §5.3 | — |
| Blowup only: annotated replay + mechanism question | See §3.2 | No PnL amounts; engine events only |
| Drawdown only: "The rule was honored / not honored" | Factual compliance statement | No equity value shown |

Standard friction copy: "This is a practice simulation. It is not financial advice and
does not reflect real market conditions." Required on every drill session start and
DrillDebriefScene screen per DRILL_SYSTEM_BRIEF.md §8.1.

---

## 2. Position Seeding for Drawdown Survival

### 2.1 The Problem

Drawdown Survival requires the player to start with a sim account already holding an
open losing position. The sim engine initializes with an empty OrderBook and empty
PositionLedger. We need a seeding mechanism that is:

- Deterministic: given the same seed, the seeded state is identical on every run
  (SIM_ENGINE_SPEC §1.1 replay constraint)
- Byte-stable for golden fixtures: the EventLog output must be identical byte-for-byte
  on replay so CI diffs catch regressions
- Non-invasive: does not require a new PositionLedger injection API or side-channel
  account-state mutations outside the normal event flow

### 2.2 Three Options Evaluated

| Option | Mechanism | Determinism | EventLog stability | Invasiveness |
|---|---|---|---|---|
| **(a) scripted_fill beat** | A new beat kind `seed_position` fires at tick 0; the OrderBook processes it as a forced fill at the authored price | Fully deterministic (authored price, authored tick) | Byte-stable: the fill events appear in the log with authored order IDs | Low: new beat kind only; OrderBook gains one new event handler |
| **(b) auto-entry then gap** | Drill script opens with an auto-submitted entry at a pre-divergence price; a `price_override` beat then gaps price adversely before tick 1 | Deterministic but the fill price depends on slippage model state at tick 0 | Fragile: slippage model changes break golden digests because tick-0 sigma is generated before the price override fires | Low code cost but high fixture fragility |
| **(c) account-state injection** | PositionLedger is initialized with a pre-populated position record; no order events emitted | Fully deterministic | NOT stable: position exists in PositionLedger with no corresponding EventLog entries; replay cannot reconstruct the position from the log alone; breaks the fundamental replay guarantee | High: violates the append-only EventLog as the canonical session record |

### 2.3 Recommended Option: (a) scripted_fill Beat

**Recommendation: option (a).** It is the only option that keeps the EventLog as the
sole source of truth (required for replay determinism per SIM_ENGINE_SPEC §1.1), emits
no side-channel state, and requires minimal new code (one new beat kind, one new
OrderBook path).

**How it works:**

The `DrillSeedConfig` authors a position at tick 0. Before the first PRNG-generated tick
advances, the EventInjector fires a `seed_position` beat. The OrderBook processes it as
a synthetic forced fill: it bypasses the normal trigger-price logic (this is a seeded
state, not a live order) and emits standard `order_submit` + `order_fill` events with
authored `orderId` and `fillPrice` values from `DrillSeedConfig`.

A companion stop order is also placed at tick 0 (authored `stopPrice` from
`DrillSeedConfig`). This seeds the PositionLedger with a live position AND a live
protective stop, satisfying the `stop_honored` pass predicate from the start.

**Exact EventLog output at tick 0 (byte-stable):**

```typescript
// Events emitted at tickIndex=0, timestamp=0, before any PRNG-driven tick
// Event 1: session start (standard)
{ type: 'session_start', sessionId: '...', scenarioId: 'drill:drawdown-survival-crypto',
  seed: 12345, marketType: 'crypto', tickIndex: 0, timestamp: 0 }

// Event 2: drill briefing ack (if player has clicked through)
{ type: 'drill_briefing_ack', drillId: 'drill:drawdown-survival-crypto',
  tickIndex: 0, timestamp: 0 }

// Event 3: seed beat fires
{ type: 'scenario_beat', beatId: 'seed_position_entry',
  decisionPointId: null, tickIndex: 0, timestamp: 0 }

// Event 4: synthetic order submit (authored values from DrillSeedConfig)
{ type: 'order_submit', orderId: 'seed-entry-001', orderType: 'market',
  side: 'buy', quantity: 0.1, price: null, stopPrice: null,
  tickIndex: 0, timestamp: 0 }

// Event 5: synthetic fill at authored price (no slippage — seeded state)
{ type: 'order_fill', orderId: 'seed-entry-001', fillPrice: 42000.00,
  slippage: 0, spreadCost: 0, feeCost: 0, tickIndex: 0, timestamp: 0 }

// Event 6: companion stop submit
{ type: 'order_submit', orderId: 'seed-stop-001', orderType: 'stop',
  side: 'sell', quantity: 0.1, price: null, stopPrice: 41000.00,
  tickIndex: 0, timestamp: 0 }

// Then: first PRNG-driven tick fires; price will be BELOW fillPrice (authored gap)
// implemented as a price_override beat at tick 1
{ type: 'scenario_beat', beatId: 'seed_price_gap', decisionPointId: null,
  tickIndex: 1, timestamp: 1000 }
// price_override payload drops price to authored drawdown level; generator resumes from there
```

TUNABLE: authored fillPrice, stopPrice, and gap magnitude per market and difficulty variant
(DRILL_SYSTEM_BRIEF.md §1.4 table: crypto -8%, stocks -8%, forex -10%).

**Why slippage is zero on the seed fill:** The seed fill represents a position the player
"inherited" (the drill premise is that they ARE in drawdown, not that they entered poorly).
Setting slippage = 0 on the seed is both mechanically clean and editorially correct — the
seed fill is not a trade the player made, so no transaction cost is appropriate. The debrief
coaching copy can note this explicitly.

**New beat kind required (`seed_position`):**

Add to the EventInjector's `event_type` enum in types.ts and the EventInjector switch:

```typescript
case 'seed_position': {
  // Forced fill at authored price; bypass normal order trigger logic
  orderBook.forceFill(payload.entryOrderId, payload.positionSide,
                      payload.quantity, payload.fillPrice, tickIndex);
  orderBook.placeStop(payload.stopOrderId, payload.positionSide === 'buy' ? 'sell' : 'buy',
                      payload.quantity, payload.stopPrice, tickIndex);
  break;
}
```

`forceFill` is a new `OrderBook` method. It must emit `order_submit` + `order_fill`
events with authored IDs (not generated UUIDs) so the EventLog is byte-stable on replay.

**Golden fixture impact:**

Two new golden tests are required before these drills ship (add to SIM_ENGINE_SPEC §7.4
required tests):

| Test name | What it covers |
|---|---|
| `drawdown-survival-seed-stability` | Seed fill + stop appear in EventLog at tick 0 with authored IDs; price gap fires at tick 1; EventLog is byte-identical on 3 consecutive runs from same seed |
| `drawdown-survival-no-add-predicate` | An `order_submit` on the seeded instrument during the session triggers `no_add_to_losers_violation` in the ScoreTracker |

### 2.4 Starting Drawdown Values (TUNABLE)

The seed fill and price gap are authored to produce the configured drawdown percentage
against the starting account balance. The gap is applied by a `price_override` beat at
tick 1, not via the slippage model.

| Drill | Seeded position | Fill price anchor | Price gap at tick 1 | Effective drawdown |
|---|---|---|---|---|
| `drill:drawdown-survival-crypto` | 0.1 BTC-equiv long | Authored (per FICTIONAL_CANON) | TUNABLE: -8.7% from fillPrice | TUNABLE: -8% account |
| `drill:drawdown-survival-stocks` | 10 shares long | Authored | TUNABLE: -8.7% | TUNABLE: -8% account |
| `drill:drawdown-survival-forex` | 0.1 lot long | Authored | TUNABLE: -11.1% price move | TUNABLE: -10% account (leverage amplifies) |

TUNABLE: all percentage values. The formula is:
`account_drawdown_pct = (gap_pct * position_notional) / starting_account_balance`

The authored account balance is TUNABLE: $10,000 for all three drawdown variants.
Position sizing must be computed so the gap produces exactly the target drawdown.

---

## 3. Pass Predicates — Zero-PnL Proxy (Owner-Ruled)

Owner ruling (2026-06-08): Drawdown Survival is graded on pure process facts. No PnL
value, even as a binary, may be read by the pass-predicate evaluator. All predicates
are derived from `order_submit`, `order_fill`, `order_cancel`, `order_modify`, and
`journal_entry` events in the EventLog only.

### 3.1 Drawdown Survival Predicates

Three predicates, evaluated at `drill_session_end` by ScoreTracker:

---

**Predicate 1: `no_size_increase_on_seeded_side`**

Definition: No `order_submit` event during the session has the same instrument and same
side (buy for a seeded long, sell for a seeded short) AND a quantity greater than zero,
EXCEPT for the seed entry itself (`orderId === DrillSeedConfig.entryOrderId`).

EventLog read pattern:
```
for each order_submit event where tickIndex > 0:
  if event.side === seedConfig.positionSide
  AND event.orderId !== seedConfig.entryOrderId:
    predicate = VIOLATED
```

This predicate is the zero-PnL proxy for "no adding to a losing position." It does not
check whether the position is losing (that would require reading unrealized PnL). It
checks only whether the player submitted a new order in the same direction as the seeded
position. Any order in the same direction during the session is a violation, regardless
of the account's equity state at that moment.

**Design note on proxy precision:** DRILL_SYSTEM_BRIEF.md §7.3's original `no_add_to_losers`
predicate read unrealized PnL as a binary to determine whether the position was losing at
submit time. The owner ruling overrides this. The zero-PnL proxy is strictly process-based:
it prohibits any same-direction order on the seeded instrument for the entire session,
even if price has recovered and the position is technically profitable. This is editorially
correct — the teaching objective is "do not add to a losing position," and the drill starts
in drawdown by design. A player who wants to add because price has recovered should close
the original position first (which is a clean, zero-PnL-observable action).

COSTLY: This predicate requires the drill to pass `seedConfig` to the ScoreTracker so it
knows the seeded instrument and side. The ScoreTracker must be able to accept drill-specific
configuration at session init. This is a minor extension to the ScoreTracker API.

**Violation event (emitted by ScoreTracker on detection):**

```typescript
interface DrillPredicateViolationEvent {
  type:        'drill_predicate_violation';
  drillId:     string;
  predicateId: string;   // 'no_size_increase_on_seeded_side'
  triggerEventId: string; // orderId that caused the violation
  tickIndex:   number;
  timestamp:   number;
}
```

---

**Predicate 2: `seeded_stop_maintained`**

Definition: The companion stop order placed at tick 0 (`DrillSeedConfig.stopOrderId`)
has not been cancelled or modified to a price further from the seeded entry price at any
point during the session, UNLESS the player has closed the seeded position first.

EventLog read pattern:
```
if any order_cancel event where orderId === seedConfig.stopOrderId
   AND no order_fill event for seedConfig.entryOrderId before that cancel:
     predicate = VIOLATED

if any order_modify event where orderId === seedConfig.stopOrderId
   AND new stopPrice further from fillPrice than original stopPrice
   AND no fill of entryOrderId before that modify:
     predicate = VIOLATED
```

"Further from fillPrice" = higher stopPrice on a long (moving stop away from market in the
wrong direction); lower stopPrice on a short. The comparison is between authored `stopPrice`
(from `DrillSeedConfig`) and the `stopPrice` in the `order_modify` event's payload.

This is already covered by the existing `stop_honored` and `no_stop_widen` metrics in
SIM_ENGINE_SPEC §4.2 but needs to be seeded-position-specific (those metrics apply to all
positions; this drill predicate applies only to the seeded stop order ID).

**Implementation:** Pass `seedConfig.stopOrderId` to ScoreTracker at init. Create a
drill-scoped variant of `stop_honored` that checks only this order ID.

---

**Predicate 3: `exit_journaled`**

Definition: At least one `journal_entry` event with tag `exit` or `post_trade` exists
in the EventLog, at any tick during the session.

EventLog read pattern:
```
predicate = EXISTS(journal_entry where tags intersects {'exit', 'post_trade'})
```

This is the existing `exit_journal` metric from SIM_ENGINE_SPEC §4.2. No new metric
needed — wire the existing metric ID `exit_journal` in the drill's `passCriteriaMetricIds`.

This predicate is the weakest of the three: a player can write any journal entry and tag
it `exit` without having exited. The predicate enforces the habit of journaling, not the
quality of the journal. The debrief coaching copy handles quality.

---

**Drawdown Survival pass logic:**

```
overallPass = no_size_increase_on_seeded_side AND seeded_stop_maintained AND exit_journaled
```

All three must be true. A player who violates any single predicate fails the drill but
earns `ProgressStore.recordDrillAttempt` (not `completeDrill`). No XP penalty; retry is
immediate per DRILL_SYSTEM_BRIEF.md §5.1.

**XP award on pass:** TUNABLE: 55 XP (Intermediate tier). Called via
`ProgressStore.completeDrill("drill:drawdown-survival-{market}", 55)` on debrief
completion when `overallPass = true`.

---

### 3.2 Blow Up on Purpose Predicates

This drill's pass definition is non-standard (DRILL_SYSTEM_BRIEF.md §1.5): the trading
session outcome is irrelevant to the XP award. Pass = debrief completed.

**Predicate 1: `debrief_completed`** — existing metric, always awarded on reaching
DrillDebriefScene. +TUNABLE: 40 XP base. Calls `completeDrill` regardless of session
outcome.

**Predicate 2: `blowup_mechanism_identified`** — bonus, +TUNABLE: 10 XP. Player selects
the correct mechanism from the multiple-choice prompt in DrillDebriefScene. The correct
answer is derived at runtime from the EventLog, not from a static authored value
(DRILL_SYSTEM_BRIEF.md §4.4 anti-headcanon ruling).

**Runtime mechanism classification — how the engine determines the "correct" answer:**

ScoreTracker computes three counters from the EventLog at session end:

```
oversized_orders    = count(order_submit where (quantity * fillPrice) / account_equity_at_submit > TUNABLE: 0.15)
                      // "fill price" is available in the paired order_fill event
                      // account_equity_at_submit: see CRITICAL NOTE below

no_stop_orders      = count(order_fill where no companion stop order exists within TUNABLE: 2 ticks)

add_to_loser_orders = count(order_submit on same side as an existing open position
                            where that position was opened more than TUNABLE: 5 ticks ago
                            AND no close event in between)
```

CRITICAL NOTE on `account_equity_at_submit`: The function reads `account_equity` to
compute whether a position was oversized. Account equity includes unrealized PnL. This
appears to violate the anti-PnL rule. It does not — this function runs ONLY inside the
Blowup debrief mechanism classifier, for the purpose of labeling what the player already
visibly witnessed (the account going to zero). The debrief shows the annotated replay;
the question is "what did you just see happen?" Reading equity here is equivalent to
reading it from the already-displayed replay frame. This use is categorically different
from using PnL as a pass criterion.

However: the mechanism classifier must NOT be called from the pass-predicate evaluator
for Drawdown Survival, and must NOT emit any dollar-value in its output. It emits only
a classification enum.

```typescript
type BlowupMechanism =
  | 'oversize'         // oversized_orders is the dominant count (> other counts)
  | 'no_stop'          // no_stop_orders is dominant
  | 'add_to_losers'    // add_to_loser_orders is dominant
  | 'combined'         // no single dominant mechanism (all counts within TUNABLE: 1.5x of each other)
```

The debrief's multiple-choice question options A/B/C/D map directly to this enum. The
engine sets the "correct" option to the player's computed `BlowupMechanism` value before
rendering the question. The player is asked to identify which mechanism was dominant —
the question is always answerable because the debrief shows the annotated replay sequence
before the question appears.

**Anti-headcanon compliance (per DRILL_SYSTEM_BRIEF.md §4.3 checklist):**
- Correct answer is derivable solely from the annotated replay the player just saw. CHECK
- Single defensible correct answer (the engine derives it from the session). CHECK
- Provenance: `{ lessonId: "F-08", screen: "drill-debrief-blowup-annotated-replay" }`. CHECK
- Rationale shown always (authored per market + mechanism combo). CHECK

COSTLY: The `BlowupMechanism` classifier requires a new `classifyBlowupMechanism(log)`
function reading the full EventLog. It is a new scoring function, not a simple metric.
Estimated medium complexity. See §5 for build ordering.

**Debrief annotated replay — what it shows:**

Each `order_submit` and `order_fill` event from the session is rendered in a timeline
view with three annotations per event:
- Effective size as percentage of account at submit time (computed from EventLog)
- Whether a protective stop existed at fill time (boolean, from EventLog)
- Whether the order was in the same direction as an existing open position (boolean)

These three annotations correspond to the three mechanism options. The player sees the
classifications before the question is asked. No new mechanism concept is introduced at
question time — the question names what the annotations already showed.

---

## 4. XP and Completion Wiring

### 4.1 XP Award Table

| Drill | Base XP | Bonus | Total max | Condition for each |
|---|---|---|---|---|
| `drill:drawdown-survival-{3 markets}` | TUNABLE: 55 | — | 55 | All 3 pass predicates true + debrief reached |
| `drill:blowup-{3 markets}` | TUNABLE: 40 | +TUNABLE: 10 | 50 | Base: debrief reached; bonus: mechanism correctly identified |

TUNABLE: all values. Source values from DRILL_SYSTEM_BRIEF.md §1.4, §1.5, §2.3.

### 4.2 Completion Calls

```typescript
// On DrillDebriefScene complete, in the drill session end handler:

if (drillType === "drawdown-survival" && overallPass) {
  ProgressStore.completeDrill(drillId, 55);       // §4.1 base XP
}
if (drillType === "drawdown-survival" && !overallPass) {
  ProgressStore.recordDrillAttempt(drillId);      // attempt tracked, no XP
}

if (drillType === "blowup") {
  // Base XP always awarded on debrief reach — session outcome irrelevant
  ProgressStore.completeDrill(drillId, 40);
  if (mechanismCorrectlyIdentified) {
    ProgressStore.awardBonus(drillId, 10);         // bonus XP on correct mechanism pick
  }
}
```

`ProgressStore.awardBonus` is a new method. It emits an additional XP event without
re-calling `completeDrill` (which must be idempotent — calling it twice must not double
the base XP). Alternatively, pass a `bonusXp` param to `completeDrill`; either is
acceptable as long as the XP event is not duplicated across debrief views.

### 4.3 Gate Flip Consequences

Per DRILL_SYSTEM_BRIEF.md §3.1 and §6.2:

- **Practitioner gate** requires `completedDrillIds` to include all three drawdown drills.
  Gate flip condition: all six Practitioner drills (three stop placement + three drawdown)
  are built, deployed, accessible from zero state, and tested end-to-end.
- **Journeyman gate** requires all three blowup drills. Same flip conditions.

**Shipped-only rule** (from DRILL_SYSTEM_BRIEF.md §6.2): Do not flip the gate for a rank
until ALL drills in that gate's `drillsRequired` array exist and are functional. A partial
flip (some drills live, some not) would create an uncompletable gate requirement for
players who reach the gate before the remaining drills ship. A partial flip is a softlock.

---

## 5. Build-Wave Shopping List

Ordered smallest-first. Items within a wave are independent and can be built in parallel.
COSTLY items require non-trivial new tech or art.

### Wave 1 — Engine plumbing (pre-requisite to everything else)

| Item | What | Size | Red-team needed |
|---|---|---|---|
| W1-1 | `DrillBriefingAckEvent` type + `drill_briefing_ack` event in SimEvent union (types.ts) | XS | No |
| W1-2 | `DrillSessionEndEvent` type + `drill_session_end` event in SimEvent union (types.ts) | XS | No |
| W1-3 | `DrillPredicateViolationEvent` type in SimEvent union (types.ts) | XS | No |
| W1-4 | `DrillScenarioDef` and `DrillSeedConfig` interfaces in types.ts | S | No |
| W1-5 | `isDrillMode` flag in TradingScene; route to `DrillDebriefScene` on session end when flag is set | S | No |

### Wave 2 — Seeding surface (Drawdown Survival foundation)

| Item | What | Size | Red-team needed |
|---|---|---|---|
| W2-1 | `seed_position` beat kind in EventInjector switch | S | No |
| W2-2 | `OrderBook.forceFill()` method: authored fill at authored price, emits `order_submit` + `order_fill` with authored IDs | S | YES — must verify slippage=0 on seed fills does not create incorrect PositionLedger state; verify authored orderId is not colliding with live order ID namespace |
| W2-3 | `applyDrillSeed()` function called at TradingScene init when `seedConfig !== null` | S | No |
| W2-4 | Golden fixture `drawdown-survival-seed-stability` | S | No |
| W2-5 | Golden fixture `drawdown-survival-no-add-predicate` | S | No |

### Wave 3 — Drawdown Survival pass predicates

| Item | What | Size | Red-team needed |
|---|---|---|---|
| W3-1 | `no_size_increase_on_seeded_side` predicate in ScoreTracker; ScoreTracker init gains `drillSeedConfig?: DrillSeedConfig` param | M | YES — verify predicate reads only `order_submit` events; no PnL access; seed entry orderId exclusion is correct |
| W3-2 | `seeded_stop_maintained` predicate in ScoreTracker (drill-scoped variant of `stop_honored` + `no_stop_widen`, scoped to `seedConfig.stopOrderId`) | M | YES — verify same scope rules; stop cancellation logic handles session-end auto-cancel (must be exempt, per SIM_ENGINE_SPEC §4.2 existing `stop_honored` clarification) |
| W3-3 | Wire `exit_journal` (existing metric) into drawdown drill `passCriteriaMetricIds` | XS | No |
| W3-4 | `drill_session_end` event emission with `passPredicates` payload | S | No |
| W3-5 | `ProgressStore.recordDrillAttempt(drillId)` — new method | XS | No |

### Wave 4 — DrillDebriefScene (shared shell + drawdown path)

| Item | What | Size | Red-team needed |
|---|---|---|---|
| W4-1 | `DrillDebriefScene` Phaser scene skeleton; receives `DrillSessionEndEvent` as scene init data | S | No |
| W4-2 | Process compliance checklist panel (rule recap + per-predicate pass/fail rows) | S | No |
| W4-3 | XP award summary panel | S | No |
| W4-4 | Retry affordance: re-rolls seed per DRILL_SYSTEM_BRIEF.md §5.3 | S | No |
| W4-5 | Authored DrillScenarioDef JSON configs for all three drawdown variants | M (content) | No |
| W4-6 | Standard friction copy on session start overlay and in DrillDebriefScene | XS | No |
| W4-7 | `ProgressStore.completeDrill` integration test end-to-end | S | No |

At W4 completion: Drawdown Survival drills are playable end-to-end.

### Wave 5 — Blow Up on Purpose machinery

| Item | What | Size | Red-team needed |
|---|---|---|---|
| W5-1 | `classifyBlowupMechanism(eventLog)` function in ScoreTracker; emits `BlowupMechanism` enum, no dollar values | M | COSTLY — YES: must verify equity reads are scoped to classification only; must not propagate to any pass criterion; no dollar values in output; anti-headcanon audit |
| W5-2 | Annotated replay timeline panel in DrillDebriefScene (blowup path): per-order rows with three boolean annotations | M | YES — verify no PnL amounts in rendered output; annotations are process-observable facts only |
| W5-3 | Multiple-choice mechanism question in DrillDebriefScene; correct option set at runtime from classifier output | S | YES — run §4.3 anti-headcanon checklist; verify rationale copy does not introduce novel concepts |
| W5-4 | `ProgressStore.awardBonus(drillId, xpAmount)` — new method | XS | No |
| W5-5 | Non-dismissible 5-second "practice account" reminder at session start (DRILL_SYSTEM_BRIEF.md §1.5) | XS | No |
| W5-6 | Authored DrillScenarioDef JSON configs for all three blowup variants | M (content) | No |
| W5-7 | Authored debrief coaching copy: 3 markets × 4 mechanism combos = 12 copy blocks | M (content) | YES — run §8.1 posture rails review (no directive language, no PnL framing) |

At W5 completion: all six live-session drills are playable end-to-end.

### Wave 6 — Gate flips and regression suite

| Item | What | Size | Red-team needed |
|---|---|---|---|
| W6-1 | Verify Practitioner gate flip conditions (all six Practitioner drills functional, zero-state reachable) | S | No |
| W6-2 | Verify Journeyman gate flip conditions (all three blowup drills functional) | S | No |
| W6-3 | gating.ts patch: add drawdown + blowup IDs to hard-lock list per DRILL_SYSTEM_BRIEF.md §6.4 | S | No |
| W6-4 | rank.ts patch: add drawdown IDs to Practitioner `drillsRequired`, blowup IDs to Journeyman `drillsRequired` | XS | No |
| W6-5 | Full regression run: existing golden fixtures must be byte-identical (new drill events must not appear in scenario golden files) | S | No |

---

## 6. Open Questions

**OPEN-LDED-1. Drawdown survival: authored vs procedural position sizing.**
DRILL_SYSTEM_BRIEF.md §9 OPEN-5 deferred this. The `DrillSeedConfig` in this brief
specifies authored (static) quantities and prices. Should the position size be re-computed
on retry (so the effective drawdown percentage stays constant even if PRNG produces a
different starting price)? The authored-static approach gives a consistent experience per
market variant; re-computation on retry is more realistic but adds math to the seed path.
Recommend: authored-static for v1, procedural as a v2 option. Owner preference?

**OPEN-LDED-2. Session-end trigger for Drawdown Survival at recovery.**
The drill ends "when you reach your starting balance or exhaust the account"
(DRILL_SYSTEM_BRIEF.md §1.4). "Reaching starting balance" requires an account equity
comparison — a PnL read. Options: (a) drop recovery end-trigger entirely (drill ends only
at tick limit or account zero); (b) implement recovery end-trigger using a non-PnL proxy
(e.g., position is closed and no open positions remain — the session clock then counts
down naturally). The zero-PnL proxy owner ruling means option (b) is the only permissible
form if recovery detection is wanted. Is the recovery trigger important for player
experience, or is the tick-limit ending sufficient?

**OPEN-LDED-3. Blowup mechanism classifier: account equity data source.**
The `classifyBlowupMechanism` function needs account equity at each `order_submit` to
compute effective leverage. The EventLog does not currently include account equity in any
event type. Two options: (a) add an `account_snapshot` field to `OrderSubmitEvent`
(equity at submit time) — this is a new field in the EventLog schema and requires a
replayVersion bump; (b) replay the session internally (re-run the engine against the
EventLog to reconstruct equity at each tick — the engine is deterministic, so this is
lossless). Option (b) avoids a schema change but adds compute cost at debrief render time.
Recommend (b) for v1 (no schema change, debrief computation is acceptable lag). Owner
preference?

**OPEN-LDED-4. `forceFill` and the order ID namespace.**
The seeding mechanism uses authored order IDs (e.g., `seed-entry-001`) to guarantee
byte-stable golden fixtures. These authored IDs must not collide with the live order ID
namespace (UUIDs). The simplest guard is a `seed-` prefix convention checked at
`OrderBook.forceFill` entry. Should the engine enforce this prefix as a hard validation,
or is it a documentation-only convention? A hard enforcement catches authoring errors
early.

---

*End of LIVE_DRILL_ENGINE_BRIEF.md*
