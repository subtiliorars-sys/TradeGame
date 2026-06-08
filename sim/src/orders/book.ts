/**
 * OrderBook — SIM_ENGINE_SPEC §3.1–3.3.
 *
 * Deterministic order lifecycle: market, limit, stop, stop-limit.
 * All fill logic driven by the tick stream; no real-time or system entropy.
 *
 * STOP-LIMIT PHASE-2-DEFERRED:
 *   The stop_limit OrderType is defined here so the EventLog schema stays
 *   consistent with events.ts (which already carries 'stop_limit').
 *   Fill mechanics for stop-limit are NOT implemented in Phase 2 per
 *   SIM_ENGINE_SPEC §8 ("Stop-limit order type — Deferred — adds edge-case
 *   fill logic; not required for three V0 scenarios").
 *   TEST_PLAN OM-007 / OM-008 cover the intended behaviour; they must be
 *   implemented when stop-limit ships.
 *   Any attempt to submit a stop_limit order returns an order_reject event
 *   with reason "stop_limit_deferred".
 */

import type { TickEvent, OrderFillEvent, OrderCancelEvent } from "../engine/events.js";
import { assertSeedOrderId } from "../drills/wave2Seed.js";

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type OrderType = "market" | "limit" | "stop" | "stop_limit";
export type OrderSide = "buy" | "sell";
export type MarketType = "crypto" | "stocks" | "forex";

/**
 * Fee tier for crypto orders (spec §3.3).
 * Maker = limit fill; Taker = market/stop fill.
 */
export type CryptoFeeTier = "maker" | "taker";

export interface OrderParams {
  orderId: string;
  orderType: OrderType;
  side: OrderSide;
  quantity: number;
  /** Limit level — null for market and stop orders. */
  price: number | null;
  /** Stop trigger level — null for market and limit orders. */
  stopPrice: number | null;
  marketType: MarketType;
  /** Current sigma at submission time (used by slippage model). */
  currentSigma: number;
  /** Base sigma for the market (used to compute volatility_multiplier). */
  baseSigma: number;
  /** Account equity snapshot at submission time (for size guard). */
  accountEquity: number;
  /** Whether the forex leverage ack has been received. */
  leverageAckReceived: boolean;
  /** Whether the session is currently open (for stocks session gate). */
  sessionOpen: boolean;
}

/** Internal order state tracked by the book. */
interface PendingOrder {
  params: OrderParams;
  submittedTickIndex: number;
  submittedTimestamp: number;
  /** True once a stop has been triggered and is now a pending market fill. */
  stopTriggered: boolean;
}

// ---------------------------------------------------------------------------
// Fee model constants (spec §3.3) — TUNABLE
// ---------------------------------------------------------------------------

const FEE_CRYPTO_MAKER = 0.001; // 0.10%
const FEE_CRYPTO_TAKER = 0.0015; // 0.15%
const FEE_STOCKS = 0.00; // zero-commission model v1
const FEE_FOREX = 0.00; // spread-only; no additional fee

// ---------------------------------------------------------------------------
// Slippage model constants (spec §3.2) — TUNABLE
// ---------------------------------------------------------------------------

/** Base slippage as a fraction of price. */
const BASE_SLIPPAGE: Record<MarketType, number> = {
  crypto: 0.0005, // 0.05% of fill price
  stocks: 0.0002, // 0.02% of fill price
  forex: 0.00003, // ~0.3 pips (at ~1.3 price → 0.00003 / 0.0001 = 0.3 pips)
};

/**
 * Size multiplier threshold: positions > SIZE_IMPACT_THRESHOLD_PCT of account
 * attract the SIZE_IMPACT_MULTIPLIER (spec §3.2 "market impact for larger sizes").
 */
const SIZE_IMPACT_THRESHOLD_PCT = 0.05; // 5% of account
const SIZE_IMPACT_MULTIPLIER = 1.5;

// ---------------------------------------------------------------------------
// Fill price computation
// ---------------------------------------------------------------------------

/**
 * Compute fill price for a market or stop order.
 *
 * spec §3.2:
 *   buy:  close + spread + slippage
 *   sell: close - spread - slippage
 *
 * Returns { fillPrice, slippage, spreadCost, feeCost }.
 */
export interface FillCosts {
  fillPrice: number;
  slippage: number;
  spreadCost: number;
  feeCost: number;
}

export function computeMarketFillCosts(
  side: OrderSide,
  quantity: number,
  tick: TickEvent,
  marketType: MarketType,
  currentSigma: number,
  baseSigma: number,
  accountEquity: number,
  feeTier: CryptoFeeTier = "taker"
): FillCosts {
  const base = BASE_SLIPPAGE[marketType] * tick.close;

  // Volatility multiplier: ratio of current sigma to base sigma.
  const volatilityMultiplier =
    baseSigma > 0 ? currentSigma / baseSigma : 1.0;

  // Size multiplier: large positions attract extra impact.
  const positionValue = quantity * tick.close;
  const sizePct = accountEquity > 0 ? positionValue / accountEquity : 0;
  const sizeMultiplier =
    sizePct > SIZE_IMPACT_THRESHOLD_PCT ? SIZE_IMPACT_MULTIPLIER : 1.0;

  const slippage = base * volatilityMultiplier * sizeMultiplier;

  // Spread cost is symmetric (half-spread per side):
  // spec states "close + spread + slippage" — the spread field on TickEvent
  // is already in price units (full spread); we apply it in full per the spec formula.
  const spreadCost = tick.spread;

  // Fee computation per market type.
  let feeRate: number;
  if (marketType === "crypto") {
    feeRate = feeTier === "maker" ? FEE_CRYPTO_MAKER : FEE_CRYPTO_TAKER;
  } else if (marketType === "stocks") {
    feeRate = FEE_STOCKS;
  } else {
    feeRate = FEE_FOREX; // forex: spread only, no additional fee
  }

  const fillPriceRaw =
    side === "buy"
      ? tick.close + spreadCost + slippage
      : tick.close - spreadCost - slippage;

  const feeCost = quantity * fillPriceRaw * feeRate;

  return {
    fillPrice: fillPriceRaw,
    slippage,
    spreadCost,
    feeCost,
  };
}

/**
 * Compute fill costs for a limit order.
 * Limit orders fill at exactly the limit price; slippage = 0.
 * Fee tier = maker.
 */
export function computeLimitFillCosts(
  side: OrderSide,
  quantity: number,
  limitPrice: number,
  tick: TickEvent,
  marketType: MarketType
): FillCosts {
  const feeRate =
    marketType === "crypto"
      ? FEE_CRYPTO_MAKER
      : marketType === "stocks"
      ? FEE_STOCKS
      : FEE_FOREX;

  const feeCost = quantity * limitPrice * feeRate;

  return {
    fillPrice: limitPrice,
    slippage: 0,
    // Spread cost is still present at the limit level (the bid-ask the order
    // sits on) — we record tick.spread for display transparency.
    spreadCost: tick.spread,
    feeCost,
  };
}

// ---------------------------------------------------------------------------
// Limit trigger predicate
// ---------------------------------------------------------------------------

/**
 * Returns true if the tick triggers a fill for the given limit order.
 *
 * spec §3.1:
 *   Limit buy: fills when price reaches or crosses the limit level from above.
 *   Limit sell: fills when price reaches or crosses the limit level from below.
 */
function limitTriggered(side: OrderSide, limitPrice: number, tick: TickEvent): boolean {
  if (side === "buy") {
    // Buy limit triggers when low ≤ limit price (price crossed down through limit).
    return tick.low <= limitPrice;
  } else {
    // Sell limit triggers when high ≥ limit price (price crossed up through limit).
    return tick.high >= limitPrice;
  }
}

/**
 * Returns true if the tick triggers a stop trigger for the given stop order.
 *
 * Stop sell (long exit): triggers when price falls to or below stopPrice.
 * Stop buy  (short exit): triggers when price rises to or above stopPrice.
 *
 * Gap-through case (F-02 lesson mechanic): if price gaps through the stop
 * level entirely, the stop triggers at the gap price, not the stop price.
 * This is handled in processOrdersOnTick — the fill price uses the tick's
 * close (the gap price), not the stop price.
 */
function stopTriggered(side: OrderSide, stopPrice: number, tick: TickEvent): boolean {
  if (side === "sell") {
    return tick.low <= stopPrice;
  } else {
    return tick.high >= stopPrice;
  }
}

// ---------------------------------------------------------------------------
// Order book
// ---------------------------------------------------------------------------

/** Authored seed-fill parameters (live drills — inherited positions). */
export interface ForceFillParams {
  orderId: string;
  side: OrderSide;
  quantity: number;
  /** Authored fill price — used verbatim; no slippage model involvement. */
  fillPrice: number;
}

/** Output returned by processOrdersOnTick for each fill or cancel. */
export interface OrderBookEvent {
  type: "fill" | "cancel" | "reject";
  orderId: string;
  fill?: OrderFillEvent;
  cancel?: OrderCancelEvent;
  rejectReason?: string;
}

/**
 * Lightweight imperative order book.
 *
 * Usage:
 *   1. Call submitOrder() whenever the player places an order.
 *   2. Call processOrdersOnTick() once per tick to trigger fills/cancels.
 *   3. Call cancelSession() at session end to cancel all open orders.
 */
export interface OrderBook {
  submitOrder(params: OrderParams, tickIndex: number, timestamp: number): OrderBookEvent;
  /**
   * Seed a position as a synthetic forced fill (LIVE_DRILL_ENGINE_BRIEF §2.3):
   * emits a standard fill at the AUTHORED price with zero slippage/spread/fee
   * — the seeded position is inherited state, not a trade the player made,
   * so no transaction cost is appropriate. Bypasses trigger logic entirely.
   * Deterministic and byte-stable by construction (no PRNG, no market state).
   */
  forceFill(seed: ForceFillParams, tickIndex: number, timestamp: number): OrderBookEvent;
  processOrdersOnTick(tick: TickEvent): OrderBookEvent[];
  cancelSession(tickIndex: number, timestamp: number): OrderBookEvent[];
  cancelOrder(orderId: string, tickIndex: number, timestamp: number, reason?: string): OrderBookEvent | null;
  readonly pendingCount: number;
}

export function createOrderBook(): OrderBook {
  const pending = new Map<string, PendingOrder>();

  function submitOrder(
    params: OrderParams,
    tickIndex: number,
    timestamp: number
  ): OrderBookEvent {
    const { orderId, orderType, marketType, leverageAckReceived, sessionOpen } = params;

    // STOP-LIMIT DEFERRED — return reject immediately (see file-level comment).
    if (orderType === "stop_limit") {
      return {
        type: "reject",
        orderId,
        rejectReason: "stop_limit_deferred",
      };
    }

    // Forex: leverage ack must precede any order (TEST_PLAN FX-001).
    if (marketType === "forex" && !leverageAckReceived) {
      return {
        type: "reject",
        orderId,
        rejectReason: "leverage_ack_required",
      };
    }

    // Session gate: stocks (and forex quiet period) — handled by caller providing
    // sessionOpen = false outside market hours (TEST_PLAN SH-002, SH-004).
    if (!sessionOpen) {
      // Out-of-session: market orders are rejected; limit/stop orders QUEUE.
      // v1 simplification: queue = pending, will fill once session opens.
      // Market orders outside session are rejected per spec (§2.3 stocks model).
      if (orderType === "market") {
        return {
          type: "reject",
          orderId,
          rejectReason: "session_closed",
        };
      }
      // Limit/stop orders placed out-of-session queue to the open (TEST_PLAN SH-004 note).
      // Fall through to the normal pending path.
    }

    // Insufficient balance guard (TEST_PLAN OM-012):
    // position_value = quantity * (approximate price = stopPrice ?? price ?? 0)
    const approxPrice =
      params.stopPrice ??
      params.price ??
      0;
    const positionValue = params.quantity * approxPrice;
    if (positionValue > params.accountEquity) {
      return {
        type: "reject",
        orderId,
        rejectReason: "insufficient_balance",
      };
    }

    pending.set(orderId, {
      params,
      submittedTickIndex: tickIndex,
      submittedTimestamp: timestamp,
      stopTriggered: false,
    });

    return { type: "fill", orderId }; // "accepted" — not a fill yet, but no error
  }

  function forceFill(
    seed: ForceFillParams,
    tickIndex: number,
    timestamp: number
  ): OrderBookEvent {
    // W2-2: enforce seed- prefix guard — authored IDs must not collide with
    // the live UUID namespace (LIVE_DRILL_ENGINE_BRIEF OPEN-LDED-4 / W2-2).
    assertSeedOrderId(seed.orderId);

    // Synthetic forced fill: authored price, zero costs, no pending entry —
    // the position simply exists from this event forward. The caller is
    // responsible for appending the paired order_submit event so the log
    // reads as a complete (submit → fill) sequence for replay.
    return {
      type: "fill",
      orderId: seed.orderId,
      fill: {
        type: "order_fill",
        orderId: seed.orderId,
        fillPrice: seed.fillPrice,
        slippage: 0,
        spreadCost: 0,
        feeCost: 0,
        tickIndex,
        timestamp,
      },
    };
  }

  function processOrdersOnTick(tick: TickEvent): OrderBookEvent[] {
    const results: OrderBookEvent[] = [];

    for (const [orderId, order] of pending) {
      const { params, stopTriggered: triggered } = order;
      const { orderType, side, quantity, price, stopPrice, marketType, currentSigma, baseSigma, accountEquity } = params;

      if (orderType === "market") {
        // Market order: fill immediately on first tick after submission.
        const costs = computeMarketFillCosts(
          side, quantity, tick, marketType, currentSigma, baseSigma, accountEquity, "taker"
        );
        const fillEvent: OrderFillEvent = {
          type: "order_fill",
          orderId,
          fillPrice: costs.fillPrice,
          slippage: costs.slippage,
          spreadCost: costs.spreadCost,
          feeCost: costs.feeCost,
          tickIndex: tick.tickIndex,
          timestamp: tick.timestamp,
        };
        pending.delete(orderId);
        results.push({ type: "fill", orderId, fill: fillEvent });
        continue;
      }

      if (orderType === "limit") {
        if (price === null) continue; // malformed; skip
        if (limitTriggered(side, price, tick)) {
          const costs = computeLimitFillCosts(side, quantity, price, tick, marketType);
          const fillEvent: OrderFillEvent = {
            type: "order_fill",
            orderId,
            fillPrice: costs.fillPrice,
            slippage: costs.slippage,
            spreadCost: costs.spreadCost,
            feeCost: costs.feeCost,
            tickIndex: tick.tickIndex,
            timestamp: tick.timestamp,
          };
          pending.delete(orderId);
          results.push({ type: "fill", orderId, fill: fillEvent });
        }
        continue;
      }

      if (orderType === "stop") {
        if (stopPrice === null) continue; // malformed; skip

        if (!triggered && stopTriggered(side, stopPrice, tick)) {
          // Stop triggered — fill as market at the tick price (gap-through case:
          // if price gapped through the stop level, we fill at tick.close, not
          // at stopPrice — this IS the F-02 lesson mechanic per TEST_PLAN OM-006).
          const costs = computeMarketFillCosts(
            side, quantity, tick, marketType, currentSigma, baseSigma, accountEquity, "taker"
          );
          const fillEvent: OrderFillEvent = {
            type: "order_fill",
            orderId,
            fillPrice: costs.fillPrice,
            slippage: costs.slippage,
            spreadCost: costs.spreadCost,
            feeCost: costs.feeCost,
            tickIndex: tick.tickIndex,
            timestamp: tick.timestamp,
          };
          pending.delete(orderId);
          results.push({ type: "fill", orderId, fill: fillEvent });
        }
        continue;
      }

      // stop_limit orders were rejected at submitOrder; should not appear here.
      // Defensive: skip.
    }

    return results;
  }

  function cancelSession(tickIndex: number, timestamp: number): OrderBookEvent[] {
    const results: OrderBookEvent[] = [];
    for (const [orderId] of pending) {
      const cancelEvent: OrderCancelEvent = {
        type: "order_cancel",
        orderId,
        reason: "session_end",
        tickIndex,
        timestamp,
      };
      results.push({ type: "cancel", orderId, cancel: cancelEvent });
    }
    pending.clear();
    return results;
  }

  function cancelOrder(
    orderId: string,
    tickIndex: number,
    timestamp: number,
    reason = "manual"
  ): OrderBookEvent | null {
    if (!pending.has(orderId)) return null;
    pending.delete(orderId);
    const cancelEvent: OrderCancelEvent = {
      type: "order_cancel",
      orderId,
      reason,
      tickIndex,
      timestamp,
    };
    return { type: "cancel", orderId, cancel: cancelEvent };
  }

  return {
    submitOrder,
    forceFill,
    processOrdersOnTick,
    cancelSession,
    cancelOrder,
    get pendingCount() {
      return pending.size;
    },
  };
}
