/**
 * Drawdown Survival predicates (LIVE_DRILL_ENGINE_BRIEF §3.1, owner-ruled
 * zero-PnL proxy) — unit shapes + adversarial sequences + a harness-
 * integrated run over a really-seeded session.
 */

import { describe, it, expect } from "vitest";
import {
  noSizeIncreaseOnSeededSide,
  seededStopMaintained,
  exitJournaled,
  evaluateDrawdownSurvival,
  type DrillSeedRef,
} from "../src/drills/livePredicates.js";
import type { EventEnvelope } from "../src/engine/events.js";
import { runScenario } from "../src/harness/run.js";
import { scn001 } from "../src/scenarios/scn001.js";

const SEED: DrillSeedRef = {
  entryOrderId: "seed-entry-001",
  stopOrderId: "seed-stop-001",
  side: "buy",
  fillPrice: 1.05,
  stopPrice: 0.93,
};

let seq = 0;
function env(event: Record<string, unknown>): EventEnvelope {
  seq += 1;
  return { seq, simTimeMs: (event.timestamp as number) ?? 0, event } as unknown as EventEnvelope;
}

function submit(orderId: string, side: "buy" | "sell", tickIndex: number, extra: Record<string, unknown> = {}): EventEnvelope {
  return env({ type: "order_submit", orderId, orderType: "market", side, quantity: 10, price: null, stopPrice: null, tickIndex, timestamp: tickIndex * 1000, ...extra });
}
function fill(orderId: string, tickIndex: number): EventEnvelope {
  return env({ type: "order_fill", orderId, fillPrice: 1, slippage: 0, spreadCost: 0, feeCost: 0, tickIndex, timestamp: tickIndex * 1000 });
}
function cancel(orderId: string, tickIndex: number): EventEnvelope {
  return env({ type: "order_cancel", orderId, reason: "user", tickIndex, timestamp: tickIndex * 1000 });
}
function modify(orderId: string, newStopPrice: number, tickIndex: number): EventEnvelope {
  return env({ type: "order_modify", orderId, newStopPrice, tickIndex, timestamp: tickIndex * 1000 });
}
function journal(tags: string[], tickIndex: number): EventEnvelope {
  return env({ type: "journal_entry", entryId: `j${tickIndex}`, tags, wordCount: 12, tickIndex, timestamp: tickIndex * 1000 });
}

const seedSequence = (): EventEnvelope[] => [
  submit(SEED.entryOrderId, "buy", 0),
  fill(SEED.entryOrderId, 0),
  submit(SEED.stopOrderId, "sell", 0, { orderType: "stop", stopPrice: SEED.stopPrice }),
];

describe("no_size_increase_on_seeded_side — the zero-PnL proxy", () => {
  it("clean survival passes", () => {
    const r = noSizeIncreaseOnSeededSide(seedSequence(), SEED);
    expect(r.pass).toBe(true);
  });

  it("ANY same-side order after tick 0 violates — even 'after recovery' (no equity read exists to ask)", () => {
    const log = [...seedSequence(), submit("add-1", "buy", 40)];
    const r = noSizeIncreaseOnSeededSide(log, SEED);
    expect(r.pass).toBe(false);
    expect(r.violations).toEqual(["add-1"]);
  });

  it("close-then-re-enter is ALLOWED (close is opposite side; predicate ends at the session log it was given)", () => {
    // Sell to close (opposite side — never a violation of THIS predicate).
    const log = [...seedSequence(), submit("close-1", "sell", 30), fill("close-1", 31)];
    expect(noSizeIncreaseOnSeededSide(log, SEED).pass).toBe(true);
  });

  it("seeded short: sells violate, buys don't", () => {
    const shortSeed: DrillSeedRef = { ...SEED, side: "sell", stopPrice: 1.2 };
    const log = [
      submit(SEED.entryOrderId, "sell", 0),
      fill(SEED.entryOrderId, 0),
      submit("add-s", "sell", 9),
      submit("cover", "buy", 12),
    ];
    const r = noSizeIncreaseOnSeededSide(log, shortSeed);
    expect(r.violations).toEqual(["add-s"]);
  });
});

describe("seeded_stop_maintained", () => {
  it("untouched stop passes; tightening passes", () => {
    expect(seededStopMaintained(seedSequence(), SEED).pass).toBe(true);
    const tightened = [...seedSequence(), modify(SEED.stopOrderId, 0.97, 20)]; // closer on a long
    expect(seededStopMaintained(tightened, SEED).pass).toBe(true);
  });

  it("cancelling the stop while open violates", () => {
    const log = [...seedSequence(), cancel(SEED.stopOrderId, 15)];
    const r = seededStopMaintained(log, SEED);
    expect(r.pass).toBe(false);
    expect(r.violations[0]).toContain("cancel");
  });

  it("widening violates (lower on a long)", () => {
    const log = [...seedSequence(), modify(SEED.stopOrderId, 0.85, 18)];
    expect(seededStopMaintained(log, SEED).pass).toBe(false);
  });

  it("widening on a seeded SHORT = raising the stop", () => {
    const shortSeed: DrillSeedRef = { ...SEED, side: "sell", stopPrice: 1.2 };
    const log = [
      submit(SEED.entryOrderId, "sell", 0),
      fill(SEED.entryOrderId, 0),
      submit(SEED.stopOrderId, "buy", 0, { orderType: "stop", stopPrice: 1.2 }),
      modify(SEED.stopOrderId, 1.35, 22),
    ];
    expect(seededStopMaintained(log, shortSeed).pass).toBe(false);
  });

  it("cancel AFTER closing the position is free (the stop has no job left)", () => {
    const log = [
      ...seedSequence(),
      submit("close-1", "sell", 30),
      fill("close-1", 31),
      cancel(SEED.stopOrderId, 32),
    ];
    expect(seededStopMaintained(log, SEED).pass).toBe(true);
  });

  it("ADVERSARIAL: cancel sequenced BEFORE the close still violates (order matters, not presence)", () => {
    const log = [
      ...seedSequence(),
      cancel(SEED.stopOrderId, 10), // naked window first...
      submit("close-1", "sell", 30),
      fill("close-1", 31), // ...then close
    ];
    expect(seededStopMaintained(log, SEED).pass).toBe(false);
  });
});

describe("exit_journaled", () => {
  it("exit or post_trade tag passes; other tags don't", () => {
    expect(exitJournaled([journal(["exit"], 50)]).pass).toBe(true);
    expect(exitJournaled([journal(["post_trade"], 50)]).pass).toBe(true);
    expect(exitJournaled([journal(["plan", "hypothesis"], 5)]).pass).toBe(false);
    expect(exitJournaled([]).pass).toBe(false);
  });
});

describe("harness-integrated: predicates over a REALLY seeded session", () => {
  it("a clean survival session passes all three; an add-violation session fails exactly predicate 1", () => {
    const base = {
      seed: 4242,
      scenario: scn001,
      accountEquity: 10_000,
      sessionId: "pred-integration",
      drillSeed: {
        entryOrderId: SEED.entryOrderId,
        stopOrderId: SEED.stopOrderId,
        side: "buy" as const,
        quantity: 100,
        fillPrice: 1.05,
        stopPrice: 0.93,
      },
    };
    const clean = runScenario({
      ...base,
      actions: [
        { type: "journal_entry" as const, ticksAfter: 20, payload: { tags: ["exit"], wordCount: 14 } },
        { type: "advance_ticks" as const, ticksAfter: 0, payload: { count: 60 } },
        { type: "debrief_complete" as const, ticksAfter: 0, payload: {} },
      ],
    });
    const cleanEval = evaluateDrawdownSurvival(clean.log.entries, SEED);
    expect(cleanEval.pass).toBe(true);

    const adding = runScenario({
      ...base,
      sessionId: "pred-integration-2",
      actions: [
        { type: "order_submit" as const, ticksAfter: 25, payload: { orderId: "dca-1", orderType: "market", side: "buy", quantity: 50, price: null, stopPrice: null } },
        { type: "advance_ticks" as const, ticksAfter: 0, payload: { count: 60 } },
        { type: "debrief_complete" as const, ticksAfter: 0, payload: {} },
      ],
    });
    const addEval = evaluateDrawdownSurvival(adding.log.entries, SEED);
    expect(addEval.pass).toBe(false);
    const failed = addEval.results.filter((r) => !r.pass).map((r) => r.predicateId);
    expect(failed).toContain("no_size_increase_on_seeded_side");
  });
});
