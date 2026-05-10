#!/usr/bin/env node

import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = join(root, "package.json");
const tempDir = join(root, ".tmp");
const backupPath = join(tempDir, "pack-package-json.backup.json");

function readPackageJson() {
  return JSON.parse(readFileSync(packagePath, "utf8"));
}

function writePackageJson(value) {
  writeFileSync(packagePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildPackedPackageJson(packageJson) {
  const packedPackageJson = structuredClone(packageJson);
  delete packedPackageJson.devDependencies;
  delete packedPackageJson.overrides;
  delete packedPackageJson.scripts;
  return packedPackageJson;
}

function preparePackedPackageJson() {
  if (existsSync(backupPath)) {
    throw new Error(`Refusing to overwrite existing package.json backup: ${backupPath}`);
  }

  mkdirSync(tempDir, { recursive: true });
  const packageJson = readPackageJson();
  writeFileSync(backupPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  writePackageJson(buildPackedPackageJson(packageJson));
}

function restorePackedPackageJson() {
  if (!existsSync(backupPath)) {
    return;
  }

  const backupPackageJson = JSON.parse(readFileSync(backupPath, "utf8"));
  writePackageJson(backupPackageJson);
  rmSync(backupPath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === "prepare") {
    preparePackedPackageJson();
  } else if (command === "restore") {
    restorePackedPackageJson();
  } else {
    throw new Error("Expected one of: prepare, restore");
  }
}

export { buildPackedPackageJson, preparePackedPackageJson, restorePackedPackageJson };
