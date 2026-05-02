import { describe, expect, it } from 'vitest';
import { API_SPEC } from '../src/api-spec.js';

describe('API_SPEC', () => {
  it('has no duplicate method+path combinations', () => {
    expect.assertions(1);
    const keys = API_SPEC.map((endpoint) => `${endpoint.method} ${endpoint.path}`);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('all entries have required fields', () => {
    expect.assertions(1);
    const invalid = API_SPEC.filter(
      (endpoint) =>
        typeof endpoint.category !== 'string' ||
        typeof endpoint.free !== 'boolean' ||
        typeof endpoint.method !== 'string' ||
        typeof endpoint.path !== 'string' ||
        typeof endpoint.summary !== 'string',
    );
    expect(invalid).toStrictEqual([]);
  });

  it('all paths start with /api/v1/', () => {
    expect.assertions(1);
    const invalid = API_SPEC.filter((endpoint) => !endpoint.path.startsWith('/api/v1/'));
    expect(invalid).toStrictEqual([]);
  });

  it('categories are valid strings', () => {
    expect.assertions(1);
    const categories = [...new Set(API_SPEC.map((endpoint) => endpoint.category))];
    const allValid = categories.every((c) => typeof c === 'string' && c.length > 0);
    expect(allValid).toBe(true);
  });

  it('has at least 40 endpoints', () => {
    expect.assertions(1);
    expect(API_SPEC.length).toBeGreaterThanOrEqual(40);
  });

  it('matches the canonical trends, credits, and remove follower catalog', () => {
    expect.assertions(6);
    const keys = new Set(API_SPEC.map((endpoint) => `${endpoint.method} ${endpoint.path}`));
    const categories = new Set(API_SPEC.map((endpoint) => endpoint.category));
    const removedTrendingRoutePath = 'trending/:source';

    expect(keys).toContain('GET /api/v1/x/trends');
    expect(keys).toContain('POST /api/v1/x/users/:id/remove-follower');
    expect(keys).toContain('GET /api/v1/credits/topup/status');
    expect(keys).not.toContain(`GET /api/v1/${removedTrendingRoutePath}`);
    expect(categories).not.toContain('trends');
    expect(categories.size).toBe(10);
  });

  it('has both free and paid endpoints', () => {
    expect.assertions(2);
    expect(API_SPEC.some((endpoint) => endpoint.free)).toBe(true);
    expect(API_SPEC.some((endpoint) => !endpoint.free)).toBe(true);
  });

  it('parameters have required fields when present', () => {
    expect.assertions(1);
    const allParameters = API_SPEC.flatMap((endpoint) => endpoint.parameters ?? []);
    const invalid = allParameters.filter(
      (p) =>
        typeof p.name !== 'string' ||
        typeof p.description !== 'string' ||
        typeof p.required !== 'boolean' ||
        typeof p.type !== 'string' ||
        !['body', 'path', 'query'].includes(p.in),
    );
    expect(invalid).toStrictEqual([]);
  });
});
