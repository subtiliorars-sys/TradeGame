/**
 * ProgressStore — in-memory XP and drill-completion store.
 *
 * IN-MEMORY ONLY this pass. Tier B (GOVERNANCE.md) gates any real storage.
 * No localStorage, no server writes, no persistence across page reloads.
 *
 * This singleton accumulates process XP from session debriefs and tracks
 * completed drill IDs. It feeds RankService.currentRank() so the Main Menu
 * rank display reflects progress across sessions within a single browser session.
 *
 * ETHICS RAIL: store holds process XP and drill completions only.
 * Trade outcomes must never be written here (SIM_ENGINE_SPEC §4.4).
 */

import { currentRank, type RankThreshold } from "./rank.js";

// ---------------------------------------------------------------------------
// Module-private state
// ---------------------------------------------------------------------------

let _xpTotal = 0;
const _completedDrillIds = new Set<string>();
const _bonusAwardedDrillIds = new Set<string>();
const _completedScenarioIds = new Set<string>();
const _completedLessonIds = new Set<string>();
let _lastRankUp: { from: RankThreshold; to: RankThreshold } | null = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Add process XP to the running total.
 * Silently clamps/ignores negative or non-finite inputs.
 *
 * Records a rank-up marker when the addition crosses a rank threshold —
 * DebriefScene reads it via lastRankUp() to show the one-time congratulation
 * card (SIM_ENGINE_SPEC §4.5: names process behaviors, never outcomes).
 */
export function addXp(n: number): void {
  if (!Number.isFinite(n) || n < 0) return;
  const before = currentRank(_xpTotal, completedDrillIds()).rank;
  _xpTotal += n;
  const after = currentRank(_xpTotal, completedDrillIds()).rank;
  if (after.rankId !== before.rankId) {
    _lastRankUp = { from: before, to: after };
  }
}

/**
 * The rank-up produced by the most recent addXp() that crossed a threshold,
 * or null. Consumed (cleared) by clearRankUp() once the UI has shown the
 * congratulation card — one-time, dismissible per §4.5.
 */
export function lastRankUp(): { from: RankThreshold; to: RankThreshold } | null {
  return _lastRankUp;
}

/** Clear the rank-up marker after the UI has displayed it. */
export function clearRankUp(): void {
  _lastRankUp = null;
}

/** Returns the current cumulative process XP total. */
export function xpTotal(): number {
  return _xpTotal;
}

/**
 * Returns the IDs of all drills completed this browser session.
 * Returns [] until the drill system ships (GDD §7).
 */
export function completedDrillIds(): string[] {
  return Array.from(_completedDrillIds);
}

/**
 * Mark a drill as completed. No-op if already marked.
 * Called by the drill runner when a player passes a drill (GDD §7).
 */
export function markDrillCompleted(id: string): void {
  _completedDrillIds.add(id);
}

/**
 * Complete a drill AND award its XP atomically, with rank-change detection
 * spanning BOTH mutations (red-team F1: when the DRILL gate — not the XP —
 * crosses a rank threshold, marking the drill before addXp() made addXp's
 * own before-snapshot already include the new drill, so the §4.5 rank-up
 * marker never fired on the primary on-ramp path).
 */
export function completeDrill(id: string, xp: number): void {
  const already = _completedDrillIds.has(id);
  const before = currentRank(_xpTotal, completedDrillIds()).rank;
  _completedDrillIds.add(id);
  if (!already && Number.isFinite(xp) && xp > 0) {
    _xpTotal += xp;
  }
  const after = currentRank(_xpTotal, completedDrillIds()).rank;
  if (after.rankId !== before.rankId) {
    _lastRankUp = { from: before, to: after };
  }
}

/**
 * Award bonus XP for a drill without re-calling completeDrill (LIVE_DRILL
 * §4.2 blowup mechanism bonus). Idempotent per drill ID — second call pays 0.
 */
export function awardBonus(id: string, xp: number): number {
  if (_bonusAwardedDrillIds.has(id) || !Number.isFinite(xp) || xp <= 0) {
    return 0;
  }
  _bonusAwardedDrillIds.add(id);
  addXp(xp);
  return xp;
}

/**
 * Complete a lesson AND award its XP atomically (mirrors completeDrill —
 * same rank-change detection across both mutations; once-per-lesson is
 * enforced by the caller checking completedLessonIds first).
 */
export function completeLesson(id: string, xp: number): void {
  const already = _completedLessonIds.has(id);
  const before = currentRank(_xpTotal, completedDrillIds()).rank;
  _completedLessonIds.add(id);
  if (!already && Number.isFinite(xp) && xp > 0) {
    _xpTotal += xp;
  }
  const after = currentRank(_xpTotal, completedDrillIds()).rank;
  if (after.rankId !== before.rankId) {
    _lastRankUp = { from: before, to: after };
  }
}

/** IDs of lessons completed this browser session. */
export function completedLessonIds(): string[] {
  return Array.from(_completedLessonIds);
}

/** Metric IDs that may pay XP on scenario replays (first-clear rule). */
const REPLAY_AWARD_METRICS = new Set<string>(["session_reviewed"]);

/**
 * Award debrief XP for a scenario — first clear pays the full rubric total;
 * replays pay only replay-specific metrics (e.g. session_reviewed +10).
 * Always marks the scenario completed (idempotent).
 */
export function awardScenarioDebriefXp(
  scenarioId: string,
  xpTotal: number,
  rubricRows: ReadonlyArray<{ metricId: string; xpEarned: number }>,
): number {
  const firstClear = !_completedScenarioIds.has(scenarioId);
  let granted = 0;
  if (firstClear) {
    granted = xpTotal;
    if (granted > 0) addXp(granted);
  } else {
    granted = rubricRows
      .filter((r) => REPLAY_AWARD_METRICS.has(r.metricId))
      .reduce((sum, r) => sum + r.xpEarned, 0);
    if (granted > 0) addXp(granted);
  }
  _completedScenarioIds.add(scenarioId);
  return granted;
}

/** IDs of scenarios completed this browser session. */
export function completedScenarioIds(): string[] {
  return Array.from(_completedScenarioIds);
}

/**
 * Mark a scenario as completed without awarding XP (tests / admin hooks).
 * Debrief flow should use awardScenarioDebriefXp instead.
 */
export function markScenarioCompleted(id: string): void {
  _completedScenarioIds.add(id);
}

/**
 * Reset all state — used between test runs and on hard session restart.
 * Not called automatically; the UI must explicitly invoke this.
 */
export function reset(): void {
  _xpTotal = 0;
  _completedDrillIds.clear();
  _bonusAwardedDrillIds.clear();
  _completedScenarioIds.clear();
  _completedLessonIds.clear();
  _lastRankUp = null;
}
