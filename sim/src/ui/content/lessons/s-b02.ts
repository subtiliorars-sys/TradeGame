/** S-B02 — ETFs vs single names. Source: docs/lessons/PILLAR_INTROS.md §S-B02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B02: LessonContent = {
  id: "lesson:etfs-vs-single-names",
  curriculumId: "S-B02",
  title: "ETFs vs. Single Names",
  track: "stocks",
  pages: [
    [
      "A stock is fractional ownership in one company. An ETF",
      "packages many stocks into one tradeable line item. Both",
      "trade in session hours; the structural risk differs.",
      "",
      "NMX 100 ETF: if one 1.5% weight drops 30%, the basket",
      "moves ~0.45%. Single-name NGSM holders feel the full 30%.",
      "Diversification cushions downside and caps upside from any",
      "one event.",
    ],
    [
      "Worked example — $1,000 allocated:",
      "",
      "ETF: NGSM (1.5% weight) drops 40% → about −$6 on the",
      "whole position if other names are flat.",
      "",
      "Single name: NGSM drops 40% → −$400. The range of",
      "outcomes is wider — not a recommendation, a structure",
      "fact. Concentration needs a company-specific thesis and",
      "F-03 sizing discipline.",
    ],
    [
      "DCA pairs naturally with ETFs: fixed dollars at intervals",
      "smooth single-name noise inside the basket. S-B04 covers",
      "the cost-basis math.",
    ],
  ],
  processCheck:
    "Can you explain the tradeoff between diversification and upside concentration in plain language — not only that diversification is safer?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-stocks",
    line: "Practice next: size a stocks position after stating ETF vs single-name intent.",
  },
};
