// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { formatTrends, formatXTrends, handleXTrends, mppTrendQuery } from '../src/commands/xtrends.js';
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

describe('formatXTrends', () => {
  it('formats regional X trends', () => {
    expect.assertions(3);
    const result = formatXTrends({
      total: 2,
      trends: [
        { description: 'Agent news', name: '#Agents', rank: 4 },
        { name: 'TypeScript' },
      ],
      woeid: 1,
    });
    expect(result).toContain('WOEID 1');
    expect(result).toContain('4. #Agents');
    expect(result).toContain('2. TypeScript');
  });
});

describe('mppTrendQuery', () => {
  it('accepts empty or numeric WOEID filters', () => {
    expect.assertions(3);
    expect(mppTrendQuery()).toBeUndefined();
    expect(mppTrendQuery('   ')).toBeUndefined();
    expect(mppTrendQuery('23424977')).toStrictEqual({ woeid: '23424977' });
  });

  it('rejects nonnumeric filters', () => {
    expect.assertions(1);
    expect(() => mppTrendQuery('tech')).toThrow('WOEID is invalid');
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
    expect(result).toBe('Trending topics (0 items)');
  });

  it('uses the MPP trends route with a WOEID', async () => {
    expect.assertions(3);
    const mockRequest: RequestFunction = async (path, options) => {
      expect(path).toBe('/api/v1/trends');
      expect(options?.query).toStrictEqual({ woeid: '23424977' });
      return { total: 1, trends: [{ name: '#AI' }], woeid: 23_424_977 };
    };
    const result = await handleXTrends(mockRequest, '23424977', true);
    expect(result).toContain('#AI');
  });

  it('returns an MPP fallback for an invalid response', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => null;
    const result = await handleXTrends(mockRequest, undefined, true);
    expect(result).toBe('X trends (0 items)');
  });
});
