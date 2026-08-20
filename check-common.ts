// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', 'coverage']);

interface BaseViolation {
  readonly content: string;
  readonly file: string;
  readonly line: number;
}

interface ScanOptions {
  readonly extensions: readonly string[];
  readonly ignoredFiles: ReadonlySet<string>;
  readonly scanLine: (line: string) => boolean;
}

function scanFile<T extends BaseViolation>(
  filePath: string,
  rootDir: string,
  scanLine: (line: string) => boolean,
  buildViolation: (file: string, line: number, content: string) => T,
): T[] {
  const content = readFileSync(filePath, 'utf8');
  const relativePath = path.relative(rootDir, filePath);
  const found: T[] = [];
  let lineNumber = 0;

  for (const line of content.split('\n')) {
    lineNumber += 1;
    if (scanLine(line)) {
      found.push(buildViolation(relativePath, lineNumber, line.trim()));
    }
  }

  return found;
}

function walkSourceFiles<T extends BaseViolation>(
  dir: string,
  options: Readonly<ScanOptions>,
  buildViolation: (file: string, line: number, content: string) => T,
): T[] {
  const violations: T[] = [];

  function scan(currentDir: string): void {
    const entries = readdirSync(currentDir);

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory() && !IGNORED_DIRS.has(entry)) {
        scan(fullPath);
      } else if (stat.isFile() && !options.ignoredFiles.has(entry) && options.extensions.some((ext) => entry.endsWith(ext))) {
        const fileViolations = scanFile(fullPath, dir, options.scanLine, buildViolation);
        violations.push(...fileViolations);
      }
    }
  }

  scan(dir);
  return violations;
}

function reportViolations(
  violations: readonly BaseViolation[],
  errorHeader: string,
  errorFooter: readonly string[],
): void {
  const consoleReference = globalThis.console;

  consoleReference.error(`\n${errorHeader}\n`);
  consoleReference.error('Files:');
  consoleReference.error('');

  for (const violation of violations) {
    consoleReference.error(`  ${violation.file}:${String(violation.line)}`);
    consoleReference.error(`    ${violation.content}`);
    consoleReference.error('');
  }

  consoleReference.error(
    `${String(violations.length)} violation(s) in ${String(new Set(violations.map((v) => v.file)).size)} file(s).`,
  );
  consoleReference.error('');

  for (const line of errorFooter) {
    consoleReference.error(line);
  }

  consoleReference.error('');
}

export { reportViolations, walkSourceFiles };
export type { BaseViolation, ScanOptions };
