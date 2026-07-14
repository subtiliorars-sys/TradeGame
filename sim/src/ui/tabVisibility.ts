import type { CompressionMode } from "../engine/clock.js";

/** Auto-pause the sim clock when the player switches browser tabs mid-run. */
export function shouldAutoPauseOnTabHide(
  documentHidden: boolean,
  compression: CompressionMode
): boolean {
  return documentHidden && compression !== "paused";
}

export function shouldAutoResumeOnTabShow(
  documentHidden: boolean,
  tabAutoPaused: boolean
): boolean {
  return !documentHidden && tabAutoPaused;
}

/** Block speed-up clicks while the tab is hidden (resume stays intentional). */
export function shouldBlockResumeWhileHidden(documentHidden: boolean): boolean {
  return documentHidden;
}
