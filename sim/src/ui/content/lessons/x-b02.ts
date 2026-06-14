/** X-B02 — Leverage taught bluntly. Source: docs/lessons/PILLAR_INTROS.md §X-B02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_X_B02: LessonContent = {
  id: "lesson:forex-leverage-bluntly",
  curriculumId: "X-B02",
  title: "Leverage: Taught First, Taught Bluntly",
  track: "forex",
  pages: [
    [
      "Retail forex offers leverage high enough to wipe margin",
      "on tiny price moves. This lesson comes before practice",
      "because the blowup drill only lands if you understand",
      "the math first.",
      "",
      "50:1 example: $200 deposit controls $10,000 notional.",
      "$200 is required margin; the rest is broker loan.",
      "Legal max leverage varies by jurisdiction — legal and",
      "prudent are different questions (X-I04 covers data).",
    ],
    [
      "Liquidation sketch — $500 account, 50:1, 2 mini lots",
      "ANDU/HarborUSD at 1.2500:",
      "",
      "20,000 units → $25,000 notional → $500 margin used.",
      "Margin level at open: 100% (warning threshold).",
      "Pip value: $2. Stop-out at 50% margin → $250 equity",
      "loss → ~125 pips against you. Zero buffer at max size.",
    ],
    [
      "Disclosed retail loss rates cluster ~70–80%+ — driven",
      "by leverage plus undersized accounts, not unreadable",
      "mechanics. The blowup drill shows margin call and",
      "stop-out distances at entry in real time.",
    ],
  ],
  processCheck:
    "Before opening forex, can you compute the pip distance to margin call from deposit, lot size, and pip value alone?",
  cta: {
    kind: "drill",
    id: "drill:blowup-forex",
    line: "Practice next: blowup drill — watch margin call sequence on purpose.",
  },
};
