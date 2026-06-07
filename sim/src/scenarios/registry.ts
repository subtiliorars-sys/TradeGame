/**
 * Scenario registry — id → ScenarioDef lookup.
 *
 * The canonical source of truth for which scenario defs are loaded and playable.
 * MenuScene derives its card metadata from this registry; TradingScene pulls the
 * def at scene-start time using the scenarioId passed from MenuScene.
 *
 * Adding a new scenario: export it and add an entry here.
 */

import type { ScenarioDef } from "./types.js";
import { scn001 } from "./scn001.js";
import { scn002 } from "./scn002.js";
import { scn003 } from "./scn003.js";
import { scn004 } from "./scn004.js";
import { scn005 } from "./scn005.js";
import { scn006 } from "./scn006.js";

const _registry: Record<string, ScenarioDef> = {
  "SCN-001": scn001,
  "SCN-002": scn002,
  "SCN-003": scn003,
  "SCN-004": scn004,
  "SCN-005": scn005,
  "SCN-006": scn006,
};

/**
 * Canonical per-scenario UI play seeds — the single source of truth.
 *
 * These are the seeds used for live UI sessions (shown on the menu cards for
 * determinism transparency, and surfaced in DebriefData for "Replay scenario").
 * Golden-fixture seeds are separate (stored per-fixture in tests/fixtures/).
 */
const CANONICAL_SEEDS: Record<string, number> = {
  "SCN-001": 42_001,
  "SCN-002": 42_002,
  "SCN-003": 42_003,
  "SCN-004": 42_004,
  "SCN-005": 42_005,
  "SCN-006": 42_006,
};

/**
 * Canonical UI play seed for a scenario ID. Falls back to the SCN-001 seed
 * for unknown IDs (defensive — callers should pass registered IDs).
 */
export function scenarioSeed(id: string): number {
  return CANONICAL_SEEDS[id] ?? 42_001;
}

/**
 * Look up a ScenarioDef by its canonical ID (e.g. "SCN-001").
 * Returns undefined if the ID is not registered.
 */
export function getScenario(id: string): ScenarioDef | undefined {
  return _registry[id];
}

/**
 * All registered scenario IDs in insertion order.
 */
export function allScenarioIds(): string[] {
  return Object.keys(_registry);
}

/**
 * All registered ScenarioDefs in insertion order.
 */
export function allScenarios(): ScenarioDef[] {
  return Object.values(_registry);
}
