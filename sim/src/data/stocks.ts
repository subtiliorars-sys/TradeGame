/**
 * Stocks synthetic adapter — SIM_ENGINE_SPEC §2.3.
 *
 * Characteristics:
 *   - US session hours enforced: 09:30–16:00 ET (pre-market 04:00–09:30;
 *     after-hours 16:00–20:00).  Outside hours: isOpen=false, no ticks
 *     emitted (nextTick() returns a zero-volume "session-closed" tick).
 *   - Session-open volatility spike: sigma × 2.5 for first 90 ticks.
 *   - Earnings gap hook: EarningsGapBeat applies a price gap and post-gap
 *     sigma multiplier (1.8, decaying over 1200 ticks) — SCN-002 shape.
 *   - Closing-auction tick: at tick matching 15:50 ET simTime, volume
 *     spikes 10× and a brief price-override window produces the auction print.
 *     The auction tick is emitted as a normal TickEvent with elevated volume.
 *   - Multi-session support: the adapter tracks an internal "sim day" counter
 *     so SCN-005 (5 sessions) works correctly.  Session N starts at
 *     N × DAY_MS from session 0 open (08:00 ET = 12:00 UTC anchor).
 *   - Trading halt: DepegTriggerBeat-style halt via spread_override + isOpen=false.
 *
 * Session-time model:
 *   The adapter converts simTimeMs to an offset within the current sim day,
 *   mapping it onto an ET clock.  This avoids Date.now() and real-world
 *   timezone libraries entirely — sim time IS the clock.
 *
 * Fictional instrument: NGSM (Northgate Systems) per FICTIONAL_CANON.md entry 6.
 *
 * NO Math.random() — all randomness through MarketConfig.prng.
 * NO Date.now() — no wall-clock dependency.
 */

import type { TickEvent } from "../engine/events.js";
import type {
  IMarketFeed,
  MarketConfig,
  SessionState,
  ScenarioBeat,
} from "./feed.js";
import {
  createGeneratorState,
  stepGbm,
  computeSpread,
  setElevatedSigma,
  forcePrice,
  forceRegime,
  STOCKS_GBM_PARAMS,
  type GeneratorState,
} from "./generator.js";
import type { Prng } from "../engine/prng.js";

// ---------------------------------------------------------------------------
// Tunable constants (spec §2.3, all TUNABLE)
// ---------------------------------------------------------------------------

/** Session-open sigma spike multiplier. TUNABLE: 2.5. */
const OPEN_SIGMA_MULTIPLIER = 2.5;
/** Ticks at elevated open volatility. TUNABLE: 90. */
const OPEN_SIGMA_TICKS = 90;

/** Post-earnings gap sigma multiplier. TUNABLE: 1.8. */
const EARNINGS_GAP_SIGMA_MULTIPLIER = 1.8;
/** Post-earnings gap sigma decay ticks. TUNABLE: 1200. */
const EARNINGS_GAP_SIGMA_DECAY_TICKS = 1200;

/** Pre-market spread multiplier. TUNABLE: 3x. */
const PREMARKET_SPREAD_MULT = 3.0;
/** Pre-market volume fraction. TUNABLE: 0.1x. */
const PREMARKET_VOLUME_MULT = 0.1;

/** Base volume for normal session ticks. TUNABLE. */
const BASE_VOLUME = 50000;

/**
 * Closing auction configuration (SCN-005).
 * Auction fires at the tick that falls in the [15:50, 16:00) ET window.
 * TUNABLE: volume multiplier 10×.
 */
const AUCTION_VOLUME_MULTIPLIER = 10.0;
/** Auction price spike above the last regular tick (fractional). TUNABLE. */
const AUCTION_PRICE_BUMP = 0.016; // ~1.6% per SCN-005 ($37.20 → $37.80 ÷ $37.20)

// ---------------------------------------------------------------------------
// Session time helpers
// ---------------------------------------------------------------------------

/**
 * Sim-day offset constants in milliseconds.
 * The sim anchor: day 0 opens at tick 0 which corresponds to 08:00 ET.
 * (Pre-market begins at sim-anchor; regular open is 90 min = 5400s in.)
 *
 * All times are offsets from the sim-day anchor (08:00 ET = 0 ms).
 */
const MS_PER_SEC = 1000;
const MS_PER_MIN = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MIN;

/** Duration of one sim day (08:00 ET – 08:00 ET next day). TUNABLE. */
const SIM_DAY_MS = 24 * MS_PER_HOUR;

/** Pre-market starts at 04:00 ET — 4 hours before anchor (08:00). */
const PREMARKET_OPEN_MS = -4 * MS_PER_HOUR; // negative relative to day anchor
/** Regular session opens at 09:30 ET = +90 min from anchor. */
const REGULAR_OPEN_MS = 90 * MS_PER_MIN;
/** Regular session closes at 16:00 ET = +480 min from anchor. */
const REGULAR_CLOSE_MS = 480 * MS_PER_MIN;
/** After-hours closes at 20:00 ET = +720 min from anchor. */
const AFTERHOURS_CLOSE_MS = 720 * MS_PER_MIN;
/** Closing auction starts at 15:50 ET = 470 min from anchor. */
const AUCTION_START_MS = 470 * MS_PER_MIN;

/**
 * Given simTimeMs and the active sim-day length, return the offset in
 * milliseconds from the current day's 08:00 ET anchor.
 *
 * Day 0 anchor is at simTimeMs = 0.
 * Day N anchor is at simTimeMs = N × dayMs.
 */
function dayOffsetMs(simTimeMs: number, dayMs: number): number {
  return ((simTimeMs % dayMs) + dayMs) % dayMs;
}

type SessionPhase = "before_premarket" | "premarket" | "regular" | "auction" | "afterhours" | "closed";

/**
 * Session phase for a sim time, with the ET-clock phase boundaries scaled
 * proportionally when the scenario uses a compressed sim day
 * (MarketConfig.simDayMs — SCN-005's 72-minute days).  With the default
 * 24h day, scale = 1 and behaviour is identical to the original model.
 */
function sessionPhase(simTimeMs: number, dayMs: number): SessionPhase {
  const scale = dayMs / SIM_DAY_MS;
  const offset = dayOffsetMs(simTimeMs, dayMs);
  // The sim day anchor is 08:00 ET; pre-market is before that.
  // Since we map offset to [0, dayMs), pre-market is in the upper range.
  // Premarket: [dayMs + PREMARKET_OPEN_MS·scale, dayMs) ∪ [0, REGULAR_OPEN_MS·scale)
  const preMarketStart = dayMs + PREMARKET_OPEN_MS * scale; // 20:00 (= 04:00 ET next day)
  if (offset >= preMarketStart) return "premarket";           // late day wraps to early premarket
  if (offset < REGULAR_OPEN_MS * scale) return "premarket";  // 08:00–09:30
  if (offset >= AUCTION_START_MS * scale && offset < REGULAR_CLOSE_MS * scale) return "auction";
  if (offset >= REGULAR_OPEN_MS * scale && offset < REGULAR_CLOSE_MS * scale) return "regular";
  if (offset >= REGULAR_CLOSE_MS * scale && offset < AFTERHOURS_CLOSE_MS * scale) return "afterhours";
  return "closed";
}

function sessionNameFromPhase(phase: SessionPhase): string {
  switch (phase) {
    case "before_premarket": return "closed";
    case "premarket":        return "pre-market";
    case "regular":          return "New York";
    case "auction":          return "New York (closing auction)";
    case "afterhours":       return "after-hours";
    case "closed":           return "closed";
    default:                 return assertNeverPhase(phase);
  }
}

function assertNeverPhase(p: never): never {
  throw new Error(`StocksAdapter: unhandled session phase: ${String(p)}`);
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

interface StocksAdapterState {
  gen: GeneratorState;
  prng: Prng;
  msPerTick: number;
  /** Active sim-day length (default SIM_DAY_MS; compressed for SCN-005). */
  dayMs: number;
  pendingBeats: ScenarioBeat[];
  priceOverrideRemaining: number;
  priceOverrideValue: number;
  spreadOverrideRemaining: number;
  spreadOverrideValue: number;
  regimeOverrideRemaining: number;
  /** Whether the adapter is in a trading halt. */
  isHalted: boolean;
  haltReason: string | null;
  haltTicksRemaining: number;
  /** Whether the open-sigma spike has been applied this session. */
  openSpikeApplied: boolean;
  /** Last session phase, to detect session-open transitions. */
  lastPhase: SessionPhase;
  /** True during the auction tick to flag elevated volume. */
  auctionActive: boolean;
  /** Tick index of when auction was activated (to limit to one tick). */
  auctionActiveTick: number;
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export function createStocksAdapter(): IMarketFeed {
  let state: StocksAdapterState | null = null;
  let savedConfig: MarketConfig | null = null;

  function init(config: MarketConfig): void {
    savedConfig = config;
    const script = config.script ?? [];
    const sortedBeats = [...script].sort((a, b) => a.simTimeMs - b.simTimeMs);

    state = {
      gen: createGeneratorState(config.startPrice, STOCKS_GBM_PARAMS, "quiet"),
      prng: config.prng,
      msPerTick: config.msPerTick,
      dayMs: config.simDayMs ?? SIM_DAY_MS,
      pendingBeats: sortedBeats,
      priceOverrideRemaining: 0,
      priceOverrideValue: 0,
      spreadOverrideRemaining: 0,
      spreadOverrideValue: 0,
      regimeOverrideRemaining: 0,
      isHalted: false,
      haltReason: null,
      haltTicksRemaining: 0,
      openSpikeApplied: false,
      lastPhase: "closed",
      auctionActive: false,
      auctionActiveTick: -1,
    };
  }

  function requireState(): StocksAdapterState {
    if (state === null) throw new Error("StocksAdapter: call init() first");
    return state;
  }

  function nextTick(): TickEvent {
    const s = requireState();
    const tickIndex = s.gen.tickIndex;
    const simTimeMs = tickIndex * s.msPerTick;

    // 1. Apply due beats.
    applyDueBeats(s, simTimeMs);

    // 2. Decrement halt counter.
    if (s.isHalted && s.haltTicksRemaining > 0) {
      s.haltTicksRemaining--;
      if (s.haltTicksRemaining === 0) {
        s.isHalted = false;
        s.haltReason = null;
      }
    }

    // 3. Session phase.
    const phase = sessionPhase(simTimeMs, s.dayMs);
    const isOpen = !s.isHalted && (phase === "regular" || phase === "auction" || phase === "premarket");

    // 4. Detect session open to apply the open-sigma spike.
    if (phase === "regular" && s.lastPhase !== "regular" && s.lastPhase !== "auction") {
      if (!s.openSpikeApplied) {
        setElevatedSigma(s.gen, OPEN_SIGMA_MULTIPLIER, OPEN_SIGMA_TICKS);
        s.openSpikeApplied = true;
      }
    }
    // Reset open spike flag when we leave the regular session (for multi-session scenarios).
    if (phase === "closed" || phase === "before_premarket") {
      s.openSpikeApplied = false;
    }
    s.lastPhase = phase;

    // 5. Regime override decrement.
    if (s.regimeOverrideRemaining > 0) {
      s.regimeOverrideRemaining--;
    }

    // 6. Always advance GBM (fixed draw budget, regardless of session state).
    const prevPrice = s.gen.price;
    const rawPrice = stepGbm(s.gen, s.prng);

    // 7. Resolve output price.
    let outputPrice = rawPrice;
    if (s.priceOverrideRemaining > 0) {
      outputPrice = s.priceOverrideValue;
      forcePrice(s.gen, outputPrice);
      s.priceOverrideRemaining--;
    }

    // 8. Compute spread.
    let spread: number;
    if (s.spreadOverrideRemaining > 0) {
      spread = s.spreadOverrideValue;
      s.spreadOverrideRemaining--;
    } else {
      const baseSpread = computeSpread(s.gen, prevPrice);
      spread = (phase === "premarket")
        ? baseSpread * PREMARKET_SPREAD_MULT
        : baseSpread;
    }

    // 9. Closing-auction tick.
    //    Fires exactly once per auction window per session.
    let volumeMultiplier = 1.0;
    s.auctionActive = false;
    if (phase === "auction" && s.auctionActiveTick !== tickIndex) {
      s.auctionActive = true;
      s.auctionActiveTick = tickIndex;
      volumeMultiplier = AUCTION_VOLUME_MULTIPLIER;
      // Apply the auction price bump — price temporarily spikes above close.
      const auctionPrice = outputPrice * (1 + AUCTION_PRICE_BUMP);
      outputPrice = auctionPrice;
      forcePrice(s.gen, outputPrice);
    }

    // 10. Volume.
    const absDelta = Math.abs(outputPrice - prevPrice) / prevPrice;
    const baseVol = BASE_VOLUME * (1 + 5.0 * absDelta) * (0.5 + s.prng.nextFloat());
    const sessionVol = (phase === "premarket")
      ? baseVol * PREMARKET_VOLUME_MULT
      : (isOpen ? baseVol * volumeMultiplier : 0);

    // 11. OHLCV.
    const open = prevPrice;
    const close = outputPrice;
    const high = Math.max(open, close) * (1 + s.prng.nextFloat() * 0.001);
    const low = Math.min(open, close) * (1 - s.prng.nextFloat() * 0.001);

    return {
      type: "tick",
      tickIndex,
      timestamp: simTimeMs,
      open,
      high,
      low,
      close,
      volume: sessionVol,
      spread,
    };
  }

  function seekTo(targetTickIndex: number): void {
    if (savedConfig === null) throw new Error("StocksAdapter: call init() first");
    init(savedConfig);
    for (let i = 0; i < targetTickIndex; i++) {
      nextTick();
    }
  }

  function sessionState(): SessionState {
    if (state === null) return { isOpen: false, sessionName: "closed", haltReason: null };
    const s = state;
    if (s.isHalted) {
      return { isOpen: false, sessionName: "halted", haltReason: s.haltReason };
    }
    const simTimeMs = s.gen.tickIndex * s.msPerTick;
    const phase = sessionPhase(simTimeMs, s.dayMs);
    const isOpen = phase === "regular" || phase === "auction" || phase === "premarket";
    return {
      isOpen,
      sessionName: sessionNameFromPhase(phase),
      haltReason: null,
    };
  }

  return { init, nextTick, seekTo, sessionState };
}

// ---------------------------------------------------------------------------
// Beat application helper
// ---------------------------------------------------------------------------

function applyDueBeats(s: StocksAdapterState, currentSimTimeMs: number): void {
  while (s.pendingBeats.length > 0) {
    const beat = s.pendingBeats[0];
    if (beat === undefined || beat.simTimeMs > currentSimTimeMs) break;
    s.pendingBeats.shift();

    switch (beat.kind) {
      case "price_override":
        s.priceOverrideValue = beat.price;
        s.priceOverrideRemaining = beat.durationTicks;
        break;

      case "spread_override":
        s.spreadOverrideValue = beat.spread;
        s.spreadOverrideRemaining = beat.durationTicks;
        break;

      case "regime_override":
        forceRegime(s.gen, beat.regime);
        s.regimeOverrideRemaining = beat.durationTicks;
        break;

      case "earnings_gap": {
        // Apply an immediate price gap, then elevate sigma.
        const gapFactor = beat.gapDirection === "up"
          ? (1 + beat.gapMagnitude)
          : (1 - beat.gapMagnitude);
        const gappedPrice = s.gen.price * gapFactor;
        forcePrice(s.gen, gappedPrice);
        s.priceOverrideValue = gappedPrice;
        s.priceOverrideRemaining = 1; // hold for 1 tick then resume GBM

        forceRegime(s.gen, beat.postGapRegime);
        setElevatedSigma(s.gen, EARNINGS_GAP_SIGMA_MULTIPLIER, EARNINGS_GAP_SIGMA_DECAY_TICKS);
        break;
      }

      case "depeg_trigger":
        // Not applicable to stocks; treat as a trading halt for generality.
        s.isHalted = true;
        s.haltReason = "circuit breaker";
        s.haltTicksRemaining = 30; // default 30 ticks if no spread_override beat follows
        break;

      case "news_event":
        // Not applicable to stocks adapter.
        break;

      case "seed_position":
        // Handled by the harness (run.ts) before tick 0; no price-feed effect.
        break;

      default:
        assertNeverBeat(beat);
    }
  }
}

function assertNeverBeat(beat: never): never {
  throw new Error(`StocksAdapter: unhandled beat kind: ${JSON.stringify(beat)}`);
}
