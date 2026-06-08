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
  sessionEngaged,
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
  quantity: 10,
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
      submit("close-1", "sell", 30), // helper qty 10 = full seed quantity
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
  it("a clean survival session passes all four; an add-violation session fails exactly predicate 1", () => {
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
    // scn001's tick budget differs from the drill micro-scenarios — the
    // floor is authored per drill at the call site; pass one fitting this run.
    const cleanEval = evaluateDrawdownSurvival(clean.log.entries, SEED, 60);
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
    const addEval = evaluateDrawdownSurvival(adding.log.entries, SEED, 60);
    expect(addEval.pass).toBe(false);
    const failed = addEval.results.filter((r) => !r.pass).map((r) => r.predicateId);
    expect(failed).toContain("no_size_increase_on_seeded_side");
  });
});

// ---------------------------------------------------------------------------
// Economy red-team regressions (the four bypass probes, made permanent)
// ---------------------------------------------------------------------------

describe("red-team regressions — the predicate set as paymaster", () => {
  it("P1: tick-0 double-down VIOLATES (no tick-0 grace; only the seed's own orders exempt)", () => {
    const log = [
      ...seedSequence(),
      submit("t0-add", "buy", 0), // paused-but-live session, add at tick 0
    ];
    const r = noSizeIncreaseOnSeededSide(log, SEED);
    expect(r.pass).toBe(false);
    expect(r.violations).toEqual(["t0-add"]);
  });

  it("P2: dust-close does NOT unlock the stop (close detection is quantity-aware)", () => {
    const log = [
      ...seedSequence(),
      env({ type: "order_submit", orderId: "dust", orderType: "market", side: "sell", quantity: 0.001, price: null, stopPrice: null, tickIndex: 20, timestamp: 20_000 }),
      fill("dust", 21),
      cancel(SEED.stopOrderId, 25), // 9.999 units still ride — must violate
    ];
    expect(seededStopMaintained(log, SEED).pass).toBe(false);
  });

  it("P10: the 5-second farm fails session_engaged (journal + instant end < floor)", () => {
    const log = [
      ...seedSequence(),
      journal(["exit"], 0),
      env({ type: "session_end", tickIndex: 1, timestamp: 1000 }),
    ];
    const r = sessionEngaged(log, SEED, 240);
    expect(r.pass).toBe(false);
  });

  it("P10b: a stop-out resolves engagement early (the stop doing its job IS the process)", () => {
    const log = [
      ...seedSequence(),
      fill(SEED.stopOrderId, 90), // stop fired at tick 90 < 240
    ];
    expect(sessionEngaged(log, SEED, 240).pass).toBe(true);
  });

  it("P3: closing via the UI's auto-companion-stop pattern does NOT false-fail predicate 1", () => {
    // The UI submits the protective stop (same side as seed) at the SAME
    // tick as the opposite-side close — the companion exemption.
    const log = [
      ...seedSequence(),
      env({ type: "order_submit", orderId: "close-stop", orderType: "stop", side: "buy", quantity: 10, price: null, stopPrice: 1.10, tickIndex: 40, timestamp: 40_000 }),
      env({ type: "order_submit", orderId: "close-mkt", orderType: "market", side: "sell", quantity: 10, price: null, stopPrice: null, tickIndex: 40, timestamp: 40_000 }),
      fill("close-mkt", 41),
    ];
    expect(noSizeIncreaseOnSeededSide(log, SEED).pass).toBe(true);
  });

  it("P3b: a same-side stop WITHOUT a same-tick close still violates (add-on-strength)", () => {
    const log = [
      ...seedSequence(),
      env({ type: "order_submit", orderId: "buy-stop-add", orderType: "stop", side: "buy", quantity: 10, price: null, stopPrice: 1.20, tickIndex: 50, timestamp: 50_000 }),
    ];
    expect(noSizeIncreaseOnSeededSide(log, SEED).pass).toBe(false);
  });

  it("P7: widen ratchets against the TIGHTEST level reached, not the seed level", () => {
    const log = [
      ...seedSequence(),
      modify(SEED.stopOrderId, 0.99, 20), // tighten 0.93 → 0.99
      modify(SEED.stopOrderId, 0.95, 30), // "still above seed" — but a widen vs 0.99
    ];
    expect(seededStopMaintained(log, SEED).pass).toBe(false);
  });
});

describe("F5 regression: the seed stop is REAL in the book on every market", () => {
  it("forex drill seed no longer silently loses its stop (would now throw on reject)", async () => {
    const { LIVE_DRILL_CATALOG } = await import("../src/drills/liveCatalog.js");
    const fx = LIVE_DRILL_CATALOG.find((d) => d.market === "forex")!;
    // Constructing the run is the assertion — a rejected seed stop throws.
    const result = runScenario({
      seed: 9,
      scenario: fx.scenario,
      accountEquity: 10_000,
      actions: [{ type: "debrief_complete", ticksAfter: 10, payload: {} }],
      sessionId: "f5-regression",
      drillSeed: { ...fx.seed },
    });
    const stopSubmitLogged = result.log.entries.some(
      (e) => e.event.type === "order_submit" && e.event.orderId === fx.seed.stopOrderId
    );
    expect(stopSubmitLogged).toBe(true);
  });
});
