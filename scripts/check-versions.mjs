#!/usr/bin/env node

// Pre-publish / pre-commit guard: fails if any known version surface
// disagrees with package.json. See Xquik-dev/xquik#2024.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const expected = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))
  .version;

const surfaces = [
  { path: "server.json", get: (j) => JSON.parse(j).version },
  { path: "openclaw.plugin.json", get: (j) => JSON.parse(j).version },
];

const drifts = [];
for (const s of surfaces) {
  const raw = readFileSync(join(root, s.path), "utf8");
  const found = s.get(raw);
  if (found !== expected) {
    drifts.push(`  ${s.path}: ${found ?? "<missing>"} (expected ${expected})`);
  }
}

if (drifts.length > 0) {
  process.stderr.write(
    `Version drift detected (package.json = ${expected}):\n${drifts.join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(`All surfaces at ${expected}\n`);
