#!/usr/bin/env node

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
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

function hasErrorCode(error, code) {
  return error instanceof Error && "code" in error && error.code === code;
}

function preparePackedPackageJson() {
  mkdirSync(tempDir, { recursive: true });
  const packageJson = readPackageJson();
  try {
    writeFileSync(backupPath, `${JSON.stringify(packageJson, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (hasErrorCode(error, "EEXIST")) {
      throw new Error(`Refusing to overwrite existing package.json backup: ${backupPath}`, { cause: error });
    }
    throw error;
  }
  writePackageJson(buildPackedPackageJson(packageJson));
}

function restorePackedPackageJson() {
  let backupPackageJson;
  try {
    backupPackageJson = JSON.parse(readFileSync(backupPath, "utf8"));
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) {
      return;
    }
    throw error;
  }

  writePackageJson(backupPackageJson);
  rmSync(backupPath);
}

function restorePackedPackageJsonAfterPack() {
  if (process.env.npm_command === "publish") {
    return;
  }

  restorePackedPackageJson();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  if (command === "prepare") {
    preparePackedPackageJson();
  } else if (command === "restore-after-pack") {
    restorePackedPackageJsonAfterPack();
  } else if (command === "restore") {
    restorePackedPackageJson();
  } else {
    throw new Error("Expected one of: prepare, restore-after-pack, restore");
  }
}

export { buildPackedPackageJson, preparePackedPackageJson, restorePackedPackageJson, restorePackedPackageJsonAfterPack };
