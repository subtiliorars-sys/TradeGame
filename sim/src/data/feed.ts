/**
 * IMarketFeed — data layer interface — SIM_ENGINE_SPEC §2.1.
 *
 * All synthetic market adapters implement this interface. The tick pipeline
 * (clock.ts) calls nextTick() once per logical tick; the adapter is responsible
 * for advancing its own PRNG-driven generator state.
 *
 * Determinism constraints (§1.1):
 *   - No Math.random() — all randomness via the engine Prng handle.
 *   - No Date.now() — sim time is tick-index × msPerTick.
 *   - seekTo() must restore adapter state identically to running forward to
 *     that tick from init() — required for replay.
 *
 * EventInjector hook:
 *   The caller may push ScenarioBeat payloads into the adapter via
 *   injectBeat(). Beats override the stochastic output at exact sim-times
 *   without perturbing PRNG consumption — see ScenarioBeat docs below.
 */

import type { Prng } from "../engine/prng.js";
import type { TickEvent } from "../engine/events.js";

// ---------------------------------------------------------------------------
// Re-import TickEvent for use within this file and sub-modules.
// Consumers import TickEvent from the engine/events module directly.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Market metadata
// ---------------------------------------------------------------------------

/**
 * Instrument descriptor — spec §2.1 "market metadata".
 * All names are from FICTIONAL_CANON.md; no real assets permitted.
 */
export interface InstrumentInfo {
  /** Canonical fictional instrument identifier (e.g., "HarborUSD/USVC"). */
  symbol: string;
  /** "crypto" | "stocks" | "forex" */
  marketType: "crypto" | "stocks" | "forex";
  /** Minimum price increment (e.g., 0.0001 for a 4-decimal forex pair). */
  tickSize: number;
  /** Base spread in price units at normal market conditions. */
  baseSpread: number;
  /** Canonical pip size for forex pairs; 1 for non-pip markets. */
  pipSize: number;
}

// ---------------------------------------------------------------------------
// Session state
// ---------------------------------------------------------------------------

/**
 * Session-level state snapshot per spec §2.1.
 *
 * isOpen=false during: trading halts, stocks pre/after-hours, forex weekends.
 * Adapters that are always open (crypto) return isOpen=true unconditionally.
 */
export interface SessionState {
  /** False during halts, after-hours (stocks), weekends (forex). */
  isOpen: boolean;
  /** "24/7" | "New York" | "London" | "Tokyo" | "Sydney" | "pre-market" | ... */
  sessionName: string;
  /** Non-null when isOpen=false due to a halt. */
  haltReason: string | null;
}

// ---------------------------------------------------------------------------
// Scenario beat types
// ---------------------------------------------------------------------------

/**
 * A ScenarioScript is an ordered list of beats authored per SCENARIOS_V0/V1.
 * Beats express "at sim-time T, force this generator state" so authored
 * scenarios are deterministic on top of the stochastic layer.
 *
 * REPLAY DETERMINISM GUARANTEE
 * ─────────────────────────────
 * Beats NEVER consume or skip PRNG draws.  The generator always advances
 * its PRNG as though no beat existed; the beat only overrides the *output*
 * (price/regime/spread) returned from nextTick() at that exact tick.
 * This means: same seed + same beat list → identical tick stream every run;
 * same seed + empty beat list → identical stochastic stream every run.
 * PRNG state at tick N is solely a function of the seed and N — beats are
 * a post-PRNG output filter, not a branch in the PRNG path.
 */

/** Force price to a fixed value for `durationTicks`. */
export interface PriceOverrideBeat {
  kind: "price_override";
  simTimeMs: number;     // when to start
  durationTicks: number; // how many ticks to hold the override
  price: number;         // absolute price to output
}

/** Force the generator into a regime for `durationTicks`. */
export interface RegimeOverrideBeat {
  kind: "regime_override";
  simTimeMs: number;
  durationTicks: number;
  regime: "quiet" | "trending_up" | "trending_down";
}

/** Force the spread to a fixed value for `durationTicks`. */
export interface SpreadOverrideBeat {
  kind: "spread_override";
  simTimeMs: number;
  durationTicks: number;
  spread: number; // in price units
}

/** Trigger the depeg post-event sigma multiplier (crypto adapter). */
export interface DepegTriggerBeat {
  kind: "depeg_trigger";
  simTimeMs: number;
}

/** Trigger the earnings-gap hook (stocks adapter). */
export interface EarningsGapBeat {
  kind: "earnings_gap";
  simTimeMs: number;
  gapDirection: "up" | "down";
  gapMagnitude: number; // fractional, e.g. 0.08 = 8%
  postGapRegime: "trending_up" | "trending_down" | "quiet";
}

/** Trigger the news-event hook (forex adapter). */
export interface NewsEventBeat {
  kind: "news_event";
  simTimeMs: number;
  spreadBlowoutPips: number; // max spread during blowout (e.g. 14)
  blowoutDecayTicks: number; // how many ticks for spread to return to normal
  initialSpikePips: number;  // magnitude of the initial price spike
  whipsawPips: number;       // magnitude of the counter-move
  trendDriftPips: number;    // total drift after whipsaw normalises
}

export type ScenarioBeat =
  | PriceOverrideBeat
  | RegimeOverrideBeat
  | SpreadOverrideBeat
  | DepegTriggerBeat
  | EarningsGapBeat
  | NewsEventBeat;

/** An ordered collection of beats for one scenario. */
export type ScenarioScript = ScenarioBeat[];

// ---------------------------------------------------------------------------
// MarketConfig
// ---------------------------------------------------------------------------

/** Adapter-agnostic configuration passed to IMarketFeed.init(). */
export interface MarketConfig {
  /** PRNG handle from engine/prng.ts. Adapter must use this exclusively. */
  prng: Prng;
  /** Starting price for the generator. */
  startPrice: number;
  /** Sim milliseconds per tick (mirrors clock's msPerTick). */
  msPerTick: number;
  /** Fictional instrument descriptor. */
  instrument: InstrumentInfo;
  /** Optional scenario beat schedule. */
  script?: ScenarioScript;
  /**
   * Optional compressed sim-day length in ms (stocks adapter only).
   * Session-phase boundaries scale proportionally; default is the 24h sim
   * day. Lets multi-session scenarios (SCN-005) fit a playable tick budget.
   */
  simDayMs?: number;
}

// ---------------------------------------------------------------------------
// IMarketFeed interface
// ---------------------------------------------------------------------------

/**
 * Core data layer contract — SIM_ENGINE_SPEC §2.1.
 *
 * All three synthetic adapters (crypto, stocks, forex) implement this.
 * The tick pipeline calls nextTick() once per logical tick in the clock loop.
 */
export interface IMarketFeed {
  /**
   * Initialise with seed and market-specific config.
   * Must be called exactly once before nextTick().
   */
  init(config: MarketConfig): void;

  /**
   * Advance one tick; return the OHLCV tick data.
   *
   * The returned object matches TickEvent (minus `type`, which the pipeline
   * adds when appending to the EventLog).
   */
  nextTick(): TickEvent;

  /**
   * Seek to a specific tick index by replaying from tick 0.
   * Used by the golden-replay harness (spec §5, DT-001).
   *
   * Implementation note: reinitialise the PRNG to the original seed and
   * advance nextTick() `tickIndex` times, discarding output. The PRNG state
   * at tick N is therefore identical whether we ran forward or seeked.
   */
  seekTo(tickIndex: number): void;

  /** Current session state (open/closed, halt reason). */
  sessionState(): SessionState;
}

// ---------------------------------------------------------------------------
// LiveDataAdapter stub (spec §2.1)
// ---------------------------------------------------------------------------

/**
 * Stubbed — not implemented in v1.
 * Requires RISK_REGISTER §23 license review before any real or historical
 * data is connected.
 */
export class LiveDataAdapter implements IMarketFeed {
  init(_config: MarketConfig): void {
    throw new Error(
      "LiveDataAdapter: not available until license review gate cleared (RISK_REGISTER §23)"
    );
  }
  nextTick(): TickEvent {
    throw new Error(
      "LiveDataAdapter: not available until license review gate cleared (RISK_REGISTER §23)"
    );
  }
  seekTo(_tickIndex: number): void {
    // no-op per spec
  }
  sessionState(): SessionState {
    return { isOpen: false, sessionName: "unavailable", haltReason: "license gate" };
  }
}
