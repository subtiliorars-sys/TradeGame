/**
 * LP Position Panel view-model tests (ui/engine/lp.ts) — SCN-004's IL
 * Dashboard, checked against SCENARIOS_V1's own beat-table approximations.
 *
 * Spec beats (deposit 4.20, fee schedule 0.3/0.7/1.4/2.1/2.5/2.7%):
 *   DP-B  (T0+20, ~5.10):  IL ≈ −0.47%, fees still ahead → net slightly +
 *   DP-C  (T0+40, 6.85):   IL ≈ −2.92%, fees 1.4% → net ≈ −1.5%  (the lesson)
 *   DP-E  (T0+72, ~5.40):  IL ≈ −0.78%, fees ≈ 2.5% → net ≈ +1.7% (fees won)
 */

import { describe, it, expect } from "vitest";
import { depositFromFill, lpPanelView } from "../src/ui/engine/lp.js";

const MIN = 60_000;
// Deposit: 238 GLIMMER at 4.20 ≈ 1000 USVC at T0.
const DEPOSIT = depositFromFill(4.2, 238.095238, 0);

describe("lpPanelView — spec beat checkpoints", () => {
  it("no deposit → null (render layer shows the observing state)", () => {
    expect(lpPanelView(null, 5.0, MIN)).toBeNull();
  });

  it("at the deposit moment: pool = HODL = deposit, net ≈ 0, no fees", () => {
    const v = lpPanelView(DEPOSIT, 4.2, 0);
    expect(v).not.toBeNull();
    expect(v?.snapshot.poolValue).toBeCloseTo(1000, 0);
    expect(v?.snapshot.hodlBaseline).toBeCloseTo(1000, 0);
    expect(v?.snapshot.feesEarned).toBeCloseTo(0, 6);
    expect(v?.snapshot.netVsHodl).toBeCloseTo(0, 6);
    expect(v?.netPositive).toBe(false);
  });

  it("DP-C (T0+40, price 6.85): net vs HODL ≈ −1.5% of HODL — IL has outrun fees", () => {
    const v = lpPanelView(DEPOSIT, 6.85, 40 * MIN);
    expect(v).not.toBeNull();
    // Schedule interpolates: T+30 = 0.7%, T+50 = 1.4% → T+40 = 1.05%.
    // (The spec table's "1.4% cumulative" is the phase END value.)
    expect(v?.feeRate).toBeCloseTo(0.0105, 4);
    expect(v?.netPositive).toBe(false);
  });

  it("DP-E (T0+72, price 5.40): net vs HODL positive — fees won (spec ≈ +1.7%)", () => {
    const v = lpPanelView(DEPOSIT, 5.4, 72 * MIN);
    expect(v).not.toBeNull();
    expect(v?.netPositive).toBe(true);
    const netPct = (v!.snapshot.netVsHodl / v!.snapshot.hodlBaseline) * 100;
    expect(netPct).toBeGreaterThan(1.0);
    expect(netPct).toBeLessThan(2.5);
  });

  it("the zero-crossing happens between DP-C and DP-E (spec: crosses at least once each way)", () => {
    const atC = lpPanelView(DEPOSIT, 6.85, 40 * MIN)!;
    const atE = lpPanelView(DEPOSIT, 5.4, 72 * MIN)!;
    expect(atC.snapshot.netVsHodl).toBeLessThan(0);
    expect(atE.snapshot.netVsHodl).toBeGreaterThan(0);
  });

  it("fees key on time SINCE DEPOSIT, not absolute sim time", () => {
    const lateDeposit = depositFromFill(4.2, 238.095238, 10 * MIN);
    const a = lpPanelView(DEPOSIT, 5.0, 30 * MIN)!;       // 30 min in pool
    const b = lpPanelView(lateDeposit, 5.0, 40 * MIN)!;   // also 30 min in pool
    expect(a.feeRate).toBeCloseTo(b.feeRate, 12);
  });

  it("display lines carry the four panel values and no directive language", () => {
    const v = lpPanelView(DEPOSIT, 6.85, 40 * MIN)!;
    expect(v.lines).toHaveLength(4);
    expect(v.lines[0]).toContain("Pool value");
    expect(v.lines[1]).toContain("HODL baseline");
    expect(v.lines[2]).toContain("Fees earned");
    expect(v.lines[3]).toContain("Net vs. HODL");
    const all = v.lines.join(" ").toLowerCase();
    for (const banned of ["buy", "sell", "should", "withdraw now", "signal"]) {
      expect(all).not.toContain(banned);
    }
  });
});

// ---------------------------------------------------------------------------
// DP-C checkpoint gap view (wave: IL checkpoint)
// ---------------------------------------------------------------------------

import { ilGapView } from "../src/ui/engine/lp.js";

describe("ilGapView — estimate vs actual, accuracy never scored", () => {
  it("computes actual% and the gap in points", () => {
    // Actual IL fraction −0.0292 (the spec's DP-C value) vs a 2% estimate.
    const g = ilGapView(2, -0.0292);
    expect(g.actualPct).toBeCloseTo(2.92, 2);
    expect(g.gapPts).toBeCloseTo(0.92, 2);
  });

  it("treats estimate sign/direction generously (3 ≈ −3 ≈ '3% IL')", () => {
    expect(ilGapView(3, -0.03).gapPts).toBeCloseTo(0, 9);
  });

  it("teaching line tiers by gap size, never blames", () => {
    expect(ilGapView(2.9, -0.0292).line).toContain("intuition");
    expect(ilGapView(2.0, -0.0292).line).toContain("Close");
    const wide = ilGapView(10, -0.0292).line;
    expect(wide).toContain("useful");
    for (const banned of ["wrong", "fail", "bad"]) {
      expect(wide.toLowerCase()).not.toContain(banned);
    }
  });
});
