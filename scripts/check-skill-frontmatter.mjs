#!/usr/bin/env node

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const violations = [];

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function toRelativePath(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function addViolation(filePath, line, message) {
  violations.push(`${toRelativePath(filePath)}:${String(line)} ${message}`);
}

function resolveSkillFile(skillEntry) {
  if (typeof skillEntry !== "string" || skillEntry.trim() === "") {
    violations.push("openclaw.plugin.json: skills entries must be non-empty strings");
    return null;
  }

  const resolvedEntry = path.resolve(root, skillEntry);
  if (resolvedEntry !== root && !resolvedEntry.startsWith(`${root}${path.sep}`)) {
    violations.push(`openclaw.plugin.json: skill path escapes package root: ${skillEntry}`);
    return null;
  }

  return skillEntry.endsWith(".md") ? resolvedEntry : path.join(resolvedEntry, "SKILL.md");
}

function parseFrontmatter(filePath) {
  if (!existsSync(filePath)) {
    violations.push(`${toRelativePath(filePath)}: missing skill file`);
    return null;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/u);
  if (lines[0] !== "---") {
    addViolation(filePath, 1, "must start with frontmatter delimiter");
    return null;
  }

  const endIndex = lines.findIndex((line, index) => index > 0 && line === "---");
  if (endIndex === -1) {
    addViolation(filePath, 1, "missing closing frontmatter delimiter");
    return null;
  }

  const fields = new Map();
  const keyPattern = /^([A-Za-z][A-Za-z0-9_-]*):(?:\s+(.+))?$/u;

  for (let index = 1; index < endIndex; index += 1) {
    const line = lines[index] ?? "";
    const lineNumber = index + 1;

    if (line.trim() === "") {
      continue;
    }
    if (/^\s/u.test(line) || line.trimStart().startsWith("- ")) {
      addViolation(filePath, lineNumber, "frontmatter must use single-line key/value entries");
      continue;
    }

    const match = keyPattern.exec(line);
    if (!match) {
      addViolation(filePath, lineNumber, "frontmatter line must be `key: value`");
      continue;
    }

    const [, key, rawValue = ""] = match;
    if (fields.has(key)) {
      addViolation(filePath, lineNumber, `duplicate frontmatter key: ${key}`);
    }
    if (rawValue.trim().length > 0) {
      fields.set(key, { line: lineNumber, value: rawValue.trim() });
      continue;
    }

    if (key !== "metadata") {
      addViolation(filePath, lineNumber, "frontmatter line must be `key: value`");
      continue;
    }

    const block = [];
    index += 1;
    while (index < endIndex) {
      const blockLine = lines[index] ?? "";
      if (!/^\s/u.test(blockLine) || blockLine.trim() === "") {
        index -= 1;
        break;
      }
      block.push({ line: index + 1, value: blockLine });
      index += 1;
    }
    fields.set(key, { block, line: lineNumber, value: "" });
  }

  return fields;
}

function validateRequiredField(filePath, fields, key) {
  const field = fields.get(key);
  if (!field) {
    addViolation(filePath, 1, `missing required frontmatter key: ${key}`);
    return;
  }
  if (field.value.length === 0) {
    addViolation(filePath, field.line, `${key} must not be empty`);
  }
}

function validateMetadata(filePath, fields) {
  const field = fields.get("metadata");
  if (!field) {
    addViolation(filePath, 1, "missing required frontmatter key: metadata");
    return;
  }

  if (field.block) {
    if (field.block.length !== 1) {
      addViolation(filePath, field.line, "metadata block must contain exactly one openclaw entry");
      return;
    }
    const entry = field.block[0];
    const openclawMatch = /^\s+openclaw:\s+(.+)$/u.exec(entry.value);
    if (!openclawMatch) {
      addViolation(filePath, entry.line, "metadata block must use `openclaw: { ... }`");
      return;
    }
    try {
      const parsed = JSON.parse(openclawMatch[1]);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        addViolation(filePath, entry.line, "metadata.openclaw must be a JSON object");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown JSON parse error";
      addViolation(filePath, entry.line, `metadata.openclaw must be valid JSON: ${message}`);
    }
    return;
  }

  try {
    const parsed = JSON.parse(field.value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      addViolation(filePath, field.line, "metadata must be a single-line JSON object");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown JSON parse error";
    addViolation(filePath, field.line, `metadata must be valid single-line JSON: ${message}`);
  }
}

const pluginManifest = readJson("openclaw.plugin.json");
const skillEntries = Array.isArray(pluginManifest.skills) ? pluginManifest.skills : [];

if (skillEntries.length === 0) {
  violations.push("openclaw.plugin.json: skills must list at least one packaged skill");
}

for (const skillEntry of skillEntries) {
  const skillFile = resolveSkillFile(skillEntry);
  if (!skillFile) {
    continue;
  }

  const fields = parseFrontmatter(skillFile);
  if (!fields) {
    continue;
  }

  for (const key of ["name", "description", "homepage", "license"]) {
    validateRequiredField(skillFile, fields, key);
  }
  validateMetadata(skillFile, fields);
}

if (violations.length > 0) {
  process.stderr.write(`Skill frontmatter check failed:\n${violations.map((violation) => `  ${violation}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Skill frontmatter OK for ${String(skillEntries.length)} skill(s)\n`);
