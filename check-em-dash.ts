#!/usr/bin/env tsx

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

/**
 * TweetClaw - Dash Detector
 *
 * Scans all source and JSON files for banned dash patterns:
 * - Raw em-dash character U+2014
 * - Escaped em-dash in JSON (\u2014)
 * - Double-dash separator " -- " (space-hyphen-hyphen-space)
 *
 * All are banned in copy. Use " - " (space-hyphen-space) instead.
 *
 * Exits with code 1 if any violations are found.
 */

import { reportViolations, walkSourceFiles } from './check-common';
import type { BaseViolation } from './check-common';

const IGNORED_FILES = new Set([
  'check-em-dash.ts',
]);

const SOURCE_AND_JSON_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.md'];

function hasBannedDash(line: string): boolean {
  return line.includes('\u2014') || line.includes(String.raw`\u2014`) || line.includes(' -- ');
}

const violations = walkSourceFiles<BaseViolation>(
  process.cwd(),
  {
    extensions: SOURCE_AND_JSON_EXTENSIONS,
    ignoredFiles: IGNORED_FILES,
    scanLine: hasBannedDash,
  },
  (file: string, line: number, content: string): BaseViolation => ({ file, line, content }),
);

if (violations.length > 0) {
  reportViolations(
    violations,
    'Banned dashes detected!',
    ['Em-dashes and double-dash separators (" -- ") are banned. Use " - " (space-hyphen-space) instead.'],
  );
  process.exit(1);
}

globalThis.console.log('No banned dashes found!');
