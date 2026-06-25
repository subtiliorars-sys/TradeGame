/**
 * Lesson system tests — catalog invariants, prereq-ID alignment,
 * honest-XP awards, posture sweep (LESSON_SYSTEM_BRIEF §2-§7).
 * Foundation F-01–F-10, wave 1 (nine scenario-linked), wave 2 intermediate (six),
 * LESS-W7 stocks beginner (four), LESS-W8 forex beginner (two).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { LESSON_CATALOG, getLesson, awardLesson, LESSON_XP } from "../src/lessons/catalog.js";
import * as ProgressStore from "../src/engine/progress.js";
import { allScenarios } from "../src/scenarios/registry.js";
import { currentRank, CANONICAL_LADDER } from "../src/engine/rank.js";

const WAVE1_IDS = new Set([
  "lesson:stablecoin-peg-mechanics",
  "lesson:liquidity-pools-impermanent-loss",
  "lesson:earnings-seasons",
  "lesson:earnings-gaps-form-and-fail",
  "lesson:index-rebalancing-mechanics",
  "lesson:forex-session-windows",
  "lesson:spreads-cost-of-trading",
  "lesson:session-open-sweeps",
  "lesson:high-impact-news-events",
]);

const WAVE2_INTERMEDIATE_IDS = new Set([
  "lesson:flash-crash-anatomy",
  "lesson:volatility-regimes",
  "lesson:sector-rotation",
  "lesson:dividends",
  "lesson:carry-concept",
  "lesson:why-retail-forex-loses",
]);

const CRYPTO_BEGINNER_IDS = new Set([
  "lesson:spot-mechanics-crypto",
  "lesson:wallets-and-custody",
  "lesson:crypto-sessions-volatility",
  "lesson:grid-strategies-how-they-work",
  "lesson:grid-failure-modes",
]);

const STOCKS_BEGINNER_IDS = new Set([
  "lesson:stocks-market-structure",
  "lesson:etfs-vs-single-names",
  "lesson:long-term-vs-swing",
  "lesson:index-investing-math",
]);

const FOREX_BEGINNER_IDS = new Set([
  "lesson:pairs-quotes-pips",
  "lesson:forex-leverage-bluntly",
  "lesson:forex-session-windows",
  "lesson:spreads-cost-of-trading",
]);

beforeEach(() => {
  ProgressStore.reset();
});

describe("catalog invariants", () => {
  it("ships foundation (ten) + three beginner tracks (thirteen) + wave-1 (nine) + wave-2 intermediate (six) lessons", () => {
    expect(LESSON_CATALOG).toHaveLength(36);
    const curriculumIds = new Set(LESSON_CATALOG.map((l) => l.content.curriculumId));
    for (let n = 1; n <= 10; n++) {
      const fid = `F-${String(n).padStart(2, "0")}`;
      expect(curriculumIds.has(fid), fid).toBe(true);
    }
    for (const id of CRYPTO_BEGINNER_IDS) {
      expect(LESSON_CATALOG.some((l) => l.content.id === id), id).toBe(true);
    }
    for (const id of STOCKS_BEGINNER_IDS) {
      expect(LESSON_CATALOG.some((l) => l.content.id === id), id).toBe(true);
    }
    for (const id of FOREX_BEGINNER_IDS) {
      expect(LESSON_CATALOG.some((l) => l.content.id === id), id).toBe(true);
    }
    for (const id of WAVE1_IDS) {
      expect(LESSON_CATALOG.some((l) => l.content.id === id), id).toBe(true);
    }
    for (const id of WAVE2_INTERMEDIATE_IDS) {
      expect(LESSON_CATALOG.some((l) => l.content.id === id), id).toBe(true);
    }
  });

  it("every scenario lesson-prereq resolves to a shipped lesson", () => {
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

  it("every lesson CTA targets a registered scenario or drill", () => {
    const scenarioIds = new Set(allScenarios().map((d) => d.manifest.id));
    for (const l of LESSON_CATALOG) {
      expect(l.content.cta.line.length).toBeGreaterThan(0);
      if (l.content.cta.kind === "scenario") {
        expect(scenarioIds.has(l.content.cta.id), `${l.content.id} CTA → ${l.content.cta.id}`).toBe(true);
      } else {
        expect(l.content.cta.id.startsWith("drill:"), l.content.id).toBe(true);
      }
    }
  });

  it("scenario-linked lessons still use scenario CTAs (lesson-then-immediately-do)", () => {
    const scenarioLinked = new Set(
      allScenarios().flatMap((d) => d.manifest.prereqs.filter((p) => p.startsWith("lesson:")))
    );
    for (const l of LESSON_CATALOG) {
      if (scenarioLinked.has(l.content.id)) {
        expect(l.content.cta.kind, l.content.id).toBe("scenario");
      }
    }
  });

  it("every lesson has pages, a process check, and provenance", () => {
    for (const l of LESSON_CATALOG) {
      expect(l.content.pages.length, l.content.id).toBeGreaterThanOrEqual(2);
      expect(l.content.processCheck.length).toBeGreaterThan(10);
      expect(l.content.curriculumId).toMatch(/^(F-\d\d|[CSX]-[BI]\d\d)$/);
    }
  });

  it("crypto beginner lessons carry C-B curriculum provenance", () => {
    for (const l of LESSON_CATALOG) {
      if (!CRYPTO_BEGINNER_IDS.has(l.content.id)) continue;
      expect(l.content.curriculumId).toMatch(/^C-B\d\d$/);
      expect(l.content.pages.length).toBeGreaterThanOrEqual(2);
      expect(l.content.processCheck.length).toBeGreaterThan(10);
    }
  });

  it("stocks beginner lessons carry S-B curriculum provenance", () => {
    for (const l of LESSON_CATALOG) {
      if (!STOCKS_BEGINNER_IDS.has(l.content.id)) continue;
      expect(l.content.curriculumId).toMatch(/^S-B\d\d$/);
      expect(l.content.pages.length).toBeGreaterThanOrEqual(2);
      expect(l.content.processCheck.length).toBeGreaterThan(10);
    }
  });

  it("forex beginner chain includes X-B01/X-B02 with standard tier", () => {
    for (const id of ["lesson:pairs-quotes-pips", "lesson:forex-leverage-bluntly"] as const) {
      const l = LESSON_CATALOG.find((x) => x.content.id === id)!;
      expect(l.content.curriculumId).toMatch(/^X-B0[12]$/);
      expect(l.tier).toBe("standard");
    }
  });

  it("wave-2 intermediate lessons carry curriculum provenance (C/S/X-I tier)", () => {
    for (const l of LESSON_CATALOG) {
      if (!WAVE2_INTERMEDIATE_IDS.has(l.content.id)) continue;
      expect(l.content.curriculumId).toMatch(/^[CSX]-I\d\d$/);
      expect(l.content.pages.length).toBeGreaterThanOrEqual(2);
      expect(l.content.processCheck.length).toBeGreaterThan(10);
    }
  });

  it("C-I03 ships one ungated lesson drill card with three coached options", () => {
    const lesson = getLesson("lesson:liquidity-pools-impermanent-loss")!;
    const cards = lesson.content.drillCards ?? [];
    expect(cards).toHaveLength(1);

    const card = cards[0];
    expect(card.question).toContain("GLIMMER");
    expect(card.options).toHaveLength(3);
    expect(card.options.filter((o) => o.correct)).toHaveLength(1);
    for (const option of card.options) {
      expect(option.label.length, option.id).toBeGreaterThan(10);
      expect(option.feedback.length, option.id).toBeGreaterThan(30);
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

  it("lesson drill cards avoid dollar-PnL framing and directive language", () => {
    for (const l of LESSON_CATALOG) {
      for (const card of l.content.drillCards ?? []) {
        const text = [
          card.question,
          ...card.options.flatMap((o) => [o.label, o.feedback]),
        ].join(" ").toLowerCase();
        expect(text, `${l.content.id} card ${card.id} uses dollar framing`).not.toContain("$");
        for (const banned of ["you should buy", "you should sell", "buy now", "sell now", "signal to enter", "signal to exit"]) {
          expect(text, `${l.content.id} card ${card.id} contains "${banned}"`).not.toContain(banned);
        }
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

  it("all thirty-six lessons = 870 XP (3 short + 33 standard); rank respects the live ladder's Trainee gate", () => {
    for (const l of LESSON_CATALOG) awardLesson(l);
    expect(ProgressStore.xpTotal()).toBe(3 * 15 + 33 * 25);
    // Ladder-aware: pre-drill-gate branches rank Trainee on XP alone; once
    // the drill-gate flip (PR #18 line) merges, reading alone stays Observer.
    const trainee = CANONICAL_LADDER.find((r) => r.rankId === "trainee");
    const expected = (trainee?.drillsRequired.length ?? 0) > 0 ? "observer" : "trainee";
    expect(currentRank(ProgressStore.xpTotal(), ProgressStore.completedDrillIds()).rank.rankId).toBe(expected);
  });
});
