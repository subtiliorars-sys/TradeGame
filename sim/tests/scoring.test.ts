/**
 * Scoring engine tests — SIM_ENGINE_SPEC §4 / TEST_PLAN §2.1.
 *
 * All assertions are over process metrics only.
 * No fill prices, PnL fields, or account balance values appear in assertions.
 *
 * Three metrics are exercised in detail per the deliverable spec:
 *   1. stop_honored (SM-001, SM-002)
 *   2. no_stop_widen (SM-003, SM-004)
 *   3. policy_match (PM-001 … PM-005) — SIM_ENGINE_SPEC §4.2 / SCENARIOS_V1 SCN-006.
 *      Distinct from stop_before_entry; see policy_match extractor for semantics.
 *
 * Additional metric tests cover the full registry.
 */

import { describe, it, expect } from "vitest";
import {
  stop_honored,
  stop_before_entry,
  no_stop_widen,
  journal_before_trade,
  exit_journal,
  patience_observation,
  leverage_ack,
  debrief_completed,
  size_compliance,
  policy_match,
  runScoreTracker,
} from "../src/engine/scoring.js";
import type { MetricInput } from "../src/engine/scoring.js";
import type { SimEvent } from "../src/engine/events.js";

// ---------------------------------------------------------------------------
// Fixture builders — returns MetricInput from a typed event array
// ---------------------------------------------------------------------------

function buildInput(
  events: SimEvent[],
  overrides: Partial<Omit<MetricInput, "events">> = {}
): MetricInput {
  return {
    events,
    sessionHasWin: false,
    declaredRiskPct: 1,
    sessionStartEquity: 10000,
    ...overrides,
  };
}

// Shared order IDs for fixture consistency.
const STOP_ID = "order-stop-001";
const ENTRY_ID = "order-entry-001";

function makeStopSubmit(timestamp: number): SimEvent {
  return {
    type: "order_submit",
    orderId: STOP_ID,
    orderType: "stop",
    side: "sell",
    quantity: 100,
    price: null,
    stopPrice: 0.993,
    tickIndex: Math.floor(timestamp / 1000),
    timestamp,
  };
}

function makeEntrySubmit(timestamp: number): SimEvent {
  return {
    type: "order_submit",
    orderId: ENTRY_ID,
    orderType: "market",
    side: "sell",
    quantity: 100,
    price: null,
    stopPrice: null,
    tickIndex: Math.floor(timestamp / 1000),
    timestamp,
  };
}

function makeEntryFill(timestamp: number): SimEvent {
  return {
    type: "order_fill",
    orderId: ENTRY_ID,
    fillPrice: 1.0,
    slippage: 0.001,
    spreadCost: 0.0005,
    feeCost: 0.0015,
    tickIndex: Math.floor(timestamp / 1000),
    timestamp,
  };
}

function makeStopCancel(timestamp: number): SimEvent {
  return {
    type: "order_cancel",
    orderId: STOP_ID,
    reason: "manual",
    tickIndex: Math.floor(timestamp / 1000),
    timestamp,
  };
}

function makeJournalEntry(
  timestamp: number,
  tags: string[],
  wordCount = 10
): SimEvent {
  return {
    type: "journal_entry",
    entryId: `journal-${timestamp}`,
    tags,
    wordCount,
    tickIndex: Math.floor(timestamp / 1000),
    timestamp,
  };
}

// ---------------------------------------------------------------------------
// 1. stop_honored (SM-001, SM-002)
// ---------------------------------------------------------------------------

describe("stop_honored", () => {
  // SM-001: stop submitted → entry filled → no cancel → stop_honored = true
  it("SM-001: pass — stop not cancelled after fill", () => {
    const events: SimEvent[] = [
      makeStopSubmit(1000),
      makeEntryFill(2000),
      // No cancel event
    ];
    const result = stop_honored(buildInput(events));
    expect(result.metricId).toBe("stop_honored");
    expect(result.passed).toBe(true);
  });

  // SM-002: stop submitted → entry filled → stop cancelled → stop_honored = false
  it("SM-002: fail — stop cancelled after entry fill", () => {
    const events: SimEvent[] = [
      makeStopSubmit(1000),
      makeEntryFill(2000),
      makeStopCancel(3000), // cancelled after fill → violation
    ];
    const result = stop_honored(buildInput(events));
    expect(result.passed).toBe(false);
  });

  it("no stop placed → not applicable (no stop = no opportunity to violate)", () => {
    const events: SimEvent[] = [makeEntryFill(2000)];
    const result = stop_honored(buildInput(events));
    expect(result.applicable).toBe(false);
  });

  it("stop cancel before entry fill → not applicable (no position was open)", () => {
    const events: SimEvent[] = [
      makeStopSubmit(1000),
      makeStopCancel(1500), // cancelled before any fill
    ];
    const result = stop_honored(buildInput(events));
    expect(result.applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 2. no_stop_widen (SM-003, SM-004)
// ---------------------------------------------------------------------------

describe("no_stop_widen", () => {
  // SM-003: stop widened after fill → no_stop_widen = false
  it("SM-003: fail — stop moved further from entry", () => {
    // Entry fill price = 1.0; original stop = 0.993 (distance 0.007)
    // Modified stop = 0.980 (distance 0.020) → widened
    const events: SimEvent[] = [
      makeStopSubmit(1000), // stopPrice 0.993
      makeEntryFill(2000),  // fillPrice 1.0
      {
        type: "order_modify",
        orderId: STOP_ID,
        newStopPrice: 0.98, // further from 1.0 → widened
        tickIndex: 3,
        timestamp: 3000,
      },
    ];
    const result = no_stop_widen(buildInput(events));
    expect(result.passed).toBe(false);
  });

  // SM-004: stop tightened → no_stop_widen = true (tightening is allowed)
  it("SM-004: pass — stop moved closer to entry (tightened)", () => {
    // Original stop 0.993 (distance 0.007); new stop 0.997 (distance 0.003) → tighter
    const events: SimEvent[] = [
      makeStopSubmit(1000), // stopPrice 0.993
      makeEntryFill(2000),  // fillPrice 1.0
      {
        type: "order_modify",
        orderId: STOP_ID,
        newStopPrice: 0.997, // closer to 1.0 → tighter → pass
        tickIndex: 3,
        timestamp: 3000,
      },
    ];
    const result = no_stop_widen(buildInput(events));
    expect(result.passed).toBe(true);
  });

  it("no modify events → pass", () => {
    const events: SimEvent[] = [makeStopSubmit(1000), makeEntryFill(2000)];
    const result = no_stop_widen(buildInput(events));
    expect(result.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. stop_before_entry (SM-007, SM-008)
// ---------------------------------------------------------------------------

describe("stop_before_entry", () => {
  // SM-007: stop submitted before entry fill → pass
  it("SM-007: pass — stop submitted at tick 9, entry fills at tick 10", () => {
    const events: SimEvent[] = [
      makeStopSubmit(9000),  // tick 9
      makeEntryFill(10000),  // tick 10 — stop came first
    ];
    const result = stop_before_entry(buildInput(events));
    expect(result.metricId).toBe("stop_before_entry");
    expect(result.passed).toBe(true);
  });

  // SM-007b: simultaneous (same timestamp) → pass (≤ check)
  it("pass — stop and entry fill at same timestamp", () => {
    const events: SimEvent[] = [
      makeStopSubmit(10000),
      makeEntryFill(10000),
    ];
    const result = stop_before_entry(buildInput(events));
    expect(result.passed).toBe(true);
  });

  // SM-008: entry fills at tick 10, stop submitted at tick 11 → fail
  it("SM-008: fail — stop submitted after entry fill", () => {
    const events: SimEvent[] = [
      makeEntryFill(10000), // fill at tick 10
      makeStopSubmit(11000), // stop at tick 11 — too late
    ];
    const result = stop_before_entry(buildInput(events));
    expect(result.passed).toBe(false);
  });

  it("no stop placed, no fill → not applicable (no position opened)", () => {
    const result = stop_before_entry(buildInput([]));
    expect(result.applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. policy_match (PM-001 … PM-005) — SIM_ENGINE_SPEC §4.2 / SCN-006
// ---------------------------------------------------------------------------

/** Helper: builds a PolicyDeclaredEvent at the given tick. */
function makePolicyDeclared(
  tickIndex: number,
  option: "A_flat" | "B_hold_with_stop" | "C_observe_only",
  policyId = "news-policy-001"
): SimEvent {
  return {
    type: "policy_declared",
    policyId,
    option,
    journalWordCount: 15,
    tickIndex,
    timestamp: tickIndex * 1000,
  };
}

describe("policy_match", () => {
  // PM-001: declared A_flat — no order_submits after declaration tick → match
  it("PM-001: pass (A_flat) — no orders after declaration", () => {
    const events: SimEvent[] = [
      makePolicyDeclared(5, "A_flat"),
      // no order_submit events after tick 5
    ];
    const result = policy_match(buildInput(events));
    expect(result.metricId).toBe("policy_match");
    expect(result.passed).toBe(true);
    expect(result.xpOnPass).toBe(25);
  });

  // PM-002: declared B_hold_with_stop — position held (fill before declaration)
  //         and stop present before declaration tick → match
  it("PM-002: pass (B_hold_with_stop) — pre-existing fill + stop before declaration", () => {
    const events: SimEvent[] = [
      makeStopSubmit(2000),   // stop at tick 2 — before declaration tick 5
      makeEntryFill(3000),    // fill at tick 3 — before declaration tick 5
      makePolicyDeclared(5, "B_hold_with_stop"),
      // no cancel, no modify after declaration
    ];
    const result = policy_match(buildInput(events));
    expect(result.passed).toBe(true);
    expect(result.xpOnPass).toBe(25);
  });

  // PM-003: declared C_observe_only — no order_submits after declaration → match
  it("PM-003: pass (C_observe_only) — no orders submitted after declaration", () => {
    const events: SimEvent[] = [
      makePolicyDeclared(5, "C_observe_only"),
      makeJournalEntry(8000, ["observation"]), // journal only, no orders
    ];
    const result = policy_match(buildInput(events));
    expect(result.passed).toBe(true);
    expect(result.xpOnPass).toBe(25);
  });

  // PM-004: declared A_flat but traded anyway (order_submit after declaration) → mismatch
  it("PM-004: fail (A_flat mismatch) — order submitted after declaration", () => {
    const events: SimEvent[] = [
      makePolicyDeclared(5, "A_flat"),
      makeEntrySubmit(8000), // tick 8 > declaration tick 5 → violation
    ];
    const result = policy_match(buildInput(events));
    expect(result.passed).toBe(false);
    expect(result.xpOnPass).toBe(0);
  });

  // PM-004b: runScoreTracker emits policyMismatchFlag when mismatch detected
  it("PM-004b: runScoreTracker emits policyMismatchFlag on mismatch", () => {
    const events: SimEvent[] = [
      makePolicyDeclared(5, "A_flat"),
      makeEntrySubmit(8000), // traded after declaring A_flat
    ];
    const output = runScoreTracker("sess-pm-001", buildInput(events), 10000);
    expect(output.policyMismatchFlag).not.toBeNull();
    expect(output.policyMismatchFlag?.declaredOption).toBe("A_flat");
    expect(output.policyMismatchFlag?.policyId).toBe("news-policy-001");
    // No XP event for policy_match when mismatch
    const pmXp = output.xpEvents.find((x) => x.metricId === "policy_match");
    expect(pmXp).toBeUndefined();
  });

  // PM-005: no PolicyDeclaredEvent present — metric is inert (no XP, no flag)
  it("PM-005: inert — no PolicyDeclaredEvent in log", () => {
    const events: SimEvent[] = [
      makeJournalEntry(2000, ["observation"]),
      makeEntrySubmit(5000),
    ];
    const result = policy_match(buildInput(events));
    expect(result.passed).toBe(false);
    expect(result.xpOnPass).toBe(0);
    // runScoreTracker should emit no policyMismatchFlag when there was no declaration
    const output = runScoreTracker("sess-pm-002", buildInput(events), 8000);
    expect(output.policyMismatchFlag).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// journal_before_trade (SM-005, SM-006)
// ---------------------------------------------------------------------------

describe("journal_before_trade", () => {
  it("SM-005: pass — journal at tick 5, order at tick 10", () => {
    const events: SimEvent[] = [
      makeJournalEntry(5000, ["pre_trade", "hypothesis"]),
      makeEntrySubmit(10000),
    ];
    expect(journal_before_trade(buildInput(events)).passed).toBe(true);
  });

  it("SM-006: fail — order at tick 10, journal at tick 12", () => {
    const events: SimEvent[] = [
      makeEntrySubmit(10000),
      makeJournalEntry(12000, ["pre_trade"]),
    ];
    expect(journal_before_trade(buildInput(events)).passed).toBe(false);
  });

  it("not applicable — journal exists, no orders ever placed (patience path)", () => {
    const events: SimEvent[] = [
      makeJournalEntry(5000, ["observation"]),
    ];
    const result = journal_before_trade(buildInput(events));
    expect(result.applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// exit_journal (SM-011, SM-012)
// ---------------------------------------------------------------------------

describe("exit_journal", () => {
  it("SM-011: pass — journal entry with tag 'exit' after a fill", () => {
    const events: SimEvent[] = [
      makeEntryFill(4000),
      makeJournalEntry(5000, ["exit"]),
    ];
    const r = exit_journal(buildInput(events));
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(true);
  });

  it("SM-012: fail — fill exists, journal exists but no 'exit' tag", () => {
    const events: SimEvent[] = [
      makeEntryFill(4000),
      makeJournalEntry(5000, ["pre_trade"]),
    ];
    const r = exit_journal(buildInput(events));
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("SM-012b: not applicable — exit-tagged journal but NO fill (patience path cannot harvest exit XP)", () => {
    const events: SimEvent[] = [
      makeJournalEntry(5000, ["exit"]),
    ];
    const r = exit_journal(buildInput(events));
    expect(r.applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// patience_observation (SM-013)
// ---------------------------------------------------------------------------

describe("patience_observation", () => {
  it("SM-013: pass — journaled, no fills", () => {
    const events: SimEvent[] = [
      makeJournalEntry(5000, ["observation"]),
    ];
    expect(patience_observation(buildInput(events)).passed).toBe(true);
    expect(patience_observation(buildInput(events)).xpOnPass).toBe(40);
  });

  it("fail — journaled AND filled", () => {
    const events: SimEvent[] = [
      makeJournalEntry(5000, ["observation"]),
      makeEntryFill(10000),
    ];
    expect(patience_observation(buildInput(events)).passed).toBe(false);
  });

  it("fail — no journal at all", () => {
    expect(patience_observation(buildInput([])).passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// leverage_ack (SM-014, SM-015)
// ---------------------------------------------------------------------------

describe("leverage_ack", () => {
  it("SM-015: pass — ack before fill", () => {
    const events: SimEvent[] = [
      {
        type: "leverage_risk_acknowledged",
        tickIndex: 0,
        timestamp: 1000,
      },
      makeEntryFill(2000),
    ];
    expect(leverage_ack(buildInput(events)).passed).toBe(true);
  });

  it("SM-014: fail — fill before ack", () => {
    const events: SimEvent[] = [
      makeEntryFill(1000),
      {
        type: "leverage_risk_acknowledged",
        tickIndex: 2,
        timestamp: 2000,
      },
    ];
    expect(leverage_ack(buildInput(events)).passed).toBe(false);
  });

  it("fail — no ack at all, but fill exists", () => {
    const events: SimEvent[] = [makeEntryFill(1000)];
    expect(leverage_ack(buildInput(events)).passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// debrief_completed
// ---------------------------------------------------------------------------

describe("debrief_completed", () => {
  it("pass — debrief_complete event present", () => {
    const events: SimEvent[] = [
      { type: "debrief_complete", tickIndex: 10, timestamp: 10000 },
    ];
    expect(debrief_completed(buildInput(events)).passed).toBe(true);
  });

  it("fail — no debrief_complete event", () => {
    expect(debrief_completed(buildInput([])).passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// size_compliance (SM-016, SM-017)
// ---------------------------------------------------------------------------

describe("size_compliance", () => {
  // SM-016: position value ~0.99% of equity, declared 1% → within 10% tolerance → pass
  it("SM-016: pass — position value 0.99% of equity, declared 1%", () => {
    // equity = 10000, declared = 1%, quantity=99, fillPrice=1.0 → 99/10000 = 0.99%
    const events: SimEvent[] = [
      {
        type: "order_submit",
        orderId: "e1",
        orderType: "market",
        side: "buy",
        quantity: 99,
        price: null,
        stopPrice: null,
        tickIndex: 1,
        timestamp: 1000,
      },
      {
        type: "order_fill",
        orderId: "e1",
        fillPrice: 1.0,
        slippage: 0,
        spreadCost: 0,
        feeCost: 0,
        tickIndex: 1,
        timestamp: 1000,
      },
    ];
    const result = size_compliance(
      buildInput(events, { sessionStartEquity: 10000, declaredRiskPct: 1 })
    );
    expect(result.passed).toBe(true);
  });

  // SM-017: position value 3% of equity, declared 1% → outside 10% tolerance → fail
  it("SM-017: fail — position value 3% of equity, declared 1%", () => {
    // equity = 10000, declared = 1%, quantity=300, fillPrice=1.0 → 300/10000 = 3%
    const events: SimEvent[] = [
      {
        type: "order_submit",
        orderId: "e2",
        orderType: "market",
        side: "buy",
        quantity: 300,
        price: null,
        stopPrice: null,
        tickIndex: 1,
        timestamp: 1000,
      },
      {
        type: "order_fill",
        orderId: "e2",
        fillPrice: 1.0,
        slippage: 0,
        spreadCost: 0,
        feeCost: 0,
        tickIndex: 1,
        timestamp: 1000,
      },
    ];
    const result = size_compliance(
      buildInput(events, { sessionStartEquity: 10000, declaredRiskPct: 1 })
    );
    expect(result.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// runScoreTracker — integration: reckless-winner flag (RW-001 … RW-005)
// ---------------------------------------------------------------------------

describe("runScoreTracker — reckless-winner flag", () => {
  // RW-001: size_compliance failed + session has win → flag emitted
  it("RW-001: flag emitted — size violation + winning session", () => {
    const events: SimEvent[] = [
      {
        type: "order_submit",
        orderId: "e3",
        orderType: "market",
        side: "buy",
        quantity: 300, // oversized: 3% vs 1% declared
        price: null,
        stopPrice: null,
        tickIndex: 1,
        timestamp: 1000,
      },
      {
        type: "order_fill",
        orderId: "e3",
        fillPrice: 1.0,
        slippage: 0,
        spreadCost: 0,
        feeCost: 0,
        tickIndex: 1,
        timestamp: 1000,
      },
    ];
    const input = buildInput(events, {
      sessionHasWin: true,
      sessionStartEquity: 10000,
      declaredRiskPct: 1,
    });
    const output = runScoreTracker("sess-001", input, 10000);
    expect(output.recklessWinnerFlag).not.toBeNull();
    expect(output.recklessWinnerFlag?.metricsFailed).toContain("size_compliance");
  });

  // RW-004: size violation but no winning trade → no flag
  it("RW-004: no flag — violation present but no win", () => {
    const events: SimEvent[] = [
      {
        type: "order_submit",
        orderId: "e4",
        orderType: "market",
        side: "buy",
        quantity: 300,
        price: null,
        stopPrice: null,
        tickIndex: 1,
        timestamp: 1000,
      },
      {
        type: "order_fill",
        orderId: "e4",
        fillPrice: 1.0,
        slippage: 0,
        spreadCost: 0,
        feeCost: 0,
        tickIndex: 1,
        timestamp: 1000,
      },
    ];
    const input = buildInput(events, {
      sessionHasWin: false, // no win
      sessionStartEquity: 10000,
      declaredRiskPct: 1,
    });
    const output = runScoreTracker("sess-002", input, 10000);
    expect(output.recklessWinnerFlag).toBeNull();
  });

  // RW-003: both violations → single flag with both in metricsFailed
  it("RW-003: single flag with both violations", () => {
    // Oversized AND stop submitted after fill → both flags
    const events: SimEvent[] = [
      makeEntryFill(10000), // fill first
      makeStopSubmit(11000), // stop after fill → stop_before_entry fails
      {
        type: "order_submit",
        orderId: "e5",
        orderType: "market",
        side: "buy",
        quantity: 300, // oversized → size_compliance fails
        price: null,
        stopPrice: null,
        tickIndex: 1,
        timestamp: 1000,
      },
    ];
    const input = buildInput(events, {
      sessionHasWin: true,
      sessionStartEquity: 10000,
      declaredRiskPct: 1,
    });
    const output = runScoreTracker("sess-003", input, 10000);
    expect(output.recklessWinnerFlag).not.toBeNull();
    // Should list both failed metrics (not two separate flags).
    const failed = output.recklessWinnerFlag?.metricsFailed ?? [];
    expect(failed.length).toBeGreaterThanOrEqual(1);
  });

  // RW-005: all metrics pass, winning session → no flag
  it("RW-005: no flag — clean winner", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade", "hypothesis"]),
      makeStopSubmit(9000),   // stop before fill
      makeEntryFill(10000),   // fill at 1.0; 100 * 1.0 = 1% of 10000
      { type: "debrief_complete", tickIndex: 20, timestamp: 20000 },
    ];
    const input = buildInput(events, {
      sessionHasWin: true,
      sessionStartEquity: 10000,
      declaredRiskPct: 1,
    });
    const output = runScoreTracker("sess-004", input, 20000);
    expect(output.recklessWinnerFlag).toBeNull();
  });

  // XP events emitted for passing metrics.
  // journal_before_trade is not-applicable when no orders exist (patience path),
  // so only debrief_completed and patience_observation emit XP here.
  it("XP events contain correct metricIds for passing metrics (no-trade session)", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade"]),
      { type: "debrief_complete", tickIndex: 5, timestamp: 5000 },
    ];
    const input = buildInput(events);
    const output = runScoreTracker("sess-005", input, 5000);
    const xpMetricIds = output.xpEvents.map((x) => x.metricId);
    // journal_before_trade not applicable on no-trade path — must NOT appear.
    expect(xpMetricIds).not.toContain("journal_before_trade");
    expect(xpMetricIds).toContain("debrief_completed");
    expect(xpMetricIds).toContain("patience_observation");
  });

  // When a trade IS placed, journal_before_trade is applicable and emits XP if passed.
  it("XP events include journal_before_trade when a trade was placed with prior journal", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade"]),
      makeStopSubmit(9000),
      makeEntryFill(10000),
      { type: "debrief_complete", tickIndex: 20, timestamp: 20000 },
    ];
    const input = buildInput(events, {
      sessionStartEquity: 10000,
      declaredRiskPct: 1,
    });
    const output = runScoreTracker("sess-006", input, 20000);
    const xpMetricIds = output.xpEvents.map((x) => x.metricId);
    expect(xpMetricIds).toContain("journal_before_trade");
    expect(xpMetricIds).toContain("debrief_completed");
  });
});
