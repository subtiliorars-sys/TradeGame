/**
 * Golden-replay regression suite — SCN-006 The Employment Report on ANDU.
 *
 * Tests in this file:
 *   GR-011  SCN-006 clean run (option B) — digest + XP equality; News Policy
 *           Card metrics (policy_declared_card + policy_match); spread blowout
 *           visible at T0; the 100-pip stop survives spike AND whipsaw
 *   GR-012  SCN-006 option-C run — no-trade-zone policy is a complete policy:
 *           patience + policy metrics + no_entry_window all fire
 *   tamper  mutate one action → digest must differ
 *   determ  two runs in same process → identical digest
 *
 * GR-PATTERN: all assertions are against fixed digest strings committed in
 * fixtures/*.json.  Regenerate with:
 *   npx vitest run tests/_gen_slice4_digests.test.ts
 *
 * Scenario summary (SCENARIOS_V1 §SCN-006):
 *   Fictional Monthly Labor Conditions Report on ANDU.  Spike +75 pips at T0
 *   with spread blowout to 14 pips, whipsaw to 1.3185 (−130 from the spike),
 *   then a trend to 1.3290.  Core mechanic: the News Policy Card (A/B/C) —
 *   all three options are valid process; the debrief grades declaration and
 *   adherence, never direction.
 *
 * Clean-run design (the spec's own option-B callout):
 *   Stop at 1.3140 — 100 pips below the pre-report price — sized at ~1%
 *   notional.  The authored beat schedule guarantees the whipsaw low (1.3185)
 *   stays above the stop, so holding through the report with correct sizing
 *   survives the event.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runScenario, type PlayerAction, type HarnessConfig } from "../src/harness/run.js";
import { scn006 } from "../src/scenarios/scn006.js";

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
    scenario: scn006,
    accountEquity: f.accountEquity,
    declaredRiskPct: f.declaredRiskPct,
    actions: f.actions,
    sessionId: `golden-${f.testId}`,
  };
}

// SCN-006 timing constants (mirrors scn006.ts).
const T0_MS = 1_200_000;
const T_FREEZE_MS = 1_140_000;       // T-01 policy deadline
const WHIPSAW_END_MS = T0_MS + 45_000;
const PIP = 0.0001;

// ---------------------------------------------------------------------------
// GR-011: SCN-006 clean run (option B) — digest + XP equality
// ---------------------------------------------------------------------------

describe("GR-011: SCN-006 clean run (option B) — digest + XP equality", () => {
  const fixture = loadFixture("scn006-clean-run.json");

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

  it("policy_declared_card fires (+30) — declaration logged before T-01", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const declaration = events.find((e) => e.type === "policy_declared");
    expect(declaration).toBeDefined();
    if (declaration?.type === "policy_declared") {
      expect(declaration.timestamp).toBeLessThanOrEqual(T_FREEZE_MS);
      expect(declaration.option).toBe("B_hold_with_stop");
    }
    const xp = result.xpSummary.events.find((e) => e.metricId === "policy_declared_card");
    expect(xp?.xpAmount).toBe(30);
  });

  it("policy_match fires (+25) — held with a pre-set stop, as declared", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const xp = result.xpSummary.events.find((e) => e.metricId === "policy_match");
    expect(xp?.xpAmount).toBe(25);
  });

  it("spread blowout visible at T0 (14 pips on the release tick)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const releaseTick = result.log.entries
      .map((e) => e.event)
      .find((e) => e.type === "tick" && e.timestamp === T0_MS);
    expect(releaseTick).toBeDefined();
    if (releaseTick?.type === "tick") {
      expect(releaseTick.spread).toBeCloseTo(14 * PIP, 6);
    }
  });

  it("the 100-pip stop survives spike and whipsaw (spec survival property)", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const stopFill = events.find(
      (e) => e.type === "order_fill" && e.orderId === "stop-006"
    );
    expect(
      stopFill,
      "a stop 100 pips below pre-report must survive the authored event"
    ).toBeUndefined();
    // Whipsaw floor: no tick low may reach the 1.3140 stop level.
    const minLow = Math.min(
      ...events.filter((e) => e.type === "tick").map((e) => (e.type === "tick" ? e.low : Infinity))
    );
    expect(minLow).toBeGreaterThan(1.314);
    // stop_honored XP confirms the stop was never cancelled by the player.
    const xp = result.xpSummary.events.find((e) => e.metricId === "stop_honored");
    expect(xp?.xpAmount).toBe(20);
  });

  it("no_entry_window fires (+15) — no orders during the whipsaw", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const events = result.log.entries.map((e) => e.event);
    const submitsInWindow = events.filter(
      (e) =>
        e.type === "order_submit" &&
        e.timestamp >= T0_MS &&
        e.timestamp <= WHIPSAW_END_MS
    );
    expect(submitsInWindow).toHaveLength(0);
    const xp = result.xpSummary.events.find((e) => e.metricId === "no_entry_window");
    expect(xp?.xpAmount).toBe(15);
  });

  it("no reckless_winner_flag and no policy mismatch", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const flagEvents = result.log.entries.filter(
      (e) => e.event.type === "reckless_winner_flag"
    );
    expect(flagEvents).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// GR-012: SCN-006 option-C run — the no-trade-zone is a complete policy
// ---------------------------------------------------------------------------

describe("GR-012: SCN-006 option-C run — full XP without a single trade", () => {
  const fixture = loadFixture("scn006-option-c.json");

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

  it("option C earns the policy metrics AND patience — not a consolation prize", () => {
    const result = runScenario(fixtureToConfig(fixture));
    const byId = (id: string) =>
      result.xpSummary.events.find((e) => e.metricId === id);
    expect(byId("policy_declared_card")?.xpAmount).toBe(30);
    expect(byId("policy_match")?.xpAmount).toBe(25);
    expect(byId("patience_observation")?.xpAmount).toBe(135); // equal-ceiling P-8a (incl. leverage_ack)
    expect(byId("no_entry_window")?.xpAmount).toBe(15);
  });

  it("trade metrics are inapplicable — no XP, no fail penalty", () => {
    const result = runScenario(fixtureToConfig(fixture));
    for (const metricId of ["size_compliance", "stop_before_entry", "stop_honored", "exit_journal"]) {
      const xp = result.xpSummary.events.find((e) => e.metricId === metricId);
      expect(xp, `${metricId} must not emit XP on an option-C run`).toBeUndefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Tamper tests — mutate one action → digest must differ
// ---------------------------------------------------------------------------

describe("GR-011 tamper: mutated action produces different digest", () => {
  it("changing the declared policy option produces a different digest", () => {
    const fixture = loadFixture("scn006-clean-run.json");
    const originalResult = runScenario(fixtureToConfig(fixture));

    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];
    const card = mutatedActions.find((a) => a.type === "policy_declare");
    if (card?.type === "policy_declare") {
      card.payload.option = "A_flat";
    }

    const mutatedResult = runScenario({
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    });
    expect(mutatedResult.digest.sha256).not.toBe(originalResult.digest.sha256);
  });

  it("declaring after the deadline kills policy_declared_card", () => {
    const fixture = loadFixture("scn006-clean-run.json");
    const mutatedActions: PlayerAction[] = JSON.parse(
      JSON.stringify(fixture.actions)
    ) as PlayerAction[];
    // Push the card declaration past T-01 (tick 180 → tick 235 > deadline 228).
    const card = mutatedActions.find((a) => a.type === "policy_declare");
    if (card !== undefined) {
      card.ticksAfter = 134; // was 79 → declaration tick 235 (ts 1,175,000 > 1,140,000)
    }

    const mutatedResult = runScenario({
      ...fixtureToConfig(fixture),
      actions: mutatedActions,
    });
    const cardXp = mutatedResult.xpSummary.events.find(
      (e) => e.metricId === "policy_declared_card"
    );
    expect(
      cardXp,
      "policy_declared_card must not fire when the declaration misses the T-01 deadline"
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Determinism tests — same config → same digest, both fixtures
// ---------------------------------------------------------------------------

describe("GR-011/012 determinism: two runs with same config produce identical digest", () => {
  it("SCN-006 clean run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn006-clean-run.json");
    const config = fixtureToConfig(fixture);
    const run1 = runScenario(config);
    const run2 = runScenario(config);
    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });

  it("SCN-006 option-C run: run1.digest === run2.digest", () => {
    const fixture = loadFixture("scn006-option-c.json");
    const config = fixtureToConfig(fixture);
    const run1 = runScenario(config);
    const run2 = runScenario(config);
    expect(run1.digest.sha256).toBe(run2.digest.sha256);
  });
});
