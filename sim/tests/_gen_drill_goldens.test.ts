/** Digest generation for live drill micro-scenarios (GR-015..020). */
import { describe, it } from "vitest";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import { DRAWDOWN_LIVE_DRILLS, BLOWUP_LIVE_DRILLS } from "../src/drills/liveCatalog.js";

const survive: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 30, payload: { tags: ["exit"], wordCount: 15 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 320 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

function blowupActions(qty: number): PlayerAction[] {
  return [
    { type: "order_submit", ticksAfter: 25, payload: { orderId: "bu-o1", orderType: "market", side: "buy", quantity: qty, price: null, stopPrice: null } },
    { type: "advance_ticks", ticksAfter: 8, payload: { count: 80 } },
    { type: "order_submit", ticksAfter: 15, payload: { orderId: "bu-o2", orderType: "market", side: "buy", quantity: qty, price: null, stopPrice: null } },
    { type: "advance_ticks", ticksAfter: 5, payload: { count: 420 } },
    { type: "debrief_complete", ticksAfter: 0, payload: {} },
  ];
}

const BLOWUP_QTY: Record<string, number> = {
  "drill:blowup-crypto": 40,
  "drill:blowup-stocks": 55,
  "drill:blowup-forex": 80_000,
};

describe("gen drill goldens", () => {
  for (const d of DRAWDOWN_LIVE_DRILLS) {
    it(d.drillId, () => {
      const r = runScenario({
        seed: 0xD811_0001, scenario: d.scenario, accountEquity: d.startingEquity,
        actions: survive, sessionId: `golden-${d.drillId}`,
        drillSeed: { ...d.seed },
      });
      console.log(`${d.drillId} digest: ${r.digest.sha256} xp: ${r.xpSummary.total}`);
    });
  }
  for (const d of BLOWUP_LIVE_DRILLS) {
    it(d.drillId, () => {
      const r = runScenario({
        seed: 0xB10B0001, scenario: d.scenario, accountEquity: d.startingEquity,
        actions: blowupActions(BLOWUP_QTY[d.drillId] ?? 40),
        sessionId: `golden-${d.drillId}`,
      });
      console.log(`${d.drillId} digest: ${r.digest.sha256} xp: ${r.xpSummary.total}`);
    });
  }
});
