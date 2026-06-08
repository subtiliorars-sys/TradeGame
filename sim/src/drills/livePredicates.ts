/**
 * Live-drill pass predicates — LIVE_DRILL_ENGINE_BRIEF §3.1 under the
 * OWNER RULING (2026-06-08): Drawdown Survival is graded on pure process
 * facts. NO PnL value — not even a binary — may be read here. Every
 * predicate derives from order_submit / order_fill / order_cancel /
 * order_modify / journal_entry events ONLY.
 *
 * The zero-PnL proxy (predicate 1) prohibits ANY same-direction order on
 * the seeded position for the whole session — even if price has recovered.
 * A player who wants to add after recovery closes the original position
 * first (a clean, zero-PnL-observable action). The teaching objective is
 * the habit, not the optimization.
 *
 * Pure functions; no Phaser, no store reads, no account values anywhere.
 */

import type { EventEnvelope } from "../engine/events.js";

export interface DrillSeedRef {
  entryOrderId: string;
  stopOrderId: string;
  /** Seeded position side ("buy" = seeded long). */
  side: "buy" | "sell";
  /** Seeded quantity — close detection is quantity-aware (red-team F2). */
  quantity: number;
  /** Authored seed fill price (for stop-widen direction checks). */
  fillPrice: number;
  /** Authored companion stop price. */
  stopPrice: number;
}

export interface PredicateResult {
  predicateId: string;
  pass: boolean;
  /** Order/journal IDs that caused a violation (empty on pass). */
  violations: string[];
  /** Player-facing one-liner for the drill debrief. */
  summary: string;
}

/** Events helper: unwrap the log entries' event objects. */
type Ev = EventEnvelope["event"];

function events(log: readonly EventEnvelope[]): Ev[] {
  return log.map((e) => e.event);
}

/**
 * Predicate 1 — no_size_increase_on_seeded_side (THE zero-PnL proxy).
 * Any order_submit after tick 0 on the seeded side is a violation,
 * regardless of equity state at that moment (never read).
 */
export function noSizeIncreaseOnSeededSide(
  log: readonly EventEnvelope[],
  seed: DrillSeedRef
): PredicateResult {
  const violations: string[] = [];
  const evs = events(log);
  // Companion-stop exemption (red-team F4): the UI ALWAYS submits a
  // protective stop on the opposite side of any order — closing the seeded
  // long therefore auto-logs a same-side STOP submit. A same-side stop
  // accompanied by an opposite-side submit at the SAME tick is protection
  // for the close, not an add. A same-side stop on its own (a buy-stop
  // add-on-strength) still violates.
  const oppositeTicks = new Set<number>();
  for (const e of evs) {
    if (e.type === "order_submit" && e.side !== seed.side) {
      oppositeTicks.add(e.tickIndex);
    }
  }
  for (const ev of evs) {
    if (
      ev.type === "order_submit" &&
      ev.side === seed.side &&
      // No tick-0 grace (red-team F1: the session is paused-but-live at
      // tick 0) — only the seed's own two authored orders are exempt.
      ev.orderId !== seed.entryOrderId &&
      ev.orderId !== seed.stopOrderId &&
      !(ev.orderType === "stop" && oppositeTicks.has(ev.tickIndex))
    ) {
      violations.push(ev.orderId);
    }
  }
  return {
    predicateId: "no_size_increase_on_seeded_side",
    pass: violations.length === 0,
    violations,
    summary:
      violations.length === 0
        ? "No orders added in the seeded position's direction — the habit held."
        : `Submitted ${violations.length} order${violations.length === 1 ? "" : "s"} in the seeded direction ` +
          "(attempts count — a rejected add is still the decision to add). " +
          "The drill's one rule: never grow a position you're trying to survive. " +
          "Closing, then re-entering later, is always allowed.",
  };
}

/**
 * Predicate 2 — seeded_stop_maintained. The companion stop must not be
 * cancelled, and must not be modified FURTHER from the seeded entry
 * (higher on a long / lower on a short), unless the seeded position was
 * already closed by an opposite-side fill.
 */
export function seededStopMaintained(
  log: readonly EventEnvelope[],
  seed: DrillSeedRef
): PredicateResult {
  const violations: string[] = [];
  const closeSide = seed.side === "buy" ? "sell" : "buy";

  // Quantity-aware close detection (red-team F2: a dust-close — sell 0.001
  // of 18 — must NOT unlock the stop): the position counts as closed only
  // once cumulative opposite-side FILLED quantity covers the seed quantity.
  const closeQtyByOrder = new Map<string, number>();
  const evs = events(log);
  evs.forEach((ev) => {
    if (ev.type === "order_submit" && ev.side === closeSide) {
      closeQtyByOrder.set(ev.orderId, ev.quantity);
    }
  });
  let closedAtIndex = Number.POSITIVE_INFINITY;
  let closedQty = 0;
  evs.forEach((ev, i) => {
    if (ev.type === "order_fill" && closeQtyByOrder.has(ev.orderId) && i < closedAtIndex) {
      closedQty += closeQtyByOrder.get(ev.orderId) ?? 0;
      if (closedQty >= seed.quantity - 1e-9) {
        closedAtIndex = i;
      }
    }
  });

  // Running-best ratchet (red-team F7): widening is judged against the
  // TIGHTEST level the stop has reached, not the authored seed level —
  // tighten 47→52 then "loosen" to 48 is a widen.
  let bestStop = seed.stopPrice;

  evs.forEach((ev, i) => {
    if (i >= closedAtIndex) return; // position fully closed — stop is free
    if (
      ev.type === "order_cancel" &&
      ev.orderId === seed.stopOrderId &&
      ev.reason !== "session_end" // harness auto-cancel at session close —
      // not a player decision (the stop_honored lesson, applied here too)
    ) {
      violations.push(`cancel@tick${ev.tickIndex}`);
    }
    if (ev.type === "order_modify" && ev.orderId === seed.stopOrderId) {
      const moved = ev.newStopPrice;
      if (typeof moved === "number") {
        const widened = seed.side === "buy" ? moved < bestStop : moved > bestStop;
        if (widened) {
          violations.push(`widen@tick${ev.tickIndex}`);
        } else {
          bestStop = moved; // ratchet
        }
      }
    }
  });

  return {
    predicateId: "seeded_stop_maintained",
    pass: violations.length === 0,
    violations,
    summary:
      violations.length === 0
        ? "The protective stop survived the whole session — moved closer or left alone, never widened, never pulled."
        : "The seeded stop was cancelled or widened while the position was open. " +
          "Tightening is always allowed; widening re-opens the exact risk the drill exists to close.",
  };
}

/**
 * Predicate 3 — exit_journaled. At least one journal tagged exit /
 * post_trade exists. Weakest by design (the habit, not the quality —
 * coaching copy handles quality; spec §3.1).
 */
export function exitJournaled(log: readonly EventEnvelope[]): PredicateResult {
  const found = events(log).some(
    (ev) =>
      ev.type === "journal_entry" &&
      ev.tags.some((t: string) => t === "exit" || t === "post_trade")
  );
  return {
    predicateId: "exit_journaled",
    pass: found,
    violations: found ? [] : ["no exit/post_trade journal"],
    summary: found
      ? "Exit reflection journaled."
      : "No exit journal found — one tagged line about why you exited (or held) completes the loop.",
  };
}

/**
 * Predicate 4 — session_engaged (red-team F3: without a floor, journal one
 * word at tick 0 and END SESSION = a 5-second pass). The drawdown must
 * actually be SURVIVED: the session runs to at least the engagement floor
 * (TUNABLE fraction of the authored duration) UNLESS the position was
 * resolved by the protective stop firing (a stop-out IS survival of the
 * process — the stop did its job).
 */
export function sessionEngaged(
  log: readonly EventEnvelope[],
  seed: DrillSeedRef,
  requiredTicks: number
): PredicateResult {
  const evs = events(log);
  let lastTick = 0;
  for (const e of evs) {
    if ("tickIndex" in e && typeof e.tickIndex === "number") {
      lastTick = Math.max(lastTick, e.tickIndex);
    }
  }
  const stopFired = evs.some(
    (e) => e.type === "order_fill" && e.orderId === seed.stopOrderId
  );
  const engaged = stopFired || lastTick >= requiredTicks;
  return {
    predicateId: "session_engaged",
    pass: engaged,
    violations: engaged ? [] : [`ended@tick${lastTick}<${requiredTicks}`],
    summary: engaged
      ? stopFired
        ? "The protective stop resolved the position — that IS the process working."
        : "Session ran its course — the drawdown was actually sat through."
      : "The session ended before the drawdown was lived with. Surviving is " +
        "the drill; the clock is part of it. (Ending early after a full close " +
        "still requires reaching the time floor.)",
  };
}

/** All four Drawdown Survival predicates, evaluated together. */
export function evaluateDrawdownSurvival(
  log: readonly EventEnvelope[],
  seed: DrillSeedRef,
  requiredTicks: number = 240 // TUNABLE — 4 of the authored 6 sim-minutes
): { pass: boolean; results: PredicateResult[] } {
  const results = [
    noSizeIncreaseOnSeededSide(log, seed),
    seededStopMaintained(log, seed),
    exitJournaled(log),
    sessionEngaged(log, seed, requiredTicks),
  ];
  return { pass: results.every((r) => r.pass), results };
}
