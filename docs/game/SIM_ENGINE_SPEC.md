# TradeGame — Sim Engine Specification

**Version:** 0.1 (Phase 2 vertical-slice target)
**Status:** Spec only — no code this round (owner ruling 2026-06-07)
**Scope:** Deterministic simulation engine, data layer, order model, scoring, replay,
account/governance pre-wiring, tech recommendation, testability plan.
**Ethics rail:** All spec decisions must preserve process-only scoring. Any spec section
that would introduce PnL-ranked output is a design violation.

---

## Table of Contents

1. [Architecture](#1-architecture)
2. [Data Layer Abstraction](#2-data-layer-abstraction)
3. [Order Model](#3-order-model)
4. [Scoring Engine](#4-scoring-engine)
5. [Replay Format](#5-replay-format)
6. [Account and Profile Requirements](#6-account-and-profile-requirements)
7. [Tech Recommendation](#7-tech-recommendation)
8. [Phase 2 Vertical-Slice Cutline](#8-phase-2-vertical-slice-cutline)

---

## 1. Architecture

### 1.1 Deterministic Seeded Engine

The sim engine is fully deterministic: given a seed + player-action log, the session
replays identically on any client or server. This is the architectural foundation for
replay sharing and coach annotation (GDD §7, P4).

```
seed (uint32)
  └─▶ PRNG state
        └─▶ IMarketFeed (synthetic or replay)
              └─▶ TickPipeline
                    ├─▶ OrderBook (per market)
                    ├─▶ PositionLedger
                    ├─▶ EventInjector
                    └─▶ ScoreTracker
                          └─▶ EventLog (append-only, JSON)
```

**Seed provenance:** For scenarios, the seed is embedded in the scenario definition
(static, authored). For Paper Trading Sandbox sessions, the seed is generated at
session-start and stored with the session record. The seed must be persisted so the
session can be replayed.

**PRNG:** A portable, platform-independent PRNG is required (same output on server-side
node.js and browser). Recommendation: xoshiro128** (32-bit state, well-tested, no
crypto requirement). Seed + PRNG implementation must be co-tested with golden-replay
tests (see §7.4).

**Determinism constraints:**
- No `Math.random()` in the sim path.
- No `Date.now()` in the sim path — time is derived from tick index and compression
  multiplier, not wall clock.
- All market events (slippage, spread calculation) must be derived from the PRNG state,
  not system entropy.

---

### 1.2 Tick Pipeline

A tick is the atomic unit of sim time. Every tick:

```
tick(n):
  1. Advance PRNG state
  2. Generate price + volume sample (via IMarketFeed adapter)
  3. Check EventInjector for scenario beats at tick n
  4. Update OrderBook (check limit/stop triggers)
  5. Fill any triggered orders (apply slippage model)
  6. Update PositionLedger
  7. Emit process-metric checks to ScoreTracker
  8. Append tick event to EventLog
```

**Tick rate:** TUNABLE per scenario/mode:
- Default: 1 tick = 1 second of sim time
- Candle display: N ticks aggregated into 1-minute, 5-minute, or 15-minute candles
  depending on scenario (see SCENARIOS_V0.md for per-scenario granularity)

**UI decoupling:** The tick pipeline runs independently of the render frame rate.
Rendering subscribes to the event stream; the engine does not wait for render.

---

### 1.3 Time-Compression Controls

| Mode | Multiplier | Tick delivery | Notes |
|------|------------|---------------|-------|
| Paused | 0x | No ticks | Player can journal, place pending orders |
| Normal | 1x | Real-time | Default |
| Fast | 4x | 4 ticks/second delivered per sim-second | Standard fast-forward |
| Turbo | 16x | 16 ticks/second delivered per sim-second | For end-of-session scan |

**Constraints:**
- Time compression cannot be changed while an order is being confirmed (to prevent
  accidental fills during compression transitions).
- Pausing is always available, unrestricted — the GDD explicitly supports pausing to
  journal.
- At 16x, candle rendering switches to pre-rendered bar-fill animation rather than
  live painting (performance).

TUNABLE: 4x and 16x multiplier values. Playtest for perceptual comfort.

---

### 1.4 Event Injection System

Scenarios are driven by a beat schedule: a list of (tick_index, event_type, payload)
tuples that fire during tick processing.

**Event types:**

| Event type | Payload | Effect |
|------------|---------|--------|
| `price_override` | `{price, duration_ticks}` | Forces price to a target, overriding the generator, to guarantee scenario beats land (e.g., the sweep low in SCN-003 hits exactly 1.2783) |
| `volume_multiplier` | `{multiplier, duration_ticks}` | Scales generated volume for event phases |
| `spread_override` | `{spread_pips, duration_ticks}` | Sets spread directly (session open spikes, depeg widening) |
| `news_ticker` | `{text, dismissible: bool}` | Fires the news ticker overlay; text is factual/mechanical only — no price predictions |
| `ui_prompt` | `{element_id, message}` | Triggers a UI prompt (journal open, lesson card) |
| `trading_halt` | `{duration_ticks}` | Disables order entry (end of scenario, session close) |
| `decision_point` | `{id, label}` | Marks the EventLog for coaching annotation alignment |

**Authoring:** Scenario beat schedules are defined in the scenario YAML/JSON config
(see SCENARIOS_V0.md template). The EventInjector reads the schedule at scenario load
and fires events as the tick index advances.

**Hard rule:** `news_ticker` events must not contain buy/sell language or price targets.
This is validated at scenario-load time (string scan for prohibited phrases: "buy",
"sell", "target", "expect", "price will"). COSTLY: building the phrase validator is
small; the prohibited phrase list must be maintained.

---

## 2. Data Layer Abstraction

### 2.1 IMarketFeed Interface

All market data flows through one interface regardless of source.

```typescript
interface IMarketFeed {
  // Initialize with seed and market-specific config
  init(seed: number, config: MarketConfig): void;

  // Advance one tick; returns the tick data
  nextTick(): TickData;

  // Seek to a specific tick index (used by replay)
  seekTo(tickIndex: number): void;

  // Market-specific session state query
  sessionState(): SessionState;
}

interface TickData {
  tickIndex:    number;
  timestamp:    number;      // sim milliseconds from session start
  open:         number;
  high:         number;
  low:          number;
  close:        number;
  volume:       number;
  spread:       number;      // in price units (not pips — adapter converts)
  marketType:   'crypto' | 'stocks' | 'forex';
}

interface SessionState {
  isOpen:       boolean;     // false during halts, after-hours (stocks), weekends (forex)
  sessionName:  string;      // "London" | "New York" | "Tokyo" | "Sydney" | "pre-market" | ...
  haltReason:   string | null;
}
```

**Three v1 adapters — see §2.2–2.4 for each.**

**Stub interface for future live data:**

```typescript
// Stubbed — not implemented in v1. Requires RISK_REGISTER §23 license review before
// any real or historical data is connected.
class LiveDataAdapter implements IMarketFeed {
  init(seed: number, config: MarketConfig): void {
    throw new Error('LiveDataAdapter: not available until license review gate cleared');
  }
  nextTick(): TickData {
    throw new Error('LiveDataAdapter: not available until license review gate cleared');
  }
  seekTo(tickIndex: number): void { /* no-op */ }
  sessionState(): SessionState {
    return { isOpen: false, sessionName: 'unavailable', haltReason: 'license gate' };
  }
}
```

---

### 2.2 Crypto Adapter (Synthetic Generator)

**Characteristics to model:**
- 24/7 — no session boundary, no weekend gap
- Regime switching: alternating trending and ranging periods
- High-volatility events: rapid price cascades, spread spikes
- Depeg hook for stablecoin scenarios

**Price model: Regime-Switching GBM**

```
price(t) = price(t-1) * exp(mu(regime) * dt + sigma(regime) * sqrt(dt) * Z)

where:
  Z        ~ N(0,1) drawn from PRNG
  regime   in {TREND_UP, TREND_DOWN, RANGE}
  mu(TREND_UP)   = TUNABLE: 0.0002 per tick (annualizes to ~36%)
  mu(TREND_DOWN) = TUNABLE: -0.0002 per tick
  mu(RANGE)      = TUNABLE: 0.00001 per tick
  sigma(TREND)   = TUNABLE: 0.008
  sigma(RANGE)   = TUNABLE: 0.004

Regime transition:
  Each tick: P(transition) = TUNABLE: 0.001 (average regime length ~1000 ticks / ~17 min)
  Regime weights: [0.35 TREND_UP, 0.35 TREND_DOWN, 0.30 RANGE] — TUNABLE
```

**Depeg event hook (for SCN-001 type scenarios):**
Triggered by the EventInjector `price_override`. After the override sequence completes,
the generator resumes from the forced price with sigma dramatically elevated:

```
sigma_post_depeg = sigma(TREND) * TUNABLE: 5.0 (5x volatility multiplier, decays
                   back to normal over TUNABLE: 300 ticks)
```

**Spread model (crypto):**
```
spread(t) = base_spread * (1 + k * |delta_price|)
where:
  base_spread = TUNABLE: 0.001 (0.1% of price)
  k           = TUNABLE: 10.0 (spread amplification on price movement)
```

---

### 2.3 Stocks Adapter (Synthetic Generator)

**Characteristics to model:**
- US session hours: 09:30–16:00 ET (pre-market: 04:00–09:30; after-hours: 16:00–20:00)
- Intraday: session-open volatility spike, intraday range compression, closing auction
- Earnings event hook: gap at open, then regime shift
- Trading halts: circuit-breaker events

**Session-hours enforcement:**
```typescript
function isSessionOpen(simTime: Date): boolean {
  const et = toEasternTime(simTime);
  return et.hour >= 9 && (et.hour < 16 || (et.hour === 9 && et.minute >= 30));
}
// Pre-market and after-hours: isSessionOpen = false, spread = 3x base, volume = 0.1x
```

**Price model:** Same regime-switching GBM as crypto adapter.

**Additional parameters:**

```
sigma(TREND) stocks  = TUNABLE: 0.004   (lower than crypto)
sigma(RANGE) stocks  = TUNABLE: 0.002
Open volatility spike: sigma *= TUNABLE: 2.5 for first TUNABLE: 90 ticks of session
```

**Earnings gap hook:**
On scenario load, if an earnings event is defined:
```
gap_magnitude  = TUNABLE: drawn from N(0.08, 0.03) — 8% expected gap, 3% std dev
gap_direction  = defined in scenario config (up | down | random)
post_gap_regime = TREND_UP | TREND_DOWN | RANGE — defined in scenario config
post_gap_sigma_multiplier = TUNABLE: 1.8 decaying to 1.0 over TUNABLE: 1200 ticks
```

**Trading halt hook:**
When triggered by EventInjector:
- Set `SessionState.isOpen = false`
- `SessionState.haltReason = "circuit breaker"` or scenario-defined reason
- Duration: defined in event payload
- During halt: order entry disabled, time still advances, news ticker may fire

---

### 2.4 Forex Adapter (Synthetic Generator)

**Characteristics to model:**
- Session windows: Sydney (22:00–07:00 UTC), Tokyo (00:00–09:00 UTC), London (08:00–17:00
  UTC), New York (13:00–22:00 UTC)
- Spread varies by session overlap: tightest at London+NY overlap (13:00–17:00 UTC)
- Weekend gap: Friday 22:00 UTC close, Sunday 22:00 UTC open (gap applied at first tick)
- Session-open sweep hook

**Session spread model:**
```
spread(session) by session phase:
  single session active:    TUNABLE: 1.2 pips
  session overlap active:   TUNABLE: 0.8 pips
  between sessions (quiet): TUNABLE: 2.5 pips
  session open first 5 min: TUNABLE: spread * 3.5 (spike, decays linearly)
```

**Weekend gap:**
```
gap = TUNABLE: N(0, sigma_weekend) where sigma_weekend = TUNABLE: 0.0020
Applied as price_override at Sunday open tick
```

**Session-open sweep hook (for SCN-003 type scenarios):**
EventInjector fires a `price_override` to drive price to the sweep target, followed by
a volume spike and rapid reversal sequence. Post-sweep, the generator resumes with
TREND regime biased in the reversal direction for TUNABLE: 600 ticks.

**Price model:** Same regime-switching GBM.
```
sigma(TREND) forex = TUNABLE: 0.0015   (much lower than crypto)
sigma(RANGE) forex = TUNABLE: 0.0006
```

---

### 2.5 Reference (Non-Tradeable) Instruments — closes SG-08

Advanced scenarios (ACN-004) require a second data stream the player can observe but
not trade: the NMX 100 index (always the full form "NMX 100", never bare "NMX" —
FICTIONAL_CANON.md Standing Rule 6) rendered as a read-only reference chart alongside
the primary instrument.

**Engine model:**

```typescript
interface InstrumentConfig {
  instrumentId:  string;        // e.g. 'NMX100' (internal id; display name "NMX 100")
  displayName:   string;        // canonical display form from FICTIONAL_CANON.md
  marketType:    'crypto' | 'stocks' | 'forex' | 'index';
  tradeable:     boolean;       // false for reference instruments
  feed:          IMarketFeed;   // reference feeds use the same adapter machinery
}
```

- A reference instrument is a second `IMarketFeed` instance running in the same tick
  pipeline, advanced from the **same session seed** with a per-instrument stream
  offset: `sub_seed = seed XOR fnv1a32(instrumentId)` (FNV-1a 32-bit — named
  explicitly because golden-replay determinism (§7.4) requires an identical,
  portable derivation on every platform; no language-default `hash()`).
- **Type impact:** `TickData.marketType` (§2.1) and the `InstrumentConfig.marketType`
  union gain the `'index'` member together, in the same replayVersion-2 change that
  adds `instrumentId` — they must not drift apart.
- **Engine-level rejection (defense in depth):** `OrderBook` must reject any
  `order_submit` whose `instrumentId` resolves to `tradeable: false`, with reason
  `instrument_not_tradeable`. The UI never offering the instrument in the order ticket
  is necessary but not sufficient — the engine enforces it.
- **Correlation hook:** for regime-indicator use (ACN-004), the reference feed's
  regime state may be linked to the primary feed's regime schedule via the scenario
  config (shared regime timeline), rather than independent generation. Scenario
  authors choose linked or independent per scenario.
- **Scoring:** the ScoreTracker ignores reference-instrument ticks entirely; no
  process metric may read reference price levels (a metric like "exited when the
  index fell below X" would be outcome-prediction territory — prohibited). Reference
  instruments exist for *information-management* teaching only; any scoring tied to
  them must use process predicates (e.g., journal entries tagged `regime_observation`),
  never price levels.

**UI surface:** the reference chart renders as a secondary read-only panel below or
beside the primary chart, clearly labeled "{NMX 100} — reference only, not tradeable."
No order ticket binding, no position panel rows, no stop fields.

**Replay schema impact:** EventLog `TickEvent` (§5.1) is single-instrument in
replayVersion 1. Multi-feed sessions require an optional `instrumentId` field on
`TickEvent` (absent = primary instrument, preserving backward compatibility) and a
`replayVersion: "2"` bump. COSTLY: schema migration + replay-viewer support; required
before ACN-004 ships, not Phase-2 blocking.

---

## 3. Order Model

### 3.1 Order Types

| Order type | Description | Available markets |
|------------|-------------|-------------------|
| Market | Fills immediately at next tick; slippage applied | All |
| Limit | Fills when price reaches or crosses limit level | All |
| Stop | Fills when price reaches or crosses stop level; slippage applied | All |
| Stop-limit | Stop triggers a limit order (not a market fill) | All |

**Stop-limit note:** Stop-limit orders can fail to fill if price gaps through the limit.
The sim models this correctly — this is an intentional teaching mechanic (debrief can
flag "your stop-limit did not fill because price gapped"). COSTLY: debrief messaging
for missed stop-limit fills needs authored copy per market.

---

### 3.2 Slippage Model

Slippage is simulated to teach its real cost. It is displayed explicitly in the order
confirmation and debrief.

```
slippage(order) = base_slippage * volatility_multiplier * size_multiplier

where:
  base_slippage       = TUNABLE per market:
                        crypto: 0.05%  of fill price
                        stocks: 0.02%  of fill price
                        forex:  0.3 pips
  volatility_multiplier = current_sigma / base_sigma
                          (sigma pulled from generator state at fill time)
  size_multiplier     = 1.0 for standard sizes
                        TUNABLE: 1.5 for positions > TUNABLE: 5% of account
                        (models market impact for larger sim sizes)

Fill price (market/stop orders):
  buy:  next_tick.close + spread + slippage
  sell: next_tick.close - spread - slippage
```

**UI requirement:** Every order confirmation must show:
- Expected fill price
- Actual fill price (after slippage)
- Slippage cost in price units and % of position
- Spread cost in price units

This is not optional — it is the mechanism by which the game teaches transaction costs.

**Fill confirmation overlay behavior — closes SG-02:**

After each `order_fill`, a fill confirmation overlay displays the actual vs. estimated
fill, slippage realized, spread cost, and fee charged (the four mandatory items above).

- **Timing:** auto-dismisses after TUNABLE: 3 seconds of wall-clock time (not sim
  time — at 16x compression a sim-time overlay would be unreadable).
- **Early dismissal:** a click/tap anywhere on the overlay dismisses it immediately.
  Dismissal is presentational only and is NOT logged to the EventLog (the fill data
  is already canonically recorded in the `order_fill` event; logging UI dismissals
  would add noise with no process-metric value).
- **Non-blocking:** the overlay is non-modal. Chart, journal drawer, and order ticket
  remain fully interactive while it is visible. It must not obscure the order ticket's
  estimated-fill panel (place it over the chart area, top-right corner).
- **Multiple fills:** if a second fill occurs while an overlay is visible, overlays
  stack vertically, newest on top, maximum TUNABLE: 3 visible; the oldest is dropped
  first. Each overlay runs its own dismissal timer.
- **Time-compression interaction (clarifies §1.3):** the §1.3 rule "time compression
  cannot be changed while an order is being confirmed" spans:
  - immediate fills (market orders, triggered stops): from `order_submit` until the
    fill confirmation overlay is dismissed or expires;
  - resting orders (limit, stop, stop-limit): from `order_submit` until the engine
    accepts the order as resting (one tick) — the lock must NOT persist while a
    resting order waits for its trigger, which could span the whole session. When a
    resting order later fills, the overlay appears but speed controls stay enabled
    (the player took no compression action during that fill's confirmation).
  Pause remains available at all times (pause is never restricted, per §1.3).

---

### 3.3 Fee Model

| Market | Fee type | Rate | Notes |
|--------|----------|------|-------|
| Crypto | Maker/taker fee | TUNABLE: 0.1% maker, 0.15% taker | Applied per fill; shown in confirmation |
| Stocks | Commission per trade | TUNABLE: $0.00 (zero-commission model for sim simplicity) | Can be toggled to $1/trade for "commission model" lesson |
| Forex | Spread only | No additional fee | Spread IS the cost; shown in pips |

Fees are included in realized PnL calculation for internal accounting purposes only.
They are never displayed as a leaderboard component or scoring variable.

---

### 3.4 Position and Margin Model

#### Crypto (spot, v1)

```
position_value  = quantity * current_price
account_equity  = cash + unrealized_pnl
max_position    = account_equity  // spot only: no leverage in v1

margin_available = account_equity - sum(position_values)
// If margin_available < 0: new orders rejected with message "Insufficient account balance"
```

Leverage for crypto is deferred (GDD §10 out-of-scope list: leverage variants later).

#### Stocks (cash account, v1)

```
position_value  = shares * current_price
account_equity  = cash + unrealized_pnl
max_position    = account_equity  // cash account: no leverage in v1
```

Pattern Day Trader rule is NOT modeled in v1 (COSTLY to model correctly; deferred).
A note in the debrief mentions that real accounts have PDT restrictions.

#### Forex (leveraged, prominent risk display)

Forex positions use leverage. This is an intentional teaching mechanic, not a gambling
feature — the point is to demonstrate how leverage amplifies both gains and losses.

```
pip_value(pair, lot_size) = lot_size * pip_size
// All sim forex pairs are HarborUSD-quoted (FICTIONAL_CANON: ANDU/HarborUSD,
// KORVA/HarborUSD), so pip value is flat per lot — no rate conversion.
// Example: 1 standard lot ANDU/HarborUSD, pip_size 0.0001
// pip_value = 100000 * 0.0001 = $10.00/pip  (mini: $1.00, micro: $0.10)
// Matches sim/src/orders/account.ts pipValue() and the lesson convention
// (PILLAR_INTROS forex pillar, FOUNDATION, X-B01).

margin_required = (lot_size * current_price) / leverage_ratio
// leverage_ratio = TUNABLE: 30:1 (EU/UK retail cap level — conservative default)

account_equity       = balance + unrealized_pnl
free_margin          = account_equity - used_margin
margin_call_level    = TUNABLE: 50% (warning issued)
stop_out_level       = TUNABLE: 20% (positions auto-closed, scenario ends with coaching flag)
```

**Mandatory risk display for forex:**
Before any forex position is opened, the UI must show:
> "Leverage amplifies both profits and losses. You can lose more than you intended.
> This is a practice environment — real forex trading involves real money and real risk."

This display is not dismissible without the player clicking "I understand — this is
a practice session." The click is logged in the EventLog (process metric: player
acknowledged leverage risk before entry).

COSTLY: The mandatory risk display requires a separate UI component that blocks order
entry. Must be built and cannot be bypassed by any configuration flag.

#### Multi-position aggregate exposure (advanced tier) — closes SG-07

Advanced scenarios with concurrent positions (ACN-001: two crypto positions; ACN-006:
two forex pairs) require the Position Panel to show portfolio-level exposure, not just
per-position rows. Not Phase-2 blocking; must be implemented before any ACN scenario
with `positions ≥ 2` ships.

**Definitions (computed by PositionLedger, displayed by UI):**

```
aggregate_notional   = sum(|position_value_i|) over all open positions
                       // absolute values: a long and a short both ADD exposure;
                       // netting them would hide exactly the risk ACN-001 teaches
exposure_pct         = aggregate_notional / account_equity

forex additionally:
  total_used_margin  = sum(margin_required_i)
  combined_pip_value = sum(pip_value_i)
                       // displayed as "a 1-pip adverse move across all pairs costs ${X}"
                       // deliberately assumes correlation = 1 (worst case) — that IS
                       // the lesson of ACN-006; the panel labels it "if all pairs move
                       // against you together"
```

**UI surface:** when open positions ≥ 2, the Position Panel renders an AGGREGATE
EXPOSURE row above the per-position rows showing `aggregate_notional`, `exposure_pct`,
and (forex) `total_used_margin` + `combined_pip_value`. With 0–1 positions the row is
hidden (no layout change to the Phase-2 single-position panel).

**Scoring interaction:** ACN-006 requires the player to journal their total exposure
percentage before proceeding. The corresponding process predicate follows the
`policy_match` pattern (§4.2): compare the value declared in the `journal_entry`
tagged `exposure_declaration` against the PositionLedger's computed `exposure_pct` at
that tick; match within TUNABLE: ±2 percentage points earns the XP event. The
predicate reads position sizes and account equity (process inputs) — never PnL. It
verifies the player *knows their exposure*, not whether the exposure made money.

---

## 4. Scoring Engine

### 4.1 Design Constraint

The scoring engine emits process-metric events only. It has no knowledge of and makes no
use of PnL data. Any function in the scoring engine that reads `realizedPnL` or
`unrealizedPnL` is a design violation and must be rejected in code review.

---

### 4.2 Process Metric Extraction

The ScoreTracker monitors the EventLog in real time and extracts:

| Metric ID | Description | Extraction logic |
|-----------|-------------|-----------------|
| `journal_before_trade` | Player wrote a journal entry before submitting first order | EventLog: `journal_entry` event precedes first `order_submit` event |
| `size_compliance` | Position size within 10% of the account-risk rule | `position_value / account_equity` vs. player-declared risk % (declared in pre-trade journal; default 1% if not declared) |
| `stop_before_entry` | Stop order submitted before or simultaneously with entry order | EventLog: `order_submit` with `stop` type has timestamp ≤ entry fill timestamp |
| `stop_honored` | Stop order not manually cancelled after position open | EventLog: no `order_cancel` event for the stop order after fill |
| `exit_journal` | Player wrote a journal entry mentioning the exit | EventLog: `journal_entry` with tag `exit` exists for the session |
| `no_stop_widen` | Stop not moved away from entry after position open | EventLog: no `order_modify` event that increases stop distance after fill |
| `patience_observation` | Player journaled without trading (session completed with no fills) | `journal_entry` count ≥ 1, `order_fill` count = 0 |
| `leverage_ack` (forex only) | Player acknowledged leverage risk before entry | EventLog: `leverage_risk_acknowledged` event precedes first forex fill |
| `debrief_completed` | Player completed the debrief screen | EventLog: `debrief_complete` event |
| `session_reviewed` | Player replayed the session post-completion | EventLog: `replay_started` event in a post-session context |
| `policy_match` (News/Plan Card scenarios only) | Player's declared policy option matches their actual in-scenario behavior during the event window | Reads the `pre_event_declaration` tag and declared option (A/B/C) from the `JournalEntryEvent` logged at card confirmation; compares to actual behavior: option A = `PositionLedger` shows no open positions at T-01 (no orders in window); option B = position held through window with a stop set and a `leverage_ack` logged (held with declared stop); option C = no `order_submit` events during the event window (observe-only). Match: emits +25 XP event per SCENARIOS_V1 SCN-006 rubric. Mismatch: no XP, emits `policy_mismatch` debrief flag. Computed deterministically from the EventLog alone; no runtime judgment required. |

**Scenario-specific metrics (SCENARIOS_V1) — rubric-gated:**

The V1 scenarios add four metrics that exist only where a scenario authors them.
Each is applicable ONLY when listed in the running scenario's
`manifest.xpRubric` (passed to the scorer as `MetricInput.rubricMetricIds`);
on every other scenario the metric is inert — no XP event, no fail row, and
no change to V0 golden digests.

| Metric ID | Scenario | Description | Extraction logic |
|-----------|----------|-------------|-----------------|
| `il_estimate_written` (+25) | SCN-004 | LP Position Panel consulted and an IL estimate written at the major-divergence checkpoint | `journal_entry` tagged `il_estimate` after the first `order_fill` (the deposit). Inapplicable without a deposit — the patience path owns the journal XP. |
| `trigger_updated` (+15) | SCN-004 | Withdrawal trigger updated after a decision to hold | `journal_entry` tagged `trigger_update` after the first `order_fill`. |
| `no_entry_window` (+15) | SCN-005, SCN-006 | No entry during a scenario-authored no-entry window (D1 announcement open; news whipsaw) | No `order_submit` with timestamp inside any `manifest.noEntryWindows` range AND the discipline was pre-stated (a `plan`/`hypothesis` journal or a `policy_declared` event before the earliest window opens — per the V1 rubrics' "only if pre-stated"). |
| `policy_declared_card` (+30) | SCN-006 | News Policy Card completed with journal rationale before T-01 | `policy_declared` event with `journalWordCount` ≥ 6 at or before `manifest.policyDeadlineMs` (deadline optional). The behavior-match half is the separate `policy_match` metric. |

**Clarification — `stop_honored` and the session-end cancel:** the harness
auto-cancels all pending orders at scenario end with reason `session_end`.
That cancel is engine housekeeping, not a player action, and is exempt from
`stop_honored` ("not MANUALLY cancelled"). A stop that rode untriggered to
the end of the session was honored, not abandoned.

**Process-metric compliance indicator (Position Panel UI surface) — closes SG-03:**

The Position Panel displays a live per-position compliance indicator for the two
stop-discipline metrics, so the player gets in-the-moment feedback rather than
debrief-only feedback:

| Indicator state | Condition (from ScoreTracker, live) |
|-----------------|-------------------------------------|
| ✓ green "Stop set before entry" | `stop_before_entry` currently true for this position |
| ✓ green "Stop honored" | position open, stop active, no cancel/widen events |
| ⚠ amber "Stop cancelled" / "Stop widened" | `stop_honored` or `no_stop_widen` has gone false |
| (no indicator) | no open position |

Rules:
- **Single source of truth:** the indicator must read the ScoreTracker's live metric
  evaluation. The UI must NOT re-derive these predicates from raw events — duplicated
  logic will drift from the scoring engine and show the player a compliance state that
  contradicts their debrief rubric.
- The indicator reflects process state only. It never changes color or content based
  on the position's PnL, direction, or distance to profit (a green check on a losing
  trade is correct and intentional — that is the entire teaching model, §4.1).
- Indicator state changes are driven by EventLog events (`order_submit`,
  `order_cancel`, `order_modify`, fills) — not polled per render frame.
- The amber states are observational, mirroring the debrief tone rules: label text is
  factual ("Stop cancelled at T+12"), never punitive.

---

### 4.3 XP Event Emission

ScoreTracker emits XP events (not PnL data) to the progression system.

```typescript
interface XpEvent {
  sessionId:   string;
  metricId:    string;         // from metric table above
  xpAmount:    number;         // see SCENARIOS_V0.md per-scenario rubrics
  tradeIndex:  number | null;  // which trade triggered this (null for session-level metrics)
  timestamp:   number;         // sim milliseconds
}
```

XP events are appended to the EventLog. The progression system reads XP events only;
it never reads trade outcome data.

**Reckless-winner flag:**
If `size_compliance = false` OR `stop_before_entry = false`, AND the session has at
least one profitable trade, a `reckless_winner_flag` event is emitted to the EventLog.
The UI renders a coaching alert in the debrief. No XP is subtracted; the flag is
informational.

```typescript
interface RecklessWinnerFlag {
  type:        'reckless_winner_flag';
  metricsFailed: string[];     // which process metrics were violated
  coachingText:  string;       // authored per-scenario; loaded from scenario config
}
```

**Debrief placement and visibility — closes SG-05:**

- The coaching alert renders in the Debrief Screen's right-panel COACHING ALERT
  region (UI_WIREFRAMES Screen 5), directly below the XP summary.
- **Above-the-fold requirement:** at the minimum supported desktop viewport
  (TUNABLE: 1280×720 CSS pixels) the alert's heading and at least the first two lines
  of `coachingText` must be visible without scrolling. If authored `coachingText`
  exceeds the visible region, the alert truncates with an "expand" affordance — it
  must never be pushed entirely below the fold by other right-panel content.
- **Priority:** if multiple coaching flags exist for the session (reckless-winner plus
  process-gap flags), `reckless_winner_flag` takes the top slot — it is the flag with
  the highest miseducation risk (a profitable outcome reinforcing a bad process).
- The alert is visually distinct from the rubric (alert styling, not checklist
  styling) but is labeled "COACHING OBSERVATION" — not "penalty," "violation," or
  "warning." No XP is subtracted (unchanged from above; the flag is informational).
- `debrief_complete` does not require the player to expand or acknowledge the alert —
  forcing acknowledgment would train players to click through it (banner blindness);
  prominence, not friction, is the mechanism.

---

### 4.4 What the Scoring Engine Never Emits

The following are explicitly prohibited from appearing in any scoring engine output:

- PnL in any unit ($ / % / pips)
- Win rate
- Return on account
- Comparison of profit against other players
- Any ranking based on trade outcomes

If a future engineer adds a `pnlScore` field to any scoring output type, it must be
rejected in code review with a reference to this spec section and RISK_REGISTER §16.

---

### 4.5 Rank Progression and Display — closes SG-01

GDD §7 defines the rank ladder (`Observer → Trainee → Practitioner → Journeyman →
Strategist → Senior Strategist`) and the rule that ranks are earned by XP plus
minimum drills completed — never by PnL milestones. This section specifies the
engineering interface and the display format the Main Menu wireframe assumes.

**Rank threshold lookup interface:**

```typescript
interface RankThreshold {
  rankId:        string;    // 'observer' | 'trainee' | 'practitioner' | ...
  displayLabel:  string;    // "Trainee" — authored, localizable
  xpRequired:    number;    // cumulative process-XP to reach this rank
  drillsRequired: string[]; // drill IDs that must be completed (GDD §7: XP alone
                            // is insufficient — prevents XP-grinding past skills)
}

interface RankService {
  // Pure function of (xpTotal, completedDrillIds) → current rank + progress.
  // Reads XP events and drill-completion events ONLY. Reading any trade-outcome
  // data here is a §4.4 violation.
  currentRank(xpTotal: number, completedDrillIds: string[]): {
    rank:           RankThreshold;
    nextRank:       RankThreshold | null;   // null at top rank
    xpIntoRank:     number;
    xpToNextRank:   number;                 // for the progress bar
    drillsMissing:  string[];               // empty if only XP is short
  };
}
```

Threshold values are TUNABLE scenario-economy numbers (placeholder ladder:
0 / 200 / 800 / 2000 / 4500 / 8000 cumulative XP — to be balanced against per-scenario
rubric totals once more scenarios are scored; see SCENARIOS_V0/V1 rubrics).

**Display format (Main Menu, per UI_WIREFRAMES Screen 1):**

- Rank label + progress bar: `Rank: {displayLabel}` and
  `XP: {xpTotal} / {nextRank.xpRequired} to {nextRank.displayLabel}`
  (matches the wireframe's `Rank: Trainee — XP: 420 / 800 to Practitioner`;
  both numbers are cumulative XP, so the bar fill is
  `(xpTotal − rank.xpRequired) / (nextRank.xpRequired − rank.xpRequired)`).
- If XP suffices but drills are missing, the bar shows full with the label
  `"Complete {drill name} to advance"` — the gate is explicit, never a silent stall.
- At top rank the bar is replaced by the rank label alone (no infinite-progression
  treadmill; GDD's progression ends in cohort/coaching roles, not number-go-up).
- The progress bar reads process XP only. No PnL, win-rate, or outcome component may
  appear on or near the rank display (§4.4; GDD §7 leaderboard constraint).
- Rank-up moment: a rank change triggers a one-time, dismissible congratulation card
  listing which process behaviors earned it ("You ranked up by journaling 12 sessions
  and honoring every stop"). It names process behaviors, never trade outcomes.

Cohort-model questions (per-market vs cross-market rank gates — GDD §11 Q3) remain
open and do not block this interface: `RankService` is cohort-agnostic.

Implementation timing: rank system is wired in Phase 3 per the §8 cutline ("XP
progression / rank unlock" deferred row). This section exists so the Main Menu UI
and the XP economy can be designed against a stable interface now.

---

## 5. Replay Format

### 5.1 EventLog Schema

The EventLog is an append-only array of typed event objects. The full log is the
canonical record of a session — the sim engine can replay any session by initializing
the PRNG to the session seed and re-processing the log.

```typescript
// Discriminated union of all event types
type SimEvent =
  | TickEvent
  | OrderSubmitEvent
  | OrderFillEvent
  | OrderCancelEvent
  | OrderModifyEvent
  | JournalEntryEvent
  | ScenarioBeatEvent
  | XpEvent
  | RecklessWinnerFlag
  | LeverageAckEvent
  | DebriefCompleteEvent
  | ReplayStartedEvent
  | SessionStartEvent
  | SessionEndEvent;

interface SessionStartEvent {
  type:        'session_start';
  sessionId:   string;           // UUID
  scenarioId:  string | null;    // null for sandbox sessions
  seed:        number;           // PRNG seed — required for replay
  marketType:  'crypto' | 'stocks' | 'forex';
  tickIndex:   0;
  timestamp:   0;
}

interface TickEvent {
  type:        'tick';
  tickIndex:   number;
  timestamp:   number;
  open:        number;
  high:        number;
  low:         number;
  close:       number;
  volume:      number;
  spread:      number;
}

interface OrderSubmitEvent {
  type:         'order_submit';
  orderId:      string;
  orderType:    'market' | 'limit' | 'stop' | 'stop_limit';
  side:         'buy' | 'sell';
  quantity:     number;
  price:        number | null;   // null for market orders
  stopPrice:    number | null;
  tickIndex:    number;
  timestamp:    number;
}

interface OrderFillEvent {
  type:         'order_fill';
  orderId:      string;
  fillPrice:    number;
  slippage:     number;
  spreadCost:   number;
  feeCost:      number;
  tickIndex:    number;
  timestamp:    number;
}

interface JournalEntryEvent {
  type:         'journal_entry';
  entryId:      string;
  tags:         string[];        // e.g. ['pre_trade', 'hypothesis', 'exit']
  wordCount:    number;          // not the text itself — for process metric use
  tickIndex:    number;
  timestamp:    number;
  // Journal text stored separately (server-side, not in the shareable replay)
  // Rationale: journal text may contain personal information; replay is shareable
}

interface ScenarioBeatEvent {
  type:         'scenario_beat';
  beatId:       string;          // from scenario config
  decisionPointId: string | null;
  tickIndex:    number;
  timestamp:    number;
}
```

**Journal text privacy:** Journal entry text is stored server-side and never included in
the shareable replay log. Only `wordCount` and `tags` travel with the replay. This is a
privacy design decision, not an oversight — journal entries are sensitive financial
behavior data (RISK_REGISTER §14).

---

### 5.2 Shareable Replay

A replay link packages:

```json
{
  "replayVersion": "1",
  "sessionId":     "<uuid>",
  "scenarioId":    "<string or null>",
  "seed":          12345678,
  "marketType":    "crypto",
  "events":        [ /* filtered EventLog — see §5.3 */ ],
  "annotations":   [ /* coach annotations — see §5.4 */ ]
}
```

**Filtering for shareability:**
- `journal_entry` events included (wordCount + tags only, no text)
- `order_fill` events: `fillPrice` and `slippage` included; no account balance data
- `tick` events: all included (price/volume data is synthetic, no PII concern)
- XP events: included (process metric results)
- Session balances, cumulative PnL: excluded from shareable format

COSTLY: The filtering pipeline (strip account data before sharing) requires an explicit
sanitization pass on export. This must be implemented and tested before replay sharing
ships.

---

### 5.3 Coach Annotation Overlay

Annotations are stored separately from the session EventLog. They can be added
post-session without mutating the original log.

```typescript
interface CoachAnnotation {
  annotationId:  string;
  sessionId:     string;
  coachId:       string;        // coach account ID (future role — see GDD §7)
  tickIndex:     number;        // time anchor within the replay
  anchorType:    'tick' | 'order' | 'decision_point';
  anchorRef:     string;        // tickIndex, orderId, or decisionPointId
  text:          string;        // process observation only — no signals, no price targets
  createdAt:     number;        // wall clock (not sim time)
  annotationType: 'scenario_authored' | 'coach';
  // 'scenario_authored' — part of scenario content; pre-vetted at authoring time;
  //   NOT run through the runtime content filter.
  // 'coach' — user-generated (coach account); ALWAYS run through the content filter
  //   before display to any other user.
}
```

**Annotation-type distinction:**
- `scenario_authored` annotations are authored by the game content team, embedded in the
  scenario config, and pre-vetted at authoring time. They are loaded alongside the
  EventLog but are not subject to the runtime content filter — vetting happens at
  scenario authoring and review, not at runtime.
- `coach` annotations are user-generated from a coach account, created post-session.
  They must always pass through the server-side content filter before being stored or
  displayed to any other user. The content filter rules (no price targets, no
  buy/sell/go-long/short-here directives) apply without exception.
- The replay viewer renders the two types in visually distinct lanes, per UI_WIREFRAMES
  Replay Viewer (Screen 6): `scenario_authored` annotations display as `[Scenario]`
  entries; `coach` annotations display as `[Coach]` entries.

**Coach annotation content rule (enforced in UI, not just policy):**
The coach annotation input field must not accept text containing price targets or
directives ("buy", "sell", "go long", "short here"). Server-side validation must also
reject annotations containing these patterns. Reference: GDD §7, RISK_REGISTER §1 and §6.

COSTLY: Server-side annotation content filter. Must be built before coaching annotations
ship to any user-facing context.

---

## 6. Account and Profile Requirements

### 6.1 Age Screen

**Mandatory at account creation.** Cannot be bypassed by any code path.

```
Screen: "Before continuing, confirm your age."
Option A: "I am 18 or older"  → proceeds to full account creation
Option B: "I am 13–17"        → proceeds to game-only account (coaching features locked)
Option C: "I am under 13"     → account creation blocked; message: "TradeGame requires
                                 users to be at least 13 years old."

Age affirmation is stored in the account record with a timestamp.
```

Reference: RISK_REGISTER §10 (minors), GDD §9 (governance gate).

COPPA analysis must be completed before any game account data is stored, even for the
vertical slice. This is a hard gate per RISK_REGISTER §10 and GDD §9. If COPPA analysis
is not complete, the vertical slice must operate without persistent accounts (session
data stored client-side only, not server-side).

---

### 6.2 Minimal Data Collection

The account stores only what is operationally required.

| Field | Stored | Rationale |
|-------|--------|-----------|
| Account ID (UUID) | Yes | Session binding |
| Age affirmation (18+ or 13–17) | Yes | COPPA / feature gate |
| Age affirmation timestamp | Yes | Audit |
| Session IDs (replay refs) | Yes | Replay access |
| XP total and metric breakdown | Yes | Progression |
| Journal entries (text) | Yes, encrypted at rest | Personal data — see §6.4 |
| Email address | Optional, collected only for account recovery | Minimal |
| Display name | Optional | No real name required |
| Portfolio state | Yes | Session continuity |
| PnL history | Not stored in any accessible form | See §4.4 |

Real name, phone number, payment information: not collected in v1 (no payment in v1).

---

### 6.3 Governance Tier B Pre-Wiring

Phase 2 triggers Tier B governance requirements (GDD §9, RISK_REGISTER §14). These
must be wired in the codebase before shipping:

| Requirement | Spec disposition |
|-------------|-----------------|
| Privacy policy | Link required on account creation screen and in-app footer. Must exist before first account is created. Spec only — content is a legal document, not engineered here. |
| Data retention schedule | Account data deleted X days after last login. TUNABLE: 365 days. Implementation: soft-delete flag on account record; hard-delete cron job. |
| Erasure path | In-app "Delete my account" button deletes account record, all associated session data, journal entries, and XP records. Confirmation dialog required. Erasure is irreversible — player is warned. |
| Breach response plan | Document in HQ repo (not engineered, but must exist before Phase 2 ships). The engineering hook: a `contact_email` field in a well-known config file that breach notification tooling can read. |
| COPPA analysis | Hard gate — see §6.1. Not an engineering item; a legal/compliance item. Block Phase 2 deploy until completed. |

```typescript
// Erasure hook (must be implemented, not punted)
interface AccountErasureService {
  // Deletes all data associated with accountId.
  // Returns a confirmation token for the player's records.
  eraseAccount(accountId: string): Promise<{ confirmationToken: string }>;
}
```

---

### 6.4 Journal Entry Encryption

Journal entries are sensitive financial behavior data. They must be encrypted at rest.

**Spec:** Encrypt journal entry text using AES-256-GCM with a per-account key derived
from a server-side master key + account ID (HKDF). The per-account key is never stored;
it is derived on read.

COSTLY: Key management infrastructure for per-account encryption at rest. If this is
out of scope for the vertical slice, journal entries must not be persisted server-side
in Phase 2 — store client-side only until encryption is implemented. Do not ship
unencrypted journal entries to a server-side store.

---

## 7. Tech Recommendation

### 7.1 Platform

**Web-first TypeScript.** Matches GDD §9. Enables coach annotation access on any device.
Mobile-responsive layout deferred per GDD §10.

**Build tooling:** Vite (fast HMR, tree-shaking, native ESM). TypeScript strict mode.

---

### 7.2 Rendering Engine Options

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| Plain canvas (2D context) | Zero dependency, full control, easily testable | Manual draw loop, no scene graph, chart library must be built or adapted | Not recommended for v1 — build cost is high |
| Pixi.js | Fast WebGL renderer, lightweight (~2MB), good 2D sprite support, active community | No built-in chart primitives; financial chart components must be custom-built | Viable if team has canvas/WebGL experience |
| Phaser 3 | Full game framework, scene management, audio, input all built in; strong community | Larger bundle (~1MB core + plugins), designed for games not financial charts; chart layer still custom | Viable if game feel (audio, transitions, UI effects) is a priority |

**Recommendation: Phaser 3 — DECIDED 2026-06-07: Phaser 3.**

Rationale:
- TradeGame is a game, not a charting tool. Phaser's scene management, audio hooks, and
  input system are all load-bearing for the game feel described in SCENARIOS_V0.md
  (session bell audio, UI beats, time-compression controls).
- The chart rendering layer is custom regardless of engine choice — Pixi provides no
  advantage there.
- Phaser 3's game loop integrates cleanly with the deterministic tick pipeline: the sim
  engine runs independently of Phaser's update loop; the Phaser scene subscribes to
  sim events.
- Bundle size is acceptable for a desktop-first web app.

COSTLY: If the team has no Phaser experience, the learning curve is real. If the team
has strong React/canvas experience and no game dev background, Pixi + React might be
lower total cost. Owner decision required.

---

### 7.3 State Management

**Sim state:** Managed entirely within the engine (not in a UI state library). The
engine exposes a read-only state snapshot per tick; the UI renders from snapshots.

**UI state:** Zustand (lightweight, TypeScript-first, no boilerplate). Stores:
- Current session view state (selected timeframe, panel layout)
- Journal draft
- Pending order form state

**Server state:** TBD — depends on backend choice. The engine spec is backend-agnostic.
For the vertical slice, local storage can substitute for a backend (client-side sessions
only), which also sidesteps the Tier B governance gate for early testing.

---

### 7.4 Testability Plan — Golden-Replay Regression Tests

The deterministic seeded architecture enables a specific test pattern:

**Golden replay test:**
1. Run a scenario with a fixed seed and a scripted player-action log.
2. Capture the full EventLog output.
3. Store this as a golden file.
4. On every code change, re-run the same seed + action log and diff the EventLog.
5. Any deviation in tick data, fill prices, XP events, or process metric outputs is a
   regression.

```typescript
// Test harness interface
interface GoldenReplayTest {
  scenarioId:    string;
  seed:          number;
  playerActions: PlayerAction[];   // scripted sequence of orders, journal entries, time actions
  expectedEvents: SimEvent[];      // the golden EventLog snapshot
}

// Test runner
function runGoldenReplayTest(test: GoldenReplayTest): TestResult {
  const engine = new SimEngine(test.seed);
  engine.loadScenario(test.scenarioId);
  for (const action of test.playerActions) {
    engine.applyAction(action);
    engine.advanceTicks(action.ticksAfter ?? 1);
  }
  return diffEventLogs(engine.getEventLog(), test.expectedEvents);
}
```

**Required golden tests for Phase 2:**

| Test name | What it covers |
|-----------|---------------|
| `SCN-001-clean-run` | Full depeg scenario, all process metrics satisfied, expected XP output |
| `SCN-001-reckless-winner` | Depeg scenario, oversized position profits, reckless_winner_flag emitted |
| `SCN-002-clean-run` | Earnings gap scenario, all process metrics satisfied |
| `SCN-003-clean-run` | Forex sweep scenario, all process metrics satisfied |
| `SCN-003-stop-widen-flag` | Stop manually cancelled post-fill; `no_stop_widen` metric fails |
| `forex-leverage-display` | Forex position: leverage_ack event required before fill |
| `depeg-spread-slippage` | Verify slippage model produces deterministic output under high-sigma conditions |
| `replay-seed-stability` | Same seed produces identical EventLog on N consecutive runs |

**CI integration:** Golden replay tests run on every PR. A diff in any golden file
requires an explicit acknowledgment in the PR (not a silent pass) — the author must
confirm whether the diff is an intentional change or a regression.

---

## 8. Phase 2 Vertical-Slice Cutline

### Ships in Phase 2

| Component | Scope |
|-----------|-------|
| Sim engine core | Deterministic seeded engine, tick pipeline, time compression |
| Crypto synthetic adapter | Full generator including depeg hook |
| Stocks synthetic adapter | Full generator including earnings gap hook |
| Forex synthetic adapter | Full generator including session-open sweep hook |
| Order model | Market, limit, stop orders; slippage; fees; crypto spot + stocks cash + forex leveraged accounts |
| Event injection | Full beat-schedule system for the three V0 scenarios |
| SCN-001, SCN-002, SCN-003 | All three scenarios authored, playable, with debrief screens |
| Scoring engine | All process metrics from §4.2; XP event emission |
| Reckless-winner flag | Debrief coaching alert |
| Replay format | EventLog schema; client-side storage (not server-side in Phase 2) |
| Age screen | Mandatory at account creation; blocks under-13 |
| Mandatory forex leverage display | Blocks forex order entry without acknowledgment |
| Slippage + spread display | Required on every order confirmation |
| Fill confirmation overlay | Per §3.2 behavior spec (3s auto-dismiss, non-blocking, stacking) |
| Position Panel compliance indicator | Per §4.2 process-metric UI surface (ScoreTracker-sourced) |
| Golden replay regression tests | All eight tests from §7.4 |
| "Sim is not the market" friction | On scenario start, scenario end, and debrief screen |

### Deferred from Phase 2

| Component | Deferral rationale |
|-----------|-------------------|
| Server-side account persistence | Requires Tier B governance gate (COPPA analysis, privacy policy, erasure path) — deferred until gate cleared |
| Journal entry server storage | Requires encryption-at-rest infrastructure — client-side only in Phase 2 |
| Shareable replay link (public URL) | Requires account persistence; deferred |
| Coach annotation overlay | Requires coach role accounts; deferred to post-v1 per GDD §10 |
| LiveDataAdapter | Requires RISK_REGISTER §23 license review; stub only |
| Stop-limit order type | Deferred — adds edge-case fill logic; not required for three V0 scenarios |
| PDT rule modeling (stocks) | COSTLY to model correctly; deferred |
| Leverage variants (crypto, stocks) | Deferred per GDD §10 |
| Mobile-responsive layout | Deferred per GDD §10 |
| XP progression / rank unlock | Deferred — scoring engine emits XP events; rank system (§4.5 RankService + Main Menu display) wired in Phase 3 |
| Reference (non-tradeable) instruments | Deferred — §2.5; advanced tier only (ACN-004); requires replayVersion 2 |
| Multi-position aggregate exposure display | Deferred — §3.4; advanced tier only (ACN-001, ACN-006) |
| Paper Trading Sandbox (open-ended) | Deferred — vertical slice is scenario-only |
| Strategy Sandbox (grid, DCA, carry) | Deferred — Phase 3+ per GDD §5.3 |
| Risk Management Drills (full set) | Partial — position sizing and stop placement drills needed as prerequisites for Phase 2 scenarios; rest deferred |

### Phase 2 Compliance Gate (hard stop before any user testing)

- [ ] COPPA analysis complete (legal/compliance — not an engineering item)
- [ ] Privacy policy drafted and linked in-app
- [ ] Age screen implemented and tested
- [ ] Erasure path (`eraseAccount`) implemented and tested
- [ ] Governance Tier B review complete (per GOVERNANCE.md)

No user accounts may be created on a server-side store until all five items are checked.
For pre-gate testing with real users: client-side-only mode (no server-side persistence).
