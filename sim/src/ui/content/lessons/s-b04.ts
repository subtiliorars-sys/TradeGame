/** S-B04 — Index investing math. Source: docs/lessons/BEGINNER_COMPLETIONS.md §S-B04. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B04: LessonContent = {
  id: "lesson:index-investing-math",
  curriculumId: "S-B04",
  title: "Index Investing Math",
  track: "stocks",
  pages: [
    [
      "F-06 taught drawdown math — a 50% loss needs 100% gain",
      "to recover. This lesson covers compounding: what happens",
      "when capital grows positively over time, and why entry",
      "price of any single buy matters less under dollar-cost",
      "averaging into an index.",
      "",
      "Compounding: $1,000 at 8% per year is not $80 forever.",
      "Year 1: $80. Year 2: 8% of $1,080 = $86.40. After 10 years:",
      "$1,000 × (1.08)^10 = $2,158.93. Gains earn gains.",
      "This illustrates structure, not a projection for NMX 100.",
    ],
    [
      "DCA: fixed dollars at regular intervals regardless of price.",
      "",
      "Buy 1: $200 at $100/unit → 2.0 units",
      "Buy 2: $200 at $80/unit → 2.5 units",
      "Buy 3: $200 at $110/unit → 1.818 units",
      "",
      "Total invested: $600. Total units: 6.3182.",
      "Average cost basis: $94.96 — below the $100 lump-sum entry",
      "because the $80 buy accumulated more units per dollar.",
    ],
    [
      "A fixed dollar amount buys more units when price is lower.",
      "Over many intervals, average cost basis tends below the",
      "arithmetic average of prices paid.",
      "",
      "DCA does not guarantee profit. If the ETF declines over",
      "the entire period and never recovers, you still lose —",
      "at a lower average cost, but underwater. DCA manages",
      "entry timing risk; it is not protection against sustained",
      "decline without a recovery thesis.",
    ],
  ],
  processCheck: "Can you calculate average cost basis after three buys at different prices — manually, in under two minutes?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-stocks",
    line: "Practice next: run DCA math on three synthetic NMX 100 buys.",
  },
};
