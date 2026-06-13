/**
 * Blowup replay rows — display-domain annotations (no dollar output).
 */

import { describe, it, expect } from "vitest";
import { buildBlowupReplayRows } from "../src/drills/blowupReplay.js";
import type { EventEnvelope } from "../src/engine/events.js";

let seq = 0;
function env(event: Record<string, unknown>): EventEnvelope {
  seq += 1;
  return { seq, simTimeMs: 0, event } as unknown as EventEnvelope;
}
const tick = (i: number, close: number) =>
  env({ type: "tick", tickIndex: i, timestamp: i * 1000, open: close, high: close, low: close, close, volume: 1, spread: 0.01 });
const submit = (id: string, side: "buy" | "sell", qty: number, t: number, type = "market") =>
  env({ type: "order_submit", orderId: id, orderType: type, side, quantity: qty, price: null, stopPrice: type === "stop" ? 1 : null, tickIndex: t, timestamp: t * 1000 });
const fill = (id: string, price: number, t: number) =>
  env({ type: "order_fill", orderId: id, fillPrice: price, slippage: 0, spreadCost: 0, feeCost: 0, tickIndex: t, timestamp: t * 1000 });

describe("buildBlowupReplayRows", () => {
  it("flags oversized naked fill; output has no numeric dollar fields", () => {
    const log = [
      tick(1, 100),
      submit("o1", "buy", 50, 2), fill("o1", 100, 3),
    ];
    const rows = buildBlowupReplayRows(log, 10_000);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.oversized).toBe(true);
    expect(rows[0]!.hadStop).toBe(false);
    expect(JSON.stringify(rows)).not.toMatch(/\$\d/);
    expect(Object.keys(rows[0]!)).not.toContain("equity");
    expect(Object.keys(rows[0]!)).not.toContain("notional");
  });

  it("marks protected fill when stop submitted within window", () => {
    const log = [
      tick(1, 100),
      submit("o1", "buy", 1, 2), fill("o1", 100, 3), submit("s1", "sell", 1, 3, "stop"),
    ];
    const rows = buildBlowupReplayRows(log, 10_000);
    expect(rows[0]!.hadStop).toBe(true);
    expect(rows[0]!.oversized).toBe(false);
  });
});
