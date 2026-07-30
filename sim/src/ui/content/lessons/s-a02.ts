/** S-A02 — Fundamental vs. technical literacy. Source: docs/CURRICULUM.md §S-A02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_A02: LessonContent = {
  id: "lesson:stocks-a02-fundamental-technical",
  curriculumId: "S-A02",
  title: "Fundamental vs. Technical Literacy",
  track: "stocks",
  pages: [
    [
      "Two lenses, not two religions:",
      "",
      "Fundamental analysis asks 'What is this business worth?'",
      "by looking at cash flow, balance sheets, and growth.",
      "Technical analysis asks 'What are market participants",
      "doing right now?' by looking at price and volume.",
      "",
      "They are not mutually exclusive. A strong fundamental",
      "thesis can still suffer a 40% drawdown if you ignore",
      "market structure."
    ],
    [
      "Respective failure modes:",
      "",
      "The fundamental failure mode is being 'right but early'—",
      "holding a position while the market disagrees, leading to",
      "margin calls or opportunity cost.",
      "",
      "The technical failure mode is pattern myopia—trading a",
      "chart setup right before an earnings release that",
      "invalidates the technical structure."
    ]
  ],
  processCheck: "Do you know which information each approach cannot give you?",
  cta: { kind: "scenario", id: "SCN-002", line: "Replay the earnings gap scenario with both lenses." }
};
