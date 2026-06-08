/**
 * SCN-006 debrief content blocks — authored text for DebriefScene.
 * Source: SCENARIOS_V1 §SCN-006 "Debrief Screen Content".
 */

export const SCN006_DEBRIEF: Record<string, string[]> = {
  "scn006:what-happened": [
    "The Monthly Labor Conditions Report released at T0. ANDU spiked 75 pips",
    "in under 10 seconds while the spread blew out to 14 pips — a market order",
    "at T0+03s bought 14 pips above the chart's last visible ask. The spike",
    "reversed immediately into a 130-pip whipsaw to 1.3185, stopping out",
    "nearly every position opened in either direction during the spike.",
    "Spread normalized by T+03; ANDU then built a clear upward trend from the",
    "whipsaw low, reaching 1.3290 by T+75.",
  ],
  "scn006:good-process": [
    "• Completing the News Policy Card before the report window, with a written",
    "  rationale — option A (flat), B (sized for the event), or C (observe).",
    "• If holding through: a stop far enough from the pre-report price to",
    "  survive spike + spread blowout together (~90+ pips here).",
    "• Not entering during the whipsaw (T0 to T0+45s) — the highest spread cost",
    "  and lowest directional signal in the scenario.",
    "• Waiting for spread normalization and the confirming higher low, then",
    "  sizing any entry to the ACTUAL stop distance at 1% account risk.",
  ],
  "scn006:good-process-can-lose": [
    "A player who declares option B — journaling \"assuming up to 12 pips",
    "spread, stop at 1.3140 (100 pips below pre-report)\" — and sizes for",
    "100 pips at 1% risk follows correct process. If the post-whipsaw trend",
    "runs against the thesis and hits 1.3140, that is a correct-process loss:",
    "the stop was sized for the event; the direction was wrong, not the",
    "process. Full XP. Equally: option C, observing the whole event without a",
    "trade, earns full XP — the no-trade-zone is a complete policy.",
  ],
  "scn006:common-errors": [
    "• Not completing the News Policy Card before the window (most common — no",
    "  declared policy).",
    "• Entering during the whipsaw at maximum spread (T0 to T0+45s).",
    "• Using a tight stop (10–20 pips) while holding through a news event with",
    "  expected spread blowout of 8–14 pips.",
    "• Stop-widening manually during the spike to \"avoid getting stopped out.\"",
    "• Chasing the initial spike direction long, then the whipsaw short, in",
    "  rapid succession (two-direction revenge trading in under 45 seconds).",
  ],
};
