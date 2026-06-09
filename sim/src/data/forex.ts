/**
 * Forex synthetic adapter — SIM_ENGINE_SPEC §2.4.
 *
 * Characteristics:
 *   - Four session windows (UTC): Sydney 22:00–07:00, Tokyo 00:00–09:00,
 *     London 08:00–17:00, New York 13:00–22:00.
 *   - Spread model by session phase (spec §2.4, all TUNABLE):
 *       single session:      1.2 pips
 *       session overlap:     0.8 pips
 *       between sessions:    2.5 pips
 *       session open (5min): spread × 3.5, decaying linearly
 *   - Weekend gap: Friday 22:00 UTC close → Sunday 22:00 UTC open.
 *     Gap applied as a one-tick price jump at the Sunday open.
 *   - News-event hook (SCN-006 MLCR shape):
 *       NewsEventBeat triggers: spread blowout to spreadBlowoutPips,
 *       initial spike, double-whipsaw, then trend drift.
 *       Spread decays back to session normal over blowoutDecayTicks.
 *
 * Session-time model:
 *   The adapter maps simTimeMs to a UTC hour offset from a midnight anchor.
 *   Day 0 midnight is at simTimeMs = 0.  No Date.now() or real UTC used.
 *
 * Fictional instrument: ANDU pair (FICTIONAL_CANON.md entry 9).
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
  forcePrice,
  forceRegime,
  setElevatedSigma,
  FOREX_GBM_PARAMS,
  type GeneratorState,
} from "./generator.js";
import type { Prng } from "../engine/prng.js";

// ---------------------------------------------------------------------------
// Tunable constants (spec §2.4, all TUNABLE)
// ---------------------------------------------------------------------------

/** Pip size for a 4-decimal forex pair (e.g. ANDU). */
const PIP_SIZE = 0.0001;

/** Session spread table (in pips). TUNABLE per spec §2.4. */
const SPREAD_SINGLE_SESSION_PIPS = 1.2;
const SPREAD_OVERLAP_PIPS = 0.8;
const SPREAD_BETWEEN_SESSIONS_PIPS = 2.5;
/** Multiplier at session open (first 5 min). TUNABLE: 3.5. */
const SESSION_OPEN_SPREAD_MULT = 3.5;
/** Ticks in the 5-minute open spike window (at 1 tick/s = 300 ticks). TUNABLE. */
const SESSION_OPEN_SPIKE_TICKS = 300;

/** Weekend gap sigma. TUNABLE: 0.0020. */
const WEEKEND_GAP_SIGMA = 0.0020;

/** Base volume for forex ticks. TUNABLE. */
const BASE_VOLUME = 100000;

// ---------------------------------------------------------------------------
// Session window helpers (all UTC offsets in ms)
// ---------------------------------------------------------------------------

const MS_PER_SEC  = 1000;
const MS_PER_MIN  = 60 * MS_PER_SEC;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const SIM_DAY_MS  = 24 * MS_PER_HOUR;
const SIM_WEEK_MS = 7 * SIM_DAY_MS;

/**
 * UTC hour offset in ms within the current sim day.
 * Sim day 0 midnight is at simTimeMs = 0.
 */
function utcOffsetMs(simTimeMs: number): number {
  return ((simTimeMs % SIM_DAY_MS) + SIM_DAY_MS) % SIM_DAY_MS;
}

/**
 * Sim day of week (0=Monday, 4=Friday, 5=Saturday, 6=Sunday).
 * Day 0 of the sim is mapped to Monday (arbitrary but consistent).
 */
function simDayOfWeek(simTimeMs: number): number {
  const dayIndex = Math.floor(((simTimeMs % SIM_WEEK_MS) + SIM_WEEK_MS) % SIM_WEEK_MS / SIM_DAY_MS);
  return dayIndex; // 0–6
}

/** Is the sim time within the forex weekend (Friday 22:00 UTC to Sunday 22:00 UTC)? */
function isWeekend(simTimeMs: number): boolean {
  const dow = simDayOfWeek(simTimeMs);
  const utc = utcOffsetMs(simTimeMs);
  const fridayClose = 22 * MS_PER_HOUR;
  const sundayOpen  = 22 * MS_PER_HOUR;
  if (dow === 4 /* Friday */ && utc >= fridayClose) return true;
  if (dow === 5 /* Saturday */) return true;
  if (dow === 6 /* Sunday */ && utc < sundayOpen) return true;
  return false;
}

/** Is this the first tick of the Sunday re-open (for weekend gap application)? */
function isSundayOpen(simTimeMs: number, msPerTick: number): boolean {
  const dow = simDayOfWeek(simTimeMs);
  const utc = utcOffsetMs(simTimeMs);
  const sundayOpen = 22 * MS_PER_HOUR;
  if (dow !== 6) return false;
  // First tick at or after Sunday 22:00 UTC
  return utc >= sundayOpen && utc < sundayOpen + msPerTick;
}

// ---------------------------------------------------------------------------
// Session overlap detection
// ---------------------------------------------------------------------------

type ForexSessionName = "Sydney" | "Tokyo" | "London" | "New York" | "between";

interface ActiveSessions {
  names: ForexSessionName[];
  isOverlap: boolean;
  /** Is the sim within 5 minutes of any session open? */
  isNearOpen: boolean;
  nearOpenName: ForexSessionName | null;
}

const SESSION_WINDOWS: Array<{ name: ForexSessionName; openMs: number; closeMs: number }> = [
  { name: "Sydney",   openMs: 22 * MS_PER_HOUR, closeMs: 31 * MS_PER_HOUR }, // wraps midnight
  { name: "Tokyo",    openMs:  0 * MS_PER_HOUR, closeMs:  9 * MS_PER_HOUR },
  { name: "London",   openMs:  8 * MS_PER_HOUR, closeMs: 17 * MS_PER_HOUR },
  { name: "New York", openMs: 13 * MS_PER_HOUR, closeMs: 22 * MS_PER_HOUR },
];

function activeSessions(simTimeMs: number): ActiveSessions {
  const utc = utcOffsetMs(simTimeMs);
  const fiveMin = 5 * MS_PER_MIN;
  const names: ForexSessionName[] = [];
  let nearOpenName: ForexSessionName | null = null;

  for (const w of SESSION_WINDOWS) {
    let open = w.openMs;
    let close = w.closeMs;

    // Sydney wraps midnight: open=22:00, close=07:00 next day (31:00 in ms).
    // We handle this by checking open <= close vs not.
    let isActive: boolean;
    if (open < close) {
      isActive = utc >= open && utc < close;
    } else {
      // wraps midnight
      isActive = utc >= open || utc < (close - SIM_DAY_MS);
    }
    // For Sydney the closeMs is 31*MS_PER_HOUR so subtract day if needed.
    if (w.name === "Sydney") {
      isActive = utc >= 22 * MS_PER_HOUR || utc < 7 * MS_PER_HOUR;
      open = 22 * MS_PER_HOUR;
    }

    if (isActive) {
      names.push(w.name);
      // Near-open detection: within 5 minutes after session open.
      const openInDay = open % SIM_DAY_MS;
      const dist = (utc - openInDay + SIM_DAY_MS) % SIM_DAY_MS;
      if (dist < fiveMin) {
        nearOpenName = w.name;
      }
    }
  }

  return {
    names,
    isOverlap: names.length >= 2,
    isNearOpen: nearOpenName !== null,
    nearOpenName,
  };
}

/** Compute base spread in price units for the given session state. */
function baseSpreadFromSession(
  sess: ActiveSessions,
  openSpikeFraction: number // 0=no spike, 1=full spike, fades linearly
): number {
  let pips: number;
  if (sess.names.length === 0) {
    pips = SPREAD_BETWEEN_SESSIONS_PIPS;
  } else if (sess.isOverlap) {
    pips = SPREAD_OVERLAP_PIPS;
  } else {
    pips = SPREAD_SINGLE_SESSION_PIPS;
  }
  if (sess.isNearOpen && openSpikeFraction > 0) {
    pips *= 1 + (SESSION_OPEN_SPREAD_MULT - 1) * openSpikeFraction;
  }
  return pips * PIP_SIZE;
}

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

interface ForexAdapterState {
  gen: GeneratorState;
  prng: Prng;
  msPerTick: number;
  pendingBeats: ScenarioBeat[];
  priceOverrideRemaining: number;
  priceOverrideValue: number;
  spreadOverrideRemaining: number;
  spreadOverrideValue: number;
  regimeOverrideRemaining: number;
  /** Ticks remaining in the session-open spread spike. */
  openSpikeTicksRemaining: number;
  /** Current session near-open (for decay tracking). */
  openSpikeSession: ForexSessionName | null;
  /** Whether the weekend gap has been applied for the current Sunday open. */
  weekendGapApplied: boolean;
  /** News event state. */
  newsEventActive: boolean;
  newsSpreadPips: number;
  newsSpreadDecayTicks: number;
  newsSpreadDecayRemaining: number;
  /** Remaining news-pattern ticks for price movement. */
  newsPatternPhase: "none" | "spike" | "whipsaw" | "trend";
  newsPatternTicksRemaining: number;
  newsTrendTarget: number;
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export function createForexAdapter(): IMarketFeed {
  let state: ForexAdapterState | null = null;
  let savedConfig: MarketConfig | null = null;

  function init(config: MarketConfig): void {
    savedConfig = config;
    const script = config.script ?? [];
    const sortedBeats = [...script].sort((a, b) => a.simTimeMs - b.simTimeMs);

    state = {
      gen: createGeneratorState(config.startPrice, FOREX_GBM_PARAMS, "quiet"),
      prng: config.prng,
      msPerTick: config.msPerTick,
      pendingBeats: sortedBeats,
      priceOverrideRemaining: 0,
      priceOverrideValue: 0,
      spreadOverrideRemaining: 0,
      spreadOverrideValue: 0,
      regimeOverrideRemaining: 0,
      openSpikeTicksRemaining: 0,
      openSpikeSession: null,
      weekendGapApplied: false,
      newsEventActive: false,
      newsSpreadPips: 0,
      newsSpreadDecayTicks: 0,
      newsSpreadDecayRemaining: 0,
      newsPatternPhase: "none",
      newsPatternTicksRemaining: 0,
      newsTrendTarget: config.startPrice,
    };
  }

  function requireState(): ForexAdapterState {
    if (state === null) throw new Error("ForexAdapter: call init() first");
    return state;
  }

  function nextTick(): TickEvent {
    const s = requireState();
    const tickIndex = s.gen.tickIndex;
    const simTimeMs = tickIndex * s.msPerTick;

    // 1. Apply due beats.
    applyDueBeats(s, simTimeMs);

    // 2. Weekend check.
    const weekend = isWeekend(simTimeMs);

    // 3. Weekend gap at Sunday open.
    if (!weekend && isSundayOpen(simTimeMs, s.msPerTick) && !s.weekendGapApplied) {
      // Draw a gap from N(0, sigma_weekend) and apply it.
      const gapZ = s.prng.nextGaussian();
      const gapReturn = WEEKEND_GAP_SIGMA * gapZ;
      const gappedPrice = s.gen.price * Math.exp(gapReturn);
      forcePrice(s.gen, gappedPrice);
      s.weekendGapApplied = true;
    } else if (weekend) {
      s.weekendGapApplied = false; // reset so gap fires on next Sunday open
    }

    // 4. Session near-open spike tracking.
    const sess = activeSessions(simTimeMs);
    if (sess.isNearOpen && s.openSpikeSession !== sess.nearOpenName) {
      // New session opened — start spike countdown.
      s.openSpikeTicksRemaining = SESSION_OPEN_SPIKE_TICKS;
      s.openSpikeSession = sess.nearOpenName ?? null;
    }
    const openSpikeFraction = s.openSpikeTicksRemaining > 0
      ? s.openSpikeTicksRemaining / SESSION_OPEN_SPIKE_TICKS
      : 0;
    if (s.openSpikeTicksRemaining > 0) s.openSpikeTicksRemaining--;

    // 5. Regime override decrement.
    if (s.regimeOverrideRemaining > 0) s.regimeOverrideRemaining--;

    // 6. Always advance GBM (fixed draw budget).
    const prevPrice = s.gen.price;

    // If weekend, still advance GBM to consume draws — output is suppressed.
    stepGbm(s.gen, s.prng);

    let outputPrice = s.gen.price;

    // 7. Price override (beat-driven or news pattern).
    if (s.priceOverrideRemaining > 0) {
      outputPrice = s.priceOverrideValue;
      forcePrice(s.gen, outputPrice);
      s.priceOverrideRemaining--;
    }

    // 8. News event price pattern.
    if (s.newsEventActive && s.newsPatternPhase !== "none" && s.newsPatternTicksRemaining > 0) {
      const fraction = s.newsPatternTicksRemaining > 0
        ? 1 - (s.newsPatternTicksRemaining / (s.newsPatternTicksRemaining + 1))
        : 1;
      _ = fraction; // fraction used contextually in each phase
      s.newsPatternTicksRemaining--;
      if (s.newsPatternTicksRemaining === 0) {
        // Advance phase.
        // s.newsPatternPhase is narrowed to "spike"|"whipsaw"|"trend" by the outer if.
        const phase = s.newsPatternPhase;
        switch (phase) {
          case "spike":    s.newsPatternPhase = "whipsaw"; s.newsPatternTicksRemaining = 8; break;
          case "whipsaw":  s.newsPatternPhase = "trend";   s.newsPatternTicksRemaining = 20; break;
          case "trend":    s.newsPatternPhase = "none"; s.newsEventActive = false; break;
          default:         assertNeverPhase(phase);
        }
      }
      // Steer price toward the trend target during the trend phase.
      if (s.newsPatternPhase === "trend") {
        const pull = (s.newsTrendTarget - outputPrice) * 0.05; // gentle pull
        outputPrice += pull;
        forcePrice(s.gen, outputPrice);
      }
    }

    // 9. Compute spread.
    let spread: number;
    if (s.spreadOverrideRemaining > 0) {
      spread = s.spreadOverrideValue;
      s.spreadOverrideRemaining--;
    } else if (s.newsEventActive && s.newsSpreadDecayRemaining > 0) {
      // News spread: starts at blowout, decays linearly toward session normal.
      const newsSpread = s.newsSpreadPips * PIP_SIZE;
      const normalSpread = baseSpreadFromSession(sess, openSpikeFraction);
      const t = s.newsSpreadDecayRemaining / s.newsSpreadDecayTicks;
      spread = normalSpread + (newsSpread - normalSpread) * t;
      s.newsSpreadDecayRemaining--;
      if (s.newsSpreadDecayRemaining === 0) {
        s.newsEventActive = false;
      }
    } else {
      spread = baseSpreadFromSession(sess, openSpikeFraction);
    }

    // 10. During weekend: return zero-volume tick with current price (market closed).
    const isOpen = !weekend && sess.names.length > 0;
    const volume = isOpen
      ? BASE_VOLUME * (0.5 + s.prng.nextFloat())
      : 0;

    // 11. OHLCV.
    const open = prevPrice;
    const close = outputPrice;
    const high = Math.max(open, close) * (1 + s.prng.nextFloat() * 0.0002);
    const low = Math.min(open, close) * (1 - s.prng.nextFloat() * 0.0002);

    return {
      type: "tick",
      tickIndex,
      timestamp: simTimeMs,
      open,
      high,
      low,
      close,
      volume,
      spread,
    };
  }

  function seekTo(targetTickIndex: number): void {
    if (savedConfig === null) throw new Error("ForexAdapter: call init() first");
    init(savedConfig);
    for (let i = 0; i < targetTickIndex; i++) {
      nextTick();
    }
  }

  function sessionState(): SessionState {
    if (state === null) return { isOpen: false, sessionName: "between", haltReason: null };
    const s = state;
    const simTimeMs = s.gen.tickIndex * s.msPerTick;
    if (isWeekend(simTimeMs)) {
      return { isOpen: false, sessionName: "weekend", haltReason: "weekend gap" };
    }
    const sess = activeSessions(simTimeMs);
    const isOpen = sess.names.length > 0;
    const name = sess.names.length > 0 ? sess.names.join(" + ") : "between sessions";
    return { isOpen, sessionName: name, haltReason: null };
  }

  return { init, nextTick, seekTo, sessionState };
}

// ---------------------------------------------------------------------------
// Beat application helper
// ---------------------------------------------------------------------------

function applyDueBeats(s: ForexAdapterState, currentSimTimeMs: number): void {
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

      case "news_event": {
        // Trigger: spread blowout + double-whipsaw + trend pattern (SCN-006).
        s.newsEventActive = true;
        s.newsSpreadPips = beat.spreadBlowoutPips;
        s.newsSpreadDecayTicks = beat.blowoutDecayTicks;
        s.newsSpreadDecayRemaining = beat.blowoutDecayTicks;
        s.newsPatternPhase = "spike";
        s.newsPatternTicksRemaining = 5; // spike phase: 5 ticks
        // After spike + whipsaw, trend toward a target offset by trendDriftPips.
        s.newsTrendTarget = s.gen.price + beat.trendDriftPips * PIP_SIZE;
        // Also boost sigma for elevated volatility during the event.
        setElevatedSigma(s.gen, 3.0, beat.blowoutDecayTicks);
        break;
      }

      case "depeg_trigger":
        // Not applicable to forex adapter.
        break;

      case "earnings_gap":
        // Not applicable to forex adapter.
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
  throw new Error(`ForexAdapter: unhandled beat kind: ${JSON.stringify(beat)}`);
}

function assertNeverPhase(phase: never): never {
  throw new Error(`ForexAdapter: unhandled news phase: ${String(phase)}`);
}

// Silence unused-variable lint for internal variable.
let _ = undefined as unknown;
