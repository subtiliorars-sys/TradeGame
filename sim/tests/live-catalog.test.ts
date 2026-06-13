/**
 * Drawdown Survival drill defs ×3 + Blow Up ×3 — geometry sanity, determinism,
 * and end-to-end predicate / award evaluation.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  LIVE_DRILL_CATALOG,
  DRAWDOWN_LIVE_DRILLS,
  BLOWUP_LIVE_DRILLS,
  getLiveDrill,
  awardLiveDrill,
  awardBlowupDrill,
} from "../src/drills/liveCatalog.js";
import { evaluateDrawdownSurvival } from "../src/drills/livePredicates.js";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import * as ProgressStore from "../src/engine/progress.js";
import { currentRank } from "../src/engine/rank.js";

describe("drawdown catalog geometry", () => {
  it("three markets, Intermediate/55, authored drawdown bands", () => {
    expect(DRAWDOWN_LIVE_DRILLS).toHaveLength(3);
    for (const d of DRAWDOWN_LIVE_DRILLS) {
      expect(d.xp).toBe(55);
      const m = d.scenario.manifest;
      expect(d.seed.side).toBe("buy");
      expect(d.seed.fillPrice).toBeGreaterThan(m.startPrice);
      expect(d.seed.stopPrice).toBeLessThan(m.startPrice);
      const dd = (d.seed.fillPrice - m.startPrice) / d.seed.fillPrice;
      if (d.market === "forex") {
        expect(dd).toBeGreaterThan(0.005);
        expect(dd).toBeLessThan(0.02);
      } else {
        expect(dd).toBeGreaterThan(0.06);
        expect(dd).toBeLessThan(0.1);
      }
      expect(m.xpRubric).toHaveLength(0);
    }
  });
});

describe("blowup catalog geometry", () => {
  it("three markets, Intermediate, 40+10 XP, no seed", () => {
    expect(BLOWUP_LIVE_DRILLS).toHaveLength(3);
    for (const d of BLOWUP_LIVE_DRILLS) {
      expect(d.xp).toBe(40);
      expect(d.bonusXp).toBe(10);
      expect(d.startingEquity).toBe(10_000);
      expect(d.scenario.manifest.xpRubric).toHaveLength(0);
      expect(d.scenario.manifest.durationMs).toBe(600_000);
    }
  });
});

describe("each drawdown drill: deterministic + predicates evaluate end-to-end", () => {
  const surviveActions: PlayerAction[] = [
    { type: "journal_entry", ticksAfter: 30, payload: { tags: ["exit"], wordCount: 15 } },
    { type: "advance_ticks", ticksAfter: 0, payload: { count: 320 } },
    { type: "debrief_complete", ticksAfter: 0, payload: {} },
  ];

  for (const d of DRAWDOWN_LIVE_DRILLS) {
    it(`${d.drillId}: clean survival passes all three predicates; digest stable`, () => {
      const config = {
        seed: 1_000_001,
        scenario: d.scenario,
        accountEquity: d.startingEquity,
        actions: surviveActions,
        sessionId: `live-${d.drillId}`,
        drillSeed: { ...d.seed },
      };
      const a = runScenario(config);
      const b = runScenario(config);
      expect(a.digest.sha256).toBe(b.digest.sha256);

      const evald = evaluateDrawdownSurvival(a.log.entries, d.seed);
      expect(evald.pass, evald.results.filter((r) => !r.pass).map((r) => r.predicateId).join()).toBe(true);
      expect(a.xpSummary.total).toBe(0);
    });

    it(`${d.drillId}: a DCA attempt fails exactly the proxy predicate`, () => {
      const result = runScenario({
        seed: 1_000_001,
        scenario: d.scenario,
        accountEquity: d.startingEquity,
        sessionId: `live-${d.drillId}-dca`,
        drillSeed: { ...d.seed },
        actions: [
          { type: "order_submit", ticksAfter: 40, payload: { orderId: "dca", orderType: "market", side: "buy", quantity: d.seed.quantity, price: null, stopPrice: null } },
          { type: "journal_entry", ticksAfter: 5, payload: { tags: ["exit"], wordCount: 12 } },
          { type: "advance_ticks", ticksAfter: 0, payload: { count: 300 } },
          { type: "debrief_complete", ticksAfter: 0, payload: {} },
        ],
      });
      const evald = evaluateDrawdownSurvival(result.log.entries, d.seed);
      expect(evald.pass).toBe(false);
      expect(evald.results.find((r) => r.predicateId === "no_size_increase_on_seeded_side")?.pass).toBe(false);
      expect(evald.results.find((r) => r.predicateId === "seeded_stop_maintained")?.pass).toBe(true);
    });
  }

  it("getLiveDrill resolves by ID", () => {
    expect(getLiveDrill("drill:drawdown-survival-forex")?.market).toBe("forex");
    expect(getLiveDrill("drill:blowup-crypto")?.kind).toBe("blowup");
    expect(getLiveDrill("drill:nope")).toBeUndefined();
  });
});

describe("awardLiveDrill (drawdown)", () => {
  beforeEach(() => ProgressStore.reset());

  it("pays 55 once; repeat passes pay 0; misses pay nothing at all", () => {
    const d = DRAWDOWN_LIVE_DRILLS[0]!;
    expect(awardLiveDrill(d, false)).toBeNull();
    expect(ProgressStore.xpTotal()).toBe(0);
    expect(awardLiveDrill(d, true)).toBe(55);
    expect(awardLiveDrill(d, true)).toBe(0);
    expect(ProgressStore.xpTotal()).toBe(55);
    expect(ProgressStore.completedDrillIds()).toContain(d.drillId);
  });

  it("live-drill IDs share the one drill namespace — no collision with input drills", async () => {
    const { DRILL_CATALOG } = await import("../src/drills/catalog.js");
    const inputIds = new Set(DRILL_CATALOG.map((d) => d.id));
    for (const ld of LIVE_DRILL_CATALOG) {
      expect(inputIds.has(ld.drillId), ld.drillId).toBe(false);
    }
  });
});

describe("awardBlowupDrill + awardBonus", () => {
  beforeEach(() => ProgressStore.reset());

  it("pays 40 base on debrief; +10 bonus once when mechanism correct", () => {
    const d = BLOWUP_LIVE_DRILLS[0]!;
    const first = awardBlowupDrill(d, true);
    expect(first.base).toBe(40);
    expect(first.bonus).toBe(10);
    expect(ProgressStore.xpTotal()).toBe(50);

    const repeat = awardBlowupDrill(d, true);
    expect(repeat.base).toBe(0);
    expect(repeat.bonus).toBe(0);
    expect(ProgressStore.xpTotal()).toBe(50);
  });

  it("awardBonus is idempotent per drill ID", () => {
    expect(ProgressStore.awardBonus("drill:blowup-stocks", 10)).toBe(10);
    expect(ProgressStore.awardBonus("drill:blowup-stocks", 10)).toBe(0);
  });
});

describe("catalog size", () => {
  it("six live drills total (3 drawdown + 3 blowup)", () => {
    expect(LIVE_DRILL_CATALOG).toHaveLength(6);
  });
});
