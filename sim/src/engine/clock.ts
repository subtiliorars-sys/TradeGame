/**
 * Tick pipeline and time-compression controls — SIM_ENGINE_SPEC §1.2–1.3.
 *
 * Determinism constraints (§1.1):
 *   - NO Date.now() in this file. Wall-clock is the UI boundary's problem.
 *   - Sim time is derived exclusively from tickIndex × msPerTick.
 *   - All tick delivery is driven by sim-time counters, not real elapsed time.
 *
 * The clock does not render anything. The UI layer subscribes to TickEvent
 * emissions via the EventLog; the engine does not wait for render.
 */

import type { EventLog, SimEvent } from "./events.js";

// ---------------------------------------------------------------------------
// Compression modes (spec §1.3, Table)
// ---------------------------------------------------------------------------

export type CompressionMode = "paused" | "1x" | "4x" | "16x";

/** Multiplier table.  TUNABLE per spec §1.3. */
const MULTIPLIER: Record<CompressionMode, number> = {
  paused: 0,
  "1x": 1,
  "4x": 4,
  "16x": 16,
};

// ---------------------------------------------------------------------------
// Tick callback / pipeline step
// ---------------------------------------------------------------------------

/**
 * A TickHandler is the engine's per-tick callback.  The clock calls it once
 * per logical tick, passing the current tick index and sim-time (ms from
 * session start).  The handler is responsible for:
 *   1. Advancing PRNG state
 *   2. Generating price/volume via IMarketFeed
 *   3. Running EventInjector
 *   4. Updating OrderBook / PositionLedger
 *   5. Running ScoreTracker
 *   6. Appending the TickEvent to the EventLog
 * (all future engine components — this is the foundation wiring point)
 */
export type TickHandler = (tickIndex: number, simTimeMs: number) => void;

// ---------------------------------------------------------------------------
// ClockState
// ---------------------------------------------------------------------------

export interface ClockState {
  readonly tickIndex: number;
  readonly simTimeMs: number; // ms of sim time elapsed since session start
  readonly compression: CompressionMode;
  readonly msPerTick: number;
  /** True while an order-confirmation is in flight (blocks compression change). */
  readonly orderConfirmPending: boolean;
}

// ---------------------------------------------------------------------------
// SimClock interface
// ---------------------------------------------------------------------------

export interface SimClock {
  readonly state: ClockState;

  /**
   * Advance the sim by exactly `count` ticks.
   * Calls onTick(tickIndex, simTimeMs) for each tick.
   * Used by: determinism tests, golden-replay harness, UI fast-forward.
   *
   * This is the only legal way to advance sim time — wall-clock driven
   * scheduling belongs to the UI layer.
   */
  advance(count: number): void;

  /**
   * Attempt to change compression mode.
   * Rejected (returns false) if `orderConfirmPending` is true — spec §1.3:
   * "Time compression cannot be changed while an order is being confirmed."
   */
  setCompression(mode: CompressionMode): boolean;

  /** Mark an order confirmation in flight (blocks compression change). */
  beginOrderConfirm(): void;

  /** Release the order-confirm lock (call after fill or cancel). */
  endOrderConfirm(): void;

  /**
   * Emit a sim event into the attached EventLog at the current sim-time.
   * Convenience so pipeline steps don't need to track simTime independently.
   */
  emit(event: SimEvent): number;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a SimClock for a session.
 *
 * @param log       - The session EventLog (receives all emitted events).
 * @param onTick    - Called once per logical tick (the pipeline entry point).
 * @param msPerTick - Sim milliseconds per tick. Default 1000 (1 tick = 1 s).
 */
export function createClock(
  log: EventLog,
  onTick: TickHandler,
  msPerTick = 1000
): SimClock {
  let tickIndex = 0;
  let simTimeMs = 0;
  let compression: CompressionMode = "1x";
  let orderConfirmPending = false;

  function advance(count: number): void {
    for (let i = 0; i < count; i++) {
      if (compression === "paused") {
        // Paused: no ticks delivered, but the loop still counts wall iterations.
        // Caller may want to advance under paused for fast-forward/replay;
        // that is a UI concern — the engine respects the mode unconditionally.
        break;
      }
      onTick(tickIndex, simTimeMs);
      tickIndex++;
      simTimeMs += msPerTick;
    }
  }

  function setCompression(mode: CompressionMode): boolean {
    if (orderConfirmPending) return false;
    compression = mode;
    return true;
  }

  function beginOrderConfirm(): void {
    orderConfirmPending = true;
  }

  function endOrderConfirm(): void {
    orderConfirmPending = false;
  }

  function emit(event: SimEvent): number {
    return log.append(simTimeMs, event);
  }

  return {
    get state(): ClockState {
      return {
        tickIndex,
        simTimeMs,
        compression,
        msPerTick,
        orderConfirmPending,
      };
    },
    advance,
    setCompression,
    beginOrderConfirm,
    endOrderConfirm,
    emit,
  };
}

// ---------------------------------------------------------------------------
// Compression helpers (used by UI layer, not by engine core)
// ---------------------------------------------------------------------------

/** How many sim-ticks per wall-second at the given mode. */
export function ticksPerWallSecond(mode: CompressionMode): number {
  return MULTIPLIER[mode];
}
