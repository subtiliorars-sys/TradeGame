/**
 * Replay-determinism property tests (Governor wave-C candidate (c)).
 *
 * The engine's core replay guarantee (SIM_ENGINE_SPEC §1.1 / §5): same seed +
 * same scenario + same action script → byte-identical EventLog digest, every
 * run, every scenario. The golden suites assert this per-fixture; this file
 * sweeps the property across ALL registered scenarios × multiple seeds × a
 * generic action script, so a determinism regression in ANY adapter or beat
 * path fails loudly even before a scenario has dedicated golden fixtures.
 */

import { describe, it, expect } from "vitest";
import { runScenario, type PlayerAction, type HarnessConfig } from "../src/harness/run.js";
import { allScenarios } from "../src/scenarios/registry.js";
import { scenarioSeed } from "../src/scenarios/registry.js";

/** Generic process-shaped script valid on every scenario (journal → observe). */
function observeScript(totalTicks: number): PlayerAction[] {
  return [
    { type: "journal_entry", ticksAfter: 0, payload: { tags: ["plan", "observation"], wordCount: 20 } },
    { type: "advance_ticks", ticksAfter: 0, payload: { count: Math.floor(totalTicks / 2) } },
    { type: "journal_entry", ticksAfter: 0, payload: { tags: ["observation"], wordCount: 12 } },
    { type: "advance_ticks", ticksAfter: 0, payload: { count: Math.floor(totalTicks / 2) } },
    { type: "debrief_complete", ticksAfter: 0, payload: {} },
  ];
}

const EXTRA_SEEDS = [1, 0xDEADBEEF];

describe("replay determinism property — every scenario, multiple seeds", () => {
  for (const def of allScenarios()) {
    const id = def.manifest.id;
    const ticks = Math.min(
      600, // cap the sweep cost; full-length determinism is covered by goldens
      Math.floor(def.manifest.durationMs / def.manifest.msPerTick)
    );
    const seeds = [scenarioSeed(id), ...EXTRA_SEEDS];

    for (const seed of seeds) {
      it(`${id} @ seed ${seed}: two runs produce identical digests`, () => {
        const config: HarnessConfig = {
          seed,
          scenario: def,
          accountEquity: 10_000,
          declaredRiskPct: 1,
          actions: observeScript(ticks),
          sessionId: `determinism-${id}-${seed}`,
        };
        const run1 = runScenario(config);
        const run2 = runScenario(config);
        expect(run1.digest.sha256).toBe(run2.digest.sha256);
        expect(run1.xpSummary.total).toBe(run2.xpSummary.total);
      });
    }

    it(`${id}: different seeds produce different digests (PRNG actually drives the stream)`, () => {
      const mk = (seed: number) =>
        runScenario({
          seed,
          scenario: def,
          accountEquity: 10_000,
          declaredRiskPct: 1,
          actions: observeScript(ticks),
          sessionId: `determinism-x-${id}-${seed}`,
        }).digest.sha256;
      expect(mk(1)).not.toBe(mk(2));
    });
  }
});
