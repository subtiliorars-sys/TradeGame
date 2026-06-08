/**
 * Headless scenario runner — the engine's integration surface.
 *
 * runScenario(config) drives the full clock + feed + order book + scoring
 * pipeline deterministically from a seed, a ScenarioDef, and a scripted
 * PlayerAction list.  It returns the completed EventLog, a session digest,
 * and an XP summary.
 *
 * DETERMINISM CONTRACT
 * ────────────────────
 * Given the same seed + same ScenarioDef + same PlayerAction list, every call
 * to runScenario() in the same process (or any Node.js process) produces an
 * identical EventLog and identical sha256Digest.  This is the GR-pattern the
 * golden-replay tests verify.
 *
 * PLAYER ACTION TYPES
 * ───────────────────
 *   advance_ticks       — advance the clock N ticks before the next action
 *   order_submit        — place an order via the OrderBook
 *   order_cancel        — cancel a pending order
 *   order_modify        — modify stop/limit price of a pending order
 *   journal_entry       — emit a JournalEntryEvent (wordCount + tags only)
 *   leverage_ack        — emit a LeverageAckEvent (forex gate)
 *   debrief_complete    — emit a DebriefCompleteEvent
 *   policy_declare      — emit a PolicyDeclaredEvent
 *
 * SCORING
 * ───────
 * Scoring runs once at session end (after all ticks and actions are processed).
 * XP events are appended to the EventLog after the SessionEndEvent.
 * The scorer receives MetricInput built from the full event list.
 *
 * ETHICS RAIL
 * ───────────
 * The harness computes sessionHasWin by comparing the entry fill price to the
 * final close price — this boolean travels to the scorer as MetricInput.sessionHasWin.
 * No PnL value or dollar amount leaves this module toward the scorer.
 */

import { seed } from "../engine/prng.js";
import {
  createEventLog,
  type EventLog,
  type SimEvent,
  type JournalEntryEvent,
  type OrderSubmitEvent,
  type OrderFillEvent,
  type OrderCancelEvent,
  type OrderModifyEvent,
} from "../engine/events.js";
import { createClock } from "../engine/clock.js";
import { createCryptoAdapter } from "../data/crypto.js";
import { createStocksAdapter } from "../data/stocks.js";
import { createForexAdapter } from "../data/forex.js";
import { createOrderBook, type OrderParams } from "../orders/book.js";
import { assertSeedOrderId } from "../drills/wave2Seed.js";
import { runScoreTracker, type MetricInput } from "../engine/scoring.js";
import type { IMarketFeed } from "../data/feed.js";
import type { SeedPositionBeat } from "../data/feed.js";
import type { TickEvent } from "../engine/events.js";
import type { ScenarioDef } from "../scenarios/types.js";

// ---------------------------------------------------------------------------
// Player action types
// ---------------------------------------------------------------------------

export interface AdvanceTicksAction {
  type: "advance_ticks";
  ticksAfter: number;     // ticks to advance before executing this action
  payload: { count: number };
}

export interface OrderSubmitAction {
  type: "order_submit";
  ticksAfter: number;
  payload: {
    orderId?: string;     // auto-generated if absent
    orderType: "market" | "limit" | "stop" | "stop_limit";
    side: "buy" | "sell";
    quantity: number;
    price: number | null;
    stopPrice: number | null;
  };
}

export interface OrderCancelAction {
  type: "order_cancel";
  ticksAfter: number;
  payload: { orderId: string };
}

export interface OrderModifyAction {
  type: "order_modify";
  ticksAfter: number;
  payload: {
    orderId: string;
    newPrice?: number;
    newStopPrice?: number;
  };
}

export interface JournalEntryAction {
  type: "journal_entry";
  ticksAfter: number;
  payload: {
    entryId?: string;     // auto-generated if absent
    tags: string[];
    wordCount: number;
  };
}

export interface LeverageAckAction {
  type: "leverage_ack";
  ticksAfter: number;
  payload: Record<string, never>;
}

export interface DebriefCompleteAction {
  type: "debrief_complete";
  ticksAfter: number;
  payload: Record<string, never>;
}

export interface PolicyDeclareAction {
  type: "policy_declare";
  ticksAfter: number;
  payload: {
    policyId: string;
    option: "A_flat" | "B_hold_with_stop" | "C_observe_only";
    journalWordCount: number;
  };
}

export type PlayerAction =
  | AdvanceTicksAction
  | OrderSubmitAction
  | OrderCancelAction
  | OrderModifyAction
  | JournalEntryAction
  | LeverageAckAction
  | DebriefCompleteAction
  | PolicyDeclareAction;

// ---------------------------------------------------------------------------
// Run config
// ---------------------------------------------------------------------------

export interface HarnessConfig {
  /** PRNG seed — number or string. Same seed → identical output. */
  seed: number | string;
  /** Full scenario definition (manifest + beat schedule). */
  scenario: ScenarioDef;
  /** Starting account equity for size_compliance metric. */
  accountEquity: number;
  /** Declared risk % for size_compliance (defaults to 1.0). */
  declaredRiskPct?: number;
  /** Scripted player actions, executed in order. */
  actions: PlayerAction[];
  /** Session UUID (auto-generated deterministically from seed if absent). */
  sessionId?: string;
  /**
   * Live-drill position seed (LIVE_DRILL_ENGINE_BRIEF §2.3): when present,
   * the harness emits a synthetic submit→fill pair + companion stop at tick
   * 0, immediately after session_start — the player starts the session
   * holding the position. Authored values only; deterministic; zero costs.
   */
  drillSeed?: {
    entryOrderId: string;
    stopOrderId: string;
    side: "buy" | "sell";
    quantity: number;
    fillPrice: number;
    stopPrice: number;
  };
}

// ---------------------------------------------------------------------------
// Run output
// ---------------------------------------------------------------------------

export interface HarnessDigest {
  /** Total ticks advanced (including all advance_ticks actions). */
  totalTicks: number;
  /** Scenario ID from the manifest. */
  scenarioId: string;
  /** SHA-256 hex of the serialized EventLog. */
  sha256: string;
  /** True if any entry fill price resulted in a gain vs. final close price. */
  sessionHasWin: boolean;
}

export interface XpSummary {
  /** Each XP event emitted, in emission order. */
  events: Array<{ metricId: string; xpAmount: number }>;
  /** Sum of all xpAmount values. */
  total: number;
}

export interface HarnessResult {
  log: EventLog;
  digest: HarnessDigest;
  xpSummary: XpSummary;
}

// ---------------------------------------------------------------------------
// ID generation helpers (deterministic, not PRNG-dependent)
// ---------------------------------------------------------------------------

let _ordinalCounter = 0;

/** Reset the ordinal counter — call at the start of each harness run so IDs
 *  are stable across two runs in the same process (GR-pattern requirement). */
function resetOrdinals(): void {
  _ordinalCounter = 0;
}

function nextId(prefix: string): string {
  return `${prefix}-${String(++_ordinalCounter).padStart(4, "0")}`;
}

// ---------------------------------------------------------------------------
// Core runner
// ---------------------------------------------------------------------------

/**
 * Run a scenario headlessly from a seed + scripted player actions.
 * Fully deterministic — no wall-clock, no Math.random().
 */
export function runScenario(config: HarnessConfig): HarnessResult {
  resetOrdinals();

  const { scenario, accountEquity } = config;
  const { manifest } = scenario;
  const declaredRiskPct = config.declaredRiskPct ?? 1.0;

  // Session ID: use provided or derive a simple stable string from seed.
  const sessionId =
    config.sessionId ??
    `session-${String(config.seed)}-${manifest.id}`;

  // --- Setup ---
  const prng = seed(config.seed);
  const log = createEventLog(sessionId);
  const orderBook = createOrderBook();

  // Adapter selection.
  let feed: IMarketFeed;
  if (manifest.market === "crypto") {
    feed = createCryptoAdapter();
  } else if (manifest.market === "stocks") {
    feed = createStocksAdapter();
  } else {
    feed = createForexAdapter();
  }

  feed.init(Object.assign(
    {
      prng,
      startPrice: manifest.startPrice,
      msPerTick: manifest.msPerTick,
      instrument: {
        symbol: manifest.instrument.symbol,
        marketType: manifest.market,
        tickSize: manifest.market === "forex" ? 0.0001 : 0.0001,
        baseSpread: manifest.market === "forex" ? 0.00012 : 0.001,
        pipSize: manifest.market === "forex" ? 0.0001 : 1,
      },
      script: scenario.script,
    },
    // exactOptionalPropertyTypes: include simDayMs only when authored.
    manifest.simDayMs !== undefined ? { simDayMs: manifest.simDayMs } : {}
  ));

  // Emit session_start.
  const rawSeed = typeof config.seed === "number" ? config.seed : 0;
  log.append(0, {
    type: "session_start",
    sessionId,
    scenarioId: manifest.id,
    seed: rawSeed,
    marketType: manifest.market,
    tickIndex: 0,
    timestamp: 0,
  });

  // Live-drill position seed (before any PRNG-driven tick): synthetic
  // submit→fill at the authored price (forceFill, zero costs) + companion
  // protective stop as a REAL pending stop order. The log reads as a
  // complete sequence; replay reconstructs the position from events alone.
  if (config.drillSeed !== undefined) {
    const ds = config.drillSeed;
    log.append(0, {
      type: "order_submit",
      orderId: ds.entryOrderId,
      orderType: "market",
      side: ds.side,
      quantity: ds.quantity,
      price: null,
      stopPrice: null,
      tickIndex: 0,
      timestamp: 0,
    });
    const seedFill = orderBook.forceFill(
      { orderId: ds.entryOrderId, side: ds.side, quantity: ds.quantity, fillPrice: ds.fillPrice },
      0,
      0
    );
    if (seedFill.fill !== undefined) {
      log.append(0, seedFill.fill);
    }
    const stopSide = ds.side === "buy" ? "sell" : "buy";
    log.append(0, {
      type: "order_submit",
      orderId: ds.stopOrderId,
      orderType: "stop",
      side: stopSide,
      quantity: ds.quantity,
      price: null,
      stopPrice: ds.stopPrice,
      tickIndex: 0,
      timestamp: 0,
    });
    const seedStopOutcome = orderBook.submitOrder(
      {
        orderId: ds.stopOrderId,
        orderType: "stop",
        side: stopSide,
        quantity: ds.quantity,
        price: null,
        stopPrice: ds.stopPrice,
        marketType: manifest.market,
        currentSigma: 0,
        baseSigma: 0,
        // The seed stop protects INHERITED state — the size guard prices
        // player decisions, not authored premises (red-team F5: the forex
        // seed's notional exceeds equity and was silently rejected, leaving
        // the displayed stop nonexistent in the book).
        accountEquity: Number.MAX_SAFE_INTEGER,
        leverageAckReceived: true,
        sessionOpen: true,
      },
      0,
      0
    );
    if (seedStopOutcome.type === "reject") {
      throw new Error(
        `drillSeed: the book rejected the seed stop (${seedStopOutcome.rejectReason ?? "?"}) — the drill premise would be false`
      );
    }
  }

  // W2-1: dispatch any seed_position beats from the ScenarioScript at simTimeMs=0.
  // These fire before the first PRNG-driven tick (same semantics as drillSeed, but
  // script-driven so a DrillScenarioDef can carry seeding without a separate
  // HarnessConfig.drillSeed argument). The adapter ignores these beats; the harness
  // handles them here, just after session_start and drillSeed processing.
  for (const beat of scenario.script) {
    if (beat.kind === "seed_position" && beat.simTimeMs === 0) {
      dispatchSeedPositionBeat(beat, log, orderBook, manifest.market);
    }
  }

  // --- Mutable harness state ---
  let leverageAckReceived = false;
  let sessionOpen = true;
  let totalTicks = 0;
  let lastTickClose: number = manifest.startPrice;

  // Track entry fills for sessionHasWin determination.
  // sessionHasWin = true if any fill's implied position gained vs. final close.
  // This boolean travels to the scorer as MetricInput.sessionHasWin.
  // No PnL dollar value is computed here (ethics rail — scorer must not see PnL).
  const entryFills: Array<{ side: "buy" | "sell"; fillPrice: number }> = [];

  // Track stop order IDs for harness-level order tracking.
  // The order book references orderId; we need to map harness-assigned IDs.
  const stopOrderIds = new Set<string>();
  const entryOrderIds = new Set<string>();

  // Action queue: index into config.actions.
  let actionIdx = 0;

  // --- Per-tick pipeline step ---
  function onTick(tickIndex: number, simTimeMs: number): void {
    totalTicks++;

    // 1. Get next tick from feed.
    const tick = feed.nextTick();
    lastTickClose = tick.close;
    log.append(simTimeMs, tick);

    // Update session state.
    const sess = feed.sessionState();
    sessionOpen = sess.isOpen;

    // 2. Process pending orders against this tick.
    const bookEvents = orderBook.processOrdersOnTick(tick);
    for (const be of bookEvents) {
      if (be.type === "fill" && be.fill) {
        log.append(simTimeMs, be.fill);
        // Record entry fills for win determination.
        const submit = findSubmitForFill(log, be.fill.orderId);
        if (submit && submit.orderType !== "stop") {
          entryFills.push({ side: submit.side, fillPrice: be.fill.fillPrice });
        }
      } else if (be.type === "cancel" && be.cancel) {
        log.append(simTimeMs, be.cancel);
      }
    }

    // 3. Emit DecisionPointEvents for decision points at this simTimeMs.
    for (const dp of manifest.decisionPoints) {
      if (dp.simTimeMs === simTimeMs) {
        log.append(simTimeMs, {
          type: "decision_point",
          decisionPointId: dp.id,
          label: dp.label,
          tickIndex,
          timestamp: simTimeMs,
        });
        log.append(simTimeMs, {
          type: "scenario_beat",
          beatId: `beat-dp-${dp.id}`,
          decisionPointId: dp.id,
          tickIndex,
          timestamp: simTimeMs,
        });
      }
    }
  }

  // --- Clock ---
  const clock = createClock(log, onTick, manifest.msPerTick);

  // --- Action dispatcher ---
  function dispatchAction(action: PlayerAction): void {
    const { tickIndex, simTimeMs } = clock.state;

    switch (action.type) {
      case "advance_ticks": {
        clock.advance(action.payload.count);
        break;
      }

      case "journal_entry": {
        const entryId = action.payload.entryId ?? nextId("journal");
        const ev: JournalEntryEvent = {
          type: "journal_entry",
          entryId,
          tags: action.payload.tags,
          wordCount: action.payload.wordCount,
          tickIndex,
          timestamp: simTimeMs,
        };
        log.append(simTimeMs, ev);
        break;
      }

      case "leverage_ack": {
        leverageAckReceived = true;
        log.append(simTimeMs, {
          type: "leverage_risk_acknowledged",
          tickIndex,
          timestamp: simTimeMs,
        });
        break;
      }

      case "order_submit": {
        const orderId = action.payload.orderId ?? nextId("order");
        const submitEv: OrderSubmitEvent = {
          type: "order_submit",
          orderId,
          orderType: action.payload.orderType,
          side: action.payload.side,
          quantity: action.payload.quantity,
          price: action.payload.price,
          stopPrice: action.payload.stopPrice,
          tickIndex,
          timestamp: simTimeMs,
        };
        log.append(simTimeMs, submitEv);

        // Track stop orders.
        if (action.payload.orderType === "stop") {
          stopOrderIds.add(orderId);
        } else {
          entryOrderIds.add(orderId);
        }

        // Submit to order book.
        const params: OrderParams = {
          orderId,
          orderType: action.payload.orderType,
          side: action.payload.side,
          quantity: action.payload.quantity,
          price: action.payload.price,
          stopPrice: action.payload.stopPrice,
          marketType: manifest.market,
          currentSigma: 0.004, // conservative baseline; adapters manage actual sigma
          baseSigma: 0.004,
          accountEquity,
          leverageAckReceived,
          sessionOpen,
        };

        const result = orderBook.submitOrder(params, tickIndex, simTimeMs);
        if (result.type === "reject") {
          // Log a cancel with the reject reason so the event log is complete.
          const rejectCancel: OrderCancelEvent = {
            type: "order_cancel",
            orderId,
            reason: result.rejectReason ?? "rejected",
            tickIndex,
            timestamp: simTimeMs,
          };
          log.append(simTimeMs, rejectCancel);
        }
        break;
      }

      case "order_cancel": {
        const { orderId } = action.payload;
        const result = orderBook.cancelOrder(orderId, tickIndex, simTimeMs, "manual");
        if (result && result.cancel) {
          log.append(simTimeMs, result.cancel);
        }
        break;
      }

      case "order_modify": {
        // exactOptionalPropertyTypes: only include optional fields when defined.
        const modEv: OrderModifyEvent = Object.assign(
          {
            type: "order_modify" as const,
            orderId: action.payload.orderId,
            tickIndex,
            timestamp: simTimeMs,
          },
          action.payload.newPrice !== undefined
            ? { newPrice: action.payload.newPrice }
            : {},
          action.payload.newStopPrice !== undefined
            ? { newStopPrice: action.payload.newStopPrice }
            : {}
        );
        log.append(simTimeMs, modEv);
        break;
      }

      case "debrief_complete": {
        log.append(simTimeMs, {
          type: "debrief_complete",
          tickIndex,
          timestamp: simTimeMs,
        });
        break;
      }

      case "policy_declare": {
        log.append(simTimeMs, {
          type: "policy_declared",
          policyId: action.payload.policyId,
          option: action.payload.option,
          journalWordCount: action.payload.journalWordCount,
          tickIndex,
          timestamp: simTimeMs,
        });
        break;
      }

      default:
        assertNeverAction(action);
    }
  }

  // --- Execute actions in order ---
  for (; actionIdx < config.actions.length; actionIdx++) {
    const action = config.actions[actionIdx];
    if (action === undefined) continue;

    // Advance ticks before this action (if any).
    if (action.ticksAfter > 0) {
      clock.advance(action.ticksAfter);
    }

    dispatchAction(action);
  }

  // --- Cancel remaining open orders at session end ---
  const { tickIndex: endTick, simTimeMs: endTime } = clock.state;
  const sessionCancels = orderBook.cancelSession(endTick, endTime);
  for (const be of sessionCancels) {
    if (be.cancel) {
      log.append(endTime, be.cancel);
    }
  }

  // --- Session end ---
  log.append(endTime, {
    type: "session_end",
    tickIndex: endTick,
    timestamp: endTime,
  });

  // --- sessionHasWin determination ---
  // Compare each entry fill's fill price vs. the final close price.
  // Long wins if final close > fillPrice; short wins if final close < fillPrice.
  // This is a boolean — no dollar amount computed (ethics rail).
  const finalClose = lastTickClose;
  const sessionHasWin = entryFills.some((ef) => {
    if (ef.side === "buy") return finalClose > ef.fillPrice;
    return finalClose < ef.fillPrice;
  });

  // --- Scoring ---
  const metricInput: MetricInput = Object.assign(
    {
      events: log.entries.map((e) => e.event),
      sessionHasWin,
      declaredRiskPct,
      sessionStartEquity: accountEquity,
      // Applicability gate for scenario-specific metrics (rubric-authored only).
      rubricMetricIds: manifest.xpRubric.map((r) => r.metricId),
      // Authored amounts — the manifest rubric is the economy source of truth.
      rubricXpById: Object.fromEntries(
        manifest.xpRubric.map((r) => [r.metricId, r.xpOnPass])
      ),
    },
    manifest.noEntryWindows !== undefined
      ? {
          noEntryWindows: manifest.noEntryWindows.map((w) => ({
            startMs: w.startMs,
            endMs: w.endMs,
          })),
        }
      : {},
    manifest.policyDeadlineMs !== undefined
      ? { policyDeadlineMs: manifest.policyDeadlineMs }
      : {}
  );

  const scoreOutput = runScoreTracker(
    sessionId,
    metricInput,
    endTime,
    manifest.recklessWinnerCoachingText
  );

  // Append XP events to the log.
  for (const xpEv of scoreOutput.xpEvents) {
    log.append(endTime, xpEv);
  }
  if (scoreOutput.recklessWinnerFlag) {
    log.append(endTime, scoreOutput.recklessWinnerFlag);
  }

  // --- Build result ---
  const digest: HarnessDigest = {
    totalTicks,
    scenarioId: manifest.id,
    sha256: log.sha256Digest(),
    sessionHasWin,
  };

  const xpSummary: XpSummary = {
    events: scoreOutput.xpEvents.map((e) => ({
      metricId: e.metricId,
      xpAmount: e.xpAmount,
    })),
    total: scoreOutput.xpEvents.reduce((sum, e) => sum + e.xpAmount, 0),
  };

  return { log, digest, xpSummary };
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Scan the event log backwards from the fill to find its matching submit. */
function findSubmitForFill(
  log: EventLog,
  orderId: string
): OrderSubmitEvent | undefined {
  for (let i = log.entries.length - 1; i >= 0; i--) {
    const entry = log.entries[i];
    if (
      entry !== undefined &&
      entry.event.type === "order_submit" &&
      (entry.event as OrderSubmitEvent).orderId === orderId
    ) {
      return entry.event as OrderSubmitEvent;
    }
  }
  return undefined;
}

/**
 * W2-1 — dispatch a `seed_position` beat from the ScenarioScript.
 *
 * Emits the standard order_submit + order_fill pair at tick 0 with authored
 * IDs (byte-stable) + places the companion stop in the pending book.
 * This mirrors the drillSeed inline path but is triggered from the script
 * beat list, allowing DrillScenarioDef manifests to carry seeding without
 * a separate HarnessConfig.drillSeed argument.
 *
 * W2-2 guard: assertSeedOrderId fires on both IDs — authoring errors surface here.
 */
function dispatchSeedPositionBeat(
  beat: SeedPositionBeat,
  log: ReturnType<typeof createEventLog>,
  orderBook: ReturnType<typeof createOrderBook>,
  market: "crypto" | "stocks" | "forex"
): void {
  // W2-2: enforce seed- prefix on both authored IDs.
  assertSeedOrderId(beat.entryOrderId);
  assertSeedOrderId(beat.stopOrderId);

  // Emit the synthetic entry submit event (EventLog reads as a complete sequence).
  log.append(0, {
    type: "order_submit",
    orderId: beat.entryOrderId,
    orderType: "market",
    side: beat.positionSide,
    quantity: beat.quantity,
    price: null,
    stopPrice: null,
    tickIndex: 0,
    timestamp: 0,
  });

  // Forced fill at authored price — zero slippage/spread/fee (inherited state).
  const fillOutcome = orderBook.forceFill(
    {
      orderId: beat.entryOrderId,
      side: beat.positionSide,
      quantity: beat.quantity,
      fillPrice: beat.fillPrice,
    },
    0,
    0
  );
  if (fillOutcome.fill !== undefined) {
    log.append(0, fillOutcome.fill);
  }

  // Companion stop submit event.
  const stopSide = beat.positionSide === "buy" ? "sell" : "buy";
  log.append(0, {
    type: "order_submit",
    orderId: beat.stopOrderId,
    orderType: "stop",
    side: stopSide,
    quantity: beat.quantity,
    price: null,
    stopPrice: beat.stopPrice,
    tickIndex: 0,
    timestamp: 0,
  });

  // Register the companion stop as a live pending order in the book.
  const stopOutcome = orderBook.submitOrder(
    {
      orderId: beat.stopOrderId,
      orderType: "stop",
      side: stopSide,
      quantity: beat.quantity,
      price: null,
      stopPrice: beat.stopPrice,
      marketType: market,
      currentSigma: 0,
      baseSigma: 0,
      // Seed stop protects inherited state — bypass size guard (same pattern as
      // the drillSeed inline path: accountEquity: Number.MAX_SAFE_INTEGER).
      accountEquity: Number.MAX_SAFE_INTEGER,
      leverageAckReceived: true,
      sessionOpen: true,
    },
    0,
    0
  );
  if (stopOutcome.type === "reject") {
    throw new Error(
      `seed_position beat: book rejected companion stop (${stopOutcome.rejectReason ?? "?"}) — drill premise false`
    );
  }
}

function assertNeverAction(action: never): never {
  throw new Error(`HarnessRunner: unknown action type: ${JSON.stringify(action)}`);
}
