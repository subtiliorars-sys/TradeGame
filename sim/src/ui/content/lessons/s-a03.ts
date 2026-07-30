/** S-A03 — Rebalance mechanics. Source: docs/CURRICULUM.md §S-A03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_S_A03: LessonContent = {
  id: "lesson:stocks-a03-rebalance",
  curriculumId: "S-A03",
  title: "Rebalance Mechanics",
  track: "stocks",
  pages: [
    [
      "The discipline of rebalancing:",
      "",
      "Over time, a portfolio drifts from its target allocation",
      "as some assets outperform others. Rebalancing forces you",
      "to sell high and buy low to restore the target weights.",
      "",
      "However, rebalancing too often incurs transaction costs",
      "and tax drag that can outweigh the risk-reduction benefits."
    ],
    [
      "Setting a trigger:",
      "",
      "A rebalance should be triggered by a written rule, not a",
      "feeling. Common triggers are calendar-based (e.g., quarterly)",
      "or threshold-based (e.g., when an asset drifts more than",
      "5% from its target).",
      "",
      "Without a rule, you will rationalize letting winners run",
      "until they become an outsized concentration risk."
    ]
  ],
  processCheck: "Do you have a written rebalance trigger rule, not a feeling?",
  cta: { kind: "drill", id: "drill:dca-rebalance", line: "Run DCA sim with and without quarterly rebalance." }
};
