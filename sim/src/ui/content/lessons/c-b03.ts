/** C-B03 — 24/7 sessions and volatility. Source: docs/lessons/PILLAR_INTROS.md §C-B03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B03: LessonContent = {
  id: "lesson:crypto-sessions-volatility",
  curriculumId: "C-B03",
  title: "24/7 Sessions and Volatility",
  track: "crypto",
  pages: [
    [
      "Stocks trade defined session hours. Forex has overlapping",
      "regional sessions. Crypto order books never close — trading",
      "runs continuously, including weekends.",
      "",
      "Your stop order is live at 2 a.m. on Saturday. A move that",
      "would gap overnight in stocks happens tick by tick in crypto",
      "while you are asleep.",
      "",
      "Volatility is not constant. Markets cycle through range",
      "regimes (tight, mean-reverting) and spike regimes (explosive",
      "directional moves). Strategy and stop width must match the",
      "regime you are in, not the one you expect.",
    ],
    [
      "Reading regime from chart structure — no indicator required:",
      "",
      "1. Are candles clustered in a horizontal band, or stepping",
      "   progressively in one direction?",
      "2. Is the distance between swing highs and lows contracting",
      "   or expanding?",
      "",
      "Contraction then expansion signals compression-then-breakout.",
      "Sustained higher highs and higher lows (or lower lows) is",
      "trending. Regimes end — C-I04 develops this further.",
    ],
    [
      "Because there is no close, positions left open do not pause.",
      "Funding rates, price moves, and liquidation risks accrue",
      "continuously. Sizing for a weekend hold should account for",
      "the full possible move in that window, not just intraday",
      "ranges.",
      "",
      "Before stepping away: reduce exposure, tighten monitoring",
      "plan, or close — do not assume the market will wait.",
    ],
  ],
  processCheck: "Can you describe a volatility regime shift using only candle behavior and swing-point sequence — without referencing an indicator?",
  cta: {
    kind: "drill",
    id: "drill:stop-placement-crypto",
    line: "Practice next: set a stop width calibrated to the regime you observe on the chart.",
  },
};
