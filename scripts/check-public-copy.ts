#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MPP_PRICE_PATTERN, RESTRICTED_BILLING_PATTERNS } from "./public-copy-rules.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scannedExtensions = new Set([".cjs", ".js", ".json", ".jsx", ".md", ".mjs", ".ts", ".tsx", ".yaml", ".yml"]);
const ignoredFiles = new Set(["scripts/check-public-copy.ts"]);

function withoutPublicMppPrices(file: string, line: string): string {
  return file === "generated-api-contract.json" || file.startsWith("tests/")
    ? line.replaceAll(MPP_PRICE_PATTERN, "")
    : line;
}

function listCandidateFiles(): string[] {
  return execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\0")
    .filter((file) => file.length > 0);
}

const violations: string[] = [];
for (const file of listCandidateFiles()) {
  if (ignoredFiles.has(file) || !scannedExtensions.has(extname(file))) {
    continue;
  }

  const filePath = join(root, file);
  if (!existsSync(filePath)) {
    continue;
  }

  for (const [index, rawLine] of readFileSync(filePath, "utf8").split("\n").entries()) {
    const line = withoutPublicMppPrices(file, rawLine);
    for (const pattern of RESTRICTED_BILLING_PATTERNS) {
      if (pattern.value.test(line)) {
        violations.push(`${file}:${index + 1} contains ${pattern.label}`);
      }
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`Restricted public billing details found:\n${violations.map((violation) => `  ${violation}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write("Public copy contains no restricted billing details\n");
