#!/usr/bin/env node

// Pre-publish / pre-commit guard: fails if any known version surface
// disagrees with package.json. See Xquik-dev/xquik#2024.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
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
if (packageJson.peerDependenciesMeta?.openclaw?.optional === true) {
  drifts.push("  package.json: peerDependenciesMeta.openclaw must not mark the OpenClaw host peer optional");
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
const expectedNpmSpec = `${packageJson.name}@${expected}`;
const expectedClawHubSpec = `clawhub:${packageJson.name}@${expected}`;
if (openclawInstall?.clawhubSpec !== expectedClawHubSpec) {
  drifts.push(
    `  package.json: openclaw.install.clawhubSpec ${openclawInstall?.clawhubSpec ?? "<missing>"} (expected ${expectedClawHubSpec})`,
  );
}
if (openclawInstall?.npmSpec !== expectedNpmSpec) {
  drifts.push(
    `  package.json: openclaw.install.npmSpec ${openclawInstall?.npmSpec ?? "<missing>"} (expected ${expectedNpmSpec})`,
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
if (packageJson.scripts?.["check-skill-frontmatter"] !== "node scripts/check-skill-frontmatter.mjs") {
  drifts.push("  package.json: check-skill-frontmatter must validate packaged skill metadata");
}
if (
  packageJson.scripts?.prepack !==
  "npm run build && npm run check-skill-frontmatter && npm run check-versions && node scripts/pack-package-json.mjs prepare"
) {
  drifts.push("  package.json: prepack must build output, validate metadata, and sanitize package.json before packing");
}
if (packageJson.scripts?.postpack !== "node scripts/pack-package-json.mjs restore-after-pack") {
  drifts.push("  package.json: postpack must restore after npm pack and defer restore during npm publish");
}
if (packageJson.scripts?.postpublish !== "node scripts/pack-package-json.mjs restore") {
  drifts.push("  package.json: postpublish must restore the working package.json after publishing");
}
if (packageJson.scripts?.["check-package-artifact"] !== "node scripts/check-package-artifact.mjs") {
  drifts.push("  package.json: check-package-artifact must validate packed files");
}
if (packageJson.scripts?.prepublishOnly !== "npm run check-skill-frontmatter && npm run check-versions && npm run build && npm run check-package-artifact") {
  drifts.push("  package.json: prepublishOnly must validate skill metadata, versions, build output, and package artifacts");
}
if (!packageJson.scripts?.["check:all"]?.includes("npm run check-skill-frontmatter")) {
  drifts.push("  package.json: check:all must include skill frontmatter validation");
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
    if (!publicHygieneExtensions.some((extension) => file.endsWith(extension))) {
      continue;
    }

    let lineNumber = 0;
    for (const line of readFileSync(join(root, file), "utf8").split("\n")) {
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
      "99 agent-callable endpoints across 9 categories",
      "Search tweets, search tweet replies, post tweets, post tweet replies",
      "for the current plans, eligible endpoints, and operation costs",
      "Account-backed or MPP where eligible",
    ],
    forbidden: [
      "about 33x cheaper",
      "vs Official X API",
      "Per-Operation Costs",
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
