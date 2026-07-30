/** S-A01 — Reading a stock screener. Source: docs/CURRICULUM.md §S-A01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_A01: LessonContent = {
  id: "lesson:stocks-a01-screener",
  curriculumId: "S-A01",
  title: "Reading a Stock Screener",
  track: "stocks",
  pages: [
    [
      "Filter criteria and their limits:",
      "",
      "A stock screener filters thousands of equities down to a",
      "manageable list based on metrics like P/E ratio, volume,",
      "or market cap. But a metric only measures one dimension.",
      "",
      "For example, a low P/E ratio might indicate a value stock,",
      "or it might indicate a company with declining earnings",
      "that the market has correctly discounted (a value trap)."
    ],
    [
      "Understanding what is NOT measured:",
      "",
      "Screeners look backward or rely on analyst estimates.",
      "They do not measure management competence, upcoming",
      "regulatory risks, or shifts in consumer behavior.",
      "",
      "A screener is a starting point for observation, not a",
      "buy list."
    ]
  ],
  processCheck: "Can you name three screener criteria and the failure mode of relying on each alone?",
  cta: { kind: "drill", id: "drill:screener-output", line: "Review screener output interpretation (TODO)." }
};
