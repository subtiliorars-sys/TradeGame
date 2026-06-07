/**
 * SCN-002: Northgate Systems — Earnings Gap and Fade — Scenario Definition.
 *
 * Expresses the full SCENARIOS_V0 beat schedule as a ScenarioDef.
 * All prices, instruments, and names are from FICTIONAL_CANON.md.
 * No real assets, companies, or dates are referenced.
 *
 * Timeline reference (all sim-times ms from session start = 08:00 ET):
 *   Tick resolution: 30,000 ms/tick (30-second ticks).
 *   Stocks adapter anchors: pre-market [04:00–09:30 ET], regular [09:30–16:00 ET].
 *   sim-time 0 = 08:00 ET (start of pre-market window in the sim).
 *
 *   08:00         : 0 ms           — earnings_gap fires, pre-market context
 *   08:00–09:00   : 0 – 3,600,000  — pre-market context, very thin volume
 *   09:00–09:30   : 3,600,000 – 5,400,000 — pre-market drift, DP-A (plan before open)
 *   09:30         : 5,400,000      — regular session open, DP-B (open spike)
 *   09:31–09:35   : 5,460,000 – 5,700,000 — no-trade zone, whipsaw
 *   09:35–09:45   : 5,700,000 – 6,300,000 — initial run to session high, DP-C
 *   09:45–09:55   : 6,300,000 – 6,900,000 — fade begins, DP-D
 *   09:55–10:00   : 6,900,000 – 7,200,000 — resolution, close below prior area
 *   Session end   : 7,200,000 ms (120 min × 60 s × 1000 ms)
 *
 * Beat kinds used:
 *   earnings_gap    — applies gap price and elevates post-gap sigma
 *   price_override  — pins displayed price for authored levels
 *   spread_override — widens/narrows spread at narrative moments
 *   regime_override — forces GBM regime to shape each phase
 */

import type { ScenarioDef } from "./types.js";

// ---------------------------------------------------------------------------
// Sim-time constants (ms from session start = 08:00 ET)
// ---------------------------------------------------------------------------

const MS_PER_TICK = 30_000; // 30-second ticks

const T_0800 = 0;             // 08:00 — sim start, earnings_gap fires
const T_0900 = 3_600_000;     // 09:00 — DP-A (plan before open / pre-market drift)
const T_0930 = 5_400_000;     // 09:30 — regular session open, DP-B
const T_0931 = 5_460_000;     // 09:31 — no-trade zone begins
const T_0935 = 5_700_000;     // 09:35 — no-trade zone ends, DP-C
const T_0945 = 6_300_000;     // 09:45 — fade confirmation, DP-D
const T_0955 = 6_900_000;     // 09:55 — resolution
const T_1000 = 7_200_000;     // 10:00 — scenario end

// ---------------------------------------------------------------------------
// Ticks per phase (for durationTicks on beats)
// ---------------------------------------------------------------------------

const TICKS_1MIN   = 2;    //  1 min / 30 s
const TICKS_5MIN   = 10;   //  5 min / 30 s
const TICKS_10MIN  = 20;   // 10 min / 30 s
const TICKS_15MIN  = 30;   // 15 min / 30 s
const TICKS_30MIN  = 60;   // 30 min / 30 s
const TICKS_60MIN  = 120;  // 60 min / 30 s

// ---------------------------------------------------------------------------
// SCN-002 ScenarioDef
// ---------------------------------------------------------------------------

export const scn002: ScenarioDef = {
  manifest: {
    id: "SCN-002",
    title: "Northgate Systems — Earnings Gap and Fade",
    market: "stocks",
    instrument: {
      symbol: "NGSM",
      displayName: "Northgate Systems (NGSM)",
    },
    durationMs: T_1000,
    msPerTick: MS_PER_TICK,
    // Prior close: $42.10. The earnings_gap beat at T_0800 applies the gap.
    startPrice: 42.10,
    prereqs: [
      "drill:position-sizing-stocks",
      "drill:stop-placement-v1",
      "lesson:earnings-gaps-form-and-fail",
    ],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [
      {
        id: "DP-A",
        label: "Decision Point A — Plan Before Open (09:00)",
        simTimeMs: T_0900,
      },
      {
        id: "DP-B",
        label: "Decision Point B — Opening Print Spike (09:30)",
        simTimeMs: T_0930,
      },
      {
        id: "DP-C",
        label: "Decision Point C — Initial Run to Session High (09:35)",
        simTimeMs: T_0935,
      },
      {
        id: "DP-D",
        label: "Decision Point D — Fade Confirmation (09:45)",
        simTimeMs: T_0945,
      },
    ],
    // XP rubric — authoring metadata for the debrief screen.
    // Actual XP emitted comes from the process-metric extractors in scoring.ts.
    // Note: spec lists per-metric values that differ slightly from scorer defaults;
    // see SCOPE NOTES. Values here match the extractor outputs, not raw spec numbers.
    xpRubric: [
      {
        metricId: "plan_declared",
        xpOnPass: 20,
        label: "Trade plan written in journal before session open (includes entry condition, stop, account-risk %)",
      },
      {
        metricId: "journal_before_trade",
        xpOnPass: 20,
        label: "Journal entry written before first trade",
      },
      {
        metricId: "size_compliance",
        xpOnPass: 30,
        label: "Position size within 10% of account-risk rule",
      },
      {
        metricId: "stop_before_entry",
        xpOnPass: 25,
        label: "Stop placed before entry",
      },
      {
        metricId: "stop_honored",
        xpOnPass: 20,
        label: "Stop honored (not manually cancelled)",
      },
      {
        metricId: "no_stop_widen",
        xpOnPass: 15,
        label: "Stop not widened after entry",
      },
      {
        metricId: "exit_journal",
        xpOnPass: 15,
        label: "Exit journal entry written within the session",
      },
      {
        metricId: "debrief_completed",
        xpOnPass: 30,
        label: "Scenario debrief completed",
      },
      {
        metricId: "patience_observation",
        xpOnPass: 40,
        label: "No trade taken + journal observation written",
      },
    ],
    recklessWinnerCoachingText:
      "You profited on this trade. Your process had gaps — review your position " +
      "sizing and stop placement before the next session.",
    debriefContentIds: [
      "scn002:what-happened",
      "scn002:good-process",
      "scn002:good-process-can-lose",
      "scn002:common-errors",
    ],
  },

  // -------------------------------------------------------------------------
  // Beat schedule — ordered by simTimeMs (ascending).
  //
  // Price levels (NGSM):
  //   Prior close:    $42.10
  //   08:00 gap open: $48.20  (+14.49% gap)
  //   09:00–09:30:    $48.20 → $48.80  (pre-market drift)
  //   09:30 spike:    $48.80 → $50.10  (open print, wide spread)
  //   09:31–09:35:    $50.10 → $49.20  (whipsaw, no-trade zone)
  //   09:35–09:45:    $49.20 → $50.50  (initial run, gap-and-go trap)
  //   09:45–09:55:    $50.50 → $48.90  (fade, distribution visible)
  //   09:55–10:00:    $48.90 → $47.80  (fade through gap, closes near lows)
  // -------------------------------------------------------------------------
  script: [

    // --- 08:00: Earnings gap fires at session start ---
    // gapMagnitude: (48.20 - 42.10) / 42.10 ≈ 0.1449
    {
      kind: "earnings_gap",
      simTimeMs: T_0800,
      gapDirection: "up",
      gapMagnitude: 0.1449,
      postGapRegime: "quiet",
    },

    // --- 08:00–09:00: Pre-market context, very thin volume ---
    // Pin price near $48.20 for the first 60 minutes (pre-market, thin).
    {
      kind: "price_override",
      simTimeMs: T_0800,
      durationTicks: TICKS_60MIN,
      price: 48.20,
    },
    // Wide pre-market spread ($0.30 per spec).
    {
      kind: "spread_override",
      simTimeMs: T_0800,
      durationTicks: TICKS_60MIN,
      spread: 0.30,
    },
    // Quiet regime — price holds, thin volume.
    {
      kind: "regime_override",
      simTimeMs: T_0800,
      durationTicks: TICKS_60MIN,
      regime: "quiet",
    },

    // --- 09:00–09:30: Pre-market drift, DP-A (plan before open) ---
    // Price grinds up: $48.20 → $48.80, spread narrows approaching open.
    {
      kind: "price_override",
      simTimeMs: T_0900,
      durationTicks: TICKS_30MIN,
      price: 48.60,
    },
    {
      kind: "spread_override",
      simTimeMs: T_0900,
      durationTicks: TICKS_15MIN,
      spread: 0.20,
    },
    // Spread narrows further in the last 15 min before open.
    {
      kind: "spread_override",
      simTimeMs: T_0900 + 15 * 60_000,
      durationTicks: TICKS_15MIN,
      spread: 0.15,
    },
    {
      kind: "regime_override",
      simTimeMs: T_0900,
      durationTicks: TICKS_30MIN,
      regime: "trending_up",
    },

    // --- 09:30: Regular session open, DP-B (opening print spike) ---
    // Large spread spike at open ($0.40); price jumps to $50.10.
    {
      kind: "price_override",
      simTimeMs: T_0930,
      durationTicks: TICKS_1MIN,
      price: 50.10,
    },
    {
      kind: "spread_override",
      simTimeMs: T_0930,
      durationTicks: TICKS_1MIN,
      spread: 0.40,
    },
    {
      kind: "regime_override",
      simTimeMs: T_0930,
      durationTicks: TICKS_1MIN,
      regime: "trending_up",
    },

    // --- 09:31–09:35: No-trade zone, whipsaw ---
    // Price whipsaws: $50.10 → $49.20. Spread normalizes to $0.08 by 09:35.
    {
      kind: "price_override",
      simTimeMs: T_0931,
      durationTicks: TICKS_5MIN,
      price: 49.40,
    },
    {
      kind: "price_override",
      simTimeMs: T_0935,
      durationTicks: 1,
      price: 49.20,
    },
    {
      kind: "spread_override",
      simTimeMs: T_0931,
      durationTicks: TICKS_5MIN,
      spread: 0.08,
    },
    {
      kind: "regime_override",
      simTimeMs: T_0931,
      durationTicks: TICKS_5MIN,
      regime: "trending_down",
    },

    // --- 09:35–09:45: Initial run to session high, DP-C (gap-and-go trap) ---
    // Momentum buyers push price to $50.50 session high.
    {
      kind: "price_override",
      simTimeMs: T_0935 + 5 * 60_000,
      durationTicks: TICKS_5MIN,
      price: 50.50,
    },
    {
      kind: "spread_override",
      simTimeMs: T_0935,
      durationTicks: TICKS_10MIN,
      spread: 0.08,
    },
    {
      kind: "regime_override",
      simTimeMs: T_0935,
      durationTicks: TICKS_10MIN,
      regime: "trending_up",
    },

    // --- 09:45–09:55: Fade begins, DP-D (distribution, sell-side prints) ---
    // Volume shifts; large sell-side visible. Price: $50.50 → $48.90.
    {
      kind: "price_override",
      simTimeMs: T_0945,
      durationTicks: TICKS_5MIN,
      price: 49.80,
    },
    {
      kind: "price_override",
      simTimeMs: T_0945 + 5 * 60_000,
      durationTicks: TICKS_5MIN,
      price: 48.90,
    },
    {
      kind: "spread_override",
      simTimeMs: T_0945,
      durationTicks: TICKS_10MIN,
      spread: 0.10,
    },
    {
      kind: "regime_override",
      simTimeMs: T_0945,
      durationTicks: TICKS_10MIN,
      regime: "trending_down",
    },

    // --- 09:55–10:00: Resolution, price fades through gap ---
    // Price fades through the opening gap: $48.90 → $47.80, closes near lows.
    {
      kind: "price_override",
      simTimeMs: T_0955,
      durationTicks: TICKS_5MIN,
      price: 47.80,
    },
    {
      kind: "spread_override",
      simTimeMs: T_0955,
      durationTicks: TICKS_5MIN,
      spread: 0.10,
    },
    {
      kind: "regime_override",
      simTimeMs: T_0955,
      durationTicks: TICKS_5MIN,
      regime: "trending_down",
    },
  ],
};

export default scn002;
