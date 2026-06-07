/**
 * RankService + ProgressStore tests — SIM_ENGINE_SPEC §4.5.
 *
 * Follows scoring.test.ts style (vitest, describe/it/expect, no external fixtures).
 *
 * Coverage:
 *   1. Ladder boundary checks (Observer floor, Trainee threshold, Senior Strategist ceiling).
 *   2. xpIntoRank / xpToNextRank math.
 *   3. Drill-gate behavior via a synthetic ladder:
 *      - XP sufficient + drill missing → stays lower rank, drillsMissing populated.
 *      - Bar-full semantics (drillsMissing non-empty).
 *      - Drill completed → advances.
 *   4. ProgressStore: accumulation, reset, negative/non-finite input rejection.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { currentRank, CANONICAL_LADDER, type RankThreshold } from "../src/engine/rank.js";
import { addXp, xpTotal, completedDrillIds, markDrillCompleted, reset } from "../src/engine/progress.js";

// ---------------------------------------------------------------------------
// Synthetic ladder for drill-gate tests (keeps them independent of tunable values)
// ---------------------------------------------------------------------------

const SYNTH_LADDER: readonly RankThreshold[] = [
  { rankId: "alpha", displayLabel: "Alpha", xpRequired:    0, drillsRequired: [] },
  { rankId: "beta",  displayLabel: "Beta",  xpRequired:  100, drillsRequired: ["drill-A"] },
  { rankId: "gamma", displayLabel: "Gamma", xpRequired:  300, drillsRequired: [] },
];

// ---------------------------------------------------------------------------
// 1. Ladder boundary checks (canonical ladder)
// ---------------------------------------------------------------------------

describe("currentRank — canonical ladder boundaries", () => {
  it("0 XP → Observer; nextRank is Trainee", () => {
    const r = currentRank(0, []);
    expect(r.rank.rankId).toBe("observer");
    expect(r.nextRank?.rankId).toBe("trainee");
  });

  it("199 XP → Observer (below Trainee threshold)", () => {
    const r = currentRank(199, []);
    expect(r.rank.rankId).toBe("observer");
  });

  it("200 XP → Trainee (exact threshold)", () => {
    const r = currentRank(200, []);
    expect(r.rank.rankId).toBe("trainee");
  });

  it("799 XP → Trainee (below Practitioner threshold)", () => {
    const r = currentRank(799, []);
    expect(r.rank.rankId).toBe("trainee");
  });

  it("800 XP → Practitioner (exact threshold)", () => {
    const r = currentRank(800, []);
    expect(r.rank.rankId).toBe("practitioner");
  });

  it("1999 XP → Practitioner (below Journeyman threshold)", () => {
    const r = currentRank(1999, []);
    expect(r.rank.rankId).toBe("practitioner");
  });

  it("2000 XP → Journeyman (exact threshold)", () => {
    const r = currentRank(2000, []);
    expect(r.rank.rankId).toBe("journeyman");
  });

  it("4499 XP → Journeyman (below Strategist threshold)", () => {
    const r = currentRank(4499, []);
    expect(r.rank.rankId).toBe("journeyman");
  });

  it("4500 XP → Strategist (exact threshold)", () => {
    const r = currentRank(4500, []);
    expect(r.rank.rankId).toBe("strategist");
  });

  it("7999 XP → Strategist (below Senior Strategist threshold)", () => {
    const r = currentRank(7999, []);
    expect(r.rank.rankId).toBe("strategist");
  });

  it("8000 XP → Senior Strategist (exact threshold)", () => {
    const r = currentRank(8000, []);
    expect(r.rank.rankId).toBe("senior_strategist");
  });

  it("8000+ XP → Senior Strategist; nextRank is null (top rank)", () => {
    const r = currentRank(99999, []);
    expect(r.rank.rankId).toBe("senior_strategist");
    expect(r.nextRank).toBeNull();
  });

  it("top rank: xpToNextRank is 0", () => {
    const r = currentRank(8000, []);
    expect(r.xpToNextRank).toBe(0);
  });

  it("top rank: drillsMissing is empty", () => {
    const r = currentRank(8000, []);
    expect(r.drillsMissing).toHaveLength(0);
  });

  it("canonical ladder has no drillsRequired (empty this pass)", () => {
    for (const rank of CANONICAL_LADDER) {
      expect(rank.drillsRequired).toHaveLength(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. xpIntoRank / xpToNextRank math
// ---------------------------------------------------------------------------

describe("currentRank — xpIntoRank and xpToNextRank math", () => {
  it("Observer at 0 XP: xpIntoRank=0, xpToNextRank=200", () => {
    const r = currentRank(0, []);
    expect(r.xpIntoRank).toBe(0);
    expect(r.xpToNextRank).toBe(200);
  });

  it("Trainee at 420 XP: xpIntoRank=220, xpToNextRank=380", () => {
    // Trainee starts at 200; nextRank (Practitioner) at 800.
    // xpIntoRank = 420 − 200 = 220; xpToNextRank = 800 − 420 = 380.
    const r = currentRank(420, []);
    expect(r.rank.rankId).toBe("trainee");
    expect(r.xpIntoRank).toBe(220);
    expect(r.xpToNextRank).toBe(380);
  });

  it("exact at Practitioner threshold: xpIntoRank=0, xpToNextRank=1200", () => {
    const r = currentRank(800, []);
    expect(r.xpIntoRank).toBe(0);
    expect(r.xpToNextRank).toBe(1200);
  });

  it("one below Practitioner: Observer still, xpToNextRank reflects that", () => {
    const r = currentRank(799, []);
    expect(r.rank.rankId).toBe("trainee");
    expect(r.xpIntoRank).toBe(799 - 200);
    expect(r.xpToNextRank).toBe(800 - 799);
  });
});

// ---------------------------------------------------------------------------
// 3. Drill-gate behavior (synthetic ladder)
// ---------------------------------------------------------------------------

describe("currentRank — drill gate (synthetic ladder)", () => {
  it("XP sufficient for Beta but drill-A missing → stays Alpha, drillsMissing=[drill-A]", () => {
    // SYNTH_LADDER: Beta requires 100 XP + drill-A.
    const r = currentRank(100, [], SYNTH_LADDER);
    expect(r.rank.rankId).toBe("alpha");
    expect(r.drillsMissing).toEqual(["drill-A"]);
  });

  it("bar-full semantics: drillsMissing non-empty means xpToNextRank is 0", () => {
    const r = currentRank(100, [], SYNTH_LADDER);
    expect(r.drillsMissing).toHaveLength(1);
    expect(r.xpToNextRank).toBe(0); // XP fully met; drill is the only gate
  });

  it("XP sufficient + drill-A completed → advances to Beta", () => {
    const r = currentRank(100, ["drill-A"], SYNTH_LADDER);
    expect(r.rank.rankId).toBe("beta");
    expect(r.drillsMissing).toHaveLength(0);
  });

  it("XP short of Beta (99 XP): drillsMissing is empty (XP is the shortfall, not drills)", () => {
    const r = currentRank(99, [], SYNTH_LADDER);
    expect(r.rank.rankId).toBe("alpha");
    expect(r.drillsMissing).toHaveLength(0); // XP short → drills irrelevant
  });

  it("at Gamma (300 XP, drill-A completed): no drillsMissing, nextRank null", () => {
    const r = currentRank(300, ["drill-A"], SYNTH_LADDER);
    expect(r.rank.rankId).toBe("gamma");
    expect(r.nextRank).toBeNull();
    expect(r.drillsMissing).toHaveLength(0);
  });

  it("XP at Gamma threshold but Beta's drill-A missing → stuck at Alpha (gates are cumulative)", () => {
    // GDD §7: XP alone is insufficient — a player cannot vault an
    // intermediate rank's unmet drill gate with raw XP.  At 300 XP without
    // drill-A the ladder walk stops at Beta's unmet gate, even though
    // Gamma's own requirements would be satisfiable.
    const r = currentRank(300, [], SYNTH_LADDER);
    expect(r.rank.rankId).toBe("alpha");
    expect(r.drillsMissing).toEqual(["drill-A"]);
  });
});

// ---------------------------------------------------------------------------
// 4. ProgressStore
// ---------------------------------------------------------------------------

describe("ProgressStore", () => {
  beforeEach(() => {
    reset();
  });

  it("starts at 0 XP after reset", () => {
    expect(xpTotal()).toBe(0);
  });

  it("addXp accumulates correctly", () => {
    addXp(100);
    addXp(50);
    expect(xpTotal()).toBe(150);
  });

  it("reset clears XP back to 0", () => {
    addXp(500);
    reset();
    expect(xpTotal()).toBe(0);
  });

  it("negative input is ignored (clamped silently)", () => {
    addXp(100);
    addXp(-50);
    expect(xpTotal()).toBe(100);
  });

  it("non-finite input (NaN) is ignored", () => {
    addXp(100);
    addXp(NaN);
    expect(xpTotal()).toBe(100);
  });

  it("non-finite input (Infinity) is ignored", () => {
    addXp(100);
    addXp(Infinity);
    expect(xpTotal()).toBe(100);
  });

  it("non-finite input (-Infinity) is ignored", () => {
    addXp(100);
    addXp(-Infinity);
    expect(xpTotal()).toBe(100);
  });

  it("completedDrillIds starts empty", () => {
    expect(completedDrillIds()).toHaveLength(0);
  });

  it("markDrillCompleted adds the drill ID", () => {
    markDrillCompleted("drill-X");
    expect(completedDrillIds()).toContain("drill-X");
  });

  it("marking the same drill twice is idempotent", () => {
    markDrillCompleted("drill-X");
    markDrillCompleted("drill-X");
    expect(completedDrillIds().filter((id) => id === "drill-X")).toHaveLength(1);
  });

  it("reset clears drill completions", () => {
    markDrillCompleted("drill-X");
    reset();
    expect(completedDrillIds()).toHaveLength(0);
  });

  it("ProgressStore integrates with currentRank — XP across sessions", () => {
    // Simulate two sessions worth of XP (210 total → Trainee).
    addXp(110);
    addXp(100);
    const r = currentRank(xpTotal(), completedDrillIds());
    expect(r.rank.rankId).toBe("trainee");
  });
});

// ---------------------------------------------------------------------------
// ladderViewModel — full-ladder display data (wave E)
// ---------------------------------------------------------------------------

import { ladderViewModel } from "../src/engine/rank.js";

describe("ladderViewModel — §4.5 rank-ladder display", () => {
  it("marks achieved / current / future across the canonical ladder", () => {
    const rungs = ladderViewModel(850, []); // practitioner (800), trainee+observer achieved
    expect(rungs.map((r) => r.state)).toEqual([
      "achieved", // observer
      "achieved", // trainee
      "current",  // practitioner
      "future",   // journeyman
      "future",   // strategist
      "future",   // senior_strategist
    ]);
  });

  it("fresh player: observer current, everything else future", () => {
    const rungs = ladderViewModel(0, []);
    expect(rungs[0]?.state).toBe("current");
    expect(rungs.slice(1).every((r) => r.state === "future")).toBe(true);
  });

  it("top rank: last rung current, all others achieved", () => {
    const rungs = ladderViewModel(10_000, []);
    expect(rungs[rungs.length - 1]?.state).toBe("current");
    expect(rungs.slice(0, -1).every((r) => r.state === "achieved")).toBe(true);
  });

  it("drill-gated rung shows 'gated' with the missing drills listed", () => {
    const rungs = ladderViewModel(300, [], SYNTH_LADDER); // beta needs drill-A
    const beta = rungs.find((r) => r.rankId === "beta");
    expect(beta?.state).toBe("gated");
    expect(beta?.drillsMissing).toEqual(["drill-A"]);
    // gamma's XP is met but the chain is blocked at beta → shown as future.
    expect(rungs.find((r) => r.rankId === "gamma")?.state).toBe("future");
  });

  it("thresholds pass through verbatim (TUNABLE display contract)", () => {
    const rungs = ladderViewModel(0, []);
    expect(rungs.map((r) => r.xpRequired)).toEqual([0, 200, 800, 2000, 4500, 8000]);
  });
});
