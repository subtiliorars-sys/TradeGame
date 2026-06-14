/** C-B05 — Grid failure modes. Source: docs/lessons/BEGINNER_COMPLETIONS.md §C-B05. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B05: LessonContent = {
  id: "lesson:grid-failure-modes",
  curriculumId: "C-B05",
  title: "Grid Failure Modes",
  track: "crypto",
  pages: [
    [
      "After weeks of range cycles, news hits. GLIMMER breaks",
      "below your grid floor and trends. The grid has no",
      "\"range ended\" switch — it already filled buys at $48,",
      "$46, $44 with sells unfilled above. One-sided long",
      "exposure you did not choose as a directional bet.",
      "",
      "Two weeks of $2 cycles can be erased by one trend leg",
      "because inventory loss scales with the move, not per",
      "cycle gain.",
    ],
    [
      "Psychological trap: \"It always came back.\" The market",
      "does not owe your grid a reversion. Regimes end (C-B03).",
      "Process failure is waiting without a pre-set invalidation",
      "level or pause rule.",
      "",
      "Pre-deploy decisions: max grid capital, range invalidation",
      "price, pause mechanism before drawdown forces the call.",
    ],
    [
      "24/7 markets (C-B03) let breakouts run hours before you",
      "see them. Unmonitored grids can stack inventory with no",
      "human decision point — journal when you would pause.",
    ],
  ],
  processCheck:
    "Did you feel the urge to wait for recovery when underwater — and can you name the pre-deployment rule that should fire first?",
  cta: {
    kind: "scenario",
    id: "SCN-001",
    line: "Practice next: replay SCN-001 and journal inventory/range thesis vs cascade.",
  },
};
