/** F-09 — Why most retail traders lose. Source: docs/lessons/FOUNDATION.md §F-09. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_09: LessonContent = {
  id: "lesson:why-retail-loses",
  curriculumId: "F-09",
  title: "Why Most Retail Traders Lose",
  track: "foundation",
  pages: [
    [
      "This is a honesty module. Disclosures across major",
      "brokers often show most retail accounts lose over",
      "observed periods — not fringe, disclosed reality.",
      "",
      "Mechanical reasons:",
      "• Fees and spread — friction on every entry and exit",
      "• Over-leverage — drawdown math (F-06) at high multiples",
      "• No defined edge — pattern-matching from memory, not tested",
      "  expectancy after costs",
    ],
    [
      "• Emotional override — FOMO and revenge over large samples",
      "• Treating skill as fixed — regimes change; strategies age",
      "",
      "A genuine edge hypothesis names: setup, expected win rate",
      "and R:R, markets and timeframes, and sample size. It is",
      "falsifiable — you can write when you would stop using it.",
    ],
    [
      "Writing that down is not pessimism. It separates normal",
      "variance (temporary drawdown) from a broken process.",
      "",
      "Drill: watch how spread and fee drag alone raise the win",
      "rate you need just to break even over many random trades.",
    ],
  ],
  processCheck: "Have you written down your edge hypothesis — and can you name two structural reasons retail outcomes skew negative?",
  cta: {
    kind: "drill",
    id: "drill:drawdown-survival-stocks",
    line: "Practice next: see how friction and streaks interact on an equity curve.",
  },
};
