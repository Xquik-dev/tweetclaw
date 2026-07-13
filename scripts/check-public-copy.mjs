#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scannedExtensions = new Set([".cjs", ".js", ".json", ".jsx", ".md", ".mjs", ".ts", ".tsx", ".yaml", ".yml"]);
const ignoredFiles = new Set(["scripts/check-public-copy.mjs"]);
const restrictedPatterns = [
  { label: "exact currency amount", value: /\$\d/iu },
  { label: "credit-to-currency conversion", value: /\b1\s+credit\s*(?:=|equals)\s*\$/iu },
  { label: "exact credit charge", value: /\b\d+(?:\s*(?:-|to)\s*\d+)?\s+credits?(?:\s*\/\s*(?:entry|hour|result)|\s+per\s+(?:entry|hour|result))?\b/iu },
  { label: "exact checkout threshold", value: /\$\d+(?:\.\d+)?\s*(?:max(?:imum)?|min(?:imum)?)/iu },
  { label: "exact non-MPP result price", value: /\$\d+(?:\.\d+)?\s*\/\s*(?:entry|hour|result)/iu },
  { label: "duplicated direct MPP price table", value: /\bdirect\s+mpp\s+pricing\b/iu },
];
const publicMppPrice = /^const MPP_PRICE_[A-Z_]+ = '\$\d+\.\d+\/call';$/u;

function isAllowedPublicPrice(file, line, label) {
  return label === "exact currency amount"
    && file === "src/api-spec.ts"
    && publicMppPrice.test(line.trim());
}

function listCandidateFiles() {
  return execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split("\0")
    .filter((file) => file.length > 0);
}

const violations = [];
for (const file of listCandidateFiles()) {
  if (ignoredFiles.has(file) || !scannedExtensions.has(extname(file))) {
    continue;
  }

  const filePath = join(root, file);
  if (!existsSync(filePath)) {
    continue;
  }

  for (const [index, line] of readFileSync(filePath, "utf8").split("\n").entries()) {
    for (const pattern of restrictedPatterns) {
      if (isAllowedPublicPrice(file, line, pattern.label)) {
        continue;
      }
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
