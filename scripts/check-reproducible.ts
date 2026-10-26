#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function runNpm(args: readonly string[]): void {
  const result = spawnSync("npm", args, {
    cwd: root,
    stdio: "inherit",
  });
  if (result.error !== undefined) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`npm ${args.join(" ")} failed with status ${result.status}`);
  }
}

async function hashFiles(rootDirectory: string, currentDirectory = rootDirectory): Promise<[string, string][]> {
  const hashes: [string, string][] = [];
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const path = join(currentDirectory, entry.name);
    if (entry.isDirectory()) {
      hashes.push(...(await hashFiles(rootDirectory, path)));
      continue;
    }
    if (entry.isFile()) {
      const digest = createHash("sha256").update(await readFile(path)).digest("hex");
      hashes.push([relative(rootDirectory, path), digest]);
    }
  }

  return hashes;
}

async function readPackage(directory: string): Promise<Buffer> {
  const [packageName, ...otherPackageNames] = (await readdir(directory)).filter((name) => name.endsWith(".tgz"));
  assert.ok(packageName !== undefined && otherPackageNames.length === 0, "Expected exactly one package archive");
  return readFile(join(directory, packageName));
}

runNpm(["run", "build"]);
const firstBuild = await hashFiles(join(root, "dist"));

runNpm(["run", "build"]);
const secondBuild = await hashFiles(join(root, "dist"));
assert.deepEqual(secondBuild, firstBuild, "Repeated builds produced different files");

const workspace = await mkdtemp(join(tmpdir(), "tweetclaw-reproducible-"));

try {
  const firstPack = join(workspace, "first");
  const secondPack = join(workspace, "second");
  await mkdir(firstPack);
  await mkdir(secondPack);

  runNpm(["pack", "--pack-destination", firstPack]);
  runNpm(["pack", "--pack-destination", secondPack]);

  assert.deepEqual(
    await readPackage(secondPack),
    await readPackage(firstPack),
    "Repeated package archives differ",
  );
} finally {
  await rm(workspace, { force: true, recursive: true });
}

process.stdout.write("Build outputs and package archives are reproducible.\n");
