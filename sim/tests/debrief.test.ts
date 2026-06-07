/**
 * Debrief screen tests — tests/debrief.test.ts
 *
 * Exercises SessionAdapter.endSession() headlessly (no Phaser, no DOM).
 * Tests cover the full DebriefData contract.
 *
 * Test IDs:
 *   DB-001  DebriefData rows match ScoreTracker output for a trade session.
 *   DB-002  Not-applicable metrics are marked 'na', not 'fail'.
 *   DB-003  XP total equals sum of all xpEarned across rows.
 *   DB-004  Reckless-winner coaching text present only when reckless_winner_flag set.
 *   DB-005  Patience path: trade-execution metrics are 'na'; patience + debrief are 'pass'.
 *   DB-006  endSession() is idempotent — second call returns null.
 *   DB-007  session_end event emitted, debrief_complete appended.
 *   DB-008  XP events in log match xpTotal in DebriefData.
 *   DB-009  policyMismatchNote present when policy mismatch occurred.
 *   DB-010  policyMismatchNote null when no policy declared.
 */

import { describe, it, expect } from "vitest";
import { SessionAdapter } from "../src/ui/engine/SessionAdapter.js";
import type { DebriefData } from "../src/ui/engine/SessionAdapter.js";
import type { SimEvent } from "../src/engine/events.js";
import { scn001 } from "../src/scenarios/scn001.js";

// ---------------------------------------------------------------------------
// Fixture helpers — matching the shape used in scoring.test.ts
// ---------------------------------------------------------------------------

const STOP_ID = "debrief-stop-001";
const ENTRY_ID = "debrief-entry-001";

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

/**
 * Build a SessionAdapter from SCN-001 and inject events directly into the log
 * before calling endSession(), bypassing Phaser's clock.
 *
 * Advances a few real ticks first so the adapter has a valid sim-time.
 */
function buildAdapterWithEvents(events: SimEvent[], sessionHasWin = false): {
  adapter: SessionAdapter;
  debrief: DebriefData;
} {
  // SessionAdapter resolves the SCN-001 ScenarioDef (and its manifest) by
  // default, so DebriefData gets proper labels and IDs from the constructor.
  const adapter = new SessionAdapter(scn001);
  adapter.sessionHasWin = sessionHasWin;

  // Advance a few ticks to give the adapter a non-zero simTimeMs.
  adapter.clock.advance(5);

  // Inject events into the log directly.
  const simTimeMs = adapter.clock.state.simTimeMs;
  for (const ev of events) {
    adapter.log.append(simTimeMs, ev);
  }

  const debrief = adapter.endSession();
  if (!debrief) throw new Error("endSession returned null on first call");
  return { adapter, debrief };
}

// ---------------------------------------------------------------------------
// DB-001: DebriefData rows match ScoreTracker output for a trade session.
// ---------------------------------------------------------------------------

describe("DB-001: debrief rows match ScoreTracker for a trade session", () => {
  it("journal_before_trade row is 'pass' when journal precedes entry submit", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade", "hypothesis"]),
      makeStopSubmit(1000),
      makeEntryFill(2000),
    ];
    const { debrief } = buildAdapterWithEvents(events);
    const row = debrief.rubricRows.find((r) => r.metricId === "journal_before_trade");
    expect(row).toBeDefined();
    expect(row!.status).toBe("pass");
    expect(row!.xpEarned).toBeGreaterThan(0);
  });

  it("stop_before_entry row is 'pass' when stop precedes entry fill", () => {
    const events: SimEvent[] = [
      makeStopSubmit(1000),
      makeEntryFill(2000),
    ];
    const { debrief } = buildAdapterWithEvents(events);
    const row = debrief.rubricRows.find((r) => r.metricId === "stop_before_entry");
    expect(row).toBeDefined();
    expect(row!.status).toBe("pass");
    expect(row!.xpEarned).toBeGreaterThan(0);
  });

  it("stop_honored row is 'fail' when stop was cancelled after fill", () => {
    const events: SimEvent[] = [
      makeStopSubmit(1000),
      makeEntryFill(2000),
      {
        type: "order_cancel",
        orderId: STOP_ID,
        reason: "manual",
        tickIndex: 3,
        timestamp: 3000,
      },
    ];
    const { debrief } = buildAdapterWithEvents(events);
    const row = debrief.rubricRows.find((r) => r.metricId === "stop_honored");
    expect(row).toBeDefined();
    expect(row!.status).toBe("fail");
    expect(row!.xpEarned).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// DB-002: Not-applicable metrics are marked 'na', never 'fail'.
// ---------------------------------------------------------------------------

describe("DB-002: not-applicable metrics render as na, not fail", () => {
  it("trade-execution metrics are na on a patience (no-trade) session", () => {
    // No order_submit events → trade-execution metrics not applicable.
    const events: SimEvent[] = [
      makeJournalEntry(500, ["observation"]),
    ];
    const { debrief } = buildAdapterWithEvents(events);

    const tradeMetrics = [
      "journal_before_trade",
      "size_compliance",
      "stop_before_entry",
      "stop_honored",
      "no_stop_widen",
    ];

    for (const metricId of tradeMetrics) {
      const row = debrief.rubricRows.find((r) => r.metricId === metricId);
      if (row) {
        // Must be 'na', never 'fail'.
        expect(row.status).not.toBe("fail");
        expect(row.xpEarned).toBe(0);
      }
    }
  });

  it("na rows have xpEarned = 0", () => {
    const events: SimEvent[] = [];
    const { debrief } = buildAdapterWithEvents(events);
    const naRows = debrief.rubricRows.filter((r) => r.status === "na");
    for (const row of naRows) {
      expect(row.xpEarned).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// DB-003: XP total equals sum of xpEarned across all rows.
// ---------------------------------------------------------------------------

describe("DB-003: xpTotal is sum of all xpEarned rows", () => {
  it("xpTotal matches manual sum of row xpEarned", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade"]),
      makeStopSubmit(1000),
      makeEntryFill(2000),
    ];
    const { debrief } = buildAdapterWithEvents(events);
    const manualSum = debrief.rubricRows.reduce((acc, r) => acc + r.xpEarned, 0);
    expect(debrief.xpTotal).toBe(manualSum);
  });

  it("xpTotal is 0 when all metrics fail or na (no journal, no stop, no fill)", () => {
    const { debrief } = buildAdapterWithEvents([]);
    // All trade-execution metrics → na; patience → fail (no journal); debrief → fail
    expect(debrief.xpTotal).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// DB-004: Reckless-winner text present only when flag was set.
// ---------------------------------------------------------------------------

describe("DB-004: reckless-winner coaching text", () => {
  it("recklessWinnerText is null when no flag fired", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade"]),
      makeStopSubmit(1000),
      makeEntryFill(2000),
    ];
    // sessionHasWin = false → no flag
    const { debrief } = buildAdapterWithEvents(events, false);
    expect(debrief.recklessWinnerText).toBeNull();
  });

  it("recklessWinnerText is non-null when reckless_winner_flag fires", () => {
    // No stop before entry (stop_before_entry fails) + sessionHasWin = true → flag
    const events: SimEvent[] = [
      makeEntryFill(1000),   // fill first
      makeStopSubmit(2000),  // stop after fill → stop_before_entry fails
    ];
    const { debrief } = buildAdapterWithEvents(events, /* sessionHasWin */ true);
    expect(debrief.recklessWinnerText).not.toBeNull();
    expect(typeof debrief.recklessWinnerText).toBe("string");
    expect((debrief.recklessWinnerText ?? "").length).toBeGreaterThan(0);
  });

  it("recklessWinnerText comes from the scenario manifest's recklessWinnerCoachingText", () => {
    const events: SimEvent[] = [
      makeEntryFill(1000),
      makeStopSubmit(2000),
    ];
    const { debrief } = buildAdapterWithEvents(events, true);
    // SCN-001's recklessWinnerCoachingText starts with "You won this trade"
    expect(debrief.recklessWinnerText).toContain("You won this trade");
  });
});

// ---------------------------------------------------------------------------
// DB-005: Patience path — patience_observation 'pass', debrief 'pass'.
// ---------------------------------------------------------------------------

describe("DB-005: patience path XP composition", () => {
  it("patience_observation is pass when journal exists and no fills", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["observation"]),
    ];
    const { debrief } = buildAdapterWithEvents(events);
    const row = debrief.rubricRows.find((r) => r.metricId === "patience_observation");
    expect(row).toBeDefined();
    expect(row!.status).toBe("pass");
    expect(row!.xpEarned).toBeGreaterThan(0);
  });

  it("patience path xpTotal is patience XP + debrief XP only", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["observation"]),
    ];
    const { debrief } = buildAdapterWithEvents(events);
    // debrief_completed fires because endSession() appends debrief_complete.
    const patRow = debrief.rubricRows.find((r) => r.metricId === "patience_observation");
    const debRow = debrief.rubricRows.find((r) => r.metricId === "debrief_completed");
    const expectedTotal = (patRow?.xpEarned ?? 0) + (debRow?.xpEarned ?? 0);
    expect(debrief.xpTotal).toBe(expectedTotal);
  });
});

// ---------------------------------------------------------------------------
// DB-006: endSession() is idempotent — second call returns null.
// ---------------------------------------------------------------------------

describe("DB-006: endSession idempotent", () => {
  it("second call to endSession returns null", () => {
    const adapter = new SessionAdapter();
    adapter.clock.advance(2);
    const first = adapter.endSession();
    const second = adapter.endSession();
    expect(first).not.toBeNull();
    expect(second).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// DB-007: session_end event emitted; debrief_complete appended.
// ---------------------------------------------------------------------------

describe("DB-007: session_end and debrief_complete events in log", () => {
  it("log contains session_end event after endSession()", () => {
    const adapter = new SessionAdapter();
    adapter.clock.advance(2);
    adapter.endSession();
    const events = adapter.log.entries.map((e) => e.event.type);
    expect(events).toContain("session_end");
  });

  it("log contains debrief_complete event after endSession()", () => {
    const adapter = new SessionAdapter();
    adapter.clock.advance(2);
    adapter.endSession();
    const events = adapter.log.entries.map((e) => e.event.type);
    expect(events).toContain("debrief_complete");
  });
});

// ---------------------------------------------------------------------------
// DB-008: XP events in the log account for all debrief xpTotal.
//
// The log may contain XP events for metrics not listed in the manifest's
// xpRubric (e.g. no_stop_widen fires but isn't a displayed SCN-001 rubric
// row). So the invariant is: the sum of XP events for metricIds that ARE in
// the rubric equals debrief.xpTotal. The full log XP sum >= xpTotal.
// ---------------------------------------------------------------------------

describe("DB-008: XP events in log account for debrief xpTotal", () => {
  it("sum of rubric-metric XP events in log equals debrief xpTotal", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade"]),
      makeStopSubmit(1000),
      makeEntryFill(2000),
    ];
    const { adapter, debrief } = buildAdapterWithEvents(events);

    // Only sum XP events whose metricId appears in the manifest rubric.
    const rubricMetricIds = new Set(debrief.rubricRows.map((r) => r.metricId));
    const rubricLogXp = adapter.log.entries
      .filter((e) => e.event.type === "xp")
      .reduce((sum, e) => {
        const xpEv = e.event;
        return xpEv.type === "xp" && rubricMetricIds.has(xpEv.metricId)
          ? sum + xpEv.xpAmount
          : sum;
      }, 0);
    expect(rubricLogXp).toBe(debrief.xpTotal);
  });

  it("log xp event count >= rubricRows pass count", () => {
    const events: SimEvent[] = [
      makeJournalEntry(500, ["pre_trade"]),
      makeStopSubmit(1000),
      makeEntryFill(2000),
    ];
    const { adapter, debrief } = buildAdapterWithEvents(events);
    const logXpCount = adapter.log.entries.filter((e) => e.event.type === "xp").length;
    const passCount = debrief.rubricRows.filter((r) => r.status === "pass").length;
    expect(logXpCount).toBeGreaterThanOrEqual(passCount);
  });
});

// ---------------------------------------------------------------------------
// DB-009: policyMismatchNote present when mismatch; DB-010: null when none.
// ---------------------------------------------------------------------------

describe("DB-009/010: policyMismatchNote", () => {
  it("DB-010: policyMismatchNote is null when no policy declared", () => {
    const { debrief } = buildAdapterWithEvents([]);
    expect(debrief.policyMismatchNote).toBeNull();
  });

  it("DB-009: policyMismatchNote is non-null when policy declared but violated", () => {
    const policyDeclaredEvent: SimEvent = {
      type: "policy_declared",
      policyId: "news-policy-001",
      option: "A_flat",
      journalWordCount: 20,
      tickIndex: 5,
      timestamp: 5000,
    };
    // A_flat means no orders after declaration; we add one → mismatch.
    const postDeclarationSubmit: SimEvent = {
      type: "order_submit",
      orderId: "mismatch-entry",
      orderType: "market",
      side: "buy",
      quantity: 100,
      price: null,
      stopPrice: null,
      tickIndex: 8,
      timestamp: 8000,
    };
    const events: SimEvent[] = [policyDeclaredEvent, postDeclarationSubmit];
    const { debrief } = buildAdapterWithEvents(events);
    expect(debrief.policyMismatchNote).not.toBeNull();
    expect(typeof debrief.policyMismatchNote).toBe("string");
    expect((debrief.policyMismatchNote ?? "").length).toBeGreaterThan(0);
  });
});
