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
import { allScenarios, scenarioSeed } from "../../scenarios/registry.js";
import { currentRank, ladderViewModel } from "../../engine/rank.js";
import * as ProgressStore from "../../engine/progress.js";
import { scenarioLockState } from "../engine/gating.js";

// ---------------------------------------------------------------------------
// Card-only display fields — not duplicated in the manifest
// ---------------------------------------------------------------------------

interface CardExtras {
  subtitle: string;
}

/** Display-only fields per scenario ID, not duplicated from the manifest. */
const CARD_EXTRAS: Record<string, CardExtras> = {
  "SCN-001": { subtitle: "" },
  "SCN-002": { subtitle: "Earnings Gap & Fade" },
  "SCN-003": { subtitle: "" },
  "SCN-004": { subtitle: "AMM Liquidity & IL" },
  "SCN-005": { subtitle: "Mechanical Flow & the Auction" },
  "SCN-006": { subtitle: "Scheduled News & the Policy Card" },
};

// (XP display now uses live ProgressStore + RankService — stubs removed §4.5)

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
    this.drawRankLadder(g, width);
    this.drawFooter(g, width, height);
  }

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  private drawHeader(g: Phaser.GameObjects.Graphics, width: number): void {
    // LESSONS entry — read-then-do; lessons feed scenario prereqs (advisory
    // in wave 1) and the drill provenance chain.
    const lb = button(
      this,
      width - PAD - 150,
      PAD + 42,
      150,
      34,
      "LESSONS",
      () => this.scene.start("LessonScene"),
      { fillColor: C.SURFACE, textColor: CSS.AMBER, fontSize: "12px" }
    );
    void lb;

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
  // Scenario card grid — 3 cards per row, wrapping (6 scenarios = 2 rows)
  // -------------------------------------------------------------------------

  private drawScenarioGrid(
    g: Phaser.GameObjects.Graphics,
    width: number,
    _height: number
  ): void {
    const scenarios = allScenarios();
    const cols = Math.min(3, scenarios.length);
    const totalW = cols * CARD_W + (cols - 1) * PAD;
    const startX = (width - totalW) / 2;
    const startY = PAD + 96;

    scenarios.forEach((scn, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = startX + col * (CARD_W + PAD);
      const cy = startY + row * (CARD_H + PAD);
      const extras = CARD_EXTRAS[scn.manifest.id] ?? { subtitle: "" };
      this.drawCard(g, cx, cy, scn.manifest.id, scn.manifest, extras);
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

    // Difficulty (from the manifest — single source of truth) + duration
    label(this, x + 12, y + 108, `${manifest.difficulty}  ·  ${durationStr}`, {
      fontSize: "11px",
      color: CSS.DIM,
    });

    // Seed (canonical UI play seed — visible for determinism transparency)
    const seed = scenarioSeed(scenarioId);
    label(this, x + 12, y + 128, `Seed: ${seed}`, {
      fontSize: "10px",
      color: CSS.DIM,
    });

    hline(g, x + 12, y + 148, CARD_W - 24);

    // Gating (wave D): scenario-completion prereqs hard-lock the card with
    // an explicit reason (§4.5 — never a silent stall); rank and drill/lesson
    // requirements render as advisories until those systems ship (see
    // ui/engine/gating.ts for the softlock rationale).
    const lockState = scenarioLockState(
      manifest,
      currentRank(ProgressStore.xpTotal(), ProgressStore.completedDrillIds()).rank.rankId,
      ProgressStore.completedScenarioIds()
    );

    const bw = CARD_W - 24;
    const bh = 36;
    const by = y + CARD_H - bh - 12;

    if (lockState.locked) {
      // Locked: explicit gate panel in place of START.
      fillRect(g, x + 12, by, bw, bh, C.SURFACE, 4);
      strokeRect(g, x + 12, by, bw, bh, C.BORDER, 1, 4);
      label(this, x + 12 + bw / 2, by + bh / 2, `LOCKED — ${lockState.reasons[0] ?? ""}`, {
        fontSize: "11px",
        color: CSS.DIM,
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5);
    } else {
      const b = button(this, x + 12, by, bw, bh, "START", () =>
        this.startScenario(scenarioId)
      );
      void b;
    }

    // Advisory line (rank / drills) — informational, never blocking.
    if (lockState.advisories.length > 0) {
      label(this, x + 12, y + 152, lockState.advisories.join("  ·  "), {
        fontSize: "9px",
        color: CSS.DIM,
        fontStyle: "italic",
        wordWrap: { width: CARD_W - 24 },
      });
    }
  }

  // -------------------------------------------------------------------------
  // XP / Rank progress bar
  // -------------------------------------------------------------------------

  private drawProgressBar(
    g: Phaser.GameObjects.Graphics,
    width: number,
    _height: number
  ): void {
    // Position: below card grid (which wraps at 3 columns), above footer.
    const rows = Math.ceil(allScenarios().length / 3);
    const barY = PAD + 96 + rows * (CARD_H + PAD) + 12;

    const xp = ProgressStore.xpTotal();
    const drills = ProgressStore.completedDrillIds();
    const { rank, nextRank, xpIntoRank, xpToNextRank, drillsMissing } =
      currentRank(xp, drills);

    if (nextRank === null) {
      // Top rank: no bar, no treadmill (GDD §4.5).
      label(this, PAD, barY, `Your Progress:  Rank: ${rank.displayLabel}`, {
        fontSize: "13px",
        color: CSS.DIM,
      });
      return;
    }

    // Rank label + XP text (§4.5 display format — both numbers are cumulative).
    const xpLine =
      `Your Progress:  Rank: ${rank.displayLabel}` +
      `   XP: ${xp} / ${nextRank.xpRequired} to ${nextRank.displayLabel}`;
    label(this, PAD, barY, xpLine, {
      fontSize: "13px",
      color: CSS.DIM,
    });

    // Bar track — process XP only, no outcome component (§4.4).
    const barW = width - PAD * 2;
    const barH = 8;
    fillRect(g, PAD, barY + 22, barW, barH, C.SURFACE, 4);
    strokeRect(g, PAD, barY + 22, barW, barH, C.BORDER, 1, 4);

    if (drillsMissing.length > 0) {
      // Drill gate: bar shows full; explicit gate message (never a silent stall).
      fillRect(g, PAD, barY + 22, barW, barH, C.AMBER, 4);
      label(
        this,
        PAD,
        barY + 38,
        `Complete ${drillsMissing[0]} to advance`,
        { fontSize: "10px", color: CSS.AMBER, fontStyle: "italic" }
      );
    } else {
      // Normal fill: (xpTotal − rank.xpRequired) / (nextRank.xpRequired − rank.xpRequired).
      const span = nextRank.xpRequired - rank.xpRequired;
      const fill = span > 0 ? Math.min(1, xpIntoRank / span) : 0;
      fillRect(g, PAD, barY + 22, Math.round(barW * fill), barH, C.AMBER, 4);
      // xpToNextRank surfaced for completeness — drive is to-next, not from-start.
      void xpToNextRank;
      label(this, PAD, barY + 38, "< Process XP only — no outcome component >", {
        fontSize: "10px",
        color: CSS.DIM,
        fontStyle: "italic",
      });
    }
  }

  // -------------------------------------------------------------------------
  // Rank ladder strip — full §4.5 ladder (Governor wave-E candidate (b))
  // -------------------------------------------------------------------------

  /**
   * Six-rung horizontal ladder under the progress bar: achieved rungs filled,
   * current rung highlighted, future rungs dimmed, drill-gated rungs marked
   * explicitly. Thresholds are TUNABLE economy numbers displayed verbatim.
   * §4.4: process XP and drill data only — no outcome component.
   */
  private drawRankLadder(g: Phaser.GameObjects.Graphics, width: number): void {
    const rows = Math.ceil(allScenarios().length / 3);
    const y = PAD + 96 + rows * (CARD_H + PAD) + 64;

    const rungs = ladderViewModel(
      ProgressStore.xpTotal(),
      ProgressStore.completedDrillIds()
    );

    label(this, PAD, y, "RANK LADDER", {
      fontSize: "10px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    label(this, PAD + 92, y, "(thresholds TUNABLE — process XP + drill gates only)", {
      fontSize: "9px",
      color: CSS.DIM,
      fontStyle: "italic",
    });

    const stripY = y + 16;
    const segW = Math.floor((width - PAD * 2 - (rungs.length - 1) * 6) / rungs.length);
    const segH = 34;

    rungs.forEach((rung, i) => {
      const sx = PAD + i * (segW + 6);
      const isCurrent = rung.state === "current";
      const isAchieved = rung.state === "achieved";
      const isGated = rung.state === "gated";

      fillRect(g, sx, stripY, segW, segH, isCurrent || isAchieved ? C.AMBER : C.SURFACE, 3);
      strokeRect(g, sx, stripY, segW, segH, isCurrent ? C.AMBER : C.BORDER, isCurrent ? 2 : 1, 3);
      if (isAchieved) {
        // Achieved rungs: amber at reduced presence vs the current rung.
        fillRect(g, sx, stripY, segW, segH, C.SURFACE, 3);
        strokeRect(g, sx, stripY, segW, segH, C.AMBER, 1, 3);
      }

      const labelColor = isCurrent ? CSS.BG : isAchieved ? CSS.AMBER : CSS.DIM;
      label(this, sx + 6, stripY + 6, rung.displayLabel, {
        fontSize: "10px",
        color: labelColor,
        fontStyle: isCurrent ? "bold" : "normal",
      });
      label(
        this,
        sx + 6,
        stripY + 20,
        isGated
          ? `${rung.xpRequired} XP · drill gate`
          : `${rung.xpRequired} XP`,
        { fontSize: "9px", color: isCurrent ? CSS.BG : CSS.DIM }
      );
    });

    // Drill-gate slots are authored-but-empty until the drill system ships —
    // say so explicitly rather than implying ranks are XP-only.
    label(
      this,
      PAD,
      stripY + segH + 6,
      "Drill gates per rank arrive with the drill system — XP alone will not advance past them (GDD §7).",
      { fontSize: "9px", color: CSS.DIM, fontStyle: "italic" }
    );
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
