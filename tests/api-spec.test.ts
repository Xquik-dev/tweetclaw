// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import contract from '../generated-api-contract.json' with { type: 'json' };
import { API_SPEC, loadApiContract } from '../src/api-spec.js';
import type { StoredContract } from '../src/api-spec.js';

const MEDIA_RESPONSE_FIELDS =
  'mediaUrl type url allowDownload altText aspectRatio availabilityStatus displayUrl durationMillis expandedUrl faceRects focusRects height id indices mediaKey monetizable otherSensitiveContent sizes videoVariants width'.split(' ');

const USER_RESPONSE_FIELDS = [
  ...'id username name description followers following verified isBlueVerified isVerified profilePicture coverPicture profileBannerUrl location createdAt statusesCount mediaCount protected url favouritesCount hasCustomTimelines isTranslator withheldInCountries possiblySensitive pinnedTweetIds isAutomated automatedBy unavailable unavailableReason verifiedType affiliatesHighlightedLabel businessAccountAffiliatesCount creatorSubscriptionsCount hasGraduatedAccess'.split(' '),
  ['hasHiddenSubscriptions', 'OnProfile'].join(''),
  ...'highlightsInfo identityVerification isProfileTranslatable parodyCommentaryFanLabel profileDescriptionLanguage profileImageShape profileInterstitialType profileSortEnabled profileTranslatorType superFollowEligible communityRole profile_bio'.split(' '),
];

const TWEET_RESPONSE_FIELDS =
  'id text createdAt isNoteTweet isReply isLimitedReply isQuoteStatus conversationId source type url lang inReplyToId inReplyToUserId inReplyToUsername displayTextRange contentDisclosure article card communityNote edit isTranslatable noteTweet place possiblySensitive previousCounts viewState entities quoted_tweet retweeted_tweet retweetCount replyCount likeCount quoteCount viewCount bookmarkCount'.split(' ');

const CORRUPT_BASE: StoredContract = {
  approvalFreeReads: [],
  blockedOperations: [],
  operations: [{
    category: 'test', free: true, method: 'GET', parameters: [0], path: '/api/v1/test', responseShape: 0, summary: 'Test',
  }],
  parameters: [{ description: 'Valid', in: 'query', name: 'valid', required: false, type: 'string' }],
  responseShapes: ['{ ok }'],
  sessionOnlyOperations: [],
};

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

  it('matches the counts the generator took from the spec', () => {
    expect.assertions(3);
    const { agentProhibited, cataloged, callable } = contract.counts;
    expect(API_SPEC).toHaveLength(cataloged);
    expect(API_SPEC.filter((endpoint) => endpoint.agentProhibited !== true)).toHaveLength(callable);
    expect(cataloged - callable).toBe(agentProhibited);
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
    expect([...categories].toSorted()).toStrictEqual([
      'account',
      'analysis',
      'composition',
      'credits',
      'extraction',
      'media',
      'monitoring',
      'support',
      'twitter',
      'x-accounts',
      'x-write',
    ]);
  });

  it('matches the canonical compose union contract', () => {
    expect.assertions(3);
    const compose = API_SPEC.find(
      (endpoint) => endpoint.method === 'POST' && endpoint.path === '/api/v1/compose',
    );
    const parameters = compose?.parameters ?? [];

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
        'GET /api/v1/x/broadcasts/:id',
        'GET /api/v1/x/communities/:id/info',
        'GET /api/v1/x/followers/check',
        'GET /api/v1/x/lists/:id',
        'GET /api/v1/x/spaces/:id',
        'GET /api/v1/x/spaces/:id/replay',
        'GET /api/v1/x/trends',
        'GET /api/v1/x/tweets/:id',
        'GET /api/v1/x/tweets/:id/embed',
        'GET /api/v1/x/tweets/:id/translation',
        'GET /api/v1/x/users/:id',
      ].sort(),
    );
    expect(mppEntries.every(([, mpp]) => mpp?.intent === 'charge')).toBe(true);
    expect(mppEntries.every(([, mpp]) => /^\$\d+\.\d+\/call$/u.test(mpp?.price ?? ''))).toBe(true);
    expect(mppKeys).not.toContain('POST /api/v1/x/media/download');
    expect(mediaDownload?.mpp).toBeUndefined();
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
      allFields.filter((field) => !tweet?.responseShape.includes(field)),
    ).toStrictEqual([]);
    expect(
      allFields.filter((field) => !search?.responseShape.includes(field)),
    ).toStrictEqual([]);
    expect(
      USER_RESPONSE_FIELDS.filter(
        (field) => !user?.responseShape.includes(field),
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
      'language', 'sinceDate', 'untilDate', 'mediaType', 'minLikes', 'minRetweets', 'minReplies', 'minViews', 'verifiedOnly',
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
    expect.assertions(4);
    const [operation] = CORRUPT_BASE.operations;
    const withOperation = (change: Partial<StoredContract['operations'][number]>): StoredContract => ({
      ...CORRUPT_BASE,
      operations: operation === undefined ? [] : [{ ...operation, ...change }],
    });
    expect(loadApiContract(CORRUPT_BASE).endpoints).toHaveLength(1);
    expect(() => loadApiContract(withOperation({ parameters: [1] })))
      .toThrow('Missing generated contract for GET /api/v1/test');
    expect(() => loadApiContract(withOperation({ responseShape: 1 })))
      .toThrow('Missing generated contract for GET /api/v1/test');
    expect(() => loadApiContract({
      ...CORRUPT_BASE,
      parameters: [{ description: 'Invalid', in: 'cookie', name: 'invalid', required: false, type: 'string' }],
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
