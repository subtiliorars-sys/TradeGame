/** X-B01 — Pairs, quotes, pips. Source: docs/lessons/PILLAR_INTROS.md §X-B01. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_X_B01: LessonContent = {
  id: "lesson:pairs-quotes-pips",
  curriculumId: "X-B01",
  title: "Pairs, Quotes, and Pips",
  track: "forex",
  pages: [
    [
      "Forex is always a pair: you buy one currency and sell",
      "another. ANDU/HarborUSD quotes ANDU in HarborUSD —",
      "1.2450 means one ANDU costs $1.2450 HarborUSD.",
      "",
      "Long ANDU/HarborUSD: profit if ANDU strengthens (pair",
      "rises), loss if it weakens. First currency = base;",
      "second = quote.",
    ],
    [
      "A pip is usually the fourth decimal (0.0001). ANDU moves",
      "1.2450 → 1.2451 = 1 pip. Lots size the position:",
      "standard 100,000 units, mini 10,000, micro 1,000.",
      "",
      "When HarborUSD is quote currency:",
      "pip value ≈ 0.0001 × lot size → micro lot ≈ $0.10/pip.",
      "",
      "Example — $2,000 account, 1% risk ($20), 40-pip stop,",
      "micro lot $0.10/pip: risk per lot = $4 → 5 micro lots.",
      "This is F-03 math applied to pips, not intuition.",
    ],
    [
      "When HarborUSD is base or account currency differs, pip",
      "value converts at the current rate — the sizing drill",
      "walks both variants. Internalize structure first.",
    ],
  ],
  processCheck:
    "Can you calculate pip value and position size manually — without a tool — before entering any forex position?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-forex",
    line: "Practice next: forex position-sizing drill with pip and lot math.",
  },
};
