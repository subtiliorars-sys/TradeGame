/** C-B04 — Grid strategies. Source: docs/lessons/BEGINNER_COMPLETIONS.md §C-B04. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B04: LessonContent = {
  id: "lesson:grid-strategies-how-they-work",
  curriculumId: "C-B04",
  title: "Grid Strategies: How They Work",
  track: "crypto",
  pages: [
    [
      "A grid automates buy lower, sell higher inside a range.",
      "Define upper/lower bounds, grid levels, and size per",
      "level. Buys fill below price; sells above. Per-cycle",
      "profit is the level spacing minus spread on both legs.",
      "",
      "Design condition: a ranging, mean-reverting market.",
      "When price trends out of the band, the grid keeps buying",
      "and accumulates inventory — open longs without matching",
      "sells.",
    ],
    [
      "Example — GLIMMER at $50, grid $44–$56, $2 spacing.",
      "Buy at $48, sell at $50 → ~$2 gross per unit per cycle.",
      "Spread $0.10 per fill × 2 ≈ $0.20 → net ~$1.80 if the",
      "range holds.",
      "",
      "Tighter grids: more fills, lower profit per cycle, spread",
      "eats a larger share. Wider grids: fewer fills, higher",
      "per-cycle profit if price reaches levels.",
    ],
    [
      "Inventory: each unfilled buy is exposure. Price below",
      "your lowest sell leaves underwater longs the grid cannot",
      "earn from until price returns — if it returns.",
      "",
      "C-B05 covers failure when the range thesis breaks.",
    ],
  ],
  processCheck:
    "Can you describe when a grid earns (range) vs when it accumulates inventory (trend) — using that word correctly?",
  cta: {
    kind: "scenario",
    id: "SCN-001",
    line: "Practice next: observe range vs cascade behavior in the HarborUSD scenario.",
  },
};
