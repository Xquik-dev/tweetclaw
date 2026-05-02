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

const contentChecks = [
  {
    path: "README.md",
    required: [
      "| Follow check, article | 5 | $0.00075 |",
      "full access, 113 endpoints",
      "All 113 endpoints available",
      "113 endpoints across 10 categories",
      "1-5 credits",
    ],
    forbidden: [
      "| Follow check, article | 7 | $0.00105 |",
      "112 endpoints",
      "1-7 credits",
    ],
  },
  {
    path: "skills/tweetclaw/SKILL.md",
    required: ["113 endpoints", "1-5 credits"],
    forbidden: ["112 endpoints", "1-7 credits"],
  },
  {
    path: "src/api-spec.ts",
    required: ["/api/v1/credits/topup/status"],
    forbidden: [],
  },
  {
    path: "server.json",
    required: ["113 endpoints"],
    forbidden: ["112 endpoints"],
  },
  {
    path: "openclaw.plugin.json",
    required: ["113 endpoints"],
    forbidden: ["112 endpoints"],
  },
];

for (const check of contentChecks) {
  const raw = readFileSync(join(root, check.path), "utf8");
  for (const required of check.required) {
    if (!raw.includes(required)) {
      drifts.push(`  ${check.path}: missing "${required}"`);
    }
  }
  for (const forbidden of check.forbidden) {
    if (raw.includes(forbidden)) {
      drifts.push(`  ${check.path}: stale "${forbidden}"`);
    }
  }
}

if (drifts.length > 0) {
  process.stderr.write(
    `Version drift detected (package.json = ${expected}):\n${drifts.join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(`All surfaces at ${expected}\n`);
