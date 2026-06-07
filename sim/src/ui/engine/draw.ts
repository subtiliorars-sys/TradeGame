/**
 * Programmatic draw helpers — palette constants and reusable Phaser Graphics
 * primitives.
 *
 * No external assets. All rendering is rects and Phaser BitmapText / Text.
 * Palette per site prototype spec:
 *   BG:     #0d0d0f  (near-black canvas background)
 *   AMBER:  #e8a020  (primary accent, headings, interactive highlights)
 *   SURFACE:#16161a  (panel background — slightly lighter than BG)
 *   BORDER: #2a2a30  (panel border, separator lines)
 *   TEXT:   #f5f5f5  (primary text)
 *   DIM:    #888898  (secondary / disabled text)
 *   GREEN:  #4caf50  (positive indicator, enabled button highlight)
 *   RED:    #e05050  (negative indicator, warning)
 */

export const C = {
  BG:      0x0d0d0f,
  AMBER:   0xe8a020,
  SURFACE: 0x16161a,
  BORDER:  0x2a2a30,
  TEXT:    0xf5f5f5,
  DIM:     0x888898,
  GREEN:   0x4caf50,
  RED:     0xe05050,
} as const;

export const CSS = {
  BG:      "#0d0d0f",
  AMBER:   "#e8a020",
  SURFACE: "#16161a",
  BORDER:  "#2a2a30",
  TEXT:    "#f5f5f5",
  DIM:     "#888898",
  GREEN:   "#4caf50",
  RED:     "#e05050",
} as const;

/** Draw a filled rounded rect on a Graphics object. */
export function fillRect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  radius = 4
): void {
  g.fillStyle(color, 1);
  g.fillRoundedRect(x, y, w, h, radius);
}

/** Draw a stroked rounded rect border. */
export function strokeRect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  lineWidth = 1,
  radius = 4
): void {
  g.lineStyle(lineWidth, color, 1);
  g.strokeRoundedRect(x, y, w, h, radius);
}

/** Convenience: panel with surface fill + border stroke. */
export function panel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  radius = 6
): void {
  fillRect(g, x, y, w, h, C.SURFACE, radius);
  strokeRect(g, x, y, w, h, C.BORDER, 1, radius);
}

/** Add a Phaser Text object with sensible defaults. */
export function label(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  opts: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {}
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontFamily: "monospace",
    fontSize: "14px",
    color: CSS.TEXT,
    ...opts,
  });
}

/**
 * A simple clickable button drawn with rects and text.
 * Returns the text object (the interactive zone covers it).
 */
export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  onClick: () => void,
  opts: {
    fillColor?: number;
    textColor?: string;
    fontSize?: string;
    disabled?: boolean;
  } = {}
): { bg: Phaser.GameObjects.Graphics; label: Phaser.GameObjects.Text } {
  const fill = opts.disabled ? C.BORDER : (opts.fillColor ?? C.AMBER);
  const textColor = opts.disabled ? CSS.DIM : (opts.textColor ?? CSS.BG);

  const g = scene.add.graphics();
  fillRect(g, x, y, w, h, fill, 4);
  if (!opts.disabled) strokeRect(g, x, y, w, h, C.AMBER, 1, 4);

  const lbl = scene.add.text(x + w / 2, y + h / 2, text, {
    fontFamily: "monospace",
    fontSize: opts.fontSize ?? "14px",
    color: textColor,
    fontStyle: "bold",
  });
  lbl.setOrigin(0.5, 0.5);

  if (!opts.disabled) {
    lbl.setInteractive({ useHandCursor: true });
    lbl.on("pointerup", onClick);
    lbl.on("pointerover", () => {
      g.clear();
      fillRect(g, x, y, w, h, C.AMBER, 4);
      lbl.setColor(CSS.BG);
    });
    lbl.on("pointerout", () => {
      g.clear();
      fillRect(g, x, y, w, h, fill, 4);
      strokeRect(g, x, y, w, h, C.AMBER, 1, 4);
      lbl.setColor(textColor);
    });
  }

  return { bg: g, label: lbl };
}

/** Horizontal divider line. */
export function hline(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  color = C.BORDER
): void {
  g.lineStyle(1, color, 1);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x + width, y);
  g.strokePath();
}
