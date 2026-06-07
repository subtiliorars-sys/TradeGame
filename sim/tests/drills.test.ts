/**
 * Drill catalog wave-A tests — evaluators, award idempotency, catalog
 * invariants (DRILL_SYSTEM_BRIEF §1.2/§1.3/§2/§5).
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  DRILL_CATALOG,
  getDrill,
  correctPositionSize,
  evaluatePositionSizing,
  evaluateStopPlacement,
  awardDrill,
  SIZE_TOLERANCE,
  type PositionSizingParams,
  type StopPlacementParams,
} from "../src/drills/catalog.js";
import * as ProgressStore from "../src/engine/progress.js";

beforeEach(() => {
  ProgressStore.reset();
});

// ---------------------------------------------------------------------------
// Catalog invariants
// ---------------------------------------------------------------------------

describe("catalog invariants", () => {
  it("ships exactly the four LIVE drill IDs referenced by scenario manifests", () => {
    const ids = DRILL_CATALOG.map((d) => d.id).sort();
    expect(ids).toEqual([
      "drill:position-sizing-crypto",
      "drill:position-sizing-forex",
      "drill:position-sizing-stocks",
      "drill:stop-placement-v1",
    ]);
  });

  it("XP is fixed by tier (GDD §7): Beginner = 40", () => {
    for (const d of DRILL_CATALOG) {
      expect(d.tier).toBe("Beginner");
      expect(d.xp).toBe(40);
    }
  });

  it("every drill has ≥3 parameter sets (retry re-roll, brief §5.3)", () => {
    for (const d of DRILL_CATALOG) {
      expect(d.paramSets.length, d.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("every drill carries a provenance tag and a reference card (protocol §4.1)", () => {
    for (const d of DRILL_CATALOG) {
      expect(d.provenance.length, d.id).toBeGreaterThan(0);
      expect(d.referenceCard.length, d.id).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Position-sizing evaluator — formula correctness per market
// ---------------------------------------------------------------------------

describe("position sizing — formula per market", () => {
  it("crypto: qty = (account × risk%) / (entry × stop%)", () => {
    const p: PositionSizingParams = {
      account: 10_000,
      riskPct: 1,
      stop: { kind: "crypto", entryPrice: 50, stopPct: 4 },
    };
    expect(correctPositionSize(p)).toBeCloseTo(50, 9); // 100 / (50×0.04)
  });

  it("stocks: shares = (account × risk%) / stop$", () => {
    const p: PositionSizingParams = {
      account: 10_000,
      riskPct: 1,
      stop: { kind: "stocks", stopDollars: 1.25 },
    };
    expect(correctPositionSize(p)).toBeCloseTo(80, 9);
  });

  it("forex: lots = (account × risk%) / (pip value × stop pips) — $1/pip mini convention", () => {
    const p: PositionSizingParams = {
      account: 10_000,
      riskPct: 1,
      stop: { kind: "forex", stopPips: 50, pipValuePerLot: 1, lotLabel: "mini lot" },
    };
    expect(correctPositionSize(p)).toBeCloseTo(2, 9); // $100 / ($1×50)
  });

  it("forex standard-lot convention: $10/pip", () => {
    const p: PositionSizingParams = {
      account: 20_000,
      riskPct: 1,
      stop: { kind: "forex", stopPips: 100, pipValuePerLot: 10, lotLabel: "standard lot" },
    };
    expect(correctPositionSize(p)).toBeCloseTo(0.2, 9); // $200 / ($10×100)
  });

  it("passes within ±10% tolerance, fails outside it", () => {
    const p: PositionSizingParams = {
      account: 10_000,
      riskPct: 1,
      stop: { kind: "stocks", stopDollars: 2.0 },
    }; // correct = 50
    expect(evaluatePositionSizing(p, 50).pass).toBe(true);
    expect(evaluatePositionSizing(p, 50 * (1 + SIZE_TOLERANCE)).pass).toBe(true);
    expect(evaluatePositionSizing(p, 56).pass).toBe(false);
    expect(evaluatePositionSizing(p, 44).pass).toBe(false);
    expect(evaluatePositionSizing(p, 0).pass).toBe(false);
    expect(evaluatePositionSizing(p, Number.NaN).pass).toBe(false);
  });

  it("explanation is ALWAYS produced, pass or fail (the rationale is the teaching)", () => {
    const p: PositionSizingParams = {
      account: 10_000,
      riskPct: 1,
      stop: { kind: "crypto", entryPrice: 50, stopPct: 4 },
    };
    expect(evaluatePositionSizing(p, 50).explanation.length).toBeGreaterThan(2);
    expect(evaluatePositionSizing(p, 999).explanation.length).toBeGreaterThan(2);
  });
});

// ---------------------------------------------------------------------------
// Stop-placement evaluator — structural zones
// ---------------------------------------------------------------------------

describe("stop placement — structural pass zones", () => {
  const longCase: StopPlacementParams = {
    side: "long",
    entryPrice: 102,
    keyLevel: 100,
    passZone: { from: 97.5, to: 99.4 },
    structureNote: "test structure",
  };

  it("passes inside the authored zone (beyond support with clearance)", () => {
    expect(evaluateStopPlacement(longCase, 99.0).pass).toBe(true);
    expect(evaluateStopPlacement(longCase, 97.5).pass).toBe(true);
    expect(evaluateStopPlacement(longCase, 99.4).pass).toBe(true);
  });

  it("fails inside the noise band (between zone and entry)", () => {
    const r = evaluateStopPlacement(longCase, 99.8);
    expect(r.pass).toBe(false);
    expect(r.explanation.join(" ")).toContain("noise");
  });

  it("fails on the wrong side of the entry", () => {
    const r = evaluateStopPlacement(longCase, 103);
    expect(r.pass).toBe(false);
    expect(r.explanation.join(" ")).toContain("wrong side");
  });

  it("fails far beyond the zone (stop no longer anchored to the level)", () => {
    expect(evaluateStopPlacement(longCase, 90).pass).toBe(false);
  });

  it("short variant: zone sits above resistance", () => {
    const shortCase: StopPlacementParams = {
      side: "short",
      entryPrice: 1.318,
      keyLevel: 1.32,
      passZone: { from: 1.3206, to: 1.3225 },
      structureNote: "test",
    };
    expect(evaluateStopPlacement(shortCase, 1.321).pass).toBe(true);
    expect(evaluateStopPlacement(shortCase, 1.3195).pass).toBe(false); // inside noise
    expect(evaluateStopPlacement(shortCase, 1.31).pass).toBe(false); // wrong side
  });

  it("explanations never contain directive language", () => {
    for (const stop of [99.0, 99.8, 103, 90]) {
      const text = evaluateStopPlacement(longCase, stop).explanation.join(" ").toLowerCase();
      for (const banned of ["you should buy", "you should sell", "price target", "will go"]) {
        expect(text).not.toContain(banned);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Award — once per drill, feeds rank gates and scenario prereqs
// ---------------------------------------------------------------------------

describe("awardDrill — honest-XP", () => {
  it("first completion: marks the drill + awards its fixed XP", () => {
    const drill = getDrill("drill:position-sizing-crypto")!;
    const granted = awardDrill(drill);
    expect(granted).toBe(40);
    expect(ProgressStore.xpTotal()).toBe(40);
    expect(ProgressStore.completedDrillIds()).toContain(drill.id);
  });

  it("repeat completion: re-practice pays nothing (no grind loop)", () => {
    const drill = getDrill("drill:stop-placement-v1")!;
    awardDrill(drill);
    expect(awardDrill(drill)).toBe(0);
    expect(awardDrill(drill)).toBe(0);
    expect(ProgressStore.xpTotal()).toBe(40);
  });

  it("completing all four wave-A drills = 160 XP — Trainee still requires 200 (drills alone don't rank you up)", () => {
    for (const d of DRILL_CATALOG) awardDrill(d);
    expect(ProgressStore.xpTotal()).toBe(160);
  });
});
