/** F-02 — Order types. Source: docs/lessons/FOUNDATION.md §F-02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_02: LessonContent = {
  id: "lesson:order-types",
  curriculumId: "F-02",
  title: "Order Types",
  track: "foundation",
  pages: [
    [
      "Your order type is your instruction to the matching",
      "engine. Getting it wrong costs money quietly.",
      "",
      "Market order: fill now at available price. Execution",
      "guaranteed; price not guaranteed (slippage in fast or",
      "thin markets).",
      "",
      "Limit order: fill only at this price or better. Price",
      "guaranteed; fill not guaranteed — your order may never",
      "execute if price never reaches your level.",
    ],
    [
      "Stop-market: when price touches the stop, send a market",
      "order. Near-guaranteed exit; fill can gap far from the",
      "stop level — especially overnight.",
      "",
      "Stop-limit: when price touches the stop, post a limit.",
      "Fills only if market returns to your limit. If price",
      "gaps through, you may hold a losing position with no",
      "fill — the failure mode beginners miss most often.",
    ],
    [
      "Tradeoff: market and stop-market prioritize certainty",
      "of exit. Limit and stop-limit prioritize certainty of",
      "price. In a crisis, exit certainty usually matters more.",
      "",
      "Example — NGSM at $42, stop-limit stop $40 / limit $39.80.",
      "Bad earnings gap opens $36.50. Stop triggers but no bids",
      "at $39.80 — first bids near $36.60. Order never fills.",
      "Stop-market would have closed near $36.55 — painful but",
      "flat.",
    ],
  ],
  processCheck: "Do you know when a stop-limit can fail to fill — and which order type prioritizes exit certainty?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-stocks",
    line: "Practice next: place entry and stop orders and name the failure mode you accept.",
  },
};
