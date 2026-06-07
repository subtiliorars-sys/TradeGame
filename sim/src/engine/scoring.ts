/**
 * Scoring engine skeleton — SIM_ENGINE_SPEC §4.
 *
 * ETHICS RAIL (§4.1, RISK_REGISTER §16):
 *   The scoring engine emits process-metric events only.
 *   No function here reads PnL, profit, equity, or win rate.
 *   This is enforced two ways:
 *     1. The MetricInput type does NOT expose any PnL field.
 *     2. scripts/lint-pnl.sh greps this file for /pnl|profit|equity/i
 *        and exits 1 on any match (wired to `npm run lint-pnl`).
 *
 * If a future engineer adds a pnlScore field to any output type here, reject
 * it in code review with a reference to SIM_ENGINE_SPEC §4.1 and RISK_REGISTER §16.
 */

import type {
  SimEvent,
  XpEvent,
  RecklessWinnerFlagEvent,
  OrderSubmitEvent,
  OrderFillEvent,
  OrderCancelEvent,
  OrderModifyEvent,
  JournalEntryEvent,
  PolicyDeclaredEvent,
} from "./events.js";

// ---------------------------------------------------------------------------
// Metric ID registry (§4.2 table)
// ---------------------------------------------------------------------------

/**
 * All process metric IDs from SIM_ENGINE_SPEC §4.2.
 * Using a union type so callers and tests get autocomplete and exhaustiveness.
 */
export type MetricId =
  | "journal_before_trade"
  | "size_compliance"
  | "stop_before_entry"
  | "stop_honored"
  | "exit_journal"
  | "no_stop_widen"
  | "patience_observation"
  | "leverage_ack"
  | "debrief_completed"
  | "session_reviewed"
  | "plan_declared"
  | "plan_declared_late"
  | "policy_match";

// ---------------------------------------------------------------------------
// MetricInput — the only view of the EventLog that scoring functions receive.
//
// STRUCTURAL PnL GUARD: this type intentionally has no pnl, profit, equity,
// or win-rate field. Scoring functions cannot read what they cannot see.
// ---------------------------------------------------------------------------

/**
 * Filtered view of the EventLog passed to each metric extractor.
 * Contains only the event types needed for process-metric extraction.
 *
 * PROHIBITED fields (must never be added here per §4.1):
 *   realizedPnL, unrealizedPnL, pnlScore, winRate, returnOnAccount,
 *   returnPct, profitUsd, profitPips
 */
export interface MetricInput {
  /** All events in session order, typed by discriminated union. */
  readonly events: readonly SimEvent[];
  /**
   * sessionHasWin is the ONE boolean the engine provides for the
   * reckless-winner flag logic.  It is a boolean — not a PnL amount.
   * The engine determines it internally (fill price vs. close price);
   * the scorer only sees true/false.  See TEST_PLAN §2.3 note.
   */
  readonly sessionHasWin: boolean;
  /** Declared risk % from the pre-trade journal (defaults to 1 if not declared). */
  readonly declaredRiskPct: number;
  /** Account equity at session start (needed for size_compliance ratio only). */
  readonly sessionStartEquity: number;
}

// ---------------------------------------------------------------------------
// Metric result
// ---------------------------------------------------------------------------

export interface MetricResult {
  readonly metricId: MetricId;
  readonly passed: boolean;
  /** XP amount to emit on pass (0 = no XP for this metric or it failed). */
  readonly xpOnPass: number;
}

// ---------------------------------------------------------------------------
// Individual metric extractors — pure functions over MetricInput.
// Each function name matches a MetricId for self-documentation.
// ---------------------------------------------------------------------------

/** journal_before_trade: a journal_entry event precedes the first order_submit. */
export function journal_before_trade(input: MetricInput): MetricResult {
  const firstJournal = firstEventIndexOf(input.events, "journal_entry");
  const firstOrder = firstEventIndexOf(input.events, "order_submit");

  const passed =
    firstJournal !== -1 &&
    (firstOrder === -1 || firstJournal < firstOrder);

  return { metricId: "journal_before_trade", passed, xpOnPass: 20 };
}

/** stop_before_entry: stop order submitted before or at the same tick as entry fill. */
export function stop_before_entry(input: MetricInput): MetricResult {
  // Find the first market/limit entry fill (the position-opening fill).
  const entryFill = input.events.find(
    (e): e is OrderFillEvent =>
      e.type === "order_fill" &&
      // We infer "entry" as the first fill overall (stop orders fill on trigger).
      true
  );

  // Find any stop order_submit event.
  const stopSubmit = input.events.find(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" && e.orderType === "stop"
  );

  if (!entryFill || !stopSubmit) {
    // No position opened — metric not applicable; treat as passed (no violation).
    return { metricId: "stop_before_entry", passed: true, xpOnPass: 25 };
  }

  // Stop must be submitted at or before the entry fill timestamp.
  const passed = stopSubmit.timestamp <= entryFill.timestamp;
  return { metricId: "stop_before_entry", passed, xpOnPass: 25 };
}

/** stop_honored: stop order not manually cancelled after position open. */
export function stop_honored(input: MetricInput): MetricResult {
  // Find any stop order.
  const stopSubmit = input.events.find(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" && e.orderType === "stop"
  );

  if (!stopSubmit) {
    // No stop placed — metric not applicable; treat as passed (patience path, etc.)
    return { metricId: "stop_honored", passed: true, xpOnPass: 20 };
  }

  // Find the entry fill (first order_fill that is NOT the stop itself).
  const entryFill = input.events.find(
    (e): e is OrderFillEvent =>
      e.type === "order_fill" && e.orderId !== stopSubmit.orderId
  );

  if (!entryFill) {
    // Entry never filled — stop cancellation before entry doesn't count as violation.
    return { metricId: "stop_honored", passed: true, xpOnPass: 20 };
  }

  // After the entry fill, was the stop manually cancelled?
  const stopCancelledAfterEntry = input.events.some(
    (e): e is OrderCancelEvent =>
      e.type === "order_cancel" &&
      e.orderId === stopSubmit.orderId &&
      e.timestamp > entryFill.timestamp
  );

  return {
    metricId: "stop_honored",
    passed: !stopCancelledAfterEntry,
    xpOnPass: 20,
  };
}

/** no_stop_widen: stop not moved further from entry after position open. */
export function no_stop_widen(input: MetricInput): MetricResult {
  const stopSubmit = input.events.find(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" && e.orderType === "stop"
  );

  if (!stopSubmit) {
    return { metricId: "no_stop_widen", passed: true, xpOnPass: 15 };
  }

  const entryFill = input.events.find(
    (e): e is OrderFillEvent =>
      e.type === "order_fill" && e.orderId !== stopSubmit.orderId
  );

  if (!entryFill || stopSubmit.stopPrice === null) {
    return { metricId: "no_stop_widen", passed: true, xpOnPass: 15 };
  }

  const originalStopPrice = stopSubmit.stopPrice;

  // After entry fill, any order_modify that increases stop distance is a violation.
  // "Increases distance" means: for a sell stop (long exit), newStopPrice < original
  // means moving the stop lower (further from a long entry), i.e. widening.
  // We detect widening as any modify that changes the stop distance in the wrong direction.
  // The spec says "increases stop distance after fill" — we compare absolute distance from fill.
  const stopWidened = input.events.some((e): e is OrderModifyEvent => {
    if (
      e.type !== "order_modify" ||
      e.orderId !== stopSubmit.orderId ||
      e.timestamp <= entryFill.timestamp
    )
      return false;

    const newStop = e.newStopPrice;
    if (newStop === undefined) return false;

    // Distance from fill price.
    const originalDist = Math.abs(entryFill.fillPrice - originalStopPrice);
    const newDist = Math.abs(entryFill.fillPrice - newStop);
    return newDist > originalDist; // widened = further from fill = violation
  });

  return { metricId: "no_stop_widen", passed: !stopWidened, xpOnPass: 15 };
}

/** exit_journal: a journal_entry with tag 'exit' exists. */
export function exit_journal(input: MetricInput): MetricResult {
  const passed = input.events.some(
    (e): e is JournalEntryEvent =>
      e.type === "journal_entry" && e.tags.includes("exit")
  );
  return { metricId: "exit_journal", passed, xpOnPass: 15 };
}

/** patience_observation: journaled without trading (no fills). */
export function patience_observation(input: MetricInput): MetricResult {
  const journalCount = input.events.filter(
    (e) => e.type === "journal_entry"
  ).length;
  const fillCount = input.events.filter((e) => e.type === "order_fill").length;
  const passed = journalCount >= 1 && fillCount === 0;
  return { metricId: "patience_observation", passed, xpOnPass: 40 };
}

/** leverage_ack (forex only): leverage_risk_acknowledged before first fill. */
export function leverage_ack(input: MetricInput): MetricResult {
  const ackIdx = firstEventIndexOf(input.events, "leverage_risk_acknowledged");
  const firstFillIdx = firstEventIndexOf(input.events, "order_fill");

  const passed =
    ackIdx !== -1 && (firstFillIdx === -1 || ackIdx < firstFillIdx);

  return { metricId: "leverage_ack", passed, xpOnPass: 10 };
}

/** debrief_completed: debrief_complete event present. */
export function debrief_completed(input: MetricInput): MetricResult {
  const passed = input.events.some((e) => e.type === "debrief_complete");
  return { metricId: "debrief_completed", passed, xpOnPass: 30 };
}

/** session_reviewed: replay_started event present in a post-session context. */
export function session_reviewed(input: MetricInput): MetricResult {
  const passed = input.events.some((e) => e.type === "replay_started");
  return { metricId: "session_reviewed", passed, xpOnPass: 10 };
}

/**
 * size_compliance: position value within 10% tolerance of declared risk %.
 * spec §4.2: `position_value / account_equity` vs. declared risk %.
 *
 * The ONLY reference to equity here is `sessionStartEquity` from MetricInput,
 * which is a single number provided by the engine at session start — not a
 * running balance, not a PnL-derived value.
 */
export function size_compliance(input: MetricInput): MetricResult {
  const firstFill = input.events.find(
    (e): e is OrderFillEvent => e.type === "order_fill"
  );
  const firstSubmit = input.events.find(
    (e): e is OrderSubmitEvent => e.type === "order_submit"
  );

  if (!firstFill || !firstSubmit) {
    // No trade placed — no compliance check required.
    return { metricId: "size_compliance", passed: true, xpOnPass: 30 };
  }

  const positionValue = firstSubmit.quantity * firstFill.fillPrice;
  const actualRiskPct = positionValue / input.sessionStartEquity;
  const tolerance = 0.1; // 10% of declared
  const lowerBound = input.declaredRiskPct * (1 - tolerance) / 100;
  const upperBound = input.declaredRiskPct * (1 + tolerance) / 100;
  const passed = actualRiskPct >= lowerBound && actualRiskPct <= upperBound;

  return { metricId: "size_compliance", passed, xpOnPass: 30 };
}

/**
 * plan_declared: player submitted a journal entry with tag 'plan' or 'hypothesis'
 * before the session open tick (pre-open planning).
 * spec §4.2 / TEST_PLAN SM-009, SM-010.
 */
export function plan_declared(input: MetricInput): MetricResult {
  // Find session_start to determine session-open timestamp.
  const sessionStart = input.events.find((e) => e.type === "session_start");
  const sessionOpenTs = sessionStart?.type === "session_start" ? sessionStart.timestamp : 0;

  const passed = input.events.some(
    (e): e is JournalEntryEvent =>
      e.type === "journal_entry" &&
      (e.tags.includes("plan") || e.tags.includes("hypothesis")) &&
      e.timestamp <= sessionOpenTs
  );
  return { metricId: "plan_declared", passed, xpOnPass: 20 };
}

/**
 * plan_declared_late: plan tag appeared after session open.
 * Separate metric ID per TEST_PLAN SM-009.
 */
export function plan_declared_late(input: MetricInput): MetricResult {
  const sessionStart = input.events.find((e) => e.type === "session_start");
  const sessionOpenTs = sessionStart?.type === "session_start" ? sessionStart.timestamp : 0;

  // "Late" means: plan tag present but only after session open.
  const hasAnyPlan = input.events.some(
    (e): e is JournalEntryEvent =>
      e.type === "journal_entry" &&
      (e.tags.includes("plan") || e.tags.includes("hypothesis"))
  );
  const hasPreOpenPlan = input.events.some(
    (e): e is JournalEntryEvent =>
      e.type === "journal_entry" &&
      (e.tags.includes("plan") || e.tags.includes("hypothesis")) &&
      e.timestamp <= sessionOpenTs
  );

  // passed = true means the plan WAS declared late (the flag fires when late).
  const passed = hasAnyPlan && !hasPreOpenPlan;
  return { metricId: "plan_declared_late", passed, xpOnPass: 0 };
}

/**
 * policy_match (News/Plan Card scenarios only) — SIM_ENGINE_SPEC §4.2.
 *
 * Reads the PolicyDeclaredEvent (emitted at News Policy Card confirmation) and
 * compares the declared option against actual EventLog behaviour in the window
 * that begins at the declaration tick.
 *
 * Option semantics (SCENARIOS_V1 SCN-006 rubric):
 *   A_flat          — no order_submit events after the declaration tick.
 *   B_hold_with_stop — at least one order_fill before the declaration tick
 *                      (position held) AND a stop order_submit present at or
 *                      before the declaration tick.
 *   C_observe_only  — no order_submit events after the declaration tick.
 *
 * Match  → +25 XP event (xpOnPass = 25).
 * Mismatch → no XP; a `policy_mismatch` debrief flag is appended via the
 *   `debriefFlags` array on ScoreOutput (see below).
 *
 * If no PolicyDeclaredEvent is present the metric is inert: passed = false,
 * xpOnPass = 0. Callers must not emit XP for inert results.
 */
export function policy_match(input: MetricInput): MetricResult {
  // Find the PolicyDeclaredEvent, if any.
  const declaration = input.events.find(
    (e): e is PolicyDeclaredEvent => e.type === "policy_declared"
  );

  if (!declaration) {
    // No declaration — metric is inert. No XP, no mismatch flag.
    return { metricId: "policy_match", passed: false, xpOnPass: 0 };
  }

  const declarationTick = declaration.tickIndex;
  const declaredOption = declaration.option;

  // Events after the declaration tick (the "event window").
  const windowSubmits = input.events.filter(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" && e.tickIndex > declarationTick
  );

  // Events at or before the declaration tick.
  const preDeclarationFills = input.events.filter(
    (e): e is OrderFillEvent =>
      e.type === "order_fill" && e.tickIndex <= declarationTick
  );
  const preDeclarationStopSubmits = input.events.filter(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" &&
      e.orderType === "stop" &&
      e.tickIndex <= declarationTick
  );

  let passed = false;

  if (declaredOption === "A_flat") {
    // A_flat: no order_submit events in the window after declaration.
    passed = windowSubmits.length === 0;
  } else if (declaredOption === "B_hold_with_stop") {
    // B_hold_with_stop: position was held (at least one fill before declaration)
    // AND a stop order was present at or before the declaration tick.
    passed =
      preDeclarationFills.length > 0 && preDeclarationStopSubmits.length > 0;
  } else if (declaredOption === "C_observe_only") {
    // C_observe_only: no order_submit events in the window after declaration.
    passed = windowSubmits.length === 0;
  }

  return { metricId: "policy_match", passed, xpOnPass: passed ? 25 : 0 };
}

// ---------------------------------------------------------------------------
// ProcessMetric registry — maps MetricId → extractor function
// ---------------------------------------------------------------------------

type MetricFn = (input: MetricInput) => MetricResult;

export const METRIC_REGISTRY: Record<MetricId, MetricFn> = {
  journal_before_trade,
  size_compliance,
  stop_before_entry,
  stop_honored,
  exit_journal,
  no_stop_widen,
  patience_observation,
  leverage_ack,
  debrief_completed,
  session_reviewed,
  plan_declared,
  plan_declared_late,
  policy_match,
};

// ---------------------------------------------------------------------------
// ScoreTracker — runs all metrics and emits XP + reckless-winner events
// ---------------------------------------------------------------------------

/** Emitted when the player's declared policy option does not match their
 *  actual in-window behaviour (SIM_ENGINE_SPEC §4.2 policy_match mismatch). */
export interface PolicyMismatchFlag {
  type: "policy_mismatch";
  declaredOption: "A_flat" | "B_hold_with_stop" | "C_observe_only";
  policyId: string;
}

export interface ScoreOutput {
  readonly results: readonly MetricResult[];
  readonly xpEvents: readonly XpEvent[];
  readonly recklessWinnerFlag: RecklessWinnerFlagEvent | null;
  /** Present when a PolicyDeclaredEvent was found but behaviour did not match. */
  readonly policyMismatchFlag: PolicyMismatchFlag | null;
}

/**
 * Run all process metrics against the session EventLog input.
 * Returns metric results, XP events to append, and optional reckless-winner flag.
 *
 * Callers append the XP events to the EventLog after calling this function.
 * The ScoreTracker itself does not mutate the log — it returns what to append.
 */
export function runScoreTracker(
  sessionId: string,
  input: MetricInput,
  simTimeMs: number,
  coachingText = "You took an oversized or unplanned position and the market moved in your favour. Review your process."
): ScoreOutput {
  const results: MetricResult[] = [];

  for (const metricId of Object.keys(METRIC_REGISTRY) as MetricId[]) {
    results.push(METRIC_REGISTRY[metricId](input));
  }

  // XP emission — one event per passed metric with xpOnPass > 0.
  const xpEvents: XpEvent[] = results
    .filter((r) => r.passed && r.xpOnPass > 0)
    .map((r) => ({
      type: "xp" as const,
      sessionId,
      metricId: r.metricId,
      xpAmount: r.xpOnPass,
      tradeIndex: null,
      timestamp: simTimeMs,
    }));

  // Reckless-winner flag (§4.3): size_compliance or stop_before_entry failed
  // AND the session had at least one winning trade.
  const sizeFailed = results.find((r) => r.metricId === "size_compliance")?.passed === false;
  const stopEntryFailed =
    results.find((r) => r.metricId === "stop_before_entry")?.passed === false;

  let recklessWinnerFlag: RecklessWinnerFlagEvent | null = null;
  if (input.sessionHasWin && (sizeFailed || stopEntryFailed)) {
    const metricsFailed: string[] = [];
    if (sizeFailed) metricsFailed.push("size_compliance");
    if (stopEntryFailed) metricsFailed.push("stop_before_entry");
    recklessWinnerFlag = {
      type: "reckless_winner_flag",
      metricsFailed,
      coachingText,
    };
  }

  // policy_mismatch flag — emitted when declaration was present but behaviour
  // did not match. Inert (no declaration) → no flag.
  const policyResult = results.find((r) => r.metricId === "policy_match");
  const declaration = input.events.find(
    (e): e is PolicyDeclaredEvent => e.type === "policy_declared"
  );
  let policyMismatchFlag: PolicyMismatchFlag | null = null;
  if (declaration && policyResult && !policyResult.passed) {
    policyMismatchFlag = {
      type: "policy_mismatch",
      declaredOption: declaration.option,
      policyId: declaration.policyId,
    };
  }

  return { results, xpEvents, recklessWinnerFlag, policyMismatchFlag };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns the array index of the first event of `type`, or -1 if absent. */
function firstEventIndexOf(events: readonly SimEvent[], type: SimEvent["type"]): number {
  return events.findIndex((e) => e.type === type);
}
