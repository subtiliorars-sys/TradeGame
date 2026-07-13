/**
 * ReplayScene — Screen 6: Replay Viewer with annotation lane.
 *
 * Renders the player's own session from the stored EventLog (the canonical
 * record, SIM_ENGINE_SPEC §5.1) — NO re-simulation: ticks, fills, and journal
 * markers come straight from the log; decision-point markers derive from the
 * scenario manifest. Pre-authored scenario annotations (scenario_authored,
 * §5.3/SG-06) render in the lane; user-generated coach annotations are
 * post-v1.
 *
 * Playback: a cursor over the tick stream with PLAY/PAUSE, step, jump-to-end,
 * 1x/4x/16x speeds, a click-to-seek scrubber, and jump-to-decision-point
 * buttons. View-only — nothing here writes to the EventLog or scoring.
 *
 * Privacy (§5.1): journal entries show wordCount + tags ONLY, even to the
 * session owner — replay is a shareable format.
 *
 * Entry: DebriefScene's VIEW REPLAY button via scene.start with ReplayData;
 * BACK TO DEBRIEF restarts DebriefScene with the original DebriefData
 * (completeDebrief is idempotent — no double XP).
 */

import Phaser from "phaser";
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
import type { SimEvent } from "../../engine/events.js";
import type { ScenarioManifest } from "../../scenarios/types.js";
import type { DebriefData } from "../engine/SessionAdapter.js";
import {
  buildReplayModel,
  fmtSimTime,
  type ReplayModel,
} from "../engine/replay.js";

export interface ReplayData {
  /** Snapshot of the session's EventLog events. */
  events: readonly SimEvent[];
  manifest: ScenarioManifest;
  /** Original DebriefData — passed back on BACK TO DEBRIEF. */
  debriefData: DebriefData;
}

// Layout (1280×800)
const PAD = 16;
const HEADER_H = 48;
const FOOTER_H = 28;
const CHART_X = PAD;
const CHART_Y = HEADER_H + PAD;
const CHART_W = 820;
const CHART_H = 420;
const LANE_X = CHART_X + CHART_W + PAD;
const LANE_W = 1280 - CHART_W - PAD * 3;
const MAX_CANDLE_TICKS = 4000; // safety: decimate beyond this many ticks

/** Replay playback speeds: ticks advanced per wall-second. */
const SPEED_TPS: Record<"1x" | "4x" | "16x", number> = {
  "1x": 30,
  "4x": 120,
  "16x": 480,
};

export class ReplayScene extends Phaser.Scene {
  private data2!: ReplayData;
  private model!: ReplayModel;

  private cursor = 0; // index into model.ticks
  private playing = false;
  private speed: "1x" | "4x" | "16x" = "4x";
  private accMs = 0;

  private gChart!: Phaser.GameObjects.Graphics;
  private gScrub!: Phaser.GameObjects.Graphics;
  private timeLbl!: Phaser.GameObjects.Text;
  private laneTexts: Phaser.GameObjects.Text[] = [];
  private speedBtns: Array<{ bg: Phaser.GameObjects.Graphics; lbl: Phaser.GameObjects.Text; key: "1x" | "4x" | "16x" }> = [];
  private playLbl: Phaser.GameObjects.Text | null = null;
  private onReplayKey: ((e: KeyboardEvent) => void) | null = null;

  constructor() {
    super({ key: "ReplayScene" });
  }

  init(data: unknown): void {
    this.data2 = data as ReplayData;
    this.cursor = 0;
    this.playing = false;
    this.speed = "4x";
    this.accMs = 0;
    this.laneTexts = [];
    this.speedBtns = [];
    this.playLbl = null;
    this.onReplayKey = null;
  }

  create(): void {
    const { width, height } = this.scale;
    this.model = buildReplayModel(this.data2.events, this.data2.manifest);

    const g = this.add.graphics();
    fillRect(g, 0, 0, width, height, C.BG, 0);

    // Header
    fillRect(g, 0, 0, width, HEADER_H, C.SURFACE, 0);
    hline(g, 0, HEADER_H, width, C.BORDER);
    label(this, PAD, HEADER_H / 2, `REPLAY — ${this.data2.manifest.id}: ${this.data2.manifest.title}`, {
      fontSize: "14px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);
    button(this, width - 200, 8, 184, 32, "BACK TO DEBRIEF", () => this.backToDebrief(), {
      fillColor: C.SURFACE,
      textColor: CSS.AMBER,
      fontSize: "11px",
    });

    // Chart + lane panels
    panel(g, CHART_X, CHART_Y, CHART_W, CHART_H, 4);
    panel(g, LANE_X, CHART_Y, LANE_W, height - CHART_Y - FOOTER_H - PAD, 4);
    label(this, LANE_X + 10, CHART_Y + 8, "ANNOTATION LANE", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });

    this.gChart = this.add.graphics();
    this.gScrub = this.add.graphics();

    // Playback controls
    const cy = CHART_Y + CHART_H + 14;
    const mkBtn = (x: number, w: number, text: string, cb: () => void) =>
      button(this, x, cy, w, 30, text, cb, { fontSize: "11px" });
    mkBtn(CHART_X, 44, "|<", () => this.seek(0));
    mkBtn(CHART_X + 52, 44, "<", () => this.seek(this.cursor - 1));
    const play = mkBtn(CHART_X + 104, 70, "PLAY", () => this.togglePlay());
    this.playLbl = play.label;
    mkBtn(CHART_X + 182, 44, ">", () => this.seek(this.cursor + 1));
    mkBtn(CHART_X + 234, 44, ">|", () => this.seek(this.model.ticks.length - 1));

    label(this, CHART_X + 300, cy + 15, "Speed:", { fontSize: "11px", color: CSS.DIM }).setOrigin(0, 0.5);
    (["1x", "4x", "16x"] as const).forEach((k, i) => {
      const b = button(this, CHART_X + 352 + i * 52, cy, 46, 30, k, () => {
        this.speed = k;
        this.refreshSpeedButtons();
      }, { fontSize: "11px" });
      this.speedBtns.push({ bg: b.bg, lbl: b.label, key: k });
    });
    this.refreshSpeedButtons();

    this.timeLbl = label(this, CHART_X + CHART_W - 8, cy + 15, "", {
      fontSize: "12px",
      color: CSS.TEXT,
    }).setOrigin(1, 0.5);

    // Jump-to-decision-point row
    const jy = cy + 40;
    label(this, CHART_X, jy + 14, "JUMP TO DECISION POINT:", {
      fontSize: "10px",
      color: CSS.DIM,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);
    this.model.dpJumpTargets.forEach((dp, i) => {
      button(this, CHART_X + 200 + i * 44, jy, 38, 28, dp.label, () => this.seek(dp.tickIdx), {
        fontSize: "11px",
      });
    });

    // Scrubber zone (click to seek)
    const sy = jy + 40;
    this.add
      .zone(CHART_X, sy - 6, CHART_W, 24)
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerup", (p: Phaser.Input.Pointer) => {
        const frac = Phaser.Math.Clamp((p.x - CHART_X) / CHART_W, 0, 1);
        this.seek(Math.round(frac * (this.model.ticks.length - 1)));
      });

    // Footer
    fillRect(g, 0, height - FOOTER_H, width, FOOTER_H, C.SURFACE, 0);
    hline(g, 0, height - FOOTER_H, width, C.BORDER);
    label(
      this,
      width / 2,
      height - FOOTER_H / 2,
      "Replay — view only. Space play/pause · ←/→ step · Home/End jump · Esc back. Education, not financial advice.",
      { fontSize: "11px", color: CSS.DIM, fontStyle: "italic" }
    ).setOrigin(0.5, 0.5);

    this.bindKeyboardShortcuts();
    this.drawAnnotationLane();
    this.seek(this.model.ticks.length - 1); // open at session end per debrief context
  }

  shutdown(): void {
    if (this.onReplayKey) {
      this.input.keyboard?.off("keydown", this.onReplayKey, this);
      this.onReplayKey = null;
    }
  }

  /** Playback shortcuts — registered once per create; removed on shutdown. */
  private bindKeyboardShortcuts(): void {
    this.onReplayKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          this.togglePlay();
          break;
        case "ArrowLeft":
          this.seek(this.cursor - 1);
          break;
        case "ArrowRight":
          this.seek(this.cursor + 1);
          break;
        case "Home":
          this.seek(0);
          break;
        case "End":
          this.seek(this.model.ticks.length - 1);
          break;
        case "Escape":
          this.backToDebrief();
          break;
        default:
          break;
      }
    };
    this.input.keyboard?.on("keydown", this.onReplayKey, this);
  }

  override update(_t: number, deltaMs: number): void {
    if (!this.playing) return;
    this.accMs += deltaMs;
    const msPerTick = 1000 / SPEED_TPS[this.speed];
    const steps = Math.floor(this.accMs / msPerTick);
    if (steps > 0) {
      this.accMs -= steps * msPerTick;
      this.seek(this.cursor + steps);
      if (this.cursor >= this.model.ticks.length - 1) this.togglePlay();
    }
  }

  // -------------------------------------------------------------------------

  private togglePlay(): void {
    // Restart from the beginning when PLAY is hit at the end.
    if (!this.playing && this.cursor >= this.model.ticks.length - 1) {
      this.seek(0);
    }
    this.playing = !this.playing;
    this.playLbl?.setText(this.playing ? "PAUSE" : "PLAY");
  }

  private refreshSpeedButtons(): void {
    for (const b of this.speedBtns) {
      b.lbl.setColor(b.key === this.speed ? CSS.AMBER : CSS.DIM);
    }
  }

  private seek(idx: number): void {
    this.cursor = Phaser.Math.Clamp(idx, 0, Math.max(0, this.model.ticks.length - 1));
    this.redrawChart();
    this.redrawScrubber();
    this.refreshAnnotationDimming();
    const t = this.model.ticks[this.cursor];
    if (t !== undefined) {
      this.timeLbl.setText(`${fmtSimTime(t.timestamp)}  ·  ${t.close.toFixed(this.priceDecimals())}`);
    }
  }

  private priceDecimals(): number {
    return this.data2.manifest.market === "stocks" ? 2 : 4;
  }

  /** Line chart of closes up to the cursor + marker overlay. */
  private redrawChart(): void {
    const g = this.gChart;
    g.clear();
    const ticks = this.model.ticks;
    if (ticks.length === 0) return;

    const upto = this.cursor + 1;
    const stride = Math.max(1, Math.ceil(ticks.length / MAX_CANDLE_TICKS));

    // Price range across the WHOLE session (stable axes while scrubbing).
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < ticks.length; i += stride) {
      const t = ticks[i];
      if (t === undefined) continue;
      if (t.close < min) min = t.close;
      if (t.close > max) max = t.close;
    }
    if (!Number.isFinite(min) || max <= min) return;
    const pad = (max - min) * 0.08;
    min -= pad;
    max += pad;

    const x0 = CHART_X + 8;
    const y0 = CHART_Y + 10;
    const w = CHART_W - 16;
    const h = CHART_H - 20;
    const xAt = (i: number): number => x0 + (i / Math.max(1, ticks.length - 1)) * w;
    const yAt = (p: number): number => y0 + (1 - (p - min) / (max - min)) * h;

    // Trace (revealed portion).
    g.lineStyle(1, C.AMBER, 1);
    let started = false;
    for (let i = 0; i < upto; i += stride) {
      const t = ticks[i];
      if (t === undefined) continue;
      const x = xAt(i);
      const y = yAt(t.close);
      if (!started) {
        g.beginPath();
        g.moveTo(x, y);
        started = true;
      } else {
        g.lineTo(x, y);
      }
    }
    if (started) g.strokePath();

    // Markers at or before the cursor.
    this.children.list
      .filter((c) => c.getData("replayMarkerLabel") === true)
      .forEach((c) => c.destroy());

    for (const m of this.model.markers) {
      if (m.tickIdx > this.cursor) continue;
      const x = xAt(m.tickIdx);
      if (m.kind === "fill" && m.price !== null) {
        g.fillStyle(C.GREEN, 1);
        g.fillCircle(x, yAt(m.price), 3.5);
      } else {
        const y = m.kind === "decision_point" ? y0 + 6 : y0 + h - 6;
        g.fillStyle(m.kind === "decision_point" ? C.AMBER : C.BORDER, 1);
        g.fillRect(x - 1, y0, 2, h);
        label(this, x, y, m.glyph, {
          fontSize: "10px",
          color: m.kind === "decision_point" ? CSS.AMBER : CSS.DIM,
          fontStyle: "bold",
        })
          .setOrigin(0.5, 0.5)
          .setData("replayMarkerLabel", true);
      }
    }
  }

  private redrawScrubber(): void {
    const g = this.gScrub;
    g.clear();
    const sy = CHART_Y + CHART_H + 94;
    fillRect(g, CHART_X, sy, CHART_W, 8, C.SURFACE, 4);
    strokeRect(g, CHART_X, sy, CHART_W, 8, C.BORDER, 1, 4);
    const frac = this.model.ticks.length > 1 ? this.cursor / (this.model.ticks.length - 1) : 0;
    fillRect(g, CHART_X, sy, Math.max(2, Math.round(CHART_W * frac)), 8, C.AMBER, 4);
  }

  private drawAnnotationLane(): void {
    const x = LANE_X + 10;
    let y = CHART_Y + 28;
    const wrapW = LANE_W - 20;
    const entries = this.model.annotations.slice(0, 14); // viewport cap
    for (const a of entries) {
      const head = `${fmtSimTime(a.simTimeMs)}  ${a.label}`;
      const headLbl = label(this, x, y, head, {
        fontSize: "10px",
        color: a.source === "scenario" ? CSS.AMBER : CSS.DIM,
        fontStyle: "bold",
      });
      headLbl.setData("annSimMs", a.simTimeMs);
      this.laneTexts.push(headLbl);
      y += 14;
      const body = label(this, x, y, a.text, {
        fontSize: "10px",
        color: CSS.TEXT,
        wordWrap: { width: wrapW },
        lineSpacing: 2,
      });
      body.setData("annSimMs", a.simTimeMs);
      this.laneTexts.push(body);
      y += body.height + 8;
      if (y > this.scale.height - FOOTER_H - 40) break;
    }
    if (this.model.annotations.length > entries.length) {
      label(this, x, y, `(+${this.model.annotations.length - entries.length} more — seek to view)`, {
        fontSize: "9px",
        color: CSS.DIM,
        fontStyle: "italic",
      });
    }
  }

  /** Dim lane entries that are still in the future at the cursor. */
  private refreshAnnotationDimming(): void {
    const t = this.model.ticks[this.cursor];
    const now = t?.timestamp ?? 0;
    for (const txt of this.laneTexts) {
      const ms = txt.getData("annSimMs") as number;
      txt.setAlpha(ms <= now ? 1 : 0.35);
    }
  }

  private backToDebrief(): void {
    this.scene.start("DebriefScene", this.data2.debriefData);
  }
}
