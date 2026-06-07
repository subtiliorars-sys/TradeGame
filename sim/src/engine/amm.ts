/**
 * AMM / LP position math — SCN-004 "The GLIMMER Pool" (SCENARIOS_V1).
 *
 * Pure functions for the LP Position Panel, the scenario's primary teaching
 * surface.  Standard constant-product (x·y=k) two-asset pool, 50/50 deposit:
 *
 *   r              = currentPrice / depositPrice  (divergence ratio)
 *   HODL baseline  = deposit · (1 + r) / 2        (held the raw assets)
 *   Pool value     = deposit · √r                 (LP share marked at current price)
 *   IL fraction    = poolValue/hodl − 1 = 2√r/(1+r) − 1   (≤ 0; 0 only at r=1)
 *   Fees earned    = deposit · cumulativeFeeRate  (accrues per the fee schedule)
 *   Net vs. HODL   = poolValue + fees − hodl
 *
 * Spec cross-check (SCENARIOS_V1 §SCN-004, corrected 2026-06-07 to the
 * standard 2√r/(1+r)−1 formula):
 *   r = 5.10/4.20 → IL ≈ −0.47%  (spec "approximately 0.45%")  ✓
 *   r = 6.85/4.20 → IL ≈ −2.92%  (spec "approximately 2.9%")   ✓
 *   r = 5.40/4.20 → IL ≈ −0.78%  (spec "approximately 0.8%")   ✓
 *
 * DISPLAY-DOMAIN ONLY: this module feeds the LP Position Panel (UI surface).
 * Nothing here flows into the scoring engine — SCN-004's rubric scores
 * journals/triggers, never the net-vs-HODL outcome (SIM_ENGINE_SPEC §4.1/§4.4).
 */

// ---------------------------------------------------------------------------
// Core constant-product math
// ---------------------------------------------------------------------------

/**
 * Impermanent-loss fraction for divergence ratio r = price/depositPrice.
 * Always ≤ 0; equals 0 only at r = 1.  Throws on non-positive r.
 */
export function ilFraction(r: number): number {
  if (!Number.isFinite(r) || r <= 0) {
    throw new Error(`ilFraction: divergence ratio must be positive, got ${r}`);
  }
  return (2 * Math.sqrt(r)) / (1 + r) - 1;
}

/** HODL baseline value of a 50/50 deposit if the raw assets were held. */
export function hodlValue(deposit: number, depositPrice: number, currentPrice: number): number {
  const r = ratio(depositPrice, currentPrice);
  return (deposit * (1 + r)) / 2;
}

/** Current LP position value (pool share marked at the current price). */
export function lpPoolValue(deposit: number, depositPrice: number, currentPrice: number): number {
  const r = ratio(depositPrice, currentPrice);
  return deposit * Math.sqrt(r);
}

/** Cumulative fees earned on the deposit at the given cumulative fee rate. */
export function feesEarned(deposit: number, cumulativeFeeRate: number): number {
  return deposit * cumulativeFeeRate;
}

/**
 * Full LP Position Panel snapshot — the four values the panel displays at
 * all times (SCENARIOS_V1 §SCN-004 "Core Mechanic: The IL Dashboard").
 */
export interface LpPanelSnapshot {
  /** Current pool value (HarborUSD + GLIMMER share, in USVC). */
  readonly poolValue: number;
  /** What the deposited assets would be worth held outright. */
  readonly hodlBaseline: number;
  /** Cumulative fees earned, in USVC. */
  readonly feesEarned: number;
  /** poolValue + feesEarned − hodlBaseline (negative = losing to IL net of fees). */
  readonly netVsHodl: number;
  /** Impermanent-loss fraction at the current divergence (≤ 0). */
  readonly ilFraction: number;
}

export function lpPanelSnapshot(
  deposit: number,
  depositPrice: number,
  currentPrice: number,
  cumulativeFeeRate: number
): LpPanelSnapshot {
  const pool = lpPoolValue(deposit, depositPrice, currentPrice);
  const hodl = hodlValue(deposit, depositPrice, currentPrice);
  const fees = feesEarned(deposit, cumulativeFeeRate);
  return {
    poolValue: pool,
    hodlBaseline: hodl,
    feesEarned: fees,
    netVsHodl: pool + fees - hodl,
    ilFraction: ilFraction(ratio(depositPrice, currentPrice)),
  };
}

// ---------------------------------------------------------------------------
// SCN-004 fee accrual schedule (TUNABLE per SCENARIOS_V1 — first-pass rates)
// ---------------------------------------------------------------------------

/**
 * Cumulative fee rate checkpoints from the SCN-004 beat table, keyed by
 * sim-ms from deposit (T0).  Linear interpolation between checkpoints;
 * clamped at the ends.  Rates are fractions of the deposit.
 */
export const SCN004_FEE_SCHEDULE: ReadonlyArray<{ simMsFromT0: number; cumulativeRate: number }> = [
  { simMsFromT0: 0,          cumulativeRate: 0 },
  { simMsFromT0: 15 * 60_000, cumulativeRate: 0.003 },  // T+15: 0.3%
  { simMsFromT0: 30 * 60_000, cumulativeRate: 0.007 },  // T+30: 0.7%
  { simMsFromT0: 50 * 60_000, cumulativeRate: 0.014 },  // T+50: 1.4%
  { simMsFromT0: 65 * 60_000, cumulativeRate: 0.021 },  // T+65: 2.1%
  { simMsFromT0: 80 * 60_000, cumulativeRate: 0.025 },  // T+80: 2.5%
  { simMsFromT0: 90 * 60_000, cumulativeRate: 0.027 },  // T+90: 2.7%
];

/** Interpolated cumulative fee rate at simMsFromT0 (clamped to schedule ends). */
export function scn004CumulativeFeeRate(simMsFromT0: number): number {
  const sched = SCN004_FEE_SCHEDULE;
  const first = sched[0];
  const last = sched[sched.length - 1];
  if (first === undefined || last === undefined) return 0;
  if (simMsFromT0 <= first.simMsFromT0) return first.cumulativeRate;
  if (simMsFromT0 >= last.simMsFromT0) return last.cumulativeRate;
  for (let i = 1; i < sched.length; i++) {
    const prev = sched[i - 1];
    const next = sched[i];
    if (prev === undefined || next === undefined) continue;
    if (simMsFromT0 <= next.simMsFromT0) {
      const span = next.simMsFromT0 - prev.simMsFromT0;
      const t = span > 0 ? (simMsFromT0 - prev.simMsFromT0) / span : 1;
      return prev.cumulativeRate + (next.cumulativeRate - prev.cumulativeRate) * t;
    }
  }
  return last.cumulativeRate;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function ratio(depositPrice: number, currentPrice: number): number {
  if (!Number.isFinite(depositPrice) || depositPrice <= 0) {
    throw new Error(`amm: depositPrice must be positive, got ${depositPrice}`);
  }
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    throw new Error(`amm: currentPrice must be positive, got ${currentPrice}`);
  }
  return currentPrice / depositPrice;
}
