/**
 * SCN-003: London Open Sweep on ANDU — Scenario Definition.
 *
 * Expresses the full SCENARIOS_V0 beat schedule as a ScenarioDef.
 * All prices, instruments, and names are from FICTIONAL_CANON.md.
 * No real assets, pairs, or dates are referenced.
 *
 * Timeline reference (all sim-times ms from scenario start, 5-second ticks):
 *   Tick resolution: 5,000 ms/tick (5-second ticks, 5-second sub-chart visible).
 *   Sim start = 07:45 London (UTC) → simTimeMs 0.
 *
 *   07:45 – 07:59  : simTimeMs 0           – Asian session close/context
 *   08:00           : simTimeMs 900,000     – London open, Decision Point A
 *   08:01 – 08:04  : simTimeMs 960,000     – Sweep leg, Decision Point B
 *   08:05 – 08:07  : simTimeMs 1,200,000   – Rejection and reversal, Decision Point C
 *   08:08 – 08:25  : simTimeMs 1,380,000   – Trend leg 1
 *   08:15           : simTimeMs 1,800,000   – First pullback, Decision Point D
 *   08:25 – 08:40  : simTimeMs 2,400,000   – Consolidation
 *   08:40 – 09:00  : simTimeMs 3,300,000   – Trend leg 2
 *   08:50           : simTimeMs 3,900,000   – Trend high, Decision Point E
 *   09:00 – 09:45  : simTimeMs 4,500,000   – Drift and scenario close
 *   Scenario end    : simTimeMs 7,200,000   (120 min × 60 s × 1000 ms)
 *
 * Key price levels (synthetic, in ANDU units):
 *   Asian-session range high: 1.2845
 *   Asian-session range low (sweep target): 1.2790
 *   Sweep nadir: 1.2783
 *   Post-sweep reversal entry zone: 1.2812 (confirmation candle body above 1.2800)
 *   Stop placement below sweep low: 1.2775 (37 pips below 1.2812)
 *   Post-sweep trend high: 1.2870
 *   Session drift close: 1.2862
 *
 * Debrief arithmetic check (SCENARIOS_V0 §SCN-003):
 *   Entry at 1.2812, stop at 1.2775 → risk = 37 pips per unit.
 *   At 1% account risk on $10,000 = $100 risk.
 *   Position size = $100 / (37 × 0.0001) = $100 / $0.0037 = 27,027 units per std lot.
 *   Actual scenario uses a scaled mini-lot-equivalent quantity — the arithmetic
 *   is correct to the debrief callout: 37 pips risk at confirmation entry. ✓
 *
 * Beat kinds used:
 *   price_override  — pins the displayed price for authored price levels
 *   spread_override — overrides spread at specified narrative moments
 *   regime_override — forces the GBM regime to shape each phase
 *
 * FOREX-SPECIFIC NOTE:
 *   The forex adapter's session-window spread model anchors to simTimeMs=0 as
 *   UTC midnight.  This scenario starts at 07:45 UTC, so the adapter's baseline
 *   spread computes from that offset; all scenario-narrative spreads are expressed
 *   as explicit spread_override beats so the authored values always take precedence
 *   over the stochastic session model for the full scenario window.
 */

import type { ScenarioDef } from "./types.js";

// ---------------------------------------------------------------------------
// Sim-time constants (ms from scenario start = 07:45 UTC)
// ---------------------------------------------------------------------------

const MS_PER_TICK = 5_000; // 5-second ticks

// Derived from: (clock_minutes_from_0745) × 60 × 1000
const T_CONTEXT     = 0;           // 07:45 — Asian session context start
const T_LONDON      = 900_000;     // 08:00 — London open, DP-A
const T_SWEEP       = 960_000;     // 08:01 — Sweep leg begins, DP-B
const T_SWEEP_LOW   = 1_200_000;   // 08:05 — Sweep nadir and first reversal candle
const T_REVERSAL    = 1_320_000;   // 08:07 — Confirmed rejection, DP-C
const T_TREND1      = 1_380_000;   // 08:08 — Trend leg 1 start
const T_PULLBACK1   = 1_800_000;   // 08:15 — First pullback, DP-D
const T_CONSOL      = 2_400_000;   // 08:25 — Consolidation starts
const T_TREND2      = 3_300_000;   // 08:40 — Trend leg 2 start
const T_TREND_HIGH  = 3_900_000;   // 08:50 — Trend leg 2 high, DP-E
const T_DRIFT       = 4_500_000;   // 09:00 — Slow drift
const T_END         = 7_200_000;   // 09:45 — Scenario end (120 min)

// Ticks per phase (at 5000 ms/tick)
const TICKS_1MIN  = 12;
const TICKS_2MIN  = 24;
const TICKS_4MIN  = 48;
const TICKS_5MIN  = 60;
const TICKS_7MIN  = 84;
const TICKS_10MIN = 120;
const TICKS_15MIN = 180;
const TICKS_40MIN = 480;
const TICKS_45MIN = 540;

// ---------------------------------------------------------------------------
// SCN-003 ScenarioDef
// ---------------------------------------------------------------------------

export const scn003: ScenarioDef = {
  manifest: {
    id: "SCN-003",
    title: "London Open Sweep on ANDU",
    market: "forex",
    instrument: {
      symbol: "ANDU",
      displayName: "ANDU",
    },
    durationMs: T_END,
    msPerTick: MS_PER_TICK,
    startPrice: 1.2815,
    prereqs: [
      "drill:position-sizing-forex",
      "drill:stop-placement-v1",
      "lesson:forex-session-windows",
      "lesson:liquidity-sweep",
    ],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [
      {
        id: "DP-A",
        label: "Decision Point A — London Open",
        simTimeMs: T_LONDON,
      },
      {
        id: "DP-B",
        label: "Decision Point B — Sweep Below Asian Low",
        simTimeMs: T_SWEEP,
      },
      {
        id: "DP-C",
        label: "Decision Point C — Rejection Candle Visible",
        simTimeMs: T_REVERSAL,
      },
      {
        id: "DP-D",
        label: "Decision Point D — First Pullback",
        simTimeMs: T_PULLBACK1,
      },
      {
        id: "DP-E",
        label: "Decision Point E — Trend Leg 2 High",
        simTimeMs: T_TREND_HIGH,
      },
    ],
    xpRubric: [
      {
        metricId: "leverage_ack",
        xpOnPass: 10,
        label: "Leverage risk acknowledged before first order",
      },
      {
        metricId: "journal_before_trade",
        xpOnPass: 20,
        label: "Hypothesis journaled before first trade",
      },
      {
        metricId: "plan_declared",
        xpOnPass: 20,
        label: "Plan/hypothesis declared at or before session start",
      },
      {
        metricId: "size_compliance",
        xpOnPass: 30,
        label: "Position size within 10% of account-risk rule",
      },
      {
        metricId: "stop_before_entry",
        xpOnPass: 25,
        label: "Stop placed before entry (logged before fill)",
      },
      {
        metricId: "stop_honored",
        xpOnPass: 20,
        label: "Stop honored (not widened or cancelled)",
      },
      {
        metricId: "exit_journal",
        xpOnPass: 15,
        label: "Exit reason journaled",
      },
      {
        metricId: "no_stop_widen",
        xpOnPass: 15,
        label: "Stop not widened after entry",
      },
      {
        metricId: "debrief_completed",
        xpOnPass: 30,
        label: "Scenario debrief completed",
      },
      {
        metricId: "session_reviewed",
        xpOnPass: 10,
        label: "Re-review session later (replay)",
      },
    ],
    recklessWinnerCoachingText:
      "You won this trade. Your process had gaps — no stop placed before entry, " +
      "or position size violated the account-risk rule. A winning result does not " +
      "validate an incomplete process. Review stop placement and sizing before the " +
      "next forex session.",
    debriefContentIds: [
      "scn003:what-happened",
      "scn003:sweep-vs-breakout",
      "scn003:good-process",
      "scn003:good-process-can-lose",
      "scn003:common-errors",
    ],
  },

  // -------------------------------------------------------------------------
  // Beat schedule — ordered by simTimeMs (ascending).
  //
  // Price levels from SCENARIOS_V0 §SCN-003:
  //   Asian range: 1.2810 – 1.2830
  //   Sweep low:   1.2783  (breaks Asian low 1.2790)
  //   Reversal:    1.2812  (confirmation zone, entry reference)
  //   Trend high:  1.2870
  //   Drift close: 1.2862
  // -------------------------------------------------------------------------
  script: [
    // --- 07:45 – 07:59: Asian session context — quiet range, wide spread ---

    {
      kind: "price_override",
      simTimeMs: T_CONTEXT,
      durationTicks: TICKS_15MIN,   // 15 min = ticks 0–179
      price: 1.2820,
    },
    // Between-sessions spread (2.1 pips = 0.00021) during Asian close.
    {
      kind: "spread_override",
      simTimeMs: T_CONTEXT,
      durationTicks: TICKS_15MIN,
      spread: 0.00021,
    },
    {
      kind: "regime_override",
      simTimeMs: T_CONTEXT,
      durationTicks: TICKS_15MIN,
      regime: "quiet",
    },

    // --- 08:00: London open — spread spike to 3.8 pips, Decision Point A ---

    {
      kind: "price_override",
      simTimeMs: T_LONDON,
      durationTicks: TICKS_1MIN,    // 1 min of chaotic open tick
      price: 1.2818,
    },
    // Spread spikes to 3.8 pips (0.00038) at London open.
    {
      kind: "spread_override",
      simTimeMs: T_LONDON,
      durationTicks: TICKS_1MIN,
      spread: 0.00038,
    },
    {
      kind: "regime_override",
      simTimeMs: T_LONDON,
      durationTicks: TICKS_2MIN,
      regime: "trending_down",
    },

    // --- 08:01 – 08:04: Sweep leg — breaks Asian low 1.2790, Decision Point B ---
    // Fast move: 1.2818 → 1.2783 in ~4 minutes.

    {
      kind: "price_override",
      simTimeMs: T_SWEEP,
      durationTicks: TICKS_4MIN,    // 4 min sweep leg
      price: 1.2783,
    },
    // Spread 2.5 pips during sweep.
    {
      kind: "spread_override",
      simTimeMs: T_SWEEP,
      durationTicks: TICKS_4MIN,
      spread: 0.00025,
    },

    // --- 08:05 – 08:06: Sweep nadir holds, reversal candle begins ---

    {
      kind: "price_override",
      simTimeMs: T_SWEEP_LOW,
      durationTicks: TICKS_2MIN,    // 2 min at the low
      price: 1.2795,                // recovery begins, wick established
    },
    {
      kind: "spread_override",
      simTimeMs: T_SWEEP_LOW,
      durationTicks: TICKS_2MIN,
      spread: 0.00015,
    },
    {
      kind: "regime_override",
      simTimeMs: T_SWEEP_LOW,
      durationTicks: TICKS_2MIN,
      regime: "trending_up",
    },

    // --- 08:07: Confirmed rejection — price at 1.2812, spread 1.5 pips, Decision Point C ---
    // This is the authored "good process" entry zone. The debrief callout:
    //   entry at 1.2812, stop at 1.2775 → 37 pips risk per unit. ✓

    {
      kind: "price_override",
      simTimeMs: T_REVERSAL,
      durationTicks: TICKS_1MIN,
      price: 1.2812,
    },
    {
      kind: "spread_override",
      simTimeMs: T_REVERSAL,
      durationTicks: TICKS_1MIN,
      spread: 0.00015,
    },

    // --- 08:08 – 08:24: Trend leg 1 — 1.2812 → 1.2851 ---

    {
      kind: "price_override",
      simTimeMs: T_TREND1,
      durationTicks: TICKS_10MIN,   // first 10 min of trend, price climbs
      price: 1.2840,
    },
    {
      kind: "spread_override",
      simTimeMs: T_TREND1,
      durationTicks: TICKS_15MIN,
      spread: 0.00009,
    },
    {
      kind: "regime_override",
      simTimeMs: T_TREND1,
      durationTicks: TICKS_15MIN,
      regime: "trending_up",
    },

    // --- 08:15: First pullback to 1.2835 — Decision Point D (manage open position) ---

    {
      kind: "price_override",
      simTimeMs: T_PULLBACK1,
      durationTicks: TICKS_2MIN,
      price: 1.2835,
    },
    // Regime remains trending_up (pullback is a pause, not a reversal).

    // --- 08:25: Trend leg 1 peak and consolidation begins — 1.2851 ---

    {
      kind: "price_override",
      simTimeMs: T_CONSOL,
      durationTicks: TICKS_1MIN,
      price: 1.2851,
    },
    {
      kind: "spread_override",
      simTimeMs: T_CONSOL,
      durationTicks: TICKS_15MIN,
      spread: 0.00008,
    },
    {
      kind: "regime_override",
      simTimeMs: T_CONSOL,
      durationTicks: TICKS_15MIN,
      regime: "quiet",
    },

    // Shallow consolidation pullback to 1.2840.
    {
      kind: "price_override",
      simTimeMs: T_CONSOL + 5 * 60_000,   // 08:30 — midway through consolidation
      durationTicks: TICKS_5MIN,
      price: 1.2840,
    },

    // --- 08:40: Trend leg 2 — 1.2842 → 1.2870 ---

    {
      kind: "price_override",
      simTimeMs: T_TREND2,
      durationTicks: TICKS_1MIN,
      price: 1.2842,
    },
    {
      kind: "spread_override",
      simTimeMs: T_TREND2,
      durationTicks: TICKS_10MIN,
      spread: 0.00008,
    },
    {
      kind: "regime_override",
      simTimeMs: T_TREND2,
      durationTicks: TICKS_10MIN,
      regime: "trending_up",
    },

    // --- 08:50: Trend high at 1.2870 — Decision Point E (hold or exit) ---

    {
      kind: "price_override",
      simTimeMs: T_TREND_HIGH,
      durationTicks: TICKS_1MIN,
      price: 1.2870,
    },

    // --- 09:00 – 09:45: Slow drift down to scenario close at 1.2862 ---

    {
      kind: "price_override",
      simTimeMs: T_DRIFT,
      durationTicks: TICKS_1MIN,
      price: 1.2865,
    },
    {
      kind: "spread_override",
      simTimeMs: T_DRIFT,
      durationTicks: TICKS_45MIN,
      spread: 0.00008,
    },
    {
      kind: "regime_override",
      simTimeMs: T_DRIFT,
      durationTicks: TICKS_45MIN,
      regime: "quiet",
    },

    // Anchor scenario-close price at 1.2862.
    {
      kind: "price_override",
      simTimeMs: T_END - 60_000,   // last minute
      durationTicks: TICKS_1MIN,
      price: 1.2862,
    },
  ],
};

export default scn003;
