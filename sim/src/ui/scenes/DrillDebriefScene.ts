/**
 * DrillDebriefScene — live-drill session debrief (LIVE_DRILL_ENGINE_BRIEF
 * §1/§3): drawdown predicate checklist OR blowup annotated replay + MCQ.
 * Never renders dollar values from the account.
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
import {
  awardLiveDrill,
  awardBlowupDrill,
  isBlowupDrill,
  isDrawdownDrill,
  type LiveDrillDef,
} from "../../drills/liveCatalog.js";
import * as ProgressStore from "../../engine/progress.js";
import {
  evaluateDrawdownSurvival,
  type PredicateResult,
} from "../../drills/livePredicates.js";
import { classifyBlowupMechanism } from "../../drills/blowupClassifier.js";
import { buildBlowupReplayRows } from "../../drills/blowupReplay.js";
import { blowupCoachingCopy, MECHANISM_OPTIONS } from "../../drills/blowupCoaching.js";
import type { EventEnvelope } from "../../engine/events.js";

export interface DrillDebriefData {
  drill: LiveDrillDef;
  logEntries: readonly EventEnvelope[];
}

const PAD = 20;

export class DrillDebriefScene extends Phaser.Scene {
  private data2!: DrillDebriefData;

  constructor() {
    super({ key: "DrillDebriefScene" });
  }

  init(data: unknown): void {
    this.data2 = data as DrillDebriefData;
  }

  create(): void {
    const { drill } = this.data2;
    if (isBlowupDrill(drill)) {
      this.createBlowupDebrief(drill);
    } else {
      this.createDrawdownDebrief(drill);
    }
  }

  private createDrawdownDebrief(drill: LiveDrillDef): void {
    if (!isDrawdownDrill(drill)) return;
    const { width, height } = this.scale;
    const g = this.add.graphics();
    fillRect(g, 0, 0, width, height, C.BG, 0);

    const { logEntries } = this.data2;
    const authoredTicks =
      drill.scenario.manifest.durationMs / drill.scenario.manifest.msPerTick;
    const evald = evaluateDrawdownSurvival(
      logEntries,
      drill.seed,
      Math.floor(authoredTicks * (2 / 3))
    );

    fillRect(g, 0, 0, width, 48, C.SURFACE, 0);
    hline(g, 0, 48, width, C.BORDER);
    label(this, PAD, 24, `DRILL DEBRIEF — ${drill.title}`, {
      fontSize: "15px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    label(this, PAD, 64, evald.pass ? "SURVIVED — process held." : "NOT THIS TIME — the read-out below is the lesson.", {
      fontSize: "14px",
      color: evald.pass ? CSS.GREEN : CSS.AMBER,
      fontStyle: "bold",
    });

    let y = 96;
    for (const r of evald.results) {
      this.drawPredicate(g, r, y);
      y += 96;
    }

    const granted = awardLiveDrill(drill, evald.pass);
    const up = granted !== null && granted > 0 ? ProgressStore.lastRankUp() : null;
    if (up !== null) ProgressStore.clearRankUp();

    let xpLine: string;
    if (granted === null) {
      xpLine = "No XP at stake on a miss — retry freely; the drill re-seeds the same inherited position.";
    } else if (granted > 0) {
      xpLine = `+${granted} XP — drill completed (feeds rank gates and scenario prerequisites).`;
    } else {
      xpLine = "Practice run — already completed, no additional XP (re-practice is free, always).";
    }
    label(this, PAD, y + 6, xpLine, {
      fontSize: "12px",
      color: granted !== null && granted > 0 ? CSS.AMBER : CSS.DIM,
      fontStyle: granted !== null && granted > 0 ? "bold" : "italic",
      wordWrap: { width: width - PAD * 2 },
    });
    if (up !== null) {
      label(this, PAD, y + 28, `RANK UP — ${up.from.displayLabel} → ${up.to.displayLabel}: earned by process, never outcomes.`, {
        fontSize: "12px",
        color: CSS.AMBER,
        fontStyle: "bold",
      });
      y += 22;
    }

    this.drawNavButtons(y + 44, drill.drillId);
    this.drawFooter();
  }

  private createBlowupDebrief(drill: LiveDrillDef): void {
    if (!isBlowupDrill(drill)) return;
    const { width, height } = this.scale;
    const { logEntries } = this.data2;
    const mechanism = classifyBlowupMechanism(logEntries, drill.startingEquity);
    const rows = buildBlowupReplayRows(logEntries, drill.startingEquity);

    const g = this.add.graphics();
    fillRect(g, 0, 0, width, height, C.BG, 0);
    fillRect(g, 0, 0, width, 48, C.SURFACE, 0);
    hline(g, 0, 48, width, C.BORDER);
    label(this, PAD, 24, `DRILL DEBRIEF — ${drill.title}`, {
      fontSize: "15px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);

    label(this, PAD, 64, "SESSION COMPLETE — read the annotated sequence, then name the dominant mechanism.", {
      fontSize: "13px",
      color: CSS.TEXT,
      fontStyle: "bold",
      wordWrap: { width: width - PAD * 2 },
    });

    let y = 92;
    label(this, PAD, y, "ANNOTATED REPLAY (process facts only — no dollar amounts)", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "bold",
    });
    y += 22;

    const maxRows = Math.min(rows.length, 6);
    for (let i = 0; i < maxRows; i++) {
      const r = rows[i]!;
      panel(g, PAD, y, width - PAD * 2, 52, 4);
      label(this, PAD + 12, y + 8, `Tick ${r.tickIndex} — ${r.summary}`, {
        fontSize: "11px",
        color: CSS.TEXT,
        fontStyle: "bold",
      });
      const flags = [
        r.oversized ? "oversized vs account" : null,
        r.hadStop ? "had stop" : "no stop",
        r.addedToLosers ? "added to position" : null,
      ]
        .filter(Boolean)
        .join(" · ");
      label(this, PAD + 12, y + 28, flags || "standard fill", {
        fontSize: "10px",
        color: CSS.DIM,
      });
      y += 58;
    }
    if (rows.length > maxRows) {
      label(this, PAD, y, `… ${rows.length - maxRows} more fills in the session log`, {
        fontSize: "10px",
        color: CSS.DIM,
        fontStyle: "italic",
      });
      y += 18;
    } else if (rows.length === 0) {
      label(this, PAD, y, "No entry fills recorded — the session ended before orders filled.", {
        fontSize: "11px",
        color: CSS.DIM,
        fontStyle: "italic",
      });
      y += 20;
    }

    y += 8;
    label(this, PAD, y, "Which mechanism was dominant in YOUR session?", {
      fontSize: "12px",
      color: CSS.AMBER,
      fontStyle: "bold",
    });
    y += 24;

    const resultLbl = label(this, PAD, y + 200, "", {
      fontSize: "12px",
      color: CSS.TEXT,
      wordWrap: { width: width - PAD * 2 },
      lineSpacing: 4,
    });
    const coachingStart = y + 280;
    let answered = false;

    MECHANISM_OPTIONS.forEach((opt, i) => {
      button(this, PAD, y + i * 42, width - PAD * 2, 36, opt.label, () => {
        if (answered) return;
        answered = true;
        const correct = opt.id === mechanism;
        const { base, bonus } = awardBlowupDrill(drill, correct);
        const up = base > 0 || bonus > 0 ? ProgressStore.lastRankUp() : null;
        if (up !== null) ProgressStore.clearRankUp();

        resultLbl.setText(
          correct
            ? "CORRECT — your read matches what the replay annotated."
            : "NOT QUITE — compare your pick to the flags above; the coaching below names the dominant pattern."
        );
        resultLbl.setColor(correct ? CSS.GREEN : CSS.AMBER);

        let cy = coachingStart;
        label(this, PAD, cy, `Dominant mechanism: ${MECHANISM_OPTIONS.find((o) => o.id === mechanism)?.label ?? mechanism}`, {
          fontSize: "11px",
          color: CSS.AMBER,
          fontStyle: "bold",
        });
        cy += 20;
        for (const line of [blowupCoachingCopy(drill.market, mechanism)]) {
          label(this, PAD, cy, line, {
            fontSize: "11px",
            color: CSS.TEXT,
            wordWrap: { width: width - PAD * 2 },
            lineSpacing: 3,
          });
          cy += 56;
        }

        const xpParts: string[] = [];
        if (base > 0) xpParts.push(`+${base} XP base`);
        else if (ProgressStore.completedDrillIds().includes(drill.drillId)) {
          xpParts.push("practice run — base XP already earned");
        }
        if (bonus > 0) xpParts.push(`+${bonus} XP mechanism bonus`);
        else if (correct && bonus === 0) {
          xpParts.push("mechanism bonus already collected");
        }
        label(this, PAD, cy + 8, xpParts.join(" · "), {
          fontSize: "12px",
          color: base > 0 || bonus > 0 ? CSS.AMBER : CSS.DIM,
          fontStyle: base > 0 || bonus > 0 ? "bold" : "italic",
        });
        if (up !== null) {
          label(this, PAD, cy + 30, `RANK UP — ${up.from.displayLabel} → ${up.to.displayLabel}`, {
            fontSize: "12px",
            color: CSS.AMBER,
            fontStyle: "bold",
          });
        }

        this.drawNavButtons(cy + 56, drill.drillId);
      }, { fontSize: "11px", fillColor: C.SURFACE, textColor: CSS.TEXT });
    });

    this.drawFooter();
  }

  private drawNavButtons(y: number, drillId: string): void {
    button(this, PAD, y, 180, 38, "RETRY DRILL", () => {
      this.scene.start("TradingScene", { liveDrillId: drillId });
    });
    button(this, PAD + 196, y, 180, 38, "ALL DRILLS", () => {
      this.scene.start("DrillScene");
    }, { fillColor: C.SURFACE, textColor: CSS.AMBER });
    button(this, PAD + 392, y, 180, 38, "MAIN MENU", () => {
      this.scene.start("MenuScene");
    }, { fillColor: C.SURFACE, textColor: CSS.DIM });
  }

  private drawFooter(): void {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    fillRect(g, 0, height - 28, width, 28, C.SURFACE, 0);
    hline(g, 0, height - 28, width, C.BORDER);
    label(this, width / 2, height - 14, "Education, not financial advice. Simulated markets only. No signals, ever.", {
      fontSize: "11px",
      color: CSS.DIM,
      fontStyle: "italic",
    }).setOrigin(0.5, 0.5);
  }

  private drawPredicate(g: Phaser.GameObjects.Graphics, r: PredicateResult, y: number): void {
    const { width } = this.scale;
    panel(g, PAD, y, width - PAD * 2, 84, 4);
    strokeRect(g, PAD, y, width - PAD * 2, 84, r.pass ? C.GREEN : C.AMBER, 1, 4);
    label(this, PAD + 14, y + 10, `${r.pass ? "✓" : "✗"}  ${r.predicateId}`, {
      fontSize: "12px",
      color: r.pass ? CSS.GREEN : CSS.AMBER,
      fontStyle: "bold",
    });
    label(this, PAD + 14, y + 32, r.summary, {
      fontSize: "12px",
      color: CSS.TEXT,
      wordWrap: { width: width - PAD * 2 - 28 },
      lineSpacing: 3,
    });
  }
}
