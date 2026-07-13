/**
 * Lesson system types — LESSON_SYSTEM_BRIEF §5 (LessonScene contract).
 *
 * Lessons are READING surfaces with a "do it now" CTA — the validated
 * lesson-then-immediately-do model (COMPETITOR_RESEARCH). Completion is
 * reaching the final page; there are NO time-on-page gates and NO quizzes
 * in v1 (Trade Bots autopsy: time gates punish re-reading; quiz gates
 * require the anti-headcanon pipeline, which v1 content doesn't carry).
 */

export interface LessonCta {
  kind: "drill" | "scenario";
  /** Drill ID ("drill:...") or scenario ID ("SCN-00X"). */
  id: string;
  /** One player-facing sentence describing the practice target. */
  line: string;
}

export interface LessonDrillCardOption {
  id: string;
  label: string;
  correct: boolean;
  /** Coaching feedback shown after selection; not a gated quiz result. */
  feedback: string;
}

export interface LessonDrillCard {
  id: string;
  question: string;
  options: [LessonDrillCardOption, LessonDrillCardOption, LessonDrillCardOption];
}

export interface LessonContent {
  /** The live prereq ID used by scenario manifests ("lesson:..."). */
  id: string;
  /** Curriculum ID (e.g. "C-I01") — provenance back to docs/lessons/. */
  curriculumId: string;
  title: string;
  track: "foundation" | "crypto" | "stocks" | "forex";
  /** Paged body: each page is pre-wrapped lines (≤72 chars, ≤13 lines). */
  pages: string[][];
  /**
   * One reflective question shown on the final page. NOT a quiz — nothing
   * is collected or graded; it primes the practice the CTA points at.
   */
  processCheck: string;
  /** Optional ungated check-for-understanding cards (no XP, no completion gate). */
  drillCards?: LessonDrillCard[];
  cta: LessonCta;
}

export interface LessonDef {
  content: LessonContent;
  /** XP fixed by length tier (GDD §7): short 15 / standard 25. TUNABLE. */
  xp: number;
  tier: "short" | "standard";
}
