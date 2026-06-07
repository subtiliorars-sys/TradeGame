/**
 * UI parity test — ui-parity.test.ts
 *
 * Asserts that fills flowing through SessionAdapter use the engine's
 * computeMarketFillCosts code path — not inline UI math.
 *
 * The parity invariant: given the same seed and the same tick stream,
 * the fill fields produced by SessionAdapter.submitOrder() must match
 * the values that computeMarketFillCosts() would produce for that tick.
 *
 * Node environment only — no Phaser, no DOM. SessionAdapter is exercised
 * headlessly by calling clock.advance() directly.
 *
 * Two secondary tests verify log structure:
 *   - order_submit event appears before order_fill in the adapter log
 *   - the same fill is present in the event log
 *
 * The digest-equivalence test uses two fresh SessionAdapter instances
 * with the same seed driven through identical action sequences and asserts
 * their fill-event slices are bit-identical — confirming determinism.
 */

import { describe, it, expect } from "vitest";
import { SessionAdapter } from "../src/ui/engine/SessionAdapter.js";
import { computeMarketFillCosts } from "../src/orders/book.js";
import type { OrderFillEvent } from "../src/engine/events.js";
import type { TickEvent } from "../src/engine/events.js";

// Number of ticks to advance before placing the test order.
const TICKS_BEFORE_ORDER = 5;
const ORDER_QTY = 100;

// ---------------------------------------------------------------------------
// Helper: run SessionAdapter headlessly, capture the fill + the raw tick
// ---------------------------------------------------------------------------

interface AdapterRunResult {
  fill: OrderFillEvent | null;
  fillTick: TickEvent | null;
  adapterLog: ReturnType<SessionAdapter["log"]["entries"]["slice"]>;
}

function runAdapterHeadless(): AdapterRunResult {
  const adapter = new SessionAdapter();
  let capturedFill: OrderFillEvent | null = null;
  let fillTick: TickEvent | null = null;

  adapter.onFill((fill) => {
    capturedFill = fill;
    // The tick at the time of fill is the adapter's latest tick.
    const lt = adapter.latestTick;
    if (lt) {
      fillTick = {
        type: "tick",
        tickIndex: lt.tickIndex,
        timestamp: lt.simTimeMs,
        open: lt.open,
        high: lt.high,
        low: lt.low,
        close: lt.close,
        volume: lt.volume,
        spread: lt.spread,
      };
    }
  });

  // Advance ticks to establish a stable price.
  adapter.clock.advance(TICKS_BEFORE_ORDER);

  // Submit a market buy; fill arrives on the next tick.
  adapter.submitOrder({
    side: "buy",
    quantity: ORDER_QTY,
    stopPrice: 0.5,
    orderType: "market",
  });

  // One more tick for the fill to process.
  adapter.clock.advance(1);

  return {
    fill: capturedFill,
    fillTick,
    adapterLog: adapter.log.entries.slice(),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UI parity: SessionAdapter fill path matches engine computeMarketFillCosts", () => {
  it("adapter produces a fill event for a market order", () => {
    const { fill } = runAdapterHeadless();
    expect(fill).not.toBeNull();
  });

  it("fillPrice matches computeMarketFillCosts for the same tick (buy: close + spread + slippage)", () => {
    const { fill, fillTick } = runAdapterHeadless();
    expect(fill).not.toBeNull();
    expect(fillTick).not.toBeNull();

    // Re-compute what the engine would produce for this tick.
    const expected = computeMarketFillCosts(
      "buy",
      ORDER_QTY,
      fillTick!,
      "crypto",
      0.008, // BASE_SIGMA from SessionAdapter
      0.008,
      10_000, // initial account equity
      "taker"
    );

    expect(fill!.fillPrice).toBeCloseTo(expected.fillPrice, 8);
  });

  it("slippage matches computeMarketFillCosts", () => {
    const { fill, fillTick } = runAdapterHeadless();
    expect(fill).not.toBeNull();
    const expected = computeMarketFillCosts(
      "buy", ORDER_QTY, fillTick!, "crypto",
      0.008, 0.008, 10_000, "taker"
    );
    expect(fill!.slippage).toBeCloseTo(expected.slippage, 8);
  });

  it("spreadCost matches computeMarketFillCosts", () => {
    const { fill, fillTick } = runAdapterHeadless();
    expect(fill).not.toBeNull();
    const expected = computeMarketFillCosts(
      "buy", ORDER_QTY, fillTick!, "crypto",
      0.008, 0.008, 10_000, "taker"
    );
    expect(fill!.spreadCost).toBeCloseTo(expected.spreadCost, 8);
  });

  it("feeCost matches computeMarketFillCosts", () => {
    const { fill, fillTick } = runAdapterHeadless();
    expect(fill).not.toBeNull();
    const expected = computeMarketFillCosts(
      "buy", ORDER_QTY, fillTick!, "crypto",
      0.008, 0.008, 10_000, "taker"
    );
    expect(fill!.feeCost).toBeCloseTo(expected.feeCost, 8);
  });

  it("order_submit appears before order_fill in the adapter event log", () => {
    const { adapterLog } = runAdapterHeadless();
    const submitIdx = adapterLog.findIndex((e) => e.event.type === "order_submit");
    const fillIdx = adapterLog.findIndex((e) => e.event.type === "order_fill");
    expect(submitIdx).toBeGreaterThanOrEqual(0);
    expect(fillIdx).toBeGreaterThan(submitIdx);
  });

  it("fill event is present in the adapter event log with matching orderId", () => {
    const { fill, adapterLog } = runAdapterHeadless();
    expect(fill).not.toBeNull();
    const fillInLog = adapterLog.find(
      (e) => e.event.type === "order_fill" &&
             (e.event as OrderFillEvent).orderId === fill!.orderId
    );
    expect(fillInLog).toBeDefined();
  });

  it("determinism: two adapter runs from same seed produce identical fill fields", () => {
    const run1 = runAdapterHeadless();
    const run2 = runAdapterHeadless();

    expect(run1.fill).not.toBeNull();
    expect(run2.fill).not.toBeNull();

    expect(run1.fill!.fillPrice).toBe(run2.fill!.fillPrice);
    expect(run1.fill!.slippage).toBe(run2.fill!.slippage);
    expect(run1.fill!.spreadCost).toBe(run2.fill!.spreadCost);
    expect(run1.fill!.feeCost).toBe(run2.fill!.feeCost);
  });
});
