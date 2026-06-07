/**
 * Scenario gating tests — pure lock-state evaluation (ui/engine/gating.ts)
 * plus ProgressStore scenario-completion wiring (wave D).
 *
 * Design under test: scenario-completion prereqs HARD-lock with explicit
 * reasons; rank + drill/lesson requirements are ADVISORY until the drill
 * system ships (hard-enforcing rank today would softlock a fresh Observer —
 * every scenario authors minRank Trainee and the XP on-ramp is drills).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { scenarioLockState } from "../src/ui/engine/gating.js";
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
    const state = scenarioLockState(manifestOf("SCN-004"), "observer", []);
    expect(state.locked).toBe(true);
    expect(state.reasons).toContain("Complete SCN-001 first");
  });

  it("SCN-004 unlocks once SCN-001 is in the completed set", () => {
    const state = scenarioLockState(manifestOf("SCN-004"), "observer", ["SCN-001"]);
    expect(state.locked).toBe(false);
    expect(state.reasons).toHaveLength(0);
  });

  it("the V1 chain matches the authored prereqs (5→2, 6→3)", () => {
    expect(
      scenarioLockState(manifestOf("SCN-005"), "trainee", ["SCN-001"]).reasons
    ).toContain("Complete SCN-002 first");
    expect(
      scenarioLockState(manifestOf("SCN-006"), "trainee", ["SCN-003"]).locked
    ).toBe(false);
  });

  it("V0 scenarios have no scenario prereqs — never hard-locked", () => {
    for (const id of ["SCN-001", "SCN-002", "SCN-003"]) {
      const state = scenarioLockState(manifestOf(id), "observer", []);
      expect(state.locked, `${id} must be startable by a fresh player`).toBe(false);
    }
  });

  it("a fresh player always has at least one startable scenario (no softlock)", () => {
    const startable = allScenarios().filter(
      (def) => !scenarioLockState(def.manifest, "observer", []).locked
    );
    expect(startable.length).toBeGreaterThan(0);
  });
});

describe("scenarioLockState — advisories (rank, drills/lessons)", () => {
  it("an Observer sees the rank advisory on a Trainee-rated scenario", () => {
    const state = scenarioLockState(manifestOf("SCN-001"), "observer", []);
    expect(state.locked).toBe(false); // advisory, not a lock
    expect(state.advisories.some((a) => a.includes("Trainee"))).toBe(true);
  });

  it("a Trainee sees no rank advisory on a Trainee-rated scenario", () => {
    const state = scenarioLockState(manifestOf("SCN-001"), "trainee", []);
    expect(state.advisories.some((a) => a.includes("Designed for"))).toBe(false);
  });

  it("drill/lesson prereqs surface as a recommendation count, never a lock", () => {
    const state = scenarioLockState(manifestOf("SCN-003"), "trainee", []);
    expect(state.locked).toBe(false);
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
