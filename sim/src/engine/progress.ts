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
 * Complete a lesson AND award its XP atomically (mirrors completeDrill —
 * same rank-change detection across both mutations; once-per-lesson is
 * enforced by the caller checking completedLessonIds first).
 */
export function completeLesson(id: string, xp: number): void {
  const before = currentRank(_xpTotal, completedDrillIds()).rank;
  _completedLessonIds.add(id);
  if (Number.isFinite(xp) && xp > 0) {
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

/**
 * Mark a scenario as completed (debrief reached). Feeds the Main Menu's
 * scenario-prereq gates ("scenario:SCN-00X" in manifest.prereqs).
 * Completion = process flow finished, regardless of outcome — no PnL input.
 */
export function markScenarioCompleted(id: string): void {
  _completedScenarioIds.add(id);
}

/** IDs of scenarios completed this browser session. */
export function completedScenarioIds(): string[] {
  return Array.from(_completedScenarioIds);
}

/**
 * Reset all state — used between test runs and on hard session restart.
 * Not called automatically; the UI must explicitly invoke this.
 */
export function reset(): void {
  _xpTotal = 0;
  _completedDrillIds.clear();
  _completedScenarioIds.clear();
  _completedLessonIds.clear();
  _lastRankUp = null;
}
