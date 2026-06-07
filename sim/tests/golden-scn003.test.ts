/**
 * Golden-replay regression suite — SCN-003 London Open Sweep on ANDU.
 *
 * Tests in this file:
 *   GR-005  SCN-003 clean run         — digest + XP equality, leverage_ack present
 *   GR-006  SCN-003 stopped-out run   — digest + XP equality; stop_honored fires
 *                                       on a losing session (key process invariant)
 *   tamper  mutate one action → digest must differ
 *   determ  two runs in same process → identical digest
 *
 * GR-PATTERN: all assertions are against fixed digest strings committed in
 * fixtures/*.json.  Any engine change that alters tick data, fill prices, or
 * XP emission will break one or more tests.  Regenerate with:
 *   npx vitest run tests/_gen_digests.test.ts
 *
 * Scenario summary (SCENARIOS_V0 §SCN-003):
 *   ANDU (fictional forex major).  07:45–09:45 London open window.
 *   London-open stop-hunt sweep below Asian low 1.2790 → sharp reversal →
 *   trend to 1.2870.  Decision points: A (open), B (sweep), C (reversal), D
 *   (pullback), E (trend high).
 *   Debrief arithmetic: entry at 1.2812, stop at 1.2775 = 37 pip risk. ✓
 *
 * Stopped-out run design:
 *   Player correctly places stop-to-cover BEFORE a short entry at the reversal
 *   zone.  The trend fires the stop (correct process, adverse outcome).
 *   sessionHasWin=false; stop_honored XP earned.  This demonstrates that
 *   process-scoring is outcome-independent.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScenario, type PlayerAction, type HarnessConfig } from "../src/harness/run.js";
import { scn003 } from "../src/scenarios/scn003.js";

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
    scenario: scn003,
    accountEquity: f.accountEquity,
    declaredRiskPct: f.declaredRiskPct,
    actions: f.actions,
    sessionId: `golden-${f.testId}`,
  };
}

// ---------------------------------------------------------------------------
// GR-005: SCN-003 clean run — digest + XP equality
// ---------------------------------------------------------------------------

describe("GR-005: SCN-003 clean run — digest + XP equality", () => {
  const fixture = loadFixture("scn003-clean-run.json");

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

  it("leverage_risk_acknowledged event is present before first order_fill", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const ackIdx = events.findIndex((e) => e.type === "leverage_risk_acknowledged");
    const firstFillIdx = events.findIndex((e) => e.type === "order_fill");
    expect(ackIdx).toBeGreaterThanOrEqual(0);
    expect(firstFillIdx).toBeGreaterThan(ackIdx);
  });

  it("leverage_ack XP metric fires (+10 XP)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const ackXp = result.xpSummary.events.find((e) => e.metricId === "leverage_ack");
    expect(ackXp).toBeDefined();
    expect(ackXp?.xpAmount).toBe(10);
  });

  it("sessionHasWin is true (long entered at reversal, scenario closes above entry)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    expect(result.digest.sessionHasWin).toBe(true);
  });

  it("no reckless_winner_flag (all process metrics passed)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const flagEvents = result.log.entries.filter(
      (e) => e.event.type === "reckless_winner_flag"
    );
    expect(flagEvents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// GR-006: SCN-003 stopped-out run — stop_honored fires on losing session
// ---------------------------------------------------------------------------

describe("GR-006: SCN-003 stopped-out run — process XP earned despite loss", () => {
  const fixture = loadFixture("scn003-stopped-out.json");

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

  it("stop_honored earns XP on a losing session (core process invariant)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const stopXp = result.xpSummary.events.find((e) => e.metricId === "stop_honored");
    expect(
      stopXp,
      "stop_honored must fire even when sessionHasWin=false — process XP is outcome-independent"
    ).toBeDefined();
    expect(stopXp?.xpAmount).toBe(20);
  });

  it("journal XP metrics fire on stopped-out run (journal + exit_journal earned)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const journalXp = result.xpSummary.events.find(
      (e) => e.metricId === "journal_before_trade"
    );
    const exitJournalXp = result.xpSummary.events.find(
      (e) => e.metricId === "exit_journal"
    );
    expect(journalXp).toBeDefined();
    expect(exitJournalXp).toBeDefined();
    expect(journalXp?.xpAmount).toBe(20);
    expect(exitJournalXp?.xpAmount).toBe(15);
  });

  it("sessionHasWin is false (short position, market went up)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    expect(result.digest.sessionHasWin).toBe(false);
  });

  it("no reckless_winner_flag (no win, so flag cannot fire)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const flagEvents = result.log.entries.filter(
      (e) => e.event.type === "reckless_winner_flag"
    );
    expect(flagEvents).toHaveLength(0);
  });

  it("leverage_ack event present before first fill", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const ackIdx = events.findIndex((e) => e.type === "leverage_risk_acknowledged");
    const firstFillIdx = events.findIndex((e) => e.type === "order_fill");
    expect(ackIdx).toBeGreaterThanOrEqual(0);
    expect(firstFillIdx).toBeGreaterThan(ackIdx);
  });
});

// ---------------------------------------------------------------------------
// Tamper test — mutate one action → digest must differ
// ---------------------------------------------------------------------------

describe("GR-005 tamper: mutated action produces different digest", () => {
  it("changing leverage_ack ticksAfter produces a different digest", () => {
    const fixture = loadFixture("scn003-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    // Deep-clone and mutate the leverage_ack action (change ticksAfter from 0 to 1).
    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];

    const ackAction = mutatedActions.find((a) => a.type === "leverage_ack");
    if (ackAction !== undefined) {
      ackAction.ticksAfter = 1;
    }

    const mutatedConfig: HarnessConfig = {
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    };

    const mutatedResult = runScenario(mutatedConfig);
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
  });

  it("changing stop price produces a different digest", () => {
    const fixture = loadFixture("scn003-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];

    const stopAction = mutatedActions.find(
      (a) => a.type === "order_submit" && a.payload.orderType === "stop"
    );
    if (stopAction?.type === "order_submit") {
      stopAction.payload.stopPrice = 1.2780; // change from 1.2775
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
// Determinism tests — same config → same digest, both fixtures
// ---------------------------------------------------------------------------

describe("GR-005/006 determinism: two runs with same config produce identical digest", () => {
  it("SCN-003 clean run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn003-clean-run.json");
    const config = fixtureToConfig(fixture);

    const run1 = runScenario(config);
    const run2 = runScenario(config);

    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });

  it("SCN-003 stopped-out run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn003-stopped-out.json");
    const config = fixtureToConfig(fixture);

    const run1 = runScenario(config);
    const run2 = runScenario(config);

    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });
});
