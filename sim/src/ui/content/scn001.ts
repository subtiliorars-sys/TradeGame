/**
 * SCN-001 debrief content blocks — authored text for DebriefScene.
 * Source: SCENARIOS_V0 §SCN-001 "Debrief Screen Content".
 */

export const SCN001_DEBRIEF: Record<string, string[]> = {
  "scn001:what-happened": [
    "HarborUSD lost its algorithmic peg when selling pressure exceeded the",
    "protocol's reserve capacity. The initial dip at T0 was a genuine early",
    "warning, but protocol defense briefly restored price. The T+6 break",
    "confirmed structural failure; the T+16 bounce was short-covering in a",
    "broken market, not recovery. The terminal leg at T+26 completed the",
    "collapse. This is an archetype event: initial ambiguity, partial recovery,",
    "then collapse faster than most traders can react cleanly.",
  ],
  "scn001:good-process": [
    "• Recognizing that a depeg creates extreme uncertainty in both directions",
    "  and that position size must reflect that uncertainty.",
    "• Having a stop placed before entry, defining max loss in account % terms.",
    "• Journaling the observation at T0 even if no trade was taken.",
    "• Waiting for the T+6 confirmation before acting was a valid process choice.",
  ],
  "scn001:good-process-can-lose": [
    "A short opened at T+6 with a 1% account-risk stop above 1.00 earns full",
    "XP — even if stopped out during the T+2–T+5 recovery. That is not a",
    "process failure. It is market behavior. Good process does not guarantee",
    "a winning trade. It defines risk before entry and lets the outcome unfold.",
  ],
};
