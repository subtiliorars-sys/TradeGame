/**
 * MenuScene — main menu / scenario select (wireframe Screen 1).
 *
 * Shows:
 *   SCN-001  HarborUSD Depegging (CRYPTO)  — enabled, START available.
 *   SCN-002  Northgate Systems (STOCKS)     — visible, disabled ("coming in slice 2").
 *   SCN-003  London Open Sweep (FOREX)      — visible, disabled ("coming in slice 2").
 *
 * Education-not-advice footer rendered persistently at the bottom of the screen
 * (SIM_ENGINE_SPEC §C one-liner):
 *   "Education, not financial advice. Simulated markets only. No signals, ever."
 *
 * Seed is shown on each card (authored scenario seed from the scenario definition).
 *
 * XP bar: process-only (no PnL component).
 * No locked scenario shows a countdown or pay gate — only prerequisite list.
 *
 * Guard: if AgeGateScene was bypassed (no in-memory affirmation), this scene
 * redirects back to AgeGateScene. This is the UI enforcement layer; in a full
 * deployment the server route would also guard.
 */

import Phaser from "phaser";
import { getAgeAffirmation } from "./AgeGateScene.js";
import {
  C,
  CSS,
  panel,
  label,
  button,
  fillRect,
  strokeRect,
  hline,
} from "../engine/draw.js";

// ---------------------------------------------------------------------------
// Scenario metadata (Phase 2 vertical-slice — three scenarios; only SCN-001 enabled)
// ---------------------------------------------------------------------------

interface ScenarioCard {
  id: string;
  market: string;
  title: string;
  subtitle: string;
  difficulty: string;
  duration: string;
  seed: number;
  enabled: boolean;
  disabledReason?: string;
}

const SCENARIOS: ScenarioCard[] = [
  {
    id: "SCN-001",
    market: "CRYPTO",
    title: "The HarborUSD Depegging",
    subtitle: "",
    difficulty: "Intermediate",
    duration: "40 min (10 min 4x)",
    seed: 42_001,
    enabled: true,
  },
  {
    id: "SCN-002",
    market: "STOCKS",
    title: "Northgate Systems",
    subtitle: "Earnings Gap & Fade",
    difficulty: "Intermediate",
    duration: "60 min (15 min 4x)",
    seed: 42_002,
    enabled: false,
    disabledReason: "Coming in slice 2",
  },
  {
    id: "SCN-003",
    market: "FOREX",
    title: "London Open Sweep on ANDU",
    subtitle: "",
    difficulty: "Intermediate",
    duration: "60 min (15 min 4x)",
    seed: 42_003,
    enabled: false,
    disabledReason: "Coming in slice 2",
  },
];

// ---------------------------------------------------------------------------
// XP display stub (no persistence yet — Tier B gates real storage)
// ---------------------------------------------------------------------------

const STUB_XP = 420;
const STUB_XP_NEXT = 800;
const STUB_RANK = "Trainee";

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------

const PAD = 24;
const CARD_W = 360;
const CARD_H = 200;
const FOOTER_H = 36;

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  create(): void {
    // Guard: bounce back if age gate was bypassed.
    if (getAgeAffirmation() === null) {
      this.scene.start("AgeGateScene");
      return;
    }

    const { width, height } = this.scale;
    const g = this.add.graphics();

    fillRect(g, 0, 0, width, height, C.BG, 0);

    this.drawHeader(g, width);
    this.drawScenarioGrid(g, width, height);
    this.drawProgressBar(g, width, height);
    this.drawFooter(g, width, height);
  }

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  private drawHeader(g: Phaser.GameObjects.Graphics, width: number): void {
    // Title
    const title = label(this, PAD, PAD, "TRADEGAME", {
      fontSize: "28px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    this.children.bringToTop(title);

    // Section heading
    label(this, PAD, PAD + 52, "SCENARIO LIBRARY", {
      fontSize: "13px",
      color: CSS.DIM,
      fontStyle: "bold",
    });

    hline(g, PAD, PAD + 74, width - PAD * 2);
  }

  // -------------------------------------------------------------------------
  // Scenario card grid — 3 cards across two rows
  // -------------------------------------------------------------------------

  private drawScenarioGrid(
    g: Phaser.GameObjects.Graphics,
    width: number,
    height: number
  ): void {
    // Single row of 3 cards, horizontally centred.
    const totalW = SCENARIOS.length * CARD_W + (SCENARIOS.length - 1) * PAD;
    const startX = (width - totalW) / 2;
    const startY = PAD + 96;

    SCENARIOS.forEach((scn, i) => {
      const cx = startX + i * (CARD_W + PAD);
      this.drawCard(g, cx, startY, scn);
    });
  }

  private drawCard(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    scn: ScenarioCard
  ): void {
    panel(g, x, y, CARD_W, CARD_H, 6);

    // Market badge
    const badgeColor = scn.enabled ? C.AMBER : C.BORDER;
    fillRect(g, x + 12, y + 12, 80, 20, badgeColor, 3);
    const marketLbl = label(this, x + 12 + 40, y + 12 + 10, scn.market, {
      fontSize: "11px",
      color: scn.enabled ? CSS.BG : CSS.DIM,
      fontStyle: "bold",
    });
    marketLbl.setOrigin(0.5, 0.5);

    // Scenario ID
    label(this, x + 12, y + 40, scn.id, {
      fontSize: "11px",
      color: CSS.DIM,
    });

    // Title
    label(this, x + 12, y + 58, scn.title, {
      fontSize: "14px",
      fontStyle: "bold",
      color: scn.enabled ? CSS.TEXT : CSS.DIM,
      wordWrap: { width: CARD_W - 24 },
    });

    if (scn.subtitle) {
      label(this, x + 12, y + 80, scn.subtitle, {
        fontSize: "12px",
        color: CSS.DIM,
      });
    }

    // Difficulty + duration
    label(this, x + 12, y + 108, `${scn.difficulty}  ·  ${scn.duration}`, {
      fontSize: "11px",
      color: CSS.DIM,
    });

    // Seed (authored scenario seed — visible for determinism transparency)
    label(this, x + 12, y + 128, `Seed: ${scn.seed}`, {
      fontSize: "10px",
      color: CSS.DIM,
    });

    hline(g, x + 12, y + 148, CARD_W - 24);

    if (scn.enabled) {
      // START button
      const bw = CARD_W - 24;
      const bh = 36;
      const b = button(this, x + 12, y + CARD_H - bh - 12, bw, bh, "START", () =>
        this.startScenario(scn.id)
      );
      // b refs are managed by Phaser scene graph
      void b;
    } else {
      // Disabled state — show coming-soon label
      label(this, x + 12, y + CARD_H - 44, scn.disabledReason ?? "Locked", {
        fontSize: "12px",
        color: CSS.DIM,
        fontStyle: "italic",
      });
    }
  }

  // -------------------------------------------------------------------------
  // XP / Rank progress bar
  // -------------------------------------------------------------------------

  private drawProgressBar(
    g: Phaser.GameObjects.Graphics,
    width: number,
    height: number
  ): void {
    // Position: below card grid, above footer.
    const barY = PAD + 96 + CARD_H + PAD + 12;

    label(
      this,
      PAD,
      barY,
      `Your Progress:  Rank: ${STUB_RANK}   XP: ${STUB_XP} / ${STUB_XP_NEXT} to Practitioner`,
      {
        fontSize: "13px",
        color: CSS.DIM,
      }
    );

    // Bar track
    const barW = width - PAD * 2;
    const barH = 8;
    fillRect(g, PAD, barY + 22, barW, barH, C.SURFACE, 4);
    strokeRect(g, PAD, barY + 22, barW, barH, C.BORDER, 1, 4);

    // Bar fill — process XP, no PnL
    const fill = Math.min(1, STUB_XP / STUB_XP_NEXT);
    fillRect(g, PAD, barY + 22, Math.round(barW * fill), barH, C.AMBER, 4);

    label(this, PAD, barY + 38, "< Process XP only — no PnL component >", {
      fontSize: "10px",
      color: CSS.DIM,
      fontStyle: "italic",
    });
  }

  // -------------------------------------------------------------------------
  // Persistent footer — education-not-advice (SIM_ENGINE_SPEC §C one-liner)
  // -------------------------------------------------------------------------

  private drawFooter(
    g: Phaser.GameObjects.Graphics,
    width: number,
    height: number
  ): void {
    const fy = height - FOOTER_H;
    fillRect(g, 0, fy, width, FOOTER_H, C.SURFACE, 0);
    strokeRect(g, 0, fy, width, 1, C.BORDER, 1, 0);

    const footerText = label(
      this,
      width / 2,
      fy + FOOTER_H / 2,
      "Education, not financial advice. Simulated markets only. No signals, ever.",
      {
        fontSize: "12px",
        color: CSS.DIM,
        fontStyle: "italic",
      }
    );
    footerText.setOrigin(0.5, 0.5);
  }

  // -------------------------------------------------------------------------
  // Scene transitions
  // -------------------------------------------------------------------------

  private startScenario(id: string): void {
    if (id === "SCN-001") {
      this.scene.start("TradingScene");
    }
    // SCN-002, SCN-003 are disabled — buttons not rendered for them.
  }
}
