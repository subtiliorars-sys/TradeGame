/**
 * Golden-replay regression suite — SCN-004 The GLIMMER Pool (Impermanent Loss).
 *
 * Tests in this file:
 *   GR-007  SCN-004 clean run    — digest + XP equality; LP-scenario metrics
 *                                  (il_estimate_written, trigger_updated) fire;
 *                                  withdrawal trigger honored without filling
 *   GR-008  SCN-004 observe run  — patience path; deposit metrics inapplicable
 *   tamper  mutate one action → digest must differ
 *   determ  two runs in same process → identical digest
 *
 * GR-PATTERN: all assertions are against fixed digest strings committed in
 * fixtures/*.json.  Regenerate with:
 *   npx vitest run tests/_gen_slice4_digests.test.ts
 *
 * Scenario summary (SCENARIOS_V1 §SCN-004):
 *   GLIMMER/HarborUSD on fictional ArcSwap.  Deposit at 4.20, divergence to
 *   6.85 (+63%, IL ≈ −2.9%), plateau, partial correction to 5.40 where fees
 *   (2.5%) outpace IL (0.8%).  LP deposit is engine-modelled as a GLIMMER
 *   spot position; the withdrawal trigger is a stop order (per spec DP-D,
 *   "equivalent to a stop in process terms").
 *
 * Clean-run design:
 *   Trigger stop 3.90 placed before the deposit, never reached on the
 *   up-divergence path, rides to session end — honored, not abandoned
 *   (the harness's session_end auto-cancel is exempt from stop_honored).
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScenario, type PlayerAction, type HarnessConfig } from "../src/harness/run.js";
import { scn004 } from "../src/scenarios/scn004.js";

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
    scenario: scn004,
    accountEquity: f.accountEquity,
    declaredRiskPct: f.declaredRiskPct,
    actions: f.actions,
    sessionId: `golden-${f.testId}`,
  };
}

// ---------------------------------------------------------------------------
// GR-007: SCN-004 clean run — digest + XP equality
// ---------------------------------------------------------------------------

describe("GR-007: SCN-004 clean run — digest + XP equality", () => {
  const fixture = loadFixture("scn004-clean-run.json");

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

  it("il_estimate_written fires (+25) — LP Panel checkpoint metric", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const xp = result.xpSummary.events.find((e) => e.metricId === "il_estimate_written");
    expect(xp).toBeDefined();
    expect(xp?.xpAmount).toBe(25);
  });

  it("trigger_updated fires (+15) — active management after a hold", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const xp = result.xpSummary.events.find((e) => e.metricId === "trigger_updated");
    expect(xp).toBeDefined();
    expect(xp?.xpAmount).toBe(15);
  });

  it("withdrawal trigger never fills and stop_honored still passes (+20)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const triggerFill = events.find(
      (e) => e.type === "order_fill" && e.orderId === "trigger-004"
    );
    expect(triggerFill, "trigger must not fill on the up-divergence path").toBeUndefined();
    // Cancelled only by the harness at session end — exempt from stop_honored.
    const triggerCancel = events.find(
      (e) => e.type === "order_cancel" && e.orderId === "trigger-004"
    );
    expect(triggerCancel).toBeDefined();
    expect(triggerCancel?.type === "order_cancel" && triggerCancel.reason).toBe("session_end");
    const xp = result.xpSummary.events.find((e) => e.metricId === "stop_honored");
    expect(xp?.xpAmount).toBe(20);
  });

  it("no reckless_winner_flag (sized to rule + trigger placed before deposit)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const flagEvents = result.log.entries.filter(
      (e) => e.event.type === "reckless_winner_flag"
    );
    expect(flagEvents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// GR-008: SCN-004 observation-only run — patience path
// ---------------------------------------------------------------------------

describe("GR-008: SCN-004 observe run — patience path, deposit metrics inert", () => {
  const fixture = loadFixture("scn004-observe.json");

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

  it("patience_observation fires (+80) — observation ceiling equals the trade ceiling (P-8a)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const xp = result.xpSummary.events.find((e) => e.metricId === "patience_observation");
    expect(xp).toBeDefined();
    expect(xp?.xpAmount).toBe(80);
  });

  it("LP metrics are inapplicable without a deposit — no XP, no fail penalty", () => {
    const result = runScenario(fixtureToConfig(fixture));
    for (const metricId of ["il_estimate_written", "trigger_updated", "stop_honored"]) {
      const xp = result.xpSummary.events.find((e) => e.metricId === metricId);
      expect(xp, `${metricId} must not emit XP on an observation-only run`).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Tamper test — mutate one action → digest must differ
// ---------------------------------------------------------------------------

describe("GR-007 tamper: mutated action produces different digest", () => {
  it("changing the deposit quantity produces a different digest", () => {
    const fixture = loadFixture("scn004-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];
    const deposit = mutatedActions.find(
      (a) => a.type === "order_submit" && a.payload.orderType === "market"
    );
    if (deposit?.type === "order_submit") {
      deposit.payload.quantity = 240; // change from 238
    }

    const mutatedResult = runScenario({
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    });
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
  });

  it("dropping the il_estimate journal produces a different digest", () => {
    const fixture = loadFixture("scn004-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    const mutatedActions = (JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[]).map((a) =>
      a.type === "journal_entry" && a.payload.tags.includes("il_estimate")
        ? { ...a, payload: { ...a.payload, tags: ["observation"] } }
        : a
    );

    const mutatedResult = runScenario({
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    });
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
    const xp = mutatedResult.xpSummary.events.find(
      (e) => e.metricId === "il_estimate_written"
    );
    expect(xp, "il_estimate_written must not fire without the tagged journal").toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Determinism tests — same config → same digest, both fixtures
// ---------------------------------------------------------------------------

describe("GR-007/008 determinism: two runs with same config produce identical digest", () => {
  it("SCN-004 clean run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn004-clean-run.json");
    const config = fixtureToConfig(fixture);
    const run1 = runScenario(config);
    const run2 = runScenario(config);
    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });

  it("SCN-004 observe run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn004-observe.json");
    const config = fixtureToConfig(fixture);
    const run1 = runScenario(config);
    const run2 = runScenario(config);
    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });
});
