/**
 * SessionAdapter — wall-clock → sim-tick bridge (UI boundary only).
 *
 * SIM_ENGINE_SPEC §1.1: wall-clock mapping to sim-ticks belongs ONLY at the
 * UI boundary. The engine clock.advance() is stateless with respect to real
 * time; this adapter accumulates real elapsed ms, converts to sim-ticks at
 * the current compression multiplier, and calls clock.advance().
 *
 * This adapter owns the Phaser update loop integration. TradingScene calls
 * update(deltaMs) each frame; the adapter decides how many sim-ticks to deliver.
 *
 * TickEvent emissions from the engine are the authoritative price source.
 * This adapter exposes an onTick callback that TradingScene subscribes to.
 *
 * Adapter selection:
 *   Constructor accepts a ScenarioDef and numeric seed. The market adapter
 *   (crypto / stocks / forex) is selected from manifest.market — mirroring
 *   the harness/run.ts adapter wiring exactly.
 *
 * Account model:
 *   crypto/stocks → CryptoSpotAccount (cash, no leverage)
 *   forex         → ForexMarginAccount (leveraged)
 *
 * Leverage for forex is taken from the manifest or defaults to 50:1.
 *
 * Order routing:
 *   The adapter owns an OrderBook and appropriate account instance.
 *   TradingScene calls adapter.submitOrder() to place orders; fill math is
 *   performed inside the engine OrderBook (computeMarketFillCosts) so that
 *   live play and headless replay produce identical FillEvent fields.
 */

import {
  createClock,
  createCryptoAdapter,
  createStocksAdapter,
  createForexAdapter,
  createEventLog,
  seed as seedPrng,
  createOrderBook,
  createCryptoSpotAccount,
  createForexMarginAccount,
  type SimClock,
  type CompressionMode,
  ticksPerWallSecond,
} from "../../index.js";
import type { IMarketFeed } from "../../data/feed.js";
import type { OrderFillEvent, OrderSubmitEvent, SimEvent } from "../../engine/events.js";
import type { OrderParams } from "../../orders/book.js";
import type { CryptoSpotAccount, ForexMarginAccount } from "../../orders/account.js";
import {
  runScoreTracker,
  type MetricInput,
} from "../../engine/scoring.js";
import type { ScenarioDef, ScenarioManifest, XpRubricEntry } from "../../scenarios/types.js";
import { scn001 as _scn001Default } from "../../scenarios/scn001.js";
import { scenarioSeed } from "../../scenarios/registry.js";

/** Current price snapshot delivered to the UI each tick. */
export interface PriceTick {
  tickIndex: number;
  simTimeMs: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spread: number;
}

/** Fill result returned to the UI after an order is processed. */
export interface FillResult {
  orderId: string;
  fill: OrderFillEvent;
}

/** Synchronous outcome of submitOrder(). */
export interface SubmitOutcome {
  orderId: string;
  /**
   * Non-null when the OrderBook rejected the order at submit time
   * (e.g. "leverage_ack_required", "session_closed", "insufficient_balance").
   * Null means the order was accepted (fill arrives via onFill on a later tick).
   */
  rejectReason: string | null;
}

export type TickCallback = (tick: PriceTick) => void;
export type FillCallback = (fill: OrderFillEvent) => void;

// ---------------------------------------------------------------------------
// DebriefData — the teaching payoff object produced at session end.
//
// No PnL anywhere in this type. No account-balance display.
// ---------------------------------------------------------------------------

/** One row in the debrief process rubric table. */
export interface DebriefMetricRow {
  /** Canonical metric ID. */
  readonly metricId: string;
  /** Human-readable label from the scenario rubric. */
  readonly label: string;
  /**
   * 'pass' | 'fail' | 'na'.
   * 'na' means the metric was not applicable to this session (no opportunity
   * to fire). NOT a failure. Rendered as "—" in the table, never as ✗.
   */
  readonly status: "pass" | "fail" | "na";
  /** XP earned for this row (0 when status !== 'pass'). */
  readonly xpEarned: number;
}

/** Full debrief payload passed to DebriefScene. */
export interface DebriefData {
  readonly scenarioId: string;
  readonly scenarioTitle: string;
  /** Per-metric rows for the rubric table. */
  readonly rubricRows: readonly DebriefMetricRow[];
  /** Sum of all xpEarned across rows (process XP only — no PnL). */
  readonly xpTotal: number;
  // --- Scenario debrief text IDs (resolved from ScenarioManifest) ---
  /** ID of the "what happened" content block. */
  readonly whatHappenedId: string;
  /** ID of the "good process" content block. */
  readonly goodProcessId: string;
  /** ID of the mandatory "good process can still lose" callout block. */
  readonly goodProcessCanLoseId: string;
  // --- Coaching flags ---
  /** Present when the reckless-winner flag fired; null otherwise. */
  readonly recklessWinnerText: string | null;
  /** Present when policy was declared but behaviour mismatched; null otherwise. */
  readonly policyMismatchNote: string | null;
  /** The seed used for this session (needed for "Replay scenario" button). */
  readonly seed: number;
  /** Session ID for log purposes. */
  readonly sessionId: string;
}

// Estimated sigma for market orders (conservative baseline).
const BASE_SIGMA = 0.008;
// Default leverage for forex scenarios. SIM_ENGINE_SPEC §3.4: leverage_ratio
// TUNABLE, 30:1 (EU/UK retail cap level — conservative default). The wireframe
// Screen 2a (SCN-003) also shows 30:1. No manifest field for leverage yet.
const DEFAULT_FOREX_LEVERAGE = 30;

// ---------------------------------------------------------------------------
// SessionAdapter — scenario-aware, market-selectable
// ---------------------------------------------------------------------------

export class SessionAdapter {
  /**
   * The most recently ended session — set by endSession(). DebriefScene uses
   * this to call completeDebrief() (Phaser init data can't carry the adapter
   * with type safety; module-level handoff mirrors the ProgressStore pattern).
   */
  static lastSession: SessionAdapter | null = null;

  readonly clock: SimClock;
  readonly log = createEventLog("ui-session-" + Date.now());

  private readonly feed: IMarketFeed;
  private readonly orderBook = createOrderBook();
  /** crypto / stocks → CryptoSpotAccount; forex → ForexMarginAccount */
  private readonly accountSpot: CryptoSpotAccount | null;
  private readonly accountForex: ForexMarginAccount | null;
  /** Market type from the resolved manifest. */
  private readonly marketType: "crypto" | "stocks" | "forex";
  /** Seed used for this session (surfaced to DebriefData). */
  private readonly sessionSeed: number;

  private accumulatedMs = 0;
  private tickListeners: TickCallback[] = [];
  private fillListeners: FillCallback[] = [];
  private sessionEndListeners: Array<(data: DebriefData) => void> = [];
  private orderSeq = 0;

  /** Latest price snapshot — undefined until first tick. */
  latestTick: PriceTick | undefined;

  /** Scenario manifest wired at construction (used to build DebriefData). */
  private readonly manifest: ScenarioManifest;

  /** Whether the session has already ended (prevents double-end). */
  private sessionEnded = false;

  /** Whether completeDebrief() has run (prevents double-award of the +30). */
  private debriefCompleted = false;

  /**
   * Whether the sim determined the session had at least one "winning" trade.
   * Derived inside endSession() from entry fills vs. the final close —
   * mirroring harness/run.ts exactly — so the reckless-winner coaching flag
   * is live in real play (red-team finding R4-2).  Only this boolean reaches
   * the scorer (structural PnL guard, MetricInput.sessionHasWin).
   */
  sessionHasWin = false;

  /**
   * Player-declared account-risk percent for size_compliance grading
   * (SIM_ENGINE_SPEC §4.2 — "declared in pre-trade journal; default 1%").
   * Set by the order ticket's Risk % field; clamped to (0, 100].
   */
  declaredRiskPct = 1;

  /**
   * The declaration in force at the FIRST order submit — what scoring grades
   * against. Snapshotting at commit time (mirroring the harness's fixed
   * per-run declaredRiskPct) closes the retro-fit exploit: editing Risk %
   * AFTER the fill to match whatever was traded would otherwise suppress the
   * reckless-winner coaching (red-team finding F2). Null until first order.
   */
  private declaredRiskPctAtFirstOrder: number | null = null;

  /**
   * Construct a SessionAdapter for the given scenario and seed.
   *
   * The market adapter (crypto / stocks / forex) is selected from
   * manifest.market — matching the adapter wiring in harness/run.ts exactly.
   *
   * @param def  ScenarioDef to run. Defaults to scn001 for backward-compat.
   * @param seedValue  PRNG seed. Defaults to the scenario's canonical seed.
   */
  constructor(
    def?: ScenarioDef,
    seedValue?: number,
    drillSeed?: {
      entryOrderId: string;
      stopOrderId: string;
      side: "buy" | "sell";
      quantity: number;
      fillPrice: number;
      stopPrice: number;
    }
  ) {
    // Fall back to scn001 when called without arguments (backward-compat for
    // ui-parity.test.ts which constructs SessionAdapter() with no args).
    const resolvedDef: ScenarioDef = def ?? _scn001Default;

    this.manifest = resolvedDef.manifest;
    this.marketType = this.manifest.market;
    this.sessionSeed = seedValue ?? scenarioSeed(this.manifest.id);

    const prng = seedPrng(this.sessionSeed);

    // Select market adapter (mirrors harness/run.ts).
    if (this.marketType === "crypto") {
      this.feed = createCryptoAdapter();
    } else if (this.marketType === "stocks") {
      this.feed = createStocksAdapter();
    } else {
      this.feed = createForexAdapter();
    }

    this.feed.init(Object.assign(
      {
        prng,
        startPrice: this.manifest.startPrice,
        msPerTick: this.manifest.msPerTick,
        instrument: {
          symbol: this.manifest.instrument.symbol,
          marketType: this.marketType,
          tickSize: this.marketType === "forex" ? 0.0001 : 0.0001,
          baseSpread: this.marketType === "forex" ? 0.00012 : 0.001,
          pipSize: this.marketType === "forex" ? 0.0001 : 1,
        },
        script: resolvedDef.script,
      },
      // exactOptionalPropertyTypes: include simDayMs only when authored.
      this.manifest.simDayMs !== undefined
        ? { simDayMs: this.manifest.simDayMs }
        : {}
    ));

    // Account model.
    if (this.marketType === "forex") {
      this.accountSpot = null;
      this.accountForex = createForexMarginAccount(10_000);
    } else {
      this.accountSpot = createCryptoSpotAccount(10_000);
      this.accountForex = null;
    }

    this.clock = createClock(
      this.log,
      (tickIndex, simTimeMs) => {
        // Engine tick handler: advance the feed, process pending orders,
        // broadcast the tick to the UI.
        const rawTick = this.feed.nextTick();
        const pt: PriceTick = {
          tickIndex,
          simTimeMs,
          open: rawTick.open,
          high: rawTick.high,
          low: rawTick.low,
          close: rawTick.close,
          volume: rawTick.volume,
          spread: rawTick.spread,
        };
        this.latestTick = pt;

        // Process pending orders against this tick.
        const bookEvents = this.orderBook.processOrdersOnTick(rawTick);
        for (const be of bookEvents) {
          if (be.type === "fill" && be.fill) {
            this.log.append(simTimeMs, be.fill);
            // Notify UI fill listeners (e.g. TradingScene fill confirm overlay).
            const fillEv = be.fill;
            for (const cb of this.fillListeners) cb(fillEv);
          } else if (be.type === "cancel" && be.cancel) {
            this.log.append(simTimeMs, be.cancel);
          }
        }

        for (const cb of this.tickListeners) cb(pt);
      },
      this.manifest.msPerTick
    );

    // Live-drill position seed (mirrors harness/run.ts drillSeed): the
    // inherited position enters the log as a complete submit→fill pair at
    // tick 0 (forceFill: authored price, zero costs) and the companion
    // protective stop becomes a REAL pending stop in the book. UI display
    // state initializes from the drill def in TradingScene's drill mode.
    if (drillSeed !== undefined) {
      this.log.append(0, {
        type: "order_submit",
        orderId: drillSeed.entryOrderId,
        orderType: "market",
        side: drillSeed.side,
        quantity: drillSeed.quantity,
        price: null,
        stopPrice: null,
        tickIndex: 0,
        timestamp: 0,
      });
      const seedFill = this.orderBook.forceFill(
        {
          orderId: drillSeed.entryOrderId,
          side: drillSeed.side,
          quantity: drillSeed.quantity,
          fillPrice: drillSeed.fillPrice,
        },
        0,
        0
      );
      if (seedFill.fill !== undefined) {
        this.log.append(0, seedFill.fill);
      }
      const stopSide = drillSeed.side === "buy" ? "sell" : "buy";
      this.log.append(0, {
        type: "order_submit",
        orderId: drillSeed.stopOrderId,
        orderType: "stop",
        side: stopSide,
        quantity: drillSeed.quantity,
        price: null,
        stopPrice: drillSeed.stopPrice,
        tickIndex: 0,
        timestamp: 0,
      });
      const seedStopOutcome = this.orderBook.submitOrder(
        {
          orderId: drillSeed.stopOrderId,
          orderType: "stop",
          side: stopSide,
          quantity: drillSeed.quantity,
          price: null,
          stopPrice: drillSeed.stopPrice,
          marketType: this.marketType,
          currentSigma: 0,
          baseSigma: 0,
          // Guard-inapplicable: protects INHERITED state (red-team F5 —
          // the hardcoded 10k equity silently rejected the forex seed stop).
          accountEquity: Number.MAX_SAFE_INTEGER,
          leverageAckReceived: true,
          sessionOpen: true,
        },
        0,
        0
      );
      if (seedStopOutcome.type === "reject") {
        throw new Error(
          `drillSeed: seed stop rejected (${seedStopOutcome.rejectReason ?? "?"})`
        );
      }
    }
  }

  /**
   * Submit an order through the engine OrderBook.
   *
   * Fill math is performed by computeMarketFillCosts inside the book —
   * identical to the harness runner. The UI no longer computes fill price
   * inline; it reads back FillResult from this method.
   *
   * Rejects (leverage_ack_required, session_closed, insufficient_balance,
   * stop_limit_deferred) are surfaced synchronously in the returned
   * SubmitOutcome AND logged as an order_cancel with the reject reason —
   * mirroring the harness runner's event-log shape exactly.
   *
   * NOTE: For the current UI (market orders only), fills are processed during
   * the clock tick handler. This method submits the order; the fill is
   * delivered via the onFill callback on the very next tick advance.
   */
  submitOrder(spec: {
    side: "buy" | "sell";
    quantity: number;
    stopPrice: number | null;
    orderType?: "market" | "limit" | "stop";
    limitPrice?: number | null;
    /** Forex: whether leverage_risk_acknowledged has been emitted. */
    leverageAckReceived?: boolean;
  }): SubmitOutcome {
    // Session frozen after endSession() (xp-parity red-team F2): a submit
    // accepted post-scoring would mutate the already-scored log and let the
    // completeDebrief re-score pay on top of banked patience XP. Rejected
    // BEFORE any log append.
    if (this.sessionEnded) {
      return { orderId: `ui-ord-${++this.orderSeq}`, rejectReason: "session_ended" };
    }

    const { tickIndex, simTimeMs } = this.clock.state;
    const orderId = `ui-ord-${++this.orderSeq}`;
    const orderType = spec.orderType ?? "market";

    // Freeze the risk declaration at the first order — pre-commitment is
    // what size_compliance certifies (F2; see declaredRiskPctAtFirstOrder).
    if (this.declaredRiskPctAtFirstOrder === null) {
      this.declaredRiskPctAtFirstOrder = this.declaredRiskPct;
    }

    const submitEv: OrderSubmitEvent = {
      type: "order_submit",
      orderId,
      orderType,
      side: spec.side,
      quantity: spec.quantity,
      price: spec.limitPrice ?? null,
      stopPrice: spec.stopPrice,
      tickIndex,
      timestamp: simTimeMs,
    };
    this.log.append(simTimeMs, submitEv);

    // sessionOpen comes from the feed's session state.
    const sessionOpen = this.feed.sessionState().isOpen;

    const params: OrderParams = {
      orderId,
      orderType,
      side: spec.side,
      quantity: spec.quantity,
      price: spec.limitPrice ?? null,
      stopPrice: spec.stopPrice,
      marketType: this.marketType,
      currentSigma: BASE_SIGMA,
      baseSigma: BASE_SIGMA,
      accountEquity: this.accountEquity,
      leverageAckReceived: spec.leverageAckReceived ?? false,
      sessionOpen,
    };

    const result = this.orderBook.submitOrder(params, tickIndex, simTimeMs);
    if (result.type === "reject") {
      // Log a cancel with the reject reason so the event log is complete
      // (identical shape to the harness runner's reject handling).
      const rejectReason = result.rejectReason ?? "rejected";
      this.log.append(simTimeMs, {
        type: "order_cancel",
        orderId,
        reason: rejectReason,
        tickIndex,
        timestamp: simTimeMs,
      });
      return { orderId, rejectReason };
    }
    return { orderId, rejectReason: null };
  }

  /** Current account equity (balance + unrealized PnL). */
  get accountEquity(): number {
    if (this.accountForex !== null) return this.accountForex.marginSummary.equity;
    if (this.accountSpot !== null) return this.accountSpot.equity;
    return 10_000;
  }

  /** Current account balance (settled cash). */
  get accountBalance(): number {
    if (this.accountForex !== null) return this.accountForex.balance;
    if (this.accountSpot !== null) return this.accountSpot.balance;
    return 10_000;
  }

  /** Forex margin summary — undefined for non-forex markets. */
  get forexMarginSummary() {
    return this.accountForex?.marginSummary ?? null;
  }

  /** Default leverage for this session (forex only). */
  get leverage(): number {
    return DEFAULT_FOREX_LEVERAGE;
  }

  /** Current session state from the underlying feed. */
  get sessionState() {
    return this.feed.sessionState();
  }

  /**
   * Called each Phaser frame. deltaMs is real elapsed milliseconds since
   * the last frame. Converts to sim-ticks and advances the engine clock.
   */
  update(deltaMs: number): void {
    const compression = this.clock.state.compression;
    if (compression === "paused") return;

    const ticksPerSecond = ticksPerWallSecond(compression);
    const msPerSimTick = 1_000 / ticksPerSecond; // real-ms per sim-tick

    this.accumulatedMs += deltaMs;
    const ticksToDeliver = Math.floor(this.accumulatedMs / msPerSimTick);
    if (ticksToDeliver > 0) {
      this.accumulatedMs -= ticksToDeliver * msPerSimTick;
      this.clock.advance(ticksToDeliver);
    }
  }

  onTick(cb: TickCallback): void {
    this.tickListeners.push(cb);
  }

  offTick(cb: TickCallback): void {
    this.tickListeners = this.tickListeners.filter((x) => x !== cb);
  }

  /** Subscribe to engine fill events — called once per fill with slippage+fee fields. */
  onFill(cb: FillCallback): void {
    this.fillListeners.push(cb);
  }

  offFill(cb: FillCallback): void {
    this.fillListeners = this.fillListeners.filter((x) => x !== cb);
  }

  /** Subscribe to session-end events (fired by endSession()). */
  onSessionEnd(cb: (data: DebriefData) => void): void {
    this.sessionEndListeners.push(cb);
  }

  offSessionEnd(cb: (data: DebriefData) => void): void {
    this.sessionEndListeners = this.sessionEndListeners.filter((x) => x !== cb);
  }

  /**
   * Ends the session: pauses the clock, runs the ScoreTracker over the event
   * log, emits session_end + xp events, and calls sessionEnd listeners with
   * the fully-populated DebriefData.
   *
   * Idempotent — safe to call multiple times; only the first call acts.
   */
  endSession(): DebriefData | null {
    if (this.sessionEnded) return null;
    this.sessionEnded = true;
    SessionAdapter.lastSession = this;

    // Stop the clock so no more ticks fire after this point.
    this.clock.setCompression("paused");

    const { tickIndex, simTimeMs } = this.clock.state;

    // Cancel all pending orders with reason "session_end" — harness parity
    // (red-team F6: the UI never called cancelSession, so seeded stops
    // stayed pending forever and the predicates' session_end exemption was
    // dead code from the UI's perspective).
    for (const be of this.orderBook.cancelSession(tickIndex, simTimeMs)) {
      if (be.type === "cancel" && be.cancel) {
        this.log.append(simTimeMs, be.cancel);
      }
    }

    // Append session_end event.
    this.log.append(simTimeMs, {
      type: "session_end",
      tickIndex,
      timestamp: simTimeMs,
    });

    // Build MetricInput from the event log (structural PnL guard: only boolean win).
    const allEvents: readonly SimEvent[] = this.log.entries.map((e) => e.event);

    // Derive sessionHasWin from entry fills vs. final close — identical logic
    // to harness/run.ts (long wins if close > fill; short wins if close < fill).
    // No dollar amount is computed; only the boolean leaves this block.
    // An externally-set true (test harness / future engine signal) is kept.
    const finalClose = this.latestTick?.close;
    if (finalClose !== undefined && !this.sessionHasWin) {
      const submitSideById = new Map<string, "buy" | "sell">();
      const stopOrderIds = new Set<string>();
      for (const ev of allEvents) {
        if (ev.type === "order_submit") {
          submitSideById.set(ev.orderId, ev.side);
          if (ev.orderType === "stop") stopOrderIds.add(ev.orderId);
        }
      }
      this.sessionHasWin = allEvents.some((ev) => {
        if (ev.type !== "order_fill" || stopOrderIds.has(ev.orderId)) return false;
        const side = submitSideById.get(ev.orderId);
        if (side === undefined) return false;
        return side === "buy"
          ? finalClose > ev.fillPrice
          : finalClose < ev.fillPrice;
      });
    }
    // debrief_complete is NOT appended here — DebriefScene calls
    // completeDebrief() when the player reaches the debrief screen, which
    // re-scores and awards the +30 in THIS session (spec rubric: "Scenario
    // debrief completed — flat, regardless of outcome"). The previous
    // append-after-scoring ordering made the metric structurally unearnable
    // in live play (red-team finding R6-3).
    const debriefData = this._scoreAndBuild(simTimeMs);

    // Notify listeners (e.g. TradingScene → DebriefScene transition).
    for (const cb of this.sessionEndListeners) cb(debriefData);

    return debriefData;
  }

  /**
   * Mark the debrief as completed: appends debrief_complete to the log,
   * re-scores, appends only newly-earned XP events (no duplicates), and
   * returns the refreshed DebriefData. Idempotent — second call returns null.
   *
   * DebriefScene calls this on entry: reaching the debrief IS completing
   * the session flow, so the +30 is earned in the session being debriefed.
   */
  completeDebrief(): DebriefData | null {
    if (!this.sessionEnded || this.debriefCompleted) return null;
    this.debriefCompleted = true;

    const { tickIndex, simTimeMs } = this.clock.state;
    this.log.append(simTimeMs, {
      type: "debrief_complete",
      tickIndex,
      timestamp: simTimeMs,
    });

    return this._scoreAndBuild(simTimeMs);
  }

  /**
   * Run the ScoreTracker over the current log, append XP events that are not
   * already in the log (re-scoring after completeDebrief must not duplicate
   * the events endSession already appended), and build the DebriefData.
   */
  private _scoreAndBuild(simTimeMs: number): DebriefData {
    const allEvents: readonly SimEvent[] = this.log.entries.map((e) => e.event);
    const metricInput: MetricInput = Object.assign(
      {
        events: allEvents,
        sessionHasWin: this.sessionHasWin,
        // Grade against the declaration frozen at first order (F2);
        // sessions with no orders fall back to the live field.
        declaredRiskPct: (() => {
          const pct = this.declaredRiskPctAtFirstOrder ?? this.declaredRiskPct;
          return Number.isFinite(pct) && pct > 0 && pct <= 100 ? pct : 1;
        })(),
        sessionStartEquity: 10_000,
        // Applicability gate for scenario-specific metrics (rubric-authored only).
        rubricMetricIds: (this.manifest?.xpRubric ?? []).map((r) => r.metricId),
        // Authored amounts — the manifest rubric is the economy source of truth.
        rubricXpById: Object.fromEntries(
          (this.manifest?.xpRubric ?? []).map((r) => [r.metricId, r.xpOnPass])
        ),
      },
      this.manifest?.noEntryWindows !== undefined
        ? {
            noEntryWindows: this.manifest.noEntryWindows.map((w) => ({
              startMs: w.startMs,
              endMs: w.endMs,
            })),
          }
        : {},
      this.manifest?.policyDeadlineMs !== undefined
        ? { policyDeadlineMs: this.manifest.policyDeadlineMs }
        : {}
    );

    const scoreOut = runScoreTracker(
      this.log.sessionId,
      metricInput,
      simTimeMs,
      this.manifest?.recklessWinnerCoachingText
    );

    // Append only XP events whose metric has not already emitted one — one
    // XP event per metric per session, across endSession + completeDebrief.
    const alreadyEmitted = new Set(
      allEvents
        .filter((e) => e.type === "xp")
        .map((e) => (e.type === "xp" ? e.metricId : ""))
    );
    for (const xpEv of scoreOut.xpEvents) {
      if (!alreadyEmitted.has(xpEv.metricId)) {
        this.log.append(simTimeMs, xpEv);
      }
    }

    // Build rubric rows from the manifest xpRubric + score results.
    const rubricRows: DebriefMetricRow[] = this._buildRubricRows(
      this.manifest?.xpRubric ?? [],
      scoreOut.results
    );

    const xpTotal = rubricRows.reduce((sum, r) => sum + r.xpEarned, 0);

    // Resolve debrief content IDs from manifest.
    const ids = this.manifest?.debriefContentIds ?? [];
    const whatHappenedId = ids[0] ?? "";
    const goodProcessId = ids[1] ?? "";
    const goodProcessCanLoseId = ids[2] ?? "";

    // Reckless-winner coaching text (null when flag not fired).
    const recklessWinnerText = scoreOut.recklessWinnerFlag?.coachingText ?? null;

    // Policy mismatch note (null when not fired).
    const policyMismatchNote = scoreOut.policyMismatchFlag
      ? `Your declared policy (${scoreOut.policyMismatchFlag.declaredOption}) did not match your actions. This will be reviewed in your coaching notes.`
      : null;

    return {
      scenarioId: this.manifest?.id ?? "SCN-001",
      scenarioTitle: this.manifest?.title ?? "The HarborUSD Depegging",
      rubricRows,
      xpTotal,
      whatHappenedId,
      goodProcessId,
      goodProcessCanLoseId,
      recklessWinnerText,
      policyMismatchNote,
      seed: this.sessionSeed,
      sessionId: this.log.sessionId,
    };
  }

  /** Build rubric rows by joining manifest xpRubric with scorer results. */
  private _buildRubricRows(
    rubric: readonly XpRubricEntry[],
    results: readonly import("../../engine/scoring.js").MetricResult[]
  ): DebriefMetricRow[] {
    return rubric.map((entry) => {
      const result = results.find((r) => r.metricId === entry.metricId);
      if (!result || !result.applicable) {
        return {
          metricId: entry.metricId,
          label: entry.label,
          status: "na" as const,
          xpEarned: 0,
        };
      }
      return {
        metricId: entry.metricId,
        label: entry.label,
        status: result.passed ? ("pass" as const) : ("fail" as const),
        xpEarned: result.passed ? entry.xpOnPass : 0,
      };
    });
  }

  setCompression(mode: CompressionMode): boolean {
    // No un-pausing a scored session (xp-parity red-team F2): resumed ticks
    // could fill a pending order AFTER scoring, splitting the XP books.
    if (this.sessionEnded && mode !== "paused") return false;
    return this.clock.setCompression(mode);
  }

  get compression(): CompressionMode {
    return this.clock.state.compression;
  }
}
