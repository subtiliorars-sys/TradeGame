/**
 * GR-015..017 — drawdown drill goldens; GR-018..020 — blowup drill goldens.
 * Locks seeded / scripted session byte-streams and the zero-scenario-XP invariant.
 */

import { describe, it, expect } from "vitest";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import {
  DRAWDOWN_LIVE_DRILLS,
  BLOWUP_LIVE_DRILLS,
} from "../src/drills/liveCatalog.js";
import { evaluateDrawdownSurvival } from "../src/drills/livePredicates.js";

const DRAWDOWN_GOLDEN: Record<string, string> = {
  "drill:drawdown-survival-crypto": "fe6eed7abe256173c623efc2f00df1fba183b8c6d99cf5fe4cc552f3588b9b86",
  "drill:drawdown-survival-stocks": "271ebc179a20504c7ef6214a1370f8871f51865ebc930b263b92d6dc9e2ed95d",
  "drill:drawdown-survival-forex": "a1a0c355b279064329d7e2da079c38f018c562450822d946af4b507f9f4d8662",
};

// Populated from _gen_drill_goldens.test.ts output.
const BLOWUP_GOLDEN: Record<string, string> = {
  "drill:blowup-crypto": "ad252975015b2823ab57c6a399a31551264e9a5b7d08100a5d7d123ada4c1c10",
  "drill:blowup-stocks": "3f44e210f9835a815bac610352a11bb6ae8265d2d8d9add8d4fb16c50c211ed0",
  "drill:blowup-forex": "74b75258d7fa2510ccd82b58c665b0ea5d24974532953553ac8f28dc93910f0f",
};

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

describe("GR-015..017: drawdown drill micro-scenario goldens", () => {
  for (const d of DRAWDOWN_LIVE_DRILLS) {
    const config = () => ({
      seed: 0xD811_0001,
      scenario: d.scenario,
      accountEquity: d.startingEquity,
      actions: survive,
      sessionId: `golden-${d.drillId}`,
      drillSeed: { ...d.seed },
    });

    it(`${d.drillId}: digest matches golden`, () => {
      expect(runScenario(config()).digest.sha256).toBe(DRAWDOWN_GOLDEN[d.drillId]);
    });

    it(`${d.drillId}: zero scenario XP + survival passes all predicates`, () => {
      const r = runScenario(config());
      expect(r.xpSummary.total).toBe(0);
      const ticks = d.scenario.manifest.durationMs / d.scenario.manifest.msPerTick;
      expect(evaluateDrawdownSurvival(r.log.entries, d.seed, Math.floor(ticks * 2 / 3)).pass).toBe(true);
    });
  }
});

describe("GR-018..020: blowup drill micro-scenario goldens", () => {
  for (const d of BLOWUP_LIVE_DRILLS) {
    const config = () => ({
      seed: 0xB10B0001,
      scenario: d.scenario,
      accountEquity: d.startingEquity,
      actions: blowupActions(BLOWUP_QTY[d.drillId] ?? 40),
      sessionId: `golden-${d.drillId}`,
    });

    it(`${d.drillId}: digest matches golden`, () => {
      expect(runScenario(config()).digest.sha256).toBe(BLOWUP_GOLDEN[d.drillId]);
    });

    it(`${d.drillId}: zero scenario XP (drill XP via debrief path only)`, () => {
      expect(runScenario(config()).xpSummary.total).toBe(0);
    });
  }
});
