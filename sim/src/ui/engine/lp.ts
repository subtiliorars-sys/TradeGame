/**
 * LP Position Panel view-model — SCN-004's core teaching surface
 * (SCENARIOS_V1 "Core Mechanic: The IL Dashboard").
 *
 * Pure bridge between the engine AMM math (engine/amm.ts) and the Phaser
 * render layer: given the deposit (the scenario's entry fill) and the
 * current tick, produce the four panel values plus display strings.
 *
 * The deposit is the GLIMMER spot position: deposit amount = qty × fill
 * price, deposit price = fill price, fees accrue on the SCN-004 schedule
 * keyed by sim-time since the deposit ("Fees begin accruing" at deposit
 * per the beat table).
 *
 * DISPLAY-DOMAIN ONLY (SIM_ENGINE_SPEC §4.1/§4.4): nothing here flows into
 * scoring. The panel is a data surface — the spec's own marker copy applies:
 * "This is a data point, not a signal."
 */

import {
  lpPanelSnapshot,
  scn004CumulativeFeeRate,
  type LpPanelSnapshot,
} from "../../engine/amm.js";

export interface LpDeposit {
  /** Deposit price = the entry fill price (USVC per GLIMMER). */
  depositPrice: number;
  /** Deposit size in USVC = qty × fill price. */
  depositUsvc: number;
  /** Sim-time of the deposit fill (ms). */
  depositSimTimeMs: number;
}

export interface LpPanelView {
  /** The four always-visible values (spec: IL Dashboard). */
  snapshot: LpPanelSnapshot;
  /** Cumulative fee rate applied (fraction of deposit). */
  feeRate: number;
  /** True when net-vs-HODL is positive (fees have outpaced IL). */
  netPositive: boolean;
  /** Pre-formatted display lines for the render layer. */
  lines: string[];
}

/** Build the deposit record from an entry fill. */
export function depositFromFill(
  fillPrice: number,
  quantity: number,
  simTimeMs: number
): LpDeposit {
  return {
    depositPrice: fillPrice,
    depositUsvc: fillPrice * quantity,
    depositSimTimeMs: simTimeMs,
  };
}

/**
 * Panel view at the current tick. Returns null with no deposit (the render
 * layer shows the observing state).
 */
export function lpPanelView(
  deposit: LpDeposit | null,
  currentPrice: number,
  simTimeMs: number
): LpPanelView | null {
  if (deposit === null || currentPrice <= 0) return null;

  const msSinceDeposit = Math.max(0, simTimeMs - deposit.depositSimTimeMs);
  const feeRate = scn004CumulativeFeeRate(msSinceDeposit);
  const snapshot = lpPanelSnapshot(
    deposit.depositUsvc,
    deposit.depositPrice,
    currentPrice,
    feeRate
  );

  const usvc = (n: number): string => n.toFixed(2);
  const pct = (n: number): string => `${(n * 100).toFixed(2)}%`;
  const net = snapshot.netVsHodl;

  return {
    snapshot,
    feeRate,
    netPositive: net > 0,
    lines: [
      `Pool value:     ${usvc(snapshot.poolValue)} USVC`,
      `HODL baseline:  ${usvc(snapshot.hodlBaseline)} USVC`,
      `Fees earned:    ${usvc(snapshot.feesEarned)} USVC (${pct(feeRate)})`,
      `Net vs. HODL:   ${net >= 0 ? "+" : ""}${usvc(net)} USVC (IL ${pct(snapshot.ilFraction)})`,
    ],
  };
}
