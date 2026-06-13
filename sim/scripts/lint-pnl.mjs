#!/usr/bin/env node
/**
 * lint-pnl.mjs - cross-platform PnL scoring rail (SIM_ENGINE_SPEC 4.1 / TEST_PLAN 2.2)
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");

const files = [
  "engine/scoring.ts",
  "engine/rank.ts",
  "engine/progress.ts",
  "engine/amm.ts",
  "drills/catalog.ts",
  "drills/livePredicates.ts",
  "drills/liveCatalog.ts",
  "ui/engine/gating.ts",
  "ui/engine/lp.ts",
  "ui/engine/replay.ts",
];

const pattern =
  /realizedPnL|unrealizedPnL|pnlScore|winRate|returnOnAccount|returnPct|profitUsd|profitPips/;

let failed = false;

for (const rel of files) {
  const f = join(src, rel);
  if (!existsSync(f)) {
    console.log(`lint-pnl: note - ${rel} not present on this branch (skipped)`);
    continue;
  }
  const lines = readFileSync(f, "utf8").split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(\/\/|\*)/.test(line)) continue;
    if (pattern.test(line)) hits.push(`${i + 1}:${line.trim()}`);
  }
  if (hits.length) {
    console.error(`\nlint-pnl: FAIL - PnL-related identifier found in ${rel}`);
    console.error("Reference: SIM_ENGINE_SPEC 4.1 and RISK_REGISTER 16\n");
    hits.forEach((h) => console.error(h));
    failed = true;
  }
}

for (const rel of files) {
  const f = join(src, rel);
  if (!existsSync(f)) continue;
  const text = readFileSync(f, "utf8");
  if (text.includes("blowupClassifier")) {
    console.error(
      `\nlint-pnl: FAIL - ${rel} references blowupClassifier (structural import ban)`
    );
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("lint-pnl: OK - no prohibited PnL identifiers in scoring-adjacent modules");
