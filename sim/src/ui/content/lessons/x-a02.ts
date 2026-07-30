/** X-A02 — Correlation in a crisis. Source: docs/CURRICULUM.md §X-A02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_X_A02: LessonContent = {
  id: "lesson:forex-a02-correlation-crisis",
  curriculumId: "X-A02",
  title: "Correlation in a Crisis",
  track: "forex",
  pages: [
    [
      "Hidden exposure:",
      "",
      "Two pairs that normally move independently can suddenly",
      "become highly correlated during a macro stress event.",
      "If you hold multiple positions, you might believe you are",
      "diversified.",
      "",
      "In a crisis, correlations tend toward 1. Your combined",
      "exposure is not the sum of individual risks; it is",
      "multiplied."
    ],
    [
      "Position sizing with correlation:",
      "",
      "Before adding a second position, check if it shares a",
      "common factor (e.g., USD exposure) with your first.",
      "If they are correlated, adding the second position is",
      "effectively doubling the size of the first.",
      "",
      "Manage combined pip exposure, not just individual",
      "stop-to-account calculations."
    ]
  ],
  processCheck: "Do you check correlation before adding a second position?",
  cta: { kind: "drill", id: "drill:correlation-forex", line: "Complete the Correlation Awareness Drill (Forex variant)." }
};
