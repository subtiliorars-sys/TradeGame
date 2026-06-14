/** C-B05 — Grid failure modes. Source: docs/lessons/BEGINNER_COMPLETIONS.md §C-B05. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B05: LessonContent = {
  id: "lesson:grid-failure-modes",
  curriculumId: "C-B05",
  title: "Grid Failure Modes",
  track: "crypto",
  pages: [
    [
      "GLIMMER ranged $44–$56 for two weeks; your grid printed",
      "cycles. Then news hits — volume expands, price breaks below",
      "$44 and continues to $38. The grid has no mechanism to",
      "recognize the range ended. It keeps placing buys as price",
      "falls. You hold open longs at $48, $46, $44 — all underwater,",
      "no matching sells. This is one-sided exposure.",
    ],
    [
      "In C-B04, per-cycle gross was $2 per unit. At $38, average",
      "cost across three open positions is ~$46. Unrealized loss:",
      "$8 per unit — four times one cycle's gross. Weeks of cycling",
      "gains can vanish in a single trend the grid was not built for.",
      "",
      "The psychological trap: 'GLIMMER will come back.' Ranging",
      "behavior was a regime — regimes end (C-B03). The correct",
      "response is to evaluate whether the range thesis still holds.",
      "If not, address inventory at current price, not wished price.",
    ],
    [
      "Pre-deployment decisions every grid needs:",
      "",
      "1. Maximum capital in grid inventory before pause or close.",
      "2. Range invalidation threshold — price where the thesis fails.",
      "3. Pause mechanism — stop new buys without closing existing.",
      "",
      "Crypto's 24/7 nature means a trend starting overnight can",
      "accumulate inventory with no human decision point. Decide",
      "thresholds before deployment — not while watching drawdown.",
    ],
  ],
  processCheck: "Did you journal the urge to 'wait for it to come back' when a grid went underwater — the feeling, not just the outcome?",
  cta: { kind: "scenario", id: "SCN-004", line: "Practice this now: observe one-sided exposure when a range thesis breaks." },
};
