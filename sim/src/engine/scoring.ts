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
  | "policy_match"
  | "il_estimate_written"
  | "trigger_updated"
  | "no_entry_window"
  | "policy_declared_card";

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
  /**
   * Metric IDs listed in the running scenario's xpRubric (manifest.xpRubric).
   *
   * Scenario-specific metrics (il_estimate_written, trigger_updated,
   * no_entry_window, policy_declared_card) use membership here as their
   * applicability gate so they stay inert — no XP, no fail row — on scenarios
   * that do not author them.  Omitted/undefined → all four are inert
   * (backward-compatible with V0 fixtures and sandbox sessions).
   *
   * NOT a PnL field: this is authoring metadata, not outcome data.
   */
  readonly rubricMetricIds?: readonly string[];
  /**
   * Scenario-authored no-entry windows (sim-ms ranges) for no_entry_window —
   * e.g. SCN-005's first-15-minutes-of-D1-open, SCN-006's whipsaw window.
   */
  readonly noEntryWindows?: readonly { startMs: number; endMs: number }[];
  /**
   * Deadline (sim-ms) by which the News Policy Card must be declared for
   * policy_declared_card to pass (SCN-006: T-01).  Undefined → no deadline.
   */
  readonly policyDeadlineMs?: number;
}

// ---------------------------------------------------------------------------
// Metric result
// ---------------------------------------------------------------------------

export interface MetricResult {
  readonly metricId: MetricId;
  readonly passed: boolean;
  /**
   * XP amount to emit on pass (0 = no XP for this metric or it failed).
   * Ignored when applicable === false.
   */
  readonly xpOnPass: number;
  /**
   * Applicability flag — SIM_ENGINE_SPEC §4 "Scoring semantics — applicability".
   *
   * true  (default) — metric applies to this session; pass/fail determines XP.
   * false           — metric does not apply (e.g., a trade-execution metric when
   *                   no trade was taken).  The engine emits NO XP event and no
   *                   process-failure record.  This is NOT a fail.
   *
   * Rule: a not-applicable result must never penalise the player.  It simply
   * means the metric had no opportunity to fire.  XP emission requires both
   * applicable === true AND passed === true.
   */
  readonly applicable: boolean;
}

// ---------------------------------------------------------------------------
// Individual metric extractors — pure functions over MetricInput.
// Each function name matches a MetricId for self-documentation.
// ---------------------------------------------------------------------------

/**
 * journal_before_trade: a journal_entry event precedes the first order_submit.
 *
 * Applicability: requires that at least one order_submit event exists.  On a
 * patience run (no orders ever submitted) this metric is not applicable — the
 * patience path earns its journal XP through patience_observation instead.
 * Marking it not-applicable prevents double-counting journal reward on no-trade
 * sessions while preserving the metric's meaning: "you journaled before you
 * committed capital."
 */
export function journal_before_trade(input: MetricInput): MetricResult {
  const firstJournal = firstEventIndexOf(input.events, "journal_entry");
  const firstOrder = firstEventIndexOf(input.events, "order_submit");

  if (firstOrder === -1) {
    // No order was ever submitted — metric not applicable on patience path.
    return { metricId: "journal_before_trade", passed: false, xpOnPass: 20, applicable: false };
  }

  const passed = firstJournal !== -1 && firstJournal < firstOrder;
  return { metricId: "journal_before_trade", passed, xpOnPass: 20, applicable: true };
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
    // No position opened — metric not applicable; no XP event, no penalty.
    return { metricId: "stop_before_entry", passed: false, xpOnPass: 25, applicable: false };
  }

  // Stop must be submitted at or before the entry fill timestamp.
  const passed = stopSubmit.timestamp <= entryFill.timestamp;
  return { metricId: "stop_before_entry", passed, xpOnPass: 25, applicable: true };
}

/** stop_honored: stop order not manually cancelled after position open. */
export function stop_honored(input: MetricInput): MetricResult {
  // Find any stop order.
  const stopSubmit = input.events.find(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" && e.orderType === "stop"
  );

  if (!stopSubmit) {
    // No stop placed — metric not applicable; no XP event, no penalty.
    return { metricId: "stop_honored", passed: false, xpOnPass: 20, applicable: false };
  }

  // Find the entry fill (first order_fill that is NOT the stop itself).
  const entryFill = input.events.find(
    (e): e is OrderFillEvent =>
      e.type === "order_fill" && e.orderId !== stopSubmit.orderId
  );

  if (!entryFill) {
    // Entry never filled — stop cancellation before entry doesn't count as violation.
    // Still not applicable (no position was open).
    return { metricId: "stop_honored", passed: false, xpOnPass: 20, applicable: false };
  }

  // After the entry fill, was the stop manually cancelled?
  //
  // The harness auto-cancels all pending orders at scenario end with
  // reason "session_end" — engine housekeeping, not a player action.
  // §4.2 defines this metric as "stop not MANUALLY cancelled", so the
  // session-end cancel is exempt: a stop that rode untriggered to the end
  // of the session was honored, not abandoned.  (Without this exemption a
  // stop that never triggers — e.g. SCN-004's withdrawal trigger on the
  // up-divergence path — could never pass.)
  // ">=" not ">": a manual cancel logged at the same simTimeMs as the entry
  // fill (same-tick cancel-then-enter) is still abandoning the stop
  // (red-team finding R2-7).
  const stopCancelledAfterEntry = input.events.some(
    (e): e is OrderCancelEvent =>
      e.type === "order_cancel" &&
      e.orderId === stopSubmit.orderId &&
      e.reason !== "session_end" &&
      e.timestamp >= entryFill.timestamp
  );

  return {
    metricId: "stop_honored",
    passed: !stopCancelledAfterEntry,
    xpOnPass: 20,
    applicable: true,
  };
}

/** no_stop_widen: stop not moved further from entry after position open. */
export function no_stop_widen(input: MetricInput): MetricResult {
  const stopSubmit = input.events.find(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" && e.orderType === "stop"
  );

  if (!stopSubmit) {
    // No stop placed — metric not applicable; no XP event, no penalty.
    return { metricId: "no_stop_widen", passed: false, xpOnPass: 15, applicable: false };
  }

  const entryFill = input.events.find(
    (e): e is OrderFillEvent =>
      e.type === "order_fill" && e.orderId !== stopSubmit.orderId
  );

  if (!entryFill || stopSubmit.stopPrice === null) {
    // Stop placed but no position fill — not applicable yet.
    return { metricId: "no_stop_widen", passed: false, xpOnPass: 15, applicable: false };
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

  return { metricId: "no_stop_widen", passed: !stopWidened, xpOnPass: 15, applicable: true };
}

/** exit_journal: a journal_entry with tag 'exit' exists. Applicable only when a
 * fill exists — an exit journal without an exit is meaningless, and gating it
 * keeps the patience path from harvesting trade-metric XP (applicability rule). */
export function exit_journal(input: MetricInput): MetricResult {
  const applicable = input.events.some((e) => e.type === "order_fill");
  const passed =
    applicable &&
    input.events.some(
      (e): e is JournalEntryEvent =>
        e.type === "journal_entry" && e.tags.includes("exit")
    );
  return { metricId: "exit_journal", passed, xpOnPass: 15, applicable };
}

/** patience_observation: journaled without trading (no fills). */
export function patience_observation(input: MetricInput): MetricResult {
  const journalCount = input.events.filter(
    (e) => e.type === "journal_entry"
  ).length;
  const fillCount = input.events.filter((e) => e.type === "order_fill").length;
  const passed = journalCount >= 1 && fillCount === 0;
  return { metricId: "patience_observation", passed, xpOnPass: 40, applicable: true };
}

/** leverage_ack (forex only): leverage_risk_acknowledged before first fill. */
export function leverage_ack(input: MetricInput): MetricResult {
  const ackIdx = firstEventIndexOf(input.events, "leverage_risk_acknowledged");
  const firstFillIdx = firstEventIndexOf(input.events, "order_fill");

  const passed =
    ackIdx !== -1 && (firstFillIdx === -1 || ackIdx < firstFillIdx);

  return { metricId: "leverage_ack", passed, xpOnPass: 10, applicable: true };
}

/** debrief_completed: debrief_complete event present. */
export function debrief_completed(input: MetricInput): MetricResult {
  const passed = input.events.some((e) => e.type === "debrief_complete");
  return { metricId: "debrief_completed", passed, xpOnPass: 30, applicable: true };
}

/** session_reviewed: replay_started event present in a post-session context. */
export function session_reviewed(input: MetricInput): MetricResult {
  const passed = input.events.some((e) => e.type === "replay_started");
  return { metricId: "session_reviewed", passed, xpOnPass: 10, applicable: true };
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
    // No trade placed — metric not applicable; no XP event, no penalty.
    return { metricId: "size_compliance", passed: false, xpOnPass: 30, applicable: false };
  }

  const positionValue = firstSubmit.quantity * firstFill.fillPrice;
  const actualRiskPct = positionValue / input.sessionStartEquity;
  const tolerance = 0.1; // 10% of declared
  const lowerBound = input.declaredRiskPct * (1 - tolerance) / 100;
  const upperBound = input.declaredRiskPct * (1 + tolerance) / 100;
  const passed = actualRiskPct >= lowerBound && actualRiskPct <= upperBound;

  return { metricId: "size_compliance", passed, xpOnPass: 30, applicable: true };
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
  return { metricId: "plan_declared", passed, xpOnPass: 20, applicable: true };
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
  return { metricId: "plan_declared_late", passed, xpOnPass: 0, applicable: true };
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
    return { metricId: "policy_match", passed: false, xpOnPass: 0, applicable: false };
  }

  // A declaration made AFTER the card deadline carries no predictive
  // content — adherence to a retroactive "policy" is not process
  // (red-team finding R2-5a).  No deadline configured → no gate.
  if (
    input.policyDeadlineMs !== undefined &&
    declaration.timestamp > input.policyDeadlineMs
  ) {
    return { metricId: "policy_match", passed: false, xpOnPass: 0, applicable: true };
  }

  const declarationTick = declaration.tickIndex;
  const declaredOption = declaration.option;

  // The adherence window runs from the declaration to the end of the last
  // scenario-authored no-entry window (the event itself).  Behaviour after
  // the event — e.g. option A's planned re-entry on confirmation — is not a
  // policy violation.  Without authored windows, the window extends to the
  // end of the session (conservative).
  const windowEndMs =
    input.noEntryWindows !== undefined && input.noEntryWindows.length > 0
      ? Math.max(...input.noEntryWindows.map((w) => w.endMs))
      : Number.POSITIVE_INFINITY;

  // Order submits between the declaration and the end of the event window.
  // ">=" on timestamp: an action fired on the SAME tick as the declaration
  // (pause → declare → act) is inside the adherence window, not before it
  // (red-team finding NEW-1).
  const windowSubmits = input.events.filter(
    (e): e is OrderSubmitEvent =>
      e.type === "order_submit" &&
      e.timestamp >= declaration.timestamp &&
      e.timestamp <= windowEndMs
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
    // A_flat: no order_submit events between declaration and event-window end.
    passed = windowSubmits.length === 0;
  } else if (declaredOption === "B_hold_with_stop") {
    // B_hold_with_stop: position was held (at least one fill before declaration),
    // a stop order was present at or before the declaration tick, the stop was
    // not manually cancelled through the event window, and no new orders were
    // fired into the event window.  "Declare B, then dump your stop and trade
    // the whipsaw" is a mismatch, not adherence (red-team finding R2-5b).
    const stopIds = new Set(preDeclarationStopSubmits.map((s) => s.orderId));
    const stopAbandonedInWindow = input.events.some(
      (e): e is OrderCancelEvent =>
        e.type === "order_cancel" &&
        stopIds.has(e.orderId) &&
        e.reason !== "session_end" &&
        e.timestamp <= windowEndMs &&
        // ">=": a same-tick declare-then-cancel is abandonment (NEW-1).
        e.timestamp >= declaration.timestamp
    );
    passed =
      preDeclarationFills.length > 0 &&
      preDeclarationStopSubmits.length > 0 &&
      !stopAbandonedInWindow &&
      windowSubmits.length === 0;
  } else if (declaredOption === "C_observe_only") {
    // C_observe_only: no order_submit events between declaration and
    // event-window end.
    passed = windowSubmits.length === 0;
  }

  return { metricId: "policy_match", passed, xpOnPass: passed ? 25 : 0, applicable: true };
}

// ---------------------------------------------------------------------------
// Scenario-specific metrics (SCENARIOS_V1) — rubric-gated.
//
// Applicability rule shared by all four: the metric applies ONLY when the
// running scenario lists it in manifest.xpRubric (via MetricInput.rubricMetricIds).
// On every other scenario the metric is inert: applicable=false, no XP event,
// no fail row, no digest change for V0 golden fixtures.
// ---------------------------------------------------------------------------

/** True when the scenario's rubric authors this metric. */
function rubricAuthors(input: MetricInput, metricId: MetricId): boolean {
  return input.rubricMetricIds?.includes(metricId) ?? false;
}

/**
 * il_estimate_written (SCN-004) — LP Position Panel consulted and an IL
 * estimate written at the major-divergence checkpoint.
 *
 * Pass: a journal_entry tagged "il_estimate" exists after the first fill
 * (the deposit).  Applicable only when rubric-authored AND a deposit (fill)
 * occurred — an IL estimate is meaningless on an observation-only run, whose
 * journal XP flows through patience_observation instead.
 */
export function il_estimate_written(input: MetricInput): MetricResult {
  const firstFillIdx = firstEventIndexOf(input.events, "order_fill");
  const applicable =
    rubricAuthors(input, "il_estimate_written") && firstFillIdx !== -1;
  const passed =
    applicable &&
    input.events.some(
      (e, i): boolean =>
        e.type === "journal_entry" &&
        (e as JournalEntryEvent).tags.includes("il_estimate") &&
        i > firstFillIdx
    );
  return { metricId: "il_estimate_written", passed, xpOnPass: 25, applicable };
}

/**
 * trigger_updated (SCN-004) — withdrawal trigger updated after a decision to
 * hold (active management vs. passive neglect).
 *
 * Pass: a journal_entry tagged "trigger_update" exists after the first fill.
 * Applicable only when rubric-authored AND a position was opened.
 */
export function trigger_updated(input: MetricInput): MetricResult {
  const firstFillIdx = firstEventIndexOf(input.events, "order_fill");
  const applicable =
    rubricAuthors(input, "trigger_updated") && firstFillIdx !== -1;
  const passed =
    applicable &&
    input.events.some(
      (e, i): boolean =>
        e.type === "journal_entry" &&
        (e as JournalEntryEvent).tags.includes("trigger_update") &&
        i > firstFillIdx
    );
  return { metricId: "trigger_updated", passed, xpOnPass: 15, applicable };
}

/**
 * no_entry_window (SCN-005 D1-open, SCN-006 whipsaw) — discipline around a
 * scenario-authored no-entry window.
 *
 * Pass requires BOTH (per the SCENARIOS_V1 rubrics — "only if pre-stated"):
 *   1. No order_submit whose timestamp falls inside any authored window.
 *   2. The discipline was pre-stated: a plan/hypothesis journal entry OR a
 *      policy_declared event exists BEFORE the earliest window opens.
 *
 * Applicable only when rubric-authored AND windows were supplied.
 */
export function no_entry_window(input: MetricInput): MetricResult {
  const windows = input.noEntryWindows ?? [];
  const applicable =
    rubricAuthors(input, "no_entry_window") && windows.length > 0;
  if (!applicable) {
    return { metricId: "no_entry_window", passed: false, xpOnPass: 15, applicable: false };
  }

  // Both submits AND fills are checked: a stop-entry placed before the
  // window that fills inside it is still an entry during the window
  // (red-team finding R2-6).
  //
  // EXCEPTION (red-team finding NEW-2): a protective stop EXIT that triggers
  // inside the window is not an entry — punishing it would punish exactly
  // the pre-stated-stop discipline this metric exists to reward (e.g.
  // SCN-006 option B stopped out during the whipsaw).  A stop fill is
  // treated as protective iff the stop was submitted before the earliest
  // window opens AND an opposite-side non-stop fill precedes it (it closes
  // an existing position).  A pre-placed stop ENTRY has no prior opposite
  // fill and still fails the metric.
  const inAnyWindow = (ts: number): boolean =>
    windows.some((w) => ts >= w.startMs && ts <= w.endMs);
  const earliestWindowStart = Math.min(...windows.map((w) => w.startMs));

  const submitByOrderId = new Map<string, OrderSubmitEvent>();
  for (const e of input.events) {
    if (e.type === "order_submit" && !submitByOrderId.has(e.orderId)) {
      submitByOrderId.set(e.orderId, e);
    }
  }

  const isProtectiveStopFill = (fill: OrderFillEvent, fillIdx: number): boolean => {
    const submit = submitByOrderId.get(fill.orderId);
    if (submit === undefined || submit.orderType !== "stop") return false;
    if (submit.timestamp >= earliestWindowStart) return false;
    // Closes an existing position: an earlier opposite-side non-stop fill.
    return input.events.some((e, i): boolean => {
      if (i >= fillIdx || e.type !== "order_fill") return false;
      const s = submitByOrderId.get((e as OrderFillEvent).orderId);
      return s !== undefined && s.orderType !== "stop" && s.side !== submit.side;
    });
  };

  const enteredInWindow = input.events.some((e, i): boolean => {
    if (e.type === "order_submit") return inAnyWindow(e.timestamp);
    if (e.type === "order_fill") {
      return inAnyWindow(e.timestamp) && !isProtectiveStopFill(e, i);
    }
    return false;
  });

  const earliestStart = Math.min(...windows.map((w) => w.startMs));
  const preStated = input.events.some(
    (e): boolean =>
      (e.type === "journal_entry" &&
        ((e as JournalEntryEvent).tags.includes("plan") ||
          (e as JournalEntryEvent).tags.includes("hypothesis")) &&
        e.timestamp < earliestStart) ||
      (e.type === "policy_declared" && e.timestamp < earliestStart)
  );

  const passed = !enteredInWindow && preStated;
  return { metricId: "no_entry_window", passed, xpOnPass: 15, applicable: true };
}

/**
 * policy_declared_card (SCN-006) — News Policy Card completed with journal
 * rationale before the deadline (T-01).  The behaviour-match half of the card
 * is the separate policy_match metric.
 *
 * Pass: a policy_declared event exists with a non-trivial journal rationale
 * (>= MIN_POLICY_JOURNAL_WORDS words ≈ the spec's 30-character minimum,
 * TUNABLE) at or before MetricInput.policyDeadlineMs (when supplied).
 */
const MIN_POLICY_JOURNAL_WORDS = 6;

export function policy_declared_card(input: MetricInput): MetricResult {
  const applicable = rubricAuthors(input, "policy_declared_card");
  if (!applicable) {
    return { metricId: "policy_declared_card", passed: false, xpOnPass: 30, applicable: false };
  }

  const deadline = input.policyDeadlineMs;
  const passed = input.events.some(
    (e): e is PolicyDeclaredEvent =>
      e.type === "policy_declared" &&
      e.journalWordCount >= MIN_POLICY_JOURNAL_WORDS &&
      (deadline === undefined || e.timestamp <= deadline)
  );
  return { metricId: "policy_declared_card", passed, xpOnPass: 30, applicable: true };
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
  il_estimate_written,
  trigger_updated,
  no_entry_window,
  policy_declared_card,
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

  // XP emission — one event per metric that is applicable, passed, and has xpOnPass > 0.
  // Metrics with applicable === false emit no XP event (not a failure — just no opportunity).
  //
  // RUBRIC GATE (red-team finding R2-1): when the caller supplies
  // rubricMetricIds, only metrics the scenario AUTHORS in its xpRubric emit
  // XP.  This keeps the harness XP summary, the debrief xpTotal, and the
  // ProgressStore rank economy on one set of books — a scenario pays exactly
  // what it authors, nothing more.  Callers that pass no rubric (sandbox
  // sessions) keep the emit-all behavior.
  //
  // FOOTGUN: an EMPTY array is not "no rubric" — it authors zero XP and
  // silently zeroes the economy.  Pass undefined (not `xpRubric ?? []`)
  // for rubric-less sessions.
  const rubricGate = (metricId: MetricId): boolean =>
    input.rubricMetricIds === undefined ||
    input.rubricMetricIds.includes(metricId);
  const xpEvents: XpEvent[] = results
    .filter((r) => r.applicable && r.passed && r.xpOnPass > 0 && rubricGate(r.metricId))
    .map((r) => ({
      type: "xp" as const,
      sessionId,
      metricId: r.metricId,
      xpAmount: r.xpOnPass,
      tradeIndex: null,
      timestamp: simTimeMs,
    }));

  // Reckless-winner flag (§4.3): size_compliance or stop_before_entry applicable-and-failed
  // AND the session had at least one winning trade.
  // applicable === false means no trade was taken; the flag must not fire for patience runs.
  const sizeResult = results.find((r) => r.metricId === "size_compliance");
  const sizeFailed = (sizeResult?.applicable === true) && (sizeResult?.passed === false);
  const stopEntryResult = results.find((r) => r.metricId === "stop_before_entry");
  const stopEntryFailed = (stopEntryResult?.applicable === true) && (stopEntryResult?.passed === false);

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
  // did not match. Inert (no declaration) → no flag.  A declaration that
  // missed the card deadline is a LATENESS failure (policy_declared_card's
  // fail row), not a behaviour mismatch — no mismatch flag for it
  // (red-team finding NEW-4).
  const policyResult = results.find((r) => r.metricId === "policy_match");
  const declaration = input.events.find(
    (e): e is PolicyDeclaredEvent => e.type === "policy_declared"
  );
  const declarationOnTime =
    declaration !== undefined &&
    (input.policyDeadlineMs === undefined ||
      declaration.timestamp <= input.policyDeadlineMs);
  let policyMismatchFlag: PolicyMismatchFlag | null = null;
  if (declaration && declarationOnTime && policyResult && !policyResult.passed) {
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
