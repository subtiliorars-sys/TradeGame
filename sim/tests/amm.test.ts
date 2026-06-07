/**
 * AMM / LP position math tests — SCN-004 LP Position Panel (engine/amm.ts).
 *
 * Verifies the constant-product IL formula against the spec's own numbers
 * (SCENARIOS_V1 §SCN-004, corrected 2026-06-07 to 2√r/(1+r)−1) and the
 * panel/fee-schedule behaviors the scenario's teaching beats depend on.
 */

import { describe, it, expect } from "vitest";
import {
  ilFraction,
  hodlValue,
  lpPoolValue,
  feesEarned,
  lpPanelSnapshot,
  scn004CumulativeFeeRate,
  SCN004_FEE_SCHEDULE,
} from "../src/engine/amm.js";

const DEPOSIT = 1_000;
const P0 = 4.2;

describe("ilFraction — constant-product 2√r/(1+r)−1", () => {
  it("is zero at r = 1 (no divergence)", () => {
    expect(ilFraction(1)).toBeCloseTo(0, 12);
  });

  it("matches the spec checkpoints", () => {
    // +21% divergence (5.10/4.20) → IL ≈ −0.47% (spec "approximately 0.45%")
    expect(ilFraction(5.1 / 4.2)).toBeCloseTo(-0.0047, 3);
    // +63% divergence (6.85/4.20) → IL ≈ −2.92% (spec "approximately 2.9%")
    expect(ilFraction(6.85 / 4.2)).toBeCloseTo(-0.0292, 3);
    // post-correction (5.40/4.20) → IL ≈ −0.78% (spec "approximately 0.8%")
    expect(ilFraction(5.4 / 4.2)).toBeCloseTo(-0.0078, 3);
  });

  it("is symmetric in r and 1/r (divergence direction does not matter)", () => {
    expect(ilFraction(2)).toBeCloseTo(ilFraction(0.5), 12);
  });

  it("is always ≤ 0 across a wide range", () => {
    for (const r of [0.1, 0.5, 0.9, 1, 1.1, 2, 5, 10]) {
      expect(ilFraction(r)).toBeLessThanOrEqual(0);
    }
  });

  it("throws on non-positive ratios", () => {
    expect(() => ilFraction(0)).toThrow();
    expect(() => ilFraction(-1)).toThrow();
    expect(() => ilFraction(Number.NaN)).toThrow();
  });
});

describe("pool value vs HODL baseline", () => {
  it("pool = hodl = deposit at the deposit price", () => {
    expect(lpPoolValue(DEPOSIT, P0, P0)).toBeCloseTo(DEPOSIT, 9);
    expect(hodlValue(DEPOSIT, P0, P0)).toBeCloseTo(DEPOSIT, 9);
  });

  it("pool lags HODL whenever price diverges (that lag IS the IL)", () => {
    for (const p of [4.35, 5.1, 6.85, 5.4]) {
      const pool = lpPoolValue(DEPOSIT, P0, p);
      const hodl = hodlValue(DEPOSIT, P0, p);
      expect(pool).toBeLessThan(hodl);
      expect(pool / hodl - 1).toBeCloseTo(ilFraction(p / P0), 9);
    }
  });

  it("feesEarned is linear in the cumulative rate", () => {
    expect(feesEarned(DEPOSIT, 0.027)).toBeCloseTo(27, 9);
    expect(feesEarned(DEPOSIT, 0)).toBe(0);
  });
});

describe("lpPanelSnapshot — the four panel values + scenario teaching beats", () => {
  it("net vs HODL is negative at peak divergence (DP-C: IL has outrun fees)", () => {
    // T+40: price 6.85, fees ≈ 1.4% — spec: net ≈ −1.5%.
    const snap = lpPanelSnapshot(DEPOSIT, P0, 6.85, 0.014);
    expect(snap.netVsHodl).toBeLessThan(0);
    expect(snap.netVsHodl / snap.hodlBaseline).toBeCloseTo(-0.015, 2);
  });

  it("net vs HODL turns positive after the correction (DP-E: fees won)", () => {
    // T+72: price ≈ 5.40, fees ≈ 2.5% — spec: net ≈ +1.7%.
    const snap = lpPanelSnapshot(DEPOSIT, P0, 5.4, 0.025);
    expect(snap.netVsHodl).toBeGreaterThan(0);
    expect(snap.netVsHodl / snap.hodlBaseline).toBeCloseTo(0.017, 2);
  });

  it("panel identity: netVsHodl = poolValue + feesEarned − hodlBaseline", () => {
    const snap = lpPanelSnapshot(DEPOSIT, P0, 6.1, 0.021);
    expect(snap.netVsHodl).toBeCloseTo(
      snap.poolValue + snap.feesEarned - snap.hodlBaseline,
      9
    );
  });
});

describe("scn004CumulativeFeeRate — fee accrual schedule", () => {
  it("matches the beat-table checkpoints exactly", () => {
    for (const { simMsFromT0, cumulativeRate } of SCN004_FEE_SCHEDULE) {
      expect(scn004CumulativeFeeRate(simMsFromT0)).toBeCloseTo(cumulativeRate, 12);
    }
  });

  it("interpolates linearly between checkpoints", () => {
    // Midway between T+15 (0.3%) and T+30 (0.7%) → 0.5%.
    expect(scn004CumulativeFeeRate(22.5 * 60_000)).toBeCloseTo(0.005, 12);
  });

  it("clamps before T0 and after T+90", () => {
    expect(scn004CumulativeFeeRate(-60_000)).toBe(0);
    expect(scn004CumulativeFeeRate(120 * 60_000)).toBeCloseTo(0.027, 12);
  });

  it("is monotonically non-decreasing (fees never un-accrue)", () => {
    let prev = -Infinity;
    for (let ms = 0; ms <= 90 * 60_000; ms += 60_000) {
      const rate = scn004CumulativeFeeRate(ms);
      expect(rate).toBeGreaterThanOrEqual(prev);
      prev = rate;
    }
  });
});
