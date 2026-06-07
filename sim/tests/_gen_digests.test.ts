/**
 * Digest generation helper — run with: npx vitest run tests/_gen_digests.ts
 * Prints the real sha256 digests for both SCN-001 fixture runs.
 * Delete this file after fixtures are populated.
 */

import { describe, it } from "vitest";
import { runScenario, type HarnessConfig, type PlayerAction } from "../src/harness/run.js";
import { scn001 } from "../src/scenarios/scn001.js";

// Clean run — patient entry at T+6 (tick 96), stop first, journal, debrief.
// Seed matches TEST_PLAN §5.2 GR-001: 0xA1B2C3D4 = 2712847316
const SEED_CLEAN = 0xA1B2C3D4;
const EQUITY = 10000;
const RISK_PCT = 1.0;

// SCN-001 timing reference:
//   T+6 = simTimeMs 960,000  → tickIndex 96  (960000 / 10000)
// Actions: advance 96 ticks, then at tick 96 place stop + market sell,
// advance remaining ticks, journal exit, debrief.
// Total ticks = 300 (50 min × 6 ticks/min).

const cleanActions: PlayerAction[] = [
  // Pre-trade journal at session start (tick 0)
  {
    type: "journal_entry",
    ticksAfter: 0,
    payload: { tags: ["pre_trade", "hypothesis"], wordCount: 22 },
  },
  // Advance to T+6 (tick 96) — the second leg down Decision Point B
  // Stop placed BEFORE entry (stop first, then market order same tick)
  {
    type: "order_submit",
    ticksAfter: 96,
    payload: {
      orderId: "stop-001",
      orderType: "stop",
      side: "sell",
      quantity: 100,
      stopPrice: 1.0010,
      price: null,
    },
  },
  // Entry: market sell (short HarborUSD)
  {
    type: "order_submit",
    ticksAfter: 0,
    payload: {
      orderId: "entry-001",
      orderType: "market",
      side: "sell",
      quantity: 100,
      price: null,
      stopPrice: null,
    },
  },
  // Advance to near end of session (tick 296 more = tick 192 total)
  {
    type: "advance_ticks",
    ticksAfter: 0,
    payload: { count: 192 },
  },
  // Exit journal
  {
    type: "journal_entry",
    ticksAfter: 0,
    payload: { tags: ["exit"], wordCount: 14 },
  },
  // Debrief
  {
    type: "debrief_complete",
    ticksAfter: 0,
    payload: {},
  },
];

// Patience run — observe only, no orders, journal, debrief.
const SEED_PATIENCE = 0xA1B2C3D4;

const patienceActions: PlayerAction[] = [
  // Observation journal at T0 (tick 60)
  {
    type: "journal_entry",
    ticksAfter: 60,
    payload: { tags: ["observation", "hypothesis"], wordCount: 18 },
  },
  // Second observation at the cascade (tick 108)
  {
    type: "journal_entry",
    ticksAfter: 48,
    payload: { tags: ["observation"], wordCount: 12 },
  },
  // Advance to end
  {
    type: "advance_ticks",
    ticksAfter: 0,
    payload: { count: 132 },
  },
  // Debrief
  {
    type: "debrief_complete",
    ticksAfter: 0,
    payload: {},
  },
];

describe("Generate golden digests", () => {
  it("SCN-001 clean run digest", () => {
    const config: HarnessConfig = {
      seed: SEED_CLEAN,
      scenario: scn001,
      accountEquity: EQUITY,
      declaredRiskPct: RISK_PCT,
      actions: cleanActions,
      sessionId: "golden-GR-001",
    };
    const result = runScenario(config);
    console.log("\n=== SCN-001 CLEAN RUN ===");
    console.log("digest:", result.digest.sha256);
    console.log("totalTicks:", result.digest.totalTicks);
    console.log("sessionHasWin:", result.digest.sessionHasWin);
    console.log("xpEvents:", JSON.stringify(result.xpSummary.events, null, 2));
    console.log("xpTotal:", result.xpSummary.total);
  });

  it("SCN-001 patience run digest", () => {
    const config: HarnessConfig = {
      seed: SEED_PATIENCE,
      scenario: scn001,
      accountEquity: EQUITY,
      declaredRiskPct: RISK_PCT,
      actions: patienceActions,
      sessionId: "golden-GR-003",
    };
    const result = runScenario(config);
    console.log("\n=== SCN-001 PATIENCE RUN ===");
    console.log("digest:", result.digest.sha256);
    console.log("totalTicks:", result.digest.totalTicks);
    console.log("sessionHasWin:", result.digest.sessionHasWin);
    console.log("xpEvents:", JSON.stringify(result.xpSummary.events, null, 2));
    console.log("xpTotal:", result.xpSummary.total);
  });
});
