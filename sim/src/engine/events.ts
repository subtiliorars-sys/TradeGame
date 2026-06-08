/**
 * EventLog schema — SIM_ENGINE_SPEC §5.
 *
 * The EventLog is the canonical session record. Every event is a typed object
 * in a discriminated union. The log is append-only; nothing is ever mutated
 * after emission.
 *
 * Privacy design: JournalEntryEvent carries wordCount + tags only.
 * Journal TEXT is stored separately (server-side, encrypted at rest per §6.4).
 * It never enters the EventLog or the shareable replay.
 */

import { createHash } from "node:crypto";

// ---------------------------------------------------------------------------
// Individual event types
// ---------------------------------------------------------------------------

export interface SessionStartEvent {
  type: "session_start";
  sessionId: string; // UUID
  scenarioId: string | null; // null for sandbox sessions
  seed: number; // PRNG seed — required for replay
  marketType: "crypto" | "stocks" | "forex";
  tickIndex: 0;
  timestamp: 0;
}

export interface TickEvent {
  type: "tick";
  tickIndex: number;
  timestamp: number; // sim milliseconds from session start
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spread: number;
}

export interface OrderSubmitEvent {
  type: "order_submit";
  orderId: string;
  orderType: "market" | "limit" | "stop" | "stop_limit";
  side: "buy" | "sell";
  quantity: number;
  price: number | null; // null for market orders
  stopPrice: number | null;
  tickIndex: number;
  timestamp: number;
}

export interface OrderFillEvent {
  type: "order_fill";
  orderId: string;
  fillPrice: number;
  slippage: number;
  spreadCost: number;
  feeCost: number;
  tickIndex: number;
  timestamp: number;
}

export interface OrderCancelEvent {
  type: "order_cancel";
  orderId: string;
  reason: string;
  tickIndex: number;
  timestamp: number;
}

export interface OrderModifyEvent {
  type: "order_modify";
  orderId: string;
  newPrice?: number;
  newStopPrice?: number;
  tickIndex: number;
  timestamp: number;
}

/**
 * Journal text is intentionally absent — see privacy design note at the top.
 * Only wordCount and tags travel with the replay (spec §5.1).
 */
export interface JournalEntryEvent {
  type: "journal_entry";
  entryId: string;
  tags: string[]; // e.g. ['pre_trade', 'hypothesis', 'exit']
  wordCount: number;
  tickIndex: number;
  timestamp: number;
}

export interface ScenarioBeatEvent {
  type: "scenario_beat";
  beatId: string;
  decisionPointId: string | null;
  tickIndex: number;
  timestamp: number;
}

/**
 * DecisionPointEvent — marks the log for coaching annotation alignment (spec §1.4).
 * Fired by EventInjector when a `decision_point` beat fires.
 */
export interface DecisionPointEvent {
  type: "decision_point";
  decisionPointId: string;
  label: string;
  tickIndex: number;
  timestamp: number;
}

/**
 * XpEvent — emitted by ScoreTracker per process metric (spec §4.3).
 * The progression system reads XP events only; it never reads trade outcome data.
 */
export interface XpEvent {
  type: "xp";
  sessionId: string;
  metricId: string;
  xpAmount: number;
  tradeIndex: number | null; // null for session-level metrics
  timestamp: number; // sim milliseconds
}

export interface RecklessWinnerFlagEvent {
  type: "reckless_winner_flag";
  metricsFailed: string[];
  coachingText: string; // authored per-scenario; loaded from scenario config
}

export interface LeverageAckEvent {
  type: "leverage_risk_acknowledged";
  tickIndex: number;
  timestamp: number;
}

export interface DebriefCompleteEvent {
  type: "debrief_complete";
  tickIndex: number;
  timestamp: number;
}

export interface ReplayStartedEvent {
  type: "replay_started";
  originalSessionId: string;
  tickIndex: number;
  timestamp: number;
}

export interface SessionEndEvent {
  type: "session_end";
  tickIndex: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Drill event types (LIVE_DRILL_ENGINE_BRIEF Wave 1)
// ---------------------------------------------------------------------------

/**
 * W1-1 — DrillBriefingAckEvent (LIVE_DRILL_ENGINE_BRIEF §1.2).
 *
 * Logged when the player clicks "I have read this" on the drill briefing
 * overlay. Always fires at tickIndex 0, before the first market tick, so
 * the seeded state and briefing are byte-stable in golden fixtures.
 */
export interface DrillBriefingAckEvent {
  type: "drill_briefing_ack";
  drillId: string;
  tickIndex: 0;
  timestamp: 0;
}

/**
 * W1-2 — DrillSessionEndEvent (LIVE_DRILL_ENGINE_BRIEF §1.2).
 *
 * Emitted when a drill session ends (tick limit reached, account zeroed, or
 * player ends it). Contains pass/fail state for each predicate and the
 * overall pass boolean.
 *
 * Anti-PnL rule (owner ruling 2026-06-08): no PnL value, account balance, or
 * equity figure appears here. Predicates are derived from EventLog process
 * facts only (order_submit / order_fill / order_cancel / order_modify /
 * journal_entry events).
 */
export interface DrillSessionEndEvent {
  type: "drill_session_end";
  drillId: string;
  /** One entry per passCriteriaMetricId in the DrillScenarioDef. */
  passPredicates: Array<{ metricId: string; passed: boolean }>;
  /** AND of all passPredicates[*].passed — convenience flag for the debrief scene. */
  overallPass: boolean;
  tickIndex: number;
  timestamp: number;
}

/**
 * W1-3 — DrillPredicateViolationEvent (LIVE_DRILL_ENGINE_BRIEF §3.1).
 *
 * Emitted by ScoreTracker the moment a drill predicate is violated (not just
 * at session end). Allows the debrief to pinpoint the exact order/action that
 * caused the violation.
 *
 * `triggerEventId` is the orderId (or entryId for journal-based predicates)
 * of the event that caused the violation.
 */
export interface DrillPredicateViolationEvent {
  type: "drill_predicate_violation";
  drillId: string;
  predicateId: string; // e.g. 'no_size_increase_on_seeded_side'
  triggerEventId: string;
  tickIndex: number;
  timestamp: number;
}

/**
 * PolicyDeclaredEvent — scenario-scoped pre-commitment for News/Plan Card
 * scenarios (SIM_ENGINE_SPEC §4.2 policy_match, SCENARIOS_V1 SCN-006).
 *
 * Fired when the player confirms the News Policy Card before the event window
 * opens. The `option` is their declared behaviour for the window:
 *   A_flat          — close all positions before the report; re-enter after.
 *   B_hold_with_stop — hold through the window; position sized for event
 *                      volatility, stop set to account for spread blowout.
 *   C_observe_only  — no trading through the window; observation only.
 *
 * `journalWordCount` is the word count of the mandatory rationale entry
 * written at card confirmation (text stored server-side per §6.4 / §5.1
 * privacy design — not included here).
 */
export interface PolicyDeclaredEvent {
  type: "policy_declared";
  policyId: string;       // scenario-defined ID for the policy card instance
  option: "A_flat" | "B_hold_with_stop" | "C_observe_only";
  journalWordCount: number;
  tickIndex: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Discriminated union of all event types
// ---------------------------------------------------------------------------

export type SimEvent =
  | SessionStartEvent
  | TickEvent
  | OrderSubmitEvent
  | OrderFillEvent
  | OrderCancelEvent
  | OrderModifyEvent
  | JournalEntryEvent
  | ScenarioBeatEvent
  | DecisionPointEvent
  | XpEvent
  | RecklessWinnerFlagEvent
  | LeverageAckEvent
  | DebriefCompleteEvent
  | ReplayStartedEvent
  | SessionEndEvent
  | PolicyDeclaredEvent
  | DrillBriefingAckEvent
  | DrillSessionEndEvent
  | DrillPredicateViolationEvent;

// Exhaustive switch helper: TypeScript will error at compile time if a case is
// missing from a switch on SimEvent["type"].
export function assertNever(x: never): never {
  throw new Error(`Unhandled event type: ${JSON.stringify(x)}`);
}

// ---------------------------------------------------------------------------
// EventLog envelope
// ---------------------------------------------------------------------------

/**
 * Envelope wrapping each event in the log with a monotonic sequence number
 * and the sim-time at emission.
 *
 * `seq`     — global sequence counter; never reused within a session.
 * `simTime` — sim milliseconds from session start at the moment of emission.
 *             This equals the event's own `timestamp` field when present; it
 *             is carried here so envelope-level consumers don't need to
 *             inspect the inner type.
 */
export interface EventEnvelope {
  seq: number;
  simTime: number;
  event: SimEvent;
}

/**
 * The full EventLog for a session.
 *
 * `entries` is append-only. Use `append()` to add events; never mutate
 * `entries` directly after construction.
 */
export interface EventLog {
  readonly sessionId: string;
  readonly entries: readonly EventEnvelope[];
  /** Append one event; returns the assigned sequence number. */
  append(simTime: number, event: SimEvent): number;
  /**
   * Stable serialization — canonical JSON (sorted keys, no whitespace).
   * Used as input to sha256Digest for golden-replay tests.
   */
  serialize(): string;
  /**
   * SHA-256 hex digest of the canonical JSON.
   * DT-001 / GR-010: same seed → identical digest.
   */
  sha256Digest(): string;
}

// ---------------------------------------------------------------------------
// Canonical JSON helpers
// ---------------------------------------------------------------------------

/**
 * JSON.stringify with alphabetically sorted keys at every level.
 * Produces identical output regardless of object construction order —
 * required for stable digests across engine refactors that reorder fields.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, sortedReplacer);
}

function sortedReplacer(_key: string, val: unknown): unknown {
  if (val !== null && typeof val === "object" && !Array.isArray(val)) {
    // Sort the keys of every object node before serialising.
    const sorted: Record<string, unknown> = {};
    for (const k of Object.keys(val as Record<string, unknown>).sort()) {
      sorted[k] = (val as Record<string, unknown>)[k];
    }
    return sorted;
  }
  return val;
}

/** SHA-256 hex of an arbitrary string. Uses node:crypto — never WebCrypto. */
export function sha256hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

// ---------------------------------------------------------------------------
// EventLog factory
// ---------------------------------------------------------------------------

/**
 * Create a new EventLog for `sessionId`.
 *
 * The log is mutable only through `append()`; the `entries` array is exposed
 * as readonly so callers can iterate it without risk of mutation.
 */
export function createEventLog(sessionId: string): EventLog {
  const entries: EventEnvelope[] = [];
  let seq = 0;

  function append(simTime: number, event: SimEvent): number {
    const thisSeq = seq++;
    entries.push({ seq: thisSeq, simTime, event });
    return thisSeq;
  }

  function serialize(): string {
    return canonicalJson({ sessionId, entries });
  }

  function sha256Digest(): string {
    return sha256hex(serialize());
  }

  return {
    sessionId,
    entries,
    append,
    serialize,
    sha256Digest,
  };
}
