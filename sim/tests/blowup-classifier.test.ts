/**
 * Blowup classifier — owner-conditioned (display-domain, enum-only,
 * import-banned, red-team-gated). Tests verify the enum classification
 * shapes AND the containment conditions themselves.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { classifyBlowupMechanism } from "../src/drills/blowupClassifier.js";
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

describe("classification shapes", () => {
  it("oversize dominant: repeated huge unprotected-but-stopped orders... sized way past 15%", () => {
    const log = [
      tick(1, 100),
      submit("o1", "buy", 50, 2), fill("o1", 100, 3), submit("s1", "sell", 50, 3, "stop"),
      tick(4, 100),
      submit("o2", "buy", 40, 5), fill("o2", 100, 6), submit("s2", "sell", 40, 6, "stop"),
    ];
    expect(classifyBlowupMechanism(log, 10_000)).toBe("oversize");
  });

  it("no_stop dominant: small naked round-trips (no aging adds to muddy it)", () => {
    // Buy naked, close, buy naked, close — pure protection failures with
    // no same-side aging lot (an earlier version of this test accidentally
    // ALSO added to losers; the classifier correctly called it combined).
    const log = [
      tick(1, 100),
      submit("o1", "buy", 1, 2), fill("o1", 100, 3),
      tick(6, 100),
      submit("c1", "sell", 1, 7), fill("c1", 100, 8),
      tick(12, 100),
      submit("o2", "buy", 1, 13), fill("o2", 100, 14),
      tick(18, 100),
      submit("c2", "sell", 1, 19), fill("c2", 100, 20),
    ];
    expect(classifyBlowupMechanism(log, 10_000)).toBe("no_stop");
  });

  it("add_to_losers dominant: protected small adds to an aging position", () => {
    const log = [
      tick(1, 100),
      submit("o1", "buy", 1, 2), fill("o1", 100, 3), submit("s1", "sell", 1, 3, "stop"),
      tick(20, 90),
      submit("a1", "buy", 1, 21), fill("a1", 90, 22), submit("s2", "sell", 1, 22, "stop"),
      tick(40, 80),
      submit("a2", "buy", 1, 41), fill("a2", 80, 42), submit("s3", "sell", 1, 42, "stop"),
      tick(60, 70),
      submit("a3", "buy", 1, 61), fill("a3", 70, 62), submit("s4", "sell", 1, 62, "stop"),
    ];
    expect(classifyBlowupMechanism(log, 10_000)).toBe("add_to_losers");
  });

  it("mixed behavior within the dominance ratio → combined; empty session → combined", () => {
    expect(classifyBlowupMechanism([], 10_000)).toBe("combined");
  });
});

describe("OWNER CONDITIONS — containment verified in CI", () => {
  it("condition 2: the public surface exports the classifier + enum type only (no numeric exports)", async () => {
    const mod = await import("../src/drills/blowupClassifier.js");
    expect(Object.keys(mod).sort()).toEqual(["classifyBlowupMechanism"]);
  });

  it("condition 2b: every possible return is an enum member", () => {
    const allowed = new Set(["oversize", "no_stop", "add_to_losers", "combined"]);
    expect(allowed.has(classifyBlowupMechanism([], 1))).toBe(true);
  });

  it("condition 3: no scoring-adjacent module imports the classifier (mirrors the lint ban)", () => {
    for (const f of [
      "src/engine/scoring.ts",
      "src/engine/rank.ts",
      "src/engine/progress.ts",
      "src/drills/catalog.ts",
      "src/drills/livePredicates.ts",
      "src/drills/liveCatalog.ts",
      "src/ui/engine/gating.ts",
    ]) {
      const text = readFileSync(f, "utf8");
      expect(text.includes("blowupClassifier"), `${f} must never import the classifier`).toBe(false);
    }
  });
});
