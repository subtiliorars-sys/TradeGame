/**
 * AgeGateScene — mandatory age screen (SIM_ENGINE_SPEC §6.1, wireframe "age screen").
 *
 * Three paths:
 *   Under-13  → blocked: friendly full-stop, no account created, no storage writes.
 *   13–17     → game-only tier note, then proceeds to MenuScene.
 *   18+       → full access, proceeds to MenuScene.
 *
 * Affirmation persists to localStorage (tier category + timestamp only — PERS-W2).
 * Under-13 selections never write. Server-side account sync deferred until
 * governance Tier B gate clears (COPPA analysis staged — docs/legal/COPPA_G2_ANALYSIS.md).
 *
 * The three buttons are the only interactive elements. No close button, no skip,
 * no browser-back bypass (enforced here by scene order — MenuScene is unreachable
 * without the ageAffirmation module-level flag being set).
 */

import Phaser from "phaser";
import { C, CSS, panel, label, button, fillRect, hline } from "../engine/draw.js";
import {
  saveAgeAffirmation,
  loadAgeAffirmation,
  eraseLocalAccount,
  exportAccountData,
  type AgeTier as PersistedAgeTier,
} from "../../engine/persistence.js";

// ---------------------------------------------------------------------------
// In-memory age affirmation (mirrors persisted tier when present)
// ---------------------------------------------------------------------------

export type AgeTier = PersistedAgeTier | "under_13";

let _ageAffirmation: AgeTier | null = null;

export function getAgeAffirmation(): AgeTier | null {
  if (_ageAffirmation === null) {
    const saved = loadAgeAffirmation();
    if (saved?.acknowledged) {
      _ageAffirmation = saved.tier;
    }
  }
  return _ageAffirmation;
}

const PRIVACY_POLICY_URL =
  "https://github.com/subtiliorars-sys/TradeGame/blob/main/docs/legal/PRIVACY_DRAFT.md";

// ---------------------------------------------------------------------------
// Sub-screen keys
// ---------------------------------------------------------------------------

type SubScreen = "main" | "teen_note" | "blocked";

// ---------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------

export class AgeGateScene extends Phaser.Scene {
  private subScreen: SubScreen = "main";
  private activeObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "AgeGateScene" });
  }

  init(): void {
    const saved = loadAgeAffirmation();
    if (saved?.acknowledged) {
      _ageAffirmation = saved.tier;
      this.scene.start("MenuScene");
    }
  }

  create(): void {
    this.drawMain();
  }

  // -------------------------------------------------------------------------
  // Sub-screen renderers
  // -------------------------------------------------------------------------

  private clearScreen(): void {
    for (const obj of this.activeObjects) {
      if (obj && obj.active) obj.destroy();
    }
    this.activeObjects = [];
  }

  private drawMain(): void {
    this.clearScreen();
    this.subScreen = "main";

    const { width, height } = this.scale;
    const cx = width / 2;

    const g = this.add.graphics();
    this.activeObjects.push(g);

    fillRect(g, 0, 0, width, height, C.BG, 0);

    const title = label(this, cx, 80, "TRADEGAME", {
      fontSize: "36px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    title.setOrigin(0.5, 0.5);
    this.activeObjects.push(title);

    const pw = 540;
    const ph = 340;
    const px = cx - pw / 2;
    const py = 140;
    panel(g, px, py, pw, ph, 8);

    const heading = label(this, cx, py + 36, "Before continuing, confirm your age.", {
      fontSize: "16px",
      fontStyle: "bold",
    });
    heading.setOrigin(0.5, 0.5);
    this.activeObjects.push(heading);

    const sub = label(
      this,
      cx,
      py + 68,
      "TradeGame is an educational simulator.\nWe need your age to apply appropriate account settings.",
      {
        fontSize: "13px",
        color: CSS.DIM,
        align: "center",
      },
    );
    sub.setOrigin(0.5, 0.5);
    this.activeObjects.push(sub);

    hline(g, px + 20, py + 104, pw - 40);

    const bw = 380;
    const bh = 48;
    const bx = cx - bw / 2;

    const b18 = button(this, bx, py + 120, bw, bh, "I am 18 or older", () =>
      this.handle18Plus(),
    );
    this.activeObjects.push(b18.bg, b18.label);

    const b1317 = button(this, bx, py + 184, bw, bh, "I am 13 to 17 years old", () =>
      this.handle1317(),
    );
    this.activeObjects.push(b1317.bg, b1317.label);

    const bU13 = button(this, bx, py + 248, bw, bh, "I am under 13", () =>
      this.handleUnder13(),
    );
    this.activeObjects.push(bU13.bg, bU13.label);

    const privacy = label(this, cx, py + ph + 20, "Privacy Policy (draft)", {
      fontSize: "12px",
      color: CSS.DIM,
      fontStyle: "italic",
    });
    privacy.setOrigin(0.5, 0.5);
    privacy.setInteractive({ useHandCursor: true });
    privacy.on("pointerup", () => {
      window.open(PRIVACY_POLICY_URL, "_blank", "noopener,noreferrer");
    });
    this.activeObjects.push(privacy);

    if (loadAgeAffirmation()?.acknowledged) {
      const exportBtn = button(
        this,
        cx - 210,
        py + ph + 52,
        200,
        32,
        "EXPORT MY DATA",
        () => {
          const payload = exportAccountData();
          if (payload) {
            const blob = new Blob([JSON.stringify(payload, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "tradegame-export.json";
            a.click();
            URL.revokeObjectURL(url);
          }
        },
        { fillColor: C.SURFACE, textColor: CSS.DIM, fontSize: "11px" },
      );
      this.activeObjects.push(exportBtn.bg, exportBtn.label);

      const delBtn = button(
        this,
        cx + 10,
        py + ph + 52,
        200,
        32,
        "DELETE MY DATA",
        () => this.handleErase(),
        { fillColor: C.SURFACE, textColor: CSS.RED, fontSize: "11px" },
      );
      this.activeObjects.push(delBtn.bg, delBtn.label);
    }
  }

  private drawTeenNote(): void {
    this.clearScreen();
    this.subScreen = "teen_note";

    const { width, height } = this.scale;
    const cx = width / 2;

    const g = this.add.graphics();
    this.activeObjects.push(g);
    fillRect(g, 0, 0, width, height, C.BG, 0);

    const title = label(this, cx, 80, "TRADEGAME", {
      fontSize: "36px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    title.setOrigin(0.5, 0.5);
    this.activeObjects.push(title);

    const pw = 580;
    const ph = 300;
    const px = cx - pw / 2;
    const py = 140;
    panel(g, px, py, pw, ph, 8);

    const heading = label(this, cx, py + 36, "Welcome. Your account will be set up for solo play.", {
      fontSize: "15px",
      fontStyle: "bold",
      wordWrap: { width: pw - 40 },
      align: "center",
    });
    heading.setOrigin(0.5, 0.5);
    this.activeObjects.push(heading);

    const body = label(
      this,
      cx,
      py + 110,
      "TradeGame's coaching and replay-sharing features are\n" +
        "available when you turn 18. Everything else is fully available.\n\n" +
        "No parent or guardian email is required to play.\n" +
        "We do not collect personal information from players under 18\n" +
        "beyond what is needed to run your account.",
      {
        fontSize: "13px",
        color: CSS.DIM,
        align: "center",
        lineSpacing: 4,
      },
    );
    body.setOrigin(0.5, 0.5);
    this.activeObjects.push(body);

    const bw = 320;
    const bh = 48;
    const b = button(
      this,
      cx - bw / 2,
      py + ph - 72,
      bw,
      bh,
      "CONTINUE TO ACCOUNT SETUP",
      () => this.proceedToMenu(),
    );
    this.activeObjects.push(b.bg, b.label);
  }

  private drawBlocked(): void {
    this.clearScreen();
    this.subScreen = "blocked";

    const { width, height } = this.scale;
    const cx = width / 2;

    const g = this.add.graphics();
    this.activeObjects.push(g);
    fillRect(g, 0, 0, width, height, C.BG, 0);

    const title = label(this, cx, 80, "TRADEGAME", {
      fontSize: "36px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    title.setOrigin(0.5, 0.5);
    this.activeObjects.push(title);

    const pw = 480;
    const ph = 220;
    const px = cx - pw / 2;
    const py = 160;
    panel(g, px, py, pw, ph, 8);

    const heading = label(
      this,
      cx,
      py + 44,
      "TradeGame requires users to be at least 13 years old.",
      {
        fontSize: "15px",
        fontStyle: "bold",
        wordWrap: { width: pw - 40 },
        align: "center",
      },
    );
    heading.setOrigin(0.5, 0.5);
    this.activeObjects.push(heading);

    const sub = label(
      this,
      cx,
      py + 100,
      "Account creation is not available for users under 13.",
      {
        fontSize: "13px",
        color: CSS.DIM,
        align: "center",
      },
    );
    sub.setOrigin(0.5, 0.5);
    this.activeObjects.push(sub);

    const bw = 220;
    const bh = 44;
    const b = button(
      this,
      cx - bw / 2,
      py + ph - 66,
      bw,
      bh,
      "Return to start",
      () => this.drawMain(),
      { fillColor: C.SURFACE, textColor: CSS.TEXT },
    );
    this.activeObjects.push(b.bg, b.label);
  }

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------

  private handle18Plus(): void {
    _ageAffirmation = "18_plus";
    saveAgeAffirmation("18_plus");
    this.proceedToMenu();
  }

  private handle1317(): void {
    _ageAffirmation = "13_to_17";
    saveAgeAffirmation("13_to_17");
    this.drawTeenNote();
  }

  private handleUnder13(): void {
    this.drawBlocked();
  }

  private handleErase(): void {
    if (
      confirm(
        "This permanently deletes your local progress and age-gate settings. Proceed?",
      )
    ) {
      eraseLocalAccount();
      _ageAffirmation = null;
      window.location.reload();
    }
  }

  private proceedToMenu(): void {
    this.scene.start("MenuScene");
  }
}
