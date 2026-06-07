/**
 * SCN-004: The GLIMMER Pool — Impermanent Loss — Scenario Definition.
 *
 * Expresses the SCENARIOS_V1 §SCN-004 beat schedule as a ScenarioDef.
 * All prices, instruments, and names are from FICTIONAL_CANON.md
 * (GLIMMER, HarborUSD, ArcSwap — entries 3, 1, 4).  No real protocol,
 * chain, or token is referenced.  This is a divergence scenario, not a
 * depeg scenario — HarborUSD is in its stable state throughout.
 *
 * Timeline reference (sim-times ms from scenario start, 10-second ticks):
 *   Setup (deposit decision)  : 0 – 300,000        (T-05 → T0), DP-A
 *   T0 (deposit)              : 300,000
 *   Stable period             : T0 → T0+15 min     — fees begin, IL minimal
 *   First divergence leg      : T0+15 → T0+30 min  — 4.35 → 5.10 (+21%), DP-B at T0+20
 *   Acceleration              : T0+30 → T0+50 min  — 5.10 → 6.85 (+63%), DP-C at T0+40
 *   Plateau / high-fee window : T0+50 → T0+65 min  — 6.85 → 6.75, DP-D at T0+55
 *   Partial correction        : T0+65 → T0+80 min  — 6.75 → 5.40, DP-E at T0+72
 *   Resolution                : T0+80 → T0+90 min  — 5.40 → 5.55, scenario end
 *   Scenario end              : 5,700,000 ms (95 min total: 5 min setup + 90 min)
 *
 * Key price levels (GLIMMER in USVC):
 *   Deposit price:    4.20
 *   First divergence: 5.10  (+21% — IL ≈ −0.47%, fees 0.7%: net still positive)
 *   Peak divergence:  6.85  (+63% — IL ≈ −2.92%, fees 1.4%: net ≈ −1.5%)
 *   Post-correction:  5.40  (IL ≈ −0.78%, fees 2.5%: net ≈ +1.7%)
 *
 * LP MECHANICS NOTE:
 *   The engine's order model is spot — the LP deposit is represented at the
 *   engine level as a GLIMMER spot position (deposit = market buy; the
 *   withdrawal trigger = stop order, which SCENARIOS_V1 DP-D treats as
 *   "equivalent to a stop in process terms").  The LP Position Panel values
 *   (pool value / HODL baseline / fees / net-vs-HODL) come from
 *   engine/amm.ts (lpPanelSnapshot + SCN004_FEE_SCHEDULE) at display time —
 *   a UI surface, never a scoring input.
 *
 * Scenario-specific metrics (rubric-gated in scoring.ts):
 *   il_estimate_written — journal tagged "il_estimate" at DP-C (+25)
 *   trigger_updated     — journal tagged "trigger_update" after a hold (+15)
 */

import type { ScenarioDef } from "./types.js";

// ---------------------------------------------------------------------------
// Sim-time constants (ms from scenario start; T0 = deposit at +5 min)
// ---------------------------------------------------------------------------

const MS_PER_TICK = 10_000; // 10-second ticks (crypto convention, as SCN-001)
const MIN = 60_000;

const T_SETUP   = 0;               // setup / deposit decision, DP-A
const T0        = 5 * MIN;         // deposit moment (300,000)
const T_STABLE  = T0;              // stable period begins at deposit
const T_DIV1    = T0 + 15 * MIN;   // first divergence leg (1,200,000)
const T_DPB     = T0 + 20 * MIN;   // DP-B (1,500,000)
const T_ACCEL   = T0 + 30 * MIN;   // acceleration (2,100,000)
const T_DPC     = T0 + 40 * MIN;   // DP-C — primary IL decision (2,700,000)
const T_PLATEAU = T0 + 50 * MIN;   // plateau / high-fee window (3,300,000)
const T_DPD     = T0 + 55 * MIN;   // DP-D (3,600,000)
const T_CORRECT = T0 + 65 * MIN;   // partial correction (4,200,000)
const T_DPE     = T0 + 72 * MIN;   // DP-E — net briefly positive (4,620,000)
const T_RESOLVE = T0 + 80 * MIN;   // resolution (5,100,000)
const T_END     = T0 + 90 * MIN;   // scenario end (5,700,000 = 570 ticks)

// Ticks per phase (at 10,000 ms/tick → 6 ticks/min)
const TICKS_1MIN  = 6;
const TICKS_2MIN  = 12;
const TICKS_5MIN  = 30;
const TICKS_10MIN = 60;
const TICKS_15MIN = 90;
const TICKS_20MIN = 120;

// ---------------------------------------------------------------------------
// SCN-004 ScenarioDef
// ---------------------------------------------------------------------------

export const scn004: ScenarioDef = {
  manifest: {
    id: "SCN-004",
    title: "The GLIMMER Pool — Impermanent Loss",
    market: "crypto",
    instrument: {
      symbol: "GLIMMER/HarborUSD",
      displayName: "GLIMMER (ArcSwap pool)",
    },
    durationMs: T_END,
    msPerTick: MS_PER_TICK,
    startPrice: 4.2,
    prereqs: [
      "scenario:SCN-001",
      "lesson:liquidity-pools-impermanent-loss", // C-I03
      "drill:position-sizing-crypto",
      "drill:stop-placement-v1",
    ],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [
      {
        id: "DP-A",
        label: "Decision Point A — Deposit Decision",
        simTimeMs: T_SETUP,
      },
      {
        id: "DP-B",
        label: "Decision Point B — First Divergence (+21%)",
        simTimeMs: T_DPB,
      },
      {
        id: "DP-C",
        label: "Decision Point C — Major Divergence (+63%, IL ~2.9%)",
        simTimeMs: T_DPC,
      },
      {
        id: "DP-D",
        label: "Decision Point D — Plateau, Highest Fee Window",
        simTimeMs: T_DPD,
      },
      {
        id: "DP-E",
        label: "Decision Point E — Partial Correction, Net Briefly Positive",
        simTimeMs: T_DPE,
      },
    ],
    xpRubric: [
      {
        metricId: "journal_before_trade",
        xpOnPass: 20,
        label: "Deposit rationale journaled before depositing",
      },
      {
        metricId: "plan_declared",
        xpOnPass: 20,
        label: "Withdrawal trigger declared at or before deposit",
      },
      {
        metricId: "il_estimate_written",
        xpOnPass: 25,
        label: "LP Position Panel consulted and IL estimate written at Decision Point C",
      },
      {
        metricId: "stop_honored",
        xpOnPass: 20,
        label: "Withdrawal trigger honored (not cancelled when set)",
      },
      {
        metricId: "trigger_updated",
        xpOnPass: 15,
        label: "Withdrawal trigger updated after a decision to hold",
      },
      {
        metricId: "patience_observation",
        xpOnPass: 80,
        label: "Observation-only run (no deposit) with full journal",
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
      "Your LP position ended slightly ahead of a HODL strategy. Your process " +
      "had a gap: no withdrawal trigger was defined, so this outcome depended " +
      "on the price correction occurring. A scenario where price kept rising " +
      "would have produced a different result with the same process.",
    debriefContentIds: [
      "scn004:what-happened",
      "scn004:good-process",
      "scn004:good-process-can-lose",
      "scn004:common-errors",
    ],
    // Pre-authored replay annotations (Screen 6 lane, scenario_authored).
    // Observational tone only — no buy/sell directives, no price targets
    // (SIM_ENGINE_SPEC §5.3 content rule).
    replayAnnotations: [
      {
        simTimeMs: 0, // T_SETUP — deposit decision window
        text:
          "GLIMMER is priced at 4.20 USVC with a tight pool spread. " +
          "Before any deposit, the LP Position Panel shows the HODL baseline " +
          "and current pool value — at deposit price they are identical.",
      },
      {
        simTimeMs: 1_500_000, // T_DPB — first divergence leg, +21%
        text:
          "GLIMMER has risen roughly 21% from the deposit price. The LP " +
          "Position Panel now shows a small gap opening between pool value and " +
          "the HODL baseline — this is impermanent loss beginning to accumulate " +
          "against cumulative fee income.",
      },
      {
        simTimeMs: 2_700_000, // T_DPC — major divergence, +63%, IL ~2.9%
        text:
          "At +63% divergence from deposit price, the LP Position Panel shows " +
          "net-vs-HODL roughly −1.5%: IL (~2.9%) now exceeds cumulative fees " +
          "(~1.4%). Process question at this moment: was a withdrawal trigger " +
          "defined before the deposit, and does the current panel reading " +
          "cross it?",
      },
      {
        simTimeMs: 3_600_000, // T_DPD — plateau, highest fee window
        text:
          "Price has plateaued near 6.85. Fee accrual is at its highest rate " +
          "here — the pool handles elevated volume while divergence holds " +
          "roughly flat. Net-vs-HODL is narrowing as fees accumulate against a " +
          "stable IL figure.",
      },
      {
        simTimeMs: 4_620_000, // T_DPE — partial correction, net briefly positive
        text:
          "GLIMMER has corrected toward 5.40. The LP Position Panel's " +
          "net-vs-HODL is now briefly positive (cumulative fees ~2.5% vs. IL " +
          "~0.8%). This is a data point about where the position stands — the " +
          "panel does not indicate what happens next.",
      },
    ],
  },

  // -------------------------------------------------------------------------
  // Beat schedule — ordered by simTimeMs (ascending).
  //
  // Price levels from SCENARIOS_V1 §SCN-004:
  //   4.20 deposit → 4.35 stable drift → 5.10 first leg → 6.85 peak
  //   → 6.75 plateau → 5.40 correction → 5.55 resolution
  // Spread: 0.008 on GLIMMER spot throughout (spec, Decision Point A row).
  // -------------------------------------------------------------------------
  script: [
    // --- Setup: deposit decision at 4.20, quiet ---
    {
      kind: "price_override",
      simTimeMs: T_SETUP,
      durationTicks: TICKS_5MIN,
      price: 4.2,
    },
    {
      kind: "spread_override",
      simTimeMs: T_SETUP,
      durationTicks: TICKS_15MIN,
      spread: 0.008,
    },
    {
      kind: "regime_override",
      simTimeMs: T_SETUP,
      durationTicks: TICKS_20MIN,
      regime: "quiet",
    },

    // --- T0 → T0+15: stable period — 4.20 drifting to 4.35, fees accrue ---
    {
      kind: "price_override",
      simTimeMs: T_STABLE + 10 * MIN,
      durationTicks: TICKS_2MIN,
      price: 4.3,
    },

    // --- T0+15 → T0+30: first divergence leg — climb to 5.10 (+21%) ---
    {
      kind: "regime_override",
      simTimeMs: T_DIV1,
      durationTicks: TICKS_15MIN,
      regime: "trending_up",
    },
    {
      kind: "price_override",
      simTimeMs: T_DIV1 + 8 * MIN,
      durationTicks: TICKS_2MIN,
      price: 4.75,
    },
    // DP-B reference level: ~21% above deposit price.
    {
      kind: "price_override",
      simTimeMs: T_DPB + 8 * MIN,
      durationTicks: TICKS_2MIN,
      price: 5.1,
    },

    // --- T0+30 → T0+50: acceleration — 5.10 → 6.85 (+63%) ---
    {
      kind: "regime_override",
      simTimeMs: T_ACCEL,
      durationTicks: TICKS_20MIN,
      regime: "trending_up",
    },
    {
      kind: "price_override",
      simTimeMs: T_ACCEL + 5 * MIN,
      durationTicks: TICKS_2MIN,
      price: 5.7,
    },
    // DP-C anchor: peak divergence zone.
    {
      kind: "price_override",
      simTimeMs: T_DPC,
      durationTicks: TICKS_2MIN,
      price: 6.4,
    },
    {
      kind: "price_override",
      simTimeMs: T_DPC + 7 * MIN,
      durationTicks: TICKS_2MIN,
      price: 6.85,
    },

    // --- T0+50 → T0+65: plateau and high-fee window — 6.85 → 6.75 ---
    {
      kind: "regime_override",
      simTimeMs: T_PLATEAU,
      durationTicks: TICKS_15MIN,
      regime: "quiet",
    },
    {
      kind: "price_override",
      simTimeMs: T_DPD,
      durationTicks: TICKS_2MIN,
      price: 6.78,
    },
    {
      kind: "price_override",
      simTimeMs: T_CORRECT - 2 * MIN,
      durationTicks: TICKS_1MIN,
      price: 6.75,
    },

    // --- T0+65 → T0+80: partial correction — 6.75 → 5.40 ---
    {
      kind: "regime_override",
      simTimeMs: T_CORRECT,
      durationTicks: TICKS_15MIN,
      regime: "trending_down",
    },
    {
      kind: "price_override",
      simTimeMs: T_CORRECT + 4 * MIN,
      durationTicks: TICKS_2MIN,
      price: 6.1,
    },
    // DP-E anchor: net-vs-HODL briefly positive near 5.40.
    {
      kind: "price_override",
      simTimeMs: T_DPE,
      durationTicks: TICKS_2MIN,
      price: 5.45,
    },
    {
      kind: "price_override",
      simTimeMs: T_RESOLVE - 2 * MIN,
      durationTicks: TICKS_1MIN,
      price: 5.4,
    },

    // --- T0+80 → T0+90: resolution — stabilize 5.40 → 5.55 ---
    {
      kind: "regime_override",
      simTimeMs: T_RESOLVE,
      durationTicks: TICKS_10MIN,
      regime: "quiet",
    },
    // Anchor scenario-close price.
    {
      kind: "price_override",
      simTimeMs: T_END - 1 * MIN,
      durationTicks: TICKS_1MIN,
      price: 5.5,
    },
  ],
};

export default scn004;
