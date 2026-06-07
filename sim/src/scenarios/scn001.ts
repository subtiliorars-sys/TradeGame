/**
 * SCN-001: The HarborUSD Depegging — Scenario Definition.
 *
 * Expresses the full SCENARIOS_V0 beat schedule as a ScenarioDef.
 * All prices, instruments, and names are from FICTIONAL_CANON.md.
 * No real assets, protocols, or dates are referenced.
 *
 * Timeline reference (all sim-times ms from session start):
 *   Tick resolution: 10,000 ms/tick (10-second ticks).
 *   T-10 to T0  : session start to 600,000 ms  — pre-event context, quiet ranging
 *   T0          : 600,000 ms                   — first deviation, Decision Point A
 *   T+2 to T+5  : 720,000 – 900,000 ms         — partial recovery attempt
 *   T+6         : 960,000 ms                   — second leg down, Decision Point B
 *   T+8 to T+15 : 1,080,000 – 1,500,000 ms    — panic cascade, Decision Point C
 *   T+16 to T+25: 1,560,000 – 2,100,000 ms    — dead-cat bounce
 *   T+26 to T+35: 2,160,000 – 2,700,000 ms    — terminal leg collapse
 *   T+36 to T+40: 2,760,000 – 3,000,000 ms    — resolution / freeze
 *   Session end : 3,000,000 ms  (50 min × 60 s × 1000 ms)
 *
 * Beat kinds used:
 *   price_override  — pins the displayed price for authored price levels
 *   spread_override — widens spread at specified narrative moments
 *   regime_override — forces the GBM regime to shape the phase
 *   depeg_trigger   — elevates post-depeg sigma × 5 for 300 ticks
 */

import type { ScenarioDef } from "./types.js";

// ---------------------------------------------------------------------------
// Sim-time constants (ms from session start)
// ---------------------------------------------------------------------------

const MS_PER_TICK = 10_000; // 10-second ticks

const T_NEG10 = 0;             // session start = T-10
const T_0     = 600_000;       // T0 — first deviation
const T_2     = 720_000;       // T+2 — partial recovery
const T_5     = 900_000;       // T+5 — recovery peak
const T_6     = 960_000;       // T+6 — second leg down
const T_8     = 1_080_000;     // T+8 — cascade begins
const T_15    = 1_500_000;     // T+15 — cascade end
const T_16    = 1_560_000;     // T+16 — dead-cat bounce
const T_25    = 2_100_000;     // T+25 — bounce peak
const T_26    = 2_160_000;     // T+26 — terminal leg
const T_35    = 2_700_000;     // T+35 — terminal low
const T_36    = 2_760_000;     // T+36 — resolution
const T_38    = 2_880_000;     // T+38 — trade entry disabled
const T_40    = 3_000_000;     // T+40 — scenario end

// Ticks per phase (for durationTicks on beats)
const TICKS_2MIN  = 12;   // 2 min / 10 s
const TICKS_3MIN  = 18;
const TICKS_5MIN  = 30;
const TICKS_8MIN  = 48;
const TICKS_9MIN  = 54;
const TICKS_10MIN = 60;
const TICKS_15MIN = 90;

// ---------------------------------------------------------------------------
// SCN-001 ScenarioDef
// ---------------------------------------------------------------------------

export const scn001: ScenarioDef = {
  manifest: {
    id: "SCN-001",
    title: "The HarborUSD Depegging",
    market: "crypto",
    instrument: {
      symbol: "HarborUSD/USVC",
      displayName: "HarborUSD / USVC",
    },
    durationMs: T_40,
    msPerTick: MS_PER_TICK,
    startPrice: 1.0000,
    prereqs: [
      "drill:position-sizing-crypto",
      "drill:stop-placement-v1",
      "lesson:stablecoin-peg-mechanics",
    ],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [
      {
        id: "DP-A",
        label: "Decision Point A — First Deviation",
        simTimeMs: T_0,
      },
      {
        id: "DP-B",
        label: "Decision Point B — Second Leg Down",
        simTimeMs: T_6,
      },
      {
        id: "DP-C",
        label: "Decision Point C — Cascade Underway",
        simTimeMs: T_8,
      },
    ],
    xpRubric: [
      {
        metricId: "journal_before_trade",
        xpOnPass: 20,
        label: "Journal entry written at or before first trade",
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
        label: "Stop honored (not manually cancelled)",
      },
      {
        metricId: "patience_observation",
        xpOnPass: 95,
        label: "No trade taken + journal observation written",
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
      "You won this trade. Your process had gaps that could have caused a " +
      "large loss on the next one. Review your position sizing and stop placement.",
    debriefContentIds: [
      "scn001:what-happened",
      "scn001:good-process",
      "scn001:good-process-can-lose",
      "scn001:common-errors",
    ],
    // Pre-authored replay annotations (Screen 6 lane, scenario_authored —
    // vetted here at authoring time; observational tone, no directives).
    replayAnnotations: [
      {
        simTimeMs: 0,
        text:
          "HarborUSD is an algorithmic stable. The pre-event range is the " +
          "baseline — note the spread and depth before anything happens.",
      },
      {
        simTimeMs: 600_000,
        text:
          "First deviation from the peg. At this point the cause is " +
          "ambiguous — early warning and noise look identical here.",
      },
      {
        simTimeMs: 900_000,
        text:
          "Recovery peak. Protocol defense briefly restored price — partial " +
          "recoveries inside a structural failure are common in this archetype.",
      },
      {
        simTimeMs: 960_000,
        text:
          "Second leg down — the confirmation. Process question at this " +
          "moment: was a max-loss defined before acting?",
      },
      {
        simTimeMs: 1_560_000,
        text:
          "Dead-cat bounce: short-covering in a broken market, not recovery. " +
          "Compare the volume profile with the T+5 recovery peak.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Beat schedule — ordered by simTimeMs (ascending).
  // -------------------------------------------------------------------------
  script: [
    // --- T-10 to T0: Pre-event context — quiet ranging near 1.00 ---

    // Pin price near 1.00 for the pre-event window.
    {
      kind: "price_override",
      simTimeMs: T_NEG10,
      durationTicks: TICKS_10MIN,   // 10 min = ticks 0–59
      price: 0.9995,
    },
    // Tight spread for pre-event normal conditions.
    {
      kind: "spread_override",
      simTimeMs: T_NEG10,
      durationTicks: TICKS_10MIN,
      spread: 0.001,
    },
    // Quiet regime throughout pre-event.
    {
      kind: "regime_override",
      simTimeMs: T_NEG10,
      durationTicks: TICKS_10MIN,
      regime: "quiet",
    },

    // --- T0: First deviation — Decision Point A ---

    // Price dips to 0.9975 (single large sell print).
    {
      kind: "price_override",
      simTimeMs: T_0,
      durationTicks: 1,
      price: 0.9975,
    },
    // Spread widens slightly on the spike.
    {
      kind: "spread_override",
      simTimeMs: T_0,
      durationTicks: 2,
      spread: 0.002,
    },

    // --- T+2 to T+5: Partial recovery attempt ---

    // Protocol mechanism attempts peg defense — price recovers toward 0.9985.
    {
      kind: "price_override",
      simTimeMs: T_2,
      durationTicks: TICKS_3MIN,
      price: 0.9985,
    },
    {
      kind: "spread_override",
      simTimeMs: T_2,
      durationTicks: TICKS_3MIN,
      spread: 0.0015,
    },
    {
      kind: "regime_override",
      simTimeMs: T_2,
      durationTicks: TICKS_3MIN,
      regime: "trending_up",
    },

    // --- T+6: Second leg down — Decision Point B ---

    // Bid side thins; price falls to 0.9930 with wide spread.
    {
      kind: "price_override",
      simTimeMs: T_6,
      durationTicks: 2,
      price: 0.9930,
    },
    {
      kind: "spread_override",
      simTimeMs: T_6,
      durationTicks: 2,
      spread: 0.008,
    },
    {
      kind: "regime_override",
      simTimeMs: T_6,
      durationTicks: 2,
      regime: "trending_down",
    },

    // --- T+8 to T+15: Panic cascade — Decision Point C ---

    // Trigger the depeg event (sigma × 5, 300-tick decay).
    // This is the authoritative cascade trigger per SCN-001 spec.
    {
      kind: "depeg_trigger",
      simTimeMs: T_8,
    },
    // Anchor the cascade low near 0.9400 at T+15.
    {
      kind: "price_override",
      simTimeMs: T_15,
      durationTicks: 1,
      price: 0.9400,
    },
    // Extreme spread during cascade (8–15 price units).
    {
      kind: "spread_override",
      simTimeMs: T_8,
      durationTicks: TICKS_8MIN,
      spread: 0.015,
    },
    {
      kind: "regime_override",
      simTimeMs: T_8,
      durationTicks: TICKS_8MIN,
      regime: "trending_down",
    },

    // --- T+16 to T+25: Dead-cat bounce ---

    // Price recovers 200–250 bps on short covering (0.9400 → 0.9650).
    {
      kind: "price_override",
      simTimeMs: T_16,
      durationTicks: 2,
      price: 0.9500,
    },
    {
      kind: "price_override",
      simTimeMs: T_25,
      durationTicks: 1,
      price: 0.9650,
    },
    {
      kind: "spread_override",
      simTimeMs: T_16,
      durationTicks: TICKS_9MIN,
      spread: 0.015,
    },
    {
      kind: "regime_override",
      simTimeMs: T_16,
      durationTicks: TICKS_9MIN,
      regime: "trending_up",
    },

    // --- T+26 to T+35: Terminal leg — final collapse ---

    // Protocol fails; price collapses from 0.9650 → 0.7800.
    {
      kind: "price_override",
      simTimeMs: T_26,
      durationTicks: 2,
      price: 0.9500,
    },
    {
      kind: "price_override",
      simTimeMs: T_35,
      durationTicks: 1,
      price: 0.7800,
    },
    {
      kind: "spread_override",
      simTimeMs: T_26,
      durationTicks: TICKS_10MIN,
      spread: 0.020,
    },
    {
      kind: "regime_override",
      simTimeMs: T_26,
      durationTicks: TICKS_10MIN,
      regime: "trending_down",
    },

    // --- T+36 to T+40: Resolution / freeze ---

    // Price oscillates at new lower level (0.7800–0.8100), volume fades.
    {
      kind: "price_override",
      simTimeMs: T_36,
      durationTicks: TICKS_2MIN,
      price: 0.8000,
    },
    {
      kind: "spread_override",
      simTimeMs: T_36,
      durationTicks: TICKS_5MIN,
      spread: 0.010,
    },
    {
      kind: "regime_override",
      simTimeMs: T_36,
      durationTicks: TICKS_5MIN,
      regime: "quiet",
    },
  ],
};

export default scn001;
