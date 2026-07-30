/**
 * Wave 2 — Seeding surface stubs (LIVE_DRILL_ENGINE_BRIEF §5, Wave 2).
 *
 * STATUS: INTEGRATED — all three Wave 2 items are wired into their target sites.
 *         This file provides the canonical types + helper functions consumed by
 *         the engine, harness, and UI layers.
 *
 * Build ordering (from the brief §5):
 *   W2-1  SeedPositionBeat   — wired: ScenarioBeat union (feed.ts), adapters, harness dispatch
 *   W2-2  OrderBook.forceFill — wired: assertSeedOrderId guard called at forceFill entry (book.ts)
 *   W2-3  applyDrillSeed()   — wired: TradingScene.create() routes both liveDrill and
 *                                DrillScenarioDef paths through applyDrillSeed()
 *   W2-4/5  golden fixtures  — in tests/ (not in this file)
 *
 * Red-team requirement (W2-2): verify slippage=0 on seed fills does not
 * create incorrect PositionLedger state; verify authored orderId is not
 * colliding with the live UUID namespace (seed- prefix enforcement).
 */

import type { DrillSeedConfig } from "../scenarios/types.js";

// ---------------------------------------------------------------------------
// W2-1: SeedPositionBeat — new beat kind for the EventInjector switch
// ---------------------------------------------------------------------------

/**
 * W2-1 — SeedPositionBeat (LIVE_DRILL_ENGINE_BRIEF §2.3 "case 'seed_position'").
 *
 * A ScenarioBeat that fires at simTimeMs=0, before any PRNG-driven tick.
 * The harness (run.ts:dispatchSeedPositionBeat) processes it by calling
 * OrderBook.forceFill() with the authored entryOrderId/fillPrice and placing
 * a companion stop order.
 *
 * Integration sites:
 *   1. feed.ts ScenarioBeat union — SeedPositionBeat is a discriminated member.
 *   2. All three adapters (crypto/stocks/forex) have `case "seed_position":` stubs
 *      (no price-feed effect — handled by harness).
 *   3. run.ts iterates scenario.script, dispatches via dispatchSeedPositionBeat().
 */
export interface SeedPositionBeat {
  kind: "seed_position";
  /** Must equal 0 — the seeded state fires before the first PRNG-driven tick. */
  simTimeMs: 0;
  positionSide: "buy" | "sell";
  quantity: number;
  /** Authored fill price — verbatim to OrderBook.forceFill; no slippage. */
  fillPrice: number;
  /** Companion stop placed at the same tick. */
  stopPrice: number;
  /**
   * Authored order IDs — must carry the "seed-" prefix so the OrderBook can
   * enforce the namespace guard (see W2-2 forceFill guard).
   * Example: "seed-entry-ddc", "seed-stop-ddc".
   */
  entryOrderId: string;
  stopOrderId: string;
}

// ---------------------------------------------------------------------------
// W2-2: forceFill seed-prefix guard
// ---------------------------------------------------------------------------

/**
 * W2-2 — seed-prefix validation helper for OrderBook.forceFill.
 *
 * The seeding mechanism relies on authored order IDs (e.g. "seed-entry-001")
 * to guarantee byte-stable golden fixtures. These must never collide with the
 * live UUID namespace. OrderBook.forceFill calls assertSeedOrderId() at entry;
 * dispatchSeedPositionBeat in run.ts and applyDrillSeed in this file also call
 * it so authoring errors surface early.
 *
 * OPEN-LDED-4: hard validation (throws) — chosen for fail-fast safety.
 *
 * Integration sites:
 *   1. OrderBook.forceFill (book.ts:362) — calls assertSeedOrderId(seed.orderId).
 *   2. Harness dispatchSeedPositionBeat (run.ts:716-718) — calls on both IDs.
 *   3. applyDrillSeed (this file:158-159) — calls on both IDs.
 *   4. Golden-fixture tests (W2-4 / W2-5 in wave2-seed.test.ts) — assert the
 *      guard throws on UUID-like orderId.
 */
export function isSeedOrderId(orderId: string): boolean {
  return orderId.startsWith("seed-");
}

/**
 * Assert that `orderId` carries the "seed-" prefix.
 * Throws a descriptive error on violation so authoring errors surface early
 * (OPEN-LDED-4 hard-enforcement option — chosen for fail-fast safety).
 *
 * Called by OrderBook.forceFill and dispatchSeedPositionBeat in run.ts to
 * prevent authored seed IDs from colliding with the live UUID namespace.
 */
export function assertSeedOrderId(orderId: string): void {
  if (!isSeedOrderId(orderId)) {
    throw new Error(
      `assertSeedOrderId: orderId "${orderId}" does not carry the required "seed-" prefix. ` +
      `Seed order IDs must start with "seed-" to avoid collision with the live UUID namespace ` +
      `(LIVE_DRILL_ENGINE_BRIEF OPEN-LDED-4 / W2-2).`
    );
  }
}

// ---------------------------------------------------------------------------
// W2-3: applyDrillSeed — TradingScene init helper
// ---------------------------------------------------------------------------

/**
 * Params passed from TradingScene to applyDrillSeed.
 *
 * TradingScene already constructs SessionAdapter with `drillSeed` inline.
 * W2-3 extracts that logic into this function so it is reusable, testable,
 * and decoupled from Phaser.
 */
export interface ApplyDrillSeedParams {
  seedConfig: DrillSeedConfig;
}

/**
 * Return type: the SessionAdapter constructor's `drillSeed` argument shape.
 * Mirrors the anonymous type in SessionAdapter's constructor signature so we
 * can pass the result directly without duplication.
 */
export interface DrillSeedAdapterArg {
  entryOrderId: string;
  stopOrderId: string;
  side: "buy" | "sell";
  quantity: number;
  fillPrice: number;
  stopPrice: number;
}

/**
 * W2-3 — applyDrillSeed (LIVE_DRILL_ENGINE_BRIEF §1.2 / §2.3).
 *
 * Converts a `DrillSeedConfig` (from the DrillScenarioDef manifest) into the
 * `drillSeed` argument shape that SessionAdapter's constructor accepts.
 *
 * Called by TradingScene.create() for both paths:
 *   1. DrillScenarioDef manifests carrying seedConfig (primary W2-3 target).
 *   2. LiveDrillDef drawdown-survival seeds (converted to DrillSeedConfig inline
 *      in TradingScene, then passed here for guard + mapping consistency).
 *
 * The returned object is passed as the third argument to `new SessionAdapter()`.
 * W2-2 guard (assertSeedOrderId) fires on both authored IDs before the mapping.
 *
 * Integration sites:
 *   1. TradingScene.create() — routes both drill types through this function.
 *   2. wave2-seed.test.ts — unit tests for round-trip, positionSide→side mapping,
 *      and seed-prefix rejection (W2-3a through W2-3e).
 */
export function applyDrillSeed(
  params: ApplyDrillSeedParams
): DrillSeedAdapterArg {
  const { seedConfig } = params;
  // W2-2: enforce seed- prefix on both authored IDs before handing to the adapter.
  assertSeedOrderId(seedConfig.entryOrderId);
  assertSeedOrderId(seedConfig.stopOrderId);
  return {
    entryOrderId: seedConfig.entryOrderId,
    stopOrderId:  seedConfig.stopOrderId,
    side:         seedConfig.positionSide,
    quantity:     seedConfig.quantity,
    fillPrice:    seedConfig.fillPrice,
    stopPrice:    seedConfig.stopPrice,
  };
}
