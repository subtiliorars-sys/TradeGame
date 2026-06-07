/**
 * Position and margin models — SIM_ENGINE_SPEC §3.4.
 *
 * Three per-market account types:
 *   - CryptoSpotAccount  — cash, no leverage (v1)
 *   - StocksCashAccount  — cash, session-gated fills, no margin (v1)
 *   - ForexMarginAccount — leveraged, margin/free-margin/equity arithmetic,
 *                          margin-call warning + stop-out enforcement
 *
 * Forex pip-value convention (HarborUSD-quoted pairs, spec §3.4):
 *   pip_value = pip_size × lot_units
 *   where pip_size = 0.0001 (4th decimal place)
 *
 *   Standard lot: 100,000 units → pip_value = $10.00
 *   Mini lot:      10,000 units → pip_value =  $1.00
 *   Micro lot:      1,000 units → pip_value =  $0.10
 *
 * Margin arithmetic (canonical convention for HarborUSD-quoted pairs):
 *   margin_required = (lot_units × current_price) / leverage
 *   equity          = balance + unrealized_pnl
 *   free_margin     = equity - used_margin
 *   margin_level    = equity / used_margin   (expressed as ratio, not %)
 *
 * Canonical stop-out convention (DECIDED 2026-06-07 — P-7):
 *   Margin-call warning:  margin_level ≤ 1.00 (100%)  → warn
 *   Stop-out:             margin_level ≤ 0.50  (50%)  → auto-close all positions
 *
 * used_margin is STATIC AT OPEN (the margin reserved when the position is
 * opened at entry price). It is NOT marked-to-market. This matches the lesson
 * skeleton, keeps the formula simple, and matches how retail brokers compute
 * maintenance margin for the purpose of the stop-out trigger.
 *
 * X-B02 worked example (curriculum canonical — DECIDED 2026-06-07):
 *   balance = $500, leverage = 50:1, 2 mini lots ANDU/HarborUSD at 1.2500
 *   notional = 20,000 × 1.2500 = $25,000
 *   used_margin (static at open) = $25,000 / 50 = $500
 *   → used_margin = full balance → free_margin = $0 → margin_level = 1.00 at open
 *   → margin-call warning fires immediately (margin_level is already at 100%)
 *
 *   pip_value_total = 0.0001 × 20,000 = $2.00/pip
 *
 *   Stop-out fires when equity / used_margin ≤ 0.50:
 *     equity_at_so = used_margin × 0.50 = $500 × 0.50 = $250
 *     loss_to_so   = $500 − $250 = $250
 *     pips_to_so   = $250 / $2.00 = 125 pips ✓
 *
 * SCOPE NOTE: unrealized PnL tracking is position state, not scoring state.
 * account.ts intentionally carries equity/PnL — the no-PnL rule applies only
 * to scoring.ts (enforced by scripts/lint-pnl.sh which scans only scoring.ts).
 */

// ---------------------------------------------------------------------------
// Forex lot-size convention
// ---------------------------------------------------------------------------

/** Standard lot sizes in units (HarborUSD-quoted pairs). */
export const LOT_UNITS = {
  standard: 100_000,
  mini: 10_000,
  micro: 1_000,
} as const;

/** Pip size for USD-quoted pairs (4th decimal place). */
export const PIP_SIZE = 0.0001;

/**
 * Pip value in USD for a given quantity of units (HarborUSD-quoted pairs).
 * pip_value = pip_size × quantity
 */
export function pipValue(unitQuantity: number): number {
  return PIP_SIZE * unitQuantity;
}

// ---------------------------------------------------------------------------
// Shared position type
// ---------------------------------------------------------------------------

export interface Position {
  orderId: string;
  side: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  /** Unrealized PnL in account currency. */
  unrealizedPnl: number;
}

function updateUnrealizedPnl(pos: Position): void {
  const direction = pos.side === "buy" ? 1 : -1;
  pos.unrealizedPnl = direction * (pos.currentPrice - pos.entryPrice) * pos.quantity;
}

// ---------------------------------------------------------------------------
// Crypto spot account — §3.4
// ---------------------------------------------------------------------------

export interface CryptoSpotAccount {
  readonly balance: number;
  readonly equity: number;
  readonly positions: readonly Position[];
  /** Available cash for new orders = equity - sum(position_values). */
  readonly marginAvailable: number;

  /** Open a new position. Returns false if insufficient balance. */
  openPosition(orderId: string, side: "buy" | "sell", quantity: number, fillPrice: number): boolean;
  /** Close a position (full close). Returns false if position not found. */
  closePosition(orderId: string, fillPrice: number): boolean;
  /** Update mark price for all positions (called per tick). */
  updatePrices(currentPrice: number): void;
  /** Realize a fee/cost against cash balance. */
  chargeFee(amount: number): void;
}

export function createCryptoSpotAccount(initialBalance: number): CryptoSpotAccount {
  let balance = initialBalance;
  const positions: Position[] = [];

  function equity(): number {
    const unrealized = positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
    return balance + unrealized;
  }

  function positionValuesSum(): number {
    return positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  }

  function openPosition(
    orderId: string,
    side: "buy" | "sell",
    quantity: number,
    fillPrice: number
  ): boolean {
    const cost = quantity * fillPrice;
    if (cost > equity()) return false;

    // Reserve cash for a buy (spot: you pay cash upfront).
    if (side === "buy") {
      balance -= cost;
    }

    const pos: Position = {
      orderId,
      side,
      quantity,
      entryPrice: fillPrice,
      currentPrice: fillPrice,
      unrealizedPnl: 0,
    };
    positions.push(pos);
    return true;
  }

  function closePosition(orderId: string, fillPrice: number): boolean {
    const idx = positions.findIndex((p) => p.orderId === orderId);
    if (idx === -1) return false;

    const pos = positions[idx] as Position;
    pos.currentPrice = fillPrice;
    updateUnrealizedPnl(pos);

    // Realize: return cost basis + pnl to cash.
    const proceeds = pos.quantity * fillPrice;
    balance += proceeds;

    positions.splice(idx, 1);
    return true;
  }

  function updatePrices(currentPrice: number): void {
    for (const p of positions) {
      p.currentPrice = currentPrice;
      updateUnrealizedPnl(p);
    }
  }

  function chargeFee(amount: number): void {
    balance -= amount;
  }

  return {
    get balance() { return balance; },
    get equity() { return equity(); },
    get positions(): readonly Position[] { return positions; },
    get marginAvailable() { return equity() - positionValuesSum(); },
    openPosition,
    closePosition,
    updatePrices,
    chargeFee,
  };
}

// ---------------------------------------------------------------------------
// Stocks cash account — §3.4
// ---------------------------------------------------------------------------

/**
 * Same mechanics as crypto spot for v1 (no leverage, no margin).
 * Session gating is enforced by the order book (sessionOpen flag);
 * the account itself does not track session state.
 *
 * PDT rule NOT modeled (deferred per spec §3.4).
 */
export type StocksCashAccount = CryptoSpotAccount;

export function createStocksCashAccount(initialBalance: number): StocksCashAccount {
  // Same implementation as crypto spot for v1.
  return createCryptoSpotAccount(initialBalance);
}

// ---------------------------------------------------------------------------
// Forex margin account — §3.4
// ---------------------------------------------------------------------------

/**
 * Margin-level thresholds — canonical (DECIDED 2026-06-07, P-7).
 *
 * Standard retail-broker convention:
 *   Margin-call warning: margin_level ≤ 1.00 (equity = used_margin)
 *   Stop-out:            margin_level ≤ 0.50 (equity = 50% of used_margin)
 *
 * X-B02 verification: $500 balance, 50:1, 2 mini lots at 1.2500
 *   → used_margin = $500, pip_value = $2.00/pip
 *   → stop-out at equity $250 → loss $250 → 125 pips ✓
 *   (See file-level comment for full arithmetic.)
 */
export const MARGIN_CALL_LEVEL = 1.0; // 100% — equity equals used margin
export const STOP_OUT_LEVEL = 0.5; // 50% — equity = 50% of used margin

export interface ForexPosition extends Position {
  /** Required margin for this position (held from free margin). */
  marginRequired: number;
  /** Leverage ratio for this position. */
  leverage: number;
}

export interface MarginSummary {
  balance: number;
  equity: number;
  usedMargin: number;
  freeMargin: number;
  /** equity / usedMargin — undefined if usedMargin === 0 */
  marginLevel: number | undefined;
  isMarginCallWarning: boolean;
  isStopOut: boolean;
}

export interface ForexMarginAccount {
  readonly balance: number;
  readonly positions: readonly ForexPosition[];
  readonly marginSummary: MarginSummary;

  /**
   * Open a leveraged forex position.
   * Returns false if insufficient free margin.
   */
  openPosition(
    orderId: string,
    side: "buy" | "sell",
    quantity: number,
    fillPrice: number,
    leverage: number
  ): boolean;

  /**
   * Close a position (full close, realized PnL settled to balance).
   * Returns false if position not found.
   */
  closePosition(orderId: string, fillPrice: number): boolean;

  /** Mark all positions with the current market price. */
  updatePrices(currentPrice: number): void;

  /** Deduct a fee from cash balance. */
  chargeFee(amount: number): void;

  /**
   * Auto-close all positions (stop-out).
   * Called by the engine when margin_level ≤ STOP_OUT_LEVEL.
   * Returns the list of closed position order IDs.
   */
  stopOut(currentPrice: number): string[];
}

export function createForexMarginAccount(initialBalance: number): ForexMarginAccount {
  let balance = initialBalance;
  const positions: ForexPosition[] = [];

  function unrealizedPnlTotal(): number {
    return positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  }

  function equity(): number {
    return balance + unrealizedPnlTotal();
  }

  function usedMargin(): number {
    return positions.reduce((sum, p) => sum + p.marginRequired, 0);
  }

  function freeMargin(): number {
    return equity() - usedMargin();
  }

  function marginLevel(): number | undefined {
    const um = usedMargin();
    if (um === 0) return undefined;
    return equity() / um;
  }

  function buildSummary(): MarginSummary {
    const eq = equity();
    const um = usedMargin();
    const ml = marginLevel();
    return {
      balance,
      equity: eq,
      usedMargin: um,
      freeMargin: eq - um,
      marginLevel: ml,
      isMarginCallWarning: ml !== undefined && ml <= MARGIN_CALL_LEVEL,
      isStopOut: ml !== undefined && ml <= STOP_OUT_LEVEL,
    };
  }

  function openPosition(
    orderId: string,
    side: "buy" | "sell",
    quantity: number,
    fillPrice: number,
    leverage: number
  ): boolean {
    const marginRequired = (quantity * fillPrice) / leverage;
    if (marginRequired > freeMargin()) return false;

    const pos: ForexPosition = {
      orderId,
      side,
      quantity,
      entryPrice: fillPrice,
      currentPrice: fillPrice,
      unrealizedPnl: 0,
      marginRequired,
      leverage,
    };
    positions.push(pos);
    return true;
  }

  function closePosition(orderId: string, fillPrice: number): boolean {
    const idx = positions.findIndex((p) => p.orderId === orderId);
    if (idx === -1) return false;

    const pos = positions[idx] as ForexPosition;
    pos.currentPrice = fillPrice;
    updateUnrealizedPnl(pos);

    // Settle realized PnL to balance.
    balance += pos.unrealizedPnl;
    positions.splice(idx, 1);
    return true;
  }

  function updatePrices(currentPrice: number): void {
    for (const p of positions) {
      p.currentPrice = currentPrice;
      updateUnrealizedPnl(p);
    }
  }

  function chargeFee(amount: number): void {
    balance -= amount;
  }

  function stopOut(currentPrice: number): string[] {
    updatePrices(currentPrice);
    const closedIds: string[] = [];
    // Close all positions at current price, realizing their PnL.
    for (const pos of [...positions]) {
      closePosition(pos.orderId, currentPrice);
      closedIds.push(pos.orderId);
    }
    return closedIds;
  }

  return {
    get balance() { return balance; },
    get positions(): readonly ForexPosition[] { return positions; },
    get marginSummary() { return buildSummary(); },
    openPosition,
    closePosition,
    updatePrices,
    chargeFee,
    stopOut,
  };
}
