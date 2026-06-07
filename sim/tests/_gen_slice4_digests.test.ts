/**
 * Digest generation helper for SCN-004/005/006 (Slice 4) — run with:
 *   npx vitest run tests/_gen_slice4_digests.test.ts --reporter verbose
 * Prints sha256 digests + XP events for all six fixture runs.
 * Delete this file after fixtures are populated.
 */

import { describe, it } from "vitest";
import { runScenario, type HarnessConfig, type PlayerAction } from "../src/harness/run.js";
import { scn004 } from "../src/scenarios/scn004.js";
import { scn005 } from "../src/scenarios/scn005.js";
import { scn006 } from "../src/scenarios/scn006.js";

const EQUITY = 10_000;

function report(name: string, config: HarnessConfig): void {
  const result = runScenario(config);
  console.log(`\n=== ${name} ===`);
  console.log("digest:", result.digest.sha256);
  console.log("totalTicks:", result.digest.totalTicks);
  console.log("sessionHasWin:", result.digest.sessionHasWin);
  console.log("xpEvents:", JSON.stringify(result.xpSummary.events));
  console.log("xpTotal:", result.xpSummary.total);
  // Print fills + cancels for sanity (stop behavior verification).
  for (const e of result.log.entries) {
    if (e.event.type === "order_fill" || e.event.type === "order_cancel") {
      console.log("  ", JSON.stringify(e.event));
    }
  }
}

// ---------------------------------------------------------------------------
// SCN-004 — 10s ticks; T0 (deposit) = tick 30; DP-C = tick 270; DP-D = 360;
// DP-E = 462; end = 570. Deposit = market buy GLIMMER (10% allocation rule →
// declaredRiskPct 10). Withdrawal trigger = stop sell 3.90 placed before the
// deposit; never reached on the up-divergence path — rides to session end
// (the session_end auto-cancel is exempt from stop_honored).
// ---------------------------------------------------------------------------

export const scn004Clean: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "hypothesis"], wordCount: 34 } },
  { type: "order_submit", ticksAfter: 30, payload: { orderId: "trigger-004", orderType: "stop", side: "sell", quantity: 238, stopPrice: 3.9, price: null } },
  { type: "order_submit", ticksAfter: 0, payload: { orderId: "deposit-004", orderType: "market", side: "buy", quantity: 238, price: null, stopPrice: null } },
  // DP-C (tick 270): LP panel consulted, IL estimate written.
  { type: "journal_entry", ticksAfter: 240, payload: { tags: ["il_estimate"], wordCount: 18 } },
  // DP-D (tick 360): hold for the fee window; withdrawal trigger updated in
  // journal (net-vs-HODL floor). The 3.90 trigger stop rides to session end
  // untriggered — honored, not abandoned (session_end cancel is exempt).
  { type: "journal_entry", ticksAfter: 90, payload: { tags: ["trigger_update"], wordCount: 16 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 210 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

export const scn004Observe: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "observation"], wordCount: 26 } },
  { type: "journal_entry", ticksAfter: 270, payload: { tags: ["observation"], wordCount: 14 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 300 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

// ---------------------------------------------------------------------------
// SCN-005 — 15s ticks; 72-min compressed days; D1 open = tick 306 (no-entry
// window ticks 306–309); D2 mid = tick 633; D5 pre-auction = tick 1520;
// end = tick 2304. Entry: D2 long 3 shares at ~$35 (1% notional), stop 33.80
// placed before entry; exit before the D5 auction at ~$37.
// ---------------------------------------------------------------------------

export const scn005Clean: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "hypothesis"], wordCount: 32 } },
  { type: "order_submit", ticksAfter: 633, payload: { orderId: "stop-005", orderType: "stop", side: "sell", quantity: 3, stopPrice: 33.8, price: null } },
  { type: "order_submit", ticksAfter: 0, payload: { orderId: "entry-005", orderType: "market", side: "buy", quantity: 3, price: null, stopPrice: null } },
  // Hold through D3/D4; exit before the D5 closing auction (tick 1520, ~$37).
  { type: "order_submit", ticksAfter: 887, payload: { orderId: "exit-005", orderType: "market", side: "sell", quantity: 3, price: null, stopPrice: null } },
  { type: "journal_entry", ticksAfter: 2, payload: { tags: ["exit"], wordCount: 18 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 782 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

export const scn005Observe: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "hypothesis"], wordCount: 30 } },
  { type: "journal_entry", ticksAfter: 700, payload: { tags: ["observation"], wordCount: 16 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 1604 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

// ---------------------------------------------------------------------------
// SCN-006 — 5s ticks; policy card DP-A = tick 180; deadline T-01 = tick 228;
// T0 = tick 240; whipsaw window ticks 240–249; end = tick 1140.
// Clean run = option B: enter long before the card with stop 1.3140 (100 pips
// below pre-report), declare B at the card, hold through the event, journal
// policy adherence, ride the trend to the close.
// ---------------------------------------------------------------------------

export const scn006Clean: PlayerAction[] = [
  { type: "leverage_ack", ticksAfter: 0, payload: {} },
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "hypothesis"], wordCount: 30 } },
  { type: "order_submit", ticksAfter: 100, payload: { orderId: "stop-006", orderType: "stop", side: "sell", quantity: 75, stopPrice: 1.314, price: null } },
  { type: "order_submit", ticksAfter: 0, payload: { orderId: "entry-006", orderType: "market", side: "buy", quantity: 75, price: null, stopPrice: null } },
  // News Policy Card at DP-A (tick 180): option B with journal rationale.
  { type: "policy_declare", ticksAfter: 79, payload: { policyId: "scn006-card", option: "B_hold_with_stop", journalWordCount: 14 } },
  // Hold through release + whipsaw (no orders in window). Ride trend to end.
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 940 } },
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["exit"], wordCount: 16 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

export const scn006OptionC: PlayerAction[] = [
  { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "observation"], wordCount: 24 } },
  { type: "policy_declare", ticksAfter: 180, payload: { policyId: "scn006-card", option: "C_observe_only", journalWordCount: 12 } },
  { type: "journal_entry", ticksAfter: 70, payload: { tags: ["observation"], wordCount: 15 } },
  { type: "advance_ticks", ticksAfter: 0, payload: { count: 890 } },
  { type: "debrief_complete", ticksAfter: 0, payload: {} },
];

// ---------------------------------------------------------------------------

describe("Generate Slice 4 golden digests", () => {
  it("SCN-004 clean run", () => {
    report("SCN-004 CLEAN", {
      seed: 0xC0DE4004, scenario: scn004, accountEquity: EQUITY,
      declaredRiskPct: 10, actions: scn004Clean, sessionId: "golden-GR-007",
    });
  });
  it("SCN-004 observe-only run", () => {
    report("SCN-004 OBSERVE", {
      seed: 0xC0DE4004, scenario: scn004, accountEquity: EQUITY,
      declaredRiskPct: 10, actions: scn004Observe, sessionId: "golden-GR-008",
    });
  });
  it("SCN-005 clean run", () => {
    report("SCN-005 CLEAN", {
      seed: 0xC0DE5005, scenario: scn005, accountEquity: EQUITY,
      declaredRiskPct: 1, actions: scn005Clean, sessionId: "golden-GR-009",
    });
  });
  it("SCN-005 observe-only run", () => {
    report("SCN-005 OBSERVE", {
      seed: 0xC0DE5005, scenario: scn005, accountEquity: EQUITY,
      declaredRiskPct: 1, actions: scn005Observe, sessionId: "golden-GR-010",
    });
  });
  it("SCN-006 clean run (option B)", () => {
    report("SCN-006 CLEAN-B", {
      seed: 0xC0DE6006, scenario: scn006, accountEquity: EQUITY,
      declaredRiskPct: 1, actions: scn006Clean, sessionId: "golden-GR-011",
    });
  });
  it("SCN-006 option-C run", () => {
    report("SCN-006 OPTION-C", {
      seed: 0xC0DE6006, scenario: scn006, accountEquity: EQUITY,
      declaredRiskPct: 1, actions: scn006OptionC, sessionId: "golden-GR-012",
    });
  });
});
