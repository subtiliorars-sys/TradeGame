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
 */

import {
  createClock,
  createCryptoAdapter,
  createEventLog,
  seed as seedPrng,
  type SimClock,
  type CompressionMode,
  ticksPerWallSecond,
} from "../../index.js";
import type { IMarketFeed } from "../../data/feed.js";

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

export type TickCallback = (tick: PriceTick) => void;

const SCN001_SEED = 42_001;
const MS_PER_TICK = 1_000; // 1 sim-second per tick

export class SessionAdapter {
  readonly clock: SimClock;
  readonly log = createEventLog("ui-session-" + Date.now());

  private readonly feed: IMarketFeed;
  private accumulatedMs = 0;
  private tickListeners: TickCallback[] = [];

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
        // Engine tick handler: advance the feed and broadcast the tick.
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
        for (const cb of this.tickListeners) cb(pt);
      },
      MS_PER_TICK
    );
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

  setCompression(mode: CompressionMode): boolean {
    return this.clock.setCompression(mode);
  }

  get compression(): CompressionMode {
    return this.clock.state.compression;
  }
}
