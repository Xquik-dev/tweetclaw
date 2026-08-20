#!/usr/bin/env tsx

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

/** Reject em dashes, escaped em dashes, and spaced double hyphens. */

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
    'Banned dashes found.',
    ['Replace each em dash or spaced double hyphen with plain punctuation.'],
  );
  process.exit(1);
}

globalThis.console.log('Dash check passed.');
