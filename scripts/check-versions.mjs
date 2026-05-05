#!/usr/bin/env node

// Pre-publish / pre-commit guard: fails if any known version surface
// disagrees with package.json. See Xquik-dev/xquik#2024.

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const expected = packageJson.version;

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

const expectedOpenClawVersion = packageJson.openclaw?.build?.openclawVersion;
const expectedOpenClawRange = `>=${expectedOpenClawVersion}`;
const openclawCompat = packageJson.openclaw?.compat;
const openclawInstall = packageJson.openclaw?.install;

if (packageJson.peerDependencies?.openclaw !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: peerDependencies.openclaw ${packageJson.peerDependencies?.openclaw ?? "<missing>"} (expected ${expectedOpenClawRange})`,
  );
}
if (openclawCompat?.pluginApi !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: openclaw.compat.pluginApi ${openclawCompat?.pluginApi ?? "<missing>"} (expected ${expectedOpenClawRange})`,
  );
}
if (openclawCompat?.minGatewayVersion !== expectedOpenClawVersion) {
  drifts.push(
    `  package.json: openclaw.compat.minGatewayVersion ${openclawCompat?.minGatewayVersion ?? "<missing>"} (expected ${expectedOpenClawVersion})`,
  );
}
if (openclawInstall?.minHostVersion !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: openclaw.install.minHostVersion ${openclawInstall?.minHostVersion ?? "<missing>"} (expected ${expectedOpenClawRange})`,
  );
}
if (packageJson.openclaw?.runtimeExtensions?.[0] !== "./dist/index.js") {
  drifts.push(
    `  package.json: openclaw.runtimeExtensions ${JSON.stringify(packageJson.openclaw?.runtimeExtensions ?? null)} (expected ["./dist/index.js"])`,
  );
}
if (!packageJson.files?.includes("dist/")) {
  drifts.push("  package.json: files missing dist/");
}
if (packageJson.scripts?.prepack !== "npm run build && npm run check-versions") {
  drifts.push("  package.json: prepack must build runtime output before package dry-run/publish");
}
if (packageJson.scripts?.["check-package-artifact"] !== "node scripts/check-package-artifact.mjs") {
  drifts.push("  package.json: check-package-artifact must validate packed files");
}
if (packageJson.scripts?.prepublishOnly !== "npm run check-versions && npm run build && npm run check-package-artifact") {
  drifts.push("  package.json: prepublishOnly must validate versions, build output, and package artifacts");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-package-artifact")) {
  drifts.push("  package.json: check:all must include package artifact validation");
}

const contentChecks = [
  {
    path: "README.md",
    required: [
      "| Follow check, article | 5 | $0.00075 |",
      "account-backed X automation",
      "99 agent-callable endpoints across 9 categories",
      "1-5 credits",
    ],
    forbidden: [
      "| Follow check, article | 7 | $0.00105 |",
      "113 endpoints",
      "112 endpoints",
      "63 agent-callable endpoints",
      "1-7 credits",
    ],
  },
  {
    path: "skills/tweetclaw/SKILL.md",
    required: ["agent-safe Xquik endpoint catalog", "1-5 credits"],
    forbidden: ["113 endpoints", "112 endpoints", "1-7 credits"],
  },
  {
    path: "src/api-spec.ts",
    required: ["/api/v1/credits/topup/status"],
    forbidden: [],
  },
  {
    path: "server.json",
    required: ["99 agent-callable endpoints"],
    forbidden: ["113 endpoints", "112 endpoints", "63 agent-callable endpoints"],
  },
  {
    path: "openclaw.plugin.json",
    required: ["structured Xquik endpoints"],
    forbidden: ["113 endpoints", "112 endpoints"],
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
