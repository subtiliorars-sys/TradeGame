/**
 * SCN-003 debrief content blocks — authored text for DebriefScene.
 * Source: SCENARIOS_V0 §SCN-003 "Debrief Screen Content" (lines 532–567).
 */

export const SCN003_DEBRIEF: Record<string, string[]> = {
  "scn003:what-happened": [
    "At London open, ANDU swept below the Asian-session low of 1.2790 — a",
    "liquidity level where sell stops were clustered. The sweep ran stops below",
    "that level, then reversed sharply as institutional buy orders absorbed the",
    "selling. The large wick below 1.2790 on the 5-minute candle was the sweep",
    "signature. After the reversal, ANDU trended to 1.2870 across the session.",
  ],
  "scn003:sweep-vs-breakout": [
    "The initial move (08:00–08:04) was not a breakout — it was a liquidity",
    "sweep. The distinguishing features: extreme wick relative to body, rapid",
    "reversal, and the speed at which price left the broken level. Breakouts",
    "tend to consolidate at the broken level; sweeps reject it immediately.",
  ],
  "scn003:good-process": [
    "• Not entering during the spread spike at 08:00.",
    "• Forming a sweep hypothesis before entry — journaling \"this looks like a",
    "  sweep, I am watching for reversal at 1.2800.\"",
    "• Waiting for the rejection candle (08:07) to confirm before entering long.",
    "• Setting a stop below the sweep low (1.2775 or tighter) to define risk in",
    "  pips before entry, then converting to account-risk %.",
    "• Not widening the stop during the 08:15 pullback.",
  ],
  "scn003:good-process-can-lose": [
    "A long entered at 08:07 confirmation with a stop at 1.2775 costs 37 pips",
    "of risk per unit. At 1% account risk, position size is smaller than many",
    "players expect. If price had continued lower and hit 1.2775, the stop",
    "would have been correct process. A player who entered at 08:07, set the",
    "stop at 1.2775, and got stopped out before the reversal would receive full",
    "XP. The scenario outcome does not retroactively validate a wider stop.",
  ],
  "scn003:common-errors": [
    "• Entering on the initial drop at 08:00 into the spread spike",
    "• Shorting the sweep below 1.2790 without recognizing the sweep pattern",
    "• Stop-widening during the 08:15 pullback",
    "• No pre-trade hypothesis or journal entry",
  ],
};
