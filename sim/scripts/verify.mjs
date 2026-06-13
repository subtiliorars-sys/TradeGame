#!/usr/bin/env node
/**
 * verify.mjs - TradeGame sim pre-PR gate (cross-platform)
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

function run(label, cmd, args) {
  console.log(`==> ${label}`);
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (r.status !== 0) {
    console.error(`verify: FAILED at ${label} (exit ${r.status ?? 1})`);
    process.exit(r.status ?? 1);
  }
}

console.log(`==> tradegame-sim verify (cwd: ${root})`);

if (!existsSync(join(root, "node_modules"))) {
  run("npm install", "npm", ["install"]);
}

run("npm run typecheck:ui", "npm", ["run", "typecheck:ui"]);
run("npm run lint-pnl", "npm", ["run", "lint-pnl"]);
run("npm test", "npm", ["test"]);
run("npm run build:ui", "npm", ["run", "build:ui"]);

console.log("\nverify: OK - all gates passed");
