import { describe, expect, it } from 'vitest';
import { handleTweetclaw } from '../src/tools/tweetclaw.js';

function createMockFetch(response: unknown, status = 200): typeof fetch {
  return async () => new Response(JSON.stringify(response), { status, statusText: status === 200 ? 'OK' : 'Error' });
}

describe('handleTweetclaw', () => {
  it('executes code with mock API and returns result', async () => {
    expect.assertions(2);
    const mockFetch = createMockFetch({ email: 'test@example.com' });
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return xquik.request('/api/v1/account');
      }`,
      fetchFunction: mockFetch,
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
      apiKey: 'xq_mykey',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return xquik.request('/api/v1/account');
      }`,
      fetchFunction: mockFetch,
    });
  });

  it('handles API 4xx errors', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return xquik.request('/api/v1/account');
      }`,
      fetchFunction: createMockFetch({ error: 'not found' }, 404),
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('404');
  });

  it('handles API 5xx errors', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return xquik.request('/api/v1/account');
      }`,
      fetchFunction: createMockFetch({ error: 'server error' }, 500),
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('500');
  });

  it('handles syntax errors in code', async () => {
    expect.assertions(1);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: 'this is not valid code!!!',
      fetchFunction: createMockFetch({}),
    });
    expect(result.isError).toBe(true);
  });

  it('handles runtime exceptions in code', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => { throw new Error('boom'); }`,
      fetchFunction: createMockFetch({}),
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('boom');
  });

  it('truncates large responses', async () => {
    expect.assertions(1);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return xquik.request('/api/v1/account');
      }`,
      fetchFunction: createMockFetch({ data: 'x'.repeat(30_000) }),
    });
    expect(result.content[0]?.text).toContain('--- TRUNCATED ---');
  });

  it('provides spec.endpoints in execution context', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return spec.endpoints.length;
      }`,
      fetchFunction: createMockFetch({}),
    });
    expect(result.isError).toBeUndefined();
    const count = Number(result.content[0]?.text);
    expect(count).toBeGreaterThan(40);
  });

  it('handles execution timeout', async () => {
    expect.assertions(2);
    const result = await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => new Promise(() => {})`,
      fetchFunction: createMockFetch({}),
      timeoutMs: 10,
    });
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('timed out');
  });

  it('handles POST with body', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (_input, init) => {
      const body = JSON.parse(init?.body as string) as Record<string, unknown>;
      expect(body).toStrictEqual({ text: 'hello', account: '@test' });
      return new Response(JSON.stringify({ tweetId: '123', success: true }));
    };
    await handleTweetclaw({
      apiKey: 'xq_test',
      baseUrl: 'https://xquik.com',
      code: `async () => {
        return xquik.request('/api/v1/x/tweets', {
          method: 'POST',
          body: { text: 'hello', account: '@test' }
        });
      }`,
      fetchFunction: mockFetch,
    });
  });
});
