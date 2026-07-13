/**
 * Forex leverage risk computation — pure functions for the UI risk display.
 *
 * SIM_ENGINE_SPEC §3.4 / canonical convention (DECIDED 2026-06-07, P-7):
 * "Given account, lot size, leverage → required margin, free margin,
 *  pips-to-margin-call, pips-to-stop-out."
 *
 * Pure functions only. No side effects; no account mutation.
 * The UI modal (blocking risk display before forex order entry) consumes these.
 *
 * Canonical stop-out convention: MARGIN-LEVEL only.
 *   margin_level = equity / used_margin
 *   Margin-call warning:  margin_level ≤ MARGIN_CALL_LEVEL (1.00 = 100%)
 *   Stop-out:             margin_level ≤ STOP_OUT_LEVEL     (0.50 =  50%)
 *
 * used_margin is STATIC AT OPEN — not marked-to-market.
 *
 * Pip value convention (HarborUSD-quoted pairs):
 *   pip_value_per_unit = PIP_SIZE (0.0001)
 *   pip_value_total    = PIP_SIZE × lot_units
 *   e.g. 2 mini lots = 2 × 10,000 × 0.0001 = $2.00/pip
 *
 * X-B02 worked example verification (DECIDED 2026-06-07):
 *   balance=$500, leverage=50:1, quantity=20,000 (2 mini lots), price=1.2500
 *   margin_required = 20,000 × 1.2500 / 50 = $500
 *   free_margin = $500 − $500 = $0
 *   margin_level at open = $500 / $500 = 1.00 → warning fires immediately
 *   pip_value_total = 0.0001 × 20,000 = $2.00/pip
 *
 *   pips_to_margin_call:
 *     equity_at_mc = used_margin × MARGIN_CALL_LEVEL = $500 × 1.0 = $500
 *     loss_to_mc = current_equity($500) − $500 = $0
 *     pips_to_mc = 0 pips (warning already active at open)
 *
 *   pips_to_stop_out:
 *     equity_at_so = used_margin × STOP_OUT_LEVEL = $500 × 0.5 = $250
 *     loss_to_so = current_equity($500) − $250 = $250
 *     pips_to_so = $250 / $2.00 = 125 pips ✓
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
   * null if the position is already at or below margin-call territory at open.
   */
  pipsToMarginCall: number | null;
  /**
   * Approximate pips to stop-out (auto-liquidation).
   * null if the position is already at or below stop-out territory at open.
   */
  pipsToStopOut: number | null;
  /** True if opening this position would immediately exceed free margin. */
  insufficientMargin: boolean;
}

/**
 * Compute forex leverage risk for a proposed new position.
 * Pure function — no account state is mutated.
 *
 * Uses the canonical margin-level convention throughout:
 *   pips_to_margin_call = (equity − used_margin × MARGIN_CALL_LEVEL) / pip_value_total
 *   pips_to_stop_out    = (equity − used_margin × STOP_OUT_LEVEL)     / pip_value_total
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
  } = input;

  const safeLeverage = Number.isFinite(leverage) && leverage > 0 ? leverage : 1;
  const safeLots = Number.isFinite(lots) && lots > 0 ? lots : 0;
  const safeLotUnits = Number.isFinite(lotUnits) && lotUnits > 0 ? lotUnits : 0;
  const safePrice = Number.isFinite(currentPrice) && currentPrice > 0 ? currentPrice : 0;
  const safeBalance = Number.isFinite(balance) ? balance : 0;
  const safeExistingUsedMargin = Number.isFinite(existingUsedMargin) && existingUsedMargin > 0 ? existingUsedMargin : 0;
  const safeExistingUnrealizedPnl = Number.isFinite(existingUnrealizedPnl) ? existingUnrealizedPnl : 0;

  const quantity = safeLots * safeLotUnits;

  // Margin for the new position (static at open — not marked-to-market).
  const requiredMargin = (quantity * safePrice) / safeLeverage;

  const totalUsedMargin = safeExistingUsedMargin + requiredMargin;

  // Current equity before opening this position.
  const equity = safeBalance + safeExistingUnrealizedPnl;

  const freeMargin = equity - totalUsedMargin;

  const insufficientMargin = freeMargin < 0;

  // Pip value for the total position size.
  const pipValueTotal = PIP_SIZE * quantity;

  // Pips to margin-call: equity falls to MARGIN_CALL_LEVEL × totalUsedMargin.
  const equityAtMc = totalUsedMargin * MARGIN_CALL_LEVEL;
  const lossToMc = equity - equityAtMc;
  const pipsToMarginCall =
    lossToMc > 0 && pipValueTotal > 0
      ? lossToMc / pipValueTotal
      : null;

  // Pips to stop-out: equity falls to STOP_OUT_LEVEL × totalUsedMargin.
  const equityAtSo = totalUsedMargin * STOP_OUT_LEVEL;
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
