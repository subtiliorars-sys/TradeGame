/** S-B03 — Long-term vs swing. Source: docs/lessons/PILLAR_INTROS.md §S-B03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B03: LessonContent = {
  id: "lesson:long-term-vs-swing",
  curriculumId: "S-B03",
  title: "Long-Term vs. Swing",
  track: "stocks",
  pages: [
    [
      "The same NGSM or NMX 100 line can be held with different",
      "intent — and that changes stop width, size, and review",
      "cadence. Reframing a losing swing as long-term without",
      "resizing is a coping move, not a strategy.",
      "",
      "Long-term (weeks+): thesis plays over many sessions.",
      "Daily noise is irrelevant on a monthly chart — stops must",
      "be wide, which forces smaller size to keep F-03 risk.",
    ],
    [
      "Swing (hours to days): narrower stop, more frequent",
      "review — at least each session. A 3-day stop held on day",
      "7 without a new thesis is horizon drift.",
      "",
      "Example — NGSM $100, $10k account, 1% risk ($100):",
      "Swing stop $97.50 → 40 shares, check daily.",
      "Long-term stop $85 → 6 shares, review weekly.",
      "Same share count with a wide stop breaks the risk rule.",
    ],
    [
      "If the thesis invalidates, exit or resize — do not",
      "quietly change horizon to avoid booking the loss.",
    ],
  ],
  processCheck:
    "Have you written down intended holding period and matching stop before entry — not after the trade moves against you?",
  cta: {
    kind: "scenario",
    id: "SCN-005",
    line: "Practice next: hold a multi-session stocks scenario with a written horizon.",
  },
};
