/**
 * SCN-005 debrief content blocks — authored text for DebriefScene.
 * Source: SCENARIOS_V1 §SCN-005 "Debrief Screen Content".
 */

export const SCN005_DEBRIEF: Record<string, string[]> = {
  "scn005:what-happened": [
    "Veldara Industrial (VLDI) was announced as an NMX 100 addition on Day 1.",
    "Passive funds tracking the index had to hold VLDI at Day 5's closing",
    "price. The run from $31.40 to the $37.80 auction print — a 20% move — was",
    "driven almost entirely by anticipation of that forced buying, not by any",
    "change in VLDI's business. The auction spike WAS the passive execution.",
    "Once it completed, the demand was exhausted: the fade to $34.60 over the",
    "next two sessions had no new mechanical buyer behind it.",
  ],
  "scn005:good-process": [
    "• Labeling the driver correctly: mechanical flow from passive rebalancing,",
    "  not a change in VLDI's fundamentals.",
    "• Entering early in the run (D1/D2) if at all, with a defined exit plan",
    "  anchored to where the mechanical demand ends.",
    "• Not chasing D3 peak momentum after most of the flow-benefit was gone.",
    "• Treating the auction print as mechanics, not a tradeable level — the",
    "  post-auction reversion is the predictable consequence.",
    "• A stop in place before D5's close, protecting against the fade.",
  ],
  "scn005:good-process-can-lose": [
    "Buying VLDI on D2 at $35.00 — stop at $33.80 (the D1 close), 1% account",
    "risk, driver journaled as mechanical flow — is good process. If the D4",
    "pullback had run to $33.80 and triggered the stop, that is a",
    "correct-process loss: the thesis was reasonable and the risk was defined",
    "before entry. The debrief marks it correct process and awards full XP.",
    "That VLDI ultimately printed $37.80 does not retroactively make the stop",
    "placement wrong.",
  ],
  "scn005:common-errors": [
    "• Buying at the D1 open into the announcement gap at peak spread.",
    "• Entering at D3 peak ($36.50) after the majority of the pre-inclusion run",
    "  had already occurred.",
    "• Attempting to buy into the closing auction without understanding",
    "  fill-quality risk.",
    "• Holding through the post-inclusion fade with no new fundamental thesis.",
    "• Not labeling the driver at any point (no mention of \"mechanical flow\" in",
    "  journal).",
  ],
};
