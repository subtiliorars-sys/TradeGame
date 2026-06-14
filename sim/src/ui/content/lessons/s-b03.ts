/** S-B03 — Long-term vs swing. Source: docs/lessons/PILLAR_INTROS.md §S-B03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B03: LessonContent = {
  id: "lesson:long-term-vs-swing",
  curriculumId: "S-B03",
  title: "Long-Term vs. Swing",
  track: "stocks",
  pages: [
    [
      "The same instrument — NGSM or the NMX 100 ETF — can be",
      "held with different strategic intent. That changes the",
      "correct stop distance, position size, and review frequency.",
      "Conflating horizons is a common error: entering with a swing",
      "thesis, then becoming a 'long-term investor' to avoid exit.",
    ],
    [
      "Long-term (weeks to years): thesis plays out over many",
      "sessions. Daily noise is irrelevant on a monthly chart.",
      "Stop must be wide — sized smaller to keep dollar risk",
      "within your per-trade rule (F-03).",
      "",
      "Swing (hours to days): targets a move within a session or",
      "few sessions. Narrower stop, regular chart review — at",
      "minimum every session.",
      "",
      "Worked example — NGSM $100, account $10,000, 1% risk ($100):",
      "Swing stop $97.50 → 40 shares. Long-term stop $85 → 6 shares.",
      "Same share count regardless of stop width violates the rule.",
    ],
    [
      "Review frequency matches horizon deliberately. A swing held",
      "without daily review is no longer a swing. A long-term",
      "position checked every ten minutes creates anxiety over",
      "irrelevant noise.",
      "",
      "If your thesis changes, exit or resize at the new stop —",
      "do not reframe the horizon to avoid booking a loss.",
    ],
  ],
  processCheck: "Have you written down intended holding period and corresponding stop before entering — not after the trade moved against you?",
  cta: { kind: "scenario", id: "SCN-002", line: "Practice this now: hold a swing thesis across a simulated earnings session." },
};
