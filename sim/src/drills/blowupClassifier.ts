/**
 * Blowup mechanism classifier — "Blow Up on Purpose" debrief support
 * (LIVE_DRILL_ENGINE_BRIEF §3.2, OWNER APPROVED 2026-06-08 WITH HARD
 * CONDITIONS — all four implemented or enforced here):
 *
 *   CONDITION 1 — DISPLAY DOMAIN ONLY. This module exists solely for the
 *   blowup drill's debrief question ("which mechanism was dominant?").
 *   It labels what the player already watched happen. It must never be
 *   called from any pass-predicate, scoring, rank, or progress code path.
 *
 *   CONDITION 2 — ENUM-ONLY OUTPUT. classify() returns a BlowupMechanism
 *   value and nothing else: no dollar figures, no equity values, no
 *   per-order numbers leave this module in any field, log line, or error.
 *
 *   CONDITION 3 — STRUCTURAL IMPORT BAN, lint-enforced. scripts/lint-pnl.sh
 *   fails the build if any scoring-adjacent module imports this file.
 *   (This module is intentionally NOT in lint-pnl's PnL-identifier scan
 *   list: it legitimately reconstructs equity INTERNALLY — the approved
 *   display-domain exception — and the import ban is its containment.)
 *
 *   CONDITION 4 — a dedicated red-team pass on exactly this boundary gates
 *   the PR that ships it.
 *
 * WHY THE EQUITY READ IS LEGAL HERE (owner ruling): the classifier runs
 * only in the debrief, after the player deliberately blew up a sim
 * account and watched it happen. Asking "what did you just see?" requires
 * labeling oversized orders, which requires equity-at-submit. That is
 * categorically different from a pass criterion: no XP, rank, or pass
 * state ever depends on these internals — the bonus XP depends only on
 * whether the player's ANSWER matches the enum.
 */

import type { EventEnvelope } from "../engine/events.js";

export type BlowupMechanism =
  | "oversize" // order notional dominated relative to account scale
  | "no_stop" // entries repeatedly unprotected
  | "add_to_losers" // same-direction additions to aging open positions
  | "combined"; // no single dominant mechanism

/** TUNABLE thresholds (brief §3.2). */
const OVERSIZE_FRACTION = 0.15; // notional/equity above this = oversized
const COMPANION_STOP_TICKS = 2; // a stop within N ticks of a fill = protected
const AGING_POSITION_TICKS = 5; // additions to positions older than this count
const DOMINANCE_RATIO = 1.5; // a count must exceed others ×this to dominate

/**
 * Classify the dominant ruin mechanism from the session's own EventLog.
 * Output is the enum ONLY (condition 2).
 */
export function classifyBlowupMechanism(
  log: readonly EventEnvelope[],
  startingEquity: number
): BlowupMechanism {
  const evs = log.map((e) => e.event);

  // --- Internal state reconstruction (never leaves this function) ---
  let cash = startingEquity;
  // Open position lots: side, quantity, fill price, fill tick.
  const lots: Array<{ side: "buy" | "sell"; qty: number; price: number; tick: number }> = [];
  const submitsById = new Map<
    string,
    { side: "buy" | "sell"; qty: number; type: string; tick: number }
  >();
  // Pre-pass: protection is judged log-WIDE (brief: "no companion stop
  // within N ticks"), not causally — the UI logs the companion stop after
  // the entry's fill, and that still protects it.
  const stopSubmitTicks: number[] = [];
  for (const ev of evs) {
    if (ev.type === "order_submit" && ev.orderType === "stop") {
      stopSubmitTicks.push(ev.tickIndex);
    }
  }
  let lastPrice = 0;

  let oversized = 0;
  let unprotectedFills = 0;
  let addToLosers = 0;

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
      // add_to_losers counter: same side as an aging open lot.
      const aging = lots.some(
        (l) => l.side === ev.side && ev.tickIndex - l.tick > AGING_POSITION_TICKS
      );
      if (aging && ev.orderType !== "stop") {
        addToLosers++;
      }
      continue;
    }
    if (ev.type === "order_fill") {
      const sub = submitsById.get(ev.orderId);
      if (sub === undefined) continue;

      // Equity at this moment (internal only): cash + mark of open lots.
      const mark = lastPrice > 0 ? lastPrice : ev.fillPrice;
      let equity = cash;
      for (const l of lots) {
        equity += l.side === "buy" ? l.qty * mark : l.qty * (2 * l.price - mark);
      }
      const notional = sub.qty * ev.fillPrice;
      if (equity > 0 && notional / equity > OVERSIZE_FRACTION) {
        oversized++;
      }

      // Protection check: a stop submitted within the window of this fill.
      if (sub.type !== "stop") {
        const protectedFill = stopSubmitTicks.some(
          (t) => Math.abs(t - ev.tickIndex) <= COMPANION_STOP_TICKS
        );
        if (!protectedFill) unprotectedFills++;
      }

      // Book the lot (entries) or reduce (opposite side).
      if (sub.type === "stop") {
        // A stop fill closes against opposite lots.
        reduceLots(lots, sub.side === "buy" ? "sell" : "buy", sub.qty);
      } else {
        const oppositeQty = lots
          .filter((l) => l.side !== sub.side)
          .reduce((a, l) => a + l.qty, 0);
        if (oppositeQty > 0) {
          reduceLots(lots, sub.side === "buy" ? "sell" : "buy", sub.qty);
        } else {
          lots.push({ side: sub.side, qty: sub.qty, price: ev.fillPrice, tick: ev.tickIndex });
        }
      }
      cash -= sub.side === "buy" ? sub.qty * ev.fillPrice : -(sub.qty * ev.fillPrice);
    }
  }

  // --- Dominance (enum out; counts stay inside) ---
  const counts: Array<[BlowupMechanism, number]> = [
    ["oversize", oversized],
    ["no_stop", unprotectedFills],
    ["add_to_losers", addToLosers],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  const [first, second] = [counts[0]!, counts[1]!];
  if (first[1] === 0) return "combined"; // nothing measurable — treat as mixed
  if (second[1] === 0 || first[1] / Math.max(1, second[1]) > DOMINANCE_RATIO) {
    return first[0];
  }
  return "combined";
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
