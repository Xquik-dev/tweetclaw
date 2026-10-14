// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SESSION_ONLY_OPERATIONS } from '../src/api-spec.js';
import { register } from '../src/index.js';
import * as mpp from '../src/mpp.js';
import { buildFetchUrl, createProxiedRequest, isStaticallyRefused } from '../src/request.js';
import { specEndpoints } from '../src/tools/catalog.js';

type RegistrationApi = Parameters<typeof register>[0];
type RegisteredTool = Parameters<RegistrationApi['registerTool']>[0];
type HookHandler = Parameters<NonNullable<RegistrationApi['on']>>[1];

interface Sent {
  readonly method: string | undefined;
  readonly redirect: string | undefined;
  readonly url: string;
}

interface Outcome {
  readonly approval: boolean;
  readonly isError: boolean;
  readonly sent: readonly Sent[];
  readonly text: string;
}

const REFUSED_ROUTES = [
  ['GET', '/api/v1/api-keys'],
  ['POST', '/api/v1/api-keys'],
  ['DELETE', '/api/v1/api-keys/key_1'],
  ['POST', '/api/v1/credits/quick-topup'],
  ['POST', '/api/v1/credits/topup'],
  ['GET', '/api/v1/credits/topup/status'],
  ['GET', '/api/v1/credits/topup/redirect'],
  ['POST', '/api/v1/subscribe'],
  ['POST', '/api/v1/guest-wallets'],
  ['POST', '/api/v1/guest-wallets/topups'],
  ['GET', '/api/v1/guest-wallets/status'],
  ['POST', '/api/v1/x/accounts'],
  ['GET', '/api/v1/x/accounts/account_1'],
  ['DELETE', '/api/v1/x/accounts/account_1'],
  ['POST', '/api/v1/x/accounts/account_1/reauth'],
  ['POST', '/api/v1/x/accounts/bulk-retry'],
  ['GET', '/api/v1/x/account-connection-attempts/attempt_1'],
  ['POST', '/api/v1/x/account-connection-challenges/challenge_1/submit'],
  ['PATCH', '/api/v1/account'],
  ['PUT', '/api/v1/account/x-identity'],
  ['GET', '/api/v1/support/tickets'],
  ['POST', '/api/v1/support/tickets'],
  ['GET', '/api/v1/support/tickets/ticket_1'],
  ['PATCH', '/api/v1/support/tickets/ticket_1'],
  ['POST', '/api/v1/support/tickets/ticket_1/messages'],
  ['GET', '/api/v1/support/attachments/file_1'],
] as const;

const UNKNOWN_ROUTES = [
  ['GET', '/api/v1/not-real'],
  ['POST', '/api/v1/not-real'],
  ['GET', '/api/v1/x/sessions'],
  ['POST', '/api/v1/x/sessions/refresh'],
  ['DELETE', '/api/v1/unknown/thing_1'],
] as const;

const API_PREFIX = '/api/v1/';
// A URL parser turns a backslash into a slash, so a value that climbs with backslashes names another route. https://url.spec.whatwg.org/#path-state
const BACKSLASH = String.fromCodePoint(92);

const VALUE_ROUTES: Readonly<Record<string, readonly [string, readonly string[]]>> = {
  DELETE: ['/api/v1/drafts/', ['..']],
  GET: ['/api/v1/drafts/', ['..']],
  PATCH: ['/api/v1/monitors/', ['..']],
  POST: ['/api/v1/x/dm/', ['..', '..']],
  PUT: ['/api/v1/styles/', ['..']],
};

function climbingValue(method: string, rest: string, separator: string): string {
  const [route, climb] = VALUE_ROUTES[method] ?? [API_PREFIX, []];
  return `${route}${[...climb, ...rest.split('/')].join(separator)}`;
}

function afterPrefix(path: string): string {
  return path.slice(API_PREFIX.length);
}

function encodeFirstLetter(path: string): string {
  const rest = afterPrefix(path);
  return `${API_PREFIX}%${rest.codePointAt(0)?.toString(16) ?? ''}${rest.slice(1)}`;
}

function encodeLastSlash(path: string): string {
  const cut = path.lastIndexOf('/');
  return `${path.slice(0, cut)}%2F${path.slice(cut + 1)}`;
}

function pathVariants(method: string, path: string): ReadonlyArray<readonly [string, string]> {
  const rest = afterPrefix(path);
  return [
    ['as written', path],
    ['with a trailing slash', `${path}/`],
    ['with 2 trailing slashes', `${path}//`],
    ['with a doubled slash', `${API_PREFIX}/${rest}`],
    ['through a dot segment', `${API_PREFIX}x/../${rest}`],
    ['through an encoded dot segment', `${API_PREFIX}x/%2e%2e/${rest}`],
    ['through a backslash value', climbingValue(method, rest, BACKSLASH)],
    ['through an encoded slash value', climbingValue(method, rest, '%2F')],
    ['through an encoded backslash value', climbingValue(method, rest, '%5C')],
    ['with an encoded letter', encodeFirstLetter(path)],
    ['with an encoded slash', encodeLastSlash(path)],
    ['with a query string', `${path}?x=1`],
    ['with a fragment', `${path}#x`],
    ['in upper case', `${API_PREFIX}${rest.toUpperCase()}`],
    ['with a tab inside', `${API_PREFIX}${rest.slice(0, 1)}\t${rest.slice(1)}`],
    ['as a full URL', `https://xquik.com${path}`],
    ['on another host', `https://evil.example${path}`],
    ['as a scheme-relative URL', `//evil.example${path}`],
    ['after a user-info at sign', `${API_PREFIX}@evil.example/${rest}`],
  ];
}

function routeCases(
  routes: ReadonlyArray<readonly [string, string]>,
): ReadonlyArray<readonly [string, string, string]> {
  return routes.flatMap(([method, path]) =>
    [method, method.toLowerCase()].flatMap((spelling) =>
      pathVariants(method, path).map(([variant, variantPath]) => [spelling, variant, variantPath] as const)));
}

const API_KEY_CONFIG: Readonly<Record<string, unknown>> = { apiKey: 'xq_test' };

async function callTool(params: Readonly<Record<string, unknown>>, config = API_KEY_CONFIG): Promise<Outcome> {
  const sent: Sent[] = [];
  const tools: RegisteredTool[] = [];
  const hooks: HookHandler[] = [];
  const recordingFetch: typeof fetch = async (input, init) => {
    sent.push({ method: init?.method, redirect: init?.redirect, url: String(input) });
    return new Response(JSON.stringify({ ok: true }));
  };
  register({
    logger: { error: () => {}, info: () => {}, warn: () => {} },
    on: (_name, handler) => { hooks.push(handler); },
    pluginConfig: { ...config, pollingEnabled: false },
    registerCommand: () => {},
    registerService: () => {},
    registerTool: (tool) => { tools.push(tool); },
  }, recordingFetch);
  const approval = await hooks[0]?.({ params, toolName: 'tweetclaw' });
  const result = await tools.find((tool) => tool.name === 'tweetclaw')?.execute('call_1', params);
  return {
    approval: approval?.requireApproval !== undefined,
    isError: result?.isError === true,
    sent,
    text: result?.content[0]?.text ?? '',
  };
}

beforeEach(() => {
  vi.spyOn(mpp, 'initMpp').mockImplementation(async (_key, baseFetch) => () => baseFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

interface Spelling {
  readonly key: string;
  readonly method: string;
  readonly path: string;
}

function spellings(endpoint: (typeof specEndpoints)[number]): readonly Spelling[] {
  const concrete = endpoint.path.replaceAll(/:[^/]+/gu, '123');
  const key = `${endpoint.method} ${endpoint.path}`;
  return [concrete, `${concrete}/`, `${concrete}//`].flatMap((path) => [
    { key, method: endpoint.method, path },
    { key, method: endpoint.method.toLowerCase(), path },
  ]);
}

async function sentWithoutApproval({ key, method, path }: Spelling): Promise<string | undefined> {
  const outcome = await callTool({ idempotencyKey: 'key-001', method, path });
  return outcome.sent.length > 0 && !outcome.approval ? key : undefined;
}

describe('tweetclaw tool refusals', () => {
  it.each(routeCases(REFUSED_ROUTES))('refuses %s to a dashboard route %s (%s)', async (method, _variant, path) => {
    expect.assertions(2);
    const outcome = await callTool({ method, path });
    expect(outcome.isError).toBe(true);
    expect(outcome.sent).toStrictEqual([]);
  });

  it.each(routeCases(UNKNOWN_ROUTES))('refuses %s to an unknown route %s (%s)', async (method, _variant, path) => {
    expect.assertions(2);
    const outcome = await callTool({ method, path });
    expect(outcome.isError).toBe(true);
    expect(outcome.sent).toStrictEqual([]);
  });

  it.each([
    ['a dot segment', '/api/v1/x/tweets/..'],
    ['a single dot segment', '/api/v1/x/tweets/.'],
    ['an encoded dot segment', '/api/v1/x/tweets/%2e%2E'],
    ['a dot segment split by a tab', '/api/v1/x/tweets/.\t.'],
    ['a dot segment split by a newline', '/api/v1/x/tweets/.\n.'],
    ['a backslash', `/api/v1/x/tweets/20${BACKSLASH}replies`],
    ['an encoded backslash traversal', '/api/v1/x/tweets/..%5C..%5Caccount'],
    ['a space', '/api/v1/x/tweets/20 21'],
    ['a malformed escape', '/api/v1/x/tweets/%zz'],
    ['a non-ASCII letter', '/api/v1/x/tweets/café'],
    ['an empty value', '/api/v1/x/tweets//replies'],
  ])('refuses a path value with %s', async (_case, path) => {
    expect.assertions(2);
    const outcome = await callTool({ path });
    expect(outcome.isError).toBe(true);
    expect(outcome.sent).toStrictEqual([]);
  });

  it.each(['TRACE', 'CONNECT', 'HEAD', 'OPTIONS', 'GET /api/v1/account HTTP/1.1', ''])('refuses the method "%s"', async (method) => {
    expect.assertions(2);
    const outcome = await callTool({ method, path: '/api/v1/account' });
    expect(outcome.isError).toBe(true);
    expect(outcome.sent).toStrictEqual([]);
  });
});

describe('tweetclaw tool requests', () => {
  it.each([
    ['GET', '/api/v1/account', 'https://xquik.com/api/v1/account'],
    ['get', '/api/v1/account/', 'https://xquik.com/api/v1/account'],
    ['patch', '/api/v1/monitors/7', 'https://xquik.com/api/v1/monitors/7'],
    ['GET', '/api/v1/x/accounts', 'https://xquik.com/api/v1/x/accounts'],
    ['GET', '/api/v1/credits', 'https://xquik.com/api/v1/credits'],
    [
      'GET',
      '/api/v1/x/tweets/https%3A%2F%2Fx.com%2Fnasa%2Fstatus%2F20',
      'https://xquik.com/api/v1/x/tweets/https%3A%2F%2Fx.com%2Fnasa%2Fstatus%2F20',
    ],
  ])('sends %s %s to the route it names, without following redirects', async (method, path, url) => {
    expect.assertions(1);
    const outcome = await callTool({ method, path });
    expect(outcome.sent).toStrictEqual([{ method: method.toUpperCase(), redirect: 'manual', url }]);
  });

  it('never sends a request the approval hook did not ask about, except the radar read', async () => {
    expect.assertions(1);
    const calls = specEndpoints.flatMap((endpoint) => spellings(endpoint));
    const outcomes = await Promise.all(calls.map(async (spelling) => sentWithoutApproval(spelling)));
    expect([...new Set(outcomes.filter((key) => key !== undefined))]).toStrictEqual(['GET /api/v1/radar']);
  });

  it.each([
    '/api/v1/x/tweets/search',
    '/api/v1/x/tweets/search/',
    '/api/v1/x/users/batch',
    '/api/v1/account',
    `/api/v1/x/tweets/..${BACKSLASH}..${BACKSLASH}account`,
  ])('pays for nothing on %s in MPP mode', async (path) => {
    expect.assertions(2);
    const outcome = await callTool({ path }, { tempoSigningKey: `0x${'3'.repeat(64)}` });
    expect(outcome.isError).toBe(true);
    expect(outcome.sent).toStrictEqual([]);
  });
});

describe('request layer', () => {
  const failingFetch: typeof fetch = async () => {
    throw new Error('a request left');
  };

  it.each([...REFUSED_ROUTES, ...UNKNOWN_ROUTES])('refuses %s %s without a catalog check above it', async (method, path) => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test', failingFetch);
    await expect(request(path, { method })).rejects.toThrow(/blocked for agents|not in the TweetClaw catalog/u);
  });

  it('refuses a route the catalog leaves out', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test', failingFetch);
    await expect(request('/api/v1/events/stream')).rejects.toThrow('blocked for agents');
  });

  it.each(REFUSED_ROUTES)('keeps %s %s on the static refusal list, whatever the catalog says', (method, path) => {
    expect.assertions(1);
    expect(isStaticallyRefused(method, path)).toBe(true);
  });

  it('refuses a credits top-up, which the API takes with a key, and an API key call before the catalog check', () => {
    expect.assertions(2);
    expect(isStaticallyRefused('POST', '/api/v1/credits/topup')).toBe(true);
    expect(isStaticallyRefused('GET', '/api/v1/api-keys')).toBe(true);
  });

  it('statically refuses every operation the spec serves only to a dashboard session', () => {
    expect.assertions(1);
    const open = SESSION_ONLY_OPERATIONS.filter(
      (operation) => !isStaticallyRefused(operation.method, operation.path.replaceAll(/:[^/]+/gu, '123')),
    );
    expect(open).toStrictEqual([]);
  });

  it('keeps every callable route off the static refusal list', () => {
    expect.assertions(1);
    const refused = specEndpoints.filter(
      (endpoint) => isStaticallyRefused(endpoint.method, endpoint.path.replaceAll(/:[^/]+/gu, '123')),
    );
    expect(refused.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).toStrictEqual([]);
  });

  it.each([301, 302, 303, 307, 308])('stops at a %i redirect instead of sending the key to another address', async (status) => {
    expect.assertions(2);
    const calls: Array<Parameters<typeof fetch>[1]> = [];
    const redirectingFetch: typeof fetch = async (_input, init) => {
      calls.push(init);
      return new Response(null, { headers: { location: 'https://evil.example/collect' }, status });
    };
    const request = createProxiedRequest('https://xquik.com', 'xq_test', redirectingFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('redirect');
    expect(calls.map((init) => init?.redirect)).toStrictEqual(['manual']);
  });

  it.each([
    '//evil.example/api/v1/account',
    'https://evil.example/api/v1/account',
    `${BACKSLASH}${BACKSLASH}evil.example/api/v1/account`,
  ])('builds no URL for the path %s, which names another host', (path) => {
    expect.assertions(1);
    expect(() => buildFetchUrl('https://xquik.com', path)).toThrow('Path names another host');
  });

  it.each([
    'https://xquik.com/prefix',
    'https://xquik.com/prefix/',
    'https://xquik.com?x=1',
  ])('sends to /api/v1 on the host of the base URL %s', async (baseUrl) => {
    expect.assertions(1);
    const urls: string[] = [];
    const recordingFetch: typeof fetch = async (input) => {
      urls.push(String(input));
      return new Response('{}');
    };
    await createProxiedRequest(baseUrl, 'xq_test', recordingFetch)('/api/v1/account');
    expect(urls).toStrictEqual(['https://xquik.com/api/v1/account']);
  });
});
