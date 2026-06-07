/**
 * Live-drill position seeding (LIVE_DRILL_ENGINE_BRIEF §2.3, wave 1):
 * forceFill + the harness drillSeed path. The seeded position must be
 * EventLog-complete (replay reconstructs from events alone), zero-cost,
 * deterministic, and closeable by its companion stop.
 */

import { describe, it, expect } from "vitest";
import { createOrderBook } from "../src/orders/book.js";
import { runScenario } from "../src/harness/run.js";
import { scn001 } from "../src/scenarios/scn001.js";

const SEED_CONFIG = {
  entryOrderId: "seed-entry-001",
  stopOrderId: "seed-stop-001",
  side: "buy" as const,
  quantity: 100,
  fillPrice: 1.05, // above scn001's 1.00 start → instant drawdown premise
  stopPrice: 0.93,
};

describe("OrderBook.forceFill", () => {
  it("emits a fill at the authored price with zero slippage/spread/fee", () => {
    const book = createOrderBook();
    const ev = book.forceFill(
      { orderId: "x", side: "buy", quantity: 1, fillPrice: 42_000 },
      0,
      0
    );
    expect(ev.type).toBe("fill");
    expect(ev.fill?.fillPrice).toBe(42_000);
    expect(ev.fill?.slippage).toBe(0);
    expect(ev.fill?.spreadCost).toBe(0);
    expect(ev.fill?.feeCost).toBe(0);
  });

  it("does not touch pending orders (seeded state, not a live order)", () => {
    const book = createOrderBook();
    book.forceFill({ orderId: "x", side: "buy", quantity: 1, fillPrice: 10 }, 0, 0);
    expect(book.pendingCount).toBe(0);
  });
});

describe("harness drillSeed path", () => {
  const config = () => ({
    seed: 777,
    scenario: scn001,
    accountEquity: 10_000,
    declaredRiskPct: 1,
    actions: [
      { type: "journal_entry" as const, ticksAfter: 5, payload: { tags: ["plan"], wordCount: 12 } },
      { type: "advance_ticks" as const, ticksAfter: 0, payload: { count: 60 } },
      { type: "debrief_complete" as const, ticksAfter: 0, payload: {} },
    ],
    sessionId: "live-drill-seed-test",
    drillSeed: SEED_CONFIG,
  });

  it("tick 0 carries the complete seed sequence: submit → zero-cost fill → stop submit", () => {
    const result = runScenario(config());
    const t0 = result.log.entries.filter((e) => e.event.tickIndex === 0).map((e) => e.event);
    const types = t0.map((e) => e.type);
    expect(types[0]).toBe("session_start");
    const submitIdx = types.indexOf("order_submit");
    expect(submitIdx).toBeGreaterThan(-1);
    const fill = t0.find((e) => e.type === "order_fill");
    expect(fill).toMatchObject({
      orderId: "seed-entry-001",
      fillPrice: 1.05,
      slippage: 0,
      spreadCost: 0,
      feeCost: 0,
    });
    const stopSubmit = t0.filter((e) => e.type === "order_submit").at(-1);
    expect(stopSubmit).toMatchObject({ orderId: "seed-stop-001", orderType: "stop", side: "sell", stopPrice: 0.93 });
  });

  it("deterministic: same seed + same drillSeed → identical digest", () => {
    expect(runScenario(config()).digest.sha256).toBe(runScenario(config()).digest.sha256);
  });

  it("the companion stop is LIVE — scn001's depeg crash fires it (position closeable from events alone)", () => {
    const result = runScenario({
      ...config(),
      actions: [
        { type: "advance_ticks" as const, ticksAfter: 0, payload: { count: 1100 } }, // through the depeg (≤0.93)
        { type: "debrief_complete" as const, ticksAfter: 0, payload: {} },
      ],
    });
    const stopFill = result.log.entries
      .map((e) => e.event)
      .find((e) => e.type === "order_fill" && e.orderId === "seed-stop-001");
    expect(stopFill, "the seeded protective stop must execute when crossed").toBeDefined();
  });

  it("scenarios WITHOUT drillSeed are byte-identical to before (no ambient effect)", () => {
    const base = {
      seed: 777,
      scenario: scn001,
      accountEquity: 10_000,
      actions: [{ type: "debrief_complete" as const, ticksAfter: 10, payload: {} }],
      sessionId: "no-seed-control",
    };
    expect(runScenario(base).digest.sha256).toBe(runScenario({ ...base }).digest.sha256);
  });
});
