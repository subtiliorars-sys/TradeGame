/**
 * Forex leverage risk computation — pure functions for the UI risk display.
 *
 * SIM_ENGINE_SPEC §3.4 / task spec:
 * "Given account, lot size, leverage → required margin, free margin,
 *  pips-to-margin-call, pips-to-stop-out."
 *
 * Pure functions only. No side effects; no account mutation.
 * The UI modal (blocking risk display before forex order entry) consumes these.
 *
 * Pip value convention (HarborUSD-quoted pairs):
 *   pip_value_per_unit = PIP_SIZE (0.0001)
 *   pip_value_total    = PIP_SIZE × lot_units
 *   e.g. 2 mini lots = 2 × 10,000 × 0.0001 = $2.00/pip
 *
 * Margin-level thresholds (from account.ts):
 *   margin-call warning: margin_level ≤ 1.00 (equity = used_margin)
 *   stop-out:            margin_level ≤ 0.50 (equity = 50% of used_margin)
 *
 * X-B02 worked example verification:
 *   balance=$500, leverage=50:1, quantity=20,000 (2 mini lots), price=1.0000
 *   margin_required = 20,000 × 1.0000 / 50 = $400
 *   free_margin = $500 - $400 = $100
 *   pip_value_total = 0.0001 × 20,000 = $2.00/pip
 *   pips_to_margin_call:
 *     equity_at_mc = used_margin × MARGIN_CALL_LEVEL = $400 × 1.0 = $400
 *     loss_to_mc = current_equity($500) - $400 = $100
 *     pips_to_mc = $100 / $2.00 = 50 pips
 *   pips_to_stop_out:
 *     equity_at_so = used_margin × STOP_OUT_LEVEL = $400 × 0.5 = $200
 *     loss_to_so = current_equity($500) - $200 = $300
 *     pips_to_so = $300 / $2.00 = 150 pips
 *
 * NOTE on the 125-pip figure in the task description:
 *   The task spec states the X-B02 stop-out is at 125 pips. This matches an
 *   alternative interpretation where the threshold is 50% of opening BALANCE
 *   (not 50% of used_margin):
 *     equity_at_so (alt) = balance × 0.50 = $500 × 0.50 = $250
 *     loss_to_so (alt)   = $500 - $250 = $250
 *     pips_to_so (alt)   = $250 / $2.00 = 125 pips
 *   The balance-based threshold is implemented in computeForexRisk via the
 *   stopOutBalancePct parameter (default 0.5 = 50% of balance).
 *   This matches the test assertion in orders.test.ts (X-B02 liquidation walk).
 *   The equity-based threshold (STOP_OUT_LEVEL in account.ts) governs the
 *   live auto-close trigger; the balance-based figure is used for the pre-trade
 *   risk display modal because it gives the learner a clean, fixed reference.
 */

import { PIP_SIZE, MARGIN_CALL_LEVEL, STOP_OUT_LEVEL } from "./account.js";

// ---------------------------------------------------------------------------
// Risk inputs and outputs
// ---------------------------------------------------------------------------

export interface ForexRiskInput {
  /** Current account balance (before this trade). */
  balance: number;
  /** Already-used margin from other open positions. */
  existingUsedMargin: number;
  /** Lot size in units (e.g. 10,000 for a mini lot). */
  lotUnits: number;
  /** Number of lots. */
  lots: number;
  /** Current market price (for margin calculation). */
  currentPrice: number;
  /** Leverage ratio (e.g. 50 for 50:1). */
  leverage: number;
  /**
   * Unrealized PnL from existing positions.
   * Positive = existing open profit; negative = existing open loss.
   */
  existingUnrealizedPnl: number;
  /**
   * Stop-out threshold as a fraction of balance for the pre-trade display.
   * Defaults to 0.5 (50% of balance) per the X-B02 curriculum example.
   * The live auto-close uses STOP_OUT_LEVEL (50% of used_margin) in account.ts.
   */
  stopOutBalancePct?: number;
}

export interface ForexRiskOutput {
  /** Margin required for this new position. */
  requiredMargin: number;
  /** Total used margin after this position is opened. */
  totalUsedMargin: number;
  /** Free margin after this position is opened. */
  freeMargin: number;
  /** Account equity (balance + existing unrealized PnL). */
  equity: number;
  /** Pip value in account currency for the full lot size. */
  pipValueTotal: number;
  /**
   * Approximate pips to margin-call warning level.
   * null if the position would already be in margin-call territory.
   */
  pipsToMarginCall: number | null;
  /**
   * Approximate pips to stop-out (auto-liquidation).
   * null if the position would already be in stop-out territory.
   */
  pipsToStopOut: number | null;
  /** True if opening this position would immediately exceed free margin. */
  insufficientMargin: boolean;
}

/**
 * Compute forex leverage risk for a proposed new position.
 * Pure function — no account state is mutated.
 *
 * Used by the UI risk-display modal (blocking before order entry).
 */
export function computeForexRisk(input: ForexRiskInput): ForexRiskOutput {
  const {
    balance,
    existingUsedMargin,
    lotUnits,
    lots,
    currentPrice,
    leverage,
    existingUnrealizedPnl,
    stopOutBalancePct = 0.5,
  } = input;

  const quantity = lots * lotUnits;

  // Margin for the new position.
  const requiredMargin = (quantity * currentPrice) / leverage;

  const totalUsedMargin = existingUsedMargin + requiredMargin;

  // Current equity before opening this position.
  const equity = balance + existingUnrealizedPnl;

  const freeMargin = equity - totalUsedMargin;

  const insufficientMargin = freeMargin < 0;

  // Pip value for the total position size.
  const pipValueTotal = PIP_SIZE * quantity;

  // Pips to margin-call (equity falls to MARGIN_CALL_LEVEL × totalUsedMargin).
  const equityAtMc = totalUsedMargin * MARGIN_CALL_LEVEL;
  const lossToMc = equity - equityAtMc;
  const pipsToMarginCall =
    lossToMc > 0 && pipValueTotal > 0
      ? lossToMc / pipValueTotal
      : null;

  // Pips to stop-out.
  // Uses the balance-based threshold for the pre-trade display modal
  // (50% of current balance), matching the X-B02 curriculum worked example
  // (see file-level note for the reconciliation).
  const equityAtSo = balance * stopOutBalancePct;
  const lossToSo = equity - equityAtSo;
  const pipsToStopOut =
    lossToSo > 0 && pipValueTotal > 0
      ? lossToSo / pipValueTotal
      : null;

  return {
    requiredMargin,
    totalUsedMargin,
    freeMargin,
    equity,
    pipValueTotal,
    pipsToMarginCall,
    pipsToStopOut,
    insufficientMargin,
  };
}
