/**
 * Wave A UI-engine tests — declaredRiskPct wiring and the News Policy Card
 * event path, exercised headlessly through SessionAdapter (no Phaser/DOM —
 * same convention as ui-scenarios.test.ts; the Phaser scenes themselves are
 * render-layer and not unit-tested).
 *
 * What the Phaser layer does (TradingScene / PolicyCardScene) is emit events
 * and set adapter fields; these tests drive those exact emissions and assert
 * the scoring outcome, so the UI wiring has an engine-level contract.
 */

import { describe, it, expect } from "vitest";
import { SessionAdapter } from "../src/ui/engine/SessionAdapter.js";
import { getScenario } from "../src/scenarios/registry.js";

function makeAdapter(scenarioId: string): SessionAdapter {
  const def = getScenario(scenarioId);
  if (!def) throw new Error(`unknown scenario ${scenarioId}`);
  return new SessionAdapter(def);
}

// ---------------------------------------------------------------------------
// declaredRiskPct → size_compliance grading
// ---------------------------------------------------------------------------

describe("SessionAdapter.declaredRiskPct — size_compliance grades vs the declared rule", () => {
  it("defaults to 1% when never set", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.clock.advance(5);
    // ~1% of 10k at HarborUSD ≈ 1.0 → qty 100 ≈ $100 notional.
    adapter.submitOrder({ side: "buy", quantity: 100, stopPrice: 0.95 });
    adapter.clock.advance(2);
    const debrief = adapter.endSession();
    const row = debrief?.rubricRows.find((r) => r.metricId === "size_compliance");
    expect(row?.status).toBe("pass");
  });

  it("a 10% declaration passes a 10% position that would fail the 1% default", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.declaredRiskPct = 10;
    adapter.clock.advance(5);
    // ~10% of 10k ≈ $1,000 notional → qty 1000 at ~1.0.
    adapter.submitOrder({ side: "buy", quantity: 1000, stopPrice: 0.95 });
    adapter.clock.advance(2);
    const debrief = adapter.endSession();
    const row = debrief?.rubricRows.find((r) => r.metricId === "size_compliance");
    expect(row?.status).toBe("pass");
  });

  it("the same 10% position FAILS under the default 1% declaration", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.clock.advance(5);
    adapter.submitOrder({ side: "buy", quantity: 1000, stopPrice: 0.95 });
    adapter.clock.advance(2);
    const debrief = adapter.endSession();
    const row = debrief?.rubricRows.find((r) => r.metricId === "size_compliance");
    expect(row?.status).toBe("fail");
  });

  it("out-of-range declarations fall back to the 1% default (clamp guard)", () => {
    for (const bad of [0, -5, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
      const adapter = makeAdapter("SCN-001");
      adapter.declaredRiskPct = bad;
      adapter.clock.advance(5);
      adapter.submitOrder({ side: "buy", quantity: 100, stopPrice: 0.95 });
      adapter.clock.advance(2);
      const debrief = adapter.endSession();
      const row = debrief?.rubricRows.find((r) => r.metricId === "size_compliance");
      expect(row?.status, `declaredRiskPct=${bad} must clamp to the 1% default`).toBe("pass");
    }
  });
});

// ---------------------------------------------------------------------------
// News Policy Card event path (what PolicyCardScene emits)
// ---------------------------------------------------------------------------

describe("News Policy Card event path — policy metrics live in the UI adapter", () => {
  it("an on-time option-C declaration earns policy_declared_card + policy_match", () => {
    const adapter = makeAdapter("SCN-006");
    // Advance to the card decision point (tick 180 at 5s ticks = T-05),
    // before the T-01 deadline (1,140,000 ms).
    adapter.clock.advance(180);
    // Exactly what PolicyCardScene.declare() appends:
    adapter.log.append(adapter.clock.state.simTimeMs, {
      type: "policy_declared",
      policyId: "scn-006-card",
      option: "C_observe_only",
      journalWordCount: 12,
      tickIndex: adapter.clock.state.tickIndex,
      timestamp: adapter.clock.state.simTimeMs,
    });
    // Observe through the event window without trading.
    adapter.clock.advance(120);
    const debrief = adapter.endSession();
    const card = debrief?.rubricRows.find((r) => r.metricId === "policy_declared_card");
    const match = debrief?.rubricRows.find((r) => r.metricId === "policy_match");
    expect(card?.status).toBe("pass");
    expect(card?.xpEarned).toBe(30);
    expect(match?.status).toBe("pass");
    expect(match?.xpEarned).toBe(25);
    expect(debrief?.policyMismatchNote).toBeNull();
  });

  it("a declaration after T-01 fails the card and is not labeled a mismatch", () => {
    const adapter = makeAdapter("SCN-006");
    // T-01 deadline = 1,140,000 ms = tick 228; declare late at tick 235.
    adapter.clock.advance(235);
    adapter.log.append(adapter.clock.state.simTimeMs, {
      type: "policy_declared",
      policyId: "scn-006-card",
      option: "C_observe_only",
      journalWordCount: 12,
      tickIndex: adapter.clock.state.tickIndex,
      timestamp: adapter.clock.state.simTimeMs,
    });
    adapter.clock.advance(80);
    const debrief = adapter.endSession();
    const card = debrief?.rubricRows.find((r) => r.metricId === "policy_declared_card");
    expect(card?.status).toBe("fail");
    // Lateness is the card's failure, not a behaviour mismatch (NEW-4).
    expect(debrief?.policyMismatchNote).toBeNull();
  });

  it("no declaration: card row fails, match row is n/a, mismatch note absent", () => {
    const adapter = makeAdapter("SCN-006");
    adapter.clock.advance(300);
    const debrief = adapter.endSession();
    const card = debrief?.rubricRows.find((r) => r.metricId === "policy_declared_card");
    const match = debrief?.rubricRows.find((r) => r.metricId === "policy_match");
    expect(card?.status).toBe("fail");
    expect(match?.status).toBe("na");
    expect(debrief?.policyMismatchNote).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Wave C red-team regressions
// ---------------------------------------------------------------------------

describe("F2: declaredRiskPct is frozen at first order (no retro-fit)", () => {
  it("editing Risk % after the fill does not change the grading basis", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.declaredRiskPct = 1;
    adapter.clock.advance(5);
    // ~10% notional under a 1% declaration — must FAIL size_compliance.
    adapter.submitOrder({ side: "buy", quantity: 1000, stopPrice: 0.95 });
    adapter.clock.advance(2);
    // Retro-fit attempt: declare 10% AFTER the fill.
    adapter.declaredRiskPct = 10;
    const debrief = adapter.endSession();
    const row = debrief?.rubricRows.find((r) => r.metricId === "size_compliance");
    expect(row?.status, "post-fill Risk % edits must not re-grade the trade").toBe("fail");
  });

  it("declaring 10% BEFORE the order still grades against 10%", () => {
    const adapter = makeAdapter("SCN-001");
    adapter.declaredRiskPct = 10;
    adapter.clock.advance(5);
    adapter.submitOrder({ side: "buy", quantity: 1000, stopPrice: 0.95 });
    adapter.clock.advance(2);
    adapter.declaredRiskPct = 1; // post-fill edit the other direction
    const debrief = adapter.endSession();
    const row = debrief?.rubricRows.find((r) => r.metricId === "size_compliance");
    expect(row?.status).toBe("pass");
  });
});
