/**
 * Lesson catalog gating — GOV-W1 hard-flip integration (LESSON_SYSTEM_BRIEF §7).
 *
 * Enforces the shipped prereq DAG: foundation → beginner → intermediate per pillar.
 * Blocked lessons show a clear prereq path with process-only copy (no PnL language).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { getLesson, LESSON_CATALOG } from "../src/lessons/catalog.js";
import { lessonLockState, lessonPrereqPath, scenarioLockState } from "../src/ui/engine/gating.js";
import { getScenario } from "../src/scenarios/registry.js";
import * as ProgressStore from "../src/engine/progress.js";

const PNL_WORDS = /\b(pnl|profit|win rate|returns?)\b/i;

beforeEach(() => {
  ProgressStore.reset();
});

describe("lessonLockState — curriculum DAG", () => {
  it("F-01 is open at zero state (no prereq parent)", () => {
    const f01 = getLesson("lesson:what-a-market-is");
    expect(f01).toBeDefined();
    const state = lessonLockState(f01!, []);
    expect(state.locked).toBe(false);
    expect(state.prereqPath).toEqual([]);
  });

  it("intermediate crypto lesson locks until beginner chain parent is complete", () => {
    const ci01 = getLesson("lesson:stablecoin-peg-mechanics");
    expect(ci01).toBeDefined();
    const blocked = lessonLockState(ci01!, []);
    expect(blocked.locked).toBe(true);
    expect(blocked.prereqPath).toContain("C-B05");
    expect(blocked.reasons[0]).toContain("C-B05");
    expect(blocked.reasons[0]).toMatch(/Grid Failure Modes|C-B05/);
    expect(blocked.reasons.join(" ")).not.toMatch(PNL_WORDS);

    const cb05 = getLesson("lesson:grid-failure-modes");
    expect(cb05).toBeDefined();
    const open = lessonLockState(ci01!, [cb05!.content.id]);
    expect(open.locked).toBe(false);
  });

  it("intermediate stocks lesson locks until S-B04 is complete", () => {
    const si01 = getLesson("lesson:earnings-seasons");
    expect(si01).toBeDefined();
    const blocked = lessonLockState(si01!, []);
    expect(blocked.locked).toBe(true);
    expect(blocked.prereqPath).toContain("S-B04");
    expect(blocked.reasons.join(" ")).not.toMatch(PNL_WORDS);
  });

  it("intermediate forex lesson locks until X-B04 is complete", () => {
    const xi01 = getLesson("lesson:session-open-sweeps");
    expect(xi01).toBeDefined();
    const blocked = lessonLockState(xi01!, []);
    expect(blocked.locked).toBe(true);
    expect(blocked.prereqPath).toContain("X-B04");
    expect(blocked.reasons.join(" ")).not.toMatch(PNL_WORDS);
  });

  it("every locked lesson exposes a non-empty prereq path to a shipped parent", () => {
    for (const lesson of LESSON_CATALOG) {
      const state = lessonLockState(lesson, []);
      if (!state.locked) continue;
      expect(state.prereqPath.length, lesson.content.curriculumId).toBeGreaterThan(0);
      const parent = state.prereqPath[state.prereqPath.length - 1]!;
      expect(
        LESSON_CATALOG.some((l) => l.content.curriculumId === parent),
        parent
      ).toBe(true);
      expect(state.reasons[0]?.length ?? 0).toBeGreaterThan(10);
      expect(state.reasons.join(" ")).not.toMatch(PNL_WORDS);
    }
  });
});

describe("lessonPrereqPath — beginner chains before intermediate", () => {
  it("crypto intermediate path includes full beginner chain from foundation", () => {
    const path = lessonPrereqPath("C-I01");
    expect(path).toContain("F-03");
    expect(path).toContain("C-B01");
    expect(path).toContain("C-B05");
    expect(path.indexOf("C-B05")).toBe(path.length - 1);
  });

  it("stocks intermediate path includes S-B01..S-B04", () => {
    const path = lessonPrereqPath("S-I01");
    expect(path).toContain("F-02");
    expect(path).toContain("S-B01");
    expect(path).toContain("S-B04");
  });

  it("forex intermediate path includes X-B01..X-B04", () => {
    const path = lessonPrereqPath("X-I01");
    expect(path).toContain("F-03");
    expect(path).toContain("X-B01");
    expect(path).toContain("X-B04");
  });
});

describe("integration — scenario blocked until lesson complete", () => {
  it("SCN-001 stays locked until stablecoin lesson is marked complete", () => {
    const manifest = getScenario("SCN-001")!.manifest;
    const drills = ["drill:position-sizing-crypto", "drill:stop-placement-v1"];
    const locked = scenarioLockState(manifest, "trainee", [], undefined, drills, []);
    expect(locked.locked).toBe(true);
    expect(locked.reasons.some((r) => r.includes("Stablecoin Peg Mechanics"))).toBe(true);
    expect(locked.reasons.join(" ")).not.toMatch(PNL_WORDS);

    const open = scenarioLockState(manifest, "trainee", [], undefined, drills, [
      "lesson:stablecoin-peg-mechanics",
    ]);
    expect(open.locked).toBe(false);
  });
});
