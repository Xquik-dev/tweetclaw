#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function normalizePackagePath(value) {
  return value.replace(/\\/g, "/").replace(/^package\//u, "").replace(/^\.\//u, "");
}

function readPackageDryRun() {
  const output = execFileSync(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const rows = JSON.parse(output);
  if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0] !== "object" || rows[0] === null) {
    throw new TypeError("npm pack dry-run did not return exactly one package row");
  }
  return rows[0];
}

function readPackedFiles(packageRow) {
  if (!Array.isArray(packageRow.files)) {
    throw new TypeError("npm pack dry-run did not report package files");
  }
  return packageRow.files.map((file) => {
    if (typeof file?.path !== "string") {
      throw new TypeError("npm pack dry-run reported a file without a string path");
    }
    return normalizePackagePath(file.path);
  });
}

const packageRow = readPackageDryRun();
const files = readPackedFiles(packageRow);
const fileSet = new Set(files);
const runtimeExtensions = Array.isArray(packageJson.openclaw?.runtimeExtensions)
  ? packageJson.openclaw.runtimeExtensions.map((entry) => normalizePackagePath(entry))
  : [];
const requiredFiles = [
  "LICENSE",
  "README.md",
  "openclaw.plugin.json",
  "package.json",
  "skills/tweetclaw/SKILL.md",
  "src/index.ts",
  ...runtimeExtensions,
];
const forbiddenFiles = [
  ".DS_Store",
  ".npmrc",
  "src/tools/executor.ts",
];
const forbiddenPrefixes = [
  ".env",
  ".github/",
  "coverage/",
  "node_modules/",
  "package/",
  "tests/",
];
const errors = [];

if (packageRow.version !== packageJson.version) {
  errors.push(`package version ${packageRow.version ?? "<missing>"} does not match package.json ${packageJson.version}`);
}
if (runtimeExtensions.length === 0) {
  errors.push("package.json openclaw.runtimeExtensions must list built runtime entries");
}
for (const runtimeEntry of runtimeExtensions) {
  if (!runtimeEntry.endsWith(".js")) {
    errors.push(`runtime extension must be built JavaScript: ${runtimeEntry}`);
  }
}
for (const requiredFile of requiredFiles) {
  if (!fileSet.has(requiredFile)) {
    errors.push(`required package file missing: ${requiredFile}`);
  }
}
for (const forbiddenFile of forbiddenFiles) {
  if (fileSet.has(forbiddenFile)) {
    errors.push(`forbidden package file included: ${forbiddenFile}`);
  }
}
for (const file of files) {
  if (file.endsWith(".tgz")) {
    errors.push(`forbidden tarball included: ${file}`);
  }
  for (const prefix of forbiddenPrefixes) {
    if (file.startsWith(prefix)) {
      errors.push(`forbidden package path included: ${file}`);
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(`Package artifact check failed:\n${errors.map((error) => `  ${error}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Package artifact OK: ${packageJson.name}@${packageJson.version} (${files.length} files)\n`);
