/** C-A01 — AI and algorithmic tools — capabilities. Source: docs/CURRICULUM.md §C-A01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_A01: LessonContent = {
  id: "lesson:crypto-a01-capabilities",
  curriculumId: "C-A01",
  title: "AI and Algorithmic Tools — Capabilities",
  track: "crypto",
  pages: [
    [
      "What algorithmic tools realistically do:",
      "",
      "Algorithmic execution excels at speed, rule adherence, and",
      "monitoring. A bot can execute a grid strategy across",
      "hundreds of price levels instantly. It can run a parameter",
      "sweep on historical data to backtest those grid levels.",
      "",
      "It executes without hesitation, which is why institutions",
      "use them for order routing and execution."
    ],
    [
      "What algorithmic tools cannot do:",
      "",
      "Bots do not predict the future direction of price. They",
      "execute a pre-defined process against a present condition.",
      "A bot running a moving average crossover strategy does",
      "not 'know' a trend will continue; it only knows the",
      "condition was met.",
      "",
      "If a regime shifts, the bot will faithfully execute the",
      "old rules in the new regime until stopped."
    ]
  ],
  processCheck: "Can you name two things a bot cannot do regardless of how it is marketed?",
  cta: { kind: "drill", id: "drill:sandbox-grid", line: "Run a parameter sweep on a synthetic grid in the sandbox." }
};
