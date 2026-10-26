#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseJsonObject } from "./json-shape.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = join(root, "package.json");
const tempDir = join(root, ".tmp");
const backupPath = join(tempDir, "pack-package-json.backup.json");

function readPackageJson(): Readonly<Record<string, unknown>> {
  return parseJsonObject(readFileSync(packagePath, "utf8"), "package.json");
}

function writePackageJson(value: unknown): void {
  writeFileSync(packagePath, `${JSON.stringify(value, null, 2)}\n`);
}

function buildPackedPackageJson(packageJson: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const packedPackageJson: Record<string, unknown> = structuredClone(packageJson);
  delete packedPackageJson["devDependencies"];
  delete packedPackageJson["overrides"];
  delete packedPackageJson["scripts"];
  return packedPackageJson;
}

function hasErrorCode(error: unknown, code: string): boolean {
  return error instanceof Error && "code" in error && error.code === code;
}

function preparePackedPackageJson(): void {
  mkdirSync(tempDir, { recursive: true });
  const packageJson = readPackageJson();
  try {
    writeFileSync(backupPath, `${JSON.stringify(packageJson, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    });
  } catch (error) {
    if (hasErrorCode(error, "EEXIST")) {
      throw new Error(`package.json backup exists. Restore or remove it first: ${backupPath}`, { cause: error });
    }
    throw error;
  }
  writePackageJson(buildPackedPackageJson(packageJson));
}

function restorePackedPackageJson(): void {
  let backupPackageJson: unknown;
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

function restorePackedPackageJsonAfterPack(): void {
  if (process.env["npm_command"] === "publish") {
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
    throw new Error("Command is invalid. Use prepare, restore-after-pack, or restore.");
  }
}

export {
  buildPackedPackageJson,
  preparePackedPackageJson,
  restorePackedPackageJson,
  restorePackedPackageJsonAfterPack,
};
