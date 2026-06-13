/** F-07 — Journaling. Source: docs/lessons/FOUNDATION.md §F-07. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_07: LessonContent = {
  id: "lesson:journaling",
  curriculumId: "F-07",
  title: "Journaling",
  track: "foundation",
  pages: [
    [
      "A trading journal is not a PnL spreadsheet. It records",
      "your thinking before and after so you can diagnose what",
      "drives outcomes — process, luck, and psychology.",
      "",
      "Before entry: instrument, direction, entry, stop, target,",
      "calculated R:R, and the reason in your own words.",
      "",
      "At exit: exit price, outcome in R, whether you followed",
      "the plan or deviated.",
    ],
    [
      "Post-trade reflection: did price behave as expected? If",
      "you deviated, what caused it? What would you do next time?",
      "",
      "Weekly review matters more than any single entry. Look for",
      "patterns: more deviation after losses? Do gut-feel entries",
      "outperform process entries?",
      "",
      "Record PnL as context, not the headline. A win with no stop",
      "and no plan is worse process than a loss with clear rationale",
      "and correct sizing.",
    ],
    [
      "Example entry (abbreviated):",
      "Long NGSM $41.80 · stop $41.20 · target $43.60 (1:3)",
      "Reason: held support through two tests; volume dried on",
      "pullback. Exit +2.9R at limit. Reflection: resisted early",
      "exit urge after a losing streak — note for weekly review.",
    ],
  ],
  processCheck: "Are you writing the reason before you enter — not reconstructing it after the fact?",
  cta: {
    kind: "scenario",
    id: "SCN-001",
    line: "Practice next: complete a session with full journal fields before and after.",
  },
};
