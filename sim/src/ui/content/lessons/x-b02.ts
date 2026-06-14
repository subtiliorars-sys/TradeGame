/** X-B02 — Leverage taught bluntly. Source: docs/lessons/PILLAR_INTROS.md §X-B02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_X_B02: LessonContent = {
  id: "lesson:forex-leverage-bluntly",
  curriculumId: "X-B02",
  title: "Leverage: Taught First, Taught Bluntly",
  track: "forex",
  pages: [
    [
      "Retail forex offers leverage so high you can lose your",
      "entire deposited margin on a move measured in fractions",
      "of a percent. This is the standard outcome for under-",
      "capitalized, over-leveraged accounts — not a theoretical",
      "edge case.",
      "",
      "At 50:1, a $200 deposit controls a $10,000 position.",
      "Your $200 is collateral (required margin). Maximum",
      "permitted leverage varies by jurisdiction — what is legal",
      "and what is prudent are different questions.",
    ],
    [
      "Worked liquidation — $500 account, 50:1, 2 mini lots",
      "ANDU/HarborUSD at 1.2500:",
      "",
      "Notional: 20,000 × 1.2500 = $25,000.",
      "Required margin: $25,000 ÷ 50 = $500 — entire account.",
      "Pip value: 0.0001 × 20,000 = $2.00 per pip.",
      "",
      "At 50% stop-out (margin level 0.50): equity $250.",
      "Loss to stop-out: $250 ÷ $2.00 = 125 pips against you.",
      "At max leverage there is zero buffer before the warning.",
    ],
    [
      "Disclosed retail loss rates cluster 70–80% across brokers.",
      "Forex mechanics are learnable; the loss rate tracks leverage",
      "combined with inadequate sizing — not mystery.",
      "",
      "The 'Blow up on purpose' drill asks you to over-leverage",
      "a paper account and watch margin calls in real time.",
      "Most learners are surprised how small the move is.",
      "Run the skeleton formula before every live entry:",
      "(equity − used_margin × stop_out_pct) ÷ pip_value.",
    ],
  ],
  processCheck: "Before opening any forex position, can you calculate the pip distance that triggers your broker's margin call — using only deposit, lot size, and pip value?",
  cta: {
    kind: "drill",
    id: "drill:blowup-forex",
    line: "Practice next: deliberately over-leverage and observe the margin-call sequence.",
  },
};
