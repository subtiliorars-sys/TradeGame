/** C-B02 — Wallets and custody. Source: docs/lessons/PILLAR_INTROS.md §C-B02. */
import type { LessonContent } from "../../../lessons/types.js";

export const LESSON_C_B02: LessonContent = {
  id: "lesson:wallets-and-custody",
  curriculumId: "C-B02",
  title: "Wallets and Custody",
  track: "crypto",
  pages: [
    [
      "In legacy finance, a bank holds your money and you hold",
      "a claim against the bank. In crypto, you can be your own",
      "custodian by controlling the private key — the secret",
      "that authorizes transactions from a wallet address.",
      "",
      "Exchange custody: when tokens sit on an exchange balance,",
      "you do not hold a private key. You hold a promise. If the",
      "exchange is hacked, insolvent, or freezes withdrawals,",
      "your credited balance may be inaccessible or gone.",
    ],
    [
      "Hot wallets store keys on internet-connected devices.",
      "You control the key — exchange custody risk disappears.",
      "New risk: malware, phishing, or a compromised seed phrase",
      "can drain the wallet without any platform involved.",
      "",
      "Cold wallets keep keys offline on hardware or air-gapped",
      "machines. Signing requires physical access. Tradeoff:",
      "lower attack surface, but physical loss of the seed phrase",
      "means permanent loss of access — no password reset.",
    ],
    [
      "The seed phrase (12 or 24 words) IS the wallet. Anyone",
      "with it controls the funds. Back it up on paper or metal;",
      "never in cloud storage.",
      "",
      "The game's paper sandbox has no real custody layer. Before",
      "holding real tokens, understand the custody spectrum —",
      "where you hold them is a separate risk decision from",
      "what you hold.",
    ],
  ],
  processCheck: "Name one risk that exchange custody introduces and one risk that self-custody introduces — mechanically, not just conceptually.",
  cta: {
    kind: "drill",
    id: "drill:stop-placement-crypto",
    line: "Practice next: place a stop on a synthetic spot position and journal the custody choice you would make.",
  },
};
