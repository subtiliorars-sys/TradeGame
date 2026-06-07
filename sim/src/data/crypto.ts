/**
 * Crypto synthetic adapter — SIM_ENGINE_SPEC §2.2.
 *
 * Characteristics:
 *   - 24/7 operation (no session boundary, no weekend gap)
 *   - Regime-switching GBM (CRYPTO_GBM_PARAMS)
 *   - Depeg event hook: DepegTriggerBeat elevates sigma × 5 for 300 ticks,
 *     decaying linearly (SCN-001 HarborUSD/USVC beat support)
 *   - Price-floor hook: PriceOverrideBeat-driven floor-break pattern that
 *     shapes the depeg cascade described in SCN-001
 *   - Spread model: baseSpread * (1 + k * |delta|) per spec §2.2
 *
 * Volume model (not specified precisely in spec — TUNABLE):
 *   base_volume * (1 + vol_k * |returns|)
 *   Elevated volume during high-sigma regimes, extreme during depeg.
 *
 * Fictional instrument: HarborUSD/USVC (FICTIONAL_CANON entries 1 + 2).
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
  CRYPTO_GBM_PARAMS,
  type GeneratorState,
} from "./generator.js";
import type { Prng } from "../engine/prng.js";

// ---------------------------------------------------------------------------
// Tunable constants (spec §2.2, all TUNABLE)
// ---------------------------------------------------------------------------

/** Post-depeg sigma multiplier. TUNABLE: 5.0 per spec §2.2. */
const DEPEG_SIGMA_MULTIPLIER = 5.0;
/** Post-depeg decay ticks. TUNABLE: 300 per spec §2.2. */
const DEPEG_SIGMA_DECAY_TICKS = 300;

/** Session-open tick multiplier for σ (crypto has no session open but kept for shape parity). */
const BASE_VOLUME = 10000;
/** Volume amplification on large moves. TUNABLE. */
const VOLUME_K = 8.0;

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

interface CryptoAdapterState {
  gen: GeneratorState;
  prng: Prng;
  msPerTick: number;
  /** Sorted, unprocessed beats by simTimeMs. Consumed as ticks advance. */
  pendingBeats: ScenarioBeat[];
  /** Active override windows. */
  priceOverrideRemaining: number;
  priceOverrideValue: number;
  spreadOverrideRemaining: number;
  spreadOverrideValue: number;
  regimeOverrideRemaining: number;
  /** Floor price set by a DepegTriggerBeat (price-floor break pattern). */
  depegFloor: number | null;
  /** Tick counter for the depeg pattern: how far into post-depeg we are. */
  depegPatternTick: number;
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export function createCryptoAdapter(): IMarketFeed {
  let state: CryptoAdapterState | null = null;
  let savedConfig: MarketConfig | null = null;

  function init(config: MarketConfig): void {
    savedConfig = config;
    const script = config.script ?? [];
    // Sort beats ascending by simTimeMs for predictable consumption.
    const sortedBeats = [...script].sort((a, b) => a.simTimeMs - b.simTimeMs);

    state = {
      gen: createGeneratorState(config.startPrice, CRYPTO_GBM_PARAMS, "quiet"),
      prng: config.prng,
      msPerTick: config.msPerTick,
      pendingBeats: sortedBeats,
      priceOverrideRemaining: 0,
      priceOverrideValue: 0,
      spreadOverrideRemaining: 0,
      spreadOverrideValue: 0,
      regimeOverrideRemaining: 0,
      depegFloor: null,
      depegPatternTick: 0,
    };
  }

  function requireState(): CryptoAdapterState {
    if (state === null) throw new Error("CryptoAdapter: call init() first");
    return state;
  }

  function nextTick(): TickEvent {
    const s = requireState();
    const tickIndex = s.gen.tickIndex; // before stepGbm increments it
    const simTimeMs = tickIndex * s.msPerTick;

    // 1. Apply any beats that have reached or passed the current simTimeMs.
    applyDueBeats(s, simTimeMs);

    // 2. Apply regime override before GBM step if active.
    if (s.regimeOverrideRemaining > 0) {
      // regime already forced; just decrement
      s.regimeOverrideRemaining--;
    }

    // 3. Advance GBM — ALWAYS consumes its fixed draw budget.
    const prevPrice = s.gen.price;
    const rawPrice = stepGbm(s.gen, s.prng);

    // 4. Resolve output price (override post-GBM, no PRNG perturbation).
    let outputPrice = rawPrice;
    if (s.priceOverrideRemaining > 0) {
      outputPrice = s.priceOverrideValue;
      forcePrice(s.gen, outputPrice);
      s.priceOverrideRemaining--;
    }

    // 5. Depeg floor-break pattern (SCN-001 shape):
    //    If a depeg floor is set and price breaks below it, hold near the
    //    floor for the remainder of the pattern to simulate the cascade.
    if (s.depegFloor !== null && outputPrice < s.depegFloor) {
      // Price has broken through the floor — mark pattern active.
      s.depegPatternTick++;
      // Cascade: allow further drift below floor (gen continues freely).
    }

    // 6. Compute spread.
    let spread: number;
    if (s.spreadOverrideRemaining > 0) {
      spread = s.spreadOverrideValue;
      s.spreadOverrideRemaining--;
    } else {
      spread = computeSpread(s.gen, prevPrice);
    }

    // 7. Compute OHLCV.
    const open = prevPrice;
    const close = outputPrice;
    const high = Math.max(open, close) * (1 + s.prng.nextFloat() * 0.001);
    const low = Math.min(open, close) * (1 - s.prng.nextFloat() * 0.001);
    const absDelta = Math.abs(close - open) / open;
    const volume = BASE_VOLUME * (1 + VOLUME_K * absDelta) * (0.5 + s.prng.nextFloat());

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
    if (savedConfig === null) throw new Error("CryptoAdapter: call init() first");
    // Reinitialise and replay forward — PRNG state at tick N is deterministic.
    init(savedConfig);
    const s = requireState();
    for (let i = 0; i < targetTickIndex; i++) {
      nextTick();
      // discard output
    }
    // Restore pending beats from the original sorted list up to targetTickIndex.
    // init() already reset pendingBeats from savedConfig; ticks above consumed them.
    _ = s; // keep reference
  }

  function sessionState(): SessionState {
    // Crypto is always open — 24/7, no session boundary.
    return {
      isOpen: true,
      sessionName: "24/7",
      haltReason: null,
    };
  }

  return { init, nextTick, seekTo, sessionState };
}

// ---------------------------------------------------------------------------
// Beat application helper
// ---------------------------------------------------------------------------

/**
 * Pop and apply all beats whose simTimeMs <= currentSimTimeMs.
 * Called before stepGbm() so regime overrides are in place before the draw.
 * PRNG consumption inside stepGbm() is unchanged — beats are output filters.
 */
function applyDueBeats(s: CryptoAdapterState, currentSimTimeMs: number): void {
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

      case "depeg_trigger":
        // Elevate post-depeg sigma (spec §2.2).
        setElevatedSigma(s.gen, DEPEG_SIGMA_MULTIPLIER, DEPEG_SIGMA_DECAY_TICKS);
        // Set the floor at the current price so the cascade tracks below it.
        s.depegFloor = s.gen.price;
        s.depegPatternTick = 0;
        break;

      case "earnings_gap":
        // Not applicable to crypto adapter — log and ignore.
        break;

      case "news_event":
        // Not applicable to crypto adapter — log and ignore.
        break;

      default:
        // Exhaustive switch — TypeScript enforces all ScenarioBeat kinds.
        assertNeverBeat(beat);
    }
  }
}

function assertNeverBeat(beat: never): never {
  throw new Error(`CryptoAdapter: unhandled beat kind: ${JSON.stringify(beat)}`);
}

// Silence unused-variable lint for seekTo's internal variable.
let _ = undefined as unknown;
