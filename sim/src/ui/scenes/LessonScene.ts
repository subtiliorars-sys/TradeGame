/**
 * LessonScene — lesson selection + paged reader (LESSON_SYSTEM_BRIEF §5).
 *
 * SELECT view: the lesson catalog with track/XP/completion state.
 * READ view: paged body (BACK/NEXT, page counter — a counter, NEVER a
 * timer), final page = the Process Check (reflective, nothing collected)
 * + the "do it now" CTA. Completion = reaching the final page; marking
 * complete awards once-per-lesson XP; re-reading is free, always.
 *
 * The CTA is the bridge (lesson-then-immediately-do): MARK COMPLETE + GO
 * launches the linked scenario/drill directly; MARK COMPLETE ONLY stays.
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
import { LESSON_CATALOG, awardLesson, type LessonDef } from "../../lessons/catalog.js";
import * as ProgressStore from "../../engine/progress.js";
import { lessonLockState } from "../engine/gating.js";

const PAD = 20;
const HEADER_H = 48;
const FOOTER_H = 28;

export class LessonScene extends Phaser.Scene {
  private view: "select" | "read" = "select";
  private active: LessonDef | null = null;
  private page = 0;
  private completedThisVisit = false;
  private grantedXp: number | null = null;

  constructor() {
    super({ key: "LessonScene" });
  }

  init(): void {
    this.view = "select";
    this.active = null;
    this.page = 0;
    this.completedThisVisit = false;
    this.grantedXp = null;
  }

  create(): void {
    this.redraw();
  }

  private redraw(): void {
    this.children.removeAll(true);
    const { width, height } = this.scale;
    const g = this.add.graphics();
    fillRect(g, 0, 0, width, height, C.BG, 0);

    // Header
    fillRect(g, 0, 0, width, HEADER_H, C.SURFACE, 0);
    hline(g, 0, HEADER_H, width, C.BORDER);
    label(this, PAD, HEADER_H / 2, this.view === "select" ? "LESSONS" : (this.active?.content.title ?? "LESSON"), {
      fontSize: "15px",
      color: CSS.AMBER,
      fontStyle: "bold",
    }).setOrigin(0, 0.5);
    button(
      this,
      width - 180,
      8,
      164,
      32,
      this.view === "select" ? "BACK TO MENU" : "ALL LESSONS",
      () => {
        if (this.view === "select") this.scene.start("MenuScene");
        else {
          this.view = "select";
          this.active = null;
          this.redraw();
        }
      },
      { fillColor: C.SURFACE, textColor: CSS.AMBER, fontSize: "11px" }
    );

    if (this.view === "select") this.drawSelect(g);
    else this.drawRead(g);

    // Footer
    fillRect(g, 0, height - FOOTER_H, width, FOOTER_H, C.SURFACE, 0);
    hline(g, 0, height - FOOTER_H, width, C.BORDER);
    label(
      this,
      width / 2,
      height - FOOTER_H / 2,
      "Education, not financial advice. Simulated markets only. No signals, ever.",
      { fontSize: "11px", color: CSS.DIM, fontStyle: "italic" }
    ).setOrigin(0.5, 0.5);
  }

  private drawSelect(g: Phaser.GameObjects.Graphics): void {
    const done = new Set(ProgressStore.completedLessonIds());
    let y = HEADER_H + PAD + 4;

    label(this, PAD, y, "Read, then do — every lesson ends pointing at the practice for it. " +
      "XP once per lesson; re-reading is free, always.", {
      fontSize: "12px",
      color: CSS.DIM,
    });
    y += 28;

    for (const l of LESSON_CATALOG) {
      const isDone = done.has(l.content.id);
      const lock = lessonLockState(l, ProgressStore.completedLessonIds());
      panel(g, PAD, y, 1240, 56, 4);
      label(this, PAD + 14, y + 9, `${l.content.title}  ·  ${l.content.curriculumId}`, {
        fontSize: "13px",
        color: CSS.TEXT,
        fontStyle: "bold",
      });
      label(
        this,
        PAD + 14,
        y + 30,
        lock.locked
          ? lock.reasons[0] ?? "Prerequisite lesson not complete"
          : `${l.content.track}  ·  ${l.content.pages.length} pages  ·  ${l.xp} XP` +
              `${isDone ? "  ·  ✓ read (re-reads free)" : ""}`,
        {
          fontSize: "11px",
          color: lock.locked ? CSS.DIM : isDone ? CSS.AMBER : CSS.DIM,
          wordWrap: { width: 900 },
        }
      );
      if (lock.locked) {
        fillRect(g, PAD + 1090, y + 11, 130, 32, C.SURFACE, 4);
        strokeRect(g, PAD + 1090, y + 11, 130, 32, C.BORDER, 1, 4);
        label(this, PAD + 1155, y + 27, "LOCKED", {
          fontSize: "11px",
          color: CSS.DIM,
          fontStyle: "bold",
        }).setOrigin(0.5, 0.5);
      } else {
        button(this, PAD + 1110, y + 11, 110, 32, isDone ? "RE-READ" : "READ", () => {
          this.active = l;
          this.view = "read";
          this.page = 0;
          this.completedThisVisit = false;
          this.grantedXp = null;
          this.redraw();
        });
      }
      y += 66;
    }
  }

  private drawRead(g: Phaser.GameObjects.Graphics): void {
    const l = this.active;
    if (l === null) return;
    const { width } = this.scale;
    const totalPages = l.content.pages.length + 1; // + the CTA page
    const onCta = this.page >= l.content.pages.length;

    // Page counter — a counter, never a timer (Trade Bots autopsy).
    label(this, width - PAD, HEADER_H + 14, `${Math.min(this.page + 1, totalPages)} / ${totalPages}`, {
      fontSize: "11px",
      color: CSS.DIM,
    }).setOrigin(1, 0);
    label(this, PAD, HEADER_H + 14, `[${l.content.track}]  ${l.content.curriculumId}`, {
      fontSize: "11px",
      color: CSS.AMBER,
    });

    const bodyY = HEADER_H + 40;
    panel(g, PAD, bodyY, 1240, 560, 4);

    if (!onCta) {
      const lines = l.content.pages[this.page] ?? [];
      lines.forEach((line: string, i: number) => {
        label(this, PAD + 22, bodyY + 18 + i * 22, line, {
          fontSize: "13px",
          color: CSS.TEXT,
        });
      });
    } else {
      // Final page: Process Check + the do-it-now CTA.
      label(this, PAD + 22, bodyY + 18, "PROCESS CHECK", {
        fontSize: "11px",
        color: CSS.AMBER,
        fontStyle: "bold",
      });
      label(this, PAD + 22, bodyY + 40, l.content.processCheck, {
        fontSize: "13px",
        color: CSS.TEXT,
        wordWrap: { width: 1190 },
        lineSpacing: 4,
      });
      hline(g, PAD + 16, bodyY + 130, 1208);
      label(this, PAD + 22, bodyY + 146, "PUT IT INTO PRACTICE NOW", {
        fontSize: "11px",
        color: CSS.AMBER,
        fontStyle: "bold",
      });
      label(this, PAD + 22, bodyY + 168, l.content.cta.line, {
        fontSize: "13px",
        color: CSS.TEXT,
        wordWrap: { width: 1190 },
      });

      if (this.grantedXp !== null) {
        label(
          this,
          PAD + 22,
          bodyY + 210,
          this.grantedXp > 0
            ? `+${this.grantedXp} XP — lesson complete.`
            : "Re-read complete — no additional XP (re-reading is free, always).",
          { fontSize: "12px", color: this.grantedXp > 0 ? CSS.AMBER : CSS.DIM, fontStyle: "italic" }
        );
      }

      const by = bodyY + 250;
      button(this, PAD + 22, by, 300, 38, "MARK COMPLETE + GO PRACTICE", () => {
        this.complete();
        if (this.active?.content.cta.kind === "scenario") {
          this.scene.start("TradingScene", { scenarioId: this.active.content.cta.id });
        } else if (this.active !== null) {
          this.scene.start("DrillScene");
        }
      }, { fontSize: "11px" });
      button(this, PAD + 338, by, 220, 38, "MARK COMPLETE ONLY", () => {
        this.complete();
        this.redraw();
      }, { fillColor: C.SURFACE, textColor: CSS.AMBER, fontSize: "11px" });
    }

    // BACK / NEXT
    const navY = bodyY + 576;
    if (this.page > 0) {
      button(this, PAD, navY, 110, 34, "← BACK", () => {
        this.page -= 1;
        this.redraw();
      }, { fillColor: C.SURFACE, textColor: CSS.DIM, fontSize: "11px" });
    }
    if (!onCta) {
      button(this, width - PAD - 130, navY, 130, 34, "NEXT →", () => {
        this.page += 1;
        this.redraw();
      }, { fontSize: "11px" });
    }
  }

  private complete(): void {
    const l = this.active;
    if (l === null || this.completedThisVisit) return;
    this.completedThisVisit = true;
    this.grantedXp = awardLesson(l);
  }
}
