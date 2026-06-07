/**
 * SCN-006: The Employment Report on ANDU — Scenario Definition.
 *
 * Expresses the SCENARIOS_V1 §SCN-006 beat schedule as a ScenarioDef.
 * ANDU and the "Monthly Labor Conditions Report" (MLCR) are fictional —
 * no real calendar event, release name, date, or schedule is referenced
 * (FICTIONAL_CANON.md).
 *
 * Timeline reference (sim-times ms from scenario start, 5-second ticks):
 *   T-20 → T-05 : 0 – 900,000        — pre-report quiet, spread 0.9 pips
 *   T-05        : 900,000            — News Policy Card, DP-A
 *   T-01        : 1,140,000          — policy deadline; trade entry freezes (UI)
 *   T0          : 1,200,000          — release: +75-pip spike, 14-pip spread
 *   T0+15s–45s  : 1,215,000–1,245,000 — whipsaw to 1.3185 (−130 pips from spike)
 *   T0+45s–T+03 : spread normalization, price stabilizes ~1.3190–1.3205
 *   T+03 → T+25 : trend establishment to 1.3265 (pullback at T+12 → 1.3240)
 *   T+25 → T+50 : continuation to 1.3290 (pullback at T+38 → 1.3255)
 *   T+50 → T+75 : trend slows; scenario ends at 5,700,000 ms (= 1140 ticks)
 *
 * Key price levels (ANDU, 4-decimal):
 *   Pre-report baseline: 1.3240    Whipsaw low:    1.3185
 *   Initial spike high:  1.3315    Scenario close: 1.3290 (drift 1.3285)
 *
 * Mechanics:
 *   - news_event beat at T0 drives the adapter's spread-blowout decay and
 *     post-whipsaw trend pull (trend target = baseline + 50 pips = 1.3290).
 *   - Explicit price/spread overrides pin the authored spike/whipsaw shape
 *     and the narrative spread checkpoints (14 → 10 → 6 → 3 → 1.2 pips).
 *   - News Policy Card: policy_declare (A/B/C) before T-01 —
 *     policy_declared_card (+30) and policy_match (+25) metrics.
 *   - No-entry window T0 → T0+45s — no_entry_window metric (+15).
 */

import type { ScenarioDef } from "./types.js";

// ---------------------------------------------------------------------------
// Sim-time constants (ms from scenario start = T-20)
// ---------------------------------------------------------------------------

const MS_PER_TICK = 5_000; // 5-second ticks (whipsaw sub-chart resolution)
const MIN = 60_000;

const T_CONTEXT  = 0;                  // T-20 — pre-report quiet
const T_CARD     = 15 * MIN;           // T-05 — News Policy Card, DP-A (900,000)
const T_FREEZE   = 19 * MIN;           // T-01 — policy deadline (1,140,000)
const T0         = 20 * MIN;           // release (1,200,000)
const T_WHIP     = T0 + 15_000;        // whipsaw reversal begins (1,215,000)
const T_DPC      = T0 + 20_000;        // DP-C — during the whipsaw (1,220,000)
const T_WHIP_LOW = T0 + 30_000;        // whipsaw low zone (1,230,000)
const T_NORMAL   = T0 + 50_000;        // spread normalizing, DP-D (1,250,000)
const T_TREND    = T0 + 3 * MIN;       // trend establishment (1,380,000)
const T_DPE      = T0 + 5 * MIN;       // DP-E — trend established (1,500,000)
const T_PULL1    = T0 + 12 * MIN;      // first pullback → 1.3240 (1,920,000)
const T_LEG2     = T0 + 25 * MIN;      // continuation (2,700,000)
const T_PULL2    = T0 + 38 * MIN;      // second pullback → 1.3255 (3,480,000)
const T_HIGH     = T0 + 50 * MIN;      // trend high 1.3290 (4,200,000)
const T_END      = T0 + 75 * MIN;      // scenario end (5,700,000)

const NO_ENTRY_END = T0 + 45_000;      // whipsaw window end (1,245,000)

// Ticks per span (at 5,000 ms/tick → 12 ticks/min)
const TICKS_1MIN  = 12;
const TICKS_2MIN  = 24;
const TICKS_5MIN  = 60;
const TICKS_15MIN = 180;
const TICKS_20MIN = 240;

const PIP = 0.0001;

// ---------------------------------------------------------------------------
// SCN-006 ScenarioDef
// ---------------------------------------------------------------------------

export const scn006: ScenarioDef = {
  manifest: {
    id: "SCN-006",
    title: "The Employment Report on ANDU",
    market: "forex",
    instrument: {
      symbol: "ANDU",
      displayName: "ANDU",
    },
    durationMs: T_END,
    msPerTick: MS_PER_TICK,
    startPrice: 1.324,
    prereqs: [
      "scenario:SCN-003",
      "lesson:session-open-sweeps",     // X-I01
      "lesson:high-impact-news-events", // X-I02 — paired lesson
      "lesson:spreads-cost-of-trading", // X-B04
      "drill:position-sizing-forex",
      "drill:stop-placement-v1",
    ],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [
      {
        id: "DP-A",
        label: "Decision Point A — News Policy Card",
        simTimeMs: T_CARD,
      },
      {
        id: "DP-B",
        label: "Decision Point B — Release (Existing Position Holders)",
        simTimeMs: T0,
      },
      {
        id: "DP-C",
        label: "Decision Point C — Whipsaw Reversal Underway",
        simTimeMs: T_DPC,
      },
      {
        id: "DP-D",
        label: "Decision Point D — Spread Normalizing, Direction Unclear",
        simTimeMs: T_NORMAL,
      },
      {
        id: "DP-E",
        label: "Decision Point E — Trend Established",
        simTimeMs: T_DPE,
      },
    ],
    xpRubric: [
      {
        metricId: "leverage_ack",
        xpOnPass: 10,
        label: "Leverage risk acknowledged before first order",
      },
      {
        metricId: "policy_declared_card",
        xpOnPass: 30,
        label: "News Policy Card completed with journal rationale before T-01",
      },
      {
        metricId: "policy_match",
        xpOnPass: 25,
        label: "Declared policy matches actual behavior during the event",
      },
      {
        metricId: "journal_before_trade",
        xpOnPass: 20,
        label: "Hypothesis journaled before first trade",
      },
      {
        metricId: "size_compliance",
        xpOnPass: 30,
        label: "Position size within 10% of account-risk rule (actual stop distance)",
      },
      {
        metricId: "stop_before_entry",
        xpOnPass: 25,
        label: "Stop placed before entry (logged before fill)",
      },
      {
        metricId: "stop_honored",
        xpOnPass: 20,
        label: "Stop honored (not cancelled during the event)",
      },
      {
        metricId: "no_stop_widen",
        xpOnPass: 15,
        label: "Stop not widened during the event",
      },
      {
        metricId: "no_entry_window",
        xpOnPass: 15,
        label: "No entry during the whipsaw window (T0 to T0+45s)",
      },
      {
        metricId: "exit_journal",
        xpOnPass: 15,
        label: "Exit reason or policy-adherence note journaled",
      },
      {
        metricId: "patience_observation",
        xpOnPass: 135,
        label: "Observation-only run (option C) with full journal",
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
      "You held through a 130-pip adverse move with no stop. In this scenario, " +
      "price recovered. In a scenario where price continued to 1.3185 and " +
      "beyond, your account would have taken a loss limited only by margin, " +
      "not by a stop. The outcome does not validate the process.",
    debriefContentIds: [
      "scn006:what-happened",
      "scn006:good-process",
      "scn006:good-process-can-lose",
      "scn006:common-errors",
    ],
    // Pre-authored replay annotations (Screen 6 lane, scenario_authored).
    // Observational tone only — no buy/sell directives, no price targets
    // (SIM_ENGINE_SPEC §5.3 content rule).
    replayAnnotations: [
      {
        simTimeMs: 0, // T_CONTEXT — pre-report quiet
        text:
          "ANDU is ranging in a narrow band with a 0.9-pip spread and " +
          "declining volume. This pre-report pattern — price compression, " +
          "volume drying — is the structural context the News Policy Card " +
          "asks the trader to evaluate before the release.",
      },
      {
        simTimeMs: 900_000, // T_CARD — News Policy Card moment (T-05)
        text:
          "Five minutes before the Monthly Labor Conditions Report, the " +
          "policy deadline window opens. The spread is already widening " +
          "toward 1.8 pips. Whatever position-management plan applies to " +
          "this event needs to be declared before T-01 — not after the " +
          "number prints.",
      },
      {
        simTimeMs: 1_215_000, // T_WHIP — whipsaw reversal begins (T0+15s)
        text:
          "Fifteen seconds after the release, price has reversed 130 pips " +
          "from the spike high. The spread during this reversal is 6 pips. " +
          "This is the whipsaw window: the highest-slippage, highest-spread " +
          "period of the entire scenario.",
      },
      {
        simTimeMs: 1_250_000, // T_NORMAL — spread normalizing (T0+50s)
        text:
          "The spread is contracting from 6 pips toward 3 pips and then " +
          "lower. ANDU has stabilized near 1.3190–1.3205 after the " +
          "whipsaw low. The report's direction is now structurally visible " +
          "in price — the question is whether a trend is establishing or " +
          "the range is resetting.",
      },
      {
        simTimeMs: 4_200_000, // T_HIGH — trend high (T0+50min)
        text:
          "ANDU has trended from the post-whipsaw stabilization zone at " +
          "~1.3190 to ~1.3290 — a 100-pip range over the 50 minutes " +
          "following the report. The spread has normalized to 0.9 pips. " +
          "Two pullbacks occurred along the way; neither reached the pre- " +
          "report baseline.",
      },
    ],
    noEntryWindows: [
      {
        startMs: T0,
        endMs: NO_ENTRY_END,
        label: "Whipsaw window (T0 to T0+45s)",
      },
    ],
    policyDeadlineMs: T_FREEZE,
  },

  // -------------------------------------------------------------------------
  // Beat schedule — ordered by simTimeMs (ascending).
  //
  // Spread narrative (pips → price units at 0.0001/pip):
  //   0.9 pre-report → 1.8 widening at T-05 → 14 at T0+03s → 10 at T0+10s
  //   → 6 at T0+45s → 3 at T0+50s → 1.2 by T+03 → 1.0 → 0.9 at close
  // -------------------------------------------------------------------------
  script: [
    // --- T-20 → T-05: pre-report quiet — ANDU ranging 1.3230–1.3250 ---
    {
      kind: "price_override",
      simTimeMs: T_CONTEXT,
      durationTicks: TICKS_2MIN,
      price: 1.324,
    },
    {
      kind: "spread_override",
      simTimeMs: T_CONTEXT,
      durationTicks: TICKS_15MIN,
      spread: 0.9 * PIP,
    },
    {
      kind: "regime_override",
      simTimeMs: T_CONTEXT,
      durationTicks: TICKS_20MIN,
      regime: "quiet",
    },

    // --- T-05 → T0: news-freeze window — volume dries, spread widens ---
    {
      kind: "price_override",
      simTimeMs: T_CARD,
      durationTicks: TICKS_5MIN,
      price: 1.3242,
    },
    {
      kind: "spread_override",
      simTimeMs: T_CARD,
      durationTicks: TICKS_5MIN,
      spread: 1.8 * PIP,
    },

    // --- T0: release — news_event drives blowout decay + post-whipsaw trend ---
    {
      kind: "news_event",
      simTimeMs: T0,
      spreadBlowoutPips: 14,
      blowoutDecayTicks: 48,    // spread back to ~normal by T+03 (adapter decay)
      initialSpikePips: 75,
      whipsawPips: 130,
      trendDriftPips: 50,       // trend target = 1.3240 + 50 pips = 1.3290
    },
    // Pin the authored spike: 1.3240 → 1.3315 in ~8 seconds.
    {
      kind: "price_override",
      simTimeMs: T0,
      durationTicks: 3,
      price: 1.3315,
    },
    {
      kind: "spread_override",
      simTimeMs: T0,
      durationTicks: 2,
      spread: 14 * PIP,
    },
    {
      kind: "spread_override",
      simTimeMs: T0 + 10_000,
      durationTicks: 1,
      spread: 10 * PIP,
    },

    // --- T0+15s → T0+45s: whipsaw — 1.3315 → 1.3185 (−130 pips) ---
    {
      kind: "price_override",
      simTimeMs: T_WHIP,
      durationTicks: 1,
      price: 1.326,
    },
    {
      kind: "price_override",
      simTimeMs: T_DPC,
      durationTicks: 2,
      price: 1.321,
    },
    {
      kind: "price_override",
      simTimeMs: T_WHIP_LOW,
      durationTicks: 3,
      price: 1.3185,
    },
    {
      kind: "spread_override",
      simTimeMs: T_WHIP,
      durationTicks: 6,
      spread: 6 * PIP,
    },

    // --- T0+45s → T+03: spread normalization — price stabilizes 1.3190–1.3205 ---
    {
      kind: "price_override",
      simTimeMs: T0 + 45_000,
      durationTicks: 3,
      price: 1.319,
    },
    {
      kind: "spread_override",
      simTimeMs: T_NORMAL,
      durationTicks: 12,
      spread: 3 * PIP,
    },
    {
      kind: "price_override",
      simTimeMs: T_NORMAL + 10_000,
      durationTicks: 2,
      price: 1.3195,
    },
    // Stabilization anchors through T+03 (elevated post-news sigma window —
    // keep the 1.3190–1.3205 range so the 1.3140 stop survives by construction).
    {
      kind: "price_override",
      simTimeMs: T0 + 70_000,
      durationTicks: 6,
      price: 1.3192,
    },
    {
      kind: "price_override",
      simTimeMs: T0 + 100_000,
      durationTicks: 6,
      price: 1.3198,
    },
    {
      kind: "price_override",
      simTimeMs: T0 + 130_000,
      durationTicks: 6,
      price: 1.3201,
    },
    {
      kind: "price_override",
      simTimeMs: T0 + 160_000,
      durationTicks: 4,
      price: 1.3203,
    },

    // --- T+03 → T+25: trend establishment — recovery toward 1.3265 ---
    //
    // AUTHORING NOTE — dense anchors: the spec requires that a stop placed
    // "at the correct distance" (1.3140, 100 pips below pre-report) survives
    // both the spike and the whipsaw.  Post-news GBM noise can stray tens of
    // pips between sparse pins, so the trend path is anchored roughly every
    // 1–3 minutes; lows then stay well above 1.3140 by construction.
    {
      kind: "spread_override",
      simTimeMs: T_TREND,
      durationTicks: TICKS_20MIN,
      spread: 1.2 * PIP,
    },
    {
      kind: "regime_override",
      simTimeMs: T_TREND,
      durationTicks: TICKS_20MIN,
      regime: "trending_up",
    },
    // Anchor ladder — durations span exactly to the next anchor (no free
    // gaps while the 1.3140 stop is live).
    ...([
      [T_TREND,             1.3205, 12],
      [T0 + 4 * MIN,        1.321,  12],
      [T_DPE,               1.3215, 12], // first higher low / DP-E zone
      [T0 + 6 * MIN,        1.3218, 24],
      [T0 + 8 * MIN,        1.3228, 24],
      [T0 + 10 * MIN,       1.3235, 24],
      [T_PULL1,             1.324,  36], // first pullback at T+12
      [T0 + 15 * MIN,       1.3248, 36],
      [T0 + 18 * MIN,       1.3255, 36],
      [T0 + 21 * MIN,       1.326,  48],
    ] as Array<[number, number, number]>).map(([simTimeMs, price, durationTicks]) => ({
      kind: "price_override" as const,
      simTimeMs,
      durationTicks,
      price,
    })),

    // --- T+25 → T+50: continuation — 1.3265 → 1.3290 ---
    {
      kind: "spread_override",
      simTimeMs: T_LEG2,
      durationTicks: TICKS_20MIN + TICKS_5MIN,
      spread: 1.0 * PIP,
    },
    {
      kind: "regime_override",
      simTimeMs: T_LEG2,
      durationTicks: TICKS_20MIN,
      regime: "trending_up",
    },
    ...([
      [T_LEG2,              1.3265, 36],
      [T0 + 28 * MIN,       1.327,  36],
      [T0 + 31 * MIN,       1.3272, 36],
      [T0 + 34 * MIN,       1.3262, 48],
      [T_PULL2,             1.3255, 36], // second pullback at T+38
      [T0 + 41 * MIN,       1.3268, 36],
      [T0 + 44 * MIN,       1.3275, 36],
      [T0 + 47 * MIN,       1.3282, 36],
      [T_HIGH,              1.329,  60],
    ] as Array<[number, number, number]>).map(([simTimeMs, price, durationTicks]) => ({
      kind: "price_override" as const,
      simTimeMs,
      durationTicks,
      price,
    })),

    // --- T+50 → T+75: trend slows, drift into the close ---
    {
      kind: "regime_override",
      simTimeMs: T_HIGH,
      durationTicks: TICKS_20MIN,
      regime: "quiet",
    },
    {
      kind: "spread_override",
      simTimeMs: T_HIGH,
      durationTicks: TICKS_20MIN + TICKS_5MIN,
      spread: 0.9 * PIP,
    },
    ...([
      [T0 + 55 * MIN,       1.3288, 60],
      [T0 + 60 * MIN,       1.3287, 60],
      [T0 + 65 * MIN,       1.3286, 60],
      [T0 + 70 * MIN,       1.3286, 48],
    ] as Array<[number, number, number]>).map(([simTimeMs, price, durationTicks]) => ({
      kind: "price_override" as const,
      simTimeMs,
      durationTicks,
      price,
    })),
    // Anchor scenario-close price.
    {
      kind: "price_override",
      simTimeMs: T_END - 1 * MIN,
      durationTicks: TICKS_1MIN,
      price: 1.3285,
    },
  ],
};

export default scn006;
