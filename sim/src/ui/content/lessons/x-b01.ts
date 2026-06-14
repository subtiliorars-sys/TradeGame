/** X-B01 — Pairs, quotes, and pips. Source: docs/lessons/PILLAR_INTROS.md §X-B01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_X_B01: LessonContent = {
  id: "lesson:pairs-quotes-pips",
  curriculumId: "X-B01",
  title: "Pairs, Quotes, and Pips",
  track: "forex",
  pages: [
    [
      "Forex is always quoted as a pair — you buy one currency",
      "and simultaneously sell another. ANDU/HarborUSD quotes the",
      "price of one ANDU in HarborUSD. At 1.2450, one ANDU costs",
      "$1.2450. ANDU is the base; HarborUSD is the quote currency.",
      "",
      "Going long ANDU/HarborUSD means buying ANDU, selling",
      "HarborUSD. If ANDU strengthens from 1.2450 to 1.2600,",
      "you profit. If it moves to 1.2300, you lose.",
    ],
    [
      "A pip is typically the fourth decimal place. 1.2450 to",
      "1.2451 is one pip. Lot sizes:",
      "• Standard: 100,000 units of base",
      "• Mini: 10,000 units",
      "• Micro: 1,000 units",
      "",
      "Pip value (HarborUSD as quote): 0.0001 × lot size.",
      "Standard lot on ANDU/HarborUSD: $10.00 per pip.",
      "Mini: $1.00. Micro: $0.10 per pip.",
    ],
    [
      "Position sizing with a pip-based stop:",
      "Account $2,000. Risk 1% = $20. Stop 40 pips.",
      "Pip value (micro lot): $0.10.",
      "",
      "Dollar risk per micro lot = 40 × $0.10 = $4.00.",
      "Micro lots: $20 ÷ $4.00 = 5 micro lots exactly.",
      "",
      "This calculation — not intuition — is what the F-03 drill",
      "builds into muscle memory. Forex sizing always starts here.",
    ],
  ],
  processCheck: "Can you calculate pip value and position size manually before entering any forex position?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-forex",
    line: "Practice next: run the sizing formula on three ANDU/HarborUSD scenarios.",
  },
};
