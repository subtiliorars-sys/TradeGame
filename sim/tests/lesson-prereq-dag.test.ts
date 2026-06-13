/**
 * Lesson prereq DAG validation — LESSON_SYSTEM_BRIEF §7.4 red-team guard.
 */

import { describe, it, expect } from "vitest";
import { LESSON_CATALOG } from "../src/lessons/catalog.js";
import { PREREQ_BY_CURRICULUM, detectPrereqCycle } from "../src/lessons/prereqGraph.js";

describe("lesson prereq graph (shipped catalog)", () => {
  it("every shipped lesson with a prereq edge has that parent in the catalog", () => {
    const curriculumIds = new Set(LESSON_CATALOG.map((l) => l.content.curriculumId));
    for (const lesson of LESSON_CATALOG) {
      const parent = PREREQ_BY_CURRICULUM[lesson.content.curriculumId];
      if (parent === null || parent === undefined) continue;
      expect(curriculumIds.has(parent), `${lesson.content.curriculumId} → ${parent}`).toBe(true);
    }
  });

  it("prereq graph has no cycles among shipped curriculum IDs", () => {
    const shipped = new Set(LESSON_CATALOG.map((l) => l.content.curriculumId));
    const edges: Record<string, string | null> = {};
    for (const id of shipped) {
      edges[id] = PREREQ_BY_CURRICULUM[id] ?? null;
    }
    const cycle = detectPrereqCycle(edges);
    expect(cycle, cycle ? `cycle: ${cycle.join(" → ")}` : "").toBeNull();
  });

  it("foundation chain F-01..F-10 is fully defined", () => {
    for (let n = 1; n <= 10; n++) {
      const id = `F-${String(n).padStart(2, "0")}`;
      expect(PREREQ_BY_CURRICULUM[id], id).toBeDefined();
    }
    expect(PREREQ_BY_CURRICULUM["F-01"]).toBeNull();
    expect(PREREQ_BY_CURRICULUM["F-10"]).toBe("F-09");
  });
});
