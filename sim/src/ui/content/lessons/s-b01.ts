/** S-B01 — Market structure. Source: docs/lessons/PILLAR_INTROS.md §S-B01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B01: LessonContent = {
  id: "lesson:stocks-market-structure",
  curriculumId: "S-B01",
  title: "Market Structure (Stocks)",
  track: "stocks",
  pages: [
    [
      "Stock orders run through regulated session hours, exchanges,",
      "and participants whose job is to keep the book liquid.",
      "That structure sets the price you pay, how fast you exit,",
      "and how risk shifts by time of day.",
      "",
      "Primary session in the stocks sandbox: 9:30–16:00 Eastern.",
      "Pre-market and after-hours trade with thinner books. In the",
      "sim, NGSM spreads tighten in session and widen outside it.",
    ],
    [
      "Market makers post bid and ask continuously. The spread is",
      "their compensation for liquidity. Without them you might",
      "wait indefinitely for a counterparty — with them there is",
      "almost always a price, but it may not be your price.",
      "",
      "Example — NGSM at $100, $0.10 spread: buy 100 at the ask.",
      "Best sell is immediately the bid — $10 cost before price",
      "moves. Pre/post market: fewer makers, wider spreads, prints",
      "that can look dramatic on thin volume (F-04 gap analogy).",
    ],
    [
      "NMX 100 is a synthetic 100-name basket including NGSM.",
      "One company event can diverge sharply from the index —",
      "index exposure and single-name exposure are not the same",
      "risk profile (S-B02 develops this).",
    ],
  ],
  processCheck:
    "Do you know what happens to the spread on your target instrument outside regular session hours — in the sim, not only in theory?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-stocks",
    line: "Practice next: one stocks sizing drill; log bid/ask and spread at entry.",
  },
};
