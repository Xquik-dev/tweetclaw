// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { MAX_EXCEPTION_DAYS, parseExceptions, verify } from '../scripts/audit-policy.ts';
import type { AuditException, AuditInputs } from '../scripts/audit-policy.ts';

const PICOMATCH = 'https://github.com/advisories/GHSA-fc5q-39xc-vjpf';
const ADDED = '2026-11-18T13:00:00Z';
const EXPIRES = '2026-12-02T13:00:00Z';
const DURING = Date.parse('2026-11-20T00:00:00Z');
const EXCEPTION: AuditException = {
  added: ADDED,
  evidence: 'https://github.com/Xquik-dev/tweetclaw/issues/131',
  expires: EXPIRES,
  exposure: 'Dev tools compile only this repository\'s own globs.',
  id: 'GHSA-fc5q-39xc-vjpf',
  package: 'picomatch',
  version: '4.0.7',
};
const INSTALLED = new Map([
  ['node_modules/picomatch', '4.0.7'],
  ['node_modules/vitest', '5.0.5'],
  ['node_modules/knip', '6.1.0'],
  ['node_modules/@vitest/coverage-v8', '5.0.5'],
  ['node_modules/hono', '4.13.13'],
]);

type Entry = Readonly<{ name: string; severity: string; via: readonly unknown[]; nodes: readonly string[] }>;

function report(entries: readonly Entry[]): unknown {
  const severities = ['info', 'low', 'moderate', 'high', 'critical'];
  const counts = Object.fromEntries(
    severities.map((severity) => [severity, entries.filter((entry) => entry.severity === severity).length]),
  );
  return {
    auditReportVersion: 2,
    metadata: { vulnerabilities: { ...counts, total: entries.length } },
    vulnerabilities: Object.fromEntries(entries.map((entry) => [entry.name, entry])),
  };
}

const advisory = (name: string, url: string): Readonly<Record<string, string>> => ({
  name,
  severity: 'high',
  url,
});
const picomatchEntry: Entry = {
  name: 'picomatch',
  nodes: ['node_modules/picomatch'],
  severity: 'high',
  via: [advisory('picomatch', PICOMATCH)],
};
const dependents: readonly Entry[] = [
  { name: 'vitest', nodes: ['node_modules/vitest'], severity: 'high', via: ['picomatch'] },
  { name: 'knip', nodes: ['node_modules/knip'], severity: 'high', via: ['picomatch', 'vitest'] },
];
const MASTER_REPORT = report([picomatchEntry, ...dependents]);

const inputs = (overrides: Partial<AuditInputs> = {}): AuditInputs => ({
  auditStatus: 1,
  exceptions: [EXCEPTION],
  installed: INSTALLED,
  newest: new Map([['picomatch', '4.0.7']]),
  now: DURING,
  report: MASTER_REPORT,
  ...overrides,
});

describe('verify', () => {
  it('passes the excused picomatch advisory and the packages that reach the audit only through it', () => {
    expect(verify(inputs()).failures).toBe(0);
  });

  it('fails the advisory once its exception expires', () => {
    expect(verify(inputs({ now: Date.parse(EXPIRES) })).failures).toBe(1);
  });

  it('fails the advisory once npm has a newer picomatch than the excused version', () => {
    expect(verify(inputs({ newest: new Map([['picomatch', '4.0.8']]) })).failures).toBe(1);
  });

  it('fails the same advisory on another installed picomatch version', () => {
    const installed = new Map([...INSTALLED, ['node_modules/picomatch', '4.0.6']]);
    expect(verify(inputs({ installed, newest: new Map([['picomatch', '4.0.6']]) })).failures).toBe(1);
  });

  it('fails an advisory the exceptions leave out, beside the excused one', () => {
    const hono: Entry = {
      name: 'hono',
      nodes: ['node_modules/hono'],
      severity: 'moderate',
      via: [advisory('hono', 'https://github.com/advisories/GHSA-46wx-v44x-9hh2')],
    };
    expect(verify(inputs({ report: report([picomatchEntry, ...dependents, hono]) })).failures).toBe(1);
  });

  it('fails an exception that lasts longer than its limit or names no evidence issue', () => {
    const long = { ...EXCEPTION, expires: new Date(Date.parse(ADDED) + (MAX_EXCEPTION_DAYS + 1) * 86_400_000).toISOString() };
    const unproven = { ...EXCEPTION, evidence: 'https://example.com/notes' };
    expect([long, unproven].map((exception) => verify(inputs({ exceptions: [exception] })).failures > 0)).toStrictEqual([
      true,
      true,
    ]);
  });

  it('fails a report whose counts disagree with its entries or whose shape it cannot read', () => {
    const miscounted = { ...(MASTER_REPORT as Record<string, unknown>), metadata: { vulnerabilities: { high: 1, total: 1 } } };
    const reaching: Entry = { name: 'vite', nodes: ['node_modules/vitest'], severity: 'high', via: ['tinyglobby'] };
    const unread = [miscounted, { vulnerabilities: [] }, report([picomatchEntry, reaching])];
    expect(unread.map((value) => verify(inputs({ report: value })).failures > 0)).toStrictEqual([true, true, true]);
  });
});

const PROPERTY_RUNS = 100;

function advisoryEntry(code: string): Entry {
  return {
    name: `pkg${code}`,
    nodes: [`node_modules/pkg${code}`],
    severity: 'high',
    via: [advisory(`pkg${code}`, `https://github.com/advisories/GHSA-${code}-${code}-${code}`)],
  };
}

function failuresWhenExcused(codes: readonly string[], excused: readonly boolean[]): Readonly<{ actual: number; expected: number }> {
  const exceptions = codes
    .filter((_, index) => excused[index] === true)
    .map((code) => ({ ...EXCEPTION, id: `GHSA-${code}-${code}-${code}`, package: `pkg${code}`, version: '1.0.0' }));
  const verdict = verify({
    auditStatus: 1,
    exceptions,
    installed: new Map(codes.map((code) => [`node_modules/pkg${code}`, '1.0.0'])),
    newest: new Map(codes.map((code) => [`pkg${code}`, '1.0.0'])),
    now: DURING,
    report: report(codes.map((code) => advisoryEntry(code))),
  });
  return { actual: verdict.failures, expected: codes.length - exceptions.length };
}

describe('verify, on reports built to slip past it', () => {
  const critical = 'https://github.com/advisories/GHSA-46wx-v44x-9hh2';

  it('fails an advisory on an entry that lists no install path', () => {
    const hidden: Entry = { name: 'hono', nodes: [], severity: 'critical', via: [advisory('hono', critical)] };
    expect(verify(inputs({ report: report([picomatchEntry, ...dependents, hidden]) })).failures).toBe(1);
  });

  it('fails entries whose via chains reach each other and never an advisory', () => {
    const first: Entry = { name: 'vitest', nodes: ['node_modules/vitest'], severity: 'critical', via: ['knip'] };
    const second: Entry = { name: 'knip', nodes: ['node_modules/knip'], severity: 'critical', via: ['vitest'] };
    expect(verify(inputs({ report: report([first, second]) })).failures).toBe(2);
  });

  it('fails an entry whose via reaches only itself', () => {
    const own: Entry = { name: 'vitest', nodes: ['node_modules/vitest'], severity: 'critical', via: ['vitest'] };
    expect(verify(inputs({ report: report([own]) })).failures).toBe(1);
  });

  it('passes a cycle that holds the excused advisory', () => {
    const looped: Entry = { ...picomatchEntry, via: [advisory('picomatch', PICOMATCH), 'vitest'] };
    expect(verify(inputs({ report: report([looped, ...dependents]) })).failures).toBe(0);
  });

  it('passes the cycle real npm reports, where vitest and its coverage reach each other and picomatch', () => {
    const vitest: Entry = {
      name: 'vitest',
      nodes: ['node_modules/vitest'],
      severity: 'high',
      via: ['@vitest/coverage-v8', 'picomatch'],
    };
    const coverage: Entry = {
      name: '@vitest/coverage-v8',
      nodes: ['node_modules/@vitest/coverage-v8'],
      severity: 'high',
      via: ['vitest'],
    };
    expect(verify(inputs({ report: report([picomatchEntry, vitest, coverage]) })).failures).toBe(0);
  });

  it('fails when npm audit exits 1 on a report with no findings', () => {
    expect(verify(inputs({ auditStatus: 1, report: report([]) })).failures).toBe(1);
  });

  it('fails when npm audit exits 0 on a report with findings', () => {
    expect(verify(inputs({ auditStatus: 0 })).failures).toBe(1);
  });

  it.each([
    ['another host', 'https://example.com/advisories/GHSA-fc5q-39xc-vjpf'],
    ['a longer id', 'https://github.com/advisories/GHSA-fc5q-39xc-vjpf-abcd'],
    ['a path around the id', 'https://github.com/advisories/x/GHSA-fc5q-39xc-vjpf'],
  ])('fails an advisory link on %s', (_label, url) => {
    const forged: Entry = { ...picomatchEntry, via: [advisory('picomatch', url)] };
    expect(verify(inputs({ report: report([forged, ...dependents]) })).failures).toBeGreaterThan(0);
  });

  it('fails an exception whose exposure note is only spaces', () => {
    expect(verify(inputs({ exceptions: [{ ...EXCEPTION, exposure: '   ' }] })).failures).toBeGreaterThan(0);
  });
});

describe('verify, over any set of advisories', () => {
  it('fails exactly the findings no exception matches by advisory, package and version', () => {
    expect.assertions(1);
    let matched = 0;
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.stringMatching(/^[2-9a-z]{4}$/u), { minLength: 1, maxLength: 6 }),
        fc.array(fc.boolean(), { minLength: 6, maxLength: 6 }),
        (codes, excused) => {
          const { actual, expected } = failuresWhenExcused(codes, excused);
          matched += actual === expected ? 1 : 0;
          return actual === expected;
        },
      ),
      { numRuns: PROPERTY_RUNS },
    );
    expect(matched).toBe(PROPERTY_RUNS);
  });
});

describe('parseExceptions', () => {
  it('reads the committed exceptions, each with an evidence issue and at most its day limit', () => {
    const exceptions = parseExceptions(JSON.parse(readFileSync('audit-exceptions.json', 'utf8')));
    expect(verify(inputs({ auditStatus: 0, exceptions, report: report([]) })).failures).toBe(0);
  });

  it('refuses an entry that misses a field', () => {
    expect(() => parseExceptions({ exceptions: [{ id: 'GHSA-fc5q-39xc-vjpf' }] })).toThrow(TypeError);
  });
});

const FAKE_FOLDER = '.tmp/check-audit-test';
const FAKE_NPM = '.tmp/check-audit-test/npm.mjs';

function runWithNewest(newest: string): number | null {
  mkdirSync(FAKE_FOLDER, { recursive: true });
  try {
    writeFileSync(
      FAKE_NPM,
      `const args = process.argv.slice(2);
if (args[0] === 'audit') { process.stdout.write(${JSON.stringify(JSON.stringify(MASTER_REPORT))}); process.exit(1); }
if (args[0] === 'view') { process.stdout.write(${JSON.stringify(`${newest}\n`)}); process.exit(0); }
process.exit(2);
`,
    );
    return spawnSync(process.execPath, ['scripts/check-audit.ts', '--npm', FAKE_NPM], { encoding: 'utf8' }).status;
  } finally {
    rmSync(FAKE_FOLDER, { force: true, recursive: true });
  }
}

describe('check-audit', () => {
  it('fails the run once npm reports a picomatch newer than the excused version', () => {
    expect(runWithNewest('4.0.8')).toBe(1);
  });
});
