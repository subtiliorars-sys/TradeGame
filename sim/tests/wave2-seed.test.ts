/**
 * W2-1 / W2-2 tests — SeedPositionBeat + assertSeedOrderId guard.
 *
 * Covers:
 *   W2-1a: SeedPositionBeat in the ScenarioBeat union compiles; adapters ignore it.
 *   W2-1b: A seed_position beat in a ScenarioScript seeds the OrderBook via
 *          the harness (order_submit + order_fill appear at tick 0, stop is live).
 *   W2-1c: Seeded state is byte-identical on consecutive replays (determinism).
 *   W2-2a: isSeedOrderId identifies the "seed-" prefix correctly.
 *   W2-2b: assertSeedOrderId throws on a non-prefixed ID (UUID-like).
 *   W2-2c: assertSeedOrderId does NOT throw on a correctly prefixed ID.
 *   W2-2d: OrderBook.forceFill enforces the guard — rejects a bare UUID.
 *   W2-2e: Red-team: forceFill called with a UUID throws (W2-2 enforcement).
 */

import { describe, it, expect } from "vitest";
import { isSeedOrderId, assertSeedOrderId } from "../src/drills/wave2Seed.js";
import { createOrderBook } from "../src/orders/book.js";
import { runScenario } from "../src/harness/run.js";
import type { ScenarioDef } from "../src/scenarios/types.js";
import type { SeedPositionBeat } from "../src/data/feed.js";

// ---------------------------------------------------------------------------
// Minimal scenario used as a fixture
// ---------------------------------------------------------------------------

const BASE_MANIFEST = {
  id: "test-seed",
  title: "Wave-2 seed test",
  market: "crypto" as const,
  instrument: { symbol: "HarborUSD/USVC", displayName: "HarborUSD" },
  durationMs: 10_000,
  msPerTick: 1_000,
  startPrice: 40_000,
  prereqs: [],
  minRank: "Observer" as const,
  difficulty: "Beginner" as const,
  decisionPoints: [],
  xpRubric: [],
  recklessWinnerCoachingText: "",
  debriefContentIds: [],
};

const SEED_BEAT: SeedPositionBeat = {
  kind: "seed_position",
  simTimeMs: 0,
  positionSide: "buy",
  quantity: 0.1,
  fillPrice: 43_200,          // authored above startPrice → inherited drawdown
  stopPrice: 38_000,          // below startPrice; stop stays live
  entryOrderId: "seed-entry-w2test",
  stopOrderId:  "seed-stop-w2test",
};

function makeScenario(includeSeedBeat: boolean): ScenarioDef {
  return {
    manifest: BASE_MANIFEST,
    script: includeSeedBeat ? [SEED_BEAT] : [],
  };
}

// ---------------------------------------------------------------------------
// W2-2: isSeedOrderId / assertSeedOrderId
// ---------------------------------------------------------------------------

describe("W2-2: isSeedOrderId", () => {
  it("returns true for 'seed-' prefix", () => {
    expect(isSeedOrderId("seed-entry-001")).toBe(true);
    expect(isSeedOrderId("seed-stop-ddc")).toBe(true);
    expect(isSeedOrderId("seed-")).toBe(true); // edge: prefix only
  });

  it("returns false for UUID-like IDs (no prefix)", () => {
    expect(isSeedOrderId("550e8400-e29b-41d4-a716-446655440000")).toBe(false);
    expect(isSeedOrderId("order-0001")).toBe(false);
    expect(isSeedOrderId("")).toBe(false);
  });
});

describe("W2-2: assertSeedOrderId", () => {
  it("does not throw for a correctly prefixed ID", () => {
    expect(() => assertSeedOrderId("seed-entry-abc")).not.toThrow();
  });

  it("throws with a descriptive message for a UUID-like ID (hard enforcement)", () => {
    const fakeUuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(() => assertSeedOrderId(fakeUuid)).toThrowError(/seed-/);
  });

  it("throws for an empty string", () => {
    expect(() => assertSeedOrderId("")).toThrowError(/seed-/);
  });

  it("throws for an order-prefixed ID (not a seed ID)", () => {
    expect(() => assertSeedOrderId("order-0001")).toThrowError(/seed-/);
  });
});

// ---------------------------------------------------------------------------
// W2-2d / W2-2e: OrderBook.forceFill guard
// ---------------------------------------------------------------------------

describe("W2-2: OrderBook.forceFill guard", () => {
  it("accepts a seed- prefixed orderId without throwing", () => {
    const book = createOrderBook();
    expect(() =>
      book.forceFill(
        { orderId: "seed-entry-001", side: "buy", quantity: 1, fillPrice: 100 },
        0,
        0
      )
    ).not.toThrow();
  });

  it("Red-team W2-2e: forceFill with a UUID throws the guard error", () => {
    const book = createOrderBook();
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(() =>
      book.forceFill(
        { orderId: uuid, side: "buy", quantity: 1, fillPrice: 100 },
        0,
        0
      )
    ).toThrowError(/seed-/);
  });

  it("forceFill returns a fill event with authored fillPrice and zero costs", () => {
    const book = createOrderBook();
    const result = book.forceFill(
      { orderId: "seed-entry-001", side: "buy", quantity: 0.1, fillPrice: 43_200 },
      0,
      0
    );
    expect(result.type).toBe("fill");
    expect(result.fill).toBeDefined();
    expect(result.fill!.fillPrice).toBe(43_200);
    expect(result.fill!.slippage).toBe(0);
    expect(result.fill!.spreadCost).toBe(0);
    expect(result.fill!.feeCost).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// W2-1b: seed_position beat in ScenarioScript seeds the OrderBook via harness
// ---------------------------------------------------------------------------

describe("W2-1: seed_position beat dispatched by harness", () => {
  it("order_submit + order_fill appear at tick 0 with authored IDs", () => {
    const scenario = makeScenario(true);
    const { log } = runScenario({
      seed: 42,
      scenario,
      accountEquity: 10_000,
      actions: [],
    });

    const events = log.entries.map((e) => e.event);

    // order_submit for the entry
    const entrySubmit = events.find(
      (e) => e.type === "order_submit" && (e as { orderId: string }).orderId === "seed-entry-w2test"
    );
    expect(entrySubmit, "entry submit at tick 0").toBeDefined();
    expect((entrySubmit as { tickIndex: number }).tickIndex).toBe(0);

    // order_fill for the entry
    const entryFill = events.find(
      (e) => e.type === "order_fill" && (e as { orderId: string }).orderId === "seed-entry-w2test"
    );
    expect(entryFill, "entry fill at tick 0").toBeDefined();
    expect((entryFill as { fillPrice: number }).fillPrice).toBe(43_200);
    expect((entryFill as { slippage: number }).slippage).toBe(0);

    // order_submit for the companion stop
    const stopSubmit = events.find(
      (e) => e.type === "order_submit" && (e as { orderId: string }).orderId === "seed-stop-w2test"
    );
    expect(stopSubmit, "stop submit at tick 0").toBeDefined();
    expect((stopSubmit as { tickIndex: number }).tickIndex).toBe(0);
    expect((stopSubmit as { orderType: string }).orderType).toBe("stop");
  });

  it("no seed events appear when no seed_position beat in script", () => {
    const scenario = makeScenario(false);
    const { log } = runScenario({
      seed: 42,
      scenario,
      accountEquity: 10_000,
      actions: [],
    });

    const events = log.entries.map((e) => e.event);
    const seedSubmit = events.find(
      (e) => e.type === "order_submit" && (e as { orderId: string }).orderId === "seed-entry-w2test"
    );
    expect(seedSubmit).toBeUndefined();
  });

  it("seed_position beat is byte-stable: three consecutive runs from the same seed produce identical digests", () => {
    const scenario = makeScenario(true);
    const cfg = { seed: 99, scenario, accountEquity: 10_000, actions: [] };
    const d1 = runScenario(cfg).digest.sha256;
    const d2 = runScenario(cfg).digest.sha256;
    const d3 = runScenario(cfg).digest.sha256;
    expect(d1).toBe(d2);
    expect(d2).toBe(d3);
  });

  it("seed_position beat and a no-seed run produce different digests", () => {
    const cfg_seed = { seed: 42, scenario: makeScenario(true),  accountEquity: 10_000, actions: [] };
    const cfg_bare = { seed: 42, scenario: makeScenario(false), accountEquity: 10_000, actions: [] };
    expect(runScenario(cfg_seed).digest.sha256).not.toBe(runScenario(cfg_bare).digest.sha256);
  });
});

// ---------------------------------------------------------------------------
// W2-1: adapters pass through seed_position beat (no type-error, no crash)
// ---------------------------------------------------------------------------

describe("W2-1: adapter ignores seed_position beat gracefully", () => {
  it("forex adapter: session with seed_position beat runs without error", () => {
    const scenario: ScenarioDef = {
      manifest: { ...BASE_MANIFEST, id: "test-seed-fx", market: "forex" },
      script: [SEED_BEAT],
    };
    // The harness processes the beat; the forex adapter should not see it
    // via applyDueBeats (simTimeMs=0 fires before the first tick call).
    // This test verifies no crash occurs end-to-end.
    expect(() =>
      runScenario({ seed: 1, scenario, accountEquity: 10_000, actions: [] })
    ).not.toThrow();
  });
});
