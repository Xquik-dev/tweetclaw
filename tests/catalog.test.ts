// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import {
  exploreCatalog,
  findEndpoint,
  matchesEndpointPath,
  requestNeedsApproval,
  resolveCatalogRequest,
  specEndpoints,
} from '../src/tools/catalog.js';
import { errorResult, extractErrorMessage, successResult } from '../src/tools/result.js';

describe('catalog matching', () => {
  it('matches concrete paths against catalog templates', () => {
    expect.assertions(3);
    expect(matchesEndpointPath('/api/v1/x/tweets/:id', '/api/v1/x/tweets/123')).toBe(true);
    expect(matchesEndpointPath('/api/v1/x/tweets/:id', '/api/v1/x/users/123')).toBe(false);
    expect(matchesEndpointPath('/api/v1/x/tweets/:id', '/api/v1/x/tweets/123/')).toBe(true);
  });

  it('finds endpoints by method and concrete path', () => {
    expect.assertions(1);
    expect(findEndpoint('GET', '/api/v1/x/tweets/123')?.path).toBe('/api/v1/x/tweets/:id');
  });

  it('filters endpoints by structured fields', () => {
    expect.assertions(3);
    const endpoints = exploreCatalog({ category: 'twitter', method: 'GET', mpp: true, query: 'tweet', limit: 10 });
    expect(endpoints.length).toBeGreaterThan(0);
    expect(endpoints.every((endpoint) => endpoint.category === 'twitter')).toBe(true);
    expect(endpoints.every((endpoint) => endpoint.mpp !== undefined)).toBe(true);
  });

  it('caps explore limits', () => {
    expect.assertions(1);
    expect(exploreCatalog({ limit: 10_000 })).toHaveLength(Math.min(100, specEndpoints.length));
  });

  it('rejects unknown endpoint paths', () => {
    expect.assertions(1);
    expect(() => resolveCatalogRequest({ path: '/api/v1/not-real' })).toThrow('not in the TweetClaw catalog');
  });

  it('rejects unsafe paths before catalog lookup', () => {
    expect.assertions(1);
    expect(() => resolveCatalogRequest({ path: '/invalid/path' })).toThrow('Path must start with /api/v1/');
  });

  it('rejects query strings in path', () => {
    expect.assertions(1);
    expect(() => resolveCatalogRequest({ path: '/api/v1/account?x=1' })).toThrow('query object');
  });

  it('rejects non-MPP endpoints in MPP mode', () => {
    expect.assertions(1);
    expect(() => resolveCatalogRequest({ path: '/api/v1/account' }, { mppMode: true })).toThrow('not available in MPP mode');
  });

  it('normalizes query parameter values', () => {
    expect.assertions(1);
    const request = resolveCatalogRequest({
      path: '/api/v1/x/tweets/search',
      query: { limit: 5, q: 'ai', verified: true },
    });
    expect(request.query).toStrictEqual({ limit: '5', q: 'ai', verified: 'true' });
  });

  it('requires valid idempotency keys for X writes', () => {
    expect.assertions(4);
    const request = {
      body: { account: '@xquik', text: 'Hello.' },
      method: 'POST',
      path: '/api/v1/x/tweets',
    } as const;

    expect(() => resolveCatalogRequest(request)).toThrow('idempotencyKey');
    expect(() => resolveCatalogRequest({ ...request, idempotencyKey: 'bad key' })).toThrow(
      'idempotencyKey',
    );
    expect(() => resolveCatalogRequest({ ...request, idempotencyKey: 'x'.repeat(256) })).toThrow(
      'idempotencyKey',
    );
    expect(resolveCatalogRequest({ ...request, idempotencyKey: 'post-001' }).idempotencyKey)
      .toBe('post-001');
  });

  it('flags write and private read requests for approval', () => {
    expect.assertions(8);
    expect(requestNeedsApproval('POST', '/api/v1/x/tweets')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/events')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/x/accounts')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/x/bookmarks')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/x/dm/123/history')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/x/tweets/123')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/account')).toBe(true);
    expect(requestNeedsApproval('GET', '/api/v1/radar')).toBe(false);
  });
});

describe('specEndpoints', () => {
  it('embeds one-time approval guidance in all 18 X mutation definitions', () => {
    expect.assertions(2);
    const writeEndpoints = exploreCatalog({ category: 'x-write', limit: 100 })
      .filter((endpoint) => endpoint.method !== 'GET');
    expect(writeEndpoints).toHaveLength(18);
    expect(
      writeEndpoints.every((endpoint) =>
        endpoint.summary.includes(
          'Requires one-time user approval after showing the exact target and payload.',
        )),
    ).toBe(true);
  });

  it('excludes agent-prohibited endpoints', () => {
    expect.assertions(8);
    const paths = specEndpoints.map((endpoint) => `${endpoint.method} ${endpoint.path}`);
    expect(paths).not.toContain('POST /api/v1/x/accounts');
    expect(paths).not.toContain('POST /api/v1/x/accounts/:id/reauth');
    expect(paths).not.toContain('POST /api/v1/x/accounts/bulk-retry');
    expect(paths).not.toContain('POST /api/v1/api-keys');
    expect(paths).not.toContain('POST /api/v1/subscribe');
    expect(paths).not.toContain('POST /api/v1/credits/topup');
    expect(paths).not.toContain('GET /api/v1/credits/topup/status');
    expect(paths).not.toContain('POST /api/v1/support/tickets');
  });

  it('does not expose raw credential parameters', () => {
    expect.assertions(2);
    const allParamNames: string[] = [];
    for (const endpoint of specEndpoints) {
      for (const parameter of endpoint.parameters ?? []) {
        allParamNames.push(parameter.name);
      }
    }
    expect(allParamNames).not.toContain('password');
    expect(allParamNames).not.toContain('totp_secret');
  });
});

describe('tool result helpers', () => {
  it('wraps success content', () => {
    expect.assertions(3);
    const result = successResult({ data: 'test' });
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.text).toContain('test');
  });

  it('wraps error content', () => {
    expect.assertions(3);
    const result = errorResult(new Error('fail'));
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.text).toContain('fail');
  });

  it('extracts non-error messages', () => {
    expect.assertions(1);
    expect(extractErrorMessage('raw string')).toBe('raw string');
  });
});
