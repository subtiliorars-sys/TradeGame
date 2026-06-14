/**
 * Lesson catalog — foundation F-01–F-10 + wave 1 scenario-linked lessons +
 * wave 2 intermediate (LESSON_SYSTEM_BRIEF §4.2, §4.4): C-I02/C-I04,
 * S-I03/S-I04, X-I03/X-I04; LESS-W6 crypto beginner C-B01–C-B05;
 * LESS-W7 stocks beginner S-B01–S-B04; LESS-W8 forex beginner X-B01–X-B02.
 *
 * Lesson prereqs remain ADVISORY until owner flips hard gates (brief §7.3);
 * all three beginner tracks are now shipped in catalog.
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
import { LESSON_C_B01 } from "../ui/content/lessons/c-b01.js";
import { LESSON_C_B02 } from "../ui/content/lessons/c-b02.js";
import { LESSON_C_B03 } from "../ui/content/lessons/c-b03.js";
import { LESSON_C_B04 } from "../ui/content/lessons/c-b04.js";
import { LESSON_C_B05 } from "../ui/content/lessons/c-b05.js";
import { LESSON_C_I01 } from "../ui/content/lessons/c-i01.js";
import { LESSON_C_I02 } from "../ui/content/lessons/c-i02.js";
import { LESSON_C_I03 } from "../ui/content/lessons/c-i03.js";
import { LESSON_C_I04 } from "../ui/content/lessons/c-i04.js";
import { LESSON_S_B01 } from "../ui/content/lessons/s-b01.js";
import { LESSON_S_B02 } from "../ui/content/lessons/s-b02.js";
import { LESSON_S_B03 } from "../ui/content/lessons/s-b03.js";
import { LESSON_S_B04 } from "../ui/content/lessons/s-b04.js";
import { LESSON_S_I01 } from "../ui/content/lessons/s-i01.js";
import { LESSON_S_I02 } from "../ui/content/lessons/s-i02.js";
import { LESSON_S_I03 } from "../ui/content/lessons/s-i03.js";
import { LESSON_S_I04 } from "../ui/content/lessons/s-i04.js";
import { LESSON_S_I05 } from "../ui/content/lessons/s-i05.js";
import { LESSON_X_B01 } from "../ui/content/lessons/x-b01.js";
import { LESSON_X_B02 } from "../ui/content/lessons/x-b02.js";
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
  def(LESSON_C_B01),
  def(LESSON_C_B02),
  def(LESSON_C_B03),
  def(LESSON_C_B04),
  def(LESSON_C_B05),
  def(LESSON_C_I01),
  def(LESSON_C_I02),
  def(LESSON_C_I03),
  def(LESSON_C_I04),
  def(LESSON_S_B01),
  def(LESSON_S_B02),
  def(LESSON_S_B03),
  def(LESSON_S_B04),
  def(LESSON_S_I01),
  def(LESSON_S_I02),
  def(LESSON_S_I03),
  def(LESSON_S_I04),
  def(LESSON_S_I05),
  def(LESSON_X_B01),
  def(LESSON_X_B02),
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
