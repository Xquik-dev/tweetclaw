import { describe, expect, it } from 'vitest';
import { formatTrends, handleXTrends } from '../src/commands/xtrends.js';
import type { RequestFunction } from '../src/types.js';

describe('formatTrends', () => {
  it('formats trend items with numbers', () => {
    expect.assertions(3);
    const result = formatTrends({
      items: [
        { title: 'AI agents', score: 95, source: 'hackernews' },
        { title: 'Rust 2026', url: 'https://example.com/rust' },
      ],
      total: 2,
    });
    expect(result).toContain('1. AI agents [hackernews] (score: 95)');
    expect(result).toContain('2. Rust 2026');
    expect(result).toContain('https://example.com/rust');
  });

  it('shows total count in header', () => {
    expect.assertions(1);
    const result = formatTrends({ items: [], total: 0 });
    expect(result).toContain('0 items');
  });
});

describe('handleXTrends', () => {
  it('calls /api/v1/radar', async () => {
    expect.assertions(2);
    const mockRequest: RequestFunction = async (path) => {
      expect(path).toBe('/api/v1/radar');
      return { items: [{ title: 'Test trend' }], total: 1 };
    };
    const result = await handleXTrends(mockRequest);
    expect(result).toContain('Test trend');
  });

  it('passes category arg as query parameter', async () => {
    expect.assertions(2);
    const mockRequest: RequestFunction = async (path, options) => {
      expect(path).toBe('/api/v1/radar');
      expect(options?.query).toStrictEqual({ category: 'tech' });
      return { items: [], total: 0 };
    };
    await handleXTrends(mockRequest, 'tech');
  });

  it('handles empty args', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async (_path, options) => {
      expect(options).toBeUndefined();
      return { items: [], total: 0 };
    };
    await handleXTrends(mockRequest, '');
  });

  it('handles whitespace-only args', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async (_path, options) => {
      expect(options).toBeUndefined();
      return { items: [], total: 0 };
    };
    await handleXTrends(mockRequest, '   ');
  });

  it('handles undefined args', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async (_path, options) => {
      expect(options).toBeUndefined();
      return { items: [], total: 0 };
    };
    await handleXTrends(mockRequest);
  });

  it('returns fallback when response is not a valid radar response', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => 'not an object';
    const result = await handleXTrends(mockRequest);
    expect(result).toBe('--- Trending Topics (0 items) ---');
  });
});
