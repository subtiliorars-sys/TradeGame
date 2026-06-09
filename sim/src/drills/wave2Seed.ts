/**
 * Wave 2 — Seeding surface stubs (LIVE_DRILL_ENGINE_BRIEF §5, Wave 2).
 *
 * This file contains typed stubs for the three Wave 2 items that are
 * independent of each other and can be built in parallel.
 *
 * STATUS: typed stubs — interfaces and empty implementations with TODOs.
 *         No logic is implemented here. Types compile; impl is deferred.
 *
 * Build ordering (from the brief §5):
 *   W2-1  SeedPositionBeat  — new beat kind in the ScenarioBeat union (feed.ts)
 *   W2-2  OrderBook.forceFill  — already implemented; guard stub lives here
 *   W2-3  applyDrillSeed()  — TradingScene init helper
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
 * When the EventInjector processes this beat it calls OrderBook.forceFill()
 * with the authored entryOrderId/fillPrice and places a companion stop order.
 *
 * TODO (W2-1):
 *   1. Add SeedPositionBeat to the ScenarioBeat discriminated union in feed.ts.
 *   2. Add `case 'seed_position':` to the EventInjector's beat-dispatch switch.
 *      The case calls orderBook.forceFill(...) + orderBook.submitOrder(stop)
 *      using the authored IDs — byte-stable (no PRNG, no UUID generation).
 *   3. Add the new beat kind to the ScenarioScript type doc comment.
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
 * live UUID namespace. The OrderBook.forceFill implementation should call this
 * guard at entry; here it is defined as a pure exported function so callers
 * outside the OrderBook (e.g. tests, the EventInjector) can call it too.
 *
 * OPEN-LDED-4: should this be a hard validation (throws) or a documentation-
 * only convention? Stub throws for safety; tune after red-team.
 *
 * TODO (W2-2):
 *   1. Import and call isSeedOrderId() inside OrderBook.forceFill.
 *   2. Wire the same check into the golden-fixture tests (W2-4 / W2-5).
 *   3. Red-team: submit a forceFill with a UUID to confirm the guard fires.
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
 * Called by TradingScene.init() when `manifest.seedConfig !== null`.
 * The returned object is passed as the third argument to `new SessionAdapter()`.
 *
 * Design note: TradingScene currently inlines this conversion when constructing
 * SessionAdapter for LiveDrillDef sessions (create(), the `this.liveDrill !== null`
 * branch). W2-3 generalises that path to accept any DrillSeedConfig from a
 * DrillScenarioDef manifest — not just the LiveDrillDef.seed shape.
 *
 * TODO (W2-3):
 *   1. Implement the mapping below (trivial: field names are 1:1 after W1-4).
 *   2. Update TradingScene.create() to call applyDrillSeed(manifest.seedConfig)
 *      when isDrillMode && manifest.seedConfig !== null, replacing the inline
 *      SessionAdapter construction in the liveDrill branch.
 *   3. Add a unit test: applyDrillSeed round-trips all fields unchanged.
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
