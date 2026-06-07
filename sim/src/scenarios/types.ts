/**
 * Scenario manifest types — shared schema for V0 and V1 scenarios.
 *
 * Every authored scenario expresses the same manifest so the harness,
 * loader, and future scenario-browser UI all have a uniform contract.
 *
 * ScenarioManifest: identity + content metadata (no tick data).
 * ScenarioDef: manifest + the ScenarioScript (beat schedule) for the sim.
 *
 * Instruments must come from FICTIONAL_CANON.md (closed registry).
 * Difficulty tiers, prerequisite IDs, and debrief IDs are opaque strings
 * here; runtime validation happens at scenario-load time in the engine.
 */

import type { ScenarioScript } from "../data/feed.js";

// ---------------------------------------------------------------------------
// Player decision point descriptor (authoring metadata, not sim mechanics)
// ---------------------------------------------------------------------------

export interface DecisionPointDescriptor {
  /** Canonical ID referenced in ScenarioBeatEvents and coaching annotations. */
  id: string;
  /** Human-readable label shown in debrief sidebar. */
  label: string;
  /** Sim-time (ms from session start) at which this decision point is surfaced. */
  simTimeMs: number;
}

// ---------------------------------------------------------------------------
// XP rubric entry (mirrors SCENARIOS_V0 scoring tables)
// ---------------------------------------------------------------------------

export interface XpRubricEntry {
  /** MetricId from scoring.ts — the engine metric this row corresponds to. */
  metricId: string;
  /** XP awarded on pass. Must match xpOnPass in the metric extractor. */
  xpOnPass: number;
  /** Plain-language label for the debrief screen. */
  label: string;
}

// ---------------------------------------------------------------------------
// Scenario manifest — identity + authoring metadata
// ---------------------------------------------------------------------------

export interface ScenarioManifest {
  /** Canonical scenario ID, e.g. "SCN-001". */
  id: string;
  /** Display title (no buy/sell directives — see RISK_REGISTER §20). */
  title: string;
  /** Market type drives adapter selection. */
  market: "crypto" | "stocks" | "forex";
  /**
   * Fictional instrument from FICTIONAL_CANON.md.
   * Format: { symbol, displayName } — both from canon.
   */
  instrument: {
    symbol: string;
    displayName: string;
  };
  /** Sim duration in milliseconds at 1x compression. */
  durationMs: number;
  /** Ticks-per-ms (= 1 / msPerTick). Supplied for harness config. */
  msPerTick: number;
  /** Starting price for the adapter. */
  startPrice: number;
  /**
   * Prerequisite drill/lesson IDs that must be completed before this
   * scenario unlocks. Checked at scenario-select time, not here.
   */
  prereqs: string[];
  /** Minimum rank required to play — labels from the §4.5 ladder. */
  minRank:
    | "Observer"
    | "Trainee"
    | "Practitioner"
    | "Journeyman"
    | "Strategist"
    | "Senior Strategist";
  /** Difficulty classification. */
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  /** Decision point descriptors — used by the harness to emit DecisionPointEvents. */
  decisionPoints: DecisionPointDescriptor[];
  /** XP rubric — authoritative table shown in the debrief screen. */
  xpRubric: XpRubricEntry[];
  /**
   * Coaching text for the reckless-winner flag, authored per scenario.
   * Loaded from the manifest so each scenario can tailor the message.
   */
  recklessWinnerCoachingText: string;
  /**
   * Debrief metadata IDs — references to authored debrief content blocks
   * (stored outside the sim engine; looked up at debrief-render time).
   */
  debriefContentIds: string[];
  /**
   * Scenario-authored no-entry windows (sim-ms), scored by the
   * no_entry_window metric — e.g. SCN-005's first 15 minutes of D1 open,
   * SCN-006's whipsaw window.  Omit when the scenario has none.
   */
  noEntryWindows?: Array<{ startMs: number; endMs: number; label: string }>;
  /**
   * Deadline (sim-ms) for the News Policy Card declaration, scored by
   * policy_declared_card (SCN-006: T-01).  Omit when no card is used.
   */
  policyDeadlineMs?: number;
  /**
   * Compressed sim-day length in ms for multi-session scenarios (stocks).
   * The stocks adapter scales its session-phase boundaries proportionally
   * (SCN-005: 72-minute sim days so five sessions stay playable).
   * Omit for the default 24h sim day.
   */
  simDayMs?: number;
  /**
   * Show the LP Position Panel (SCENARIOS_V1 SCN-004 core mechanic): pool
   * value / HODL baseline / fees earned / net-vs-HODL, computed from
   * engine/amm.ts against the deposit fill. Display surface only — never a
   * scoring input. Omit on non-LP scenarios.
   */
  showLpPanel?: boolean;
  /**
   * Pre-authored replay annotations for Screen 6's annotation lane
   * (annotationType "scenario_authored" per SIM_ENGINE_SPEC §5.3 / SG-06):
   * vetted at authoring time, observational tone only — no buy/sell
   * directives, no price targets (§5.3 content rule). Omit when none.
   */
  replayAnnotations?: Array<{ simTimeMs: number; text: string }>;
}

// ---------------------------------------------------------------------------
// ScenarioDef — manifest + beat schedule
// ---------------------------------------------------------------------------

/**
 * Full scenario definition: everything the harness and engine need.
 * Scenarios export one ScenarioDef as their default export.
 */
export interface ScenarioDef {
  manifest: ScenarioManifest;
  /** Beat schedule driving the sim adapter. */
  script: ScenarioScript;
}
