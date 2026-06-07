/**
 * DebriefScene — Screen 5: Debrief Screen (wireframe Screen 5).
 *
 * Teaching payoff moment. Shows the process rubric, XP summary, mandatory
 * "good process can still lose" callout, and optional coaching alerts.
 *
 * Wireframe fidelity notes:
 *   - Left column: "What Happened" text + "Good Process Summary" text +
 *     mandatory "Good Process / Different Result" callout box.
 *   - Right column: Process rubric table (pass/fail/na) + XP total bar +
 *     optional coaching alert (reckless-winner and/or policy mismatch).
 *   - Buttons: "Replay Scenario" (restart same seed) + "Back to Menu".
 *
 * HARD CONSTRAINTS (SIM_ENGINE_SPEC §4.4, GDD §2, RISK_REGISTER §16):
 *   - NO PnL anywhere on this screen.
 *   - NO account-balance display.
 *   - NO comparison to other players' returns.
 *   - XP displayed is process XP only.
 *   - Reckless-winner alert is informational coaching — NOT a penalty display.
 *   - "Not-applicable" metrics rendered as "—", never as ✗.
 *
 * Receives DebriefData via Phaser scene init data (this.scene.start('DebriefScene', data)).
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
import { SessionAdapter, type DebriefData } from "../engine/SessionAdapter.js";
import * as ProgressStore from "../../engine/progress.js";
import { getScenario } from "../../scenarios/registry.js";
import type { ReplayData } from "./ReplayScene.js";

// ---------------------------------------------------------------------------
// Layout constants (1280 × 800 canvas)
// ---------------------------------------------------------------------------

const PAD = 20;
const HEADER_H = 48;
const FOOTER_H = 28;
const CONTENT_Y = HEADER_H + PAD;
const CONTENT_H = 800 - HEADER_H - FOOTER_H - PAD * 2;
const LEFT_W = 680;
const RIGHT_W = 1280 - LEFT_W - PAD * 3;
const LEFT_X = PAD;
const RIGHT_X = LEFT_X + LEFT_W + PAD;

// Debrief content strings — inline for Phase 2 (no server lookup yet).
// IDs come from ScenarioDef.manifest.debriefContentIds; we resolve them here
// by matching the known SCN-001 IDs. Future: replaced by content-loader.
const DEBRIEF_CONTENT: Record<string, string[]> = {
  "scn001:what-happened": [
    "HarborUSD lost its algorithmic peg when selling pressure exceeded the",
    "protocol's reserve capacity. The initial dip at T0 was a genuine early",
    "warning, but protocol defense briefly restored price. The T+6 break",
    "confirmed structural failure; the T+16 bounce was short-covering in a",
    "broken market, not recovery. The terminal leg at T+26 completed the",
    "collapse. This is an archetype event: initial ambiguity, partial recovery,",
    "then collapse faster than most traders can react cleanly.",
  ],
  "scn001:good-process": [
    "• Recognizing that a depeg creates extreme uncertainty in both directions",
    "  and that position size must reflect that uncertainty.",
    "• Having a stop placed before entry, defining max loss in account % terms.",
    "• Journaling the observation at T0 even if no trade was taken.",
    "• Waiting for the T+6 confirmation before acting was a valid process choice.",
  ],
  "scn001:good-process-can-lose": [
    "A short opened at T+6 with a 1% account-risk stop above 1.00 earns full",
    "XP — even if stopped out during the T+2–T+5 recovery. That is not a",
    "process failure. It is market behavior. Good process does not guarantee",
    "a winning trade. It defines risk before entry and lets the outcome unfold.",
  ],
};

// Fallback for unknown IDs (future scenarios).
function resolveContent(id: string): string[] {
  return DEBRIEF_CONTENT[id] ?? [`[Content block: ${id}]`];
}

export class DebriefScene extends Phaser.Scene {
  private debriefData!: DebriefData;

  constructor() {
    super({ key: "DebriefScene" });
  }

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  // init() receives the data passed via scene.start('DebriefScene', data)
  init(data: unknown): void {
    // Phaser passes init data as the first argument.
    if (data && typeof data === "object" && "scenarioId" in data) {
      this.debriefData = data as DebriefData;
    }
  }

  create(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();

    fillRect(g, 0, 0, width, height, C.BG, 0);

    // Reaching the debrief completes the session flow: mark it, re-score so
    // the debrief_completed row earns its +30 in THIS session (spec rubric:
    // flat, regardless of outcome), and account the final XP total exactly
    // once. completeDebrief() is idempotent; null means it already ran (e.g.
    // a Phaser scene restart) — keep the data we were handed.
    const refreshed = SessionAdapter.lastSession?.completeDebrief() ?? null;
    if (refreshed !== null && refreshed.sessionId === this.debriefData?.sessionId) {
      this.debriefData = refreshed;
      ProgressStore.addXp(refreshed.xpTotal); // single XP accounting point (§4.5)
      // Scenario-completion prereq gates (wave D): completing the debrief
      // completes the scenario — outcome plays no part.
      ProgressStore.markScenarioCompleted(refreshed.scenarioId);
    }

    this.drawHeader(g, width);
    this.drawLeftColumn(g);
    this.drawRightColumn(g);
    this.drawFooter(g, width, height);
    this.drawRankUpCard();
  }

  // -------------------------------------------------------------------------
  // Header
  // -------------------------------------------------------------------------

  private drawHeader(g: Phaser.GameObjects.Graphics, width: number): void {
    fillRect(g, 0, 0, width, HEADER_H, C.SURFACE, 0);
    hline(g, 0, HEADER_H, width, C.BORDER);

    const title = this.debriefData
      ? `DEBRIEF — ${this.debriefData.scenarioId}: ${this.debriefData.scenarioTitle}`
      : "DEBRIEF";

    label(this, PAD, HEADER_H / 2, title, {
      fontSize: "14px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    label(this, PAD + 2, HEADER_H / 2 + 16, "Session complete.", {
      fontSize: "11px",
      color: CSS.DIM,
    }).setOrigin(0, 0.5);
  }

  // -------------------------------------------------------------------------
  // Left column: "What Happened" + "Good Process" + callout box
  // -------------------------------------------------------------------------

  private drawLeftColumn(g: Phaser.GameObjects.Graphics): void {
    let y = CONTENT_Y;

    // ---- WHAT HAPPENED section ----
    label(this, LEFT_X, y, "WHAT HAPPENED", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    y += 18;

    panel(g, LEFT_X, y, LEFT_W, 120, 4);
    const whatLines = this.debriefData
      ? resolveContent(this.debriefData.whatHappenedId)
      : ["Session data unavailable."];

    whatLines.slice(0, 7).forEach((line, i) => {
      label(this, LEFT_X + 10, y + 8 + i * 15, line, {
        fontSize: "11px",
        color: CSS.TEXT,
      });
    });
    y += 128;

    // ---- GOOD PROCESS SUMMARY section ----
    label(this, LEFT_X, y, "GOOD PROCESS SUMMARY", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    y += 18;

    panel(g, LEFT_X, y, LEFT_W, 88, 4);
    const goodLines = this.debriefData
      ? resolveContent(this.debriefData.goodProcessId)
      : [];

    goodLines.slice(0, 5).forEach((line, i) => {
      label(this, LEFT_X + 10, y + 8 + i * 15, line, {
        fontSize: "11px",
        color: CSS.TEXT,
      });
    });
    y += 96;

    // ---- GOOD PROCESS / DIFFERENT RESULT callout box (MANDATORY per spec) ----
    // This callout is required in every scenario — it must always be rendered
    // and cannot be conditionally hidden. No scenario ships without it.
    label(this, LEFT_X, y, "GOOD PROCESS / DIFFERENT RESULT", {
      fontSize: "11px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    y += 18;

    // Visually prominent box — amber border to distinguish from other panels.
    fillRect(g, LEFT_X, y, LEFT_W, 100, C.SURFACE, 6);
    strokeRect(g, LEFT_X, y, LEFT_W, 100, C.AMBER, 2, 6);

    const loseLines = this.debriefData
      ? resolveContent(this.debriefData.goodProcessCanLoseId)
      : [];

    loseLines.slice(0, 6).forEach((line, i) => {
      label(this, LEFT_X + 10, y + 8 + i * 15, line, {
        fontSize: "11px",
        color: CSS.TEXT,
      });
    });
    y += 108;

    // ---- "Sim is not the market" friction text (Phase 2 cutline requirement) ----
    // Required at the bottom of the left column on every debrief screen.
    label(
      this,
      LEFT_X,
      y + 12,
      '"This simulation is not the market. Outcomes here do not predict real trading results."',
      {
        fontSize: "10px",
        color: CSS.DIM,
        fontStyle: "italic",
        wordWrap: { width: LEFT_W - 20 },
      }
    );
  }

  // -------------------------------------------------------------------------
  // Right column: rubric table + XP bar + coaching alert + buttons
  // -------------------------------------------------------------------------

  private drawRightColumn(g: Phaser.GameObjects.Graphics): void {
    let y = CONTENT_Y;

    // ---- PROCESS RUBRIC ----
    label(this, RIGHT_X, y, "PROCESS RUBRIC", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    y += 16;

    hline(g, RIGHT_X, y, RIGHT_W, C.BORDER);
    y += 8;

    const rows = this.debriefData?.rubricRows ?? [];
    const rowH = 20;

    rows.forEach((row) => {
      // Status mark: ✓ / ✗ / —
      // NOT-APPLICABLE is never shown as ✗ per spec.
      let mark: string;
      let markColor: string;
      if (row.status === "pass") {
        mark = "✓";
        markColor = CSS.GREEN;
      } else if (row.status === "fail") {
        mark = "✗";
        markColor = CSS.RED;
      } else {
        // na
        mark = "—";
        markColor = CSS.DIM;
      }

      const xpStr = row.xpEarned > 0 ? `+${row.xpEarned} XP` : "";

      // Truncate label to fit column width.
      const labelText = row.label.length > 30
        ? row.label.substring(0, 28) + "…"
        : row.label;

      label(this, RIGHT_X, y, mark, { fontSize: "13px", color: markColor });
      label(this, RIGHT_X + 18, y, labelText, { fontSize: "11px", color: CSS.TEXT });
      if (xpStr) {
        label(this, RIGHT_X + RIGHT_W - 60, y, xpStr, {
          fontSize: "11px",
          color: CSS.AMBER,
        }).setOrigin(0, 0);
      }
      y += rowH;
    });

    y += 8;
    hline(g, RIGHT_X, y, RIGHT_W, C.BORDER);
    y += 12;

    // ---- XP TOTAL BAR ----
    label(this, RIGHT_X, y, "XP EARNED THIS SESSION", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    y += 16;
    hline(g, RIGHT_X, y, RIGHT_W, C.BORDER);
    y += 8;

    const xpTotal = this.debriefData?.xpTotal ?? 0;
    // Display scale never overflows (F11: a fixed 200 cap clipped SCN-006's
    // 285-point rubric). Upper bound only — not a rank gate.
    const xpMax = Math.max(200, xpTotal);
    const barW = RIGHT_W;
    const barH = 10;

    fillRect(g, RIGHT_X, y, barW, barH, C.SURFACE, 4);
    strokeRect(g, RIGHT_X, y, barW, barH, C.BORDER, 1, 4);
    const fill = Math.min(1, xpTotal / xpMax);
    if (fill > 0) {
      fillRect(g, RIGHT_X, y, Math.round(barW * fill), barH, C.AMBER, 4);
    }
    y += barH + 8;

    label(this, RIGHT_X, y, `TOTAL:  ${xpTotal} XP`, {
      fontSize: "14px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    y += 20;

    label(this, RIGHT_X, y, "< Process XP only — no PnL component >", {
      fontSize: "10px",
      color: CSS.DIM,
      fontStyle: "italic",
    });
    y += 24;

    hline(g, RIGHT_X, y, RIGHT_W, C.BORDER);
    y += 12;

    // ---- COACHING OBSERVATION (conditional) ----
    // SG-05 (CLOSED): right panel below the XP summary, above-the-fold at
    // 1280×720, reckless-winner takes the top slot, labeled "COACHING
    // OBSERVATION", no forced acknowledgment. Informational only — never a
    // penalty display.
    const recklessText = this.debriefData?.recklessWinnerText ?? null;
    const policyNote = this.debriefData?.policyMismatchNote ?? null;

    if (recklessText || policyNote) {
      label(this, RIGHT_X, y, "COACHING OBSERVATION", {
        fontSize: "11px",
        color: CSS.AMBER,
        fontStyle: "bold",
      });
      y += 16;

      const alertLines: string[] = [];
      if (recklessText) {
        // Word-wrap to column width manually (Phaser wordWrap handles it).
        alertLines.push(recklessText);
      }
      if (policyNote) {
        if (alertLines.length > 0) alertLines.push("");
        alertLines.push(policyNote);
      }

      const alertH = Math.min(80, alertLines.length * 16 + 16);
      fillRect(g, RIGHT_X, y, RIGHT_W, alertH, 0x2a1a0a, 6); // dark amber tint
      strokeRect(g, RIGHT_X, y, RIGHT_W, alertH, C.AMBER, 1, 6);

      alertLines.forEach((line, i) => {
        label(this, RIGHT_X + 8, y + 8 + i * 16, line, {
          fontSize: "10px",
          color: CSS.AMBER,
          wordWrap: { width: RIGHT_W - 16 },
        });
      });
      y += alertH + 12;
    }

    hline(g, RIGHT_X, y, RIGHT_W, C.BORDER);
    y += 16;

    // ---- BUTTONS ----
    const btnW = RIGHT_W;
    const btnH = 38;
    const btnGap = 10;

    // "View replay" — Screen 6: watch this session back from its EventLog.
    button(
      this,
      RIGHT_X,
      y,
      btnW,
      btnH,
      "VIEW REPLAY",
      () => this.viewReplay(),
      { fontSize: "12px" }
    );
    y += btnH + btnGap;

    // "Replay scenario" — restart with the same seed.
    button(
      this,
      RIGHT_X,
      y,
      btnW,
      btnH,
      "REPLAY SCENARIO",
      () => this.replayScenario(),
      { fontSize: "12px" }
    );
    y += btnH + btnGap;

    // "Back to menu"
    button(
      this,
      RIGHT_X,
      y,
      btnW,
      btnH,
      "BACK TO MENU",
      () => this.scene.start("MenuScene"),
      {
        fillColor: C.SURFACE,
        textColor: CSS.AMBER,
        fontSize: "12px",
      }
    );
  }

  // -------------------------------------------------------------------------
  // Footer — education-not-advice (persistent per spec)
  // -------------------------------------------------------------------------

  private drawFooter(
    g: Phaser.GameObjects.Graphics,
    width: number,
    height: number
  ): void {
    const fy = height - FOOTER_H;
    fillRect(g, 0, fy, width, FOOTER_H, C.SURFACE, 0);
    hline(g, 0, fy, width, C.BORDER);
    label(
      this,
      width / 2,
      fy + FOOTER_H / 2,
      "Education, not financial advice. Simulated markets only. No signals, ever.",
      { fontSize: "11px", color: CSS.DIM, fontStyle: "italic" }
    ).setOrigin(0.5, 0.5);
  }

  // -------------------------------------------------------------------------
  // Scene transitions
  // -------------------------------------------------------------------------

  /**
   * Open the Replay Viewer (Screen 6) over this session's stored EventLog.
   * View-only — completeDebrief already ran, and re-entering DebriefScene
   * afterwards is idempotent (no double XP).
   */
  private viewReplay(): void {
    const session = SessionAdapter.lastSession;
    const manifest = getScenario(this.debriefData?.scenarioId ?? "")?.manifest;
    if (session === null || manifest === undefined || !this.debriefData) return;
    const data: ReplayData = {
      events: session.log.entries.map((e) => e.event),
      manifest,
      debriefData: this.debriefData,
    };
    this.scene.start("ReplayScene", data);
  }

  private replayScenario(): void {
    // Restart TradingScene with the SAME scenario. The canonical per-scenario
    // seed is resolved inside SessionAdapter (scenarios/registry.ts), so the
    // restart is a deterministic replay of the same tick stream.
    // replayOf marks the new session as a re-review: TradingScene records
    // replay_started, and the replay's own debrief earns session_reviewed.
    this.scene.start("TradingScene", {
      scenarioId: this.debriefData?.scenarioId ?? "SCN-001",
      replayOf: this.debriefData?.sessionId ?? "",
    });
  }

  // -------------------------------------------------------------------------
  // Rank-up congratulation card (SIM_ENGINE_SPEC §4.5)
  // -------------------------------------------------------------------------

  /**
   * One-time, dismissible congratulation card shown when this session's XP
   * crossed a rank threshold. Names process behaviors, never trade outcomes
   * (§4.5 — "You ranked up by journaling…", not "by winning").
   */
  private drawRankUpCard(): void {
    const rankUp = ProgressStore.lastRankUp();
    if (rankUp === null) return;
    // Consume the marker immediately (F8): the card is one-time per §4.5 —
    // navigating away without clicking CONTINUE must not re-show a stale
    // "RANK UP" on every later debrief.
    ProgressStore.clearRankUp();

    const { width, height } = this.scale;
    const cw = 480;
    const ch = 170;
    const cx = width / 2 - cw / 2;
    const cy = height / 2 - ch / 2;

    const g = this.add.graphics();
    const objs: Phaser.GameObjects.GameObject[] = [];

    fillRect(g, 0, 0, width, height, C.BG, 0);
    g.setAlpha(0.6);

    const cardG = this.add.graphics();
    fillRect(cardG, cx, cy, cw, ch, C.SURFACE, 8);
    strokeRect(cardG, cx, cy, cw, ch, C.AMBER, 2, 8);

    objs.push(
      label(this, width / 2, cy + 28, `RANK UP — ${rankUp.to.displayLabel}`, {
        fontSize: "17px",
        color: CSS.AMBER,
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5)
    );

    objs.push(
      label(
        this,
        cx + 20,
        cy + 50,
        `You advanced from ${rankUp.from.displayLabel} to ${rankUp.to.displayLabel} ` +
          "through process behaviors: journaling before acting, sizing within " +
          "your declared rule, honoring stops, and completing debriefs. " +
          "Outcomes did not earn this — process did.",
        {
          fontSize: "12px",
          color: CSS.TEXT,
          wordWrap: { width: cw - 40 },
          lineSpacing: 4,
        }
      )
    );

    const dismiss = button(
      this,
      width / 2 - 80,
      cy + ch - 46,
      160,
      32,
      "CONTINUE",
      () => {
        g.destroy();
        cardG.destroy();
        for (const o of objs) o.destroy();
        dismiss.bg.destroy();
        dismiss.label.destroy();
      },
      { fontSize: "12px" }
    );
  }
}
