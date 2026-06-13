/**
 * Live-drill catalog — Drawdown Survival ×3 + Blow Up on Purpose ×3
 * (LIVE_DRILL_ENGINE_BRIEF §1/§3/§5 Wave 5; DRILL_SYSTEM_BRIEF §1.4–1.5).
 *
 * Drawdown drills: micro-scenarios with inherited losing positions; graded
 * by zero-PnL predicates in livePredicates.ts.
 *
 * Blowup drills: empty-account sessions; pass = debrief reached; bonus XP
 * for mechanism identification (display-domain classifier — import-banned
 * from scoring paths).
 */

import type { ScenarioDef } from "../scenarios/types.js";
import type { DrillSeedRef } from "./livePredicates.js";
import * as ProgressStore from "../engine/progress.js";

interface LiveDrillBase {
  drillId: string;
  title: string;
  market: "crypto" | "stocks" | "forex";
  tier: "Intermediate";
  /** Pre-session briefing card. */
  briefing: string[];
  /** The micro-scenario the session runs. */
  scenario: ScenarioDef;
  /** Sim account at session start (classifier + replay annotations). */
  startingEquity: number;
}

export interface DrawdownLiveDrillDef extends LiveDrillBase {
  kind: "drawdown-survival";
  /** TUNABLE (brief §4.1). */
  xp: number;
  /** Seed parameters — feeds HarnessConfig.drillSeed and the predicates. */
  seed: DrillSeedRef & { quantity: number };
}

export interface BlowupLiveDrillDef extends LiveDrillBase {
  kind: "blowup";
  /** TUNABLE base XP — debrief reached (brief §4.1). */
  xp: number;
  /** TUNABLE bonus — mechanism correctly identified. */
  bonusXp: number;
}

export type LiveDrillDef = DrawdownLiveDrillDef | BlowupLiveDrillDef;

const BRIEFING_DRAWDOWN = [
  "You are inheriting this position — you didn't choose it, you're",
  "managing it. The account is in drawdown from the first tick.",
  "",
  "ONE RULE: never add in the position's direction. Tighten the stop,",
  "hold, or close — all fine. To re-enter after closing, that's allowed",
  "too (close first; the sequence is the lesson).",
  "",
  "Journal one tagged 'exit' line about your exit (or your hold).",
];

const BRIEFING_BLOWUP = [
  "This drill asks you to try to empty this sim account. Use any method.",
  "The drill ends when the account is empty or when you choose to stop.",
  "The debrief will show exactly which decisions caused the loss.",
  "",
  "This is a practice account — no real money involved.",
];

function microManifest(
  id: string,
  title: string,
  market: "crypto" | "stocks" | "forex",
  symbol: string,
  displayName: string,
  startPrice: number,
  durationMs: number
): ScenarioDef["manifest"] {
  return {
    id,
    title,
    market,
    instrument: { symbol, displayName },
    durationMs,
    msPerTick: 1000,
    startPrice,
    prereqs: [],
    minRank: "Trainee",
    difficulty: "Intermediate",
    decisionPoints: [],
    xpRubric: [],
    recklessWinnerCoachingText:
      "The session ended — the debrief grades your read of the sequence, not whether " +
      "the account recovered.",
    debriefContentIds: [],
  };
}

const DRAWDOWN_DRILLS: DrawdownLiveDrillDef[] = [
  {
    kind: "drawdown-survival",
    drillId: "drill:drawdown-survival-crypto",
    title: "Drawdown Survival — Crypto",
    market: "crypto",
    tier: "Intermediate",
    xp: 55,
    startingEquity: 10_000,
    briefing: BRIEFING_DRAWDOWN,
    scenario: {
      manifest: microManifest(
        "DRL-DD-C",
        "Inherited GLIMMER Long",
        "crypto",
        "GLIMMER",
        "GLIMMER (vs HarborUSD)",
        50.0,
        360_000
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 90, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 95_000, durationTicks: 50, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 150_000, durationTicks: 180, regime: "trending_up" },
      ],
    },
    seed: {
      entryOrderId: "seed-entry-ddc",
      stopOrderId: "seed-stop-ddc",
      side: "buy",
      quantity: 18,
      fillPrice: 54.35,
      stopPrice: 47.25,
    },
  },
  {
    kind: "drawdown-survival",
    drillId: "drill:drawdown-survival-stocks",
    title: "Drawdown Survival — Stocks",
    market: "stocks",
    tier: "Intermediate",
    xp: 55,
    startingEquity: 10_000,
    briefing: BRIEFING_DRAWDOWN,
    scenario: {
      manifest: microManifest(
        "DRL-DD-S",
        "Inherited NGSM Long",
        "stocks",
        "NGSM",
        "Northgate Systems",
        36.0,
        360_000
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 80, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 85_000, durationTicks: 60, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 150_000, durationTicks: 180, regime: "trending_up" },
      ],
    },
    seed: {
      entryOrderId: "seed-entry-dds",
      stopOrderId: "seed-stop-dds",
      side: "buy",
      quantity: 25,
      fillPrice: 39.13,
      stopPrice: 34.0,
    },
  },
  {
    kind: "drawdown-survival",
    drillId: "drill:drawdown-survival-forex",
    title: "Drawdown Survival — Forex",
    market: "forex",
    tier: "Intermediate",
    xp: 55,
    startingEquity: 10_000,
    briefing: BRIEFING_DRAWDOWN,
    scenario: {
      manifest: microManifest(
        "DRL-DD-X",
        "Inherited ANDU Long",
        "forex",
        "ANDU",
        "ANDU (fictional major pair)",
        1.28,
        360_000
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 80, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 85_000, durationTicks: 60, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 150_000, durationTicks: 180, regime: "trending_up" },
      ],
    },
    seed: {
      entryOrderId: "seed-entry-ddx",
      stopOrderId: "seed-stop-ddx",
      side: "buy",
      quantity: 10_000,
      fillPrice: 1.293,
      stopPrice: 1.269,
    },
  },
];

const BLOWUP_DRILLS: BlowupLiveDrillDef[] = [
  {
    kind: "blowup",
    drillId: "drill:blowup-crypto",
    title: "Blow Up on Purpose — Crypto",
    market: "crypto",
    tier: "Intermediate",
    xp: 40,
    bonusXp: 10,
    startingEquity: 10_000,
    briefing: BRIEFING_BLOWUP,
    scenario: {
      manifest: microManifest(
        "DRL-BU-C",
        "GLIMMER — Empty the Account",
        "crypto",
        "GLIMMER",
        "GLIMMER (vs HarborUSD)",
        50.0,
        600_000
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 120, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 125_000, durationTicks: 200, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 330_000, durationTicks: 270, regime: "trending_up" },
      ],
    },
  },
  {
    kind: "blowup",
    drillId: "drill:blowup-stocks",
    title: "Blow Up on Purpose — Stocks",
    market: "stocks",
    tier: "Intermediate",
    xp: 40,
    bonusXp: 10,
    startingEquity: 10_000,
    briefing: BRIEFING_BLOWUP,
    scenario: {
      manifest: microManifest(
        "DRL-BU-S",
        "NGSM — Empty the Account",
        "stocks",
        "NGSM",
        "Northgate Systems",
        36.0,
        600_000
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 100, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 105_000, durationTicks: 180, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 290_000, durationTicks: 310, regime: "trending_down" },
      ],
    },
  },
  {
    kind: "blowup",
    drillId: "drill:blowup-forex",
    title: "Blow Up on Purpose — Forex",
    market: "forex",
    tier: "Intermediate",
    xp: 40,
    bonusXp: 10,
    startingEquity: 10_000,
    briefing: BRIEFING_BLOWUP,
    scenario: {
      manifest: microManifest(
        "DRL-BU-X",
        "ANDU — Empty the Account",
        "forex",
        "ANDU",
        "ANDU (fictional major pair)",
        1.28,
        600_000
      ),
      script: [
        { kind: "regime_override", simTimeMs: 0, durationTicks: 80, regime: "quiet" },
        { kind: "regime_override", simTimeMs: 85_000, durationTicks: 200, regime: "trending_down" },
        { kind: "regime_override", simTimeMs: 290_000, durationTicks: 310, regime: "trending_down" },
      ],
    },
  },
];

export const LIVE_DRILL_CATALOG: LiveDrillDef[] = [...DRAWDOWN_DRILLS, ...BLOWUP_DRILLS];

export const DRAWDOWN_LIVE_DRILLS = DRAWDOWN_DRILLS;
export const BLOWUP_LIVE_DRILLS = BLOWUP_DRILLS;

export function getLiveDrill(id: string): LiveDrillDef | undefined {
  return LIVE_DRILL_CATALOG.find((d) => d.drillId === id);
}

export function isDrawdownDrill(d: LiveDrillDef): d is DrawdownLiveDrillDef {
  return d.kind === "drawdown-survival";
}

export function isBlowupDrill(d: LiveDrillDef): d is BlowupLiveDrillDef {
  return d.kind === "blowup";
}

/**
 * Award a passed drawdown live drill — ONCE per drill ID.
 */
export function awardLiveDrill(def: DrawdownLiveDrillDef, pass: boolean): number | null {
  if (!pass) return null;
  if (ProgressStore.completedDrillIds().includes(def.drillId)) {
    return 0;
  }
  ProgressStore.completeDrill(def.drillId, def.xp);
  return def.xp;
}

/**
 * Award blowup drill XP — base on debrief reach (always pass), bonus on
 * correct mechanism pick. Base uses completeDrill (once); bonus uses awardBonus.
 */
export function awardBlowupDrill(
  def: BlowupLiveDrillDef,
  mechanismCorrect: boolean
): { base: number; bonus: number } {
  let base = 0;
  if (ProgressStore.completedDrillIds().includes(def.drillId)) {
    base = 0;
  } else {
    ProgressStore.completeDrill(def.drillId, def.xp);
    base = def.xp;
  }
  const bonus = mechanismCorrect ? ProgressStore.awardBonus(def.drillId, def.bonusXp) : 0;
  return { base, bonus };
}
