/**
 * Browser-compatible shim for the node:crypto hash used in events.ts.
 *
 * The engine uses sha256hex() only for golden-replay digest verification —
 * a test/server concern. In the browser UI, the digest is never called;
 * this shim silences the missing-module error without shipping Node builtins.
 *
 * This shim is applied via Vite alias in vite.ui.config.ts.
 * DO NOT import this file directly; it replaces "node:crypto" at bundle time.
 */

export function createHash(_algorithm: string): {
  update(data: string, _encoding?: string): { digest(enc: string): string };
} {
  return {
    update(data: string) {
      return {
        digest(_enc: string): string {
          // Stub — sha256hex is not called in the browser UI path.
          // Full digest would require Web Crypto (async); not needed in Phase 2.
          return "sha256-not-available-in-browser";
        },
      };
    },
  };
}
