/**
 * AgeGateScene — mandatory age screen (SIM_ENGINE_SPEC §6.1, wireframe "age screen").
 *
 * Three paths:
 *   Under-13  → blocked: friendly full-stop, no account created.
 *   13–17     → game-only tier note, then proceeds to MenuScene.
 *   18+       → full access, proceeds to MenuScene.
 *
 * Affirmation is stored IN MEMORY only this pass (no localStorage / server write).
 * Tier B gates real storage: when account persistence ships, this must be replaced
 * with a server-side write per SIM_ENGINE_SPEC §6.2 and the COPPA gate requirement.
 * DO NOT persist to localStorage until COPPA analysis is complete — §6.1 note.
 *
 * The three buttons are the only interactive elements. No close button, no skip,
 * no browser-back bypass (enforced here by scene order — MenuScene is unreachable
 * without the ageAffirmation module-level flag being set).
 */

import Phaser from "phaser";
import { C, CSS, panel, label, button, fillRect, hline } from "../engine/draw.js";

// ---------------------------------------------------------------------------
// In-memory age affirmation (Phase 2 — no persistence yet)
// ---------------------------------------------------------------------------

/**
 * Module-level flag set by AgeGateScene.
 * MenuScene checks this before rendering; if not set it bounces back to AgeGate.
 *
 * NOTE: This is intentionally NOT localStorage-persisted in Phase 2.
 * When Tier B account persistence ships, replace with a server-signed flag
 * stored in the user account record (SIM_ENGINE_SPEC §6.2).
 */
export type AgeTier = "18_plus" | "13_to_17" | "under_13";
let _ageAffirmation: AgeTier | null = null;

export function getAgeAffirmation(): AgeTier | null {
  return _ageAffirmation;
}

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

    // Background fill (Phaser backgroundColor handles the canvas, this fills scene)
    fillRect(g, 0, 0, width, height, C.BG, 0);

    // Title
    const title = label(this, cx, 80, "TRADEGAME", {
      fontSize: "36px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    title.setOrigin(0.5, 0.5);
    this.activeObjects.push(title);

    // Panel
    const pw = 540;
    const ph = 340;
    const px = cx - pw / 2;
    const py = 140;
    panel(g, px, py, pw, ph, 8);

    // Panel heading
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
      }
    );
    sub.setOrigin(0.5, 0.5);
    this.activeObjects.push(sub);

    hline(g, px + 20, py + 104, pw - 40);

    // Three buttons
    const bw = 380;
    const bh = 48;
    const bx = cx - bw / 2;

    const b18 = button(this, bx, py + 120, bw, bh, "I am 18 or older", () =>
      this.handle18Plus()
    );
    this.activeObjects.push(b18.bg, b18.label);

    const b1317 = button(this, bx, py + 184, bw, bh, "I am 13 to 17 years old", () =>
      this.handle1317()
    );
    this.activeObjects.push(b1317.bg, b1317.label);

    const bU13 = button(this, bx, py + 248, bw, bh, "I am under 13", () =>
      this.handleUnder13()
    );
    this.activeObjects.push(bU13.bg, bU13.label);
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
      }
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
      () => this.proceedToMenu()
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
      }
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
      }
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
      { fillColor: C.SURFACE, textColor: CSS.TEXT }
    );
    this.activeObjects.push(b.bg, b.label);
  }

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------

  private handle18Plus(): void {
    _ageAffirmation = "18_plus";
    this.proceedToMenu();
  }

  private handle1317(): void {
    _ageAffirmation = "13_to_17";
    this.drawTeenNote();
  }

  private handleUnder13(): void {
    // No data set — no account is created, nothing stored.
    this.drawBlocked();
  }

  private proceedToMenu(): void {
    this.scene.start("MenuScene");
  }
}
