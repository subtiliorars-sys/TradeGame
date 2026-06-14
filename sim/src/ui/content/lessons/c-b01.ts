/** C-B01 — Spot mechanics. Source: docs/lessons/PILLAR_INTROS.md §C-B01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B01: LessonContent = {
  id: "lesson:spot-mechanics-crypto",
  curriculumId: "C-B01",
  title: "Spot Mechanics",
  track: "crypto",
  pages: [
    [
      "When you buy GLIMMER on a spot market, you hand over",
      "HarborUSD and receive GLIMMER. You own it. If GLIMMER",
      "drops 40%, you have lost 40% of what you put in — no",
      "more, no less. Spot caps your downside at your stake.",
      "",
      "Margin trading works differently. A broker lends capital",
      "on top of your deposit. With 5× leverage, a $200 deposit",
      "controls a $1,000 position. A 10% move against you",
      "costs $100 on the full position — your entire $200 margin.",
      "Leverage removes the floor that spot provides.",
    ],
    [
      "Worked example — $500, GLIMMER at $50:",
      "",
      "Spot: buy 10 GLIMMER. Price drops to $30. Hold $300.",
      "Loss: $200 (40%). GLIMMER can recover; you still own it.",
      "",
      "Margin (5×): $500 controls $2,500 — 50 GLIMMER.",
      "Price drops to $30. Position value $1,500. Loss on",
      "position: $1,000. Your $500 margin is gone before any",
      "recovery. Neither outcome predicts GLIMMER — the point",
      "is structural: spot bounds loss; margin does not.",
    ],
    [
      "TradeGame's paper sandbox starts you on spot-only pairs.",
      "Practice buying at market, setting a limit below price,",
      "and selling. Notice the bid-ask spread and that fill",
      "price may differ from the quote — that gap is spread cost.",
      "",
      "Aggregate loss data (F-09, X-B02) shows leverage is the",
      "most consistent differentiator between accounts that",
      "survive and accounts that do not. Spot is where you",
      "build mechanics before adding complexity.",
    ],
  ],
  processCheck: "Can you articulate — in writing — why margin is mechanically different from spot, independent of how confident you feel about direction?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-crypto",
    line: "Practice next: size a spot GLIMMER position using your risk rule.",
  },
};
