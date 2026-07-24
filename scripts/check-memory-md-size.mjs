#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const byteLimit = 15 * 1024;
const releaseGuideFiles = ["docs/clawpack-release.md"];

const rows = releaseGuideFiles.map((filePath) => ({
  filePath,
  bytes: statSync(join(root, filePath)).size,
}));
const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);

if (totalBytes > byteLimit) {
  const details = rows.map((row) => `  ${row.filePath}: ${row.bytes}`).join("\n");
  process.stderr.write(
    `Release guide exceeds ${byteLimit} bytes:\n${details}\n  total: ${totalBytes}\nKeep operational logs outside the public repository.\n`,
  );
  process.exit(1);
}

process.stdout.write(`Release guide size OK: ${totalBytes}/${byteLimit} bytes\n`);
