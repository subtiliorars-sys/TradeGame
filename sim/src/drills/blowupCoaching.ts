/**
 * Blowup debrief coaching copy — 3 markets × 4 mechanisms (brief W5-7).
 * Process framing only: names mechanics, never dollar outcomes.
 * Provenance: lesson F-08, screen drill-debrief-blowup-annotated-replay.
 */

import type { BlowupMechanism } from "./blowupClassifier.js";

type Market = "crypto" | "stocks" | "forex";

const COPY: Record<Market, Record<BlowupMechanism, string>> = {
  crypto: {
    oversize:
      "GLIMMER's volatility amplifies oversized entries fast. Each fill in the replay " +
      "marked 'oversized' committed more of the sim account than a single decision should. " +
      "The margin model didn't fail — position scale did.",
    no_stop:
      "Crypto moves in gaps. The replay rows without a companion stop show entries that " +
      "had no defined exit before the next tick. In a live sim that's how a small move " +
      "becomes a full account event.",
    add_to_losers:
      "Adding in the same direction while a long was already open (see 'added to position' " +
      "flags) stacked exposure instead of cutting it. The engine counted each same-side " +
      "add after the position aged — that's the habit this drill surfaces.",
    combined:
      "No single mechanism dominated — the replay shows a mix of scale, missing stops, and " +
      "same-direction adds. Real blowups often combine habits; the lesson is reading your " +
      "own sequence, not picking one villain.",
  },
  stocks: {
    oversize:
      "On a cash sim account, ruin still happens when each entry uses too much of what's " +
      "left. The 'oversized' flags mark fills that exceeded a safe fraction of account scale " +
      "at submit time — the sequence, not the ticker, drove the empty account.",
    no_stop:
      "Stocks can gap through a mental stop. Rows marked without a protective stop show " +
      "entries that had no engine-enforced exit. The drill isn't about this symbol — it's " +
      "about trading without a defined risk boundary.",
    add_to_losers:
      "Averaging into a losing long (same-direction adds after the position aged) increased " +
      "exposure while the replay already showed open risk. The annotated flags are the " +
      "process read — close or reduce first, then decide again.",
    combined:
      "The replay mixed oversized entries, unprotected fills, and same-direction adds. " +
      "Cash accounts feel safer until habits stack. Name what you see in your own sequence.",
  },
  forex: {
    oversize:
      "Leverage on ANDU makes oversized lots lethal quickly. Each 'oversized' row is a fill " +
      "that committed too much notional relative to equity at that tick — the margin math " +
      "worked exactly as designed.",
    no_stop:
      "Forex stop-outs are mechanical. Fills without a companion stop in the replay had no " +
      "protection before the next price tick — on leveraged sim that's the fastest path to " +
      "the account floor you just watched.",
    add_to_losers:
      "Adding to an aging long in the same direction (flagged in the replay) stacked margin " +
      "use while the first lot was still open. The lesson is sequence: reduce, then re-evaluate.",
    combined:
      "Leverage magnifies mixed habits — scale, missing stops, and adds all appeared. " +
      "The debrief question asked which pattern dominated; when none did, the teaching is " +
      "that ruin is often multi-causal.",
  },
};

export function blowupCoachingCopy(market: Market, mechanism: BlowupMechanism): string {
  return COPY[market][mechanism];
}

export const MECHANISM_OPTIONS: Array<{ id: BlowupMechanism; label: string }> = [
  { id: "oversize", label: "Oversized entries relative to account" },
  { id: "no_stop", label: "Entries without a protective stop" },
  { id: "add_to_losers", label: "Adding to an existing same-direction position" },
  { id: "combined", label: "No single dominant pattern (mixed)" },
];
