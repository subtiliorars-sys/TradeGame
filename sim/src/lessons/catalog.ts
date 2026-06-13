/**
 * Lesson catalog — wave 1 + wave 2 intermediate (LESSON_SYSTEM_BRIEF §4.2,
 * §4.4): wave 1 = nine scenario-referenced lessons; wave 2 intermediate =
 * C-I02/C-I04, S-I03/S-I04, X-I03/X-I04 (remaining pillar intermediate
 * tier). Foundation + beginner tracks are a later wave.
 *
 * Lesson prereqs remain ADVISORY (brief §4.3 / §7.3: full chains still pass
 * through Foundation + Beginner content not yet shipped — hard flip waits).
 *
 * Honest-XP: awardLesson pays once per lesson ID (re-reading is free,
 * always — re-reading is the point).
 */

import * as ProgressStore from "../engine/progress.js";
import type { LessonContent, LessonDef } from "./types.js";

export type { LessonDef, LessonContent } from "./types.js";

import { LESSON_C_I01 } from "../ui/content/lessons/c-i01.js";
import { LESSON_C_I02 } from "../ui/content/lessons/c-i02.js";
import { LESSON_C_I03 } from "../ui/content/lessons/c-i03.js";
import { LESSON_C_I04 } from "../ui/content/lessons/c-i04.js";
import { LESSON_S_I01 } from "../ui/content/lessons/s-i01.js";
import { LESSON_S_I02 } from "../ui/content/lessons/s-i02.js";
import { LESSON_S_I03 } from "../ui/content/lessons/s-i03.js";
import { LESSON_S_I04 } from "../ui/content/lessons/s-i04.js";
import { LESSON_S_I05 } from "../ui/content/lessons/s-i05.js";
import { LESSON_X_B03 } from "../ui/content/lessons/x-b03.js";
import { LESSON_X_B04 } from "../ui/content/lessons/x-b04.js";
import { LESSON_X_I01 } from "../ui/content/lessons/x-i01.js";
import { LESSON_X_I02 } from "../ui/content/lessons/x-i02.js";
import { LESSON_X_I03 } from "../ui/content/lessons/x-i03.js";
import { LESSON_X_I04 } from "../ui/content/lessons/x-i04.js";

/** XP by length tier (GDD §7 'fixed by lesson length'). TUNABLE. */
export const LESSON_XP: Record<LessonDef["tier"], number> = {
  short: 15,
  standard: 25,
};

function def(content: LessonContent, tier: LessonDef["tier"] = "standard"): LessonDef {
  return { content, tier, xp: LESSON_XP[tier] };
}

export const LESSON_CATALOG: LessonDef[] = [
  def(LESSON_C_I01),
  def(LESSON_C_I02),
  def(LESSON_C_I03),
  def(LESSON_C_I04),
  def(LESSON_S_I01),
  def(LESSON_S_I02),
  def(LESSON_S_I03),
  def(LESSON_S_I04),
  def(LESSON_S_I05),
  def(LESSON_X_B03, "short"), // pillar-intro length
  def(LESSON_X_B04, "short"), // beginner-completion length
  def(LESSON_X_I01),
  def(LESSON_X_I02),
  def(LESSON_X_I03),
  def(LESSON_X_I04),
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
