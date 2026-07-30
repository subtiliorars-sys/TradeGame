/** C-A02 — AI tools — hype detection. Source: docs/CURRICULUM.md §C-A02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_A02: LessonContent = {
  id: "lesson:crypto-a02-hype-detection",
  curriculumId: "C-A02",
  title: "AI Tools — Hype Detection",
  track: "crypto",
  pages: [
    [
      "Red flags in bot marketing:",
      "",
      "The most common red flag in algorithmic tool marketing is",
      "the guarantee of returns or the implication of predictive",
      "certainty. If a tool claims a '95% win rate', it is likely",
      "curve-fitted to past data or runs an extreme negative edge",
      "strategy that hasn't blown up yet."
    ],
    [
      "How to audit a claimed track record:",
      "",
      "A screenshot of a profit curve proves nothing. A genuine",
      "track record requires verified execution logs, clear",
      "drawdown metrics, and an explanation of the market regime",
      "during the test period.",
      "",
      "Ask: what happens to this strategy when the market",
      "stops doing what it is doing right now?"
    ]
  ],
  processCheck: "Can you identify three claims in a bot pitch that are unverifiable?",
  cta: { kind: "drill", id: "drill:discussion", line: "Review checklist in the Discord journal channel." }
};
