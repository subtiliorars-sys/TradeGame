/** C-B02 — Wallets and custody. Source: docs/lessons/PILLAR_INTROS.md §C-B02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B02: LessonContent = {
  id: "lesson:wallets-and-custody",
  curriculumId: "C-B02",
  title: "Wallets and Custody",
  track: "crypto",
  pages: [
    [
      "Exchange custody: you see a balance; the exchange holds",
      "the keys. You hold a promise. Hack, insolvency, freeze,",
      "or shutdown can make that balance inaccessible — same",
      "cascade logic as depegs (C-I01), different trigger.",
      "",
      "Self-custody: you control the private key that authorizes",
      "spends. Exchange custody risk drops; device, malware,",
      "and phishing risk rise.",
    ],
    [
      "Hot wallet — key on an internet-connected device.",
      "Convenient; attack surface is the device.",
      "",
      "Cold wallet — key offline (hardware or air-gapped).",
      "Smaller attack surface; physical loss of seed phrase",
      "means permanent lockout — no password reset.",
      "",
      "The 12/24-word seed phrase IS the wallet. Paper or",
      "metal backup only; never cloud or screenshots.",
    ],
    [
      "The sim is synthetic — no real custody layer. Before",
      "real tokens, choose where keys live as a separate risk",
      "decision from what you trade.",
    ],
  ],
  processCheck:
    "Do you understand self-custody mechanically — what you hold on an exchange vs what you hold with keys — not just as a slogan?",
  cta: {
    kind: "drill",
    id: "drill:position-sizing-crypto",
    line: "Practice next: one spot session, then journal your custody choice and its tradeoffs.",
  },
};
