/**
 * UI scenario-selection tests — slice 3 (SCN-002 / SCN-003 playable).
 *
 * Verifies the scenario registry and the scenario-aware SessionAdapter:
 *   - registry exposes exactly the authored scenario set with canonical seeds
 *   - the adapter wires the manifest's market/msPerTick/startPrice through to
 *     the feed and clock (engine-truth, mirroring harness/run.ts)
 *   - forex orders are gated on leverage_risk_acknowledged (spec §3.4 /
 *     TEST_PLAN FX-001) and rejects are logged as order_cancel events with
 *     the reject reason — identical event-log shape to the harness runner
 *   - DebriefData carries the right scenarioId + canonical seed for replay
 *   - same scenario ⇒ identical deterministic tick stream (two adapters)
 *
 * Node environment only — no Phaser, no DOM (same pattern as ui-parity).
 * No PnL anywhere: assertions are about process gates and determinism.
 */

import { describe, it, expect } from "vitest";
import { SessionAdapter } from "../src/ui/engine/SessionAdapter.js";
import {
  getScenario,
  allScenarioIds,
  allScenarios,
  scenarioSeed,
} from "../src/scenarios/registry.js";
import { scn002 } from "../src/scenarios/scn002.js";
import { scn003 } from "../src/scenarios/scn003.js";
import type { OrderCancelEvent, OrderFillEvent } from "../src/engine/events.js";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

describe("scenario registry", () => {
  it("exposes exactly SCN-001..003 in insertion order", () => {
    expect(allScenarioIds()).toEqual(["SCN-001", "SCN-002", "SCN-003"]);
  });

  it("getScenario returns the def whose manifest matches the requested id", () => {
    for (const id of allScenarioIds()) {
      expect(getScenario(id)?.manifest.id).toBe(id);
    }
  });

  it("returns undefined for unregistered ids", () => {
    expect(getScenario("SCN-999")).toBeUndefined();
  });

  it("allScenarios returns defs aligned with allScenarioIds", () => {
    expect(allScenarios().map((d) => d.manifest.id)).toEqual(allScenarioIds());
  });

  it("canonical UI play seeds are stable per scenario", () => {
    expect(scenarioSeed("SCN-001")).toBe(42_001);
    expect(scenarioSeed("SCN-002")).toBe(42_002);
    expect(scenarioSeed("SCN-003")).toBe(42_003);
  });
});

// ---------------------------------------------------------------------------
// Scenario-aware SessionAdapter — SCN-002 (stocks)
// ---------------------------------------------------------------------------

describe("SessionAdapter with SCN-002 (stocks)", () => {
  it("honors the manifest msPerTick (30 s ticks)", () => {
    const adapter = new SessionAdapter(scn002);
    adapter.clock.advance(1);
    expect(adapter.clock.state.simTimeMs).toBe(30_000);
  });

  it("first tick prices originate from the manifest startPrice", () => {
    const adapter = new SessionAdapter(scn002);
    adapter.clock.advance(1);
    const t = adapter.latestTick;
    expect(t).toBeDefined();
    // The authored earnings_gap beat fires at sim-time 0 (~+14% gap up from
    // 42.10), so tick 0 lands in the post-gap neighborhood — proving both the
    // startPrice AND the scenario script were wired through to the feed.
    expect(t!.close).toBeGreaterThan(42.1 * 0.95);
    expect(t!.close).toBeLessThan(42.1 * 1.3);
  });

  it("starts with the standard 10,000 account balance", () => {
    const adapter = new SessionAdapter(scn002);
    expect(adapter.accountBalance).toBe(10_000);
  });

  it("market order fills through the engine OrderBook", () => {
    const adapter = new SessionAdapter(scn002);
    let fill: OrderFillEvent | null = null;
    adapter.onFill((f) => {
      fill = f;
    });
    adapter.clock.advance(10);
    const outcome = adapter.submitOrder({
      side: "buy",
      quantity: 10,
      stopPrice: 38.0,
      orderType: "market",
    });
    expect(outcome.rejectReason).toBeNull();
    adapter.clock.advance(1);
    expect(fill).not.toBeNull();
    expect(fill!.orderId).toBe(outcome.orderId);
    expect(fill!.fillPrice).toBeGreaterThan(0);
  });

  it("endSession DebriefData carries SCN-002 id + canonical seed", () => {
    const adapter = new SessionAdapter(scn002);
    adapter.clock.advance(3);
    const debrief = adapter.endSession();
    expect(debrief).not.toBeNull();
    expect(debrief!.scenarioId).toBe("SCN-002");
    expect(debrief!.scenarioTitle).toBe(scn002.manifest.title);
    expect(debrief!.seed).toBe(42_002);
  });
});

// ---------------------------------------------------------------------------
// Scenario-aware SessionAdapter — SCN-003 (forex, leverage ack gate)
// ---------------------------------------------------------------------------

describe("SessionAdapter with SCN-003 (forex)", () => {
  it("rejects orders submitted without leverage ack (FX-001)", () => {
    const adapter = new SessionAdapter(scn003);
    let fill: OrderFillEvent | null = null;
    adapter.onFill((f) => {
      fill = f;
    });
    adapter.clock.advance(5);
    const outcome = adapter.submitOrder({
      side: "buy",
      quantity: 5_000, // book v1 balance guard is unleveraged: qty*stop <= equity
      stopPrice: 1.275,
      orderType: "market",
      // leverageAckReceived deliberately omitted (defaults false)
    });
    expect(outcome.rejectReason).toBe("leverage_ack_required");

    // No fill must ever arrive for a rejected order.
    adapter.clock.advance(5);
    expect(fill).toBeNull();
  });

  it("logs the reject as an order_cancel with the reject reason (harness parity)", () => {
    const adapter = new SessionAdapter(scn003);
    adapter.clock.advance(5);
    const outcome = adapter.submitOrder({
      side: "buy",
      quantity: 5_000, // book v1 balance guard is unleveraged: qty*stop <= equity
      stopPrice: 1.275,
      orderType: "market",
    });
    const cancels = adapter.log.entries
      .map((e) => e.event)
      .filter((ev): ev is OrderCancelEvent => ev.type === "order_cancel");
    expect(cancels).toHaveLength(1);
    expect(cancels[0].orderId).toBe(outcome.orderId);
    expect(cancels[0].reason).toBe("leverage_ack_required");
  });

  it("accepts and fills the order once leverage is acknowledged", () => {
    const adapter = new SessionAdapter(scn003);
    let fill: OrderFillEvent | null = null;
    adapter.onFill((f) => {
      fill = f;
    });
    adapter.clock.advance(5);
    const outcome = adapter.submitOrder({
      side: "buy",
      quantity: 5_000, // book v1 balance guard is unleveraged: qty*stop <= equity
      stopPrice: 1.275,
      orderType: "market",
      leverageAckReceived: true,
    });
    expect(outcome.rejectReason).toBeNull();
    adapter.clock.advance(1);
    expect(fill).not.toBeNull();
    expect(fill!.orderId).toBe(outcome.orderId);
  });

  it("honors the manifest msPerTick (5 s ticks)", () => {
    const adapter = new SessionAdapter(scn003);
    adapter.clock.advance(1);
    expect(adapter.clock.state.simTimeMs).toBe(5_000);
  });

  it("endSession DebriefData carries SCN-003 id + canonical seed", () => {
    const adapter = new SessionAdapter(scn003);
    adapter.clock.advance(3);
    const debrief = adapter.endSession();
    expect(debrief).not.toBeNull();
    expect(debrief!.scenarioId).toBe("SCN-003");
    expect(debrief!.seed).toBe(42_003);
  });
});

// ---------------------------------------------------------------------------
// Determinism across adapter instances
// ---------------------------------------------------------------------------

describe("deterministic tick streams per scenario", () => {
  function closes(def: typeof scn002, n: number): number[] {
    const adapter = new SessionAdapter(def);
    const out: number[] = [];
    adapter.onTick((t) => out.push(t.close));
    adapter.clock.advance(n);
    return out;
  }

  it("two SCN-002 adapters produce identical close streams", () => {
    expect(closes(scn002, 50)).toEqual(closes(scn002, 50));
  });

  it("two SCN-003 adapters produce identical close streams", () => {
    expect(closes(scn003, 50)).toEqual(closes(scn003, 50));
  });

  it("SCN-002 and SCN-003 streams differ (different seeds + adapters)", () => {
    expect(closes(scn002, 20)).not.toEqual(closes(scn003, 20));
  });
});
