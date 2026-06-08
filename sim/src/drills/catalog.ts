/**
 * Drill catalog v1 — wave A: the four LIVE drill IDs already referenced by
 * shipping scenario manifests (DRILL_SYSTEM_BRIEF §1.1):
 *
 *   drill:position-sizing-crypto / -stocks / -forex   (Type A, Beginner, 40 XP)
 *   drill:stop-placement-v1                           (Type B, Beginner, 40 XP)
 *
 * Remaining catalog (12 drills incl. Drawdown Survival, whose pass predicate
 * carries an open owner question) ships in later waves.
 *
 * DESIGN RAILS (brief §1.2/§1.3/§5, GDD §7, Trade Bots autopsy):
 *   - Pass criteria are PROCESS predicates — a calculation within tolerance,
 *     a stop beyond structure. Never outcome/PnL.
 *   - The reference card (the formula) is ALWAYS visible — applying a shown
 *     formula, not recalling under stress. No time pressure.
 *   - The explanation is ALWAYS shown after submit, pass or fail — the
 *     rationale is the teaching (anti-headcanon protocol §4).
 *   - Retry is immediate, free, and re-rolled (next parameter set) so retry
 *     means re-doing the math, not memorizing an answer.
 *   - XP awards once per drill ID (first pass only) via awardDrill — repeat
 *     passes re-practice without re-paying (honest-XP).
 *   - Forex pip-value convention (repo standing rule): $10 / $1 / $0.10 per
 *     pip for standard / mini / micro lots. Drills state the unit in use.
 *
 * Pure module — no Phaser. The DrillScene renders; this evaluates.
 */

import * as ProgressStore from "../engine/progress.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DrillTier = "Beginner" | "Intermediate";

export interface PositionSizingParams {
  /** Sim account size in account currency. */
  account: number;
  /** Declared risk per trade, percent (e.g. 1 = 1%). */
  riskPct: number;
  /** Market-specific stop-distance fields (exactly one shape per market). */
  stop:
    | { kind: "crypto"; entryPrice: number; stopPct: number } // % from entry
    | { kind: "stocks"; stopDollars: number }                 // $ per share
    | { kind: "forex"; stopPips: number; pipValuePerLot: number; lotLabel: string };
}

export interface StopPlacementParams {
  /** Long or short context (stop goes below support / above resistance). */
  side: "long" | "short";
  /** Labeled entry price shown with the directional arrow. */
  entryPrice: number;
  /** The authored key S/R level. */
  keyLevel: number;
  /**
   * Authored pass zone — a RANGE beyond the key level (brief §1.3: a range,
   * not a single number, to accommodate structure interpretations).
   * For a long: [zoneFar, zoneNear] both BELOW keyLevel (stop must land in it).
   * For a short: both ABOVE keyLevel.
   */
  passZone: { from: number; to: number };
  /** One-line description of the structure shown (render layer caption). */
  structureNote: string;
}

export interface DrillDef {
  id: string;
  title: string;
  market: "crypto" | "stocks" | "forex" | "all";
  tier: DrillTier;
  /** Fixed by tier per GDD §7 (TUNABLE: Beginner 40 / Intermediate 55). */
  xp: number;
  /** Provenance tag — which lesson teaches the material (protocol §4.1c). */
  provenance: string;
  /** The always-visible reference card (the formula / the principle). */
  referenceCard: string[];
  kind: "position_sizing" | "stop_placement";
  /** Parameter sets — retry cycles to the next set (re-roll, §5.3). */
  paramSets: Array<PositionSizingParams | StopPlacementParams>;
}

export interface DrillResult {
  pass: boolean;
  /** Correct value (position size) or pass-zone description (stop drill). */
  correctDisplay: string;
  /** Step-by-step rationale — ALWAYS shown, pass or fail (protocol §4.1d). */
  explanation: string[];
}

// ---------------------------------------------------------------------------
// Evaluators — pure process predicates
// ---------------------------------------------------------------------------

/** Tolerance on position-sizing answers (matches size_compliance). TUNABLE. */
export const SIZE_TOLERANCE = 0.10;

export function correctPositionSize(p: PositionSizingParams): number {
  const riskAmount = p.account * (p.riskPct / 100);
  switch (p.stop.kind) {
    case "crypto":
      return riskAmount / (p.stop.entryPrice * (p.stop.stopPct / 100));
    case "stocks":
      return riskAmount / p.stop.stopDollars;
    case "forex":
      return riskAmount / (p.stop.pipValuePerLot * p.stop.stopPips);
  }
}

export function evaluatePositionSizing(
  p: PositionSizingParams,
  answer: number
): DrillResult {
  const correct = correctPositionSize(p);
  // Epsilon keeps the exact ±10% boundary inclusive under float error.
  const pass =
    Number.isFinite(answer) &&
    answer > 0 &&
    Math.abs(answer - correct) / correct <= SIZE_TOLERANCE + 1e-9;

  const riskAmount = p.account * (p.riskPct / 100);
  const lines: string[] = [
    `Risk amount = account × risk% = ${fmt(p.account)} × ${p.riskPct}% = ${fmt(riskAmount)}`,
  ];
  switch (p.stop.kind) {
    case "crypto":
      lines.push(
        `Risk per unit = entry × stop% = ${fmt(p.stop.entryPrice)} × ${p.stop.stopPct}% = ${fmt(p.stop.entryPrice * (p.stop.stopPct / 100))}`,
        `Size = risk amount ÷ risk per unit = ${fmt(riskAmount)} ÷ ${fmt(p.stop.entryPrice * (p.stop.stopPct / 100))} = ${fmt(correct)} units`
      );
      break;
    case "stocks":
      lines.push(
        `Risk per share = stop distance = $${fmt(p.stop.stopDollars)}`,
        `Shares = risk amount ÷ risk per share = ${fmt(riskAmount)} ÷ ${fmt(p.stop.stopDollars)} = ${fmt(correct)} shares`
      );
      break;
    case "forex":
      lines.push(
        `Risk per ${p.stop.lotLabel} = pip value × stop pips = $${fmt(p.stop.pipValuePerLot)} × ${p.stop.stopPips} = $${fmt(p.stop.pipValuePerLot * p.stop.stopPips)}`,
        `Lots = risk amount ÷ risk per lot = ${fmt(riskAmount)} ÷ ${fmt(p.stop.pipValuePerLot * p.stop.stopPips)} = ${fmt(correct)} ${p.stop.lotLabel}s`
      );
      break;
  }
  lines.push(
    pass
      ? "Within the ±10% tolerance — the same rule size_compliance grades in scenarios."
      : "Outside the ±10% tolerance. Re-walk the steps above — the formula stays on screen.",
    "Sizing from the stop distance means the LOSS is chosen in advance; the position size is derived, never the other way around."
  );

  return { pass, correctDisplay: fmt(correct), explanation: lines };
}

export function evaluateStopPlacement(
  p: StopPlacementParams,
  stopPrice: number
): DrillResult {
  const lo = Math.min(p.passZone.from, p.passZone.to);
  const hi = Math.max(p.passZone.from, p.passZone.to);
  const pass = Number.isFinite(stopPrice) && stopPrice >= lo && stopPrice <= hi;

  const beyond = p.side === "long" ? "below support" : "above resistance";
  const wrongSide =
    p.side === "long" ? stopPrice >= p.entryPrice : stopPrice <= p.entryPrice;
  const insideNoise =
    p.side === "long"
      ? stopPrice > hi && stopPrice < p.entryPrice
      : stopPrice < lo && stopPrice > p.entryPrice;

  const explanation: string[] = [
    p.structureNote,
    `Key level: ${fmt(p.keyLevel)}. A sound stop sits ${beyond} with clearance — ` +
      `the authored zone here is ${fmt(lo)}–${fmt(hi)}.`,
  ];
  if (pass) {
    explanation.push(
      "Your stop is beyond the level with margin: a normal adverse wick into the " +
        "zone does not invalidate the thesis before the structure breaks."
    );
  } else if (wrongSide) {
    explanation.push(
      "Your stop is on the wrong side of the entry for this direction — it would " +
        "exit immediately or never protect the position."
    );
  } else if (insideNoise) {
    explanation.push(
      "Your stop sits in the noise band between the key level and your entry. " +
        "Normal adverse movement reaches there before the thesis is actually " +
        "invalidated — the classic stopped-out-then-it-went-anyway placement."
    );
  } else {
    explanation.push(
      "Your stop is beyond the zone entirely — so far out that the position size " +
        "for the same risk% becomes tiny and the structure level no longer defines " +
        "the exit. Anchor the stop to the level, then size from the distance."
    );
  }
  explanation.push(
    "The assessment is structural only — where the stop sits relative to the " +
      "level. It is never a price prediction."
  );

  return {
    pass,
    correctDisplay: `${fmt(lo)}–${fmt(hi)} (${beyond}, with clearance)`,
    explanation,
  };
}

function fmt(n: number): string {
  // Up to 4 decimals, trailing zeros trimmed — 4-decimal forex levels must
  // not collapse to a zero-width "1.32–1.32" pass zone in the rationale
  // (red-team F3: the rationale IS the teaching; toFixed(2) taught nonsense).
  return Number.isInteger(n) ? n.toString() : n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

// ---------------------------------------------------------------------------
// Award — once per drill ID (honest-XP: repeat passes re-practice, not re-pay)
// ---------------------------------------------------------------------------

/**
 * Mark the drill complete and award its fixed XP — ONLY on first completion.
 * Returns the XP granted (0 on repeats). Completion feeds rank drill gates
 * and scenario prereqs via ProgressStore.
 */
export function awardDrill(def: DrillDef): number {
  if (ProgressStore.completedDrillIds().includes(def.id)) {
    return 0;
  }
  // Atomic mark+award with rank-change detection across both mutations —
  // a drill completion can BE the rank-up (red-team F1).
  ProgressStore.completeDrill(def.id, def.xp);
  return def.xp;
}

// ---------------------------------------------------------------------------
// Catalog — wave A (the four live IDs)
// ---------------------------------------------------------------------------

export const DRILL_CATALOG: DrillDef[] = [
  {
    id: "drill:position-sizing-crypto",
    title: "Position Sizing Puzzle — Crypto",
    market: "crypto",
    tier: "Beginner",
    xp: 40, // TUNABLE (brief §2.4)
    provenance: "lesson:F-05 risk sizing · crypto pillar intro",
    referenceCard: [
      "qty = (account × risk%) ÷ (entry × stop%)",
      "Risk amount first. Size is DERIVED from the stop distance.",
    ],
    kind: "position_sizing",
    paramSets: [
      { account: 10_000, riskPct: 1, stop: { kind: "crypto", entryPrice: 50, stopPct: 4 } },   // → 50
      { account: 10_000, riskPct: 1, stop: { kind: "crypto", entryPrice: 4.2, stopPct: 5 } },  // → ~476.19
      { account: 25_000, riskPct: 2, stop: { kind: "crypto", entryPrice: 80, stopPct: 2.5 } }, // → 250
    ],
  },
  {
    id: "drill:position-sizing-stocks",
    title: "Position Sizing Puzzle — Stocks",
    market: "stocks",
    tier: "Beginner",
    xp: 40, // TUNABLE
    provenance: "lesson:F-05 risk sizing · stocks pillar intro",
    referenceCard: [
      "shares = (account × risk%) ÷ stop distance ($ per share)",
      "Risk amount first. Size is DERIVED from the stop distance.",
    ],
    kind: "position_sizing",
    paramSets: [
      { account: 10_000, riskPct: 1, stop: { kind: "stocks", stopDollars: 1.25 } },  // → 80
      { account: 10_000, riskPct: 1, stop: { kind: "stocks", stopDollars: 2.0 } },   // → 50
      { account: 50_000, riskPct: 0.5, stop: { kind: "stocks", stopDollars: 1.0 } }, // → 250
    ],
  },
  {
    id: "drill:position-sizing-forex",
    title: "Position Sizing Puzzle — Forex",
    market: "forex",
    tier: "Beginner",
    xp: 40, // TUNABLE
    provenance: "lesson:F-05 risk sizing · forex pillar intro (pip values)",
    referenceCard: [
      "lots = (account × risk%) ÷ (pip value × stop pips)",
      "Pip value convention: $10 standard / $1 mini / $0.10 micro per pip.",
    ],
    kind: "position_sizing",
    paramSets: [
      { account: 10_000, riskPct: 1, stop: { kind: "forex", stopPips: 50, pipValuePerLot: 1, lotLabel: "mini lot" } },     // → 2
      { account: 10_000, riskPct: 1, stop: { kind: "forex", stopPips: 25, pipValuePerLot: 1, lotLabel: "mini lot" } },     // → 4
      { account: 20_000, riskPct: 1, stop: { kind: "forex", stopPips: 100, pipValuePerLot: 10, lotLabel: "standard lot" } }, // → 0.2
    ],
  },
  {
    id: "drill:stop-placement-v1",
    title: "Stop Placement Challenge",
    market: "all",
    tier: "Beginner",
    xp: 40, // TUNABLE
    provenance: "lesson:F-06 stop placement · structure basics",
    referenceCard: [
      "A stop belongs BEYOND the key level, with clearance for normal noise.",
      "Inside the wick range = stopped out before the thesis is tested.",
    ],
    kind: "stop_placement",
    paramSets: [
      {
        side: "long",
        entryPrice: 102.0,
        keyLevel: 100.0,
        passZone: { from: 97.5, to: 99.4 }, // below support, ≥ ~one candle body clear
        structureNote:
          "Long entry at 102 above a support shelf at 100; recent wicks reach 99.6.",
      },
      {
        side: "short",
        entryPrice: 1.318,
        keyLevel: 1.32,
        passZone: { from: 1.3206, to: 1.3225 },
        structureNote:
          "Short entry at 1.3180 below resistance at 1.3200; sweep wicks printed 1.3204.",
      },
      {
        side: "long",
        entryPrice: 4.35,
        keyLevel: 4.2,
        passZone: { from: 4.05, to: 4.16 },
        structureNote:
          "Long entry at 4.35 above a 4.20 base; consolidation wicks reach 4.22–4.18.",
      },
    ],
  },
  {
    id: "drill:stop-placement-crypto",
    title: "Stop Placement — Crypto Volatility",
    market: "crypto",
    tier: "Intermediate",
    xp: 55, // TUNABLE (brief §2.4 Intermediate)
    provenance: "lesson:F-06 stop placement · crypto beginner (wick environments)",
    referenceCard: [
      "Crypto wicks run deeper: clearance must cover the wick environment,",
      "not just the level. A stop that survives stocks noise dies here.",
    ],
    kind: "stop_placement",
    paramSets: [
      {
        side: "long",
        entryPrice: 52.4,
        keyLevel: 48.0,
        passZone: { from: 43.5, to: 46.8 },
        structureNote:
          "Long at 52.40 above a 48.00 base; this market prints 4-6% wicks routinely — recent wick low 46.95.",
      },
      {
        side: "short",
        entryPrice: 4.05,
        keyLevel: 4.2,
        passZone: { from: 4.31, to: 4.45 },
        structureNote:
          "Short at 4.05 under the 4.20 shelf; failed-breakout wicks above the shelf reached 4.29.",
      },
      {
        side: "long",
        entryPrice: 148.0,
        keyLevel: 140.0,
        passZone: { from: 130.0, to: 136.5 },
        structureNote:
          "Long at 148 above 140 support; 5% adverse wicks are normal here — last sweep printed 137.2.",
      },
    ],
  },
  {
    id: "drill:stop-placement-stocks",
    title: "Stop Placement — Session Open & Gaps",
    market: "stocks",
    tier: "Intermediate",
    xp: 55, // TUNABLE
    provenance: "lesson:F-06 stop placement · stocks beginner (session structure)",
    referenceCard: [
      "The opening range and gap edges are magnets for normal tests.",
      "A stop inside the first 30-minute range is a donation to the open.",
    ],
    kind: "stop_placement",
    paramSets: [
      {
        side: "long",
        entryPrice: 51.2,
        keyLevel: 49.6,
        passZone: { from: 47.8, to: 49.1 },
        structureNote:
          "Long at 51.20 after an earnings gap from 46; the gap's upper edge at 49.60 has been tested twice; opening-range low 49.75.",
      },
      {
        side: "short",
        entryPrice: 33.4,
        keyLevel: 34.6,
        passZone: { from: 34.95, to: 35.8 },
        structureNote:
          "Short at 33.40 under post-gap resistance 34.60; the open's spike high printed 34.88.",
      },
      {
        side: "long",
        entryPrice: 36.1,
        keyLevel: 35.5,
        passZone: { from: 34.4, to: 35.15 },
        structureNote:
          "Long at 36.10 above the prior close shelf 35.50; session-open range was 35.60–36.30.",
      },
    ],
  },
  {
    id: "drill:stop-placement-forex",
    title: "Stop Placement — Session Sweeps",
    market: "forex",
    tier: "Intermediate",
    xp: 55, // TUNABLE
    provenance: "lesson:F-06 stop placement · X-I01 session-open sweeps (SCN-003 archetype)",
    referenceCard: [
      "Session opens hunt the obvious level first. The sweep IS the test:",
      "clearance below the swept low, not below the pre-open range.",
    ],
    kind: "stop_placement",
    paramSets: [
      {
        side: "long",
        entryPrice: 1.2812,
        keyLevel: 1.279,
        passZone: { from: 1.2745, to: 1.2778 },
        structureNote:
          "Long at 1.2812 after a London-open sweep of the Asian low 1.2790 to a nadir of 1.2783 (the SCN-003 shape).",
      },
      {
        side: "short",
        entryPrice: 1.3185,
        keyLevel: 1.321,
        passZone: { from: 1.3218, to: 1.3245 },
        structureNote:
          "Short at 1.3185 under 1.3210 after an upside sweep printed 1.3215 and rejected.",
      },
      {
        side: "long",
        entryPrice: 0.9152,
        keyLevel: 0.913,
        passZone: { from: 0.9095, to: 0.9122 },
        structureNote:
          "Long at 0.9152 above 0.9130; the session sweep ran stops to 0.9126 before reversing.",
      },
    ],
  },
];

export function getDrill(id: string): DrillDef | undefined {
  return DRILL_CATALOG.find((d) => d.id === id);
}

// ---------------------------------------------------------------------------
// Procedural parameter re-roll (wave-D residual: a 3-set cycle is memorizable
// in ≤4 attempts because the rationale reveals answers by design).
//
// Position-sizing problems are generated from the drill's authored sets by a
// DETERMINISTIC mulberry-style mix of (drillId, attempt) — same attempt
// number always reproduces the same numbers (debuggable, replayable), but
// the answer changes every retry, so retry always means redoing the math.
// Stop-placement stays on authored sets (zones are hand-built structures —
// procedural structure generation is its own design problem).
// ---------------------------------------------------------------------------

function mix(seedStr: string, attempt: number): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619) >>> 0;
  }
  h = (h + Math.imul(attempt + 1, 2654435761)) >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick from an inclusive numeric menu deterministically. */
function pick<T>(rand: () => number, menu: readonly T[]): T {
  const v = menu[Math.floor(rand() * menu.length) % menu.length];
  if (v === undefined) throw new Error("empty menu");
  return v;
}

/**
 * The parameter set for (drill, attempt): position-sizing drills generate a
 * fresh deterministic problem each attempt; stop-placement drills cycle
 * their authored sets.
 */
export function paramsForAttempt(
  def: DrillDef,
  attempt: number
): PositionSizingParams | StopPlacementParams {
  const authored = def.paramSets[attempt % def.paramSets.length];
  if (authored === undefined) throw new Error(`drill ${def.id}: empty paramSets`);
  if (def.kind !== "position_sizing") return authored;

  const rand = mix(def.id, attempt);
  const account = pick(rand, [5_000, 10_000, 20_000, 25_000, 50_000]);
  const riskPct = pick(rand, [0.5, 1, 1.5, 2]);
  const base = authored as PositionSizingParams;
  switch (base.stop.kind) {
    case "crypto":
      return {
        account,
        riskPct,
        stop: {
          kind: "crypto",
          entryPrice: pick(rand, [4.2, 12.5, 50, 80, 145]),
          stopPct: pick(rand, [2, 2.5, 4, 5, 8]),
        },
      };
    case "stocks":
      return {
        account,
        riskPct,
        stop: { kind: "stocks", stopDollars: pick(rand, [0.5, 0.8, 1.0, 1.25, 2.0, 3.2]) },
      };
    case "forex": {
      const std = rand() < 0.5;
      return {
        account,
        riskPct,
        stop: {
          kind: "forex",
          stopPips: pick(rand, [25, 40, 50, 80, 100]),
          pipValuePerLot: std ? 10 : 1,
          lotLabel: std ? "standard lot" : "mini lot",
        },
      };
    }
  }
}
