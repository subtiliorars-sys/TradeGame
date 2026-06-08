/**
 * SCN-004 debrief content blocks — authored text for DebriefScene.
 * Source: SCENARIOS_V1 §SCN-004 "Debrief Screen Content".
 */

export const SCN004_DEBRIEF: Record<string, string[]> = {
  "scn004:what-happened": [
    "HarborUSD/GLIMMER on ArcSwap offered a high-APY liquidity pool. GLIMMER",
    "increased 63% from the deposit price, creating an impermanent loss of",
    "approximately 2.9% at peak divergence. Fee income had accrued to",
    "approximately 1.4% by that point — a net deficit of approximately 1.5%",
    "vs. simply holding the raw assets. When GLIMMER corrected to 5.40, IL",
    "narrowed to approximately 0.8% and cumulative fees reached 2.5%, making",
    "the LP position net positive.",
  ],
  "scn004:good-process": [
    "• Writing a journal entry before deposit stating the deposit size rationale",
    "  and at minimum one withdrawal trigger (a divergence threshold, a",
    "  time-stop, or a net-vs-HODL floor).",
    "• Reading the LP Position Panel at each decision point — the Net vs. HODL",
    "  line is the whole comparison.",
    "• Estimating IL before looking at the panel value — practicing the math",
    "  builds the intuition.",
    "• Defining a new withdrawal trigger after any decision to hold.",
  ],
  "scn004:good-process-can-lose": [
    "A player who deposits at T0 with a journal entry stating \"I will withdraw",
    "if net vs. HODL falls below −3%,\" who monitors the panel at each",
    "checkpoint, and who withdraws when net vs. HODL reaches approximately",
    "−1.5% has followed good process and taken a net loss vs. a HODL position.",
    "The loss vs. HODL is the cost of the strategy under the price conditions",
    "that occurred. It is not a process failure.",
  ],
  "scn004:common-errors": [
    "• Depositing without writing a withdrawal trigger in the journal (most",
    "  common).",
    "• Adding to the pool when price is already diverging (amplifies IL",
    "  mid-scenario).",
    "• Holding through major divergence with no exit plan, then withdrawing",
    "  reactively at the worst point.",
    "• Conflating high APY at deposit time with a guaranteed yield — APY is a",
    "  trailing fee rate, not a forward promise.",
  ],
};
