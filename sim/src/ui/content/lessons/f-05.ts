/** F-05 — Risk:reward. Source: docs/lessons/FOUNDATION.md §F-05. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_05: LessonContent = {
  id: "lesson:risk-reward",
  curriculumId: "F-05",
  title: "Risk:Reward",
  track: "foundation",
  pages: [
    [
      "Risk:reward (R:R) compares loss if the stop hits to",
      "gain if the target is reached. A 1:3 R:R risks $1 to",
      "seek $3.",
      "",
      "R:R alone tells you nothing. Pair it with realistic",
      "win rate.",
      "",
      "Expectancy = (Win rate × Avg win) − (Loss rate × Avg loss)",
      "",
      "Positive expectancy means an edge over a large sample.",
      "Negative expectancy loses on average no matter how good",
      "one trade felt.",
    ],
    [
      "Trap: high win rate, tiny R:R. A 70% win rate at 1:0.8",
      "can still bleed. A 35% win rate at 1:3 can be positive.",
      "",
      "Example — Strategy A: 65% wins, ~$80 avg win on $100 risk",
      "→ expectancy about +$17 per trade.",
      "",
      "Strategy B: 40% wins, ~$250 avg win on $100 risk",
      "→ expectancy about +$40 per trade — more robust when",
      "win rate dips in a bad run.",
    ],
    [
      "Strategy C: 80% wins but only $50 on $100 risk (1:0.5)",
      "still shows positive expectancy — until a short loss",
      "streak wipes many small wins. That is why drawdown",
      "math (F-06) comes next.",
      "",
      "Process: skip trades where target and stop produce",
      "poor R:R unless your tested win rate justifies them.",
    ],
  ],
  processCheck: "Are you skipping trades with poor R:R — and do you know how win rate and R:R interact in expectancy?",
  cta: {
    kind: "drill",
    id: "drill:drawdown-survival-crypto",
    line: "Practice next: watch how R:R and win rate shape equity over many trades.",
  },
};
