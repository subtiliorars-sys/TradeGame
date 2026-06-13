/** F-08 — Psychology basics. Source: docs/lessons/FOUNDATION.md §F-08. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_F_08: LessonContent = {
  id: "lesson:psychology-basics",
  curriculumId: "F-08",
  title: "Psychology Basics",
  track: "foundation",
  pages: [
    [
      "You cannot interrupt a pattern you cannot name. Three",
      "patterns destroy more accounts than bad analysis:",
      "",
      "FOMO — entering after a strong move you did not plan.",
      "Timing is usually late, often before a retrace. Tell:",
      "no pre-planned stop, rationale is just it was moving.",
      "",
      "Revenge trading — re-entering fast and larger after a",
      "loss to get money back. Tell: collapsed time between",
      "trades and size up after a loss.",
    ],
    [
      "Loss aversion — feeling losses roughly twice as much as",
      "equivalent gains. You exit winners early and hold losers.",
      "Tell: moving stops when price gets close; many small wins",
      "and a few large losses.",
      "",
      "You cannot eliminate these responses. You can build",
      "systems: pre-committed stops, rules to size down or",
      "flat after a loss, and journal reflection to name which",
      "pattern fired.",
    ],
    [
      "In sim, pause at decision points: write what you feel",
      "and which pattern it matches. Compare rule-followers",
      "versus reactive traders on the same tape.",
      "",
      "Process beats mood. The journal and pre-set rules exist",
      "so you act before the feeling fully forms.",
    ],
  ],
  processCheck: "Can you name the emotional pattern you felt during practice — FOMO, revenge, or loss aversion?",
  cta: {
    kind: "scenario",
    id: "SCN-003",
    line: "Practice next: run the London open sweep and pause at each decision point.",
  },
};
