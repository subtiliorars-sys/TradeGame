/**
 * Golden-replay regression suite — SCN-002 (GR-pattern, TEST_PLAN §1).
 *
 * Each fixture encodes: seed + scenario + scripted PlayerAction list →
 * expected EventLog sha256 digest + expected XP events.
 *
 * Tests in this file:
 *   GR-002  SCN-002 clean run      — digest equality + XP-event equality
 *   GR-004  SCN-002 no-trade run   — digest equality + XP-event equality
 *   tamper  mutate one action → digest must differ
 *   determ  two runs in same process → identical digest
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScenario, type PlayerAction, type HarnessConfig } from "../src/harness/run.js";
import { scn002 } from "../src/scenarios/scn002.js";

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
    scenario: scn002,
    accountEquity: f.accountEquity,
    declaredRiskPct: f.declaredRiskPct,
    actions: f.actions,
    // Stable session ID for reproducible digest.
    sessionId: `golden-${f.testId}`,
  };
}

// ---------------------------------------------------------------------------
// GR-002: SCN-002 clean run
// ---------------------------------------------------------------------------

describe("GR-002: SCN-002 clean run — digest + XP equality", () => {
  const fixture = loadFixture("scn002-clean-run.json");

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

  it("XP total is 175 (spec target)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    expect(result.xpSummary.total).toBe(175);
  });

  it("no reckless_winner_flag on a correctly-processed losing trade", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const flagEvents = result.log.entries.filter(
      (e) => e.event.type === "reckless_winner_flag"
    );
    expect(flagEvents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// GR-004: SCN-002 no-trade run
// ---------------------------------------------------------------------------

describe("GR-004: SCN-002 no-trade run — digest + XP equality", () => {
  const fixture = loadFixture("scn002-no-trade.json");

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

  it("XP total is 70 (spec patience target)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    expect(result.xpSummary.total).toBe(70);
  });

  it("no order_submit events in no-trade run (patience_observation fires)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const orderSubmits = result.log.entries.filter(
      (e) => e.event.type === "order_submit"
    );
    expect(orderSubmits).toHaveLength(0);
  });

  it("trade-execution metrics not applicable on no-trade path (no XP emitted for them)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const xpMetricIds = result.xpSummary.events.map((e) => e.metricId);
    const notApplicableOnPatience = [
      "journal_before_trade",
      "size_compliance",
      "stop_before_entry",
      "stop_honored",
      "no_stop_widen",
    ];
    for (const metricId of notApplicableOnPatience) {
      expect(
        xpMetricIds,
        `'${metricId}' must not emit XP on a no-trade patience run`
      ).not.toContain(metricId);
    }
  });
});

// ---------------------------------------------------------------------------
// Tamper test — mutate one action → digest must differ
// ---------------------------------------------------------------------------

describe("tamper test: mutated action produces different digest (SCN-002)", () => {
  it("changing journal wordCount produces a different digest", () => {
    const fixture = loadFixture("scn002-clean-run.json");

    const originalResult = runScenario(fixtureToConfig(fixture));

    // Deep-clone the actions array and mutate one journal entry's wordCount.
    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];

    // Find the first journal_entry action and change its wordCount.
    const journalAction = mutatedActions.find((a) => a.type === "journal_entry");
    if (journalAction?.type === "journal_entry") {
      journalAction.payload.wordCount += 1;
    }

    const mutatedConfig: HarnessConfig = {
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    };

    const mutatedResult = runScenario(mutatedConfig);
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
  });
});

// ---------------------------------------------------------------------------
// Determinism test — two runs in same process produce identical digest
// ---------------------------------------------------------------------------

describe("determinism: two runs with same config produce identical digest (SCN-002)", () => {
  it("SCN-002 clean run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn002-clean-run.json");
    const config = fixtureToConfig(fixture);

    const run1 = runScenario(config);
    const run2 = runScenario(config);

    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });

  it("SCN-002 no-trade run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn002-no-trade.json");
    const config = fixtureToConfig(fixture);

    const run1 = runScenario(config);
    const run2 = runScenario(config);

    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });
});
