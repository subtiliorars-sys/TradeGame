/** X-A01 — Session-breakout strategies. Source: docs/CURRICULUM.md §X-A01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_X_A01: LessonContent = {
  id: "lesson:forex-a01-session-breakout",
  curriculumId: "X-A01",
  title: "Session-Breakout Strategies and Failure Modes",
  track: "forex",
  pages: [
    [
      "The range-then-break mechanic:",
      "",
      "A common forex strategy involves marking the Asian session",
      "range and trading the breakout when London opens. The",
      "thesis is that increased volume will establish a trend for",
      "the session.",
      "",
      "However, institutional players know this is where retail",
      "stops are clustered."
    ],
    [
      "Whipsaw cost:",
      "",
      "The failure mode is the false breakout. Price breaks the",
      "range, triggers entry orders, and then sharply reverses",
      "back into the range (a liquidity sweep).",
      "",
      "If you trade breakouts systematically, you must accept",
      "that whipsaw losses are a recurring cost of the strategy.",
      "You are paying for the times it actually trends."
    ]
  ],
  processCheck: "Can you describe the condition under which a breakout entry has a negative expectancy?",
  cta: { kind: "drill", id: "drill:SCN-whipsaw", line: "Replay the session whipsaw scenario (TODO)." }
};
