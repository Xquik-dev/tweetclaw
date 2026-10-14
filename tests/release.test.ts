// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../package.json' with { type: 'json' };

interface Run {
  readonly commands: readonly string[];
  readonly output: string;
  readonly status: number | null;
}

const { name, version } = packageJson;
const TAG = `v${version}`;
const NPM_ITEM = { NPM_KEYCHAIN_ACCOUNT: 'test-account', NPM_KEYCHAIN_SERVICE: 'test-service' };
const CLAWHUB = 'npx --yes clawhub@0.23.3';
const SOURCE = '--source-repo Xquik-dev/tweetclaw --source-commit abc123 --source-ref refs/heads/release';
const NPM_VIEW = `npm view ${name}@${version} version`;
const PUBLISH_NPM = 'node scripts/with-npm-token.mjs node scripts/publish-clean.mjs';
const CLAWHUB_DRY_RUN = [
  'npm pack --pack-destination <tmp>',
  `${CLAWHUB} package publish <tmp>/package.tgz --family code-plugin ${SOURCE} --dry-run --json`,
  `${CLAWHUB} skill publish skills/tweetclaw --owner xquik --slug tweetclaw --name TweetClaw --tags latest --version ${version} --changelog Sync with TweetClaw ${TAG}. ${SOURCE} --source-path skills/tweetclaw --dry-run --json`,
];

function scratch(...parts: readonly string[]): string {
  return path.resolve('.tmp/release-test', ...parts);
}

function loggedCommands(): readonly string[] {
  return existsSync('.tmp/release-test/commands.log')
    ? readFileSync('.tmp/release-test/commands.log', 'utf8')
      .trim()
      .split('\n')
      .map((line) => line.replaceAll(/\S*tweetclaw-(?:release|notes)-[^/\s]+/gu, '<tmp>'))
    : [];
}

function run(script: string, flags: readonly string[], extra: Readonly<Record<string, string>>): Run {
  const variables: Readonly<Record<string, string>> = {
    CLAWHUB_CONFIG_PATH: '',
    FAKE_CLAWHUB_LOGIN: 'accepted',
    FAKE_COMMAND_LOG: scratch('commands.log'),
    FAKE_PUBLISHED_MARKER: scratch('published'),
    NPM_KEYCHAIN_ACCOUNT: '',
    NPM_KEYCHAIN_SERVICE: '',
    PATH: scratch('bin'),
    TMPDIR: scratch('tmp'),
    ...extra,
  };
  for (const [variable, value] of Object.entries(variables)) {
    vi.stubEnv(variable, value);
  }
  const result = spawnSync(process.execPath, [script, ...flags], { encoding: 'utf8' });
  return { commands: loggedCommands(), output: `${result.stdout}${result.stderr}`, status: result.status };
}

function release(flags: readonly string[], extra: Readonly<Record<string, string>>): Run {
  return run('scripts/release.mjs', flags, extra);
}

beforeEach(() => {
  mkdirSync('.tmp/release-test/bin', { recursive: true });
  mkdirSync('.tmp/release-test/tmp', { recursive: true });
  writeFileSync('.tmp/release-test/clawhub.json', '{}');
  for (const command of ['git', 'gh', 'node', 'npm', 'npx']) {
    copyFileSync('tests/fixtures/fake-command.sh', scratch('bin', command));
  }
});

afterEach(() => {
  vi.unstubAllEnvs();
  rmSync('.tmp/release-test', { force: true, recursive: true });
});

describe('release', () => {
  it('releases npm alone without a ClawHub login', () => {
    expect.assertions(1);
    expect(release(['--only', 'npm'], NPM_ITEM)).toStrictEqual({
      commands: [
        'git status --porcelain',
        'git fetch --quiet --tags origin master',
        'git rev-parse HEAD',
        `git rev-parse --verify --quiet refs/tags/${TAG}`,
        `git rev-list -n 1 ${TAG}`,
        'git rev-parse origin/master',
        NPM_VIEW,
        PUBLISH_NPM,
        NPM_VIEW,
        `gh release view ${TAG} --repo Xquik-dev/tweetclaw`,
        `gh release create ${TAG} --repo Xquik-dev/tweetclaw --verify-tag --generate-notes --notes-file <tmp>/notes.md`,
      ],
      output: `release: published ${name}@${version} to npm, and released it on GitHub.\n`,
      status: 0,
    });
  });

  it('checks every step of a full dry run, npm first and then ClawHub', () => {
    expect.assertions(1);
    expect(release(['--dry-run'], { ...NPM_ITEM, CLAWHUB_CONFIG_PATH: scratch('clawhub.json') })).toStrictEqual({
      commands: [
        'git rev-parse HEAD',
        'git rev-parse --symbolic-full-name HEAD',
        `${CLAWHUB} whoami`,
        NPM_VIEW,
        'node scripts/with-npm-token.mjs --check',
        'node scripts/publish-clean.mjs --dry-run',
        ...CLAWHUB_DRY_RUN,
      ],
      output: `release: dry run passed for ${name}@${version} on npm and ClawHub. Nothing was published.\n`,
      status: 0,
    });
  });

  it('checks ClawHub alone without an npm token', () => {
    expect.assertions(1);
    expect(release(['--dry-run', '--only', 'clawhub'], { CLAWHUB_CONFIG_PATH: scratch('clawhub.json') })).toStrictEqual({
      commands: [
        'git rev-parse HEAD',
        'git rev-parse --symbolic-full-name HEAD',
        `${CLAWHUB} whoami`,
        ...CLAWHUB_DRY_RUN,
      ],
      output: `release: dry run passed for ${name}@${version} on ClawHub. Nothing was published.\n`,
      status: 0,
    });
  });

  it.each([
    [
      'CLAWHUB_CONFIG_PATH is unset',
      [],
      NPM_ITEM,
      'release: CLAWHUB_CONFIG_PATH is unset. Set it to the ClawHub CLI config file that holds your login, or pass --only npm.\n',
    ],
    [
      'CLAWHUB_CONFIG_PATH names no file',
      [],
      { ...NPM_ITEM, CLAWHUB_CONFIG_PATH: scratch('missing.json') },
      'release: CLAWHUB_CONFIG_PATH names no file. Run `npx clawhub@0.23.3 login`, or pass --only npm.\n',
    ],
    [
      'an npm Keychain variable is unset',
      ['--only', 'npm'],
      { NPM_KEYCHAIN_SERVICE: 'test-service' },
      'release: NPM_KEYCHAIN_ACCOUNT is unset. Set it to the account name of the Keychain item that holds the npm token.\n',
    ],
    [
      '--only names no registry',
      ['--only', 'github'],
      NPM_ITEM,
      'release: --only takes npm or clawhub. Run node scripts/release.mjs [--dry-run] [--only npm|clawhub].\n',
    ],
    [
      'an option is unknown',
      ['--force'],
      NPM_ITEM,
      'release: an option is unknown. Run node scripts/release.mjs [--dry-run] [--only npm|clawhub].\n',
    ],
  ])('stops with 1 line and starts nothing when %s', (_case, flags, variables, line) => {
    expect.assertions(1);
    expect(release(flags, variables)).toStrictEqual({ commands: [], output: line, status: 1 });
  });

  it('publishes nothing when ClawHub rejects the login', () => {
    expect.assertions(3);
    const result = release([], {
      ...NPM_ITEM,
      CLAWHUB_CONFIG_PATH: scratch('clawhub.json'),
      FAKE_CLAWHUB_LOGIN: 'rejected',
    });
    expect(result.status).toBe(1);
    expect(result.output).toBe('release: ClawHub rejected the login. Run `npx clawhub@0.23.3 login`, or pass --only npm.\n');
    expect(result.commands).not.toContain(PUBLISH_NPM);
  });
});

describe('check-reuse', () => {
  it('runs the pinned REUSE lint and returns its exit code', () => {
    expect.assertions(2);
    copyFileSync('tests/fixtures/fake-command.sh', scratch('bin', 'uvx'));
    expect(run('scripts/check-reuse.mjs', [], {})).toStrictEqual({
      commands: ['uvx --from reuse==6.2.0 reuse lint'],
      output: '',
      status: 0,
    });
    expect(run('scripts/check-reuse.mjs', [], { FAKE_UVX_EXIT: '3' }).status).toBe(3);
  });

  it('stops with 1 line when uvx is missing', () => {
    expect.assertions(1);
    expect(run('scripts/check-reuse.mjs', [], {})).toStrictEqual({
      commands: [],
      output: 'check-reuse: uvx is missing. Install uv from https://docs.astral.sh/uv, then run again.\n',
      status: 1,
    });
  });
});
