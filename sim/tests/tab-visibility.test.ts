import { describe, expect, it } from "vitest";
import {
  shouldAutoPauseOnTabHide,
  shouldAutoResumeOnTabShow,
  shouldBlockResumeWhileHidden,
} from "../src/ui/tabVisibility.js";

describe("tabVisibility", () => {
  it("auto-pauses only when hidden and not already paused", () => {
    expect(shouldAutoPauseOnTabHide(true, "1x")).toBe(true);
    expect(shouldAutoPauseOnTabHide(true, "16x")).toBe(true);
    expect(shouldAutoPauseOnTabHide(true, "paused")).toBe(false);
    expect(shouldAutoPauseOnTabHide(false, "1x")).toBe(false);
  });

  it("resumes only after a tab auto-pause when visible again", () => {
    expect(shouldAutoResumeOnTabShow(false, true)).toBe(true);
    expect(shouldAutoResumeOnTabShow(false, false)).toBe(false);
    expect(shouldAutoResumeOnTabShow(true, true)).toBe(false);
  });

  it("blocks resume speed while the document is hidden", () => {
    expect(shouldBlockResumeWhileHidden(true)).toBe(true);
    expect(shouldBlockResumeWhileHidden(false)).toBe(false);
  });
});
