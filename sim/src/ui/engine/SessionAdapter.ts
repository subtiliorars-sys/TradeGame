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
 * Order routing:
 *   The adapter owns an OrderBook and CryptoSpotAccount instance.
 *   TradingScene calls adapter.submitOrder() to place orders; fill math is
 *   performed inside the engine OrderBook (computeMarketFillCosts) so that
 *   live play and headless replay produce identical FillEvent fields.
 *   The inline fill math that previously lived in TradingScene is removed.
 */

import {
  createClock,
  createCryptoAdapter,
  createEventLog,
  seed as seedPrng,
  createOrderBook,
  createCryptoSpotAccount,
  type SimClock,
  type CompressionMode,
  ticksPerWallSecond,
} from "../../index.js";
import type { IMarketFeed } from "../../data/feed.js";
import type { OrderFillEvent, OrderSubmitEvent } from "../../engine/events.js";
import type { OrderParams } from "../../orders/book.js";

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

export type TickCallback = (tick: PriceTick) => void;
export type FillCallback = (fill: OrderFillEvent) => void;

const SCN001_SEED = 42_001;
const MS_PER_TICK = 1_000; // 1 sim-second per tick
// Estimated sigma for the HarborUSD/USVC feed (conservative baseline).
const BASE_SIGMA = 0.008;

export class SessionAdapter {
  readonly clock: SimClock;
  readonly log = createEventLog("ui-session-" + Date.now());

  private readonly feed: IMarketFeed;
  private readonly orderBook = createOrderBook();
  private readonly account = createCryptoSpotAccount(10_000);

  private accumulatedMs = 0;
  private tickListeners: TickCallback[] = [];
  private fillListeners: FillCallback[] = [];
  private orderSeq = 0;

  /** Latest price snapshot — undefined until first tick. */
  latestTick: PriceTick | undefined;

  constructor() {
    const prng = seedPrng(SCN001_SEED);

    this.feed = createCryptoAdapter();
    this.feed.init({
      prng,
      startPrice: 1.0,
      msPerTick: MS_PER_TICK,
      instrument: {
        symbol: "HarborUSD/USVC",
        marketType: "crypto",
        tickSize: 0.0001,
        baseSpread: 0.008,
        pipSize: 1,
      },
    });

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
      MS_PER_TICK
    );
  }

  /**
   * Submit an order through the engine OrderBook.
   *
   * Fill math is performed by computeMarketFillCosts inside the book —
   * identical to the harness runner. The UI no longer computes fill price
   * inline; it reads back FillResult from this method.
   *
   * Returns the FillResult immediately for market orders (filled on next
   * tick via the clock's tick handler) — but for simplicity, market orders
   * here are delivered synchronously by advancing one tick internally after
   * submit. The UI should call this when the tick is current.
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
  }): string {
    const { tickIndex, simTimeMs } = this.clock.state;
    const orderId = `ui-ord-${++this.orderSeq}`;
    const orderType = spec.orderType ?? "market";

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

    const params: OrderParams = {
      orderId,
      orderType,
      side: spec.side,
      quantity: spec.quantity,
      price: spec.limitPrice ?? null,
      stopPrice: spec.stopPrice,
      marketType: "crypto",
      currentSigma: BASE_SIGMA,
      baseSigma: BASE_SIGMA,
      accountEquity: this.account.equity,
      leverageAckReceived: false, // crypto — no leverage ack required
      sessionOpen: true,
    };

    this.orderBook.submitOrder(params, tickIndex, simTimeMs);
    return orderId;
  }

  /** Current account equity (balance + unrealized PnL). */
  get accountEquity(): number {
    return this.account.equity;
  }

  /** Current account balance (settled cash). */
  get accountBalance(): number {
    return this.account.balance;
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

  setCompression(mode: CompressionMode): boolean {
    return this.clock.setCompression(mode);
  }

  get compression(): CompressionMode {
    return this.clock.state.compression;
  }
}
