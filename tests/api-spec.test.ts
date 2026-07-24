// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { API_SPEC } from '../src/api-spec.js';

function hasRequiredIdempotencyKey(endpoint: (typeof API_SPEC)[number]): boolean {
  return endpoint.parameters?.some(
    (parameter) =>
      parameter.in === 'header'
      && parameter.name === 'Idempotency-Key'
      && parameter.required,
  ) ?? false;
}

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

  it('matches the agent-facing endpoint count', () => {
    expect.assertions(2);
    expect(API_SPEC).toHaveLength(119);
    expect(API_SPEC.filter((endpoint) => endpoint.agentProhibited !== true)).toHaveLength(102);
  });

  it('matches the canonical trends, credits, monitor, and X read catalog', () => {
    expect.assertions(15);
    const keys = new Set(API_SPEC.map((endpoint) => `${endpoint.method} ${endpoint.path}`));
    const categories = new Set(API_SPEC.map((endpoint) => endpoint.category));
    const removedTrendingRoutePath = 'trending/:source';

    expect(keys).toContain('GET /api/v1/x/trends');
    expect(keys).toContain('POST /api/v1/x/users/:id/remove-follower');
    expect(keys).toContain('GET /api/v1/credits/topup/status');
    expect(keys).toContain('POST /api/v1/monitors/keywords');
    expect(keys).toContain('GET /api/v1/x/bookmarks');
    expect(keys).toContain('GET /api/v1/x/notifications');
    expect(keys).toContain('GET /api/v1/x/timeline');
    expect(keys).toContain('GET /api/v1/x/dm/:userId/history');
    expect(keys).toContain('GET /api/v1/x/users/:id/verified-followers');
    expect(keys).toContain('GET /api/v1/x/users/:id/replies');
    expect(keys).toContain('GET /api/v1/x/write-actions/:id');
    expect(keys).toContain('POST /api/v1/webhooks/:id/resume');
    expect(keys).not.toContain(`GET /api/v1/${removedTrendingRoutePath}`);
    expect(categories).not.toContain('trends');
    expect(categories.size).toBe(10);
  });

  it('matches the canonical compose union contract', () => {
    expect.assertions(4);
    const compose = API_SPEC.find(
      (endpoint) => endpoint.method === 'POST' && endpoint.path === '/api/v1/compose',
    );
    const parameters = compose?.parameters ?? [];

    expect(compose?.summary).toBe('Build, refine, or check a post draft');
    expect(compose?.responseShape).toContain('nextStep');
    expect(parameters.map((parameter) => parameter.name).sort()).toStrictEqual(
      [
        'additionalContext',
        'callToAction',
        'draft',
        'goal',
        'hasLink',
        'hasMedia',
        'mediaType',
        'step',
        'styleUsername',
        'tone',
        'topic',
      ],
    );
    expect(
      parameters.filter((parameter) => parameter.required).map((parameter) => parameter.name),
    ).toStrictEqual(['step']);
  });

  it('keeps MPP coverage aligned with Xquik pay-per-use routes', () => {
    expect.assertions(5);
    const mppEntries = API_SPEC.filter((endpoint) => endpoint.mpp !== undefined).map(
      (endpoint) => [`${endpoint.method} ${endpoint.path}`, endpoint.mpp] as const,
    );
    const mppKeys = new Set(mppEntries.map(([key]) => key));
    const mediaDownload = API_SPEC.find((endpoint) => endpoint.path === '/api/v1/x/media/download');

    expect([...mppKeys].sort()).toStrictEqual(
      [
        'GET /api/v1/trends',
        'GET /api/v1/x/articles/:tweetId',
        'GET /api/v1/x/communities/:id/info',
        'GET /api/v1/x/followers/check',
        'GET /api/v1/x/trends',
        'GET /api/v1/x/tweets/:id',
        'GET /api/v1/x/users/:id',
      ].sort(),
    );
    expect(mppEntries.every(([, mpp]) => mpp?.intent === 'charge')).toBe(true);
    expect(mppEntries.every(([, mpp]) => /^\$\d+\.\d+\/call$/u.test(mpp?.price ?? ''))).toBe(true);
    expect(mppKeys).not.toContain('POST /api/v1/x/media/download');
    expect(mediaDownload?.summary).toContain('Not MPP-eligible');
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
        !['body', 'header', 'path', 'query'].includes(p.in),
    );
    expect(invalid).toStrictEqual([]);
  });

  it('documents required idempotency keys for every X write', () => {
    expect.assertions(1);
    const writes = API_SPEC.filter(
      (endpoint) => endpoint.category === 'x-write' && endpoint.method !== 'GET',
    );
    const missing = writes.filter(
      (endpoint) => !hasRequiredIdempotencyKey(endpoint),
    );
    expect(missing).toStrictEqual([]);
  });

  it('omits credential-taking account workflows', () => {
    expect.assertions(4);
    const endpointKeys = new Set(API_SPEC.map((endpoint) => `${endpoint.method} ${endpoint.path}`));
    const parameterNames: string[] = [];
    for (const endpoint of API_SPEC) {
      for (const parameter of endpoint.parameters ?? []) {
        parameterNames.push(parameter.name);
      }
    }

    expect(endpointKeys).not.toContain('POST /api/v1/x/accounts');
    expect(endpointKeys).not.toContain('POST /api/v1/x/accounts/:id/reauth');
    expect(parameterNames).not.toContain('password');
    expect(parameterNames).not.toContain('totp_secret');
  });
});
