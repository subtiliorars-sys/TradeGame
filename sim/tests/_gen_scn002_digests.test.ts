/**
 * Digest generation helper for SCN-002 — run with:
 *   npx vitest run tests/_gen_scn002_digests.test.ts --reporter verbose
 * Prints sha256 digests + XP events for both SCN-002 fixture runs.
 * Delete this file after fixtures are populated.
 */

import { describe, it } from "vitest";
import { runScenario, type HarnessConfig, type PlayerAction } from "../src/harness/run.js";
import { scn002 } from "../src/scenarios/scn002.js";

// Seed reuses the same value as SCN-001 suite for consistency.
// GR-002 = SCN-002 clean run; GR-004 = SCN-002 no-trade run.
const SEED = 0xA1B2C3D4; // 2712847316
const EQUITY = 10_000;
const RISK_PCT = 1.0;

// ---------------------------------------------------------------------------
// SCN-002 timing reference (ms, 30-second ticks)
// ---------------------------------------------------------------------------
// sim start = 08:00 ET = 0 ms
// 09:35 = 5,700,000 ms → tickIndex 190  (5700000 / 30000)
// 09:45 = 6,300,000 ms → tickIndex 210
// 09:50 = 6,600,000 ms → tickIndex 220
// 10:00 = 7,200,000 ms → tickIndex 240

// ---------------------------------------------------------------------------
// Clean run
// ---------------------------------------------------------------------------
// Plan: journal at tick 0 (08:00, timestamp 0) → plan_declared fires.
// Wait out no-trade zone; place stop BEFORE market buy at tick 190 (09:35).
// Stop: sell stop at $48.50 (below $49.20 no-trade-zone low per spec plan example).
// Entry: market buy (long NGSM), qty 2 → positionValue ≈ 2 * ~49 = ~98, ≈1% of 10k.
// Advance to tick 220 (09:50) during fade, write exit journal, complete debrief.

const cleanActions: PlayerAction[] = [
  // Pre-session plan journal at tick 0 (08:00, pre-market context)
  // "plan" tag satisfies plan_declared; timestamp 0 <= sessionOpenTs 0.
  {
    type: "journal_entry",
    ticksAfter: 0,
    payload: {
      tags: ["plan", "pre_open"],
      wordCount: 28,
    },
  },
  // Advance to tick 190 (09:35 — after the no-trade zone, DP-C)
  // Stop placed BEFORE entry (stop first, market buy same tick)
  {
    type: "order_submit",
    ticksAfter: 190,
    payload: {
      orderId: "stop-002",
      orderType: "stop",
      side: "sell",
      quantity: 2,
      stopPrice: 48.50,
      price: null,
    },
  },
  // Entry: market buy (long NGSM)
  {
    type: "order_submit",
    ticksAfter: 0,
    payload: {
      orderId: "entry-002",
      orderType: "market",
      side: "buy",
      quantity: 2,
      price: null,
      stopPrice: null,
    },
  },
  // Advance to tick 240 (10:00, scenario end) — the fade drives price through $48.50,
  // triggering the stop order naturally. No manual cancel needed.
  {
    type: "advance_ticks",
    ticksAfter: 0,
    payload: { count: 50 },
  },
  // Exit journal
  {
    type: "journal_entry",
    ticksAfter: 0,
    payload: {
      tags: ["exit"],
      wordCount: 16,
    },
  },
  // Debrief
  {
    type: "debrief_complete",
    ticksAfter: 0,
    payload: {},
  },
];

// ---------------------------------------------------------------------------
// No-trade run
// ---------------------------------------------------------------------------
// Plan declared pre-open (DP-A context at 09:00 = tick 120), observes the
// gap-and-fade trap through the no-trade zone and the 09:35 run, journals
// throughout, never enters. patience_observation + debrief_completed = 70 XP.
// Note: journal at tick 120 (timestamp 3,600,000 ms) > sessionOpenTs (0 ms)
// → plan_declared does NOT fire. Total XP = 70.

const noTradeActions: PlayerAction[] = [
  // Pre-market drift observation at DP-A (09:00 = tick 120)
  {
    type: "journal_entry",
    ticksAfter: 120,
    payload: {
      tags: ["plan", "observation"],
      wordCount: 24,
    },
  },
  // Observe the open spike (09:30 = tick 180)
  {
    type: "journal_entry",
    ticksAfter: 60,
    payload: {
      tags: ["observation"],
      wordCount: 12,
    },
  },
  // Post no-trade zone (09:35 = tick 190, DP-C) — gap-and-fade trap visible
  {
    type: "journal_entry",
    ticksAfter: 10,
    payload: {
      tags: ["observation"],
      wordCount: 15,
    },
  },
  // Fade confirmation (09:45 = tick 210, DP-D)
  {
    type: "journal_entry",
    ticksAfter: 20,
    payload: {
      tags: ["observation"],
      wordCount: 14,
    },
  },
  // Advance to scenario end (tick 240)
  {
    type: "advance_ticks",
    ticksAfter: 0,
    payload: { count: 30 },
  },
  // Debrief
  {
    type: "debrief_complete",
    ticksAfter: 0,
    payload: {},
  },
];

// ---------------------------------------------------------------------------
// Generator tests
// ---------------------------------------------------------------------------

describe("Generate SCN-002 golden digests", () => {
  it("SCN-002 clean run digest", () => {
    const config: HarnessConfig = {
      seed: SEED,
      scenario: scn002,
      accountEquity: EQUITY,
      declaredRiskPct: RISK_PCT,
      actions: cleanActions,
      sessionId: "golden-GR-002",
    };
    const result = runScenario(config);
    console.log("\n=== SCN-002 CLEAN RUN ===");
    console.log("digest:", result.digest.sha256);
    console.log("totalTicks:", result.digest.totalTicks);
    console.log("sessionHasWin:", result.digest.sessionHasWin);
    console.log("xpEvents:", JSON.stringify(result.xpSummary.events, null, 2));
    console.log("xpTotal:", result.xpSummary.total);
  });

  it("SCN-002 no-trade run digest", () => {
    const config: HarnessConfig = {
      seed: SEED,
      scenario: scn002,
      accountEquity: EQUITY,
      declaredRiskPct: RISK_PCT,
      actions: noTradeActions,
      sessionId: "golden-GR-004",
    };
    const result = runScenario(config);
    console.log("\n=== SCN-002 NO-TRADE RUN ===");
    console.log("digest:", result.digest.sha256);
    console.log("totalTicks:", result.digest.totalTicks);
    console.log("sessionHasWin:", result.digest.sessionHasWin);
    console.log("xpEvents:", JSON.stringify(result.xpSummary.events, null, 2));
    console.log("xpTotal:", result.xpSummary.total);
  });
});
