/** F-01 — What a market is. Source: docs/lessons/FOUNDATION.md §F-01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_01: LessonContent = {
  id: "lesson:what-a-market-is",
  curriculumId: "F-01",
  title: "What a Market Is",
  track: "foundation",
  pages: [
    [
      "Every market is a matching engine. Buyers state what they",
      "will pay (the bid). Sellers state what they will accept",
      "(the ask). When a buyer meets the lowest ask, a trade",
      "happens. The price on a chart is the last match — not a",
      "decree from any authority.",
      "",
      "Whoever is most urgent moves the tape: buyers who must",
      "enter meet the ask; sellers who must exit meet the bid.",
    ],
    [
      "The gap between bid and ask is the spread. You pay it",
      "every time you enter, whether you notice or not. On",
      "liquid instruments the spread is tiny; on thin books it",
      "can erase edge before price moves.",
      "",
      "The order book is two queues: limit buys below price,",
      "limit sells above. News drains or fills those queues.",
      "Price moves when buyer urgency and seller urgency shift.",
    ],
    [
      "Example — fictional VRXC/USD:",
      "Best bid 10.42 · Best ask 10.44 · Spread 0.02",
      "",
      "A market-buy for 100 units pays 10.44, not 10.42.",
      "You are immediately down $2.00 before price ticks.",
      "To break even VRXC must move from 10.44 to 10.46+.",
      "",
      "High-frequency entries in illiquid books bleed accounts",
      "even when direction is eventually right.",
    ],
  ],
  processCheck: "Can you explain what determines price at any moment — and who pays the spread on entry?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-crypto",
    line: "Practice next: size a position after observing bid/ask and spread cost.",
  },
};
