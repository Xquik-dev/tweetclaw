// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it, vi } from 'vitest';
import { buildAuthHeader, buildFetchHeaders, buildFetchUrl, createProxiedRequest, isProhibitedRequest } from '../src/request.js';

describe('buildAuthHeader', () => {
  it('uses X-API-Key for xq_ prefix credentials', () => {
    expect.assertions(1);
    expect(buildAuthHeader('xq_test123')).toStrictEqual({ 'x-api-key': 'xq_test123' });
  });

  it('uses Bearer for non-xq_ credentials', () => {
    expect.assertions(1);
    expect(buildAuthHeader('sk_test123')).toStrictEqual({ authorization: 'Bearer sk_test123' });
  });
});

describe('buildFetchHeaders', () => {
  it('adds content-type for requests with body', () => {
    expect.assertions(1);
    const headers = buildFetchHeaders('xq_key', true);
    expect(headers).toStrictEqual({
      'content-type': 'application/json',
      'x-api-key': 'xq_key',
    });
  });

  it('omits content-type for requests without body', () => {
    expect.assertions(1);
    const headers = buildFetchHeaders('xq_key', false);
    expect(headers).toStrictEqual({ 'x-api-key': 'xq_key' });
  });

  it('omits auth headers for empty credential (MPP mode)', () => {
    expect.assertions(1);
    const headers = buildFetchHeaders('', false);
    expect(headers).toStrictEqual({});
  });

  it('includes content-type but no auth for empty credential with body', () => {
    expect.assertions(1);
    const headers = buildFetchHeaders('', true);
    expect(headers).toStrictEqual({ 'content-type': 'application/json' });
  });

  it('adds the write idempotency key', () => {
    expect.assertions(1);
    expect(buildFetchHeaders('xq_key', true, 'post-001')).toStrictEqual({
      'Idempotency-Key': 'post-001',
      'content-type': 'application/json',
      'x-api-key': 'xq_key',
    });
  });
});

describe('buildFetchUrl', () => {
  it('builds URL with base and path', () => {
    expect.assertions(1);
    expect(buildFetchUrl('https://xquik.com', '/api/v1/account'))
      .toBe('https://xquik.com/api/v1/account');
  });

  it('appends query parameters', () => {
    expect.assertions(1);
    const url = buildFetchUrl('https://xquik.com', '/api/v1/events', { after: 'abc', limit: '10' });
    expect(url).toBe('https://xquik.com/api/v1/events?after=abc&limit=10');
  });

  it('rejects plain HTTP base URLs', () => {
    expect.assertions(1);
    expect(() => { buildFetchUrl('http://xquik.com', '/api/v1/account'); }).toThrow('Base URL must use HTTPS');
  });

  it('rejects malformed base URLs', () => {
    expect.assertions(1);
    expect(() => { buildFetchUrl('not a url', '/api/v1/account'); }).toThrow('Base URL must be a valid HTTPS URL.');
  });

  it('rejects credentialed base URLs', () => {
    expect.assertions(1);
    expect(() => { buildFetchUrl('https://user:pass@xquik.com', '/api/v1/account'); }).toThrow(
      'Base URL must not include credentials',
    );
  });
});

describe('createProxiedRequest', () => {
  it('sends GET request with auth header', async () => {
    expect.assertions(3);
    const mockFetch: typeof fetch = async (input, init) => {
      expect(String(input)).toContain('/api/v1/account');
      expect(init?.headers).toStrictEqual({ 'x-api-key': 'xq_test' });
      return new Response(JSON.stringify({ email: 'test@example.com' }));
    };
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    const result = await request('/api/v1/account');
    expect(result).toStrictEqual({ email: 'test@example.com' });
  });

  it('sends POST with body and content-type', async () => {
    expect.assertions(3);
    const mockFetch: typeof fetch = async (_input, init) => {
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ text: 'hello' }));
      expect(init?.headers).toStrictEqual({
        'content-type': 'application/json',
        'x-api-key': 'xq_test',
      });
      return new Response(JSON.stringify({ success: true }));
    };
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await request('/api/v1/x/tweets', { body: { text: 'hello' }, method: 'POST' });
  });

  it('includes query parameters', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (input) => {
      expect(String(input)).toContain('q=test');
      return new Response(JSON.stringify({ tweets: [] }));
    };
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await request('/api/v1/x/tweets/search', { query: { q: 'test' } });
  });

  it('uses the current global fetch when no fetch function is injected', async () => {
    expect.assertions(2);
    const mockFetch = vi.fn(async () => new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal('fetch', mockFetch);
    try {
      const request = createProxiedRequest('https://xquik.com', 'xq_test');
      await expect(request('/api/v1/radar')).resolves.toStrictEqual({ ok: true });
      expect(mockFetch).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('throws on non-/api/v1/ paths', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/invalid/path')).rejects.toThrow('Path must start with /api/v1/');
  });

  it('throws on non-2xx responses with status and body', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ error: 'not found' }), { status: 404, statusText: 'Not Found' });
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('API request failed: 404 Not Found');
  });

  it('does not echo private response fields in API error messages', async () => {
    expect.assertions(3);
    const mockFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          account: 'acct_123',
          email: 'user@example.com',
          error: 'account_error',
          message: 'Account user@example.com needs attention',
        }),
        { status: 403, statusText: 'Forbidden' },
      );
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('API request failed: 403 Forbidden (account_error)');
    await expect(request('/api/v1/account')).rejects.not.toThrow('user@example.com');
    await expect(request('/api/v1/account')).rejects.not.toThrow('acct_123');
  });

  it('uses safe API error codes without a status text', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ code: 'rate_limit' }), { status: 429 });
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('API request failed: 429 (rate_limit)');
  });

  it('falls back to a safe code field when error is not text', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ code: 'payment_required', error: 402 }), { status: 402 });
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('API request failed: 402 (payment_required)');
  });

  it('omits API error codes when the error body has no string code', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async () =>
      new Response(JSON.stringify({ message: 'private failure' }), { status: 400, statusText: 'Bad Request' });
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('API request failed: 400 Bad Request');
  });

  it('omits unsafe API error codes', async () => {
    expect.assertions(4);
    const requestWithError = (error: string): ReturnType<typeof createProxiedRequest> =>
      createProxiedRequest('https://xquik.com', 'xq_test', async () =>
        new Response(JSON.stringify({ error }), { status: 400, statusText: 'Bad Request' }),
      );

    await expect(requestWithError('')('/api/v1/account')).rejects.toThrow(
      'API request failed: 400 Bad Request',
    );
    await expect(requestWithError('1bad')('/api/v1/account')).rejects.toThrow(
      'API request failed: 400 Bad Request',
    );
    await expect(requestWithError('bad code')('/api/v1/account')).rejects.toThrow(
      'API request failed: 400 Bad Request',
    );
    await expect(requestWithError('a'.repeat(81))('/api/v1/account')).rejects.toThrow(
      'API request failed: 400 Bad Request',
    );
  });

  it('handles non-json API error bodies without echoing them', async () => {
    expect.assertions(2);
    const mockFetch: typeof fetch = async () =>
      new Response('private body', { status: 502, statusText: 'Bad Gateway' });
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account')).rejects.toThrow('API request failed: 502 Bad Gateway');
    await expect(request('/api/v1/account')).rejects.not.toThrow('private body');
  });

  it('uses Bearer auth for non-xq_ keys', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (_input, init) => {
      expect(init?.headers).toStrictEqual({ authorization: 'Bearer sk_key' });
      return new Response(JSON.stringify({}));
    };
    const request = createProxiedRequest('https://xquik.com', 'sk_key', mockFetch);
    await request('/api/v1/account');
  });

  it('blocks POST /api/v1/x/accounts (connect account)', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(
      request('/api/v1/x/accounts', { method: 'POST', body: { username: 'test', email: 'a@b.com', password: 'pass' } }),
    ).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks POST /api/v1/x/accounts/:id/reauth', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(
      request('/api/v1/x/accounts/123/reauth', { method: 'POST', body: { password: 'pass' } }),
    ).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks GET /api/v1/x/account-connection-attempts/:id', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(
      request('/api/v1/x/account-connection-attempts/xatt_123'),
    ).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('allows GET /api/v1/x/accounts (list accounts)', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async () => new Response(JSON.stringify({ accounts: [] }));
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    const result = await request('/api/v1/x/accounts');
    expect(result).toStrictEqual({ accounts: [] });
  });

  it('blocks POST /api/v1/x/accounts/bulk-retry', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/x/accounts/bulk-retry', { method: 'POST' })).rejects.toThrow(
      'Agent-prohibited endpoint',
    );
  });

  it('blocks DELETE /api/v1/x/accounts/:id (disconnect)', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/x/accounts/123', { method: 'DELETE' })).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks API key creation', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/api-keys', { method: 'POST', body: { name: 'agent' } })).rejects.toThrow(
      'Agent-prohibited endpoint',
    );
  });

  it('blocks API key reads with trailing slash', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/api-keys/')).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks checkout creation', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/subscribe', { method: 'POST' })).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks checkout creation with trailing slash', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/subscribe/', { method: 'POST' })).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks credit top-up status reads', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(
      request('/api/v1/credits/topup/status', { query: { session_id: 'cs_test' } }),
    ).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks credit top-up status reads with trailing slash', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(
      request('/api/v1/credits/topup/status/', { query: { session_id: 'cs_test' } }),
    ).rejects.toThrow('Agent-prohibited endpoint');
  });

  it('blocks support ticket access', async () => {
    expect.assertions(1);
    const request = createProxiedRequest('https://xquik.com', 'xq_test');
    await expect(request('/api/v1/support/tickets')).rejects.toThrow('Agent-prohibited endpoint');
  });
});

describe('isProhibitedRequest', () => {
  it('blocks POST /api/v1/x/accounts', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('POST', '/api/v1/x/accounts')).toBe(true);
  });

  it('blocks POST /api/v1/x/accounts/ (trailing slash)', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('POST', '/api/v1/x/accounts/')).toBe(true);
  });

  it('blocks GET /api/v1/x/account-connection-attempts/:id', () => {
    expect.assertions(1);
    expect(
      isProhibitedRequest(
        'GET',
        '/api/v1/x/account-connection-attempts/xatt_123',
      ),
    ).toBe(true);
  });

  it('blocks dashboard-only exact paths with repeated trailing slashes', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('POST', '/api/v1/credits/quick-topup//')).toBe(true);
  });

  it('blocks POST /api/v1/x/accounts/456/reauth', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('POST', '/api/v1/x/accounts/456/reauth')).toBe(true);
  });

  it('blocks case-insensitive method', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('post', '/api/v1/x/accounts')).toBe(true);
  });

  it('allows GET /api/v1/x/accounts', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('GET', '/api/v1/x/accounts')).toBe(false);
  });

  it('blocks POST /api/v1/x/accounts/bulk-retry', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('POST', '/api/v1/x/accounts/bulk-retry')).toBe(true);
  });

  it('blocks DELETE /api/v1/x/accounts/123', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('DELETE', '/api/v1/x/accounts/123')).toBe(true);
  });

  it('blocks GET /api/v1/x/accounts/123', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('GET', '/api/v1/x/accounts/123')).toBe(true);
  });

  it('allows POST /api/v1/x/tweets', () => {
    expect.assertions(1);
    expect(isProhibitedRequest('POST', '/api/v1/x/tweets')).toBe(false);
  });
});
