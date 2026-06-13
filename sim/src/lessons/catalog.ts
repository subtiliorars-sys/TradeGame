/**
 * Lesson catalog — wave 1 scenario-linked lessons + LESS-W3 foundation
 * track F-01–F-10 (LESS-W3 + LESS-W4). Intermediate wave-2 (LESS-W2) lands separately.
 *
 * Lesson prereqs remain ADVISORY (brief §4.3: wave-1 chains pass through
 * wave-2 content that doesn't exist yet — the hard flip waits for wave 2
 * under the same shipped-only rule as drills).
 *
 * Honest-XP: awardLesson pays once per lesson ID (re-reading is free,
 * always — re-reading is the point).
 */

import * as ProgressStore from "../engine/progress.js";
import type { LessonContent, LessonDef } from "./types.js";

export type { LessonDef, LessonContent } from "./types.js";

import { LESSON_F_01 } from "../ui/content/lessons/f-01.js";
import { LESSON_F_02 } from "../ui/content/lessons/f-02.js";
import { LESSON_F_03 } from "../ui/content/lessons/f-03.js";
import { LESSON_F_04 } from "../ui/content/lessons/f-04.js";
import { LESSON_F_05 } from "../ui/content/lessons/f-05.js";
import { LESSON_F_06 } from "../ui/content/lessons/f-06.js";
import { LESSON_F_07 } from "../ui/content/lessons/f-07.js";
import { LESSON_F_08 } from "../ui/content/lessons/f-08.js";
import { LESSON_F_09 } from "../ui/content/lessons/f-09.js";
import { LESSON_F_10 } from "../ui/content/lessons/f-10.js";
import { LESSON_C_I01 } from "../ui/content/lessons/c-i01.js";
import { LESSON_C_I03 } from "../ui/content/lessons/c-i03.js";
import { LESSON_S_I01 } from "../ui/content/lessons/s-i01.js";
import { LESSON_S_I02 } from "../ui/content/lessons/s-i02.js";
import { LESSON_S_I05 } from "../ui/content/lessons/s-i05.js";
import { LESSON_X_B03 } from "../ui/content/lessons/x-b03.js";
import { LESSON_X_B04 } from "../ui/content/lessons/x-b04.js";
import { LESSON_X_I01 } from "../ui/content/lessons/x-i01.js";
import { LESSON_X_I02 } from "../ui/content/lessons/x-i02.js";

/** XP by length tier (GDD §7 'fixed by lesson length'). TUNABLE. */
export const LESSON_XP: Record<LessonDef["tier"], number> = {
  short: 15,
  standard: 25,
};

function def(content: LessonContent, tier: LessonDef["tier"] = "standard"): LessonDef {
  return { content, tier, xp: LESSON_XP[tier] };
}

export const LESSON_CATALOG: LessonDef[] = [
  def(LESSON_F_01, "short"),
  def(LESSON_F_02),
  def(LESSON_F_03),
  def(LESSON_F_04),
  def(LESSON_F_05),
  def(LESSON_F_06),
  def(LESSON_F_07),
  def(LESSON_F_08),
  def(LESSON_F_09),
  def(LESSON_F_10),
  def(LESSON_C_I01),
  def(LESSON_C_I03),
  def(LESSON_S_I01),
  def(LESSON_S_I02),
  def(LESSON_S_I05),
  def(LESSON_X_B03, "short"), // pillar-intro length
  def(LESSON_X_B04, "short"), // beginner-completion length
  def(LESSON_X_I01),
  def(LESSON_X_I02),
];

export function getLesson(id: string): LessonDef | undefined {
  return LESSON_CATALOG.find((l) => l.content.id === id);
}

/**
 * Mark the lesson complete and award its fixed XP — ONLY on first
 * completion. Returns the XP granted (0 on repeats: re-reading is free).
 */
export function awardLesson(lesson: LessonDef): number {
  if (ProgressStore.completedLessonIds().includes(lesson.content.id)) {
    return 0;
  }
  ProgressStore.completeLesson(lesson.content.id, lesson.xp);
  return lesson.xp;
}
