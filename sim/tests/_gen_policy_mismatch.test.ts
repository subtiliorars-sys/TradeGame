/**
 * Digest generation helper — SCN-006 policy-MISMATCH fixture (consolidation
 * wave test gap: every golden path exercised policy adherence; none locked
 * in the mismatch + flag behavior). Run:
 *   npx vitest run tests/_gen_policy_mismatch.test.ts --reporter verbose
 */

import { describe, it } from "vitest";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import { scn006 } from "../src/scenarios/scn006.js";

// Declare option A (flat before report) at the card, then VIOLATE it: enter
// long during the freeze-adjacent pre-window (tick 230, before T0) — an
// order AFTER the declaration, inside the adherence window.
export const scn006Mismatch: PlayerAction[] = [
  { type: "leverage_ack", ticksAfter: 0, payload: {} },
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "hypothesis"], wordCount: 26 } },
  { type: "policy_declare", ticksAfter: 180, payload: { policyId: "scn006-card", option: "A_flat", journalWordCount: 12 } },
  // Violation: submit after declaring A (no orders allowed in the window).
  { type: "order_submit", ticksAfter: 50, payload: { orderId: "violate-006", orderType: "stop", side: "sell", quantity: 75, stopPrice: 1.3140, price: null } },
  { type: "order_submit", ticksAfter: 0, payload: { orderId: "entry-006v", orderType: "market", side: "buy", quantity: 75, price: null, stopPrice: null } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 900 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

describe("Generate SCN-006 policy-mismatch digest", () => {
  it("mismatch run", () => {
    const result = runScenario({
      seed: 0xC0DE6006, scenario: scn006, accountEquity: 10_000,
      declaredRiskPct: 1, actions: scn006Mismatch, sessionId: "golden-GR-013",
    });
    console.log("digest:", result.digest.sha256);
    console.log("xpEvents:", JSON.stringify(result.xpSummary.events));
    console.log("xpTotal:", result.xpSummary.total);
    const flags = result.log.entries.filter((e) => e.event.type === "reckless_winner_flag").length;
    console.log("recklessFlags:", flags);
  });
});
