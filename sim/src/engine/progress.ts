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

// ---------------------------------------------------------------------------
// Module-private state
// ---------------------------------------------------------------------------

let _xpTotal = 0;
const _completedDrillIds = new Set<string>();

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Add process XP to the running total.
 * Silently clamps/ignores negative or non-finite inputs.
 */
export function addXp(n: number): void {
  if (!Number.isFinite(n) || n < 0) return;
  _xpTotal += n;
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
 * Reset all state — used between test runs and on hard session restart.
 * Not called automatically; the UI must explicitly invoke this.
 */
export function reset(): void {
  _xpTotal = 0;
  _completedDrillIds.clear();
}
