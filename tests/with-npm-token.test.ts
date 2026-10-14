// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface Run {
  readonly output: string;
  readonly status: number | null;
}

interface ProbeReport {
  readonly content: string;
  readonly mode: string;
}

const TOKEN = 'npm_test_token_value';
const KEYCHAIN_ITEM = { NPM_KEYCHAIN_ACCOUNT: 'test-account', NPM_KEYCHAIN_SERVICE: 'test-service' };

const PROBE = [process.execPath, 'tests/fixtures/npm-config-probe.cjs'];

function run(script: string, scriptArguments: readonly string[], extra: Readonly<Record<string, string>>): Run {
  const scratch = path.resolve('.tmp/with-npm-token-test');
  const variables: Readonly<Record<string, string>> = {
    FAKE_SECURITY_LOG: path.join(scratch, 'security.log'),
    FAKE_SECURITY_TOKEN: TOKEN,
    NPM_KEYCHAIN_ACCOUNT: '',
    NPM_KEYCHAIN_SERVICE: '',
    PATH: `${path.join(scratch, 'bin')}${path.delimiter}${process.env['PATH'] ?? ''}`,
    PROBE_REPORT: path.join(scratch, 'report.json'),
    TMPDIR: path.join(scratch, 'tmp'),
    ...extra,
  };
  for (const [name, value] of Object.entries(variables)) {
    vi.stubEnv(name, value);
  }
  const result = spawnSync(process.execPath, [script, ...scriptArguments], { encoding: 'utf8' });
  return { output: `${result.stdout}${result.stderr}`, status: result.status };
}

function wrap(extra: Readonly<Record<string, string>>, ...command: readonly string[]): Run {
  return run('scripts/with-npm-token.mjs', command.length === 0 ? PROBE : command, extra);
}

function report(): ProbeReport {
  return JSON.parse(readFileSync('.tmp/with-npm-token-test/report.json', 'utf8')) as ProbeReport;
}

function securityCalls(): readonly string[] {
  return existsSync('.tmp/with-npm-token-test/security.log')
    ? readFileSync('.tmp/with-npm-token-test/security.log', 'utf8').trim().split('\n')
    : [];
}

beforeEach(() => {
  mkdirSync('.tmp/with-npm-token-test/bin', { recursive: true });
  mkdirSync('.tmp/with-npm-token-test/tmp', { recursive: true });
  copyFileSync('tests/fixtures/fake-security.sh', '.tmp/with-npm-token-test/bin/security');
  chmodSync('.tmp/with-npm-token-test/bin/security', 0o755);
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync('.tmp/with-npm-token-test', { force: true, recursive: true });
});

describe('with-npm-token', () => {
  it('gives the command a mode 600 npm config that holds the Keychain token', () => {
    expect.assertions(3);
    const result = wrap(KEYCHAIN_ITEM);
    expect(result.status).toBe(0);
    expect(report()).toStrictEqual({
      content: `registry=https://registry.npmjs.org/\n//registry.npmjs.org/:_authToken=${TOKEN}\n`,
      mode: '600',
    });
    expect(securityCalls()).toStrictEqual(['find-generic-password -s test-service -a test-account -w']);
  });

  it.each([0, 7])('removes the config and returns exit code %i', (exitCode) => {
    expect.assertions(2);
    const result = wrap({ ...KEYCHAIN_ITEM, PROBE_EXIT: String(exitCode) });
    expect(result.status).toBe(exitCode);
    expect(readdirSync('.tmp/with-npm-token-test/tmp')).toStrictEqual([]);
  });

  it('never prints the token', () => {
    expect.assertions(2);
    const result = wrap(KEYCHAIN_ITEM, process.execPath, '-e', 'console.log("published")');
    expect(result.output).toBe('published\n');
    expect(result.output).not.toContain(TOKEN);
  });

  it.each([
    [
      'NPM_KEYCHAIN_SERVICE',
      { NPM_KEYCHAIN_ACCOUNT: 'test-account' },
      'with-npm-token: NPM_KEYCHAIN_SERVICE is unset. Set it to the service name of the Keychain item that holds the npm token.\n',
    ],
    [
      'NPM_KEYCHAIN_ACCOUNT',
      { NPM_KEYCHAIN_SERVICE: 'test-service' },
      'with-npm-token: NPM_KEYCHAIN_ACCOUNT is unset. Set it to the account name of the Keychain item that holds the npm token.\n',
    ],
  ])('stops with 1 line that names %s when it is unset', (_name, item, line) => {
    expect.assertions(4);
    const result = wrap(item);
    expect(result.status).toBe(1);
    expect(result.output).toBe(line);
    expect(securityCalls()).toStrictEqual([]);
    expect(existsSync('.tmp/with-npm-token-test/report.json')).toBe(false);
  });

  it.each([
    [
      'the Keychain has no such item',
      { FAKE_SECURITY_MISSING: '1' },
      'with-npm-token: The Keychain has no item for NPM_KEYCHAIN_SERVICE and NPM_KEYCHAIN_ACCOUNT. Add the npm token to the Keychain, then run again.\n',
    ],
    [
      'the Keychain item is empty',
      { FAKE_SECURITY_TOKEN: '' },
      'with-npm-token: The Keychain item is empty. Store the npm token in it, then run again.\n',
    ],
  ])('stops before the command when %s', (_case, fake, line) => {
    expect.assertions(4);
    const result = wrap({ ...KEYCHAIN_ITEM, ...fake });
    expect(result.status).toBe(1);
    expect(result.output).toBe(line);
    expect(existsSync('.tmp/with-npm-token-test/report.json')).toBe(false);
    expect(readdirSync('.tmp/with-npm-token-test/tmp')).toStrictEqual([]);
  });

  it('checks that the Keychain item exists without reading the token', () => {
    expect.assertions(3);
    const result = wrap(KEYCHAIN_ITEM, '--check');
    expect(result).toStrictEqual({ output: '', status: 0 });
    expect(securityCalls()).toStrictEqual(['find-generic-password -s test-service -a test-account']);
    expect(readdirSync('.tmp/with-npm-token-test/tmp')).toStrictEqual([]);
  });

  it('fails the check when the Keychain has no such item', () => {
    expect.assertions(2);
    const result = wrap({ ...KEYCHAIN_ITEM, FAKE_SECURITY_MISSING: '1' }, '--check');
    expect(result.status).toBe(1);
    expect(result.output).toContain('The Keychain has no item for NPM_KEYCHAIN_SERVICE and NPM_KEYCHAIN_ACCOUNT.');
  });
});

describe('release', () => {
  it.each([
    ['NPM_KEYCHAIN_SERVICE', { NPM_KEYCHAIN_ACCOUNT: 'test-account' }, 'service'],
    ['NPM_KEYCHAIN_ACCOUNT', { NPM_KEYCHAIN_SERVICE: 'test-service' }, 'account'],
  ])('stops with 1 line that names %s before it reads Git or npm', (name, item, field) => {
    expect.assertions(3);
    const result = run('scripts/release.mjs', ['--dry-run'], item);
    expect(result.status).toBe(1);
    expect(result.output).toBe(
      `release: ${name} is unset. Set it to the ${field} name of the Keychain item that holds the npm token.\n`,
    );
    expect(securityCalls()).toStrictEqual([]);
  });
});
