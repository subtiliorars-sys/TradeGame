# TradeGame — Phase 2 Engineering Test Plan

**Version:** 0.1
**Scope:** Sim engine, scoring engine, order model, compliance mechanisms.
**Runner:** Vitest (TypeScript-native, works in both Node and browser; consistent with
the Vite build-tooling recommendation in SIM_ENGINE_SPEC §7.1).
**Golden files:** `tests/golden/` — committed JSON fixtures, diffed on every PR.

---

## 1. Golden-Replay Regression Suite

### 1.1 Scenario Test Cases

Each test: fixed seed + scripted `PlayerAction[]` → deterministic `EventLog`.
Pass criterion: SHA-256 digest of the JSON-serialized `EventLog` matches the stored
golden digest. Any deviation requires an explicit PR acknowledgment — not a silent pass.

| Test ID | Scenario | Seed | Player path summary | Expected digest (placeholder) | What is locked |
|---------|----------|------|---------------------|-------------------------------|----------------|
| `GR-001` | SCN-001 clean run | `0xA1B2C3D4` | Pre-trade journal → short at T+6 (1% risk, stop above 1.00) → stop honored → debrief | `<hash-001-clean>` | All tick events, fill prices, XP events, process-metric outcomes |
| `GR-002` | SCN-001 reckless-winner | `0xA1B2C3D4` | No journal → oversized short at T0 → hold through T+26 collapse (profitable) → no stop set | `<hash-001-reckless>` | `reckless_winner_flag` present; `stop_before_entry=false`; `size_compliance=false` |
| `GR-003` | SCN-001 patience run | `0xA1B2C3D4` | Journal at T0 (observation only) → no orders → debrief | `<hash-001-patience>` | No `order_submit` events; `patience_observation` XP emitted |
| `GR-004` | SCN-002 clean run | `0xB2C3D4E5` | Pre-open journal plan → skip no-trade zone → buy above $50.10 at 09:37 (1% risk) → stop honored → exit journal → debrief | `<hash-002-clean>` | Earnings-gap tick sequence; session-open spread spike; slippage on fill |
| `GR-005` | SCN-002 open-chase error | `0xB2C3D4E5` | Market buy at 09:30 open into spread spike → no pre-trade journal | `<hash-002-open-chase>` | Wide-spread fill slippage; `journal_before_trade=false`; no stop → `reckless_winner_flag` if profitable |
| `GR-006` | SCN-003 clean run | `0xC3D4E5F6` | Hypothesis journaled at 07:55 → no entry during spread spike → buy confirmation at 08:07 → stop below 1.2775 → stop honored → exit-reason journal → debrief | `<hash-003-clean>` | Sweep tick sequence including price_override to 1.2783; leverage_ack event present |
| `GR-007` | SCN-003 stop-widen flag | `0xC3D4E5F6` | Buy at 08:07 → `order_modify` widens stop at 08:15 pullback | `<hash-003-stopwiden>` | `no_stop_widen=false`; coaching note emitted at 08:15 |
| `GR-008` | Forex leverage display | `0xC3D4E5F6` | Attempt to submit forex order before acknowledging leverage risk | `<hash-forex-ack>` | Order blocked; `leverage_risk_acknowledged` event appears before first fill |
| `GR-009` | Depeg spread/slippage model | `0xA1B2C3D4` | Market buy during T+8–T+15 cascade (high sigma) | `<hash-depeg-slippage>` | Fill price = `close + spread + slippage`; slippage > base (sigma_post_depeg elevated) |
| `GR-010` | Replay seed stability (N=5) | `0xDEADBEEF` | Empty (no player actions) — engine runs to tick 100 | `<hash-seed-stability>` | All 5 runs produce identical digest |

> Placeholder digests must be replaced with real SHA-256 values when first computed.
> Workflow: compute golden → commit → all subsequent runs must match.

---

### 1.2 Determinism Tests

| Test ID | What | Method | Pass criterion |
|---------|------|--------|----------------|
| `DT-001` | Same seed, two sequential engine runs produce identical EventLog | Run engine twice with seed `0xDEADBEEF`, 1000 ticks, no player actions | `diffEventLogs(run1, run2)` returns empty diff |
| `DT-002` | No `Math.random()` in sim path | Static analysis / import graph walk at test time | Zero calls to `Math.random` within `src/engine/**` |
| `DT-003` | No `Date.now()` in sim path | Same static scan | Zero calls to `Date.now()` within `src/engine/**` |
| `DT-004` | PRNG platform parity (Node vs browser) | Run xoshiro128** with seed `0x12345678`, advance 10000 steps, compare output arrays | Identical arrays in both environments (run via Vitest `browser` mode + Node mode against same fixture) |
| `DT-005` | PRNG state fully captured by seed | Serialize PRNG state after 500 steps; restore; advance 10 more steps → match a clean run at step 510 | Outputs identical |

---

### 1.3 Time-Compression Invariance

| Test ID | What | Method | Pass criterion |
|---------|------|--------|----------------|
| `TC-001` | 1x vs 16x produce identical EventLog content | Run SCN-001 clean path at 1x and 16x with same seed and same scripted actions (wall-time delivery abstracted) | EventLog content byte-for-byte identical; only tick-delivery timestamps differ in wall time, not in `tickIndex` or sim `timestamp` |
| `TC-002` | Pause-and-resume does not perturb tick sequence | Pause engine at tick 50, resume at tick 51; compare against unpaused run | EventLog from tick 51 onward identical |
| `TC-003` | Compression change blocked during order confirmation | Submit order; attempt to change compression from 1x to 16x before fill; compression change rejected | No mode transition in EventLog; order fills correctly |

---

## 2. Scoring Engine Tests

### 2.1 Process-Metric Extraction Cases

All tests drive a scripted EventLog through the ScoreTracker and assert metric output.
No fill prices, PnL fields, or account balance values are consulted in any assertion.

| Test ID | Metric | Input scenario | Expected output |
|---------|--------|----------------|-----------------|
| `SM-001` | `stop_honored` | EventLog: `order_submit` (stop) → `order_fill` (entry) → session ends. No `order_cancel` for the stop. | `stop_honored = true` |
| `SM-002` | `stop_honored` false | EventLog: stop submitted → entry filled → `order_cancel` for stop → session ends | `stop_honored = false` |
| `SM-003` | `no_stop_widen` false | EventLog: stop at distance D → `order_modify` increasing stop distance → session ends | `no_stop_widen = false`; coaching note event emitted |
| `SM-004` | `no_stop_widen` — tighten is allowed | EventLog: stop at D → `order_modify` decreasing stop distance | `no_stop_widen = true` |
| `SM-005` | `journal_before_trade` | EventLog: `journal_entry` (tickIndex 5) → `order_submit` (tickIndex 10) | `journal_before_trade = true` |
| `SM-006` | `journal_before_trade` false | EventLog: `order_submit` (tickIndex 10) → `journal_entry` (tickIndex 12) | `journal_before_trade = false`; no trade-linked XP awarded |
| `SM-007` | `stop_before_entry` | EventLog: `order_submit` (stop, tickIndex 9) → `order_fill` (entry, tickIndex 10) | `stop_before_entry = true` |
| `SM-008` | `stop_before_entry` false | EventLog: `order_fill` (entry, tickIndex 10) → `order_submit` (stop, tickIndex 11) | `stop_before_entry = false` |
| `SM-009` | `plan_declared_late` (SCN-002) | Journal `plan` tag at 09:31 (after session open at 09:30) | `plan_declared_late = true`; `no_trade_zone` XP not awarded |
| `SM-010` | `plan_declared_late` false | Journal `plan` tag at 09:00 (pre-open) | `plan_declared_late = false` |
| `SM-011` | `exit_journal` | EventLog contains `journal_entry` with tag `exit` | `exit_journal = true` |
| `SM-012` | `journal_skipped` (exit) | Session ends, no `journal_entry` with tag `exit` | `exit_journal = false`; debrief XP for exit journal not emitted |
| `SM-013` | `patience_observation` | `journal_entry` count ≥ 1; `order_fill` count = 0 | `patience_observation = true`; +40 XP emitted |
| `SM-014` | `leverage_ack` blocks fill | Forex session: `order_submit` before `leverage_risk_acknowledged` event | Order blocked; no `order_fill` event |
| `SM-015` | `leverage_ack` allows fill | Forex session: `leverage_risk_acknowledged` → `order_submit` → fill | `leverage_ack = true`; fill proceeds |
| `SM-016` | `size_compliance` | Position value = 0.99% of account equity; declared risk = 1% | `size_compliance = true` (within 10% tolerance) |
| `SM-017` | `size_compliance` false | Position value = 3% of account equity; declared risk = 1% | `size_compliance = false` |

---

### 2.2 Anti-Test: Scoring Engine Must Not Read PnL

**Test `SM-ANTI-001`** — lint/grep CI rule:

```
# ci/check-scoring-pnl.sh  (runs as a CI step, blocks merge on nonzero exit)
grep -rn --include="*.ts" \
  -E "(realizedPnL|unrealizedPnL|pnlScore|winRate|returnOnAccount)" \
  src/engine/scoring/
```

Expected: zero matches. Any match = CI failure. The rule text must reference
SIM_ENGINE_SPEC §4.1 and RISK_REGISTER §16 in the CI output.

This is a grep-level test, not a runtime test. It runs before the TypeScript compilation
step. It also covers these prohibited field names in any scoring output `interface`:
`pnlScore`, `winRate`, `returnPct`, `profitUsd`, `profitPips`.

---

### 2.3 Reckless-Winner Flag Cases

| Test ID | Conditions | Expected | Notes |
|---------|-----------|----------|-------|
| `RW-001` | `size_compliance = false` AND session has ≥1 `order_fill` where implied PnL is positive (fill price recorded; comparison not exposed to scorer — scorer checks: did the player have a profitable session via a session-outcome-summary provided by engine, not PnL field) | `reckless_winner_flag` emitted; `metricsFailed` includes `size_compliance` | Flag is informational only; no XP subtracted |
| `RW-002` | `stop_before_entry = false` AND session has ≥1 winning trade | `reckless_winner_flag` emitted; `metricsFailed` includes `stop_before_entry` | |
| `RW-003` | Both violations; session profitable | Single `reckless_winner_flag` event; `metricsFailed = ['size_compliance', 'stop_before_entry']` | Not two flags |
| `RW-004` | `size_compliance = false`; session has no winning trades | No `reckless_winner_flag` emitted | Flag only fires when a rule violation co-occurs with a winning outcome |
| `RW-005` | All process metrics pass; session profitable | No `reckless_winner_flag` | Clean winner — no flag |

> Implementation note: the scorer receives a boolean `sessionHasWin` from the engine
> (not a PnL value). The engine determines `sessionHasWin` by comparing fill prices to
> close prices — that logic lives in the engine, not the scorer.

---

## 3. Order Model Tests

### 3.1 Fill Logic Against Scripted Tick Sequences

For each test, a scripted `TickData[]` array replaces the generator. The OrderBook
processes ticks and must produce the fill events below.

| Test ID | Order type | Scripted ticks | Expected fill behavior |
|---------|-----------|----------------|------------------------|
| `OM-001` | Market buy | Any single tick | Fills at `close + spread + slippage`; `order_fill` event emitted same tick |
| `OM-002` | Market sell | Any single tick | Fills at `close - spread - slippage` |
| `OM-003` | Limit buy | Limit price 100; ticks: 102, 101, 100, 99 | Fills at tick where `close ≤ 100`; fill price = limit price (100) |
| `OM-004` | Limit buy — never reached | Limit price 95; ticks: 102, 101, 100 (session ends) | No `order_fill`; `order_cancel` (session-end reason) emitted |
| `OM-005` | Stop sell (long exit) | Stop 98; ticks: 100, 99, 98 | Fill on tick where `close ≤ 98`; slippage applied |
| `OM-006` | Stop sell — gap through | Stop 98; ticks: 100, 95 (gap) | Fill at 95 + slippage (not 98); `fillPrice` < `stopPrice`; `order_fill.fillPrice` shows gap fill |
| `OM-007` | Stop-limit sell — filled | Stop 98, limit 97; ticks: 100, 98, 97.5 | Stop triggers limit at 97; fill at 97.5 (within limit) |
| `OM-008` | Stop-limit sell — missed (gap) | Stop 98, limit 97; ticks: 100, 96 (gap) | No fill — price gapped through limit; `order_fill` absent; debrief flag available |
| `OM-009` | Crypto maker fee | Limit buy filled | `feeCost = quantity * fillPrice * 0.001` |
| `OM-010` | Crypto taker fee | Market buy | `feeCost = quantity * fillPrice * 0.0015` |
| `OM-011` | Forex spread-only cost | Market buy, ANDU | `feeCost = 0`; `spreadCost` = pips × pip_value |
| `OM-012` | Order rejected — insufficient balance | Market buy, quantity exceeds account equity | No `order_fill`; `order_reject` event; message = "Insufficient account balance" |

---

### 3.2 Slippage and Fee Display Assertions

| Test ID | What | Assertion |
|---------|------|-----------|
| `SL-001` | Slippage shown in order confirmation | Every `order_fill` event: `slippage` field > 0 for market/stop orders; `spreadCost` field > 0 |
| `SL-002` | High-volatility slippage > base slippage | Fill during depeg sigma spike: `slippage > base_slippage * 1.0` (volatility_multiplier > 1) |
| `SL-003` | Slippage field in shareable replay | After replay-export sanitization pass, `order_fill.slippage` and `order_fill.spreadCost` present; no account balance in exported object |
| `SL-004` | Fee display — maker vs taker | Limit fill: fee uses 0.001 rate; market fill: fee uses 0.0015 rate |

---

### 3.3 Forex Margin and Mandatory Risk-Display Blocking

| Test ID | What | Assertion |
|---------|------|-----------|
| `FX-001` | Mandatory leverage display blocks order entry | Submit forex `order_submit` before `leverage_risk_acknowledged` event | Engine returns `order_reject`; reason = `leverage_ack_required` |
| `FX-002` | Post-ack order proceeds | `leverage_risk_acknowledged` → `order_submit` | `order_fill` emitted normally |
| `FX-003` | Margin required calculation | 1 standard lot ANDU at price 1.2812, leverage 30:1 | `margin_required = (100000 * 1.2812) / 30 = $4270.67` ± 0.01 |
| `FX-004` | Margin call warning at 50% | Margin level (equity ÷ used margin) falls to 50% | `margin_call_warning` event emitted in EventLog |
| `FX-005` | Stop-out at 20% | Margin level (equity ÷ used margin) falls to 20% | All positions auto-closed; `stop_out` event emitted; scenario ends with coaching flag. NOTE: 20% is SIM_ENGINE_SPEC §3.4's TUNABLE; OWNER_RUNBOOK P-7 (stop-out convention) may revise — update this row when P-7 is decided |
| `FX-006` | Leverage ack logged in EventLog | Player clicks "I understand" | `leverage_risk_acknowledged` event present with `tickIndex` and `timestamp` |
| `FX-007` | `leverage_ack` process metric fires | `leverage_risk_acknowledged` present before first fill | `leverage_ack` XP event emitted by ScoreTracker |

---

### 3.4 Weekend Gap and Session-Halt Edge Cases

| Test ID | Adapter | What | Assertion |
|---------|---------|------|-----------|
| `SH-001` | Forex | Weekend gap applied at Sunday open tick | First tick after Friday 22:00 UTC carries a non-zero price offset drawn from `N(0, sigma_weekend)`; deterministic given seed |
| `SH-002` | Forex | Order entry during between-session quiet | `SessionState.isOpen = false`; `order_submit` returns `order_reject`; reason = `session_closed` |
| `SH-003` | Forex | Spread during London+NY overlap < single-session spread | Tick during 13:00–17:00 UTC: `spread ≤ 0.8 pips`; tick during single-session: `spread ≥ 1.2 pips` |
| `SH-004` | Stocks | After-hours order rejected | `simTime` outside 04:00–20:00 ET: `order_reject` with reason `session_closed` |
| `SH-005` | Stocks | Session-open spread spike | First 90 ticks of 09:30 session: `spread > base_spread`; normalizes by tick 91 |
| `SH-006` | Stocks | Circuit-breaker halt via EventInjector | `trading_halt` event fires; `SessionState.isOpen = false`; subsequent `order_submit` rejected; `haltReason = "circuit breaker"` |
| `SH-007` | Stocks | Order entry re-enabled after halt duration | After `duration_ticks` advance: `SessionState.isOpen = true`; order entry allowed |
| `SH-008` | Crypto | No session boundary (24/7) | `SessionState.isOpen` always `true` unless `trading_halt` event active; no weekend gap |
| `SH-009` | Stocks | Pre-market spread 3x base | Tick during 04:00–09:29 ET: `spread ≥ 3 * base_spread` |

---

## 4. Compliance Mechanism Tests

### 4.1 Prohibited-Phrase Guard on News-Ticker Events

The phrase validator runs at scenario-load time. Tests drive the validator directly
(not the full engine) for speed.

**Prohibited phrases (must FAIL validation):**

| Test ID | Input text | Expected result |
|---------|-----------|-----------------|
| `CP-001` | `"buy HarborUSD before it recovers"` | FAIL — contains "buy" as directive |
| `CP-002` | `"sell pressure is increasing"` | FAIL — contains "sell" |
| `CP-003` | `"price target of 1.05 expected"` | FAIL — contains "target" and "expect" |
| `CP-004` | `"price will recover to 1.00"` | FAIL — contains "price will" |
| `CP-005` | `"analysts expect a rebound"` | FAIL — contains "expect" |
| `CP-006` | `"short the HarborUSD pair now"` | FAIL — "short" + directional intent |
| `CP-007` | `"go long on ANDU after the sweep"` | FAIL — "go long" |

**Educational uses that must PASS (true negatives):**

| Test ID | Input text | Expected result | Reason |
|---------|-----------|-----------------|--------|
| `CP-101` | `"A buy order is a market order to purchase at the current price."` | PASS | "buy" as order-type noun, not directive |
| `CP-102` | `"A sell order closes a long position."` | PASS | "sell" as order-type noun |
| `CP-103` | `"HarborUSD protocol defense mechanism under stress — status unclear."` | PASS | Factual; no price or direction |
| `CP-104` | `"HarborUSD protocol posts notice of reserve depletion."` | PASS | Factual announcement |
| `CP-105` | `"NGSM beat revenue by 4% but missed forward guidance."` | PASS | Factual; no price prediction |
| `CP-106` | `"Spread is elevated at London open — check your order cost."` | PASS | Operational / factual |
| `CP-107` | `"Volume increased 3x in the last minute."` | PASS | Observable fact, no directive |
| `CP-108` | `"A stop-limit order may not fill if price gaps through the limit price."` | PASS | Educational definition |

Implementation note: the validator should use whole-word matching and context-window
checks (e.g. "buy" followed by a noun phrase vs. "buy" followed by "order" or
"order type"). The fixture list above is the minimum; it must be extended as new
scenario text is authored.

---

### 4.2 Age Screen — Blocking Under-13

| Test ID | Input | Expected |
|---------|-------|----------|
| `AG-001` | Player selects "I am under 13" | Account creation blocked; message shown: "TradeGame requires users to be at least 13 years old." No account record created in any store |
| `AG-002` | Player selects "I am 13–17" | Account created; `ageAffirmation = '13-17'` stored with timestamp; coaching features locked |
| `AG-003` | Player selects "I am 18 or older" | Account created; `ageAffirmation = '18+'`; all features available |
| `AG-004` | Age screen cannot be bypassed | Direct API call to account-creation endpoint without `ageAffirmation` field | 400 error; no account created |
| `AG-005` | Age affirmation timestamp stored | `18+` path | `ageAffirmationAt` ISO timestamp present on account record |

---

### 4.3 Journal Text Privacy Split

| Test ID | What | Assertion |
|---------|------|-----------|
| `JP-001` | Journal text absent from EventLog | Create journal entry with text "This looks like a sweep"; retrieve EventLog | EventLog `journal_entry` event has `wordCount = 7` and `tags`; `text` field absent |
| `JP-002` | Journal text absent from shareable replay export | Run replay-export sanitization on a session containing journal entries | Exported replay JSON contains no `text` field on any `journal_entry` event |
| `JP-003` | Journal text stored only in server-side journal store (Phase 3+) | In Phase 2 (client-side only): journal text in localStorage, keyed by `entryId`; not transmitted in any session-sync payload | No `journal_entry.text` appears in any network payload during sim session |
| `JP-004` | `wordCount` is accurate | Journal entry: "I think this is a sweep because volume spiked." (10 words) | `wordCount = 10` |
| `JP-005` | Empty journal entry | Player submits blank journal | Rejected or `wordCount = 0`; `journal_before_trade` metric not awarded for zero-word entries |

---

## 5. Fixture Schema

All golden fixtures live in `tests/golden/`. File format: UTF-8 JSON.

### 5.1 Fixture Schema Definition

```typescript
interface GoldenFixture {
  fixtureVersion: "1";
  testId:         string;              // e.g. "GR-001"
  scenarioId:     string | null;
  seed:           number;
  marketType:     "crypto" | "stocks" | "forex";

  playerActions:  PlayerAction[];      // scripted input sequence
  expectedLogDigest: string;           // SHA-256 hex of JSON.stringify(eventLog)

  expectedXpEvents: ExpectedXpEvent[]; // spot-check subset; not exhaustive
  notes:          string;              // plain-text description of what this tests
}

interface PlayerAction {
  type:       "order_submit" | "order_cancel" | "order_modify"
            | "journal_entry" | "leverage_ack" | "advance_ticks"
            | "set_compression" | "debrief_complete";
  ticksAfter: number;                  // ticks to advance engine before this action
  payload:    Record<string, unknown>; // action-specific fields
}

interface ExpectedXpEvent {
  metricId:  string;
  xpAmount:  number;
}
```

---

### 5.2 Worked Example A — SCN-001 Clean Run (GR-001)

```json
{
  "fixtureVersion": "1",
  "testId": "GR-001",
  "scenarioId": "SCN-001",
  "seed": 2712847316,
  "marketType": "crypto",
  "playerActions": [
    {
      "type": "journal_entry",
      "ticksAfter": 0,
      "payload": {
        "tags": ["pre_trade", "hypothesis"],
        "wordCount": 22
      }
    },
    {
      "type": "order_submit",
      "ticksAfter": 36,
      "payload": {
        "orderType": "stop",
        "side": "sell",
        "quantity": 180,
        "stopPrice": 0.9930,
        "price": null
      }
    },
    {
      "type": "order_submit",
      "ticksAfter": 0,
      "payload": {
        "orderType": "market",
        "side": "sell",
        "quantity": 180,
        "price": null,
        "stopPrice": null
      }
    },
    {
      "type": "advance_ticks",
      "ticksAfter": 0,
      "payload": { "count": 1524 }
    },
    {
      "type": "journal_entry",
      "ticksAfter": 0,
      "payload": {
        "tags": ["exit"],
        "wordCount": 14
      }
    },
    {
      "type": "debrief_complete",
      "ticksAfter": 0,
      "payload": {}
    }
  ],
  "expectedLogDigest": "PLACEHOLDER_SHA256_GR001",
  "expectedXpEvents": [
    { "metricId": "journal_before_trade", "xpAmount": 20 },
    { "metricId": "size_compliance",      "xpAmount": 30 },
    { "metricId": "stop_before_entry",    "xpAmount": 25 },
    { "metricId": "stop_honored",         "xpAmount": 20 },
    { "metricId": "exit_journal",         "xpAmount": 0  },
    { "metricId": "debrief_completed",    "xpAmount": 30 }
  ],
  "notes": "Full clean run SCN-001. All process metrics satisfied. No reckless_winner_flag. Stop submitted before entry fill. Entry at T+6 (tick ~36). Stop honored through scenario end."
}
```

---

### 5.3 Worked Example B — SCN-003 Stop-Widen (GR-007)

```json
{
  "fixtureVersion": "1",
  "testId": "GR-007",
  "scenarioId": "SCN-003",
  "seed": 3275942982,
  "marketType": "forex",
  "playerActions": [
    {
      "type": "leverage_ack",
      "ticksAfter": 0,
      "payload": {}
    },
    {
      "type": "journal_entry",
      "ticksAfter": 0,
      "payload": {
        "tags": ["pre_trade", "hypothesis"],
        "wordCount": 18
      }
    },
    {
      "type": "order_submit",
      "ticksAfter": 84,
      "payload": {
        "orderType": "stop",
        "side": "sell",
        "quantity": 10000,
        "stopPrice": 1.2775,
        "price": null
      }
    },
    {
      "type": "order_submit",
      "ticksAfter": 0,
      "payload": {
        "orderType": "market",
        "side": "buy",
        "quantity": 10000,
        "price": null,
        "stopPrice": null
      }
    },
    {
      "type": "order_modify",
      "ticksAfter": 180,
      "payload": {
        "orderId": "STOP_ORDER_REF",
        "newStopPrice": 1.2760
      }
    },
    {
      "type": "advance_ticks",
      "ticksAfter": 0,
      "payload": { "count": 2160 }
    },
    {
      "type": "debrief_complete",
      "ticksAfter": 0,
      "payload": {}
    }
  ],
  "expectedLogDigest": "PLACEHOLDER_SHA256_GR007",
  "expectedXpEvents": [
    { "metricId": "leverage_ack",      "xpAmount": 0  },
    { "metricId": "stop_before_entry", "xpAmount": 25 },
    { "metricId": "stop_honored",      "xpAmount": 20 },
    { "metricId": "no_stop_widen",     "xpAmount": 0  },
    { "metricId": "debrief_completed", "xpAmount": 30 }
  ],
  "notes": "SCN-003. Stop widened from 1.2775 to 1.2760 at the 08:15 pullback (tick ~180). no_stop_widen = false. Coaching note event emitted. leverage_ack present before fill. no_stop_widen XP = 0 (metric failed)."
}
```

---

## 6. CI Shape

### 6.1 Test Runner

**Vitest** (`vitest run` for CI; `vitest` for watch mode in dev).

```
# package.json scripts
"test":            "vitest run",
"test:watch":      "vitest",
"test:golden":     "vitest run --reporter=verbose tests/golden/",
"test:compliance": "vitest run tests/compliance/",
"lint:scoring-pnl": "bash ci/check-scoring-pnl.sh"
```

TypeScript: strict mode. Golden tests import the engine directly — no mocking of the
PRNG or tick pipeline. Compliance and order-model tests may use the scripted-tick
harness (`MockMarketFeed`).

---

### 6.2 What Blocks Merge

All of the following must pass before a PR is mergeable:

| Gate | Blocks merge | Notes |
|------|-------------|-------|
| All Vitest tests green | Yes | Including golden, scoring, order model, compliance suites |
| `lint:scoring-pnl` grep | Yes | Zero matches for PnL identifiers in `src/engine/scoring/**` |
| Golden file diff | Yes — requires human acknowledgment | Diff in any `tests/golden/*.json` digest triggers PR checklist item; author must confirm intentional or regression |
| TypeScript strict-mode compile | Yes | `tsc --noEmit` must exit 0 |
| Prohibited-phrase validator tests | Yes | All CP-001..CP-108 tests must pass |
| Age-screen tests | Yes | AG-001..AG-005; under-13 block is a hard compliance gate |

### 6.3 CI Pipeline Order

```
1. lint:scoring-pnl       (grep — fast, catches design violations before compile)
2. tsc --noEmit           (type check)
3. vitest run             (all suites)
4. golden-diff check      (compare digest outputs to committed golden files;
                           fail if any digest changed without PR acknowledgment flag)
```

### 6.4 Golden Acknowledgment Protocol

When a golden digest changes intentionally (engine behaviour updated by design):

1. Re-run the golden test suite; capture new digests.
2. Update the affected `tests/golden/*.json` files with new digests.
3. Add the label `golden-update` to the PR.
4. PR description must contain a section `### Golden file changes` listing each changed
   test ID and a one-sentence reason.
5. Reviewer must confirm the diff is intentional before approving.

Unacknowledged golden diffs (digest changed, no label, no description section) = merge
blocked.

---

## 7. Out-of-Scope for Phase 2 Tests

The following are **not** tested in Phase 2 and must not be added until the corresponding
features ship:

- Server-side account persistence (deferred — Tier B governance gate)
- Shareable replay link generation (requires server-side persistence)
- Coach annotation content filter (deferred)
- Stop-limit order type fill logic (deferred per spec §8)
- LiveDataAdapter (stubbed; throws on call — `DT-STUB-001`: assert throw is present)
- XP progression / rank unlock (Phase 3)
- PDT rule (stocks, deferred)
- Leverage variants for crypto / stocks (deferred)
