import { defineConfig } from "vite";
import path from "path";

// UI-layer Vite config — serves index.html and bundles the Phaser shell.
// The engine library config (vite.config.ts) is separate and stays untouched.
export default defineConfig({
  root: ".",
  // Relative base so the built bundle works when served from a GitHub Pages
  // sub-path (e.g. /TradeGame---Preview/play/). Absolute "/assets/" 404s there.
  base: "./",
  resolve: {
    alias: {
      // node:crypto is used by events.ts for sha256 digest (test/server only).
      // In the browser UI, the digest is never called; shim silences the error.
      "node:crypto": path.resolve(
        __dirname,
        "src/ui/engine/cryptoShim.ts"
      ),
    },
  },
  // No "lib" here — this is an app build, not a library build.
  build: {
    outDir: "dist-ui",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
