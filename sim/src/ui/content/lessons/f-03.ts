/** F-03 — Position sizing. Source: docs/lessons/FOUNDATION.md §F-03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_03: LessonContent = {
  id: "lesson:position-sizing",
  curriculumId: "F-03",
  title: "Position Sizing",
  track: "foundation",
  pages: [
    [
      "Position sizing is the most controllable variable in",
      "trading. Direction is a guess; sizing is math.",
      "",
      "Risk a fixed, small percentage of your account per",
      "trade — never a fixed dollar amount, never a round",
      "lot count, never whatever feels right.",
      "",
      "Education contexts often start at 1–2% per trade. That",
      "is not magic — it follows from drawdown math (F-06).",
      "Define the loss amount first, then size to that stop.",
    ],
    [
      "The formula:",
      "",
      "Dollar risk = Account × Risk %",
      "Size = Dollar risk ÷ Stop distance (per unit)",
      "",
      "Run this before every entry. If the math yields a size",
      "that feels too small, that feeling is about your risk",
      "appetite — not a reason to skip the math.",
    ],
    [
      "Example — fictional pair ANDU:",
      "Account $5,000 · Risk 1% → $50 at risk",
      "Entry 1.2830 · Stop 1.2790 (40 pips)",
      "Sim: $10 per pip per lot → $400 risk per full lot",
      "",
      "Size = $50 ÷ $400 = 0.125 lots",
      "",
      "One full lot would lose $400 (8% of account) on the",
      "same stop. The gap is discipline, not confidence.",
    ],
  ],
  processCheck: "Can you calculate share or lot size from account, risk %, and stop distance — without guessing?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-forex",
    line: "Practice next: run the sizing formula on the forex variant.",
  },
};
