#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { preparePackedPackageJson, restorePackedPackageJson } from "./pack-package-json.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pluginManifest = JSON.parse(readFileSync(join(root, "openclaw.plugin.json"), "utf8"));

function normalizePackagePath(value) {
  return value.replace(/\\/g, "/").replace(/^package\//u, "").replace(/^\.\//u, "");
}

function readPackedPackage() {
  const output = execFileSync(
    "npm",
    ["pack", "--json", "--ignore-scripts"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const parsed = JSON.parse(output);
  let rows = [];
  if (Array.isArray(parsed)) {
    rows = parsed;
  } else if (typeof parsed === "object" && parsed !== null) {
    rows = Object.values(parsed);
  }
  if (!Array.isArray(rows) || rows.length !== 1 || typeof rows[0] !== "object" || rows[0] === null) {
    throw new TypeError("npm pack did not return exactly one package row");
  }
  return rows[0];
}

function readPackedFiles(packageRow) {
  if (!Array.isArray(packageRow.files)) {
    throw new TypeError("npm pack did not report package files");
  }
  return packageRow.files.map((file) => {
    if (typeof file?.path !== "string") {
      throw new TypeError("npm pack reported a file without a string path");
    }
    return normalizePackagePath(file.path);
  });
}

function readPackedPackageJson(filename) {
  const raw = execFileSync(
    "tar",
    ["-xOf", filename, "package/package.json"],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const parsed = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new TypeError("packed package.json must be a JSON object");
  }
  return parsed;
}

function readStringList(label, value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((entry, index) => {
    if (typeof entry !== "string" || entry.trim().length === 0) {
      throw new TypeError(`${label}[${index}] must be a non-empty string`);
    }
    return normalizePackagePath(entry);
  });
}

function normalizeSkillEntry(entry) {
  const normalized = normalizePackagePath(entry);
  return normalized.endsWith(".md") ? normalized : `${normalized}/SKILL.md`;
}

preparePackedPackageJson();

let packageRow;
let packedPackageJson;
try {
  packageRow = readPackedPackage();
  if (typeof packageRow.filename !== "string" || packageRow.filename.length === 0) {
    throw new TypeError("npm pack did not report a package filename");
  }
  packedPackageJson = readPackedPackageJson(packageRow.filename);
} finally {
  if (typeof packageRow?.filename === "string" && packageRow.filename.length > 0) {
    rmSync(join(root, packageRow.filename), { force: true });
  }
  restorePackedPackageJson();
}

const files = readPackedFiles(packageRow);
const fileSet = new Set(files);
const sourceExtensions = readStringList("package.json openclaw.extensions", packageJson.openclaw?.extensions);
const runtimeExtensions = readStringList("package.json openclaw.runtimeExtensions", packageJson.openclaw?.runtimeExtensions);
const skillFiles = readStringList("openclaw.plugin.json skills", pluginManifest.skills).map(normalizeSkillEntry);
const requiredFiles = [
  "LICENSE",
  "README.md",
  "openclaw.plugin.json",
  "package.json",
  "skills/tweetclaw/BENCHMARK.md",
  "skills/tweetclaw/evals/evals.json",
  "skills/tweetclaw/skill-card.md",
  "skills/tweetclaw/skillspector-report.md",
  ...sourceExtensions,
  ...runtimeExtensions,
  ...skillFiles,
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
for (const forbiddenManifestField of ["devDependencies", "overrides", "scripts"]) {
  if (Object.hasOwn(packedPackageJson, forbiddenManifestField)) {
    errors.push(`packed package.json must omit ${forbiddenManifestField}`);
  }
}
if (packedPackageJson.peerDependencies?.openclaw !== packageJson.peerDependencies?.openclaw) {
  errors.push("packed package.json must preserve the OpenClaw host peer dependency");
}
if (packedPackageJson.peerDependenciesMeta?.openclaw?.optional === true) {
  errors.push("packed package.json must not mark the OpenClaw host peer optional");
}
if (runtimeExtensions.length === 0) {
  errors.push("package.json openclaw.runtimeExtensions must list built runtime entries");
}
if (sourceExtensions.length === 0) {
  errors.push("package.json openclaw.extensions must list source entries");
}
if (sourceExtensions.length !== runtimeExtensions.length) {
  errors.push("package.json openclaw.extensions and openclaw.runtimeExtensions must have matching lengths");
}
if (skillFiles.length === 0) {
  errors.push("openclaw.plugin.json skills must list packaged skill roots");
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
