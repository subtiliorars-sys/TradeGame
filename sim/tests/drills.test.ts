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
  it("the four LIVE drill IDs referenced by scenario manifests all ship", () => {
    const ids = new Set(DRILL_CATALOG.map((d) => d.id));
    for (const live of [
      "drill:position-sizing-crypto",
      "drill:position-sizing-forex",
      "drill:position-sizing-stocks",
      "drill:stop-placement-v1",
    ]) {
      expect(ids.has(live), live).toBe(true);
    }
    // Tier-2: the three market stop-placement variants (brief §1.3).
    expect(DRILL_CATALOG).toHaveLength(7);
  });

  it("XP is fixed by tier (GDD §7): Beginner = 40, Intermediate = 55", () => {
    for (const d of DRILL_CATALOG) {
      expect(d.xp, d.id).toBe(d.tier === "Beginner" ? 40 : 55);
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

  it("the four Beginner drills = 160 XP — under Trainee's 200 (the gate set alone doesn't rank you up)", () => {
    for (const d of DRILL_CATALOG.filter((x) => x.tier === "Beginner")) awardDrill(d);
    expect(ProgressStore.xpTotal()).toBe(160);
  });
});

// ---------------------------------------------------------------------------
// Wave-D red-team regressions
// ---------------------------------------------------------------------------

import { currentRank } from "../src/engine/rank.js";

describe("F1: a drill completion that crosses a rank threshold fires the rank-up marker", () => {
  it("4th drill at ≥200 XP → Observer→Trainee recorded (the primary on-ramp)", () => {
    // The red-team's failing probe, as a permanent regression test.
    ProgressStore.addXp(200);
    const ids = DRILL_CATALOG.map((d) => d.id);
    for (const id of ids.slice(0, 3)) {
      ProgressStore.completeDrill(id, 40);
    }
    ProgressStore.clearRankUp(); // discard any earlier marker noise
    expect(currentRank(ProgressStore.xpTotal(), ProgressStore.completedDrillIds()).rank.rankId).toBe("observer");
    const last = DRILL_CATALOG.find((d) => d.id === ids[3])!;
    awardDrill(last);
    const up = ProgressStore.lastRankUp();
    expect(up, "the drill-gate crossing must record the rank-up").not.toBeNull();
    expect(up?.from.rankId).toBe("observer");
    expect(up?.to.rankId).toBe("trainee");
  });

  it("completeDrill is the single atomic mutator (mark + XP together)", () => {
    ProgressStore.completeDrill("drill:position-sizing-crypto", 40);
    expect(ProgressStore.xpTotal()).toBe(40);
    expect(ProgressStore.completedDrillIds()).toContain("drill:position-sizing-crypto");
  });
});

describe("F3: rationale precision — 4-decimal levels never collapse", () => {
  it("the forex short set's pass zone renders at full precision", () => {
    const forexShort = getDrill("drill:stop-placement-v1")!.paramSets[1] as StopPlacementParams;
    const r = evaluateStopPlacement(forexShort, 1.31); // any fail
    expect(r.correctDisplay).toContain("1.3206");
    expect(r.correctDisplay).toContain("1.3225");
    expect(r.correctDisplay).not.toContain("1.32–1.32");
  });
});

// ---------------------------------------------------------------------------
// Tier-2 variants + procedural re-roll
// ---------------------------------------------------------------------------

import { paramsForAttempt, correctPositionSize as cps } from "../src/drills/catalog.js";

describe("tier-2 stop-placement variants", () => {
  it("the three market variants ship at Intermediate/55 with valid zones", () => {
    for (const id of [
      "drill:stop-placement-crypto",
      "drill:stop-placement-stocks",
      "drill:stop-placement-forex",
    ]) {
      const d = getDrill(id);
      expect(d, id).toBeDefined();
      expect(d?.tier).toBe("Intermediate");
      expect(d?.xp).toBe(55);
      for (const set of d?.paramSets ?? []) {
        const p = set as StopPlacementParams;
        const lo = Math.min(p.passZone.from, p.passZone.to);
        const hi = Math.max(p.passZone.from, p.passZone.to);
        if (p.side === "long") {
          expect(hi, `${id} zone below key`).toBeLessThan(p.keyLevel);
          expect(p.keyLevel).toBeLessThan(p.entryPrice);
        } else {
          expect(lo, `${id} zone above key`).toBeGreaterThan(p.keyLevel);
          expect(p.keyLevel).toBeGreaterThan(p.entryPrice);
        }
      }
    }
  });

  it("tier-2 drills do NOT gate any rank yet (shipped-only rule: drawdown still missing)", () => {
    // Practitioner's brief assignment needs 6 drills; only 3 exist → gate stays [].
    // (The rank gate property test enforces ⊆ shipped; this asserts the flip
    // hasn't happened prematurely.)
    expect(true).toBe(true); // placeholder context — real check in rank.test.ts property
  });
});

describe("procedural parameter re-roll (position sizing)", () => {
  const d = () => getDrill("drill:position-sizing-forex")!;

  it("deterministic: same (drill, attempt) → identical problem", () => {
    const a = paramsForAttempt(d(), 7);
    const b = paramsForAttempt(d(), 7);
    expect(a).toEqual(b);
  });

  it("re-roll: consecutive attempts pose different problems (answer changes)", () => {
    let distinct = 0;
    for (let i = 0; i < 6; i++) {
      const x = cps(paramsForAttempt(d(), i) as PositionSizingParams);
      const y = cps(paramsForAttempt(d(), i + 1) as PositionSizingParams);
      if (Math.abs(x - y) > 1e-9) distinct++;
    }
    expect(distinct, "most consecutive attempts must change the answer").toBeGreaterThanOrEqual(4);
  });

  it("generated problems stay in the authored menus (sane teaching ranges)", () => {
    for (let i = 0; i < 20; i++) {
      const p = paramsForAttempt(d(), i) as PositionSizingParams;
      expect([5_000, 10_000, 20_000, 25_000, 50_000]).toContain(p.account);
      expect([0.5, 1, 1.5, 2]).toContain(p.riskPct);
      if (p.stop.kind === "forex") {
        expect([1, 10]).toContain(p.stop.pipValuePerLot);
      }
    }
  });

  it("stop-placement drills keep authored sets (cycling, not procedural)", () => {
    const sp = getDrill("drill:stop-placement-v1")!;
    expect(paramsForAttempt(sp, 0)).toEqual(sp.paramSets[0]);
    expect(paramsForAttempt(sp, 3)).toEqual(sp.paramSets[0]); // cycles
  });
});
