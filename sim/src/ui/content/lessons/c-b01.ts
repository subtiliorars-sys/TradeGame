/** C-B01 — Spot mechanics. Source: docs/lessons/PILLAR_INTROS.md §C-B01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B01: LessonContent = {
  id: "lesson:spot-mechanics-crypto",
  curriculumId: "C-B01",
  title: "Spot Mechanics",
  track: "crypto",
  pages: [
    [
      "Spot buying is simple: you pay HarborUSD, you receive",
      "GLIMMER. You own it. If GLIMMER drops 40%, you lose",
      "40% of what you deposited — no more, no less. Loss is",
      "bounded by your stake.",
      "",
      "Margin lends capital on top of your deposit. With 5×",
      "leverage, $200 controls $1,000. A 10% move against you",
      "can wipe the full margin — not 10% of stake, 100%.",
      "Leverage removes the floor F-06 warned about.",
    ],
    [
      "Example — $500, GLIMMER at $50:",
      "",
      "Spot: 10 GLIMMER. Price → $30. Hold $300. Loss $200",
      "(40%). You still own coins if price recovers.",
      "",
      "Margin 5×: $2,500 position (50 GLIMMER). Price → $30.",
      "Position $1,500. Loss $1,000 on $500 margin — account",
      "gone before any recovery.",
    ],
    [
      "TradeGame paper sandbox starts spot-only by design.",
      "Practice market and limit orders; notice bid/ask spread",
      "and fill vs last price — spread cost from Foundation.",
      "",
      "Spot is not a consolation prize. It is where you build",
      "mechanics before adding leverage complexity.",
    ],
  ],
  processCheck:
    "Can you articulate in writing why spot caps downside at your stake while margin does not — without referencing how confident you feel?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-crypto",
    line: "Practice next: size a spot position after reading bid/ask and spread.",
  },
};
