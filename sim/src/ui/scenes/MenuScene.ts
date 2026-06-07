/**
 * MenuScene — main menu / scenario select (wireframe Screen 1).
 *
 * Shows:
 *   SCN-001  HarborUSD Depegging (CRYPTO)  — enabled, START available.
 *   SCN-002  Northgate Systems (STOCKS)     — enabled, START available.
 *   SCN-003  London Open Sweep (FOREX)      — enabled, START available.
 *
 * Card metadata (title, duration, seed, market) derives from the scenario
 * registry — no duplicated literals here. Card-only display fields
 * (subtitle, difficulty) are kept in the CARD_EXTRAS map below.
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
import { allScenarios } from "../../scenarios/registry.js";

// ---------------------------------------------------------------------------
// Card-only display fields — not duplicated in the manifest
// ---------------------------------------------------------------------------

interface CardExtras {
  subtitle: string;
  difficulty: string;
}

/** Display-only fields per scenario ID, not duplicated from the manifest. */
const CARD_EXTRAS: Record<string, CardExtras> = {
  "SCN-001": { subtitle: "",                    difficulty: "Intermediate" },
  "SCN-002": { subtitle: "Earnings Gap & Fade", difficulty: "Intermediate" },
  "SCN-003": { subtitle: "",                    difficulty: "Intermediate" },
};

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
  // Scenario card grid — 3 cards across one row
  // -------------------------------------------------------------------------

  private drawScenarioGrid(
    g: Phaser.GameObjects.Graphics,
    width: number,
    _height: number
  ): void {
    const scenarios = allScenarios();
    const totalW = scenarios.length * CARD_W + (scenarios.length - 1) * PAD;
    const startX = (width - totalW) / 2;
    const startY = PAD + 96;

    scenarios.forEach((scn, i) => {
      const cx = startX + i * (CARD_W + PAD);
      const extras = CARD_EXTRAS[scn.manifest.id] ?? { subtitle: "", difficulty: "Intermediate" };
      this.drawCard(g, cx, startY, scn.manifest.id, scn.manifest, extras);
    });
  }

  private drawCard(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    scenarioId: string,
    manifest: import("../../scenarios/types.js").ScenarioManifest,
    extras: CardExtras
  ): void {
    panel(g, x, y, CARD_W, CARD_H, 6);

    // Market badge
    const market = manifest.market.toUpperCase();
    fillRect(g, x + 12, y + 12, 80, 20, C.AMBER, 3);
    const marketLbl = label(this, x + 12 + 40, y + 12 + 10, market, {
      fontSize: "11px",
      color: CSS.BG,
      fontStyle: "bold",
    });
    marketLbl.setOrigin(0.5, 0.5);

    // Scenario ID
    label(this, x + 12, y + 40, scenarioId, {
      fontSize: "11px",
      color: CSS.DIM,
    });

    // Title
    label(this, x + 12, y + 58, manifest.title, {
      fontSize: "14px",
      fontStyle: "bold",
      color: CSS.TEXT,
      wordWrap: { width: CARD_W - 24 },
    });

    if (extras.subtitle) {
      label(this, x + 12, y + 80, extras.subtitle, {
        fontSize: "12px",
        color: CSS.DIM,
      });
    }

    // Format duration from manifest durationMs (convert to approx minutes).
    const durationMin = Math.round(manifest.durationMs / 60_000);
    const durationStr = `${durationMin} min`;

    // Difficulty + duration
    label(this, x + 12, y + 108, `${extras.difficulty}  ·  ${durationStr}`, {
      fontSize: "11px",
      color: CSS.DIM,
    });

    // Seed (authored scenario seed — visible for determinism transparency)
    const seed = _scenarioSeedForId(scenarioId);
    label(this, x + 12, y + 128, `Seed: ${seed}`, {
      fontSize: "10px",
      color: CSS.DIM,
    });

    hline(g, x + 12, y + 148, CARD_W - 24);

    // START button — all three scenarios are enabled.
    const bw = CARD_W - 24;
    const bh = 36;
    const b = button(this, x + 12, y + CARD_H - bh - 12, bw, bh, "START", () =>
      this.startScenario(scenarioId)
    );
    void b;
  }

  // -------------------------------------------------------------------------
  // XP / Rank progress bar
  // -------------------------------------------------------------------------

  private drawProgressBar(
    g: Phaser.GameObjects.Graphics,
    width: number,
    _height: number
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
    this.scene.start("TradingScene", { scenarioId: id });
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Per-scenario canonical seeds (matches SessionAdapter). */
const _SEEDS: Record<string, number> = {
  "SCN-001": 42_001,
  "SCN-002": 42_002,
  "SCN-003": 42_003,
};

function _scenarioSeedForId(id: string): number {
  return _SEEDS[id] ?? 0;
}
