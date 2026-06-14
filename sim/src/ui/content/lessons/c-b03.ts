/** C-B03 — 24/7 sessions and volatility. Source: docs/lessons/PILLAR_INTROS.md §C-B03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B03: LessonContent = {
  id: "lesson:crypto-sessions-volatility",
  curriculumId: "C-B03",
  title: "24/7 Sessions and Volatility",
  track: "crypto",
  pages: [
    [
      "Crypto order books do not close. GLIMMER/HarborUSD trades",
      "every hour including weekends. Your stop is live at 2 a.m.",
      "Saturday; moves that would gap overnight in stocks print",
      "tick by tick here — while you may be away.",
      "",
      "Volatility regimes: range (mean-reverting band) vs spike",
      "(explosive directional move). Stops sized for a $5 daily",
      "range may fail in a $20 spike regime.",
    ],
    [
      "Read regime from structure — no indicator required:",
      "",
      "• Candles clustered in a horizontal band → range.",
      "• Stepping highs/lows in one direction → trend/spike.",
      "• Swing distance contracting then expanding → compression",
      "  then breakout.",
      "",
      "Regimes end. C-I04 develops period comparisons; here you",
      "learn to notice the shift.",
    ],
    [
      "Weekend exposure: open positions do not pause. Size for",
      "the full move possible while you are offline, not only",
      "intraday noise.",
    ],
  ],
  processCheck:
    "Can you label a regime shift from candle structure and swing sequence alone — without an indicator?",
  cta: {
    kind: "drill",
    id: "drill:drawdown-survival-crypto",
    line: "Practice next: watch how volatility streaks affect equity in the drawdown drill.",
  },
};
