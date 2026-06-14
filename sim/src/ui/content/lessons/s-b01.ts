/** S-B01 — Market structure. Source: docs/lessons/PILLAR_INTROS.md §S-B01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_B01: LessonContent = {
  id: "lesson:stocks-market-structure",
  curriculumId: "S-B01",
  title: "Market Structure (Stocks)",
  track: "stocks",
  pages: [
    [
      "When you buy shares, you interact with a structured system:",
      "predictable session hours, regulated exchanges, and",
      "participants whose job is to keep the market liquid.",
      "That structure determines the price you pay, exit ease,",
      "and risk at different times of day.",
      "",
      "The primary session runs 9:30–16:00 Eastern. Pre-market",
      "(~4:00–9:30) and after-hours (16:00–20:00) exist but with",
      "thinner participation. In the sim, NGSM spread tightens",
      "during session and widens visibly outside it.",
    ],
    [
      "Market makers post both a bid and an ask continuously.",
      "The spread is their compensation for providing liquidity.",
      "Without them, a buy order might wait indefinitely for a",
      "seller. With them, a price is almost always available —",
      "but it may not be your price.",
      "",
      "Every entry pays the spread. Buy at the ask; immediate",
      "best sell is the bid — already below entry. On NGSM at",
      "$100 with a $0.10 spread, 100 shares costs $10 before",
      "price moves a single tick in your favor.",
    ],
    [
      "Lower participation outside session hours means wider",
      "spreads and moves that reflect thin books, not always",
      "fundamental news. Earnings after 16:00 can print extreme",
      "after-hours prices that mean-revert by the 9:30 open.",
      "A stop triggering after hours may fill far from your set",
      "level — slippage analogous to overnight gaps (F-04).",
      "",
      "The NMX 100 is a synthetic basket of 100 names including",
      "NGSM. One company event moves that stock more than the",
      "index — diversification at the basket level.",
    ],
  ],
  processCheck: "Do you know what happens to the spread on your target instrument outside regular session hours — in the sim, not just in theory?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-stocks",
    line: "Practice next: log spread cost on a synthetic NGSM entry during session hours.",
  },
};
