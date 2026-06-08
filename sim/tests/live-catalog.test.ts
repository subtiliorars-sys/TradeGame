/**
 * Drawdown Survival drill defs ×3 markets — geometry sanity, determinism,
 * and end-to-end predicate evaluation over each really-seeded session.
 */

import { describe, it, expect } from "vitest";
import { LIVE_DRILL_CATALOG, getLiveDrill } from "../src/drills/liveCatalog.js";
import { evaluateDrawdownSurvival } from "../src/drills/livePredicates.js";
import { runScenario, type PlayerAction } from "../src/harness/run.js";

describe("catalog geometry", () => {
  it("three markets, Intermediate/55, authored drawdown bands", () => {
    expect(LIVE_DRILL_CATALOG).toHaveLength(3);
    for (const d of LIVE_DRILL_CATALOG) {
      expect(d.xp).toBe(55);
      const m = d.scenario.manifest;
      // Seeded long above start = inherited drawdown from tick 0.
      expect(d.seed.side).toBe("buy");
      expect(d.seed.fillPrice).toBeGreaterThan(m.startPrice);
      // Stop strictly below start: survivable room AND real protection.
      expect(d.seed.stopPrice).toBeLessThan(m.startPrice);
      // Drawdown depth in the authored band (crypto/stocks ~8%, fx ~1%).
      const dd = (d.seed.fillPrice - m.startPrice) / d.seed.fillPrice;
      if (d.market === "forex") {
        expect(dd).toBeGreaterThan(0.005);
        expect(dd).toBeLessThan(0.02);
      } else {
        expect(dd).toBeGreaterThan(0.06);
        expect(dd).toBeLessThan(0.1);
      }
      // One-XP-book: micro-scenarios must emit NOTHING via scenario scoring.
      expect(m.xpRubric).toHaveLength(0);
    }
  });
});

describe("each drill: deterministic + predicates evaluate end-to-end", () => {
  const surviveActions: PlayerAction[] = [
    { type: "journal_entry", ticksAfter: 30, payload: { tags: ["exit"], wordCount: 15 } },
    { type: "advance_ticks", ticksAfter: 0, payload: { count: 320 } },
    { type: "debrief_complete", ticksAfter: 0, payload: {} },
  ];

  for (const d of LIVE_DRILL_CATALOG) {
    it(`${d.drillId}: clean survival passes all three predicates; digest stable`, () => {
      const config = {
        seed: 1_000_001,
        scenario: d.scenario,
        accountEquity: 10_000,
        actions: surviveActions,
        sessionId: `live-${d.drillId}`,
        drillSeed: {
          entryOrderId: d.seed.entryOrderId,
          stopOrderId: d.seed.stopOrderId,
          side: d.seed.side,
          quantity: d.seed.quantity,
          fillPrice: d.seed.fillPrice,
          stopPrice: d.seed.stopPrice,
        },
      };
      const a = runScenario(config);
      const b = runScenario(config);
      expect(a.digest.sha256).toBe(b.digest.sha256);

      const evald = evaluateDrawdownSurvival(a.log.entries, d.seed);
      expect(evald.pass, evald.results.filter((r) => !r.pass).map((r) => r.predicateId).join()).toBe(true);

      // One-XP-book: the empty rubric emitted zero scenario XP.
      expect(a.xpSummary.total).toBe(0);
    });

    it(`${d.drillId}: a DCA attempt fails exactly the proxy predicate`, () => {
      const result = runScenario({
        seed: 1_000_001,
        scenario: d.scenario,
        accountEquity: 10_000,
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
    expect(getLiveDrill("drill:nope")).toBeUndefined();
  });
});
