// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { handleExplore } from '../src/tools/explore.js';

describe('handleExplore', () => {
  it('filters endpoints by keyword', async () => {
    expect.assertions(2);
    const result = await handleExplore({ query: 'tweet' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('tweet');
  });

  it('filters endpoints by category', async () => {
    expect.assertions(2);
    const result = await handleExplore({ category: 'composition' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('composition');
  });

  it('returns endpoints with no filter', async () => {
    expect.assertions(2);
    const result = await handleExplore();
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('/api/v1/');
  });

  it('returns empty array for no matches', async () => {
    expect.assertions(2);
    const result = await handleExplore({ query: 'zzzznonexistent' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toBe('[]');
  });

  it('searches case insensitively', async () => {
    expect.assertions(2);
    const result = await handleExplore({ query: 'MONITOR' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('monitor');
  });

  it('finds free endpoints', async () => {
    expect.assertions(2);
    const result = await handleExplore({ free: true });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('"free": true');
  });

  it('handles path-based filtering', async () => {
    expect.assertions(2);
    const result = await handleExplore({ path: '/draws' });
    expect(result.isError).toBeUndefined();
    expect(result.content[0]?.text).toContain('/draws');
  });

  it('returns an error result when catalog filtering throws', async () => {
    expect.assertions(2);
    const params = new Proxy({}, {
      get(_target, property) {
        if (property === 'method') {
          throw new Error('bad params');
        }
        return null;
      },
    });
    const result = await handleExplore(params);
    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('bad params');
  });
});
