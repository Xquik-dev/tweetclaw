#!/usr/bin/env tsx

// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

/** Reject error suppressions. Fix the underlying issue instead. */

import { reportViolations, walkSourceFiles } from './check-common';

const SUPPRESSION_PATTERNS = [
  /eslint-disable-next-line/,
  /eslint-disable-line/,
  /eslint-disable/,
  /@ts-ignore/,
  /@ts-expect-error/,
  /@ts-nocheck/,
  /v8 ignore/,
  /istanbul ignore/,
  /c8 ignore/,
  /jscpd:ignore/,
];

const IGNORED_FILES = new Set([
  'check-suppressions.ts',
  'check-em-dash.ts',
  'eslint.config.ts',
]);

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

interface SuppressionViolation {
  readonly content: string;
  readonly file: string;
  readonly line: number;
  readonly pattern: string;
}

function findFirstMatchingPattern(line: string): RegExp | undefined {
  for (const pattern of SUPPRESSION_PATTERNS) {
    if (pattern.test(line)) {
      return pattern;
    }
  }
  return undefined;
}

const violations = walkSourceFiles<SuppressionViolation>(
  process.cwd(),
  {
    extensions: SOURCE_EXTENSIONS,
    ignoredFiles: IGNORED_FILES,
    scanLine: (line: string): boolean => findFirstMatchingPattern(line) !== undefined,
  },
  (file: string, line: number, content: string): SuppressionViolation => ({
    file,
    line,
    content,
    pattern: findFirstMatchingPattern(content)?.source ?? '',
  }),
);

if (violations.length > 0) {
  reportViolations(
    violations,
    'Error suppressions found.',
    [
      'Remove each suppression and fix its underlying issue.',
    ],
  );
  process.exit(1);
}

globalThis.console.log('Error suppression check passed.');
