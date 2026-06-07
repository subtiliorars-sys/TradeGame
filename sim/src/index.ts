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
