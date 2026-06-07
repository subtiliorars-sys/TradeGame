// tradegame-sim — public API surface
// Engine core only; Phaser/UI layer lives outside this package.
export * from "./engine/prng.js";
export * from "./engine/events.js";
export * from "./engine/clock.js";
export * from "./engine/scoring.js";
export * from "./orders/book.js";
export * from "./orders/account.js";
export * from "./orders/risk.js";
// Data layer — IMarketFeed, adapters, scenario script types.
export * from "./data/feed.js";
export * from "./data/generator.js";
export { createCryptoAdapter } from "./data/crypto.js";
export { createStocksAdapter } from "./data/stocks.js";
export { createForexAdapter } from "./data/forex.js";
// Scenarios — typed manifests and V0 definitions.
export * from "./scenarios/types.js";
export { scn001 } from "./scenarios/scn001.js";
export { scn002 } from "./scenarios/scn002.js";
export { scn003 } from "./scenarios/scn003.js";
// Harness — headless scenario runner (integration surface + golden-replay backend).
export * from "./harness/run.js";
