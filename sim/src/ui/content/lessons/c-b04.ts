/** C-B04 — Grid strategies. Source: docs/lessons/BEGINNER_COMPLETIONS.md §C-B04. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B04: LessonContent = {
  id: "lesson:grid-strategies-how-they-work",
  curriculumId: "C-B04",
  title: "Grid Strategies: How They Work",
  track: "crypto",
  pages: [
    [
      "A grid strategy automates buy lower, sell higher within",
      "a range. When price oscillates inside a channel, the grid",
      "captures that movement without predicting direction.",
      "",
      "You define: the range (upper and lower boundary), grid",
      "levels, and size at each level. Buy limits sit below price;",
      "sell limits sit above. When price drops to a buy level it",
      "fills; when it recovers to the matching sell level, that",
      "fills. The spacing between levels is per-cycle gross profit",
      "minus spread on both fills.",
    ],
    [
      "Worked example — GLIMMER at $50, grid $44–$56, $2 spacing:",
      "Buy limits at $44, $46, $48. Sell limits at $52, $54, $56.",
      "Buy fills at $48; price recovers to $50; sell fills at $50.",
      "Per-cycle gross: $2 per unit. Spread $0.10 × 2 fills = $0.20;",
      "net $1.80 per cycle — as long as price stays in range.",
      "",
      "Wider spacing: fewer fills, higher per-cycle profit.",
      "Tighter spacing: more fills but spread eats a larger share.",
      "Spacing depends on typical daily range and spread paid.",
    ],
    [
      "The grid earns in a ranging market — mean-reverting,",
      "range-bound price. That condition is not permanent.",
      "",
      "Inventory exposure: each unfilled buy accumulates open long",
      "positions not yet matched with a sell. If price drops below",
      "the range, those positions are unrealized losses and no sell",
      "orders fill because price sits below your sell levels.",
      "The grid cannot earn from a trend; it can accumulate exposure.",
      "",
      "C-B05 covers the failure mode when the range ends.",
    ],
  ],
  processCheck: "Can you describe when a grid makes money and when it accumulates inventory risk — using the term 'inventory' correctly?",
  cta: { kind: "scenario", id: "SCN-001", line: "Practice this now: observe range vs trend behavior in the crypto scenario." },
};
