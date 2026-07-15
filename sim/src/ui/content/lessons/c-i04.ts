/** C-I04 — Volatility regimes. Source: docs/lessons/CRYPTO_INTERMEDIATE.md §C-I04. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_I04: LessonContent = {
  id: "lesson:volatility-regimes",
  curriculumId: "C-I04",
  title: "Volatility Regimes",
  track: "crypto",
  pages: [
    [
      "At the beginner level, the task was to recognize tight,",
      "oscillating price action versus explosive directional",
      "periods. At the intermediate level, the task is to",
      "understand why regime matters for strategy selection,",
      "and what the cost of ignoring it looks like in real",
      "numbers.",
      "",
      "Two regime types:",
      "",
      "Mean-reverting (range): Price oscillates between support",
      "and resistance. Grid-bots and mean-reversion entries",
      "profit from oscillation. They assume price will revert —",
      "true in a range, false in a trend.",
      "",
      "Trending (directional): Price makes successive new highs",
      "or lows. Momentum entries profit from sustained movement.",
      "True in a trend; generates whipsaws in a range.",
    ],
    [
      "Reading regime from chart structure:",
      "",
      "1. Swing-point sequence — equal highs/lows in a range;",
      "   higher highs and higher lows in an uptrend.",
      "2. Range expansion vs. contraction — expanding distance",
      "   between swings suggests trend; compression suggests",
      "   breakout building (direction uncertain).",
      "3. Volume and candle character — healthy trends show",
      "   higher volume on directional moves than pullbacks.",
      "4. Price returning to prior levels vs. leaving them",
      "   behind — ranges revisit the middle; trends do not.",
    ],
    [
      "Worked example — GLIMMER grid:",
      "",
      "GLIMMER oscillates between $44 and $56 for 12 sessions.",
      "You run a grid between $45 and $55. Session 13: GLIMMER",
      "breaks $56, closes $60, then $65. Your grid buys between",
      "$45 and $55 are all filled — but you have no sells above",
      "$60. You hold a large long at ~$50 average while price",
      "is at $65.",
      "",
      "The grid was not wrong during the range. It became the",
      "wrong tool the moment the regime shifted.",
    ],
    [
      "Strategy-to-regime matching:",
      "",
      "No strategy performs well across all regimes. The process",
      "question at session start is not \"what is my target?\" It",
      "is \"what is the current regime, and does my strategy",
      "match it?\"",
      "",
      "Changing strategy in response to a regime shift is",
      "correct adaptation. Switching mid-trade because the trade",
      "is losing — turning a range trade into a \"trend hold\" —",
      "is rationalization, not adaptation.",
      "",
      "The regime you expect is not the regime you have. Before",
      "every trade, the chart read is mandatory. Not optional.",
    ],
  ],
  processCheck:
    "Are you identifying the current regime from chart structure at session start, or entering based on what worked last week?",
  drillCards: [
    {
      id: "c-i04-regime-tool-fit",
      question:
        "GLIMMER just left a clean range and is making higher highs and higher lows. Which read keeps the lesson's process intact?",
      options: [
        {
          id: "reuse-range-tool",
          label: "Keep using the range tool because it worked during the last sessions.",
          correct: false,
          feedback:
            "Not quite. A tool that fit the prior range can become mismatched after structure changes. Start with the current chart read.",
        },
        {
          id: "switch-after-loss",
          label: "Rename the losing range trade as a trend hold after it moves against you.",
          correct: false,
          feedback:
            "Not quite. That is rationalization after the fact. Adaptation happens from a fresh regime read, not from protecting an old decision.",
        },
        {
          id: "recheck-regime-fit",
          label: "Pause and check whether the current regime still matches the strategy before acting.",
          correct: true,
          feedback:
            "Correct. The lesson is matching tool to structure first. It is not a signal to enter; it is a process check before any practice decision.",
        },
      ],
    },
  ],
  cta: { kind: "scenario", id: "SCN-004", line: "Practice this now: observe GLIMMER regime shifts in the pool scenario." },
};
