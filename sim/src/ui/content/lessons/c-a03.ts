/** C-A03 — Crypto-in-games economies. Source: docs/CURRICULUM.md §C-A03. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_A03: LessonContent = {
  id: "lesson:crypto-a03-game-economies",
  curriculumId: "C-A03",
  title: "Crypto-in-Games Economies",
  track: "crypto",
  pages: [
    [
      "Token emission vs. sink mechanics:",
      "",
      "In-game crypto economies function based on the balance",
      "between token issuance (emissions to players) and token",
      "utility (sinks where tokens are spent or burned).",
      "",
      "When emissions outpace sinks, inflation occurs. If players",
      "earn tokens faster than they need to spend them in-game,",
      "the surplus hits the open market."
    ],
    [
      "Liquidity dynamics:",
      "",
      "A game token with low liquidity is highly sensitive to",
      "selling pressure from players cashing out. The economy's",
      "sustainability depends on whether the game provides enough",
      "value that players want to buy the token, not just sell it."
    ]
  ],
  processCheck: "Can you describe how token inflation affects an in-game economy without recommending any game token?",
  cta: { kind: "drill", id: "drill:SCN-game-economy", line: "Conceptual only: game-economy simulation (TODO)." }
};
