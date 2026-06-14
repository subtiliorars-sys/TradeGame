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
      "packages many stocks into one tradeable instrument. Both",
      "trade on exchanges during session hours — the structural",
      "differences matter.",
      "",
      "The NMX 100 ETF holds proportional slices of 100 companies.",
      "If NGSM (1.5% weight) falls 30% on an earnings miss, the",
      "ETF moves about 0.45%. You did not feel a 30% hit; you",
      "felt 0.45%. Diversification cushions extreme downside —",
      "and caps extreme upside from any single event.",
    ],
    [
      "Worked example — $1,000 allocated:",
      "",
      "Option A: NMX 100 ETF. NGSM drops 40% (1.5% weight).",
      "Loss from NGSM's move: ~$6. Other names flat. Net ~−$6.",
      "",
      "Option B: NGSM directly. NGSM drops 40%. Loss: $400.",
      "",
      "Neither is a recommendation. Option B could also gain $400.",
      "The range of outcomes is structurally different.",
    ],
    [
      "A concentrated single-name position fits when you have a",
      "specific, reasoned hypothesis distinct from market direction",
      "— and size it within your per-trade rule (F-03). It is not",
      "a default for a learner without a company-specific thesis.",
      "",
      "Dollar-cost averaging pairs well with ETFs: the basket",
      "smooths individual-name volatility while you average in",
      "over time. S-B04 goes deeper on the math.",
    ],
  ],
  processCheck: "Can you explain the tradeoff between diversification and upside concentration in plain language — not just 'diversification is safer'?",
  cta: {
    kind: "drill",
    id: "drill:stop-placement-stocks",
    line: "Practice next: compare spread cost on an ETF vs a single-name entry.",
  },
};
