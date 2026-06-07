/**
 * Regime-switching GBM generator core — SIM_ENGINE_SPEC §2.2–2.4.
 *
 * Shared price-generation logic used by all three adapters.  Each adapter
 * constructs a GeneratorState and calls stepGbm() once per tick.
 *
 * GBM formula (§2.2):
 *   price(t) = price(t-1) * exp(mu(regime) * dt + sigma(regime) * sqrt(dt) * Z)
 *   where Z ~ N(0,1) drawn from the engine PRNG.
 *   dt = 1 (one tick; scale annualised params externally if needed).
 *
 * Regime transitions:
 *   Each tick: P(transition) = TUNABLE regimeTransitionProb.
 *   New regime sampled from cumulative weight table [TREND_UP, TREND_DOWN, QUIET].
 *
 * NO Math.random() — all randomness through Prng handle.
 * NO Date.now() — no wall-clock dependency.
 */

import type { Prng } from "../engine/prng.js";

// ---------------------------------------------------------------------------
// Regime definitions
// ---------------------------------------------------------------------------

export type Regime = "quiet" | "trending_up" | "trending_down";

/** Per-regime drift and volatility parameters (spec §2.2, TUNABLE). */
export interface RegimeParams {
  /** Expected drift per tick (annualised ~36% at 0.0002). */
  mu: number;
  /** Volatility per tick (σ). */
  sigma: number;
}

/**
 * Full parameter set for one adapter variant.
 * Adapters pass a populated GbmParams to createGenerator().
 */
export interface GbmParams {
  /** Parameters indexed by regime. */
  regimes: Record<Regime, RegimeParams>;
  /**
   * Probability of a regime transition on each tick.
   * TUNABLE: 0.001 → average regime length ~1000 ticks (~17 min at 1 tick/s).
   */
  regimeTransitionProb: number;
  /**
   * Weights for selecting the next regime after a transition.
   * Must sum to 1.0 (enforced at runtime in debug mode).
   * Order: [trending_up, trending_down, quiet] — TUNABLE: [0.35, 0.35, 0.30].
   */
  regimeWeights: [number, number, number];
  /** Spread model base value (price units). */
  baseSpread: number;
  /** Spread amplification coefficient for price movement (crypto/stocks). */
  spreadK: number;
}

// ---------------------------------------------------------------------------
// Generator state (mutable, opaque to adapters)
// ---------------------------------------------------------------------------

export interface GeneratorState {
  /** Current mid price. */
  price: number;
  /** Active regime. */
  regime: Regime;
  /**
   * Sigma multiplier — applied on top of regime sigma.
   * Used for post-depeg elevated volatility (crypto) and post-earnings
   * elevated volatility (stocks). Decays toward 1.0 over sigmaDecayTicks.
   */
  sigmaMultiplier: number;
  /** Ticks remaining before sigmaMultiplier fully decays to 1.0. */
  sigmaDecayTicks: number;
  /** Total ticks advanced since init. */
  tickIndex: number;
  /** Params snapshot for seekTo replay. */
  params: GbmParams;
  /** Starting price for seekTo replay. */
  startPrice: number;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Allocate a GeneratorState.  Adapters call this in their init().
 *
 * @param startPrice  - Opening price.
 * @param params      - GBM + spread parameters (adapter-specific).
 * @param initialRegime - Starting regime (default quiet).
 */
export function createGeneratorState(
  startPrice: number,
  params: GbmParams,
  initialRegime: Regime = "quiet"
): GeneratorState {
  return {
    price: startPrice,
    regime: initialRegime,
    sigmaMultiplier: 1.0,
    sigmaDecayTicks: 0,
    tickIndex: 0,
    params,
    startPrice,
  };
}

// ---------------------------------------------------------------------------
// Core step function
// ---------------------------------------------------------------------------

/**
 * Advance the generator by one tick.
 *
 * Always draws EXACTLY two PRNG values:
 *   1. nextFloat() — for regime-transition decision
 *   2. nextGaussian() — for the GBM Z sample (itself consumes 2 PRNG draws
 *      internally per prng.ts Box-Muller implementation)
 *
 * Total PRNG draw budget per tick: 1 float + 1 gaussian (= 3 raw draws).
 * This is unconditional — beats do not change draw count (beats override
 * output AFTER the draw, not before).
 *
 * Returns the new price after the GBM step (pre-beat-override).
 * The caller (adapter) applies beat overrides on top.
 */
export function stepGbm(state: GeneratorState, prng: Prng): number {
  // --- 1. Regime transition draw (always consumed regardless of beat) ---
  const transitionRoll = prng.nextFloat();
  if (transitionRoll < state.params.regimeTransitionProb) {
    state.regime = sampleRegime(prng.nextFloat(), state.params.regimeWeights);
  } else {
    // Consume a second float to keep draw count constant.
    // This ensures PRNG state at tick N is deterministic whether or not a
    // transition occurred — required for beat-invariant replay.
    prng.nextFloat();
  }

  // --- 2. Decay sigma multiplier ---
  if (state.sigmaDecayTicks > 0) {
    state.sigmaDecayTicks--;
    // Linear decay toward 1.0.
    if (state.sigmaDecayTicks === 0) {
      state.sigmaMultiplier = 1.0;
    }
  }

  // --- 3. GBM price step ---
  const rp = state.params.regimes[state.regime];
  const effectiveSigma = rp.sigma * state.sigmaMultiplier;
  const z = prng.nextGaussian(); // 2 raw draws (Box-Muller)
  const logReturn = rp.mu + effectiveSigma * z;
  state.price = state.price * Math.exp(logReturn);

  // Guard against non-positive price (degenerate GBM edge case).
  if (state.price <= 0) {
    state.price = state.startPrice * 0.001;
  }

  state.tickIndex++;
  return state.price;
}

/**
 * Compute the bid-ask spread for this tick.
 *
 * Spread model (§2.2):
 *   spread(t) = baseSpread * (1 + k * |delta_price|)
 * where delta_price is the absolute return on this tick (|new - old| / old).
 *
 * For adapters that use the forex pip-spread model instead, they call
 * this only as a fallback and apply their own session-spread model on top.
 */
export function computeSpread(
  state: GeneratorState,
  prevPrice: number
): number {
  const absDelta = Math.abs(state.price - prevPrice) / prevPrice;
  return state.params.baseSpread * (1 + state.params.spreadK * absDelta);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Set an elevated sigma multiplier on the generator (post-depeg / post-earnings).
 * The multiplier decays linearly to 1.0 over `decayTicks`.
 *
 * Called by adapters in response to DepegTriggerBeat / EarningsGapBeat.
 */
export function setElevatedSigma(
  state: GeneratorState,
  multiplier: number,
  decayTicks: number
): void {
  state.sigmaMultiplier = multiplier;
  state.sigmaDecayTicks = decayTicks;
}

/**
 * Force the generator to a regime (used by RegimeOverrideBeat application).
 * Does not perturb PRNG state.
 */
export function forceRegime(state: GeneratorState, regime: Regime): void {
  state.regime = regime;
}

/**
 * Force the generator's current price (used by PriceOverrideBeat application).
 * Does not perturb PRNG state.
 */
export function forcePrice(state: GeneratorState, price: number): void {
  state.price = price;
}

// ---------------------------------------------------------------------------
// PRNG-regime sampler
// ---------------------------------------------------------------------------

/**
 * Sample a regime from the weight table using a uniform [0,1) value.
 *
 * Weights: [trending_up, trending_down, quiet].
 * Caller provides the uniform sample so the draw is accounted for in the
 * caller's fixed-draw-per-tick budget.
 */
function sampleRegime(
  u: number,
  weights: [number, number, number]
): Regime {
  const [wUp, wDown, _wQuiet] = weights;
  if (u < wUp) return "trending_up";
  if (u < wUp + wDown) return "trending_down";
  return "quiet";
}

// ---------------------------------------------------------------------------
// Default parameter sets (TUNABLE per spec)
// ---------------------------------------------------------------------------

/**
 * Crypto adapter GBM parameters — SIM_ENGINE_SPEC §2.2.
 * Higher sigma than stocks/forex, 24/7 operation.
 */
export const CRYPTO_GBM_PARAMS: GbmParams = {
  regimes: {
    trending_up:   { mu:  0.0002,  sigma: 0.008 },
    trending_down: { mu: -0.0002,  sigma: 0.008 },
    quiet:         { mu:  0.00001, sigma: 0.004 },
  },
  regimeTransitionProb: 0.001,
  regimeWeights: [0.35, 0.35, 0.30],
  baseSpread: 0.001,   // 0.1% of price
  spreadK: 10.0,
};

/**
 * Stocks adapter GBM parameters — SIM_ENGINE_SPEC §2.3.
 * Lower sigma than crypto; session-open spike applied by the adapter.
 */
export const STOCKS_GBM_PARAMS: GbmParams = {
  regimes: {
    trending_up:   { mu:  0.0002,  sigma: 0.004 },
    trending_down: { mu: -0.0002,  sigma: 0.004 },
    quiet:         { mu:  0.00001, sigma: 0.002 },
  },
  regimeTransitionProb: 0.001,
  regimeWeights: [0.35, 0.35, 0.30],
  baseSpread: 0.001,
  spreadK: 5.0,
};

/**
 * Forex adapter GBM parameters — SIM_ENGINE_SPEC §2.4.
 * Much lower sigma than crypto; pip-spread model applied by the adapter.
 */
export const FOREX_GBM_PARAMS: GbmParams = {
  regimes: {
    trending_up:   { mu:  0.0002,  sigma: 0.0015 },
    trending_down: { mu: -0.0002,  sigma: 0.0015 },
    quiet:         { mu:  0.00001, sigma: 0.0006 },
  },
  regimeTransitionProb: 0.001,
  regimeWeights: [0.35, 0.35, 0.30],
  baseSpread: 0.00012, // 1.2 pips on a 4-decimal pair (0.0001 pip size)
  spreadK: 0.0,        // pip-spread model overrides this; kept for type compat
};
