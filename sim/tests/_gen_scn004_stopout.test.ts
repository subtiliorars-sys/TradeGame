/**
 * Digest generation — SCN-004 trigger-honored-LATE fixture (GR-014):
 * deposit with NO pre-placed trigger (process gap), define one at DP-D
 * (6.00), the correction fires it — the withdrawal executes (stop_honored)
 * AND the reckless-winner coaching flag fires (stop_before_entry failed +
 * winning session). Locks in: flag = coaching, never an XP penalty.
 */

import { describe, it } from "vitest";
import { runScenario, type PlayerAction } from "../src/harness/run.js";
import { scn004 } from "../src/scenarios/scn004.js";

export const scn004StopoutActions: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "hypothesis"], wordCount: 30 } },
  // Deposit WITHOUT a withdrawal trigger — the process gap.
  { type: "order_submit", ticksAfter: 30, payload: { orderId: "deposit-014", orderType: "market", side: "buy", quantity: 238, price: null, stopPrice: null } },
  // DP-C: IL estimate journaled.
  { type: "journal_entry", ticksAfter: 240, payload: { tags: ["il_estimate"], wordCount: 16 } },
  // DP-D: trigger defined LATE — journaled + submitted at 6.00 (price ~6.78).
  { type: "journal_entry", ticksAfter: 90, payload: { tags: ["trigger_update"], wordCount: 18 } },
  { type: "order_submit", ticksAfter: 0, payload: { orderId: "trigger-014", orderType: "stop", side: "sell", quantity: 238, stopPrice: 6.0, price: null } },
  // The partial correction crosses 6.00 → the trigger executes.
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 210 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

describe("Generate SCN-004 stop-out digest", () => {
  it("trigger-honored-late run", () => {
    const result = runScenario({
      seed: 0xC0DE4004, scenario: scn004, accountEquity: 10_000,
      declaredRiskPct: 10, actions: scn004StopoutActions, sessionId: "golden-GR-014",
    });
    console.log("digest:", result.digest.sha256);
    console.log("xpEvents:", JSON.stringify(result.xpSummary.events));
    console.log("xpTotal:", result.xpSummary.total);
    console.log("hasWin:", result.digest.sessionHasWin);
    for (const e of result.log.entries) {
      if (e.event.type === "order_fill" || e.event.type === "reckless_winner_flag") {
        console.log("  ", JSON.stringify(e.event).slice(0, 140));
      }
    }
  });
});
