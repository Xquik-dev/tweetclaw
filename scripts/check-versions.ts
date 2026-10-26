#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { replaceCoverage } from "./contract-files.ts";
import { at, listOf, parseJsonObject, readJsonObject, recordOf } from "./json-shape.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const packageJson = readJsonObject("package.json");
const expected = packageJson["version"];

const surfaces = [
  { path: "openclaw.plugin.json", get: (text: string) => parseJsonObject(text, "openclaw.plugin.json")["version"] },
  { path: "skills/tweetclaw/skill-card.md", get: (text: string) => /Package version `([^`]+)`/u.exec(text)?.[1] },
];

const drifts: string[] = [];
for (const s of surfaces) {
  const raw = readFileSync(join(root, s.path), "utf8");
  const found = s.get(raw);
  if (found !== expected) {
    drifts.push(`  ${s.path}: ${String(found ?? "<missing>")} (expected ${String(expected)})`);
  }
}

const openclaw = recordOf(packageJson["openclaw"]);
const openclawCompat = recordOf(openclaw["compat"]);
const openclawBuild = recordOf(openclaw["build"]);
const openclawInstall = recordOf(openclaw["install"]);
const peerDependencies = recordOf(packageJson["peerDependencies"]);
const packageFiles = listOf(packageJson["files"]);
const packageScripts = recordOf(packageJson["scripts"]);
const checkAllScript = packageScripts["check:all"];
const checkAll = typeof checkAllScript === "string" ? checkAllScript : "";
const expectedOpenClawBuildVersion = openclawBuild["openclawVersion"];
const expectedOpenClawMinimumVersion = openclawCompat["minGatewayVersion"];
const expectedOpenClawRange = `>=${String(expectedOpenClawMinimumVersion)}`;

if (openclawBuild["pluginSdkVersion"] !== expectedOpenClawBuildVersion) {
  drifts.push(
    `  package.json: openclaw.build.pluginSdkVersion ${String(openclawBuild["pluginSdkVersion"] ?? "<missing>")} (expected ${String(expectedOpenClawBuildVersion)})`,
  );
}

if (peerDependencies["openclaw"] !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: peerDependencies.openclaw ${String(peerDependencies["openclaw"] ?? "<missing>")} (expected ${expectedOpenClawRange})`,
  );
}
if (at(packageJson, "peerDependenciesMeta", "openclaw", "optional") === true) {
  drifts.push("  package.json: peerDependenciesMeta.openclaw must not mark the OpenClaw host peer optional");
}
if (openclawCompat["pluginApi"] !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: openclaw.compat.pluginApi ${String(openclawCompat["pluginApi"] ?? "<missing>")} (expected ${expectedOpenClawRange})`,
  );
}
if (openclawInstall["minHostVersion"] !== expectedOpenClawRange) {
  drifts.push(
    `  package.json: openclaw.install.minHostVersion ${String(openclawInstall["minHostVersion"] ?? "<missing>")} (expected ${expectedOpenClawRange})`,
  );
}
const expectedNpmSpec = `${String(packageJson["name"])}@${String(expected)}`;
if (openclawInstall["npmSpec"] !== expectedNpmSpec) {
  drifts.push(
    `  package.json: openclaw.install.npmSpec ${String(openclawInstall["npmSpec"] ?? "<missing>")} (expected ${expectedNpmSpec})`,
  );
}
const expectedClawHubSpec = `clawhub:${String(packageJson["name"])}`;
if (openclawInstall["clawhubSpec"] !== expectedClawHubSpec) {
  drifts.push(
    `  package.json: openclaw.install.clawhubSpec ${String(openclawInstall["clawhubSpec"] ?? "<missing>")} (expected ${expectedClawHubSpec})`,
  );
}
if (openclawInstall["defaultChoice"] !== "clawhub") {
  drifts.push(
    `  package.json: openclaw.install.defaultChoice ${String(openclawInstall["defaultChoice"] ?? "<missing>")} (expected clawhub)`,
  );
}
if (listOf(openclaw["runtimeExtensions"])[0] !== "./dist/index.js") {
  drifts.push(
    `  package.json: openclaw.runtimeExtensions ${JSON.stringify(openclaw["runtimeExtensions"] ?? null)} (expected ["./dist/index.js"])`,
  );
}
if (!packageFiles.includes("dist/")) {
  drifts.push("  package.json: files missing dist/");
}
if (!packageFiles.includes("skills/tweetclaw/")) {
  drifts.push("  package.json: files must include the complete TweetClaw skill directory");
}
if (packageFiles.includes("skills/tweetclaw/SKILL.md")) {
  drifts.push("  package.json: files must not package only SKILL.md without release evidence");
}
if (packageScripts["check-skill-frontmatter"] !== "node scripts/check-skill-frontmatter.ts") {
  drifts.push("  package.json: check-skill-frontmatter must validate packaged skill metadata");
}
if (packageScripts["check-memory-md-size"] !== "node scripts/check-memory-md-size.ts") {
  drifts.push("  package.json: check-memory-md-size must validate automation memory Markdown size");
}
if (packageScripts["check-openclaw-platform-fitness"] !== "node scripts/check-openclaw-platform-fitness.ts") {
  drifts.push("  package.json: check-openclaw-platform-fitness must validate OpenClaw platform metadata");
}
if (
  packageScripts["prepack"] !==
  "npm run build && npm run check-public-copy && npm run check-skill-frontmatter && npm run check-versions && npm run check-openclaw-platform-fitness && node scripts/pack-package-json.ts prepare"
) {
  drifts.push("  package.json: prepack must build output, validate metadata, and sanitize package.json before packing");
}
if (packageScripts["postpack"] !== "node scripts/pack-package-json.ts restore-after-pack") {
  drifts.push("  package.json: postpack must restore after npm pack and defer restore during npm publish");
}
if (packageScripts["check-package-artifact"] !== "node scripts/check-package-artifact.ts") {
  drifts.push("  package.json: check-package-artifact must validate packed files");
}
if (packageScripts["generate-api-contract"] !== "node scripts/generate-api-contract.ts") {
  drifts.push("  package.json: generate-api-contract must build the catalog from OpenAPI");
}
if (packageScripts["check-contract-drift"] !== "node scripts/generate-api-contract.ts --check") {
  drifts.push("  package.json: check-contract-drift must compare the bundled catalog with OpenAPI");
}
if (packageScripts["publish-clean"] !== "node scripts/publish-clean.ts") {
  drifts.push("  package.json: publish-clean must publish with sanitized package metadata");
}
if (
  packageScripts["prepublishOnly"] !==
  "npm run check-public-copy && npm run check-skill-frontmatter && npm run check-versions && npm run build && npm run check-openclaw-platform-fitness && npm run check-package-artifact"
) {
  drifts.push("  package.json: prepublishOnly must validate skill metadata, versions, build output, and package artifacts");
}
if (!checkAll.includes("npm run check-skill-frontmatter")) {
  drifts.push("  package.json: check:all must include skill frontmatter validation");
}
if (!checkAll.includes("npm run check-memory-md-size")) {
  drifts.push("  package.json: check:all must include automation memory Markdown size validation");
}
if (!checkAll.includes("npm run check-public-copy")) {
  drifts.push("  package.json: check:all must include public copy validation");
}
if (!checkAll.includes("npm run check-openclaw-platform-fitness")) {
  drifts.push("  package.json: check:all must include OpenClaw platform fitness validation");
}
if (!checkAll.includes("npm run check-package-artifact")) {
  drifts.push("  package.json: check:all must include package artifact validation");
}
if (packageScripts["check-reuse"] !== "node scripts/check-reuse.ts") {
  drifts.push("  package.json: check-reuse must run the pinned REUSE lint");
}
if (!checkAll.includes("npm run check-reuse")) {
  drifts.push("  package.json: check:all must include the REUSE lint");
}
if (!checkAll.includes("npm run check-contract-drift")) {
  drifts.push("  package.json: check:all must include the catalog drift check");
}

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
  const compilerOptions = recordOf(readJsonObject(configPath)["compilerOptions"]);
  for (const [key, expectedValue] of Object.entries(requiredCompilerOptions)) {
    if (compilerOptions[key] !== expectedValue) {
      drifts.push(
        `  ${configPath}: compilerOptions.${key} ${String(compilerOptions[key] ?? "<missing>")} (expected ${String(expectedValue)})`,
      );
    }
  }
}

const retiredFacts = [
  "102 agent-callable endpoints",
  "102 endpoints",
  "33 public paid-read routes",
  "33 prepaid public",
  "7 direct MPP routes",
  "7 direct read routes",
  "7 read-only routes",
  "exactly 7",
];
const positioning =
  "the world's fastest and cheapest X Twitter scraper service with the most complete X data";
const legalLine =
  'Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.';
const listingDescription = packageJson["description"];
if (typeof listingDescription !== "string") {
  throw new TypeError("package.json field description is not text");
}

const contentChecks = [
  {
    path: "README.md",
    required: [
      "account-backed X automation",
      positioning,
      "Xquik charges only for delivered, unique, filter-matching results and never pads rows.",
      legalLine,
      "verified ClawHub publisher scope",
      "for current plans, eligible endpoints, and live prices",
      "Account-backed or MPP where eligible",
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
    required: ["local Xquik endpoint catalog", "billing guide", "idempotencyKey", "Not affiliated with X Corp."],
    forbidden: ["113 endpoints", "112 endpoints", "Per-Operation Costs", "/api/v1/x/users/{id}/unfollow", "/api/v1/x/users/:username"],
  },
  {
    path: "docs/context7-agent-guide.md",
    required: ["2026.7.1"],
    forbidden: ["99 endpoints", "2026.5.4"],
  },
  {
    path: "docs/context7-quickstarts.md",
    required: ["idempotencyKey", "2026.7.1"],
    forbidden: ["/api/v1/x/users/by-username/:username", "2026.5.4"],
  },
  {
    path: "openclaw.plugin.json",
    required: [listingDescription, "Not affiliated with X Corp."],
    forbidden: ["113 endpoints", "112 endpoints"],
  },
  {
    path: "context7.json",
    required: [listingDescription],
    forbidden: [],
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

const copyFiles = [
  "README.md",
  "context7.json",
  "openclaw.plugin.json",
  ...readdirSync(join(root, "docs")).map((name) => `docs/${name}`),
  ...readdirSync(join(root, "skills/tweetclaw")).filter((name) => name.endsWith(".md")).map((name) => `skills/tweetclaw/${name}`),
];
for (const path of copyFiles) {
  const raw = readFileSync(join(root, path), "utf8");
  for (const fact of retiredFacts) {
    if (raw.includes(fact)) {
      drifts.push(`  ${path}: stale "${fact}"`);
    }
  }
  for (const [mention, name, version] of raw.matchAll(/\b(mppx|viem)@(\d+\.\d+\.\d+)/gu)) {
    if (name === undefined) {
      continue;
    }
    if (version !== peerDependencies[name]) {
      drifts.push(`  ${path}: ${mention} (expected ${name}@${String(peerDependencies[name])})`);
    }
  }
}

function readCoverageCounts() {
  const counts = recordOf(readJsonObject("generated-api-contract.json")["counts"]);
  const count = (key: string): number => {
    const value = counts[key];
    if (typeof value !== "number") {
      throw new TypeError(`generated-api-contract.json field counts.${key} is not a number`);
    }
    return value;
  };
  return {
    agentProhibited: count("agentProhibited"),
    callable: count("callable"),
    cataloged: count("cataloged"),
    eventStreams: count("eventStreams"),
    excluded: count("excluded"),
    mpp: count("mpp"),
    outsideApiV1: count("outsideApiV1"),
    specOperations: count("specOperations"),
  };
}

const readme = readFileSync(join(root, "README.md"), "utf8");
if (replaceCoverage(readme, readCoverageCounts()) !== readme) {
  drifts.push("  README.md: the API coverage block differs from generated-api-contract.json. Run npm run generate-api-contract.");
}

if (drifts.length > 0) {
  process.stderr.write(
    `Version drift detected (package.json = ${String(expected)}):\n${drifts.join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(`Version check passed: ${String(expected)}\n`);
