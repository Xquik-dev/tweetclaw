// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import contract from '../generated-api-contract.json' with { type: 'json' };
import { isProhibitedRequest } from '../src/request.js';
import { exploreCatalog, findEndpoint, requestNeedsApproval, specEndpoints } from '../src/tools/catalog.js';
import { handleExplore } from '../src/tools/explore.js';
import { handleTweetclaw } from '../src/tools/tweetclaw.js';

type ExploredEndpoint = ReturnType<typeof exploreCatalog>[number];

interface SentRequest {
  readonly headers: unknown;
  readonly method: string | undefined;
  readonly url: string;
}

const MPP_ROUTES = [
  'GET /api/v1/trends',
  'GET /api/v1/x/articles/:tweetId',
  'GET /api/v1/x/broadcasts/:id',
  'GET /api/v1/x/communities/:id/info',
  'GET /api/v1/x/followers/check',
  'GET /api/v1/x/lists/:id',
  'GET /api/v1/x/spaces/:id',
  'GET /api/v1/x/spaces/:id/replay',
  'GET /api/v1/x/trends',
  'GET /api/v1/x/tweets/:id',
  'GET /api/v1/x/tweets/:id/embed',
  'GET /api/v1/x/tweets/:id/translation',
  'GET /api/v1/x/users/:id',
];

const BLOCKED_CALLS = [
  ['PATCH', '/api/v1/account'],
  ['PUT', '/api/v1/account/x-identity'],
  ['GET', '/api/v1/api-keys'],
  ['POST', '/api/v1/api-keys'],
  ['DELETE', '/api/v1/api-keys/key_1'],
  ['POST', '/api/v1/subscribe'],
  ['POST', '/api/v1/credits/topup'],
  ['GET', '/api/v1/credits/topup/status'],
  ['GET', '/api/v1/credits/topup/redirect'],
  ['POST', '/api/v1/credits/quick-topup'],
  ['POST', '/api/v1/guest-wallets'],
  ['POST', '/api/v1/guest-wallets/topups'],
  ['GET', '/api/v1/guest-wallets/status'],
  ['GET', '/api/v1/support/attachments/file_1'],
  ['GET', '/api/v1/support/tickets'],
  ['POST', '/api/v1/support/tickets'],
  ['GET', '/api/v1/support/tickets/ticket_1'],
  ['PATCH', '/api/v1/support/tickets/ticket_1'],
  ['POST', '/api/v1/support/tickets/ticket_1/messages'],
  ['POST', '/api/v1/x/accounts'],
  ['GET', '/api/v1/x/accounts/account_1'],
  ['DELETE', '/api/v1/x/accounts/account_1'],
  ['POST', '/api/v1/x/accounts/account_1/reauth'],
  ['POST', '/api/v1/x/accounts/bulk-retry'],
  ['GET', '/api/v1/x/account-connection-attempts/attempt_1'],
  ['POST', '/api/v1/x/account-connection-challenges/challenge_1/submit'],
] as const;

const BILLING_DETAIL = /\$\d|\b\d+\s+credits?\b/iu;

function statesBillingDetail(endpoint: ExploredEndpoint): boolean {
  const texts = [endpoint.summary, ...endpoint.parameters.map((parameter) => parameter.description)];
  return texts.some((text) => BILLING_DETAIL.test(text));
}

function concretePath(template: string): string {
  return template.replaceAll(/:[^/]+/gu, '123');
}

const explore = exploreCatalog;

function exploreOne(method: string, path: string): ExploredEndpoint | undefined {
  return explore({ limit: 100, method, path }).find((endpoint) => endpoint.path === path);
}

function recordingFetch(sent: SentRequest[]): typeof fetch {
  return async (input, init) => {
    sent.push({ headers: init?.headers, method: init?.method, url: String(input) });
    return new Response(JSON.stringify({ ok: true }));
  };
}

async function call(
  params: Parameters<typeof handleTweetclaw>[0]['params'],
  mppMode = false,
): Promise<{ readonly isError: boolean; readonly sent: readonly SentRequest[]; readonly text: string }> {
  const sent: SentRequest[] = [];
  const result = await handleTweetclaw({
    baseUrl: 'https://xquik.com',
    credential: mppMode ? '' : 'xq_test',
    fetchFunction: recordingFetch(sent),
    mppMode,
    params,
  });
  return { isError: result.isError === true, sent, text: result.content[0]?.text ?? '' };
}

describe('explore over the generated catalog', () => {
  it.each([
    ['GET', '/api/v1/x/spaces/:id'],
    ['GET', '/api/v1/x/spaces/search'],
    ['GET', '/api/v1/x/jobs/search'],
    ['GET', '/api/v1/x/lists/search'],
    ['GET', '/api/v1/x/broadcasts/:id'],
    ['GET', '/api/v1/x/users/:id/follower-ids'],
    ['GET', '/api/v1/x/users/batch/tweets'],
    ['GET', '/api/v1/x/tweets/:id/translation'],
    ['GET', '/api/v1/x/communities/find'],
    ['GET', '/api/v1/x/links/resolve'],
    ['POST', '/api/v1/x/analysis/sentiment'],
    ['POST', '/api/v1/webhooks/telegram'],
    ['DELETE', '/api/v1/extractions/:id'],
    ['DELETE', '/api/v1/x/dm/:userId/messages/:messageId'],
  ])('lists %s %s', (method, path) => {
    expect.assertions(3);
    const endpoint = exploreOne(method, path);
    expect(endpoint?.method).toBe(method);
    expect(endpoint?.summary.length).toBeGreaterThan(0);
    expect(endpoint?.responseShape.length).toBeGreaterThan(0);
  });

  it('prints a listed route as JSON with its price and parameters', async () => {
    expect.assertions(1);
    const result = await handleExplore({ method: 'GET', path: '/api/v1/x/broadcasts/:id' });
    expect(JSON.parse(result.content[0]?.text ?? '[]'))
      .toStrictEqual([exploreOne('GET', '/api/v1/x/broadcasts/:id')]);
  });

  it('marks the 13 MPP routes and no others', () => {
    expect.assertions(1);
    const endpoints = explore({ limit: 100, mpp: true });
    expect(endpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`).toSorted())
      .toStrictEqual(MPP_ROUTES);
  });

  it.each([
    ['/api/v1/trends', '$0.00015/call'],
    ['/api/v1/x/trends', '$0.00015/call'],
    ['/api/v1/x/followers/check', '$0.00015/call'],
    ['/api/v1/x/spaces/:id', '$0.00015/call'],
    ['/api/v1/x/articles/:tweetId', '$0.00075/call'],
  ])('prices %s at the spec amount', (path, price) => {
    expect.assertions(1);
    const endpoint = exploreOne('GET', path);
    expect(endpoint?.mpp).toStrictEqual({ intent: 'charge', price });
  });

  it('describes the place filters that X trends accept', () => {
    expect.assertions(1);
    const endpoint = exploreOne('GET', '/api/v1/x/trends');
    expect(endpoint?.parameters.map((parameter) => parameter.name))
      .toStrictEqual(expect.arrayContaining(['woeid', 'country', 'location', 'count']));
  });

  it('files the analysis routes under their own category', () => {
    expect.assertions(2);
    const endpoints = explore({ category: 'analysis', limit: 100 });
    expect(endpoints.length).toBeGreaterThan(0);
    expect(endpoints.every((endpoint) => endpoint.path.startsWith('/api/v1/x/analysis/'))).toBe(true);
  });

  it('tells the agent to wait for a request before private reads', () => {
    expect.assertions(2);
    const endpoint = exploreOne('GET', '/api/v1/x/bookmarks');
    expect(endpoint?.sensitive).toBe(true);
    expect(endpoint?.summary).toContain('Requires explicit user request.');
  });

  it.each(BLOCKED_CALLS)('hides %s %s', (method, path) => {
    expect.assertions(1);
    expect(explore({ limit: 100, method, path })).toStrictEqual([]);
  });

  it('hides the event stream and documentation search', () => {
    expect.assertions(2);
    const paths = specEndpoints.map((endpoint) => endpoint.path);
    expect(paths).not.toContain('/api/v1/events/stream');
    expect(explore({ path: '/ask' })).toStrictEqual([]);
  });

  it('states no credit charge and no price other than MPP call prices', () => {
    expect.assertions(1);
    const priced = specEndpoints.filter((endpoint) => statesBillingDetail(endpoint));
    expect(priced.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).toStrictEqual([]);
  });

  it('covers every spec operation that the contract does not leave out', () => {
    expect.assertions(3);
    const { cataloged, callable, eventStreams, excluded, outsideApiV1, specOperations } = contract.counts;
    expect(cataloged).toBe(specOperations - outsideApiV1 - eventStreams - excluded);
    expect(specEndpoints).toHaveLength(callable);
    expect(new Set(specEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).size).toBe(callable);
  });
});

describe('tweetclaw over the generated catalog', () => {
  it.each([
    ['GET', '/api/v1/x/spaces/1abc'],
    ['GET', '/api/v1/x/jobs/search'],
    ['GET', '/api/v1/x/users/44196397/follower-ids'],
    ['GET', '/api/v1/x/tweets/20/translation'],
    ['POST', '/api/v1/x/analysis/sentiment'],
    ['POST', '/api/v1/webhooks/telegram'],
    ['DELETE', '/api/v1/extractions/ext_1'],
  ])('sends %s %s', async (method, path) => {
    expect.assertions(2);
    const result = await call({ method, path });
    expect(result.isError).toBe(false);
    expect(result.sent.map((request) => [request.method, request.url]))
      .toStrictEqual([[method, `https://xquik.com${path}`]]);
  });

  it.each(BLOCKED_CALLS)('refuses %s %s without a request', async (method, path) => {
    expect.assertions(3);
    const result = await call({ method, path });
    expect(result.isError).toBe(true);
    expect(result.text).toContain('not in the TweetClaw catalog');
    expect(result.sent).toStrictEqual([]);
  });

  it('refuses the event stream without a request', async () => {
    expect.assertions(2);
    const result = await call({ path: '/api/v1/events/stream' });
    expect(result.text).toContain('not in the TweetClaw catalog');
    expect(result.sent).toStrictEqual([]);
  });

  it('refuses documentation search outside /api/v1', async () => {
    expect.assertions(2);
    const result = await call({ method: 'POST', path: '/ask' });
    expect(result.text).toContain('Path is outside /api/v1/');
    expect(result.sent).toStrictEqual([]);
  });

  it.each(MPP_ROUTES)('sends %s in MPP mode', async (route) => {
    expect.assertions(2);
    const path = concretePath(route.slice('GET '.length));
    const result = await call({ path }, true);
    expect(result.isError).toBe(false);
    expect(result.sent.map((request) => request.url)).toStrictEqual([`https://xquik.com${path}`]);
  });

  it.each([
    ['GET', '/api/v1/x/tweets/search'],
    ['GET', '/api/v1/x/tweets/top'],
    ['GET', '/api/v1/x/users/batch'],
    ['GET', '/api/v1/x/users/search'],
    ['GET', '/api/v1/x/lists/search'],
    ['GET', '/api/v1/x/spaces/search'],
    ['GET', '/api/v1/x/trends/locations'],
    ['POST', '/api/v1/x/media/download'],
    ['POST', '/api/v1/x/analysis/sentiment'],
  ])('refuses %s %s in MPP mode', async (method, path) => {
    expect.assertions(2);
    const result = await call({ method, path }, true);
    expect(result.text).toContain('does not support MPP');
    expect(result.sent).toStrictEqual([]);
  });

  it('polls a write action without an idempotency key', async () => {
    expect.assertions(2);
    const result = await call({ path: '/api/v1/x/write-actions/wa_1' });
    expect(result.isError).toBe(false);
    expect(result.sent.map((request) => request.headers)).toStrictEqual([{ 'x-api-key': 'xq_test' }]);
  });

  it('requires an idempotency key to delete a DM', async () => {
    expect.assertions(3);
    const request = { method: 'DELETE', path: '/api/v1/x/dm/44196397/messages/1900000000000000000' };
    const refused = await call(request);
    const accepted = await call({ ...request, idempotencyKey: 'dm-delete-001' });
    expect(refused.text).toContain('idempotencyKey');
    expect(refused.sent).toStrictEqual([]);
    expect(accepted.sent.map((sent) => sent.headers)).toStrictEqual([
      { 'Idempotency-Key': 'dm-delete-001', 'x-api-key': 'xq_test' },
    ]);
  });
});

describe('catalog routing', () => {
  it.each([
    '/api/v1/x/tweets/search',
    '/api/v1/x/tweets/top',
    '/api/v1/x/users/batch',
    '/api/v1/x/users/batch/tweets',
    '/api/v1/x/users/search',
    '/api/v1/x/lists/search',
    '/api/v1/x/spaces/search',
    '/api/v1/x/jobs/locations',
    '/api/v1/monitors/keywords',
    '/api/v1/styles/compare',
  ])('matches %s to its own route, not to a route with a path value', (path) => {
    expect.assertions(1);
    expect(findEndpoint('GET', path)?.path).toBe(path);
  });

  it('asks for approval before every call except the radar read', () => {
    expect.assertions(1);
    const unprompted = specEndpoints.filter(
      (endpoint) => !requestNeedsApproval(endpoint.method, concretePath(endpoint.path)),
    );
    expect(unprompted.map((endpoint) => `${endpoint.method} ${endpoint.path}`))
      .toStrictEqual(['GET /api/v1/radar']);
  });

  it('lets every cataloged call through the request layer', () => {
    expect.assertions(1);
    const blocked = specEndpoints.filter(
      (endpoint) => isProhibitedRequest(endpoint.method, concretePath(endpoint.path)),
    );
    expect(blocked.map((endpoint) => `${endpoint.method} ${endpoint.path}`)).toStrictEqual([]);
  });

  it.each(BLOCKED_CALLS)('stops %s %s at the request layer', (method, path) => {
    expect.assertions(1);
    expect(isProhibitedRequest(method, path)).toBe(true);
  });
});
