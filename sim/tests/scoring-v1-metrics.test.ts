/**
 * Scenario-specific metric tests — SCENARIOS_V1 additions to scoring.ts:
 *   il_estimate_written, trigger_updated, no_entry_window, policy_declared_card
 *
 * The shared invariant under test: all four are RUBRIC-GATED — inert
 * (applicable=false, no XP, no fail row) unless the running scenario lists
 * them in manifest.xpRubric (MetricInput.rubricMetricIds).  This is what
 * keeps the V0 golden digests byte-identical.
 *
 * Style mirrors tests/scoring.test.ts: build a MetricInput from a typed
 * event array, call the extractor, assert MetricResult fields.
 */

import { describe, it, expect } from "vitest";
import {
  il_estimate_written,
  trigger_updated,
  no_entry_window,
  policy_declared_card,
  type MetricInput,
} from "../src/engine/scoring.js";
import type { SimEvent } from "../src/engine/events.js";
import { allScenarios } from "../src/scenarios/registry.js";

// ---------------------------------------------------------------------------
// Event factories (minimal fields the extractors read)
// ---------------------------------------------------------------------------

function journal(tags: string[], timestamp: number, tickIndex = 0): SimEvent {
  return {
    type: "journal_entry",
    entryId: `j-${timestamp}`,
    tags,
    wordCount: 20,
    tickIndex,
    timestamp,
  };
}

function fill(timestamp: number, tickIndex = 0): SimEvent {
  return {
    type: "order_fill",
    orderId: "entry-1",
    fillPrice: 4.2,
    slippage: 0,
    spreadCost: 0,
    feeCost: 0,
    tickIndex,
    timestamp,
  };
}

function submit(timestamp: number, tickIndex = 0): SimEvent {
  return {
    type: "order_submit",
    orderId: `o-${timestamp}`,
    orderType: "market",
    side: "buy",
    quantity: 1,
    price: null,
    stopPrice: null,
    tickIndex,
    timestamp,
  };
}

function policyDeclared(
  timestamp: number,
  option: "A_flat" | "B_hold_with_stop" | "C_observe_only" = "B_hold_with_stop",
  journalWordCount = 12
): SimEvent {
  return {
    type: "policy_declared",
    policyId: "card-1",
    option,
    journalWordCount,
    tickIndex: 0,
    timestamp,
  };
}

function makeInput(
  events: SimEvent[],
  extra: Partial<Pick<MetricInput, "rubricMetricIds" | "noEntryWindows" | "policyDeadlineMs">> = {}
): MetricInput {
  return {
    events,
    sessionHasWin: false,
    declaredRiskPct: 1,
    sessionStartEquity: 10_000,
    ...extra,
  } as MetricInput;
}

const ALL_V1_IDS = [
  "il_estimate_written",
  "trigger_updated",
  "no_entry_window",
  "policy_declared_card",
];

// ---------------------------------------------------------------------------
// Rubric ↔ extractor XP parity (red-team finding NEW-3)
//
// XP amounts are dual-sourced: XpEvents carry the extractor's hardcoded
// xpOnPass; debrief rows carry the manifest rubric's xpOnPass.  runScoreTracker
// rubric-gates emission so both books MUST stay equal — this canonical table
// breaks loudly if either side is re-tuned without the other.
// ---------------------------------------------------------------------------

const CANONICAL_XP: Record<string, number> = {
  journal_before_trade: 20,
  size_compliance: 30,
  stop_before_entry: 25,
  stop_honored: 20,
  exit_journal: 15,
  no_stop_widen: 15,
  patience_observation: 40,
  leverage_ack: 10,
  debrief_completed: 30,
  session_reviewed: 10,
  plan_declared: 20,
  plan_declared_late: 0,
  policy_match: 25,
  il_estimate_written: 25,
  trigger_updated: 15,
  no_entry_window: 15,
  policy_declared_card: 30,
};

describe("rubric ↔ extractor XP parity (one set of books)", () => {
  it("every registered scenario's xpRubric amounts match the canonical metric XP", () => {
    for (const scn of allScenarios()) {
      for (const entry of scn.manifest.xpRubric) {
        expect(
          CANONICAL_XP[entry.metricId],
          `${scn.manifest.id}: rubric metric '${entry.metricId}' is not in the canonical XP table`
        ).toBeDefined();
        expect(
          entry.xpOnPass,
          `${scn.manifest.id}: rubric '${entry.metricId}' xpOnPass diverges from the extractor's canonical amount`
        ).toBe(CANONICAL_XP[entry.metricId]);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Rubric gating — the V0-digest-protection invariant
// ---------------------------------------------------------------------------

describe("rubric gating: V1 metrics are inert off their scenarios", () => {
  it("all four are inapplicable when rubricMetricIds is absent", () => {
    const events = [
      journal(["plan"], 0),
      submit(100),
      fill(110),
      journal(["il_estimate"], 200),
      journal(["trigger_update"], 300),
      policyDeclared(50),
    ];
    const input = makeInput(events); // no rubricMetricIds
    expect(il_estimate_written(input).applicable).toBe(false);
    expect(trigger_updated(input).applicable).toBe(false);
    expect(no_entry_window(input).applicable).toBe(false);
    expect(policy_declared_card(input).applicable).toBe(false);
  });

  it("all four are inapplicable when the rubric lists other metrics only", () => {
    const input = makeInput(
      [journal(["il_estimate"], 200), submit(100), fill(110)],
      { rubricMetricIds: ["journal_before_trade", "debrief_completed"] }
    );
    expect(il_estimate_written(input).applicable).toBe(false);
    expect(trigger_updated(input).applicable).toBe(false);
    expect(no_entry_window(input).applicable).toBe(false);
    expect(policy_declared_card(input).applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// il_estimate_written
// ---------------------------------------------------------------------------

describe("il_estimate_written", () => {
  const rubric = { rubricMetricIds: ALL_V1_IDS };

  it("passes when an il_estimate journal follows the deposit fill", () => {
    const input = makeInput(
      [submit(100), fill(110), journal(["il_estimate"], 200)],
      rubric
    );
    const r = il_estimate_written(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.xpOnPass).toBe(25);
  });

  it("fails when the journal precedes the fill (panel not yet relevant)", () => {
    const input = makeInput(
      [journal(["il_estimate"], 50), submit(100), fill(110)],
      rubric
    );
    const r = il_estimate_written(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("inapplicable on a no-deposit session (patience path owns the XP)", () => {
    const input = makeInput([journal(["il_estimate"], 200)], rubric);
    expect(il_estimate_written(input).applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// trigger_updated
// ---------------------------------------------------------------------------

describe("trigger_updated", () => {
  const rubric = { rubricMetricIds: ALL_V1_IDS };

  it("passes when a trigger_update journal follows the fill", () => {
    const input = makeInput(
      [submit(100), fill(110), journal(["trigger_update"], 300)],
      rubric
    );
    const r = trigger_updated(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.xpOnPass).toBe(15);
  });

  it("fails without the tagged journal", () => {
    const input = makeInput(
      [submit(100), fill(110), journal(["observation"], 300)],
      rubric
    );
    const r = trigger_updated(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// no_entry_window
// ---------------------------------------------------------------------------

describe("no_entry_window", () => {
  const windows = [{ startMs: 1_000, endMs: 2_000 }];
  const base = { rubricMetricIds: ALL_V1_IDS, noEntryWindows: windows };

  it("passes: discipline pre-stated AND no order in the window", () => {
    const input = makeInput([journal(["plan"], 0), submit(3_000)], base);
    const r = no_entry_window(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.xpOnPass).toBe(15);
  });

  it("a policy declaration also counts as pre-stating", () => {
    const input = makeInput([policyDeclared(500, "C_observe_only")], base);
    expect(no_entry_window(input).passed).toBe(true);
  });

  it("fails when an order lands inside the window", () => {
    const input = makeInput([journal(["plan"], 0), submit(1_500)], base);
    const r = no_entry_window(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("fails when the discipline was never pre-stated (spec: 'only if pre-stated')", () => {
    const input = makeInput([journal(["observation"], 0), submit(3_000)], base);
    expect(no_entry_window(input).passed).toBe(false);
  });

  it("a plan journal AFTER the window opens does not count as pre-stating", () => {
    const input = makeInput([journal(["plan"], 1_200), submit(3_000)], base);
    expect(no_entry_window(input).passed).toBe(false);
  });

  it("inapplicable when the scenario authors no windows", () => {
    const input = makeInput([journal(["plan"], 0)], { rubricMetricIds: ALL_V1_IDS });
    expect(no_entry_window(input).applicable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// policy_declared_card
// ---------------------------------------------------------------------------

describe("policy_declared_card", () => {
  const base = { rubricMetricIds: ALL_V1_IDS, policyDeadlineMs: 1_140_000 };

  it("passes: declared with rationale before the deadline", () => {
    const input = makeInput([policyDeclared(900_000)], base);
    const r = policy_declared_card(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(true);
    expect(r.xpOnPass).toBe(30);
  });

  it("fails when declared after the deadline", () => {
    const input = makeInput([policyDeclared(1_175_000)], base);
    const r = policy_declared_card(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("fails when the journal rationale is too thin", () => {
    const input = makeInput(
      [policyDeclared(900_000, "B_hold_with_stop", 2)],
      base
    );
    expect(policy_declared_card(input).passed).toBe(false);
  });

  it("fails when no declaration exists (the spec's most common error)", () => {
    const input = makeInput([journal(["plan"], 0)], base);
    const r = policy_declared_card(input);
    expect(r.applicable).toBe(true);
    expect(r.passed).toBe(false);
  });

  it("passes without a deadline configured (deadline optional)", () => {
    const input = makeInput([policyDeclared(2_000_000)], {
      rubricMetricIds: ALL_V1_IDS,
    });
    expect(policy_declared_card(input).passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Wave C red-team regression — F6 journal quality floor
// ---------------------------------------------------------------------------

import {
  patience_observation,
  journal_before_trade,
} from "../src/engine/scoring.js";

describe("F6: journal quality floor — empty saves buy no process XP", () => {
  it("patience_observation fails on a zero-word journal", () => {
    const input = makeInput([journalWords(0, 100)]);
    expect(patience_observation(input).passed).toBe(false);
  });

  it("patience_observation passes at the 5-word floor", () => {
    const input = makeInput([journalWords(5, 100)]);
    expect(patience_observation(input).passed).toBe(true);
  });

  it("journal_before_trade ignores a 2-word pre-trade note", () => {
    const input = makeInput([journalWords(2, 50), submit(100), fill(110)]);
    expect(journal_before_trade(input).passed).toBe(false);
  });

  it("journal_before_trade passes with a real pre-trade entry", () => {
    const input = makeInput([journalWords(12, 50), submit(100), fill(110)]);
    expect(journal_before_trade(input).passed).toBe(true);
  });
});

function journalWords(wordCount: number, timestamp: number): SimEvent {
  return {
    type: "journal_entry",
    entryId: `jw-${timestamp}`,
    tags: ["observation"],
    wordCount,
    tickIndex: 0,
    timestamp,
  };
}
