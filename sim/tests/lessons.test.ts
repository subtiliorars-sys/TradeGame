/**
 * Lesson system wave-1 tests — catalog invariants, prereq-ID alignment,
 * honest-XP awards, posture sweep (LESSON_SYSTEM_BRIEF §2-§7).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { LESSON_CATALOG, getLesson, awardLesson, LESSON_XP } from "../src/lessons/catalog.js";
import * as ProgressStore from "../src/engine/progress.js";
import { allScenarios } from "../src/scenarios/registry.js";
import { currentRank, CANONICAL_LADDER } from "../src/engine/rank.js";

beforeEach(() => {
  ProgressStore.reset();
});

describe("catalog invariants", () => {
  it("ships the nine wave-1 lessons", () => {
    expect(LESSON_CATALOG).toHaveLength(9);
  });

  it("every scenario lesson-prereq resolves to a shipped lesson (wave-1 covers the live IDs)", () => {
    const shipped = new Set(LESSON_CATALOG.map((l) => l.content.id));
    for (const def of allScenarios()) {
      for (const p of def.manifest.prereqs) {
        if (p.startsWith("lesson:")) {
          expect(shipped.has(p), `${def.manifest.id} prereq ${p} has no shipped lesson`).toBe(true);
        }
      }
    }
  });

  it("XP is fixed by length tier (GDD §7): short 15 / standard 25", () => {
    for (const l of LESSON_CATALOG) {
      expect(l.xp, l.content.id).toBe(LESSON_XP[l.tier]);
    }
  });

  it("every lesson's CTA targets a registered scenario (lesson-then-immediately-do)", () => {
    const ids = new Set(allScenarios().map((d) => d.manifest.id));
    for (const l of LESSON_CATALOG) {
      expect(l.content.cta.kind).toBe("scenario");
      expect(ids.has(l.content.cta.id), `${l.content.id} CTA → ${l.content.cta.id}`).toBe(true);
      expect(l.content.cta.line.length).toBeGreaterThan(0);
    }
  });

  it("every lesson has pages, a process check, and provenance", () => {
    for (const l of LESSON_CATALOG) {
      expect(l.content.pages.length, l.content.id).toBeGreaterThanOrEqual(2);
      expect(l.content.processCheck.length).toBeGreaterThan(10);
      expect(l.content.curriculumId).toMatch(/^[CSXF]-[BI]\d\d$/);
    }
  });
});

describe("posture sweep — lesson copy carries no directives", () => {
  it("no directive/signal language in any page or process check", () => {
    for (const l of LESSON_CATALOG) {
      const text = (l.content.pages.flat().join(" ") + " " + l.content.processCheck).toLowerCase();
      // "guaranteed" alone is legitimate in risk warnings ("stability is
      // not guaranteed") — the posture rule targets guaranteed-PROFIT claims.
      for (const banned of ["you should buy", "you should sell", "buy now", "sell now", "guaranteed return", "guaranteed profit", "guaranteed gain", "time to buy", "signal to enter"]) {
        expect(text, `${l.content.id} contains "${banned}"`).not.toContain(banned);
      }
    }
  });
});

describe("awardLesson — honest-XP", () => {
  it("first completion pays the tier XP; re-reads pay nothing", () => {
    const l = getLesson("lesson:forex-session-windows")!;
    expect(awardLesson(l)).toBe(15); // short tier
    expect(awardLesson(l)).toBe(0);
    expect(ProgressStore.xpTotal()).toBe(15);
    expect(ProgressStore.completedLessonIds()).toContain(l.content.id);
  });

  it("a lesson completion that crosses a rank threshold fires the rank-up marker", () => {
    // Satisfy Trainee's drill gate, park XP just below the threshold.
    for (const id of [
      "drill:position-sizing-crypto",
      "drill:position-sizing-stocks",
      "drill:position-sizing-forex",
      "drill:stop-placement-v1",
    ]) ProgressStore.markDrillCompleted(id);
    ProgressStore.addXp(190);
    ProgressStore.clearRankUp();
    const l = getLesson("lesson:earnings-seasons")!; // standard 25 → crosses 200
    awardLesson(l);
    const up = ProgressStore.lastRankUp();
    expect(up?.to.rankId).toBe("trainee");
  });

  it("all nine lessons = 205 XP (2 short + 7 standard); rank respects the live ladder's Trainee gate", () => {
    for (const l of LESSON_CATALOG) awardLesson(l);
    expect(ProgressStore.xpTotal()).toBe(2 * 15 + 7 * 25);
    // Ladder-aware: pre-drill-gate branches rank Trainee on XP alone; once
    // the drill-gate flip (PR #18 line) merges, reading alone stays Observer.
    const trainee = CANONICAL_LADDER.find((r) => r.rankId === "trainee");
    const expected = (trainee?.drillsRequired.length ?? 0) > 0 ? "observer" : "trainee";
    expect(currentRank(ProgressStore.xpTotal(), ProgressStore.completedDrillIds()).rank.rankId).toBe(expected);
  });
});
