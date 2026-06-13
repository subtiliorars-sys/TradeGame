/** F-06 — Drawdown math. Source: docs/lessons/FOUNDATION.md §F-06. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_06: LessonContent = {
  id: "lesson:drawdown-math",
  curriculumId: "F-06",
  title: "Drawdown Math",
  track: "foundation",
  pages: [
    [
      "Losses and gains are not symmetric. After a loss the",
      "denominator shrinks — recovery needs a larger percentage",
      "gain than the loss you took.",
      "",
      "Loss 10% → need ~11.1% to recover",
      "Loss 20% → need 25%",
      "Loss 50% → need 100%",
      "",
      "This is why F-03 uses small risk percentages: streaks",
      "happen even on sensible strategies.",
    ],
    [
      "Five losses in a row at 5% of current balance costs",
      "about 22.6% of the starting account — recovery needs",
      "roughly 29%, not 22.6%.",
      "",
      "Same five losses at 1% risk costs about 4.9%; recovery",
      "needs about 5.1%. Uncomfortable, not catastrophic.",
      "",
      "Max daily drawdown rule: if you hit your daily loss",
      "cap, stop for the day. Prevents revenge spirals (F-08).",
    ],
    [
      "Example — $10,000 account, 5% risk (aggressive demo):",
      "Five −5% losses land near $7,738 (−22.6%).",
      "",
      "At 1% risk the same streak leaves most of the account",
      "intact. The math is the argument for small sizing —",
      "not optimism about being right.",
    ],
  ],
  processCheck: "Do you have a max daily drawdown rule written down — and can you explain why −10% then +10% does not break even?",
  cta: {
    kind: "drill",
    id: "drill:blowup-crypto",
    line: "Practice next: run the blow-up drill and compare max leverage vs 1% sizing.",
  },
};
