// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { API_SPEC, mergeGeneratedContract } from '../src/api-spec.js';
import {
  MEDIA_RESPONSE_FIELDS,
  TWEET_RESPONSE_FIELDS,
  USER_RESPONSE_FIELDS,
} from '../src/read-data-richness.js';

function hasRequiredIdempotencyKey(endpoint: (typeof API_SPEC)[number]): boolean {
  return endpoint.parameters.some(
    (parameter) =>
      parameter.in === 'header'
      && parameter.name === 'Idempotency-Key'
      && parameter.required,
  );
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
    expect(API_SPEC).toHaveLength(120);
    expect(API_SPEC.filter((endpoint) => endpoint.agentProhibited !== true)).toHaveLength(102);
  });

  it('matches the canonical trends, credits, monitor, and X read catalog', () => {
    expect.assertions(16);
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
    expect(keys).toContain('GET /api/v1/x/account-connection-attempts/:id');
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

  it('documents complete safe tweet, media, and profile richness', () => {
    expect.assertions(6);
    const tweet = API_SPEC.find(
      (endpoint) =>
        endpoint.method === 'GET' && endpoint.path === '/api/v1/x/tweets/:id',
    );
    const search = API_SPEC.find(
      (endpoint) =>
        endpoint.method === 'GET' &&
        endpoint.path === '/api/v1/x/tweets/search',
    );
    const user = API_SPEC.find(
      (endpoint) =>
        endpoint.method === 'GET' && endpoint.path === '/api/v1/x/users/:id',
    );
    const allFields = [
      ...TWEET_RESPONSE_FIELDS,
      ...MEDIA_RESPONSE_FIELDS,
      ...USER_RESPONSE_FIELDS,
    ];

    expect(
      allFields.filter((field) => !tweet?.responseShape?.includes(field)),
    ).toStrictEqual([]);
    expect(
      allFields.filter((field) => !search?.responseShape?.includes(field)),
    ).toStrictEqual([]);
    expect(
      USER_RESPONSE_FIELDS.filter(
        (field) => !user?.responseShape?.includes(field),
      ),
    ).toStrictEqual([]);
    expect(tweet?.responseShape).not.toContain('...');
    expect(
      [tweet?.responseShape, search?.responseShape, user?.responseShape].join(
        ' ',
      ),
    ).not.toMatch(
      /\b(?:bookmarked|canDm|canMediaTag|favorited|followRequestSent|notificationsEnabled|quickPromoteEligibility|retweeted|superFollowedBy|superFollowing|viewerBlockedBy|viewerBlocking|viewerFollowedBy|viewerFollowing|viewerLiveFollowing|viewerMuting)\b/u,
    );
    expect(MEDIA_RESPONSE_FIELDS).toContain('otherSensitiveContent');
  });

  it('documents current community and user batch filters', () => {
    expect.assertions(2);
    const endpoint = (path: string) => API_SPEC.find((entry) => entry.method === 'GET' && entry.path === path);
    const parameterNames = (path: string) => endpoint(path)?.parameters.map((parameter) => parameter.name);
    expect(parameterNames('/api/v1/x/communities/:id/tweets')).toEqual(expect.arrayContaining([
      'language', 'sinceDate', 'untilDate', 'mediaType', 'minFaves', 'minRetweets', 'minReplies', 'minViews', 'verifiedOnly',
    ]));
    expect(parameterNames('/api/v1/x/users/batch')).toEqual(expect.arrayContaining([
      'minFollowers', 'maxFollowers', 'minAccountAgeDays', 'verifiedOnly',
    ]));
  });

  it('parameters have required fields when present', () => {
    expect.assertions(1);
    const allParameters = API_SPEC.flatMap((endpoint) => endpoint.parameters);
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

  it('rejects corrupt generated contract data', () => {
    expect.assertions(2);
    const endpoint = API_SPEC[0] ?? {
      category: 'test', free: true, method: 'GET', path: '/api/v1/test', summary: 'Test',
    };
    expect(() => mergeGeneratedContract(endpoint, undefined)).toThrow('Missing generated contract');
    expect(() => mergeGeneratedContract(endpoint, {
      parameters: [{ description: 'Invalid', in: 99, name: 'invalid', required: false, type: 'string' }],
      responseFields: '',
    })).toThrow('Invalid parameter location');
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
      for (const parameter of endpoint.parameters) {
        parameterNames.push(parameter.name);
      }
    }

    expect(endpointKeys).not.toContain('POST /api/v1/x/accounts');
    expect(endpointKeys).not.toContain('POST /api/v1/x/accounts/:id/reauth');
    expect(parameterNames).not.toContain('password');
    expect(parameterNames).not.toContain('totp_secret');
  });
});
