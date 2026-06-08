/**
 * TradeGame Phaser 3 entry point — SIM_ENGINE_SPEC §7 (Phaser 3 DECIDED).
 *
 * Boot order:
 *   AgeGateScene  →  (age ack)
 *   MenuScene     →  (START SCN-001)
 *   TradingScene  →  (forex order) → RiskModalScene (overlay)
 *
 * Wall-clock / sim-clock boundary is ONLY here and in TradingScene:
 *   - Engine clock.advance() is driven by a Phaser update() callback that
 *     accumulates real elapsed ms and converts to sim-ticks at the current
 *     compression multiplier. No Date.now() or wall-clock ever enters the
 *     engine itself (SIM_ENGINE_SPEC §1.1 determinism constraints).
 *
 * No external assets, fonts, or CDNs. All rendering is programmatic.
 * Palette: #0d0d0f (near-black), #e8a020 (amber), #f5f5f5 (light text).
 */

import Phaser from "phaser";
import { AgeGateScene } from "./ui/scenes/AgeGateScene.js";
import { MenuScene } from "./ui/scenes/MenuScene.js";
import { TradingScene } from "./ui/scenes/TradingScene.js";
import { RiskModalScene } from "./ui/scenes/RiskModalScene.js";
import { PolicyCardScene } from "./ui/scenes/PolicyCardScene.js";
import { ReplayScene } from "./ui/scenes/ReplayScene.js";
import { DrillScene } from "./ui/scenes/DrillScene.js";
import { IlCheckpointScene } from "./ui/scenes/IlCheckpointScene.js";
import { LpExplainerScene } from "./ui/scenes/LpExplainerScene.js";
import { DebriefScene } from "./ui/scenes/DebriefScene.js";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  backgroundColor: "#0d0d0f",
  scene: [AgeGateScene, MenuScene, TradingScene, RiskModalScene, PolicyCardScene, DebriefScene, ReplayScene, DrillScene, IlCheckpointScene, LpExplainerScene],
  parent: document.body,
  dom: { createContainer: false },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
