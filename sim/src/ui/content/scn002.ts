/**
 * SCN-002 debrief content blocks — authored text for DebriefScene.
 * Source: SCENARIOS_V0 §SCN-002 "Debrief Screen Content" (lines 340–369).
 */

export const SCN002_DEBRIEF: Record<string, string[]> = {
  "scn002:what-happened": [
    "Northgate Systems beat quarterly revenue by 4% but missed its forward",
    "guidance range. The gap up on the open reflected initial enthusiasm on the",
    "revenue beat. Institutions reading the guidance miss distributed into retail",
    "buyers through the 09:35–09:45 run. The fade through the gap is a well-",
    "documented archetype: when guidance disappoints, the initial gap becomes",
    "overhead resistance as early holders exit.",
  ],
  "scn002:good-process": [
    "• Writing a trade plan before the session open — entry condition, stop",
    "  level, and account-risk % — so any action was deliberate.",
    "• Waiting through the no-trade zone (first 5 minutes of the regular",
    "  session) before acting.",
    "• Reading the volume shift at 09:45 as a distribution signal rather than",
    "  a dip to buy.",
    "• Exiting a long position when the thesis (continued momentum) was",
    "  visibly invalidated.",
  ],
  "scn002:good-process-can-lose": [
    "A breakout buy above $50.10 at 09:37 with a stop at $49.20 follows good",
    "process: it is planned, sized at 1% account risk, and entered after the",
    "no-trade zone. If stopped out at $49.20 during the fade, that is a",
    "correct-process loss — the stop did its job. The debrief marks this as",
    "correct process and awards full XP. Good process does not guarantee a",
    "winning trade.",
  ],
  "scn002:common-errors": [
    "• Market buy at the 09:30 open spike (most common, worst slippage)",
    "• No pre-session journal plan",
    "• Adding to a losing long after the fade confirmed",
    "• Stop-widening after entry (\"giving it room\")",
  ],
};
