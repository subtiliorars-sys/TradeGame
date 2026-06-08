/**
 * Debrief content registry — one module per scenario (authored text ported
 * from the SCENARIOS specs' "Debrief Screen Content" sections; the spec is
 * the source of truth, these are display copies).
 *
 * DebriefScene resolves manifest.debriefContentIds against this merged map;
 * unknown IDs fall back to a visible placeholder so missing content is
 * always detectable in play.
 */

import { SCN001_DEBRIEF } from "./scn001.js";
import { SCN002_DEBRIEF } from "./scn002.js";
import { SCN003_DEBRIEF } from "./scn003.js";
import { SCN004_DEBRIEF } from "./scn004.js";
import { SCN005_DEBRIEF } from "./scn005.js";
import { SCN006_DEBRIEF } from "./scn006.js";

export const DEBRIEF_CONTENT: Record<string, string[]> = {
  ...SCN001_DEBRIEF,
  ...SCN002_DEBRIEF,
  ...SCN003_DEBRIEF,
  ...SCN004_DEBRIEF,
  ...SCN005_DEBRIEF,
  ...SCN006_DEBRIEF,
};

/** Resolve a content block; visible placeholder for unknown IDs. */
export function resolveContent(id: string): string[] {
  return DEBRIEF_CONTENT[id] ?? [`[Content block: ${id}]`];
}
