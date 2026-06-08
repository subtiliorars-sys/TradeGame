/** Digest generation for the three drill micro-scenarios (GR-015..017). */
import { describe, it } from "vitest";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import { LIVE_DRILL_CATALOG } from "../src/drills/liveCatalog.js";

const survive: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 30, payload: { tags: ["exit"], wordCount: 15 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 320 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

describe("gen drill goldens", () => {
  for (const d of LIVE_DRILL_CATALOG) {
    it(d.drillId, () => {
      const r = runScenario({
        seed: 0xD811_0001, scenario: d.scenario, accountEquity: 10_000,
        actions: survive, sessionId: `golden-${d.drillId}`,
        drillSeed: { ...d.seed },
      });
      console.log(`${d.drillId} digest: ${r.digest.sha256} xp: ${r.xpSummary.total}`);
    });
  }
});
