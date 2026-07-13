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

// Drill gates are assigned per DRILL_SYSTEM_BRIEF §3.3, with one shipped-
// drills-only rule on top: a rank may gate ONLY on drills that exist in the
// live catalog (a gate on an unshipped drill would softlock the ladder —
// XP can never vault a gate). Trainee's four Beginner drills shipped in the
// drill-build waves; Practitioner/Journeyman/Strategist gates flip in as
// their drill tiers ship (brief table is the authoritative assignment).
// A property test enforces gate-ids ⊆ shipped catalog.
export const CANONICAL_LADDER: readonly RankThreshold[] = [
  { rankId: "observer",          displayLabel: "Observer",          xpRequired:    0, drillsRequired: [] }, // TUNABLE
  { rankId: "trainee",           displayLabel: "Trainee",           xpRequired:  200, drillsRequired: [   // TUNABLE (brief §3.3)
    "drill:position-sizing-crypto",
    "drill:position-sizing-stocks",
    "drill:position-sizing-forex",
    "drill:stop-placement-v1",
  ] },
  { rankId: "practitioner",      displayLabel: "Practitioner",      xpRequired:  800, drillsRequired: [   // TUNABLE (brief §3.3, LD-W6 flip)
    "drill:stop-placement-crypto",
    "drill:stop-placement-stocks",
    "drill:stop-placement-forex",
    "drill:drawdown-survival-crypto",
    "drill:drawdown-survival-stocks",
    "drill:drawdown-survival-forex",
  ] },
  { rankId: "journeyman",        displayLabel: "Journeyman",        xpRequired: 2000, drillsRequired: [   // TUNABLE (brief §3.3, LD-W6 flip)
    "drill:blowup-crypto",
    "drill:blowup-stocks",
    "drill:blowup-forex",
  ] },
  { rankId: "strategist",        displayLabel: "Strategist",        xpRequired: 4500, drillsRequired: [] }, // TUNABLE — brief assigns 3 correlation drills; flips when they ship
  { rankId: "senior_strategist", displayLabel: "Senior Strategist", xpRequired: 8000, drillsRequired: [] }, // TUNABLE — no gate by design
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

  // Ensure the ladder is sorted by xpRequired ascending to prevent out-of-order traversal bugs.
  const sortedLadder = [...ladder].sort((a, b) => a.xpRequired - b.xpRequired);

  const drillSet = new Set(completedDrillIds);

  // Walk the ladder from the bottom up, stopping at the FIRST unmet gate.
  // Gates are cumulative: every intermediate rank's XP and drill requirements
  // must be satisfied to advance past it — a top-down "first satisfied" walk
  // would let high XP vault an intermediate rank's unmet drill gate
  // (red-team finding R2-4; GDD §7: XP alone is insufficient).
  let earnedIndex = 0;
  for (let i = 1; i < sortedLadder.length; i++) {
    const candidate = sortedLadder[i]!;
    if (
      xpTotal >= candidate.xpRequired &&
      candidate.drillsRequired.every((id) => drillSet.has(id))
    ) {
      earnedIndex = i;
    } else {
      break;
    }
  }

  const rank = sortedLadder[earnedIndex]!;
  const nextRank = earnedIndex < sortedLadder.length - 1 ? (sortedLadder[earnedIndex + 1] ?? null) : null;

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

// ---------------------------------------------------------------------------
// ladderViewModel — full-ladder display data (§4.5 rank-ladder UI)
// ---------------------------------------------------------------------------

export interface LadderRungView {
  rankId: string;
  displayLabel: string;
  /** Cumulative XP threshold — TUNABLE economy number, display verbatim. */
  xpRequired: number;
  /**
   * achieved — below the player's current rank;
   * current  — the player's rank;
   * gated    — XP threshold met but this rung's drill gate is unmet
   *            (the explicit-gate state — never a silent stall);
   * future   — not yet reached.
   */
  state: "achieved" | "current" | "gated" | "future";
  /** Drill IDs this rung requires (empty until the drill system ships). */
  drillsRequired: string[];
  /** Of those, the ones the player has not completed. */
  drillsMissing: string[];
}

/**
 * Build the full-ladder view for the Main Menu rank-ladder display.
 * Pure — same inputs as currentRank(); §4.4 applies: XP and drill data only,
 * no outcome inputs.
 */
export function ladderViewModel(
  xpTotal: number,
  completedDrillIds: string[],
  ladder: readonly RankThreshold[] = CANONICAL_LADDER
): LadderRungView[] {
  const { rank } = currentRank(xpTotal, completedDrillIds, ladder);
  const currentIdx = ladder.findIndex((r) => r.rankId === rank.rankId);
  const drillSet = new Set(completedDrillIds);

  return ladder.map((rung, i) => {
    const drillsMissing = rung.drillsRequired.filter((id) => !drillSet.has(id));
    let state: LadderRungView["state"];
    if (i < currentIdx) state = "achieved";
    else if (i === currentIdx) state = "current";
    else if (xpTotal >= rung.xpRequired && drillsMissing.length > 0) state = "gated";
    else state = "future";
    return {
      rankId: rung.rankId,
      displayLabel: rung.displayLabel,
      xpRequired: rung.xpRequired,
      state,
      drillsRequired: [...rung.drillsRequired],
      drillsMissing,
    };
  });
}
