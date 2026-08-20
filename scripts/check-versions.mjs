#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

// Pre-publish / pre-commit guard: fails if any known version surface
// disagrees with package.json. See Xquik-dev/xquik#2024.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const expected = packageJson.version;

const surfaces = [
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

const openclawCompat = packageJson.openclaw?.compat;
const openclawBuild = packageJson.openclaw?.build;
const openclawInstall = packageJson.openclaw?.install;
const expectedOpenClawBuildVersion = openclawBuild?.openclawVersion;
const expectedOpenClawMinimumVersion = openclawCompat?.minGatewayVersion;
const expectedOpenClawRange = `>=${expectedOpenClawMinimumVersion}`;

if (openclawBuild?.pluginSdkVersion !== expectedOpenClawBuildVersion) {
  drifts.push(
    `  package.json: openclaw.build.pluginSdkVersion ${openclawBuild?.pluginSdkVersion ?? "<missing>"} (expected ${expectedOpenClawBuildVersion})`,
  );
}

if (packageJson.peerDependencies?.openclaw !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: peerDependencies.openclaw ${packageJson.peerDependencies?.openclaw ?? "<missing>"} (expected ${expectedOpenClawRange})`,
  );
}
if (packageJson.peerDependenciesMeta?.openclaw?.optional === true) {
  drifts.push("  package.json: peerDependenciesMeta.openclaw must not mark the OpenClaw host peer optional");
}
if (openclawCompat?.pluginApi !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: openclaw.compat.pluginApi ${openclawCompat?.pluginApi ?? "<missing>"} (expected ${expectedOpenClawRange})`,
  );
}
if (openclawInstall?.minHostVersion !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: openclaw.install.minHostVersion ${openclawInstall?.minHostVersion ?? "<missing>"} (expected ${expectedOpenClawRange})`,
  );
}
const expectedNpmSpec = `${packageJson.name}@${expected}`;
if (openclawInstall?.npmSpec !== expectedNpmSpec) {
  drifts.push(
    `  package.json: openclaw.install.npmSpec ${openclawInstall?.npmSpec ?? "<missing>"} (expected ${expectedNpmSpec})`,
  );
}
const expectedClawHubSpec = `clawhub:${packageJson.name}`;
if (openclawInstall?.clawhubSpec !== expectedClawHubSpec) {
  drifts.push(
    `  package.json: openclaw.install.clawhubSpec ${openclawInstall?.clawhubSpec ?? "<missing>"} (expected ${expectedClawHubSpec})`,
  );
}
if (openclawInstall?.defaultChoice !== "clawhub") {
  drifts.push(
    `  package.json: openclaw.install.defaultChoice ${openclawInstall?.defaultChoice ?? "<missing>"} (expected clawhub)`,
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
if (!packageJson.files?.includes("skills/tweetclaw/")) {
  drifts.push("  package.json: files must include the complete TweetClaw skill directory");
}
if (packageJson.files?.includes("skills/tweetclaw/SKILL.md")) {
  drifts.push("  package.json: files must not package only SKILL.md without release evidence");
}
if (packageJson.scripts?.["check-skill-frontmatter"] !== "node scripts/check-skill-frontmatter.mjs") {
  drifts.push("  package.json: check-skill-frontmatter must validate packaged skill metadata");
}
if (packageJson.scripts?.["check-memory-md-size"] !== "node scripts/check-memory-md-size.mjs") {
  drifts.push("  package.json: check-memory-md-size must validate automation memory Markdown size");
}
if (packageJson.scripts?.["check-openclaw-platform-fitness"] !== "node scripts/check-openclaw-platform-fitness.mjs") {
  drifts.push("  package.json: check-openclaw-platform-fitness must validate OpenClaw platform metadata");
}
if (
  packageJson.scripts?.prepack !==
  "npm run build && npm run check-public-copy && npm run check-skill-frontmatter && npm run check-versions && npm run check-openclaw-platform-fitness && node scripts/pack-package-json.mjs prepare"
) {
  drifts.push("  package.json: prepack must build output, validate metadata, and sanitize package.json before packing");
}
if (packageJson.scripts?.postpack !== "node scripts/pack-package-json.mjs restore-after-pack") {
  drifts.push("  package.json: postpack must restore after npm pack and defer restore during npm publish");
}
if (packageJson.scripts?.["check-package-artifact"] !== "node scripts/check-package-artifact.mjs") {
  drifts.push("  package.json: check-package-artifact must validate packed files");
}
if (packageJson.scripts?.["check-contract-drift"] !== "npm run build && node scripts/check-contract-drift.mjs") {
  drifts.push("  package.json: check-contract-drift must compare the bundled catalog with OpenAPI");
}
if (packageJson.scripts?.["publish-clean"] !== "node scripts/publish-clean.mjs") {
  drifts.push("  package.json: publish-clean must publish with sanitized package metadata");
}
if (
  packageJson.scripts?.prepublishOnly !==
  "npm run check-public-copy && npm run check-skill-frontmatter && npm run check-versions && npm run build && npm run check-openclaw-platform-fitness && npm run check-package-artifact"
) {
  drifts.push("  package.json: prepublishOnly must validate skill metadata, versions, build output, and package artifacts");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-skill-frontmatter")) {
  drifts.push("  package.json: check:all must include skill frontmatter validation");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-memory-md-size")) {
  drifts.push("  package.json: check:all must include automation memory Markdown size validation");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-public-copy")) {
  drifts.push("  package.json: check:all must include public copy validation");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-openclaw-platform-fitness")) {
  drifts.push("  package.json: check:all must include OpenClaw platform fitness validation");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-package-artifact")) {
  drifts.push("  package.json: check:all must include package artifact validation");
}

const confidentialHashChunksByLength = {
  "6": [
    ["58e5064b", "d852946e", "a0c8edd0", "06647456", "3c91cf12", "661da8f6", "4d3a99de", "a3377c52"],
    ["bed7e15b", "c5f5f5c0", "284144b6", "998e2c83", "d0b60d8c", "265413eb", "77820b0c", "1c826fbe"],
  ],
  "8": [
    ["bc00b512", "cef88d40", "59f4ade3", "6b426a22", "6a679a72", "db60fc8c", "83a0a2c5", "79e54948"],
  ],
  "10": [
    ["b671ca7c", "993ccee7", "46fff10f", "8706d92b", "3d8e388c", "89ab6860", "3ba68cc5", "95776448"],
  ],
};
const publicHygieneExtensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".yml", ".yaml"];
const confidentialHashesByLength = new Map(
  Object.entries(confidentialHashChunksByLength).map(([length, chunks]) => [
    Number(length),
    new Set(chunks.map((parts) => parts.join(""))),
  ]),
);

function digest(value) {
  return createHash("sha256").update(value).digest("hex");
}

function containsConfidentialTerm(line) {
  const normalized = line.toLowerCase();

  for (const [targetLength, hashes] of confidentialHashesByLength) {
    if (normalized.length < targetLength) {
      continue;
    }

    for (let startIndex = 0; startIndex <= normalized.length - targetLength; startIndex += 1) {
      if (hashes.has(digest(normalized.slice(startIndex, startIndex + targetLength)))) {
        return true;
      }
    }
  }

  return false;
}

function readPublicCandidateFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  return output.split("\0").filter((entry) => entry.length > 0);
}

function scanPublicHygiene() {
  for (const file of readPublicCandidateFiles()) {
    const filePath = join(root, file);
    if (!existsSync(filePath) || !publicHygieneExtensions.some((extension) => file.endsWith(extension))) {
      continue;
    }

    let lineNumber = 0;
    for (const line of readFileSync(filePath, "utf8").split("\n")) {
      lineNumber += 1;
      if (containsConfidentialTerm(line)) {
        drifts.push(`  ${file}:${lineNumber} contains confidential public wording`);
      }
    }
  }
}

scanPublicHygiene();

const requiredCompilerOptions = {
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  exactOptionalPropertyTypes: true,
  noFallthroughCasesInSwitch: true,
  noImplicitReturns: true,
  noPropertyAccessFromIndexSignature: true,
  noUncheckedIndexedAccess: true,
  noUncheckedSideEffectImports: true,
  strict: true,
  verbatimModuleSyntax: true,
};

for (const configPath of ["tsconfig.json", "tsconfig.eslint.json"]) {
  const config = JSON.parse(readFileSync(join(root, configPath), "utf8"));
  const compilerOptions = config.compilerOptions ?? {};
  for (const [key, expectedValue] of Object.entries(requiredCompilerOptions)) {
    if (compilerOptions[key] !== expectedValue) {
      drifts.push(
        `  ${configPath}: compilerOptions.${key} ${String(compilerOptions[key] ?? "<missing>")} (expected ${String(expectedValue)})`,
      );
    }
  }
}

const contentChecks = [
  {
    path: "README.md",
    required: [
      "account-backed X automation",
      "102 agent-callable endpoints across 9 categories",
      "verified ClawHub publisher scope",
      "for current plans, eligible endpoints, and live prices",
      "Account-backed or MPP where eligible",
      "33 public paid-read routes",
      "7 direct MPP routes",
      "Not affiliated with X Corp.",
    ],
    forbidden: [
      "about 33x cheaper",
      "vs Official X API",
      "Per-Operation Costs",
      "113 endpoints",
      "112 endpoints",
      "63 agent-callable endpoints",
      "99 agent-callable endpoints",
      "npm is the canonical install source",
      "ClawHub owner-scope validation is pending",
      "listing lags behind npm",
    ],
  },
  {
    path: "skills/tweetclaw/SKILL.md",
    required: ["agent-safe Xquik endpoint catalog", "billing guide", "33 public paid-read routes", "7 direct read routes", "idempotencyKey", "Not affiliated with X Corp."],
    forbidden: ["113 endpoints", "112 endpoints", "Per-Operation Costs", "/api/v1/x/users/{id}/unfollow", "/api/v1/x/users/:username"],
  },
  {
    path: "docs/context7-agent-guide.md",
    required: ["102 endpoints", "2026.7.1"],
    forbidden: ["99 endpoints", "2026.5.4"],
  },
  {
    path: "docs/context7-quickstarts.md",
    required: ["idempotencyKey", "2026.7.1"],
    forbidden: ["/api/v1/x/users/by-username/:username", "2026.5.4"],
  },
  {
    path: "src/api-spec.ts",
    required: [
      "/api/v1/credits/topup/status",
      "/api/v1/webhooks/:id/resume",
      "/api/v1/x/users/:id/replies",
      "/api/v1/x/write-actions/:id",
      "Idempotency-Key",
    ],
    forbidden: [
      "/api/v1/x/users/by-username/:username",
      "/api/v1/x/users/:id/unfollow",
      "attachment_url",
      "reply_to_message_id",
    ],
  },
  {
    path: "openclaw.plugin.json",
    required: ["structured Xquik endpoints", "7 direct read routes", "Not affiliated with X Corp."],
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

process.stdout.write(`Version check passed: ${expected}\n`);
