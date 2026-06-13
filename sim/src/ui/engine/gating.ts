/**
 * Scenario gating — pure lock-state evaluation for the Main Menu cards.
 *
 * Two kinds of requirement from ScenarioManifest:
 *
 *   HARD LOCKS — `scenario:SCN-00X` prereqs. Checkable today (ProgressStore
 *   tracks completed scenarios), so they enforce: the card is locked with an
 *   explicit reason (§4.5 rule: the gate is explicit, never a silent stall).
 *
 *   ADVISORIES — `minRank` and drill/lesson prereqs. NOT enforced yet, by
 *   design: every scenario (including SCN-001) authors minRank "Trainee",
 *   and the designed XP on-ramp to Trainee is the drill/lesson system, which
 *   has not shipped. Hard-enforcing rank today would softlock a fresh
 *   Observer with zero playable scenarios. Until drills ship, the rank
 *   requirement renders as an explicit advisory on the card; flip it into
 *   the hard-lock set when the drill system lands (GDD §7).
 *
 * Pure function — no Phaser, no store reads; the caller supplies progress.
 */

import type { ScenarioManifest } from "../../scenarios/types.js";
import { CANONICAL_LADDER, type RankThreshold } from "../../engine/rank.js";
import { DRILL_CATALOG } from "../../drills/catalog.js";
import { LIVE_DRILL_CATALOG } from "../../drills/liveCatalog.js";

/** IDs of drills that actually exist (shipped-drills-only flip rule). */
const SHIPPED_DRILL_IDS = new Set([
  ...DRILL_CATALOG.map((d) => d.id),
  ...LIVE_DRILL_CATALOG.map((d) => d.drillId),
]);

export interface ScenarioLockState {
  /** True when the card must not be startable. */
  locked: boolean;
  /** Hard-lock reasons (non-empty iff locked) — player-facing copy. */
  reasons: string[];
  /** Non-blocking requirement notes (rank advisory, drills/lessons). */
  advisories: string[];
}

/** Ladder index for a display label; -1 when unknown. */
function rankIndexOfLabel(label: string, ladder: readonly RankThreshold[]): number {
  return ladder.findIndex((r) => r.displayLabel === label);
}

export function scenarioLockState(
  manifest: ScenarioManifest,
  playerRankId: string,
  completedScenarioIds: readonly string[],
  ladder: readonly RankThreshold[] = CANONICAL_LADDER,
  completedDrillIds: readonly string[] = []
): ScenarioLockState {
  const reasons: string[] = [];
  const advisories: string[] = [];

  // HARD: scenario-completion prereqs ("scenario:SCN-001").
  for (const prereq of manifest.prereqs) {
    if (prereq.startsWith("scenario:")) {
      const neededId = prereq.slice("scenario:".length);
      if (!completedScenarioIds.includes(neededId)) {
        reasons.push(`Complete ${neededId} first`);
      }
    }
    // HARD (drill flip, brief §6): drill prereqs lock once the drill EXISTS
    // in the live catalog — the on-ramp is open at zero state (RISK DRILLS
    // from the menu), so the gate is explicit and immediately satisfiable.
    // Unshipped drill IDs stay advisory (counted below) — never a dead end.
    if (prereq.startsWith("drill:") && SHIPPED_DRILL_IDS.has(prereq)) {
      if (!completedDrillIds.includes(prereq)) {
        reasons.push(`Complete the ${prereqDrillLabel(prereq)} drill first (RISK DRILLS, top of menu)`);
      }
    }
  }

  // ADVISORY: rank requirement (see module header for why not enforced yet).
  const playerIdx = ladder.findIndex((r) => r.rankId === playerRankId);
  const requiredIdx = rankIndexOfLabel(manifest.minRank, ladder);
  if (requiredIdx > -1 && playerIdx > -1 && playerIdx < requiredIdx) {
    advisories.push(`Designed for ${manifest.minRank}+`);
  }

  // ADVISORY: lessons (system not shipped) + any UNSHIPPED drill prereqs.
  const supportCount = manifest.prereqs.filter(
    (p) =>
      p.startsWith("lesson:") ||
      (p.startsWith("drill:") && !SHIPPED_DRILL_IDS.has(p))
  ).length;
  if (supportCount > 0) {
    advisories.push(
      `${supportCount} supporting drill${supportCount === 1 ? "" : "s"}/lesson${supportCount === 1 ? "" : "s"} recommended`
    );
  }

  return { locked: reasons.length > 0, reasons, advisories };
}

/** Short player-facing label for a drill prereq ID. */
function prereqDrillLabel(id: string): string {
  return id
    .replace(/^drill:/, "")
    .replace(/-v\d+$/, "")
    .replace(/-/g, " ");
}
