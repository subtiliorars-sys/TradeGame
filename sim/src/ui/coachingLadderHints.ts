/**
 * Rank → community coaching hints (COACH-W1).
 * Process review only — never trade advice. See docs/COACHING_LADDER_RANK_MAP.md.
 */

/** One-line hint shown on the Main Menu at selected ranks; null = no extra line. */
export function communityCoachingHint(rankId: string): string | null {
  switch (rankId) {
    case "trainee":
      return "Trainee: share sim replays in Discord #sim-runs for process review — not trade advice.";
    case "practitioner":
      return "Practitioner+: community coaching rewards journaling and debrief quality, not PnL.";
    case "journeyman":
      return "Journeyman+: Helper tier is nominated by coaches after sustained process reflection.";
    case "strategist":
    case "senior_strategist":
      return "Strategist+: top ranks point to cohort replay-review — still education, not signals.";
    default:
      return null;
  }
}
