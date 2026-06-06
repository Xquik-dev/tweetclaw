import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleTweetclaw } from '../src/tools/tweetclaw.js';

function createMockFetch(response: unknown, status = 200): typeof fetch {
  return async () => new Response(JSON.stringify(response), { status, statusText: status === 200 ? 'OK' : 'Error' });
}

describe('handleTweetclaw', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes catalog request with mock API and returns result', async () => {
    expect.assertions(2);
    const mockFetch = createMockFetch({ email: 'test@example.com' });
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: mockFetch,
      params: { path: '/api/v1/account' },
    });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('test@example.com');
  });

  it('injects auth automatically', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (_input, init) => {
      expect(init?.headers).toStrictEqual({ 'x-api-key': 'xq_mykey' });
      return new Response(JSON.stringify({}));
    };
    await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_mykey',
      fetchFunction: mockFetch,
      params: { path: '/api/v1/account' },
    });
  });

  it('handles API 4xx errors', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: createMockFetch({ error: 'not found' }, 404),
      params: { path: '/api/v1/account' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('404');
  });

  it('handles API 5xx errors', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: createMockFetch({ error: 'server error' }, 500),
      params: { path: '/api/v1/account' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('500');
  });

  it('rejects unknown paths', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: createMockFetch({}),
      params: { path: '/api/v1/not-real' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('not in the TweetClaw catalog');
  });

  it('rejects dashboard-only endpoints', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: createMockFetch({}),
      params: { method: 'POST', path: '/api/v1/api-keys' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('not in the TweetClaw catalog');
  });

  it('truncates large responses', async () => {
    expect.assertions(1);
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: createMockFetch({ data: 'x'.repeat(30_000) }),
      params: { path: '/api/v1/account' },
    });
    expect(result.content[0]?.text).toContain('--- TRUNCATED ---');
  });

  it('handles execution timeout', async () => {
    expect.assertions(2);
    const hangingFetch: typeof fetch = async () => new Promise<Response>(() => {});
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: hangingFetch,
      params: { path: '/api/v1/account' },
      timeoutMs: 10,
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('timed out');
  });

  it('handles synchronous request failures before timeout setup completes', async () => {
    expect.assertions(2);
    const throwingFetch: typeof fetch = () => {
      throw new Error('sync failure');
    };
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: throwingFetch,
      params: { path: '/api/v1/account' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('sync failure');
  });

  it('clears execution timeout after successful response', async () => {
    expect.assertions(2);
    vi.useFakeTimers();
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: createMockFetch({ ok: true }),
      params: { path: '/api/v1/account' },
      timeoutMs: 60_000,
    });
    expect(result.isError).toBeUndefined();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('handles POST with body', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (_input, init) => {
      const body = JSON.parse(init?.body as string) as Record<string, unknown>;
      expect(body).toStrictEqual({ account: '@test', text: 'hello' });
      return new Response(JSON.stringify({ tweetId: '123', success: true }));
    };
    await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: mockFetch,
      params: {
        body: { account: '@test', text: 'hello' },
        method: 'POST',
        path: '/api/v1/x/tweets',
      },
    });
  });

  it('passes query parameters to catalog requests', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (input) => {
      expect(String(input)).toBe('https://xquik.com/api/v1/x/tweets/search?q=ai&limit=5');
      return new Response(JSON.stringify({ tweets: [] }));
    };
    await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: 'xq_test',
      fetchFunction: mockFetch,
      params: {
        path: '/api/v1/x/tweets/search',
        query: { q: 'ai', limit: 5 },
      },
    });
  });

  it('rejects non-MPP endpoints in MPP mode', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      baseUrl: 'https://xquik.com',
      credential: '',
      fetchFunction: createMockFetch({}),
      mppMode: true,
      params: { path: '/api/v1/account' },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('not available in MPP mode');
  });
});
