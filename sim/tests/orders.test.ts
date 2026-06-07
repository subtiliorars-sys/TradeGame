/**
 * Order model tests — TEST_PLAN §3 (OM-*, FX-*, SL-*, SH-*).
 *
 * Covers per TEST_PLAN §3:
 *   OM-001  market fill with slippage + fee asserted
 *   OM-002  market sell fill
 *   OM-003  limit buy fills only at/after limit price
 *   OM-004  limit never reached → cancel at session end
 *   OM-005  stop sell fills on trigger tick
 *   OM-006  stop sell gap-through fills at next tick price (F-02 lesson mechanic)
 *   OM-007/008 stop-limit deferred → reject with "stop_limit_deferred"
 *   OM-009  crypto maker fee on limit fill
 *   OM-010  crypto taker fee on market fill
 *   OM-011  forex spread-only (feeCost = 0, spreadCost > 0)
 *   OM-012  order rejected — insufficient balance
 *   SL-001  slippage > 0 and spreadCost > 0 on market/stop fills
 *   SL-002  high-volatility slippage > base slippage
 *   SL-004  maker vs taker fee rates
 *   FX-001  order rejected before leverage ack
 *   FX-002  order proceeds after leverage ack
 *   FX-003  margin required calculation
 *   FX-004  margin-call warning emitted when margin_level ≤ 100%
 *   FX-005  stop-out closes all positions when margin_level ≤ 50%
 *   SH-002  stocks out-of-session market order rejected
 *   SH-004  stocks out-of-session limit order queues (pending)
 *   pip-value  $1.00 per mini lot assertion
 *   X-B02  liquidation walk: $500, 50:1, 2 mini lots → margin $400, pips-to-stop-out 125
 */

import { describe, it, expect } from "vitest";
import { createOrderBook, computeMarketFillCosts, computeLimitFillCosts } from "../src/orders/book.js";
import type { OrderParams } from "../src/orders/book.js";
import {
  createForexMarginAccount,
  createCryptoSpotAccount,
  pipValue,
  LOT_UNITS,
  PIP_SIZE,
  MARGIN_CALL_LEVEL,
  STOP_OUT_LEVEL,
} from "../src/orders/account.js";
import { computeForexRisk } from "../src/orders/risk.js";
import type { TickEvent } from "../src/engine/events.js";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTick(
  tickIndex: number,
  close: number,
  spread = 0.0002,
  overrides: Partial<TickEvent> = {}
): TickEvent {
  return {
    type: "tick",
    tickIndex,
    timestamp: tickIndex * 1000,
    open: close - 0.001,
    high: close + 0.002,
    low: close - 0.002,
    close,
    volume: 1000,
    spread,
    ...overrides,
  };
}

function baseParams(overrides: Partial<OrderParams> = {}): OrderParams {
  return {
    orderId: "order-001",
    orderType: "market",
    side: "buy",
    quantity: 100,
    price: null,
    stopPrice: null,
    marketType: "crypto",
    currentSigma: 0.008,
    baseSigma: 0.008,
    accountEquity: 100_000,
    leverageAckReceived: false,
    sessionOpen: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// OM-001 / OM-002: Market fill with slippage + fee asserted
// ---------------------------------------------------------------------------

describe("OM-001: market buy — slippage + fee", () => {
  it("fill price = close + spread + slippage; feeCost > 0; slippage > 0", () => {
    const book = createOrderBook();
    const tick = makeTick(1, 1.0000, 0.0002);

    // sigma ratio = 1.0 → volatilityMultiplier = 1.0; position 100 * ~1.0 = $100 of $100k = 0.1% < 5%
    book.submitOrder(baseParams({ orderId: "o1" }), 0, 0);
    const events = book.processOrdersOnTick(tick);

    expect(events).toHaveLength(1);
    const ev = events[0];
    expect(ev?.type).toBe("fill");
    const fill = ev?.fill;
    expect(fill).toBeDefined();
    expect(fill?.slippage).toBeGreaterThan(0);
    expect(fill?.spreadCost).toBeGreaterThan(0);
    expect(fill?.feeCost).toBeGreaterThan(0);
    // buy: fillPrice = close + spread + slippage
    const expected = 1.0000 + 0.0002 + fill!.slippage;
    expect(fill?.fillPrice).toBeCloseTo(expected, 8);
  });
});

describe("OM-002: market sell fill", () => {
  it("fill price = close - spread - slippage", () => {
    const book = createOrderBook();
    const tick = makeTick(1, 1.0000, 0.0002);

    book.submitOrder(baseParams({ orderId: "o2", side: "sell" }), 0, 0);
    const events = book.processOrdersOnTick(tick);

    const fill = events[0]?.fill;
    expect(fill).toBeDefined();
    const expected = 1.0000 - 0.0002 - fill!.slippage;
    expect(fill?.fillPrice).toBeCloseTo(expected, 8);
  });
});

// ---------------------------------------------------------------------------
// OM-003: Limit buy fills only at/after limit price
// ---------------------------------------------------------------------------

describe("OM-003: limit buy — fills at limit price", () => {
  it("no fill when price above limit; fills when low touches limit", () => {
    const book = createOrderBook();
    // Limit buy at 100.
    book.submitOrder(
      baseParams({
        orderId: "lim-01",
        orderType: "limit",
        price: 100,
        stopPrice: null,
        accountEquity: 100_000,
      }),
      0,
      0
    );

    // Tick 1: close=102, low=101 — doesn't touch limit 100
    let events = book.processOrdersOnTick(
      makeTick(1, 102, 0.0002, { low: 101 })
    );
    expect(events).toHaveLength(0);

    // Tick 2: close=100, low=99.9 — low ≤ 100 → triggers
    events = book.processOrdersOnTick(
      makeTick(2, 100, 0.0002, { low: 99.9 })
    );
    expect(events).toHaveLength(1);
    const fill = events[0]?.fill;
    // Limit fill price = limit price exactly
    expect(fill?.fillPrice).toBe(100);
    expect(fill?.slippage).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// OM-004: Limit buy never reached → cancel at session end
// ---------------------------------------------------------------------------

describe("OM-004: limit never reached → session-end cancel", () => {
  it("order_cancel emitted with reason session_end", () => {
    const book = createOrderBook();
    book.submitOrder(
      baseParams({
        orderId: "lim-02",
        orderType: "limit",
        price: 95,
        accountEquity: 100_000,
      }),
      0,
      0
    );

    // Ticks 102, 101, 100 — limit 95 never touched
    book.processOrdersOnTick(makeTick(1, 102, 0.0002, { low: 101 }));
    book.processOrdersOnTick(makeTick(2, 101, 0.0002, { low: 100 }));
    book.processOrdersOnTick(makeTick(3, 100, 0.0002, { low: 99.5 }));

    const cancels = book.cancelSession(4, 4000);
    expect(cancels).toHaveLength(1);
    expect(cancels[0]?.cancel?.reason).toBe("session_end");
    expect(cancels[0]?.cancel?.orderId).toBe("lim-02");
  });
});

// ---------------------------------------------------------------------------
// OM-005: Stop sell (long exit) fills on trigger tick
// ---------------------------------------------------------------------------

describe("OM-005: stop sell fills on trigger tick", () => {
  it("fills when low touches stop price", () => {
    const book = createOrderBook();
    book.submitOrder(
      baseParams({
        orderId: "stop-01",
        orderType: "stop",
        side: "sell",
        stopPrice: 98,
        accountEquity: 100_000,
      }),
      0,
      0
    );

    // Tick: close=98.5, low=97.9 — low ≤ 98 → triggers
    const events = book.processOrdersOnTick(
      makeTick(3, 98, 0.0002, { low: 97.9 })
    );
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("fill");
    expect(events[0]?.fill?.fillPrice).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// OM-006: Stop sell — gap through (F-02 lesson mechanic)
// ---------------------------------------------------------------------------

describe("OM-006: stop gap-through fills at gap price, not stop price", () => {
  it("fillPrice ≠ stopPrice when price gaps below stop", () => {
    const book = createOrderBook();
    book.submitOrder(
      baseParams({
        orderId: "stop-gap",
        orderType: "stop",
        side: "sell",
        stopPrice: 98,
        accountEquity: 100_000,
      }),
      0,
      0
    );

    // Tick: close=95, low=94.5 — gap through 98
    const tick = makeTick(2, 95, 0.0002, { low: 94.5 });
    const events = book.processOrdersOnTick(tick);

    expect(events).toHaveLength(1);
    const fill = events[0]?.fill;
    expect(fill).toBeDefined();
    // Fill price is derived from tick.close (the gap price) ± spread/slippage,
    // NOT the stop price of 98.
    expect(fill!.fillPrice).toBeLessThan(98);
    // Specifically: sell fill = close - spread - slippage ≈ 95 - ...
    expect(fill!.fillPrice).toBeCloseTo(95 - tick.spread - fill!.slippage, 5);
  });
});

// ---------------------------------------------------------------------------
// OM-007 / OM-008: Stop-limit deferred
// ---------------------------------------------------------------------------

describe("OM-007/008: stop-limit deferred — returns reject", () => {
  it("stop_limit submit returns reject with reason stop_limit_deferred", () => {
    const book = createOrderBook();
    const result = book.submitOrder(
      baseParams({
        orderId: "sl-01",
        orderType: "stop_limit",
        stopPrice: 98,
        price: 97,
      }),
      0,
      0
    );
    expect(result.type).toBe("reject");
    expect(result.rejectReason).toBe("stop_limit_deferred");
    expect(book.pendingCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// OM-009 / OM-010: Crypto fee rates (maker vs taker)
// ---------------------------------------------------------------------------

describe("SL-004: crypto fee rates", () => {
  it("OM-010: taker fee (market) = 0.15% of fill value", () => {
    const tick = makeTick(1, 100, 0.0002);
    const quantity = 1;
    const costs = computeMarketFillCosts(
      "buy", quantity, tick, "crypto",
      0.008, 0.008, 100_000, "taker"
    );
    // feeCost = quantity × fillPrice × 0.0015
    expect(costs.feeCost).toBeCloseTo(quantity * costs.fillPrice * 0.0015, 8);
  });

  it("OM-009: maker fee (limit) = 0.10% of fill value", () => {
    const tick = makeTick(1, 100, 0.0002);
    const quantity = 1;
    const costs = computeLimitFillCosts("buy", quantity, 100, tick, "crypto");
    // feeCost = quantity × limitPrice × 0.001
    expect(costs.feeCost).toBeCloseTo(quantity * 100 * 0.001, 8);
  });
});

// ---------------------------------------------------------------------------
// OM-011: Forex — spread-only cost, feeCost = 0
// ---------------------------------------------------------------------------

describe("OM-011: forex spread-only fee", () => {
  it("feeCost = 0; spreadCost > 0", () => {
    const tick = makeTick(1, 1.3000, 0.00012); // ~1.2 pips at 1.3
    const costs = computeMarketFillCosts(
      "buy", 10_000, tick, "forex",
      0.0015, 0.0015, 50_000, "taker"
    );
    expect(costs.feeCost).toBe(0);
    expect(costs.spreadCost).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// OM-012: Order rejected — insufficient balance
// ---------------------------------------------------------------------------

describe("OM-012: order rejected — insufficient balance", () => {
  it("returns reject with reason insufficient_balance", () => {
    const book = createOrderBook();
    // quantity × price > accountEquity
    const result = book.submitOrder(
      baseParams({
        orderId: "rej-01",
        orderType: "market",
        side: "buy",
        quantity: 1000,
        price: 200,         // approxPrice = 200 (price field used)
        accountEquity: 100, // 1000 × 200 = 200,000 > 100
      }),
      0,
      0
    );
    expect(result.type).toBe("reject");
    expect(result.rejectReason).toBe("insufficient_balance");
  });
});

// ---------------------------------------------------------------------------
// SL-001: slippage > 0 and spreadCost > 0 on market/stop fills
// ---------------------------------------------------------------------------

describe("SL-001: slippage and spreadCost present on market fills", () => {
  it("market fill has slippage > 0 and spreadCost > 0", () => {
    const book = createOrderBook();
    book.submitOrder(baseParams({ orderId: "sl-001" }), 0, 0);
    const events = book.processOrdersOnTick(makeTick(1, 100, 0.001));
    const fill = events[0]?.fill;
    expect(fill?.slippage).toBeGreaterThan(0);
    expect(fill?.spreadCost).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// SL-002: High-volatility slippage > base slippage
// ---------------------------------------------------------------------------

describe("SL-002: high-volatility slippage exceeds base slippage", () => {
  it("slippage at 3× sigma > slippage at 1× sigma", () => {
    const tick = makeTick(1, 100, 0.001);
    const baseSlippageCosts = computeMarketFillCosts(
      "buy", 1, tick, "crypto",
      0.008, 0.008, 100_000, "taker"
    );
    const highVolCosts = computeMarketFillCosts(
      "buy", 1, tick, "crypto",
      0.024, 0.008, 100_000, "taker" // 3× sigma
    );
    expect(highVolCosts.slippage).toBeGreaterThan(baseSlippageCosts.slippage);
  });
});

// ---------------------------------------------------------------------------
// FX-001: Forex order rejected before leverage ack
// ---------------------------------------------------------------------------

describe("FX-001: forex order rejected before leverage ack", () => {
  it("returns reject with reason leverage_ack_required", () => {
    const book = createOrderBook();
    const result = book.submitOrder(
      baseParams({
        orderId: "fx-01",
        marketType: "forex",
        leverageAckReceived: false,
        stopPrice: 1.28,       // supply a price so balance check passes
        quantity: 1000,
        accountEquity: 100_000,
      }),
      0,
      0
    );
    expect(result.type).toBe("reject");
    expect(result.rejectReason).toBe("leverage_ack_required");
  });
});

// ---------------------------------------------------------------------------
// FX-002: Forex order proceeds after leverage ack
// ---------------------------------------------------------------------------

describe("FX-002: forex order proceeds after leverage ack", () => {
  it("order accepted and fills on tick", () => {
    const book = createOrderBook();
    const submitResult = book.submitOrder(
      baseParams({
        orderId: "fx-02",
        marketType: "forex",
        leverageAckReceived: true,
        quantity: 1000,
        accountEquity: 100_000,
      }),
      0,
      0
    );
    expect(submitResult.type).toBe("fill"); // "fill" = accepted (not yet filled, no error)

    const tick = makeTick(1, 1.3000, 0.00012);
    const events = book.processOrdersOnTick(tick);
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("fill");
    expect(events[0]?.fill).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// FX-003: Margin required calculation
// ---------------------------------------------------------------------------

describe("FX-003: margin required calculation", () => {
  it("1 standard lot ANDU at 1.2812, leverage 30:1 → $4270.67 ± 0.01", () => {
    const risk = computeForexRisk({
      balance: 100_000,
      existingUsedMargin: 0,
      lotUnits: LOT_UNITS.standard,
      lots: 1,
      currentPrice: 1.2812,
      leverage: 30,
      existingUnrealizedPnl: 0,
    });
    // (100,000 × 1.2812) / 30 = 4270.6667
    expect(risk.requiredMargin).toBeCloseTo(4270.67, 1);
  });
});

// ---------------------------------------------------------------------------
// FX-004: Margin-call warning
// ---------------------------------------------------------------------------

describe("FX-004: margin-call warning at margin_level ≤ 100%", () => {
  it("marginSummary.isMarginCallWarning = true when equity falls to used_margin", () => {
    // Open a position where free_margin is very tight.
    const account = createForexMarginAccount(500);
    // 2 mini lots at 1.0000, leverage 50:1 → margin = 20,000 × 1.0 / 50 = $400
    const opened = account.openPosition("pos-mc", "buy", 20_000, 1.0000, 50);
    expect(opened).toBe(true);

    // Initially: equity = $500, margin = $400, level = 1.25 > 1.0 → no warning
    expect(account.marginSummary.isMarginCallWarning).toBe(false);

    // Simulate price falling to cause equity ≤ used_margin ($400).
    // At 1.0000 entry, equity falls by pip_value × pips.
    // pip_value for 20,000 units = $2.00/pip.
    // equity = $500 + unrealized_pnl. Margin call at equity = $400 → pnl = -$100 → -50 pips.
    // Set price to 1.0000 - (50 pips × 0.0001) = 0.9950
    account.updatePrices(0.9950);

    // equity ≈ $500 - $100 = $400 → margin_level = $400/$400 = 1.0 → warning
    expect(account.marginSummary.isMarginCallWarning).toBe(true);
    expect(account.marginSummary.marginLevel).toBeCloseTo(MARGIN_CALL_LEVEL, 2);
  });
});

// ---------------------------------------------------------------------------
// FX-005: Stop-out auto-closes all positions
// ---------------------------------------------------------------------------

describe("FX-005: stop-out closes all positions at margin_level ≤ 50%", () => {
  it("stopOut() called when isStopOut = true, returns closed position IDs", () => {
    const account = createForexMarginAccount(500);
    account.openPosition("pos-so", "buy", 20_000, 1.0000, 50);
    // margin = $400. stop-out at margin_level = 0.5 → equity = $200 → pnl = -$300 → -150 pips
    account.updatePrices(1.0000 - 150 * PIP_SIZE);

    expect(account.marginSummary.isStopOut).toBe(true);
    const closed = account.stopOut(1.0000 - 150 * PIP_SIZE);
    expect(closed).toContain("pos-so");
    expect(account.positions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// SH-002: Stocks session closed — market order rejected
// ---------------------------------------------------------------------------

describe("SH-002: stocks out-of-session market order rejected", () => {
  it("returns reject with reason session_closed", () => {
    const book = createOrderBook();
    const result = book.submitOrder(
      baseParams({
        orderId: "sh-002",
        marketType: "stocks",
        sessionOpen: false,
        orderType: "market",
      }),
      0,
      0
    );
    expect(result.type).toBe("reject");
    expect(result.rejectReason).toBe("session_closed");
  });
});

// ---------------------------------------------------------------------------
// SH-004: Stocks out-of-session limit order queues to open
// ---------------------------------------------------------------------------

describe("SH-004: stocks out-of-session limit order queues", () => {
  it("limit order placed out-of-session is accepted (pending) and fills at session open", () => {
    const book = createOrderBook();
    const submitResult = book.submitOrder(
      baseParams({
        orderId: "sh-004",
        marketType: "stocks",
        sessionOpen: false,   // out of session
        orderType: "limit",
        price: 50,
        accountEquity: 100_000,
      }),
      0,
      0
    );
    // Accepted (queued) — not rejected.
    expect(submitResult.type).not.toBe("reject");
    expect(book.pendingCount).toBe(1);

    // Session opens; price dips to 49.9 → limit triggers
    const tick = makeTick(90, 50, 0.01, { low: 49.8 });
    const events = book.processOrdersOnTick(tick);
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("fill");
    expect(events[0]?.fill?.fillPrice).toBe(50); // limit price
  });
});

// ---------------------------------------------------------------------------
// Pip-value convention: $1.00 per mini lot
// ---------------------------------------------------------------------------

describe("pip-value convention", () => {
  it("mini lot (10,000 units) → pip value = $1.00", () => {
    expect(pipValue(LOT_UNITS.mini)).toBeCloseTo(1.00, 8);
  });

  it("standard lot (100,000 units) → pip value = $10.00", () => {
    expect(pipValue(LOT_UNITS.standard)).toBeCloseTo(10.00, 8);
  });

  it("micro lot (1,000 units) → pip value = $0.10", () => {
    expect(pipValue(LOT_UNITS.micro)).toBeCloseTo(0.10, 8);
  });
});

// ---------------------------------------------------------------------------
// X-B02 liquidation walk
//   $500 balance, 50:1 leverage, 2 mini lots (20,000 units)
//   price = 1.0000
//   margin_required = (20,000 × 1.0000) / 50 = $400
//   pip_value = 0.0001 × 20,000 = $2.00/pip
//   stop-out (at 50% of balance = $250) → loss = $250 → 125 pips
// ---------------------------------------------------------------------------

describe("X-B02: liquidation walk", () => {
  it("margin_required = $400 for 2 mini lots at 50:1", () => {
    const risk = computeForexRisk({
      balance: 500,
      existingUsedMargin: 0,
      lotUnits: LOT_UNITS.mini,
      lots: 2,
      currentPrice: 1.0000,
      leverage: 50,
      existingUnrealizedPnl: 0,
    });
    expect(risk.requiredMargin).toBeCloseTo(400, 4);
  });

  it("pip_value = $2.00 for 2 mini lots", () => {
    const pv = pipValue(2 * LOT_UNITS.mini);
    expect(pv).toBeCloseTo(2.00, 8);
  });

  it("pips-to-stop-out = 125 pips (50% balance threshold)", () => {
    // balance=$500, existing margin=0, equity=$500 (no open PnL yet).
    // equityAtSo = 0.50 × $500 = $250 → loss = $250 → 250/$2 = 125 pips.
    const risk = computeForexRisk({
      balance: 500,
      existingUsedMargin: 0,
      lotUnits: LOT_UNITS.mini,
      lots: 2,
      currentPrice: 1.0000,
      leverage: 50,
      existingUnrealizedPnl: 0,
      stopOutBalancePct: 0.5,
    });
    expect(risk.pipsToStopOut).toBeCloseTo(125, 1);
  });

  it("forex account stop-out fires at correct price (150 pips down at equity-based threshold)", () => {
    // The live account uses equity/used_margin ratio (STOP_OUT_LEVEL = 0.5).
    // equity_at_so = used_margin × 0.5 = $400 × 0.5 = $200 → loss = $300 → 150 pips.
    const account = createForexMarginAccount(500);
    account.openPosition("xb02", "buy", 20_000, 1.0000, 50);

    // 149 pips below entry → not yet stopped out
    account.updatePrices(1.0000 - 149 * PIP_SIZE);
    expect(account.marginSummary.isStopOut).toBe(false);

    // 150 pips below entry → equity = $500 - 150 × $2 = $500 - $300 = $200
    // margin_level = $200 / $400 = 0.5 → stop-out fires
    account.updatePrices(1.0000 - 150 * PIP_SIZE);
    expect(account.marginSummary.isStopOut).toBe(true);

    const summary = account.marginSummary;
    expect(summary.marginLevel).toBeCloseTo(STOP_OUT_LEVEL, 2);
  });
});
