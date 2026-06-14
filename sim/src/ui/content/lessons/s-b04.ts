/** S-B04 — Index investing math. Source: docs/lessons/BEGINNER_COMPLETIONS.md §S-B04. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B04: LessonContent = {
  id: "lesson:index-investing-math",
  curriculumId: "S-B04",
  title: "Index Investing Math",
  track: "stocks",
  pages: [
    [
      "F-06 covered drawdown recovery. Here: positive compounding",
      "structure and why DCA entry math differs from one lump sum.",
      "",
      "Compounding illustration (not a forecast): $1,000 at 8%",
      "per year → year 10 ≈ $1,000 × (1.08)^10 ≈ $2,159.",
      "Gains earn gains; the curve accelerates over time.",
    ],
    [
      "DCA cost basis — three $200 buys into NMX 100 ETF:",
      "",
      "$100/unit → 2.0 units; $80/unit → 2.5; $110/unit → 1.818.",
      "Total $600, 6.318 units → average $94.96/unit.",
      "",
      "Lump sum at $100 would be $100 basis. Lower-price intervals",
      "buy more units, pulling the average below the arithmetic",
      "mean of the three prices.",
    ],
    [
      "DCA manages entry-timing risk; it does not erase a sustained",
      "decline with no recovery thesis. \"I'm DCA-ing\" can become",
      "rationalization without a process stop.",
    ],
  ],
  processCheck:
    "Can you calculate average cost basis after three buys at different prices — manually, in under two minutes?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-stocks",
    line: "Practice next: journal three hypothetical DCA buys and your running cost basis.",
  },
};
