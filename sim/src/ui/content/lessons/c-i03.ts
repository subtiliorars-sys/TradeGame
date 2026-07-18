/** C-I03 — Liquidity pools and impermanent loss. Source: docs/lessons/CRYPTO_INTERMEDIATE.md §C-I03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_I03: LessonContent = {
  id: "lesson:liquidity-pools-impermanent-loss",
  curriculumId: "C-I03",
  title: "Liquidity Pools and Impermanent Loss",
  track: "crypto",
  pages: [
    [
      "Decentralized exchanges use an automated market maker",
      "(AMM) instead of an order book. An AMM holds reserves of",
      "two tokens in a pool and prices them by formula. Anyone",
      "can add liquidity — becoming an LP — and earn trading",
      "fees. The cost of providing liquidity is called",
      "impermanent loss (IL). Understanding IL is not optional",
      "if you use liquidity pools; it is the primary risk.",
      "",
      "The most common AMM formula is the constant-product",
      "invariant:",
      "",
      "  x × y = k",
      "",
      "Where x and y are token reserves and k is constant.",
      "When a trader buys token A, they add B and remove A,",
      "changing the x/y ratio and therefore the price.",
    ],
    [
      "In TradeGame, the ArcSwap DEX uses this formula for",
      "HarborUSD/GLIMMER. If the pool holds 10,000 HarborUSD",
      "and 2,381 GLIMMER (k ≈ 23,810,000), GLIMMER price is",
      "10,000 / 2,381 ≈ $4.20.",
      "",
      "If GLIMMER's external price rises to $6.85, arbitrageurs",
      "buy GLIMMER from the pool until the pool price matches.",
      "This removes GLIMMER from the pool and adds HarborUSD,",
      "changing your LP share's composition.",
      "",
      "Impermanent loss — the formula:",
      "",
      "Given a price ratio r (new price / deposit price),",
      "  IL = |2 × √r / (1 + r) − 1|",
      "",
      "Two reference points:",
      "• r = 1.21 (21% higher): IL ≈ 0.45%",
      "• r = 1.63 (63% higher): IL ≈ 2.9%",
    ],
    [
      "Worked example: You deposit 420 HarborUSD and 100",
      "GLIMMER at $4.20 per token. Deposit value: $840. Pool",
      "total: 10,000 HarborUSD and 2,381 GLIMMER. Your share:",
      "~4.2%.",
      "",
      "GLIMMER rises to $6.85 (r = 1.631). Arbitrageurs buy",
      "until pool rebalances. Your 4.2% LP share now represents",
      "~536 HarborUSD and 78.3 GLIMMER.",
      "",
      "LP position value: 536 + (78.3 × $6.85) ≈ $1,073",
      "HODL baseline (held outright): 420 + (100 × $6.85)",
      "  = $1,105",
      "IL in dollars: $1,105 − $1,073 = $32 (≈ 2.9%)",
      "",
      "Your LP position still grew from $840 to $1,073 — IL is",
      "not absolute loss. It is the gap versus simple holding.",
    ],
    [
      "When LP is capital-efficient — and when it is not:",
      "",
      "LP positions earn fees from trading activity. High pool",
      "volume earns more fees faster. Fee income accrues",
      "continuously; IL accrues as price diverges.",
      "",
      "LP is most capital-efficient when:",
      "• Price stays near deposit price (IL stays small)",
      "• Pool volume is high (more fees per unit time)",
      "",
      "LP is least capital-efficient when:",
      "• Price diverges significantly (IL accumulates)",
      "• Pool volume is low (fees slow to compensate)",
      "",
      "The decision to provide liquidity is a capital allocation",
      "decision with a specific risk profile. The APY shown at",
      "deposit assumes the current price environment continues.",
      "If price diverges sharply, that APY is not what you earn.",
    ],
  ],
  processCheck:
    "Can you calculate approximate impermanent loss for a 2× price move from your deposit price without looking up the formula? If not, trust the LP Position Panel but know you cannot verify it.",
  drillCards: [
    {
      id: "c-i03-il-vs-fees",
      question:
        "GLIMMER has moved far from your LP deposit price, and the pool has quiet volume. Which read best matches the lesson?",
      options: [
        {
          id: "apy-only",
          label: "The displayed APY is enough to judge the LP position.",
          correct: false,
          feedback:
            "Not quite. The APY is based on recent fee activity. When price divergence grows and volume is quiet, fees may not keep pace with IL.",
        },
        {
          id: "position-up",
          label: "If the LP position is above its deposit value, IL no longer matters.",
          correct: false,
          feedback:
            "Not quite. IL is the gap versus holding the deposited assets outright. The LP can grow while still lagging that baseline.",
        },
        {
          id: "compare-fees-divergence",
          label: "Compare fee pace with price divergence before deciding if the LP still fits the plan.",
          correct: true,
          feedback:
            "Correct. The process read is fee income versus divergence from deposit price. The card teaches structure, not an entry or exit instruction.",
        },
      ],
    },
    {
      id: "c-i03-decision-point-c",
      question:
        "At Decision Point C, GLIMMER is far above the LP deposit price and your written trigger says to reassess at large divergence. What is the strongest process step?",
      options: [
        {
          id: "apy-display",
          label: "Use the high APY display as the main reason to keep the LP unchanged.",
          correct: false,
          feedback:
            "Not quite. APY reflects recent fee activity and assumes similar conditions. It does not replace the divergence check or the trigger you wrote before the practice scenario.",
        },
        {
          id: "automatic-failure",
          label: "Treat impermanent loss as an automatic failure whenever price moves away.",
          correct: false,
          feedback:
            "Not quite. IL is the gap versus holding outright, not proof that the LP is wrong by itself. The process question is whether the position still matches the original rationale.",
        },
        {
          id: "compare-trigger",
          label: "Compare your IL estimate, fee pace, and written trigger before changing the LP plan.",
          correct: true,
          feedback:
            "Correct. The lesson asks for planned reassessment: estimate divergence, check whether fees are compensating, and compare that read to the trigger you wrote before the move. This is review discipline, not a recommendation.",
        },
      ],
    },
  ],
  cta: { kind: "scenario", id: "SCN-004", line: "Practice this now: the GLIMMER Pool scenario." },
};
