// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function isList(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

export function recordOf(value: unknown): Readonly<Record<string, unknown>> {
  return isRecord(value) ? value : {};
}

export function listOf(value: unknown): readonly unknown[] {
  return isList(value) ? value : [];
}

export function parseJsonObject(text: string, source: string): Readonly<Record<string, unknown>> {
  const value: unknown = JSON.parse(text);
  if (!isRecord(value)) {
    throw new TypeError(`${source} must be a JSON object`);
  }
  return value;
}

export function at(value: unknown, ...keys: readonly string[]): unknown {
  let current = value;
  for (const key of keys) {
    current = isRecord(current) ? current[key] : undefined;
  }
  return current;
}

export function readJsonObject(relativePath: string): Readonly<Record<string, unknown>> {
  return parseJsonObject(readFileSync(join(root, relativePath), "utf8"), relativePath);
}
