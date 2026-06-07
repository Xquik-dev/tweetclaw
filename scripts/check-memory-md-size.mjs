#!/usr/bin/env node

import { statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const byteLimit = 15 * 1024;
const memoryMarkdownFiles = [
  "docs/discoverability-audit.md",
  "docs/clawpack-release.md",
];

const rows = memoryMarkdownFiles.map((filePath) => ({
  filePath,
  bytes: statSync(join(root, filePath)).size,
}));
const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);

if (totalBytes > byteLimit) {
  const details = rows.map((row) => `  ${row.filePath}: ${row.bytes}`).join("\n");
  process.stderr.write(
    `Automation memory Markdown exceeds ${byteLimit} bytes:\n${details}\n  total: ${totalBytes}\nMove historical detail into non-Markdown archives before committing.\n`,
  );
  process.exit(1);
}

process.stdout.write(`Automation memory Markdown OK: ${totalBytes}/${byteLimit} bytes\n`);
