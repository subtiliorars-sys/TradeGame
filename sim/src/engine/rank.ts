/**
 * RankService — SIM_ENGINE_SPEC §4.5 ("Rank Progression and Display").
 *
 * ETHICS RAIL: this module reads cumulative process XP and drill-completion
 * IDs only. Any trade-outcome data (fills, balance, realizedXxx) passed here
 * is a §4.4 violation and must be rejected in code review.
 *
 * Ladder values are TUNABLE — balance against per-scenario rubric totals once
 * more scenarios are scored (see SCENARIOS_V0/V1 XP rubrics). Mark every
 * number below with // TUNABLE before shipping any economy re-balance.
 *
 * Drill gate IDs in drillsRequired are empty this pass; IDs will be assigned
 * when the drill system ships (GDD §7: XP alone is insufficient). The
 * interface and currentRank() logic fully support them already.
 */

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface RankThreshold {
  /** Stable machine ID, e.g. 'observer'. */
  rankId: string;
  /** Display label, authored for UI — e.g. "Observer". */
  displayLabel: string;
  /** Cumulative process XP required to reach (and hold) this rank. */
  xpRequired: number;
  /**
   * Drill IDs that must be completed before this rank is awarded.
   * GDD §7: XP alone is insufficient — prevents XP-grinding past skills.
   * Empty this pass; IDs assigned when drills ship. // TUNABLE
   */
  drillsRequired: string[];
}

export interface CurrentRankResult {
  rank: RankThreshold;
  /** null at top rank (GDD: progression ends in cohort/coaching, not number-go-up). */
  nextRank: RankThreshold | null;
  /** XP accumulated since the current rank threshold (xpTotal − rank.xpRequired). */
  xpIntoRank: number;
  /**
   * XP remaining to the next rank threshold (nextRank.xpRequired − xpTotal).
   * 0 when at top rank or when xpTotal already meets the next rank's xpRequired.
   */
  xpToNextRank: number;
  /**
   * Drill IDs required by nextRank that are not yet in completedDrillIds.
   * Non-empty when XP suffices but the drill gate blocks advancement.
   * Empty when XP is the only shortfall, or at top rank.
   */
  drillsMissing: string[];
}

// ---------------------------------------------------------------------------
// Canonical rank ladder
// ---------------------------------------------------------------------------
// All threshold numbers are TUNABLE — see module header.

export const CANONICAL_LADDER: readonly RankThreshold[] = [
  { rankId: "observer",          displayLabel: "Observer",          xpRequired:    0, drillsRequired: [] }, // TUNABLE
  { rankId: "trainee",           displayLabel: "Trainee",           xpRequired:  200, drillsRequired: [] }, // TUNABLE
  { rankId: "practitioner",      displayLabel: "Practitioner",      xpRequired:  800, drillsRequired: [] }, // TUNABLE
  { rankId: "journeyman",        displayLabel: "Journeyman",        xpRequired: 2000, drillsRequired: [] }, // TUNABLE
  { rankId: "strategist",        displayLabel: "Strategist",        xpRequired: 4500, drillsRequired: [] }, // TUNABLE
  { rankId: "senior_strategist", displayLabel: "Senior Strategist", xpRequired: 8000, drillsRequired: [] }, // TUNABLE
];

// ---------------------------------------------------------------------------
// currentRank — pure function
// ---------------------------------------------------------------------------

/**
 * Returns the player's current rank and progress given cumulative process XP
 * and the set of completed drill IDs.
 *
 * Advancement rule: a rank is awarded when xpTotal >= rank.xpRequired AND all
 * of rank.drillsRequired are in completedDrillIds. If XP suffices but drills
 * are missing, the player stays at the lower rank and drillsMissing is
 * populated so the UI can display an explicit gate message.
 *
 * @param xpTotal         - Cumulative process XP (non-negative).
 * @param completedDrillIds - Set of drill IDs the player has completed.
 * @param ladder          - Rank ladder to use (defaults to CANONICAL_LADDER).
 *                          Override in tests to inject synthetic ladders.
 */
export function currentRank(
  xpTotal: number,
  completedDrillIds: string[],
  ladder: readonly RankThreshold[] = CANONICAL_LADDER
): CurrentRankResult {
  if (ladder.length === 0) {
    throw new Error("rank ladder must not be empty");
  }

  const drillSet = new Set(completedDrillIds);

  // Walk the ladder from the highest threshold downward; take the first rank
  // for which both XP and drills are satisfied.
  let earnedIndex = 0;
  for (let i = ladder.length - 1; i >= 0; i--) {
    const candidate = ladder[i]!;
    if (
      xpTotal >= candidate.xpRequired &&
      candidate.drillsRequired.every((id) => drillSet.has(id))
    ) {
      earnedIndex = i;
      break;
    }
  }

  const rank = ladder[earnedIndex]!;
  const nextRank = earnedIndex < ladder.length - 1 ? (ladder[earnedIndex + 1] ?? null) : null;

  // Compute drillsMissing: drills required by nextRank that are not yet done,
  // but only when XP already meets nextRank's threshold (the drill gate is the
  // only thing blocking advancement).
  let drillsMissing: string[] = [];
  if (nextRank !== null && xpTotal >= nextRank.xpRequired) {
    drillsMissing = nextRank.drillsRequired.filter((id) => !drillSet.has(id));
  }

  const xpIntoRank = xpTotal - rank.xpRequired;
  const xpToNextRank = nextRank !== null ? Math.max(0, nextRank.xpRequired - xpTotal) : 0;

  return { rank, nextRank, xpIntoRank, xpToNextRank, drillsMissing };
}
