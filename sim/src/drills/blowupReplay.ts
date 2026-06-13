/**
 * Blowup annotated replay — display-domain only (LIVE_DRILL_ENGINE_BRIEF §3.2).
 * Builds per-order timeline rows for DrillDebriefScene. Output contains
 * process-observable facts only: no dollar amounts, no equity values.
 */

import type { EventEnvelope } from "../engine/events.js";

export interface BlowupReplayRow {
  tickIndex: number;
  /** Human-readable order summary — side + type, no prices or notional. */
  summary: string;
  /** Order notional exceeded account scale at submit (brief §3.2). */
  oversized: boolean;
  /** A protective stop existed within the companion window at fill time. */
  hadStop: boolean;
  /** Same-direction submit while an aging open lot existed. */
  addedToLosers: boolean;
}

/** TUNABLE — mirrors blowupClassifier thresholds (display domain). */
const OVERSIZE_FRACTION = 0.15;
const COMPANION_STOP_TICKS = 2;
const AGING_POSITION_TICKS = 5;

/**
 * Build annotated replay rows from the session EventLog.
 * Percentages and equity are computed internally; only booleans leave.
 */
export function buildBlowupReplayRows(
  log: readonly EventEnvelope[],
  startingEquity: number
): BlowupReplayRow[] {
  const evs = log.map((e) => e.event);
  const rows: BlowupReplayRow[] = [];

  let cash = startingEquity;
  const lots: Array<{ side: "buy" | "sell"; qty: number; price: number; tick: number }> = [];
  const submitsById = new Map<
    string,
    { side: "buy" | "sell"; qty: number; type: string; tick: number }
  >();
  const stopSubmitTicks: number[] = [];
  for (const ev of evs) {
    if (ev.type === "order_submit" && ev.orderType === "stop") {
      stopSubmitTicks.push(ev.tickIndex);
    }
  }
  let lastPrice = 0;

  for (const ev of evs) {
    if (ev.type === "tick") {
      lastPrice = ev.close;
      continue;
    }
    if (ev.type === "order_submit") {
      submitsById.set(ev.orderId, {
        side: ev.side,
        qty: ev.quantity,
        type: ev.orderType,
        tick: ev.tickIndex,
      });
      continue;
    }
    if (ev.type !== "order_fill") continue;

    const sub = submitsById.get(ev.orderId);
    if (sub === undefined || sub.type === "stop") continue;

    const mark = lastPrice > 0 ? lastPrice : ev.fillPrice;
    let equity = cash;
    for (const l of lots) {
      equity += l.side === "buy" ? l.qty * mark : l.qty * (2 * l.price - mark);
    }
    const notional = sub.qty * ev.fillPrice;
    const oversized = equity > 0 && notional / equity > OVERSIZE_FRACTION;

    const hadStop = stopSubmitTicks.some(
      (t) => Math.abs(t - ev.tickIndex) <= COMPANION_STOP_TICKS
    );

    const addedToLosers = lots.some(
      (l) => l.side === sub.side && ev.tickIndex - l.tick > AGING_POSITION_TICKS
    );

    rows.push({
      tickIndex: ev.tickIndex,
      summary: `${sub.side.toUpperCase()} ${sub.type} fill`,
      oversized,
      hadStop,
      addedToLosers,
    });

    const oppositeQty = lots.filter((l) => l.side !== sub.side).reduce((a, l) => a + l.qty, 0);
    if (oppositeQty > 0) {
      reduceLots(lots, sub.side === "buy" ? "sell" : "buy", sub.qty);
    } else {
      lots.push({ side: sub.side, qty: sub.qty, price: ev.fillPrice, tick: ev.tickIndex });
    }
    cash -= sub.side === "buy" ? sub.qty * ev.fillPrice : -(sub.qty * ev.fillPrice);
  }

  return rows;
}

function reduceLots(
  lots: Array<{ side: "buy" | "sell"; qty: number; price: number; tick: number }>,
  side: "buy" | "sell",
  qty: number
): void {
  let remaining = qty;
  for (const l of lots) {
    if (l.side !== side || remaining <= 0) continue;
    const take = Math.min(l.qty, remaining);
    l.qty -= take;
    remaining -= take;
  }
  for (let i = lots.length - 1; i >= 0; i--) {
    if (lots[i]!.qty <= 1e-12) lots.splice(i, 1);
  }
}
