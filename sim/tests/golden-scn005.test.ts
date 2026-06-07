/**
 * Golden-replay regression suite — SCN-005 NMX 100 Index Inclusion Day.
 *
 * Tests in this file:
 *   GR-009  SCN-005 clean run    — digest + XP equality; no_entry_window fires;
 *                                  multi-session position persistence; the D5
 *                                  closing-auction print and volume spike
 *   GR-010  SCN-005 observe run  — patience + driver-labeling path
 *   tamper  mutate one action → digest must differ
 *   determ  two runs in same process → identical digest
 *
 * GR-PATTERN: all assertions are against fixed digest strings committed in
 * fixtures/*.json.  Regenerate with:
 *   npx vitest run tests/_gen_slice4_digests.test.ts
 *
 * Scenario summary (SCENARIOS_V1 §SCN-005):
 *   VLDI announced as an NMX 100 addition.  Eight compressed 72-minute sim
 *   days (manifest.simDayMs): context day, D1 announcement gap ($33.80),
 *   run to $36.50 (D3), D5 closing-auction print $37.80, post-inclusion fade
 *   to $34.60.  First multi-session scenario — the engine holds position
 *   state across session boundaries.
 *
 * Clean-run design:
 *   Driver-labeled plan at tick 0; no trade in the first 15 minutes of the
 *   D1 open (no_entry_window); D2 entry (3 shares ≈ 1% notional) with stop
 *   at $33.80 placed first; exit before the D5 auction at ~$37.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScenario, type PlayerAction, type HarnessConfig } from "../src/harness/run.js";
import { scn005 } from "../src/scenarios/scn005.js";

// ---------------------------------------------------------------------------
// Fixture loading
// ---------------------------------------------------------------------------

const __dir = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dir, "../fixtures");

interface ExpectedXpEvent {
  metricId: string;
  xpAmount: number;
}

interface GoldenFixture {
  fixtureVersion: "1";
  testId: string;
  scenarioId: string | null;
  seed: number;
  accountEquity: number;
  declaredRiskPct: number;
  actions: PlayerAction[];
  expectedLogDigest: string;
  expectedXpEvents: ExpectedXpEvent[];
  notes: string;
}

function loadFixture(filename: string): GoldenFixture {
  const raw = readFileSync(resolve(FIXTURES_DIR, filename), "utf-8");
  return JSON.parse(raw) as GoldenFixture;
}

function fixtureToConfig(f: GoldenFixture): HarnessConfig {
  return {
    seed: f.seed,
    scenario: scn005,
    accountEquity: f.accountEquity,
    declaredRiskPct: f.declaredRiskPct,
    actions: f.actions,
    sessionId: `golden-${f.testId}`,
  };
}

// SCN-005 timing constants (mirrors scn005.ts).
const DAY_MS = 4_320_000;
const D1_OPEN_MS = 1 * DAY_MS + 270_000;
const D1_NO_ENTRY_END_MS = D1_OPEN_MS + 45_000;
const D5_AUCTION_START_MS = 5 * DAY_MS + 1_410_000;
const D5_AUCTION_END_MS = 5 * DAY_MS + 1_440_000;

// ---------------------------------------------------------------------------
// GR-009: SCN-005 clean run — digest + XP equality
// ---------------------------------------------------------------------------

describe("GR-009: SCN-005 clean run — digest + XP equality", () => {
  const fixture = loadFixture("scn005-clean-run.json");

  it("digest matches golden", () => {
    const result = runScenario(fixtureToConfig(fixture));
    expect(result.digest.sha256).toBe(fixture.expectedLogDigest);
  });

  it("XP events match golden", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const actual = result.xpSummary.events.map((e) => ({
      metricId: e.metricId,
      xpAmount: e.xpAmount,
    }));
    for (const expected of fixture.expectedXpEvents) {
      const found = actual.find((a) => a.metricId === expected.metricId);
      expect(
        found,
        `XP event for metric '${expected.metricId}' not found in actual XP events`
      ).toBeDefined();
      expect(found?.xpAmount).toBe(expected.xpAmount);
    }
  });

  it("no_entry_window fires (+15) — no order in the D1-open window, rule pre-stated", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const submitsInWindow = events.filter(
      (e) =>
        e.type === "order_submit" &&
        e.timestamp >= D1_OPEN_MS &&
        e.timestamp <= D1_NO_ENTRY_END_MS
    );
    expect(submitsInWindow).toHaveLength(0);
    const xp = result.xpSummary.events.find((e) => e.metricId === "no_entry_window");
    expect(xp).toBeDefined();
    expect(xp?.xpAmount).toBe(15);
  });

  it("position persists across session boundaries (entry D2, exit D5)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const entryFill = events.find(
      (e) => e.type === "order_fill" && e.orderId === "entry-005"
    );
    const exitFill = events.find(
      (e) => e.type === "order_fill" && e.orderId === "exit-005"
    );
    expect(entryFill).toBeDefined();
    expect(exitFill).toBeDefined();
    if (entryFill?.type === "order_fill" && exitFill?.type === "order_fill") {
      // Entry on day 2, exit on day 5 — three session boundaries apart.
      expect(Math.floor(entryFill.timestamp / DAY_MS)).toBe(2);
      expect(Math.floor(exitFill.timestamp / DAY_MS)).toBe(5);
    }
  });

  it("D5 closing auction: print ≈ $37.80 with a volume spike", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const ticks = result.log.entries
      .map((e) => e.event)
      .filter((e) => e.type === "tick");
    const auctionTicks = ticks.filter(
      (t) =>
        t.type === "tick" &&
        t.timestamp >= D5_AUCTION_START_MS &&
        t.timestamp < D5_AUCTION_END_MS
    );
    expect(auctionTicks.length).toBeGreaterThan(0);
    const firstAuction = auctionTicks[0];
    expect(firstAuction).toBeDefined();
    if (firstAuction?.type === "tick") {
      // Pinned $37.20 × auction bump 1.016 = $37.795 ≈ spec's $37.80 print.
      expect(firstAuction.close).toBeGreaterThan(37.7);
      expect(firstAuction.close).toBeLessThan(37.9);
      // Volume spike: 10× multiplier dominates the regular-tick range.
      const priorRegular = ticks.filter(
        (t) =>
          t.type === "tick" &&
          t.timestamp >= D5_AUCTION_START_MS - 600_000 &&
          t.timestamp < D5_AUCTION_START_MS
      );
      const maxPrior = Math.max(
        ...priorRegular.map((t) => (t.type === "tick" ? t.volume : 0))
      );
      expect(firstAuction.volume).toBeGreaterThan(maxPrior * 2);
    }
  });

  it("stop never triggers across the five-session hold (stale-stop guard)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const stopFill = result.log.entries
      .map((e) => e.event)
      .find((e) => e.type === "order_fill" && e.orderId === "stop-005");
    expect(stopFill, "the $33.80 stop must never be reachable on the authored path").toBeUndefined();
  });

  it("no reckless_winner_flag (driver labeled, sized, stopped)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const flagEvents = result.log.entries.filter(
      (e) => e.event.type === "reckless_winner_flag"
    );
    expect(flagEvents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// GR-010: SCN-005 observe run — patience + driver labeling
// ---------------------------------------------------------------------------

describe("GR-010: SCN-005 observe run — patience path", () => {
  const fixture = loadFixture("scn005-observe.json");

  it("digest matches golden", () => {
    const result = runScenario(fixtureToConfig(fixture));
    expect(result.digest.sha256).toBe(fixture.expectedLogDigest);
  });

  it("XP events match golden", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const actual = result.xpSummary.events.map((e) => ({
      metricId: e.metricId,
      xpAmount: e.xpAmount,
    }));
    for (const expected of fixture.expectedXpEvents) {
      const found = actual.find((a) => a.metricId === expected.metricId);
      expect(
        found,
        `XP event for metric '${expected.metricId}' not found in actual XP events`
      ).toBeDefined();
      expect(found?.xpAmount).toBe(expected.xpAmount);
    }
  });

  it("patience_observation (+125, equal-ceiling P-8a) and no_entry_window (+15) both fire without trades", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const patience = result.xpSummary.events.find(
      (e) => e.metricId === "patience_observation"
    );
    const window = result.xpSummary.events.find(
      (e) => e.metricId === "no_entry_window"
    );
    expect(patience?.xpAmount).toBe(125);
    expect(window?.xpAmount).toBe(15);
  });

  it("trade metrics are inapplicable — no XP, no fail penalty", () => {
    const result = runScenario(fixtureToConfig(fixture));
    for (const metricId of ["size_compliance", "stop_before_entry", "stop_honored", "exit_journal"]) {
      const xp = result.xpSummary.events.find((e) => e.metricId === metricId);
      expect(xp, `${metricId} must not emit XP on an observation-only run`).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Tamper test — mutate one action → digest must differ
// ---------------------------------------------------------------------------

describe("GR-009 tamper: mutated action produces different digest", () => {
  it("moving the entry into the no-entry window changes digest and kills the window XP", () => {
    const fixture = loadFixture("scn005-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];
    // Move the stop+entry from tick 633 (D2) to tick 307 (inside the D1 window).
    const stopAction = mutatedActions.find(
      (a) => a.type === "order_submit" && a.payload.orderType === "stop"
    );
    if (stopAction !== undefined) {
      stopAction.ticksAfter = 307;
    }

    const mutatedResult = runScenario({
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    });
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
    const windowXp = mutatedResult.xpSummary.events.find(
      (e) => e.metricId === "no_entry_window"
    );
    expect(
      windowXp,
      "no_entry_window must not fire when an order lands inside the window"
    ).toBeUndefined();
  });

  it("changing the stop price produces a different digest", () => {
    const fixture = loadFixture("scn005-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];
    const stopAction = mutatedActions.find(
      (a) => a.type === "order_submit" && a.payload.orderType === "stop"
    );
    if (stopAction?.type === "order_submit") {
      stopAction.payload.stopPrice = 34.0; // change from 33.80
    }

    const mutatedResult = runScenario({
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    });
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
  });
});

// ---------------------------------------------------------------------------
// Determinism tests — same config → same digest, both fixtures
// ---------------------------------------------------------------------------

describe("GR-009/010 determinism: two runs with same config produce identical digest", () => {
  it("SCN-005 clean run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn005-clean-run.json");
    const config = fixtureToConfig(fixture);
    const run1 = runScenario(config);
    const run2 = runScenario(config);
    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });

  it("SCN-005 observe run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn005-observe.json");
    const config = fixtureToConfig(fixture);
    const run1 = runScenario(config);
    const run2 = runScenario(config);
    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });
});
