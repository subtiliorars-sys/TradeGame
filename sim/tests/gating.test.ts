/**
 * Scenario gating tests — pure lock-state evaluation (ui/engine/gating.ts).
 *
 * Post drill-flip (drill-build wave C): scenario-completion prereqs AND
 * SHIPPED drill prereqs hard-lock with explicit reasons; lessons and
 * unshipped drills stay advisory. The no-softlock guarantee is now path-
 * shaped: a fresh player's open surface is the RISK DRILLS (zero-state
 * accessible), and completing the shipped drill prereqs opens the V0
 * scenarios.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { scenarioLockState } from "../src/ui/engine/gating.js";
import { DRILL_CATALOG } from "../src/drills/catalog.js";

const ALL_SHIPPED = DRILL_CATALOG.map((d) => d.id);
import { getScenario, allScenarios } from "../src/scenarios/registry.js";
import * as ProgressStore from "../src/engine/progress.js";

function manifestOf(id: string) {
  const def = getScenario(id);
  if (!def) throw new Error(`unknown scenario ${id}`);
  return def.manifest;
}

beforeEach(() => {
  ProgressStore.reset();
});

describe("scenarioLockState — hard locks (scenario prereqs)", () => {
  it("SCN-004 is locked until SCN-001 is completed, with an explicit reason", () => {
    const state = scenarioLockState(manifestOf("SCN-004"), "observer", [], undefined, ALL_SHIPPED);
    expect(state.locked).toBe(true);
    expect(state.reasons).toContain("Complete SCN-001 first");
  });

  it("SCN-004 unlocks once SCN-001 + its shipped drills are complete", () => {
    const state = scenarioLockState(manifestOf("SCN-004"), "observer", ["SCN-001"], undefined, ALL_SHIPPED);
    expect(state.locked).toBe(false);
    expect(state.reasons).toHaveLength(0);
  });

  it("the V1 chain matches the authored prereqs (5→2, 6→3)", () => {
    expect(
      scenarioLockState(manifestOf("SCN-005"), "trainee", ["SCN-001"], undefined, ALL_SHIPPED).reasons
    ).toContain("Complete SCN-002 first");
    expect(
      scenarioLockState(manifestOf("SCN-006"), "trainee", ["SCN-003"], undefined, ALL_SHIPPED).locked
    ).toBe(false);
  });

  it("drill flip: V0 scenarios hard-lock for a fresh player, with explicit drill reasons", () => {
    for (const id of ["SCN-001", "SCN-002", "SCN-003"]) {
      const state = scenarioLockState(manifestOf(id), "observer", []);
      expect(state.locked, id).toBe(true);
      expect(state.reasons.some((r) => r.includes("drill")), id).toBe(true);
    }
  });

  it("no-softlock (path-shaped): shipped drill prereqs are zero-state earnable and open the V0 scenarios", () => {
    // Every hard drill reason on a fresh player's V0 cards must reference a
    // SHIPPED drill (earnable immediately from the menu)...
    for (const id of ["SCN-001", "SCN-002", "SCN-003"]) {
      const m = manifestOf(id);
      for (const p of m.prereqs) {
        if (p.startsWith("drill:") && !ALL_SHIPPED.includes(p)) {
          // unshipped drills must NOT lock
          const state = scenarioLockState(m, "observer", []);
          expect(state.reasons.join(" ")).not.toContain(p.replace(/^drill:/, ""));
        }
      }
    }
    // ...and completing the shipped set opens at least the V0 scenarios.
    const startable = allScenarios().filter(
      (def) => !scenarioLockState(def.manifest, "observer", [], undefined, ALL_SHIPPED).locked
    );
    expect(startable.length).toBeGreaterThanOrEqual(3);
  });
});

describe("scenarioLockState — advisories (rank, drills/lessons)", () => {
  it("an Observer sees the rank advisory on a Trainee-rated scenario", () => {
    const state = scenarioLockState(manifestOf("SCN-001"), "observer", [], undefined, ALL_SHIPPED);
    expect(state.locked).toBe(false); // rank stays advisory; drills satisfied here
    expect(state.advisories.some((a) => a.includes("Trainee"))).toBe(true);
  });

  it("a Trainee sees no rank advisory on a Trainee-rated scenario", () => {
    const state = scenarioLockState(manifestOf("SCN-001"), "trainee", []);
    expect(state.advisories.some((a) => a.includes("Designed for"))).toBe(false);
  });

  it("lessons + unshipped drills surface as a recommendation count (shipped drills now lock)", () => {
    const state = scenarioLockState(manifestOf("SCN-003"), "trainee", [], undefined, ALL_SHIPPED);
    expect(state.locked).toBe(false); // shipped drills satisfied; lessons advisory
    expect(state.advisories.some((a) => a.includes("recommended"))).toBe(true);
  });
});

describe("ProgressStore scenario completion", () => {
  it("markScenarioCompleted feeds completedScenarioIds; reset clears", () => {
    expect(ProgressStore.completedScenarioIds()).toEqual([]);
    ProgressStore.markScenarioCompleted("SCN-001");
    ProgressStore.markScenarioCompleted("SCN-001"); // idempotent
    expect(ProgressStore.completedScenarioIds()).toEqual(["SCN-001"]);
    ProgressStore.reset();
    expect(ProgressStore.completedScenarioIds()).toEqual([]);
  });
});
