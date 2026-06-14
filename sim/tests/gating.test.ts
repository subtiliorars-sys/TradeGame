/**
 * Scenario gating tests — pure lock-state evaluation (ui/engine/gating.ts).
 *
 * Post GOV-W1: scenario-completion, shipped drill, and shipped lesson prereqs
 * hard-lock with explicit reasons. Rank stays advisory. No-softlock is
 * path-shaped: drills from menu + lessons via the curriculum DAG from F-01.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { scenarioLockState } from "../src/ui/engine/gating.js";
import { DRILL_CATALOG } from "../src/drills/catalog.js";
import { LIVE_DRILL_CATALOG } from "../src/drills/liveCatalog.js";
import { LESSON_CATALOG } from "../src/lessons/catalog.js";
import { getScenario, allScenarios } from "../src/scenarios/registry.js";
import * as ProgressStore from "../src/engine/progress.js";

const ALL_SHIPPED_DRILLS = [
  ...DRILL_CATALOG.map((d) => d.id),
  ...LIVE_DRILL_CATALOG.map((d) => d.drillId),
];
const ALL_SHIPPED_LESSONS = LESSON_CATALOG.map((l) => l.content.id);

function manifestOf(id: string) {
  const def = getScenario(id);
  if (!def) throw new Error(`unknown scenario ${id}`);
  return def.manifest;
}

function lessonPrereqsFor(manifest: ReturnType<typeof manifestOf>): string[] {
  return manifest.prereqs.filter((p) => p.startsWith("lesson:"));
}

beforeEach(() => {
  ProgressStore.reset();
});

describe("scenarioLockState — hard locks (scenario prereqs)", () => {
  it("SCN-004 is locked until SCN-001 is completed, with an explicit reason", () => {
    const state = scenarioLockState(
      manifestOf("SCN-004"),
      "observer",
      [],
      undefined,
      ALL_SHIPPED_DRILLS,
      ALL_SHIPPED_LESSONS
    );
    expect(state.locked).toBe(true);
    expect(state.reasons).toContain("Complete SCN-001 first");
  });

  it("SCN-004 unlocks once SCN-001, drills, and lesson prereqs are complete", () => {
    const m = manifestOf("SCN-004");
    const state = scenarioLockState(
      m,
      "observer",
      ["SCN-001"],
      undefined,
      ALL_SHIPPED_DRILLS,
      lessonPrereqsFor(m)
    );
    expect(state.locked).toBe(false);
    expect(state.reasons).toHaveLength(0);
  });

  it("the V1 chain matches the authored prereqs (5→2, 6→3)", () => {
    expect(
      scenarioLockState(
        manifestOf("SCN-005"),
        "trainee",
        ["SCN-001"],
        undefined,
        ALL_SHIPPED_DRILLS,
        ALL_SHIPPED_LESSONS
      ).reasons
    ).toContain("Complete SCN-002 first");
    expect(
      scenarioLockState(
        manifestOf("SCN-006"),
        "trainee",
        ["SCN-003"],
        undefined,
        ALL_SHIPPED_DRILLS,
        ALL_SHIPPED_LESSONS
      ).locked
    ).toBe(false);
  });

  it("drill flip: V0 scenarios hard-lock for a fresh player, with explicit drill reasons", () => {
    for (const id of ["SCN-001", "SCN-002", "SCN-003"]) {
      const state = scenarioLockState(manifestOf(id), "observer", []);
      expect(state.locked, id).toBe(true);
      expect(state.reasons.some((r) => r.includes("drill")), id).toBe(true);
    }
  });

  it("lesson flip: V0 scenarios hard-lock until shipped lesson prereqs are complete", () => {
    for (const id of ["SCN-001", "SCN-002", "SCN-003"]) {
      const m = manifestOf(id);
      const withDrillsOnly = scenarioLockState(m, "observer", [], undefined, ALL_SHIPPED_DRILLS);
      expect(withDrillsOnly.locked, id).toBe(true);
      expect(withDrillsOnly.reasons.some((r) => r.includes("lesson")), id).toBe(true);
      const open = scenarioLockState(
        m,
        "observer",
        [],
        undefined,
        ALL_SHIPPED_DRILLS,
        lessonPrereqsFor(m)
      );
      expect(open.locked, id).toBe(false);
    }
  });

  it("drill flip: live drawdown/blowup IDs hard-lock when listed on a scenario prereq", () => {
    const fakeManifest = {
      id: "SCN-TEST",
      minRank: "Observer",
      prereqs: ["drill:drawdown-survival-crypto"],
    } as import("../src/scenarios/types.js").ScenarioManifest;
    const locked = scenarioLockState(fakeManifest, "observer", [], undefined, []);
    expect(locked.locked).toBe(true);
    expect(locked.reasons.some((r) => r.includes("drawdown"))).toBe(true);
    const open = scenarioLockState(
      fakeManifest,
      "observer",
      [],
      undefined,
      ["drill:drawdown-survival-crypto"]
    );
    expect(open.locked).toBe(false);
  });

  it("no-softlock (path-shaped): hard locks reference only shipped drills and lessons", () => {
    for (const id of ["SCN-001", "SCN-002", "SCN-003"]) {
      const m = manifestOf(id);
      const state = scenarioLockState(m, "observer", []);
      for (const p of m.prereqs) {
        if (p.startsWith("drill:") && !ALL_SHIPPED_DRILLS.includes(p)) {
          expect(state.reasons.join(" ")).not.toContain(p.replace(/^drill:/, ""));
        }
        if (p.startsWith("lesson:")) {
          expect(ALL_SHIPPED_LESSONS, p).toContain(p);
        }
      }
    }
    const startable = allScenarios().filter(
      (def) =>
        !scenarioLockState(
          def.manifest,
          "observer",
          [],
          undefined,
          ALL_SHIPPED_DRILLS,
          ALL_SHIPPED_LESSONS
        ).locked
    );
    expect(startable.length).toBeGreaterThanOrEqual(3);
  });
});

describe("scenarioLockState — advisories (rank)", () => {
  it("an Observer sees the rank advisory on a Trainee-rated scenario when drills+lessons satisfied", () => {
    const m = manifestOf("SCN-001");
    const state = scenarioLockState(
      m,
      "observer",
      [],
      undefined,
      ALL_SHIPPED_DRILLS,
      lessonPrereqsFor(m)
    );
    expect(state.locked).toBe(false);
    expect(state.advisories.some((a) => a.includes("Trainee"))).toBe(true);
  });

  it("a Trainee sees no rank advisory on a Trainee-rated scenario", () => {
    const state = scenarioLockState(manifestOf("SCN-001"), "trainee", []);
    expect(state.advisories.some((a) => a.includes("Designed for"))).toBe(false);
  });

  it("unshipped drill/lesson IDs stay advisory-only (never a dead-end hard lock)", () => {
    const fakeManifest = {
      id: "SCN-FUTURE",
      minRank: "Observer",
      prereqs: ["drill:future-unshipped-drill", "lesson:future-unshipped-lesson"],
    } as import("../src/scenarios/types.js").ScenarioManifest;
    const state = scenarioLockState(fakeManifest, "observer", [], undefined, ALL_SHIPPED_DRILLS);
    expect(state.locked).toBe(false);
    expect(state.advisories.some((a) => a.includes("recommended"))).toBe(true);
  });
});

describe("ProgressStore scenario completion", () => {
  it("markScenarioCompleted feeds completedScenarioIds; reset clears", () => {
    expect(ProgressStore.completedScenarioIds()).toEqual([]);
    ProgressStore.markScenarioCompleted("SCN-001");
    ProgressStore.markScenarioCompleted("SCN-001");
    expect(ProgressStore.completedScenarioIds()).toEqual(["SCN-001"]);
    ProgressStore.reset();
    expect(ProgressStore.completedScenarioIds()).toEqual([]);
  });
});
