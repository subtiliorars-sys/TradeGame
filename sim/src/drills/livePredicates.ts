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
  for (const ev of events(log)) {
    if (
      ev.type === "order_submit" &&
      ev.tickIndex > 0 &&
      ev.side === seed.side &&
      ev.orderId !== seed.entryOrderId
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
        : `Submitted ${violations.length} order${violations.length === 1 ? "" : "s"} in the seeded direction. ` +
          "The drill's one rule: never grow a position you're trying to survive. " +
          "To re-enter after closing, close first — that sequence is always allowed.",
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

  // Opposite-side order IDs (potential closes), then their fills in order.
  const closeOrderIds = new Set<string>();
  let closedAtIndex = Number.POSITIVE_INFINITY;
  const evs = events(log);
  evs.forEach((ev) => {
    if (ev.type === "order_submit" && ev.side === closeSide) {
      closeOrderIds.add(ev.orderId);
    }
  });
  evs.forEach((ev, i) => {
    if (ev.type === "order_fill" && closeOrderIds.has(ev.orderId) && i < closedAtIndex) {
      closedAtIndex = i;
    }
  });

  evs.forEach((ev, i) => {
    if (i >= closedAtIndex) return; // position already closed — stop is free
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
        const widened =
          seed.side === "buy" ? moved < seed.stopPrice : moved > seed.stopPrice;
        if (widened) {
          violations.push(`widen@tick${ev.tickIndex}`);
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

/** All three Drawdown Survival predicates, evaluated together. */
export function evaluateDrawdownSurvival(
  log: readonly EventEnvelope[],
  seed: DrillSeedRef
): { pass: boolean; results: PredicateResult[] } {
  const results = [
    noSizeIncreaseOnSeededSide(log, seed),
    seededStopMaintained(log, seed),
    exitJournaled(log),
  ];
  return { pass: results.every((r) => r.pass), results };
}
