import { defineConfig } from "vite";

// Engine core is a library — no entry HTML.
// Phaser will be imported only in the UI layer (not here).
export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "TradeGameSim",
      formats: ["es", "cjs"],
      fileName: (format) => `tradegame-sim.${format}.js`,
    },
    // Keep phaser external; this package declares it as a dep for the UI layer
    // but the engine core must never import it.
    rollupOptions: {
      external: ["phaser"],
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // No globals — explicit imports keep test intent clear.
    globals: false,
  },
});
