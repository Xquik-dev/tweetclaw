// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { EXCUSED, verify } from '../scripts/audit-policy.ts';
import type { AuditInputs, AuditRun } from '../scripts/audit-policy.ts';

const DURING = Date.parse('2026-11-20T00:00:00Z');
const PICOMATCH_URL = 'https://github.com/advisories/GHSA-fc5q-39xc-vjpf';
const HONO_URL = 'https://github.com/advisories/GHSA-46wx-v44x-9hh2';
const DAY_MS = 86_400_000;
const MAX_EXCUSE_DAYS = 14;
const PROPERTY_RUNS = 100;

type Entry = Readonly<{ name: string; via: readonly unknown[] }>;

const advisory = (name: string, url: string): Readonly<Record<string, string>> => ({ name, url });

function reportOf(entries: readonly Entry[]): Readonly<Record<string, unknown>> {
  return {
    auditReportVersion: 2,
    metadata: {
      dependencies: { total: 757 },
      vulnerabilities: { critical: 0, high: entries.length, info: 0, low: 0, moderate: 0, total: entries.length },
    },
    vulnerabilities: Object.fromEntries(entries.map((entry) => [entry.name, entry])),
  };
}

const runOf = (entries: readonly Entry[]): AuditRun => ({ report: reportOf(entries), status: entries.length > 0 ? 1 : 0 });

const PICOMATCH: Entry = { name: 'picomatch', via: [advisory('picomatch', PICOMATCH_URL)] };
const REAL_CYCLE: readonly Entry[] = [
  PICOMATCH,
  { name: 'vitest', via: ['@vitest/coverage-v8', 'picomatch'] },
  { name: '@vitest/coverage-v8', via: ['vitest'] },
];
const HONO: Entry = { name: 'hono', via: [advisory('hono', HONO_URL)] };

const lockOf = (packages: Readonly<Record<string, unknown>>): unknown => ({ packages });
const LODASH_URL = 'https://registry.npmjs.org/lodash/-/lodash-4.17.20.tgz';

const inputs = (overrides: Partial<AuditInputs> = {}): AuditInputs => ({
  full: runOf(REAL_CYCLE),
  lock: lockOf({}),
  now: DURING,
  runtime: runOf([]),
  versions: ['4.0.6', '4.0.7'],
  ...overrides,
});

describe('verify', () => {
  it('passes the excused dev advisory and the real via cycle that reaches it', () => {
    expect(verify(inputs())).toStrictEqual([]);
  });

  it('passes a clean audit without asking npm for picomatch versions', () => {
    expect(verify(inputs({ full: runOf([]), versions: undefined }))).toStrictEqual([]);
  });

  it.each([
    ['at its expiry', Date.parse(EXCUSED.expires)],
    ['before it was added', Date.parse(EXCUSED.added) - 1],
  ])('fails the advisory %s', (_label, now) => {
    expect(verify(inputs({ now }))).toHaveLength(1);
  });

  it.each(['4.0.8', '4.1.0', '5.0.0-beta.1'])('fails the advisory once npm publishes picomatch %s under any tag', (version) => {
    expect(verify(inputs({ versions: ['4.0.7', version] }))).toHaveLength(1);
  });

  it.each([[undefined], [[]], [['4.0.6']], ['4.0.7']])('fails the advisory when npm lists versions as %j', (versions) => {
    expect(verify(inputs({ versions }))).toHaveLength(1);
  });

  it('fails any other advisory beside the excused one', () => {
    expect(verify(inputs({ full: runOf([...REAL_CYCLE, HONO]) }))).toHaveLength(1);
  });

  it('fails the excused advisory id on another package', () => {
    expect(verify(inputs({ full: runOf([{ name: 'hono', via: [advisory('hono', PICOMATCH_URL)] }]) }))).toHaveLength(1);
  });

  it('fails even the excused advisory once it reaches runtime dependencies', () => {
    expect(verify(inputs({ runtime: runOf([PICOMATCH]) }))).toHaveLength(1);
  });

  it.each([
    'https://example.com/advisories/GHSA-fc5q-39xc-vjpf',
    'https://github.com/advisories/GHSA-fc5q-39xc-vjpf-abcd',
    'https://github.com/advisories/x/GHSA-fc5q-39xc-vjpf',
  ])('fails the forged advisory link %s', (url) => {
    const forged: Entry = { name: 'picomatch', via: [advisory('picomatch', url)] };
    expect(verify(inputs({ full: runOf([forged]) })).length).toBeGreaterThan(0);
  });

  it('fails entries that reach each other and never an advisory', () => {
    const cycle: readonly Entry[] = [
      { name: 'vitest', via: ['knip'] },
      { name: 'knip', via: ['vitest'] },
    ];
    expect(verify(inputs({ full: runOf(cycle) }))).toHaveLength(2);
  });

  it('fails an entry that reaches a package the report leaves out', () => {
    expect(verify(inputs({ full: runOf([PICOMATCH, { name: 'vitest', via: ['tinyglobby'] }]) })).length).toBeGreaterThan(0);
  });

  it.each([
    ['exit 1 with no findings', { report: reportOf([]), status: 1 }],
    ['exit 0 with findings', { report: reportOf(REAL_CYCLE), status: 0 }],
    ['a killed npm', { report: reportOf(REAL_CYCLE), status: null }],
    ['no report', { report: undefined, status: 1 }],
    ['an old report version', { report: { ...reportOf([]), auditReportVersion: 1 }, status: 0 }],
    ['an error key', { report: { ...reportOf([]), error: { code: 'ENOAUDIT' } }, status: 0 }],
    ['0 audited dependencies', { report: { ...reportOf([]), metadata: { dependencies: { total: 0 }, vulnerabilities: { total: 0 } } }, status: 0 }],
    ['counts that disagree', { report: { ...reportOf(REAL_CYCLE), metadata: { dependencies: { total: 757 }, vulnerabilities: { high: 1, total: 1 } } }, status: 1 }],
  ])('fails a full audit with %s', (_label, full) => {
    expect(verify(inputs({ full })).length).toBeGreaterThan(0);
  });

  it('fails an unreadable runtime audit', () => {
    expect(verify(inputs({ runtime: { report: undefined, status: 0 } }))).toHaveLength(1);
  });
});

describe('verify, on the lockfile', () => {
  it('passes every entry of the committed lockfile', () => {
    expect(verify(inputs({ lock: JSON.parse(readFileSync('package-lock.json', 'utf8')) }))).toStrictEqual([]);
  });

  it('fails a lockfile that names a clean version for a vulnerable tarball', () => {
    const lock = lockOf({ 'node_modules/lodash': { resolved: LODASH_URL, version: '4.18.1' } });
    expect(verify(inputs({ lock }))).toHaveLength(1);
  });

  it('fails an entry that resolves outside the public registry', () => {
    const lock = lockOf({ 'node_modules/lodash': { resolved: 'https://example.com/lodash-4.17.20.tgz', version: '4.17.20' } });
    expect(verify(inputs({ lock }))).toHaveLength(1);
  });

  it('passes scoped, aliased, bundled and linked entries that agree', () => {
    const lock = lockOf({
      '': { name: 'tweetclaw' },
      'node_modules/@scope/tool': { resolved: 'https://registry.npmjs.org/@scope/tool/-/tool-1.0.0.tgz', version: '1.0.0' },
      'node_modules/alias': { name: 'lodash', resolved: LODASH_URL, version: '4.17.20' },
      'node_modules/bundled': { inBundle: true, version: '1.0.0' },
      'node_modules/linked': { link: true, resolved: 'packages/linked' },
    });
    expect(verify(inputs({ lock }))).toStrictEqual([]);
  });

  it('fails a lockfile it cannot read', () => {
    expect(verify(inputs({ lock: undefined }))).toHaveLength(1);
  });
});

describe('the excuse', () => {
  it('names 1 advisory for at most 14 days and links its evidence', () => {
    const days = (Date.parse(EXCUSED.expires) - Date.parse(EXCUSED.added)) / DAY_MS;
    expect([days <= MAX_EXCUSE_DAYS, EXCUSED.evidence]).toStrictEqual([true, 'https://github.com/Xquik-dev/tweetclaw/issues/131']);
  });
});

function failuresFor(codes: readonly string[]): number {
  const entries = codes.map((code) => ({
    name: `pkg${code}`,
    via: [advisory(`pkg${code}`, `https://github.com/advisories/GHSA-${code}-${code}-${code}`)],
  }));
  return verify(inputs({ full: runOf(entries) })).length;
}

describe('verify, over any set of advisories', () => {
  it('fails each advisory that is not the excused one', () => {
    expect.assertions(1);
    let matched = 0;
    fc.assert(
      fc.property(fc.uniqueArray(fc.stringMatching(/^[2-9a-z]{4}$/u), { maxLength: 6, minLength: 1 }), (codes) => {
        matched += failuresFor(codes) === codes.length ? 1 : 0;
        return failuresFor(codes) === codes.length;
      }),
      { numRuns: PROPERTY_RUNS },
    );
    expect(matched).toBe(PROPERTY_RUNS);
  });
});

const WHOLE_TREE = '--include=optional --include=peer --workspaces=null';
const SOURCE = '--registry=https://registry.npmjs.org/ --offline=false';
const FAKE_FOLDER = '.tmp/check-audit-test';
const FAKE_NPM = '.tmp/check-audit-test/npm.mjs';
const FAKE_ARGS = '.tmp/check-audit-test/args.log';

function fakeNpm(): string {
  return `import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
appendFileSync(${JSON.stringify(FAKE_ARGS)}, args.join(' ') + String.fromCodePoint(10));
if (args[0] === 'view') { process.stdout.write('["4.0.7","4.0.8"]'); process.exit(0); }
if (args.includes('--omit=dev')) { process.stdout.write(${JSON.stringify(JSON.stringify(reportOf([])))}); process.exit(0); }
process.stdout.write(${JSON.stringify(JSON.stringify(reportOf(REAL_CYCLE)))});
process.exit(1);
`;
}

function runScript(): Readonly<{ args: readonly string[]; status: number | null }> {
  mkdirSync(FAKE_FOLDER, { recursive: true });
  try {
    writeFileSync(FAKE_NPM, fakeNpm());
    const { status } = spawnSync(process.execPath, ['scripts/check-audit.ts', '--npm', FAKE_NPM], { encoding: 'utf8' });
    return { args: readFileSync(FAKE_ARGS, 'utf8').trim().split('\n'), status };
  } finally {
    rmSync(FAKE_FOLDER, { force: true, recursive: true });
  }
}

describe('check-audit', () => {
  it('audits the whole tree on the public registry and fails once npm has a newer picomatch', () => {
    expect(runScript()).toStrictEqual({
      args: [
        `audit --json --include=dev ${WHOLE_TREE} ${SOURCE}`,
        `audit --json --omit=dev ${WHOLE_TREE} ${SOURCE}`,
        `view picomatch versions --json ${SOURCE}`,
      ],
      status: 1,
    });
  });
});
