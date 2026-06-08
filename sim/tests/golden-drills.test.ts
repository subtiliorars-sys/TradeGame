/**
 * GR-015..017 — drill micro-scenario golden digests. Locks the seeded
 * session byte-stream (incl. the tick-0 seed sequence) and the zero-
 * scenario-XP invariant (one-XP-book: drill XP flows only through
 * awardLiveDrill, never the scenario scorer).
 */

import { describe, it, expect } from "vitest";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import { LIVE_DRILL_CATALOG } from "../src/drills/liveCatalog.js";
import { evaluateDrawdownSurvival } from "../src/drills/livePredicates.js";

const GOLDEN: Record<string, string> = {
  "drill:drawdown-survival-crypto": "fe6eed7abe256173c623efc2f00df1fba183b8c6d99cf5fe4cc552f3588b9b86",
  "drill:drawdown-survival-stocks": "271ebc179a20504c7ef6214a1370f8871f51865ebc930b263b92d6dc9e2ed95d",
  "drill:drawdown-survival-forex": "a1a0c355b279064329d7e2da079c38f018c562450822d946af4b507f9f4d8662",
};

const survive: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 30, payload: { tags: ["exit"], wordCount: 15 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 320 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

describe("GR-015..017: drill micro-scenario goldens", () => {
  for (const d of LIVE_DRILL_CATALOG) {
    const config = () => ({
      seed: 0xD811_0001,
      scenario: d.scenario,
      accountEquity: 10_000,
      actions: survive,
      sessionId: `golden-${d.drillId}`,
      drillSeed: { ...d.seed },
    });

    it(`${d.drillId}: digest matches golden`, () => {
      expect(runScenario(config()).digest.sha256).toBe(GOLDEN[d.drillId]);
    });

    it(`${d.drillId}: zero scenario XP + survival passes all predicates`, () => {
      const r = runScenario(config());
      expect(r.xpSummary.total).toBe(0);
      const ticks = d.scenario.manifest.durationMs / d.scenario.manifest.msPerTick;
      expect(evaluateDrawdownSurvival(r.log.entries, d.seed, Math.floor(ticks * 2 / 3)).pass).toBe(true);
    });
  }
});
