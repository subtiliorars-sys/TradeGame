/**
 * Live-drill catalog — Drawdown Survival ×3 markets
 * (LIVE_DRILL_ENGINE_BRIEF §1/§3; DRILL_SYSTEM_BRIEF §1.4).
 *
 * Each drill is a micro-scenario: a short authored session the player
 * enters ALREADY holding a losing position (the harness drillSeed emits
 * the inherited fill + companion stop at tick 0). Survival is graded by
 * the three zero-PnL predicates in livePredicates.ts — the owner-ruled
 * proxy: process facts only, no equity reads anywhere in grading.
 *
 * XP NOTE: xp values are authored here but NOT yet wired to awards — the
 * award path lands with the DrillScene wiring wave AFTER the economy
 * red-team (hard rail: red-team any XP-economy change before it pays).
 *
 * Drawdown depths (TUNABLE): crypto −8%, stocks −8% per the brief table;
 * forex repriced to −1% ≈ 130 pips (the brief's −10% would be a 1000+ pip
 * drawdown — implausible for a major pair; pips-realistic is the
 * editorially correct reading, flagged as a deviation).
 */

import type { ScenarioDef } from "../scenarios/types.js";
import type { DrillSeedRef } from "./livePredicates.js";

export interface LiveDrillDef {
  drillId: string;
  title: string;
  market: "crypto" | "stocks" | "forex";
  tier: "Intermediate";
  /** TUNABLE (brief §2.4 Intermediate). NOT wired to awards yet — see XP NOTE. */
  xp: number;
  /** Pre-session briefing card (the premise + the one rule). */
  briefing: string[];
  /** The micro-scenario the session runs. */
  scenario: ScenarioDef;
  /** Seed parameters — feeds HarnessConfig.drillSeed and the predicates. */
  seed: DrillSeedRef & { quantity: number };
}

const BRIEFING_COMMON = [
  "You are inheriting this position — you didn't choose it, you're",
  "managing it. The account is in drawdown from the first tick.",
  "",
  "ONE RULE: never add in the position's direction. Tighten the stop,",
  "hold, or close — all fine. To re-enter after closing, that's allowed",
  "too (close first; the sequence is the lesson).",
  "",
  "Journal one tagged 'exit' line about your exit (or your hold).",
];

function microManifest(
  id: string,
  title: string,
  market: "crypto" | "stocks" | "forex",
  symbol: string,
  displayName: string,
  startPrice: number
): ScenarioDef["manifest"] {
  return {
    id,
    title,
    market,
    instrument: { symbol, displayName },
    durationMs: 360_000, // 6 sim-minutes — TUNABLE
    msPerTick: 1000,
    startPrice,
    prereqs: [],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [],
    // XP comes from the drill-completion path, never scenario metrics —
    // an empty rubric means the scenario scorer emits nothing (rubric-
    // gated emission), keeping the one-XP-book rule intact.
    xpRubric: [],
    recklessWinnerCoachingText:
      "The position recovered — note that the drill graded your process " +
      "(no adding, stop maintained, exit journaled), not the recovery. " +
      "The same process is the right call when it doesn't recover.",
    debriefContentIds: [],
  };
}

export const LIVE_DRILL_CATALOG: LiveDrillDef[] = [
  {
    drillId: "drill:drawdown-survival-crypto",
    title: "Drawdown Survival — Crypto",
    market: "crypto",
    tier: "Intermediate",
    xp: 55, // TUNABLE
    briefing: BRIEFING_COMMON,
    scenario: {
      manifest: microManifest(
        "DRL-DD-C",
        "Inherited GLIMMER Long",
        "crypto",
        "GLIMMER",
        "GLIMMER (vs HarborUSD)",
        50.0
      ),
      script: [
        // Quiet open, a tempting second dip (the DCA trap), then recovery.
        { kind: "regime_override", simTimeMs: 0, durationTicks: 90, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 95_000, durationTicks: 50, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 150_000, durationTicks: 180, regime: "trending_up" },
      ],
    },
    // Seed fill 54.35 vs 50.00 start ≈ −8% inherited drawdown (long).
    seed: {
      entryOrderId: "seed-entry-ddc",
      stopOrderId: "seed-stop-ddc",
      side: "buy",
      quantity: 18, // ≈ $980 notional on a $10k sim account — TUNABLE
      fillPrice: 54.35,
      stopPrice: 47.25, // below start: survivable room, real protection
    },
  },
  {
    drillId: "drill:drawdown-survival-stocks",
    title: "Drawdown Survival — Stocks",
    market: "stocks",
    tier: "Intermediate",
    xp: 55, // TUNABLE
    briefing: BRIEFING_COMMON,
    scenario: {
      manifest: microManifest(
        "DRL-DD-S",
        "Inherited NGSM Long",
        "stocks",
        "NGSM",
        "Northgate Systems",
        36.0
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 80, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 85_000, durationTicks: 60, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 150_000, durationTicks: 180, regime: "trending_up" },
      ],
    },
    // Seed fill 39.13 vs 36.00 start ≈ −8% inherited drawdown.
    seed: {
      entryOrderId: "seed-entry-dds",
      stopOrderId: "seed-stop-dds",
      side: "buy",
      quantity: 25, // ≈ $980 notional — TUNABLE
      fillPrice: 39.13,
      stopPrice: 34.0,
    },
  },
  {
    drillId: "drill:drawdown-survival-forex",
    title: "Drawdown Survival — Forex",
    market: "forex",
    tier: "Intermediate",
    xp: 55, // TUNABLE
    briefing: BRIEFING_COMMON,
    scenario: {
      manifest: microManifest(
        "DRL-DD-X",
        "Inherited ANDU Long",
        "forex",
        "ANDU",
        "ANDU (fictional major pair)",
        1.28
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 80, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 85_000, durationTicks: 60, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 150_000, durationTicks: 180, regime: "trending_up" },
      ],
    },
    // Seed fill 1.2930 vs 1.2800 start ≈ −1% / ~130 pips (brief's −10%
    // repriced to pips-realistic; TUNABLE, deviation documented above).
    seed: {
      entryOrderId: "seed-entry-ddx",
      stopOrderId: "seed-stop-ddx",
      side: "buy",
      quantity: 10_000, // mini-lot scale — TUNABLE
      fillPrice: 1.293,
      stopPrice: 1.269,
    },
  },
];

export function getLiveDrill(id: string): LiveDrillDef | undefined {
  return LIVE_DRILL_CATALOG.find((d) => d.drillId === id);
}
