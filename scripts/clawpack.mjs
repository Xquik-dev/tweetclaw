#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CLAWHUB_VERSION = "0.12.2";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const command = process.argv.at(2) ?? "dry-run";
const packDestination = process.env.CLAWHUB_PACK_DIR
  ?? mkdtempSync(join(tmpdir(), "tweetclaw-clawpack-"));
const sourceRepo = process.env.SOURCE_REPO ?? "Xquik-dev/tweetclaw";
const sourceCommit = process.env.SOURCE_COMMIT
  ?? execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
const gitBranch = execFileSync("git", ["branch", "--show-current"], { cwd: root, encoding: "utf8" }).trim();
const sourceRef = process.env.SOURCE_REF ?? (gitBranch.length > 0 ? gitBranch : "master");
const tags = process.env.PACKAGE_TAG ?? "latest";
const owner = process.env.CLAWHUB_OWNER ?? "kriptoburak";

function runClawHub(args, options = {}) {
  return execFileSync("npx", ["--yes", `clawhub@${CLAWHUB_VERSION}`, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "inherit"],
  });
}

function packClawPack() {
  const output = runClawHub([
    "package",
    "pack",
    ".",
    "--pack-destination",
    packDestination,
    "--json",
  ]);
  const pack = JSON.parse(output);
  if (pack.name !== packageJson.name) {
    throw new Error(`Packed name ${pack.name ?? "<missing>"} does not match ${packageJson.name}`);
  }
  if (pack.version !== packageJson.version) {
    throw new Error(`Packed version ${pack.version ?? "<missing>"} does not match ${packageJson.version}`);
  }
  if (typeof pack.path !== "string" || !existsSync(pack.path)) {
    throw new Error(`Packed ClawPack tarball is missing: ${String(pack.path)}`);
  }
  process.stdout.write(`${JSON.stringify(pack, null, 2)}\n`);
  return pack.path;
}

if (!["dry-run", "pack", "publish"].includes(command)) {
  process.stderr.write("Usage: node scripts/clawpack.mjs [pack|dry-run|publish]\n");
  process.exit(2);
}

const packPath = packClawPack();
if (command === "pack") {
  process.exit(0);
}

const publishArgs = [
  "package",
  "publish",
  packPath,
  "--family",
  "code-plugin",
  "--owner",
  owner,
  "--source-repo",
  sourceRepo,
  "--source-commit",
  sourceCommit,
  "--source-ref",
  sourceRef,
  "--source-path",
  ".",
  "--tags",
  tags,
  "--json",
];

if (command === "dry-run") {
  publishArgs.push("--dry-run");
}

process.stdout.write(runClawHub(publishArgs));
