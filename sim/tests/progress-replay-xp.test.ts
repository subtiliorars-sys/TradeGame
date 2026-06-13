/**
 * PERS-W1 — first-clear scenario/drill XP; replays may still earn session_reviewed.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as ProgressStore from "../src/engine/progress.js";

beforeEach(() => {
  ProgressStore.reset();
});

describe("awardScenarioDebriefXp — first clear vs replay", () => {
  it("first clear grants the full rubric total and marks completion", () => {
    const rows = [
      { metricId: "patience_observation", xpEarned: 135 },
      { metricId: "debrief_completed", xpEarned: 30 },
    ];
    const granted = ProgressStore.awardScenarioDebriefXp("SCN-001", 165, rows);
    expect(granted).toBe(165);
    expect(ProgressStore.xpTotal()).toBe(165);
    expect(ProgressStore.completedScenarioIds()).toContain("SCN-001");
  });

  it("replay skips base rubric XP but still pays session_reviewed", () => {
    ProgressStore.awardScenarioDebriefXp("SCN-001", 165, [
      { metricId: "patience_observation", xpEarned: 135 },
      { metricId: "debrief_completed", xpEarned: 30 },
    ]);
    expect(ProgressStore.xpTotal()).toBe(165);

    const granted = ProgressStore.awardScenarioDebriefXp("SCN-001", 40, [
      { metricId: "session_reviewed", xpEarned: 10 },
      { metricId: "debrief_completed", xpEarned: 30 },
    ]);
    expect(granted).toBe(10);
    expect(ProgressStore.xpTotal()).toBe(175);
  });

  it("replay with no replay-only metrics grants zero XP", () => {
    ProgressStore.awardScenarioDebriefXp("SCN-002", 30, [
      { metricId: "debrief_completed", xpEarned: 30 },
    ]);
    const granted = ProgressStore.awardScenarioDebriefXp("SCN-002", 30, [
      { metricId: "debrief_completed", xpEarned: 30 },
    ]);
    expect(granted).toBe(0);
    expect(ProgressStore.xpTotal()).toBe(30);
  });
});

describe("completeDrill — first clear XP only", () => {
  it("second completion does not stack XP", () => {
    ProgressStore.completeDrill("drill:position-sizing-crypto", 25);
    expect(ProgressStore.xpTotal()).toBe(25);
    ProgressStore.completeDrill("drill:position-sizing-crypto", 25);
    expect(ProgressStore.xpTotal()).toBe(25);
    expect(ProgressStore.completedDrillIds()).toEqual([
      "drill:position-sizing-crypto",
    ]);
  });
});

describe("completeLesson — first clear XP only", () => {
  it("second completion does not stack XP", () => {
    ProgressStore.completeLesson("lesson:c-i01", 15);
    expect(ProgressStore.xpTotal()).toBe(15);
    ProgressStore.completeLesson("lesson:c-i01", 15);
    expect(ProgressStore.xpTotal()).toBe(15);
  });
});
