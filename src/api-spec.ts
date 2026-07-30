// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import {
  RESPONSE_TWEET,
  RESPONSE_TWEET_BASIC,
  RESPONSE_TWEETS_PAGINATED,
  RESPONSE_USER,
  RESPONSE_USERS_PAGINATED,
} from './read-data-richness.js';
import type { EndpointInfo, EndpointParameter } from './types.js';

const RESPONSE_SUCCESS = '{ success: true }';
const DESCRIPTION_PAGINATION_CURSOR = 'Pagination cursor';
const DESCRIPTION_EXPORT_FORMAT = 'Export format (csv, json, md, md-document, pdf, txt, xlsx)';
const CATEGORY_X_ACCOUNTS = 'x-accounts';
const MPP_PRICE_CALL = '$0.00015/call';
const MPP_PRICE_FOLLOW_CHECK = '$0.00075/call';
const MPP_PRICE_TREND = '$0.00045/call';
const TWEET_FILTER_PARAMETER_COUNT = 25;
const WRITE_APPROVAL_NOTICE =
  'Requires one-time user approval after showing the exact target and payload.';

function writeSummary(action: string): string {
  return `${action}. ${WRITE_APPROVAL_NOTICE}`;
}

const PAGINATION_PARAMS: readonly EndpointParameter[] = [
  { description: 'Max items per page', in: 'query', name: 'limit', required: false, type: 'number' },
  { description: DESCRIPTION_PAGINATION_CURSOR, in: 'query', name: 'cursor', required: false, type: 'string' },
];

const EXTRACTION_SEARCH_PARAMS: readonly EndpointParameter[] = [
  { description: 'Filter tweets by author username (tweet_search_extractor)', in: 'body', name: 'fromUser', required: false, type: 'string' },
  { description: 'Filter tweets to a specific user (tweet_search_extractor)', in: 'body', name: 'toUser', required: false, type: 'string' },
  { description: 'Filter tweets mentioning a user (tweet_search_extractor)', in: 'body', name: 'mentioning', required: false, type: 'string' },
  { description: 'Language code filter, e.g. en, tr (tweet_search_extractor)', in: 'body', name: 'language', required: false, type: 'string' },
  { description: 'Start date YYYY-MM-DD (tweet_search_extractor)', in: 'body', name: 'sinceDate', required: false, type: 'string' },
  { description: 'End date YYYY-MM-DD (tweet_search_extractor)', in: 'body', name: 'untilDate', required: false, type: 'string' },
  { description: 'Filter by media type: images, videos, gifs, media, links, or none (tweet_search_extractor)', in: 'body', name: 'mediaType', required: false, type: 'string' },
  { description: 'Minimum likes threshold (tweet_search_extractor)', in: 'body', name: 'minFaves', required: false, type: 'number' },
  { description: 'Minimum retweets threshold (tweet_search_extractor)', in: 'body', name: 'minRetweets', required: false, type: 'number' },
  { description: 'Minimum replies threshold (tweet_search_extractor)', in: 'body', name: 'minReplies', required: false, type: 'number' },
  { description: 'Minimum quotes threshold (tweet_search_extractor)', in: 'body', name: 'minQuotes', required: false, type: 'number' },
  { description: 'Only verified authors (tweet_search_extractor)', in: 'body', name: 'verifiedOnly', required: false, type: 'boolean' },
  { description: 'Control reply inclusion (tweet_search_extractor): include, exclude, only', in: 'body', name: 'replies', required: false, type: 'string' },
  { description: 'Control retweet inclusion (tweet_search_extractor): include, exclude, only', in: 'body', name: 'retweets', required: false, type: 'string' },
  { description: 'Control quote inclusion (tweet_search_extractor): include, exclude, only', in: 'body', name: 'quotes', required: false, type: 'string' },
  { description: 'Exact phrase match (tweet_search_extractor)', in: 'body', name: 'exactPhrase', required: false, type: 'string' },
  { description: 'Words or phrases to exclude (tweet_search_extractor)', in: 'body', name: 'excludeWords', required: false, type: 'string' },
  { description: 'Words or phrases where any can match (tweet_search_extractor)', in: 'body', name: 'anyWords', required: false, type: 'string' },
  { description: 'Hashtags to match (tweet_search_extractor)', in: 'body', name: 'hashtags', required: false, type: 'string' },
  { description: 'Cashtags to match (tweet_search_extractor)', in: 'body', name: 'cashtags', required: false, type: 'string' },
  { description: 'URL substring or domain (tweet_search_extractor)', in: 'body', name: 'url', required: false, type: 'string' },
  { description: 'Conversation ID (tweet_search_extractor)', in: 'body', name: 'conversationId', required: false, type: 'string' },
  { description: 'Parent tweet ID (tweet_search_extractor)', in: 'body', name: 'inReplyToTweetId', required: false, type: 'string' },
  { description: 'Quoted tweet ID (tweet_search_extractor)', in: 'body', name: 'quotesOfTweetId', required: false, type: 'string' },
  { description: 'Retweeted tweet ID (tweet_search_extractor)', in: 'body', name: 'retweetsOfTweetId', required: false, type: 'string' },
  { description: 'List ID (tweet_search_extractor)', in: 'body', name: 'listId', required: false, type: 'string' },
  { description: 'Place ID (tweet_search_extractor)', in: 'body', name: 'place', required: false, type: 'string' },
  { description: 'Country code (tweet_search_extractor)', in: 'body', name: 'placeCountry', required: false, type: 'string' },
  { description: 'Geo point and radius (tweet_search_extractor)', in: 'body', name: 'pointRadius', required: false, type: 'string' },
  { description: 'Geo bounding box (tweet_search_extractor)', in: 'body', name: 'boundingBox', required: false, type: 'string' },
  { description: 'Raw X search operators (tweet_search_extractor)', in: 'body', name: 'advancedQuery', required: false, type: 'string' },
];

function asQueryParameters(
  parameters: readonly EndpointParameter[],
): readonly EndpointParameter[] {
  return parameters.map((parameter) => ({
    ...parameter,
    description: parameter.description.replace(' (tweet_search_extractor)', ''),
    in: 'query',
  }));
}

const TWEET_FILTER_QUERY_PARAMS = asQueryParameters(
  EXTRACTION_SEARCH_PARAMS.slice(0, TWEET_FILTER_PARAMETER_COUNT),
);
const TWEET_SEARCH_QUERY_PARAMS = asQueryParameters(EXTRACTION_SEARCH_PARAMS);

const EXTRACTION_TARGET_PARAMS: readonly EndpointParameter[] = [
  { description: 'Target X username', in: 'body', name: 'targetUsername', required: false, type: 'string' },
  { description: 'Target tweet ID', in: 'body', name: 'targetTweetId', required: false, type: 'string' },
  { description: 'Search query for search tools', in: 'body', name: 'searchQuery', required: false, type: 'string' },
  { description: 'Community ID for community tools', in: 'body', name: 'targetCommunityId', required: false, type: 'string' },
  { description: 'List ID for list tools', in: 'body', name: 'targetListId', required: false, type: 'string' },
  { description: 'Space ID for space_explorer', in: 'body', name: 'targetSpaceId', required: false, type: 'string' },
  { description: 'Max results to return', in: 'body', name: 'resultsLimit', required: false, type: 'number' },
  ...EXTRACTION_SEARCH_PARAMS,
];

const TREND_PARAMS: readonly EndpointParameter[] = [
  { description: 'WOEID location ID (1 for worldwide)', in: 'query', name: 'woeid', required: false, type: 'number' },
  { description: 'Max number of trends', in: 'query', name: 'count', required: false, type: 'number' },
];

const PARAM_STYLE_ID: EndpointParameter =
  { description: 'Style profile ID or X username', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_EXPORT_FORMAT: EndpointParameter =
  { description: DESCRIPTION_EXPORT_FORMAT, in: 'query', name: 'format', required: true, type: 'string' };

const PARAM_DRAW_ID: EndpointParameter =
  { description: 'Draw public ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_EXTRACTION_ID: EndpointParameter =
  { description: 'Extraction public ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_X_ACCOUNT: EndpointParameter =
  { description: 'X account (@username or account ID)', in: 'body', name: 'account', required: true, type: 'string' };

const PARAM_X_ACCOUNT_ID: EndpointParameter =
  { description: 'X account ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_X_ACCOUNT_CONNECTION_ATTEMPT_ID: EndpointParameter =
  { description: 'X account connection attempt ID', in: 'path', name: 'id', required: true, type: 'string' };

const TWEET_EVENT_TYPES =
  'tweet.new, tweet.reply, tweet.retweet, tweet.quote, tweet.media, tweet.link, tweet.poll, tweet.mention, tweet.hashtag, tweet.longform';
const PROFILE_EVENT_TYPES =
  'profile.avatar.changed, profile.banner.changed, profile.name.changed, profile.username.changed, profile.bio.changed, profile.location.changed, profile.url.changed, profile.verified.changed, profile.protected.changed, profile.pinned_tweet.changed, profile.unavailable.changed';
const ALL_EVENT_TYPES = `${TWEET_EVENT_TYPES}, ${PROFILE_EVENT_TYPES}`;

const PARAM_EVENT_TYPES_REQUIRED: EndpointParameter =
  { description: `Event types: ${ALL_EVENT_TYPES}`, in: 'body', name: 'eventTypes', required: true, type: 'string[]' };

const PARAM_EVENT_TYPES_OPTIONAL: EndpointParameter =
  { description: `Updated event types: ${ALL_EVENT_TYPES}`, in: 'body', name: 'eventTypes', required: false, type: 'string[]' };

const PARAM_TWEET_EVENT_TYPES_REQUIRED: EndpointParameter =
  { description: `Tweet event types: ${TWEET_EVENT_TYPES}`, in: 'body', name: 'eventTypes', required: true, type: 'string[]' };

const PARAM_TWEET_EVENT_TYPES_OPTIONAL: EndpointParameter =
  { description: `Updated tweet event types: ${TWEET_EVENT_TYPES}`, in: 'body', name: 'eventTypes', required: false, type: 'string[]' };

const PARAM_MONITOR_ID: EndpointParameter =
  { description: 'Monitor ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_WEBHOOK_ID: EndpointParameter =
  { description: 'Webhook ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_TWEET_ID: EndpointParameter =
  { description: 'Tweet ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_COMMUNITY_ID: EndpointParameter =
  { description: 'Community ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_WRITE_IDEMPOTENCY_KEY: EndpointParameter =
  { description: 'Unique key for this write. Reuse only for an identical retry.', in: 'header', name: 'Idempotency-Key', required: true, type: 'string' };

const PARAMS_TWEET_ACTION: readonly EndpointParameter[] = [
  PARAM_WRITE_IDEMPOTENCY_KEY,
  PARAM_TWEET_ID,
  PARAM_X_ACCOUNT,
];
const PARAMS_COMMUNITY_ACTION: readonly EndpointParameter[] = [
  PARAM_WRITE_IDEMPOTENCY_KEY,
  PARAM_COMMUNITY_ID,
  PARAM_X_ACCOUNT,
];

const PARAM_USER_ID_FOLLOW: EndpointParameter =
  { description: 'User ID to follow', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_USER_ID_UNFOLLOW: EndpointParameter =
  { description: 'User ID to unfollow', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_USER_ID_REMOVE_FOLLOWER: EndpointParameter =
  { description: 'User ID to remove from your followers', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_MEDIA_URL: EndpointParameter =
  { description: 'Public HTTPS media URL', in: 'body', name: 'url', required: true, type: 'string' };

const PARAM_KEYWORD_MONITOR_ID: EndpointParameter =
  { description: 'Keyword monitor ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_CURSOR: EndpointParameter =
  { description: 'Pagination cursor from previous response', in: 'query', name: 'cursor', required: false, type: 'string' };

const PARAM_AFTER_ALIAS: EndpointParameter =
  { description: 'Legacy cursor alias. Prefer cursor.', in: 'query', name: 'after', required: false, type: 'string' };

const PARAM_PAGE_SIZE_20: EndpointParameter =
  { description: 'Upper bound for items per page (1-100, default 20)', in: 'query', name: 'pageSize', required: false, type: 'number' };

const PARAM_PAGE_SIZE_200: EndpointParameter =
  { description: 'Upper bound for items per page (20-200, default 200)', in: 'query', name: 'pageSize', required: false, type: 'number' };

const PARAM_LIMIT_ALIAS: EndpointParameter =
  { description: 'Legacy page size upper-bound alias. Prefer pageSize.', in: 'query', name: 'limit', required: false, type: 'number' };

const PARAM_QUERY_TYPE: EndpointParameter =
  { description: 'Sort order: Latest or Top', in: 'query', name: 'queryType', required: false, type: 'string' };

const PARAM_SEARCH_QUERY: EndpointParameter =
  { description: 'Search query', in: 'query', name: 'q', required: true, type: 'string' };

const COMMUNITY_SEARCH_PARAMS: readonly EndpointParameter[] = [
  { description: 'Community ID', in: 'query', name: 'communityId', required: true, type: 'string' },
  PARAM_SEARCH_QUERY,
  PARAM_QUERY_TYPE,
  PARAM_CURSOR,
  PARAM_PAGE_SIZE_20,
];

const PARAM_SINCE_TIME: EndpointParameter =
  { description: 'Filter results since this Unix timestamp in seconds', in: 'query', name: 'sinceTime', required: false, type: 'number' };

const PARAM_UNTIL_TIME: EndpointParameter =
  { description: 'Filter results until this Unix timestamp in seconds', in: 'query', name: 'untilTime', required: false, type: 'number' };

const PARAM_USER_ID: EndpointParameter =
  { description: 'User ID or username', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_LIST_ID: EndpointParameter =
  { description: 'List ID', in: 'path', name: 'id', required: true, type: 'string' };

const RESPONSE_WRITE_ACTION =
  '{ object: "x_write_action", id, writeActionId, action, status, terminal, retryable, safeToRetry, statusUrl, pollAfterMs, charged, chargedCredits, billing, request, account, target, targetId, result, nextAction, sendDispatched, success }';
const CATEGORY_SUPPORT = 'support';
const CATEGORY_X_WRITE = 'x-write';

const PARAM_TICKET_ID: EndpointParameter =
  { description: 'Ticket public ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_SUPPORT_IDEMPOTENCY_KEY: EndpointParameter =
  { description: 'Optional retry key for identical support submissions', in: 'header', name: 'Idempotency-Key', required: false, type: 'string' };

const API_SPEC: readonly EndpointInfo[] = [
  // --- Account ---
  {
    category: 'account',
    free: true,
    method: 'GET',
    path: '/api/v1/account',
    responseShape: '{ plan, monitorsUsed, monitorsAllowed, monitorBilling, creditInfo?, xUsername? }',
    summary: 'Get current account info and subscription status',
  },
  {
    agentProhibited: true,
    category: 'account',
    free: true,
    method: 'PATCH',
    parameters: [
      { description: 'Locale code (en, tr, es)', in: 'body', name: 'locale', required: true, type: 'string' },
    ],
    path: '/api/v1/account',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Update account settings such as locale',
  },
  {
    agentProhibited: true,
    category: 'account',
    free: true,
    method: 'PUT',
    parameters: [
      { description: 'X username without @', in: 'body', name: 'username', required: true, type: 'string' },
    ],
    path: '/api/v1/account/x-identity',
    responseShape: '{ success: true, xUsername }',
    summary: 'Set or update linked X username',
  },
  {
    agentProhibited: true,
    category: 'account',
    free: true,
    method: 'GET',
    path: '/api/v1/api-keys',
    responseShape: '{ keys: [{ id, name, prefix, isActive, createdAt, lastUsedAt? }] }',
    summary: 'List all API keys for the account',
  },
  {
    agentProhibited: true,
    category: 'account',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Display name for the key', in: 'body', name: 'name', required: false, type: 'string' },
    ],
    path: '/api/v1/api-keys',
    responseShape: '{ id, name, prefix, fullKey, createdAt }',
    summary: 'Create a new API key',
  },
  {
    agentProhibited: true,
    category: 'account',
    free: true,
    method: 'DELETE',
    parameters: [
      { description: 'API key ID to revoke', in: 'path', name: 'id', required: true, type: 'string' },
    ],
    path: '/api/v1/api-keys/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Revoke an API key by ID',
  },
  {
    agentProhibited: true,
    category: 'account',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Subscription tier to preselect', in: 'body', name: 'tier', required: false, type: 'string' },
    ],
    path: '/api/v1/subscribe',
    responseShape: '{ url, status, message }',
    summary: 'Get checkout or billing portal URL',
  },

  // --- Composition ---
  {
    category: 'composition',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Workflow step: compose, refine, or score', in: 'body', name: 'step', required: true, type: 'string' },
      { description: 'Tweet topic (compose, refine)', in: 'body', name: 'topic', required: false, type: 'string' },
      { description: 'Optimization goal: engagement, followers, authority, conversation', in: 'body', name: 'goal', required: false, type: 'string' },
      { description: 'Tweet draft text to evaluate (score)', in: 'body', name: 'draft', required: false, type: 'string' },
      { description: 'Desired tone for the tweet (refine)', in: 'body', name: 'tone', required: false, type: 'string' },
      { description: 'Cached style username for voice matching (compose)', in: 'body', name: 'styleUsername', required: false, type: 'string' },
      { description: 'Extra context or URLs (refine)', in: 'body', name: 'additionalContext', required: false, type: 'string' },
      { description: 'Desired call to action (refine)', in: 'body', name: 'callToAction', required: false, type: 'string' },
      { description: 'Media type: photo, video, none (refine)', in: 'body', name: 'mediaType', required: false, type: 'string' },
      { description: 'Whether a link is attached (score)', in: 'body', name: 'hasLink', required: false, type: 'boolean' },
      { description: 'Whether media is attached (score)', in: 'body', name: 'hasMedia', required: false, type: 'boolean' },
    ],
    path: '/api/v1/compose',
    responseShape:
      '{ nextStep, intentUrl?, contentRules?, engagementMultipliers?, engagementVelocity?, followUpQuestions?, radarRecommendations?, scorerWeights?, source?, topPenalties?, savedStyles?, styleTweets?, styleNote?, compositionGuidance?, examplePatterns?, checklist?, passed?, passedCount?, topSuggestion?, totalChecks? }',
    summary: 'Build, refine, or check a post draft',
  },
  {
    category: 'composition',
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Max items to return', in: 'query', name: 'limit', required: false, type: 'number' },
      { description: 'Cursor for pagination', in: 'query', name: 'afterCursor', required: false, type: 'string' },
    ],
    path: '/api/v1/drafts',
    responseShape: '{ drafts: [{ id, text, topic?, goal?, createdAt }], hasMore, nextCursor? }',
    summary: 'List saved tweet drafts with pagination',
  },
  {
    category: 'composition',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Draft tweet text', in: 'body', name: 'text', required: true, type: 'string' },
      { description: 'Tweet topic', in: 'body', name: 'topic', required: false, type: 'string' },
      { description: 'Optimization goal: engagement, followers, authority, conversation', in: 'body', name: 'goal', required: false, type: 'string' },
    ],
    path: '/api/v1/drafts',
    responseShape: '{ id, text, topic?, goal?, createdAt, updatedAt }',
    summary: 'Save a new tweet draft',
  },
  {
    category: 'composition',
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Draft ID', in: 'path', name: 'id', required: true, type: 'string' },
    ],
    path: '/api/v1/drafts/:id',
    responseShape: '{ id, text, topic?, goal?, createdAt, updatedAt }',
    summary: 'Get a single draft by ID',
  },
  {
    category: 'composition',
    free: true,
    method: 'DELETE',
    parameters: [
      { description: 'Draft ID to delete', in: 'path', name: 'id', required: true, type: 'string' },
    ],
    path: '/api/v1/drafts/:id',
    responseShape: '204 No Content',
    summary: 'Delete a draft by ID',
  },
  {
    category: 'composition',
    free: true,
    method: 'GET',
    path: '/api/v1/styles',
    responseShape: '{ styles: [{ xUsername, tweetCount, isOwnAccount, fetchedAt }] }',
    summary: 'List all cached writing style profiles',
  },
  {
    category: 'composition',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'X username to analyze', in: 'body', name: 'username', required: true, type: 'string' },
    ],
    path: '/api/v1/styles',
    responseShape: '{ xUsername, tweetCount, isOwnAccount, fetchedAt, tweets }',
    summary: 'Analyze and cache a writing style from recent tweets',
  },
  {
    category: 'composition',
    free: true,
    method: 'GET',
    parameters: [PARAM_STYLE_ID],
    path: '/api/v1/styles/:id',
    responseShape: '{ xUsername, tweetCount, isOwnAccount, fetchedAt, tweets }',
    summary: 'Get a cached style profile by username',
  },
  {
    category: 'composition',
    free: true,
    method: 'PUT',
    parameters: [
      PARAM_STYLE_ID,
      { description: 'Display label for the style', in: 'body', name: 'label', required: true, type: 'string' },
      { description: 'Array of tweet objects with text field', in: 'body', name: 'tweets', required: true, type: 'array' },
    ],
    path: '/api/v1/styles/:id',
    responseShape: '{ xUsername, tweetCount, isOwnAccount, fetchedAt, tweets }',
    summary: 'Create or update a style profile with custom tweets',
  },
  {
    category: 'composition',
    free: true,
    method: 'DELETE',
    parameters: [
      PARAM_STYLE_ID,
    ],
    path: '/api/v1/styles/:id',
    responseShape: '204 No Content',
    summary: 'Delete a cached style profile',
  },
  {
    category: 'composition',
    free: false,
    method: 'GET',
    parameters: [PARAM_STYLE_ID],
    path: '/api/v1/styles/:id/performance',
    responseShape: '{ xUsername, tweetCount, tweets: [{ id, text, likeCount, retweetCount, ... }] }',
    summary: 'Get engagement metrics for cached style tweets',
  },
  {
    category: 'composition',
    free: true,
    method: 'GET',
    parameters: [
      { description: 'First username to compare', in: 'query', name: 'username1', required: true, type: 'string' },
      { description: 'Second username to compare', in: 'query', name: 'username2', required: true, type: 'string' },
    ],
    path: '/api/v1/styles/compare',
    responseShape: '{ style1: { xUsername, tweets, ... }, style2: { xUsername, tweets, ... } }',
    summary: 'Compare two cached writing style profiles',
  },
  {
    category: 'composition',
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Filter by category (general, tech, dev, etc.)', in: 'query', name: 'category', required: false, type: 'string' },
      { description: 'Max items to return (1-100, default 50)', in: 'query', name: 'limit', required: false, type: 'number' },
      { description: 'Lookback window in hours (1-72, default 6)', in: 'query', name: 'hours', required: false, type: 'number' },
      { description: 'Region filter (US, GB, TR, ES, DE, FR, JP, IN, BR, CA, MX, global)', in: 'query', name: 'region', required: false, type: 'string' },
      { description: 'Source filter (github, google_trends, hacker_news, polymarket, reddit, trustmrr, wikipedia)', in: 'query', name: 'source', required: false, type: 'string' },
      { description: DESCRIPTION_PAGINATION_CURSOR, in: 'query', name: 'after', required: false, type: 'string' },
    ],
    path: '/api/v1/radar',
    responseShape: '{ items: [{ title, url?, score, category, source, region, publishedAt }], hasMore, nextCursor? }',
    summary: 'Get trending topics from curated radar sources',
  },

  // --- Extraction ---
  {
    category: 'extraction',
    free: true,
    method: 'GET',
    parameters: [...PAGINATION_PARAMS],
    path: '/api/v1/draws',
    responseShape: '{ draws: [{ id, tweetUrl, status, totalEntries, validEntries, createdAt }], hasMore, nextCursor? }',
    summary: 'List giveaway draws with pagination',
  },
  {
    category: 'extraction',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'URL of the giveaway tweet', in: 'body', name: 'tweetUrl', required: true, type: 'string' },
      { description: 'Number of winners to pick', in: 'body', name: 'winnerCount', required: false, type: 'number' },
      { description: 'Number of backup winners', in: 'body', name: 'backupCount', required: false, type: 'number' },
      { description: 'Allow one entry per author', in: 'body', name: 'uniqueAuthorsOnly', required: false, type: 'boolean' },
      { description: 'Require a retweet', in: 'body', name: 'mustRetweet', required: false, type: 'boolean' },
      { description: 'Required followed username', in: 'body', name: 'mustFollowUsername', required: false, type: 'string' },
      { description: 'Minimum follower count', in: 'body', name: 'filterMinFollowers', required: false, type: 'number' },
      { description: 'Minimum account age in days', in: 'body', name: 'filterAccountAgeDays', required: false, type: 'number' },
      { description: 'Required language code', in: 'body', name: 'filterLanguage', required: false, type: 'string' },
      { description: 'Required hashtags', in: 'body', name: 'requiredHashtags', required: false, type: 'string[]' },
      { description: 'Required keywords', in: 'body', name: 'requiredKeywords', required: false, type: 'string[]' },
      { description: 'Required mentions', in: 'body', name: 'requiredMentions', required: false, type: 'string[]' },
    ],
    path: '/api/v1/draws',
    responseShape: '{ id, tweetId, totalEntries, validEntries, winners: [{ position, authorUsername, tweetId, isBackup }] }',
    summary: 'Run a giveaway draw on a tweet',
  },
  {
    category: 'extraction',
    free: true,
    method: 'GET',
    parameters: [PARAM_DRAW_ID],
    path: '/api/v1/draws/:id',
    responseShape: '{ draw: { id, tweetUrl, tweetId, status, totalEntries, validEntries, ... }, winners }',
    summary: 'Get draw details and winners',
  },
  {
    category: 'extraction',
    free: true,
    method: 'GET',
    parameters: [
      PARAM_DRAW_ID,
      PARAM_EXPORT_FORMAT,
      { description: 'Export winners or all entries', in: 'query', name: 'type', required: false, type: 'string' },
    ],
    path: '/api/v1/draws/:id/export',
    responseShape: 'CSV, XLSX, or Markdown file download',
    summary: 'Export draw results as CSV, XLSX, or Markdown',
  },
  {
    category: 'extraction',
    free: true,
    method: 'GET',
    parameters: [
      ...PAGINATION_PARAMS,
      { description: 'Filter by tool type', in: 'query', name: 'toolType', required: false, type: 'string' },
      { description: 'Filter by status (running, completed, failed)', in: 'query', name: 'status', required: false, type: 'string' },
    ],
    path: '/api/v1/extractions',
    responseShape: '{ extractions: [{ id, toolType, status, totalResults, createdAt }], hasMore, nextCursor? }',
    summary: 'List extraction jobs with pagination and filters',
  },
  {
    category: 'extraction',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'Extraction tool type (reply_extractor, community_extractor, etc.)', in: 'body', name: 'toolType', required: true, type: 'string' },
      ...EXTRACTION_TARGET_PARAMS,
    ],
    path: '/api/v1/extractions',
    responseShape: '{ id, toolType, status }',
    summary: 'Start a new extraction job',
  },
  {
    category: 'extraction',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'Extraction tool type', in: 'body', name: 'toolType', required: true, type: 'string' },
      ...EXTRACTION_TARGET_PARAMS,
    ],
    path: '/api/v1/extractions/estimate',
    responseShape: '{ estimatedResults, creditsRequired, creditsAvailable, allowed, source, resolvedXUserId? }',
    summary: 'Estimate extraction cost before running',
  },
  {
    category: 'extraction',
    free: true,
    method: 'GET',
    parameters: [
      PARAM_EXTRACTION_ID,
      { description: 'Max results per page', in: 'query', name: 'limit', required: false, type: 'number' },
      PARAM_CURSOR,
    ],
    path: '/api/v1/extractions/:id',
    responseShape: '{ job: { id, toolType, status, ... }, results: [...], hasMore, nextCursor? }',
    summary: 'Get extraction job details and results',
  },
  {
    category: 'extraction',
    free: true,
    method: 'GET',
    parameters: [PARAM_EXTRACTION_ID, PARAM_EXPORT_FORMAT],
    path: '/api/v1/extractions/:id/export',
    responseShape: 'CSV, XLSX, or Markdown file download',
    summary: 'Export extraction results as CSV, XLSX, or Markdown',
  },

  // --- Monitoring ---
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    path: '/api/v1/monitors',
    responseShape: '{ monitors: [{ id, username, xUserId, eventTypes, isActive, createdAt, nextBillingAt }], total }',
    summary: 'List all account monitors',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'X username to monitor without @', in: 'body', name: 'username', required: true, type: 'string' },
      PARAM_EVENT_TYPES_REQUIRED,
    ],
    path: '/api/v1/monitors',
    responseShape: '{ id, username, xUserId, eventTypes, isActive, createdAt, nextBillingAt }',
    summary: 'Create a new account monitor',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    parameters: [PARAM_MONITOR_ID],
    path: '/api/v1/monitors/:id',
    responseShape: '{ id, username, xUserId, eventTypes, isActive, createdAt, nextBillingAt }',
    summary: 'Get monitor details by ID',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_MONITOR_ID,
      { description: 'Set active or paused', in: 'body', name: 'isActive', required: false, type: 'boolean' },
      PARAM_EVENT_TYPES_OPTIONAL,
    ],
    path: '/api/v1/monitors/:id',
    responseShape: '{ id, username, xUserId, eventTypes, isActive, createdAt, nextBillingAt }',
    summary: 'Update monitor settings or toggle active state',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'DELETE',
    parameters: [PARAM_MONITOR_ID],
    path: '/api/v1/monitors/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Delete a monitor and stop tracking',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    path: '/api/v1/monitors/keywords',
    responseShape: '{ monitors: [{ id, query, eventTypes, isActive, createdAt, nextBillingAt }], total }',
    summary: 'List all keyword monitors',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'Keyword, phrase, or X search query to monitor', in: 'body', name: 'query', required: true, type: 'string' },
      PARAM_TWEET_EVENT_TYPES_REQUIRED,
    ],
    path: '/api/v1/monitors/keywords',
    responseShape: '{ id, query, eventTypes, isActive, createdAt, nextBillingAt }',
    summary: 'Create an instant keyword monitor. Confirm current usage pricing before activation.',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    parameters: [PARAM_KEYWORD_MONITOR_ID],
    path: '/api/v1/monitors/keywords/:id',
    responseShape: '{ id, query, eventTypes, isActive, createdAt, nextBillingAt }',
    summary: 'Get keyword monitor details by ID',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_KEYWORD_MONITOR_ID,
      { description: 'Set active or paused', in: 'body', name: 'isActive', required: false, type: 'boolean' },
      PARAM_TWEET_EVENT_TYPES_OPTIONAL,
    ],
    path: '/api/v1/monitors/keywords/:id',
    responseShape: '{ id, query, eventTypes, isActive, createdAt, nextBillingAt }',
    summary: 'Update keyword monitor settings or toggle active state',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'DELETE',
    parameters: [PARAM_KEYWORD_MONITOR_ID],
    path: '/api/v1/monitors/keywords/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Delete a keyword monitor and stop tracking',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    parameters: [
      ...PAGINATION_PARAMS,
      { description: 'Filter by monitor ID', in: 'query', name: 'monitorId', required: false, type: 'string' },
      { description: `Filter by event type: ${ALL_EVENT_TYPES}`, in: 'query', name: 'eventType', required: false, type: 'string' },
    ],
    path: '/api/v1/events',
    responseShape: '{ events: [{ id, type, username?, query?, monitorId, monitorType, keywordMonitorId?, occurredAt, data }], hasMore, nextCursor? }',
    summary: 'List stream events with filters and pagination',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Event ID', in: 'path', name: 'id', required: true, type: 'string' },
    ],
    path: '/api/v1/events/:id',
    responseShape: '{ id, type, username?, query?, monitorId, monitorType, keywordMonitorId?, occurredAt, data, xEventId? }',
    summary: 'Get a single event by ID',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    path: '/api/v1/webhooks',
    responseShape: '{ webhooks: [{ id, url, eventTypes, isActive, consecutiveFailures, deliveryStatus, failureHardCap, createdAt }] }',
    summary: 'List all webhook endpoints',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Webhook delivery URL', in: 'body', name: 'url', required: true, type: 'string' },
      PARAM_EVENT_TYPES_REQUIRED,
    ],
    path: '/api/v1/webhooks',
    responseShape: '{ id, url, eventTypes, secret, createdAt }',
    summary: 'Create a new webhook endpoint',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_WEBHOOK_ID,
      { description: 'Updated delivery URL', in: 'body', name: 'url', required: false, type: 'string' },
      PARAM_EVENT_TYPES_OPTIONAL,
      { description: 'Set active or inactive', in: 'body', name: 'isActive', required: false, type: 'boolean' },
    ],
    path: '/api/v1/webhooks/:id',
    responseShape: '{ id, url, eventTypes, isActive, consecutiveFailures, deliveryStatus, failureHardCap, createdAt }',
    summary: 'Update webhook URL, events, or active state',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'DELETE',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Deactivate a webhook endpoint',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'GET',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id/deliveries',
    responseShape: '{ deliveries: [{ id, streamEventId, status, attempts, createdAt, deliveredAt?, lastStatusCode?, lastError? }] }',
    summary: 'List recent deliveries for a webhook',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'POST',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id/test',
    responseShape: '{ success, statusCode, error? }',
    summary: 'Send a test event to a webhook endpoint',
  },
  {
    category: 'monitoring',
    free: true,
    method: 'POST',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id/resume',
    responseShape: '{ success, statusCode, webhook }',
    summary: 'Test and resume an inactive webhook',
  },

  // --- Twitter ---
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_TWEET_ID],
    mpp: { intent: 'charge', price: MPP_PRICE_CALL },
    path: '/api/v1/x/tweets/:id',
    responseShape: `{ tweet: ${RESPONSE_TWEET}, author?: ${RESPONSE_USER} }`,
    summary: 'Look up a single tweet with engagement metrics',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_SEARCH_QUERY,
      PARAM_QUERY_TYPE,
      PARAM_CURSOR,
      PARAM_SINCE_TIME,
      PARAM_UNTIL_TIME,
      { description: 'Max tweets to return (default 20, max 200)', in: 'query', name: 'limit', required: false, type: 'number' },
      ...TWEET_SEARCH_QUERY_PARAMS,
    ],
    path: '/api/v1/x/tweets/search',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Search tweets with filters and cursor pagination',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID],
    mpp: { intent: 'charge', price: MPP_PRICE_CALL },
    path: '/api/v1/x/users/:id',
    responseShape: RESPONSE_USER,
    summary: 'Get X user profile by username',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Source username', in: 'query', name: 'source', required: true, type: 'string' },
      { description: 'Target username', in: 'query', name: 'target', required: true, type: 'string' },
    ],
    mpp: { intent: 'charge', price: MPP_PRICE_FOLLOW_CHECK },
    path: '/api/v1/x/followers/check',
    responseShape: '{ isFollowing, isFollowedBy, sourceUsername, targetUsername }',
    summary: 'Check follow relationship between two users',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Tweet ID of the X Article', in: 'path', name: 'tweetId', required: true, type: 'string' },
    ],
    mpp: { intent: 'charge', price: MPP_PRICE_FOLLOW_CHECK },
    path: '/api/v1/x/articles/:tweetId',
    responseShape: `{ article: { title, previewText, coverImageUrl, contents, createdAt, likeCount, replyCount, quoteCount, viewCount }, author?: ${RESPONSE_USER} }`,
    summary: 'Get full content of an X Article (long-form post) by tweet ID',
  },

  // --- Media ---
  {
    category: 'media',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'Tweet URL or ID (single tweet)', in: 'body', name: 'tweetInput', required: false, type: 'string' },
      { description: 'Numeric tweet ID alias for tweetInput', in: 'body', name: 'tweetId', required: false, type: 'string' },
      { description: 'Tweet URL alias for tweetInput', in: 'body', name: 'tweetUrl', required: false, type: 'string' },
      { description: 'Array of tweet URLs or IDs (bulk, max 50)', in: 'body', name: 'tweetIds', required: false, type: 'string[]' },
    ],
    path: '/api/v1/x/media/download',
    responseShape: 'Single: { tweetId, galleryUrl, cacheHit }. Bulk: { galleryUrl, totalTweets, totalMedia }',
    summary: 'Download media from tweets with authenticated access only. Not MPP-eligible. Returns gallery URL.',
  },

  // --- Twitter (Trends) ---
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: TREND_PARAMS,
    mpp: { intent: 'charge', price: MPP_PRICE_TREND },
    path: '/api/v1/trends',
    responseShape: '{ trends: [{ name, query?, description?, rank? }], total, woeid }',
    summary: 'Get current trending topics on X',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: TREND_PARAMS,
    mpp: { intent: 'charge', price: MPP_PRICE_TREND },
    path: '/api/v1/x/trends',
    responseShape: '{ trends: [{ name, query?, description?, rank? }], count, woeid }',
    summary: 'Get X trending topics by region',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_TWEET_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/tweets/:id/favoriters',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get users who liked a tweet. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20, ...TWEET_FILTER_QUERY_PARAMS],
    path: '/api/v1/x/users/:id/likes',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get tweets liked by a user. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20, ...TWEET_FILTER_QUERY_PARAMS],
    path: '/api/v1/x/users/:id/media',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get media tweets by a user. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/users/:id/followers-you-know',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get followers you know for a user. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Optional bookmark folder ID', in: 'query', name: 'folderId', required: false, type: 'string' },
      PARAM_CURSOR,
    ],
    path: '/api/v1/x/bookmarks',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    sensitive: true,
    summary: 'Get bookmarked tweets. Requires explicit user request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [],
    path: '/api/v1/x/bookmarks/folders',
    responseShape: '{ folders: [{ id, name }], has_next_page, next_cursor }',
    sensitive: true,
    summary: 'Get bookmark folders. Requires explicit user request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Notification type filter: All, Verified, Mentions', in: 'query', name: 'type', required: false, type: 'string' },
      PARAM_CURSOR,
    ],
    path: '/api/v1/x/notifications',
    responseShape: '{ notifications: [{ id, type?, message?, timestamp? }], has_next_page, next_cursor }',
    sensitive: true,
    summary: 'Get notifications. Requires explicit user request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Comma-separated tweet IDs to exclude from results', in: 'query', name: 'seenTweetIds', required: false, type: 'string' },
      PARAM_CURSOR,
    ],
    path: '/api/v1/x/timeline',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    sensitive: true,
    summary: 'Get home timeline. Requires explicit user request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Target user ID', in: 'path', name: 'userId', required: true, type: 'string' },
      { description: 'Connected X account username without @', in: 'query', name: 'account', required: true, type: 'string' },
      PARAM_CURSOR,
      { description: 'Legacy pagination cursor', in: 'query', name: 'maxId', required: false, type: 'string' },
    ],
    path: '/api/v1/x/dm/:userId/history',
    responseShape: '{ messages: [{ id, text?, senderId, receiverId, createdAt?, mediaUrl? }], has_next_page, next_cursor }',
    sensitive: true,
    summary: 'Get DM conversation history. Requires explicit user request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_USER_ID,
      PARAM_CURSOR,
      PARAM_PAGE_SIZE_20,
      { description: 'Include replies (default false)', in: 'query', name: 'includeReplies', required: false, type: 'boolean' },
      { description: 'Include parent tweet for replies (default false)', in: 'query', name: 'includeParentTweet', required: false, type: 'boolean' },
      ...TWEET_FILTER_QUERY_PARAMS,
    ],
    path: '/api/v1/x/users/:id/tweets',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get latest tweets by a user. Preferred over search for user timelines.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_USER_ID,
      PARAM_CURSOR,
      PARAM_PAGE_SIZE_20,
      { description: 'Include each reply parent tweet', in: 'query', name: 'includeParentTweet', required: false, type: 'boolean' },
      ...TWEET_FILTER_QUERY_PARAMS,
    ],
    path: '/api/v1/x/users/:id/replies',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get a user timeline with replies',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_COMMUNITY_ID],
    mpp: { intent: 'charge', price: MPP_PRICE_CALL },
    path: '/api/v1/x/communities/:id/info',
    responseShape: '{ community: { id, name?, description?, member_count?, moderator_count?, created_at?, banner_url?, join_policy?, rules? } }',
    summary: 'Get community details.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_COMMUNITY_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/communities/:id/members',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get community members. Use cursor for pagination.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_COMMUNITY_ID, PARAM_CURSOR],
    path: '/api/v1/x/communities/:id/moderators',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get community moderators. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_COMMUNITY_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/communities/:id/tweets',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get community tweets. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: COMMUNITY_SEARCH_PARAMS,
    path: '/api/v1/x/communities/search',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Search tweets within a community.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: COMMUNITY_SEARCH_PARAMS,
    path: '/api/v1/x/communities/tweets',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get matching tweets from a community.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_LIST_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/lists/:id/followers',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get list followers.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_LIST_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/lists/:id/members',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get list members.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_LIST_ID,
      PARAM_CURSOR,
      PARAM_PAGE_SIZE_20,
      PARAM_SINCE_TIME,
      PARAM_UNTIL_TIME,
      { description: 'Include replies (default false)', in: 'query', name: 'includeReplies', required: false, type: 'boolean' },
    ],
    path: '/api/v1/x/lists/:id/tweets',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get list tweets. Returns about 20 per page.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Comma-separated tweet IDs (max 100)', in: 'query', name: 'ids', required: true, type: 'string' },
    ],
    path: '/api/v1/x/tweets',
    responseShape: `{ tweets: [${RESPONSE_TWEET_BASIC}], has_next_page, next_cursor }`,
    summary: 'Get multiple tweets by IDs. Max 100 IDs per request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_TWEET_ID,
      PARAM_CURSOR,
      PARAM_PAGE_SIZE_20,
      PARAM_SINCE_TIME,
      PARAM_UNTIL_TIME,
      { description: 'Include replies (default true)', in: 'query', name: 'includeReplies', required: false, type: 'boolean' },
      ...TWEET_FILTER_QUERY_PARAMS,
    ],
    path: '/api/v1/x/tweets/:id/quotes',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get quote tweets of a tweet.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_TWEET_ID,
      PARAM_CURSOR,
      PARAM_PAGE_SIZE_20,
      PARAM_SINCE_TIME,
      PARAM_UNTIL_TIME,
      ...TWEET_FILTER_QUERY_PARAMS,
    ],
    path: '/api/v1/x/tweets/:id/replies',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get replies to a tweet.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_TWEET_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/tweets/:id/retweeters',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get users who retweeted a tweet.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_TWEET_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/tweets/:id/thread',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get thread context for a tweet.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Comma-separated user IDs (max 100)', in: 'query', name: 'ids', required: true, type: 'string' },
    ],
    path: '/api/v1/x/users/batch',
    responseShape: `{ users: [${RESPONSE_USER}], has_next_page, next_cursor, processed_count, requested_count, returned_count, unavailable_ids, unprocessed_ids }`,
    summary: 'Get multiple users by IDs. Max 100 IDs per request.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_SEARCH_QUERY, PARAM_CURSOR],
    path: '/api/v1/x/users/search',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Search users by name or username.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID, PARAM_CURSOR, PARAM_AFTER_ALIAS, PARAM_PAGE_SIZE_200, PARAM_LIMIT_ALIAS],
    path: '/api/v1/x/users/:id/followers',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get user followers. Use cursor for pagination.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID, PARAM_CURSOR, PARAM_AFTER_ALIAS, PARAM_PAGE_SIZE_200, PARAM_LIMIT_ALIAS],
    path: '/api/v1/x/users/:id/following',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get users this user follows. Use cursor for pagination.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_USER_ID,
      PARAM_CURSOR,
      PARAM_PAGE_SIZE_20,
      PARAM_SINCE_TIME,
      PARAM_UNTIL_TIME,
      ...TWEET_FILTER_QUERY_PARAMS,
    ],
    path: '/api/v1/x/users/:id/mentions',
    responseShape: RESPONSE_TWEETS_PAGINATED,
    summary: 'Get tweets mentioning a user.',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [PARAM_USER_ID, PARAM_CURSOR, PARAM_PAGE_SIZE_20],
    path: '/api/v1/x/users/:id/verified-followers',
    responseShape: RESPONSE_USERS_PAGINATED,
    summary: 'Get verified followers.',
  },


  // --- X Account Management ---
  {
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'GET',
    path: '/api/v1/x/accounts',
    responseShape: '{ accounts: [{ id, xUserId, xUsername, status, health, createdAt, updatedAt, cookiesObtainedAt? }] }',
    summary: 'List connected X accounts',
  },
  // Credential-taking account setup is intentionally absent from this
  // agent-facing specification. Users must complete it in the dashboard.
  {
    agentProhibited: true,
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'GET',
    parameters: [PARAM_X_ACCOUNT_CONNECTION_ATTEMPT_ID],
    path: '/api/v1/x/account-connection-attempts/:id',
    responseShape:
      '{ object, id, status, pollAfterMs? } | { object, id, status, error, reason?, retryable } | { object, id, status, expiresAt, message, username }',
    summary: 'Get X account connection status (dashboard only - agent-prohibited)',
  },
  {
    agentProhibited: true,
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'GET',
    parameters: [PARAM_X_ACCOUNT_ID],
    path: '/api/v1/x/accounts/:id',
    responseShape: '{ id, xUserId, xUsername, status, health, createdAt, updatedAt, cookiesObtainedAt? }',
    summary: 'Get X account details',
  },
  {
    agentProhibited: true,
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'DELETE',
    parameters: [PARAM_X_ACCOUNT_ID],
    path: '/api/v1/x/accounts/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Disconnect X account',
  },
  {
    agentProhibited: true,
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'POST',
    path: '/api/v1/x/accounts/bulk-retry',
    responseShape: '{ cleared }',
    summary: 'Bulk retry temporarily failed X accounts (dashboard only - agent-prohibited)',
  },

  // --- X Write Actions ---
  {
    category: CATEGORY_X_WRITE,
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Write action ID', in: 'path', name: 'id', required: true, type: 'string' },
    ],
    path: '/api/v1/x/write-actions/:id',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: 'Get a durable write action status',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_X_ACCOUNT,
      { description: 'Tweet text', in: 'body', name: 'text', required: false, type: 'string' },
      { description: 'Tweet ID to reply to', in: 'body', name: 'reply_to_tweet_id', required: false, type: 'string' },
      { description: 'Community ID to post in', in: 'body', name: 'community_id', required: false, type: 'string' },
      { description: 'Whether this is a long-form note tweet', in: 'body', name: 'is_note_tweet', required: false, type: 'boolean' },
      { description: 'Public media URLs to attach', in: 'body', name: 'media', required: false, type: 'string[]' },
    ],
    path: '/api/v1/x/tweets',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Create tweet'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Delete tweet'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/like',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Like tweet'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/like',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Unlike tweet'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/retweet',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Retweet'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/retweet',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Unretweet'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [PARAM_WRITE_IDEMPOTENCY_KEY, PARAM_USER_ID_FOLLOW, PARAM_X_ACCOUNT],
    path: '/api/v1/x/users/:id/follow',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Follow user'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: [PARAM_WRITE_IDEMPOTENCY_KEY, PARAM_USER_ID_UNFOLLOW, PARAM_X_ACCOUNT],
    path: '/api/v1/x/users/:id/follow',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Unfollow user'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [PARAM_WRITE_IDEMPOTENCY_KEY, PARAM_USER_ID_REMOVE_FOLLOWER, PARAM_X_ACCOUNT],
    path: '/api/v1/x/users/:id/remove-follower',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Remove follower'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      { description: 'Recipient user ID', in: 'path', name: 'userId', required: true, type: 'string' },
      PARAM_X_ACCOUNT,
      { description: 'Message text', in: 'body', name: 'text', required: true, type: 'string' },
      { description: 'Array of media IDs to attach', in: 'body', name: 'media_ids', required: false, type: 'array' },
    ],
    path: '/api/v1/x/dm/:userId',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Send DM'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_X_ACCOUNT,
      PARAM_MEDIA_URL,
    ],
    path: '/api/v1/x/media',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Upload media'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_X_ACCOUNT,
      { description: 'Display name', in: 'body', name: 'name', required: false, type: 'string' },
      { description: 'Bio description', in: 'body', name: 'description', required: false, type: 'string' },
      { description: 'Location', in: 'body', name: 'location', required: false, type: 'string' },
      { description: 'Website URL', in: 'body', name: 'url', required: false, type: 'string' },
    ],
    path: '/api/v1/x/profile',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Update profile'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_X_ACCOUNT,
      PARAM_MEDIA_URL,
    ],
    path: '/api/v1/x/profile/avatar',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Update avatar'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_X_ACCOUNT,
      PARAM_MEDIA_URL,
    ],
    path: '/api/v1/x/profile/banner',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Update banner'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_X_ACCOUNT,
      { description: 'Community name', in: 'body', name: 'name', required: true, type: 'string' },
      { description: 'Community description', in: 'body', name: 'description', required: false, type: 'string' },
    ],
    path: '/api/v1/x/communities',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Create community'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: [
      PARAM_WRITE_IDEMPOTENCY_KEY,
      PARAM_COMMUNITY_ID,
      PARAM_X_ACCOUNT,
      { description: 'Community name for confirmation', in: 'body', name: 'community_name', required: true, type: 'string' },
    ],
    path: '/api/v1/x/communities/:id',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Delete community'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: PARAMS_COMMUNITY_ACTION,
    path: '/api/v1/x/communities/:id/join',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Join community'),
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_COMMUNITY_ACTION,
    path: '/api/v1/x/communities/:id/join',
    responseShape: RESPONSE_WRITE_ACTION,
    summary: writeSummary('Leave community'),
  },


  // --- Support ---
  {
    agentProhibited: true,
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'POST',
    parameters: [
      PARAM_SUPPORT_IDEMPOTENCY_KEY,
      { description: 'Ticket subject (1-500 chars)', in: 'body', name: 'subject', required: true, type: 'string' },
      { description: 'Initial message (1-10000 chars)', in: 'body', name: 'body', required: true, type: 'string' },
    ],
    path: '/api/v1/support/tickets',
    responseShape: '{ publicId, attachments? }',
    summary: 'Open a new support ticket',
  },
  {
    agentProhibited: true,
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'GET',
    path: '/api/v1/support/tickets',
    responseShape: '{ tickets: [{ publicId, subject, status, messageCount, createdAt, updatedAt }] }',
    summary: 'List your support tickets',
  },
  {
    agentProhibited: true,
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'GET',
    parameters: [PARAM_TICKET_ID],
    path: '/api/v1/support/tickets/:id',
    responseShape: '{ publicId, subject, status, messages: [{ body, sender, createdAt }], createdAt, updatedAt }',
    summary: 'Get a ticket with message history',
  },
  {
    agentProhibited: true,
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_TICKET_ID,
      { description: 'New status: open, resolved, closed', in: 'body', name: 'status', required: true, type: 'string' },
    ],
    path: '/api/v1/support/tickets/:id',
    responseShape: '{ publicId, status }',
    summary: 'Update ticket status',
  },
  {
    agentProhibited: true,
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'POST',
    parameters: [
      PARAM_SUPPORT_IDEMPOTENCY_KEY,
      PARAM_TICKET_ID,
      { description: 'Message content (1-10000 chars)', in: 'body', name: 'body', required: true, type: 'string' },
    ],
    path: '/api/v1/support/tickets/:id/messages',
    responseShape: '{ publicId, attachments? }',
    summary: 'Reply to a support ticket',
  },

  // --- Credits ---
  // Balance reads stay agent-callable. Checkout and saved-card charge
  // endpoints remain documented but are dashboard-only for agent safety.
  {
    category: 'credits',
    free: true,
    method: 'GET',
    path: '/api/v1/credits',
    responseShape: '{ auto_topup_amount_dollars, auto_topup_enabled, auto_topup_threshold, balance, lifetime_purchased, lifetime_used }',
    summary: 'Get credits balance',
  },
  {
    agentProhibited: true,
    category: 'credits',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Allowed top-up amount in USD', in: 'body', name: 'dollars', required: true, type: 'number' },
      { description: 'Checkout locale', in: 'body', name: 'locale', required: false, type: 'string' },
    ],
    path: '/api/v1/credits/topup',
    responseShape: '{ url, redirect_url }',
    summary: 'Open hosted checkout to top up credits.',
  },
  {
    agentProhibited: true,
    category: 'credits',
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Checkout session ID returned after a credit top-up', in: 'query', name: 'session_id', required: true, type: 'string' },
    ],
    path: '/api/v1/credits/topup/status',
    responseShape: '{ status: "paid" | "open" | "expired" | "unknown", amount_dollars?: number, credits?: number }',
    summary: 'Check credit top-up checkout status.',
  },
  {
    agentProhibited: true,
    category: 'credits',
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Allowed saved-card charge amount in USD', in: 'body', name: 'dollars', required: true, type: 'number' },
    ],
    path: '/api/v1/credits/quick-topup',
    responseShape: '{ outcome: "charged", credits: number, balance: number } | { outcome: "no_payment_method" } | { outcome: "requires_action", clientSecret: string }',
    summary: 'Charge a saved payment method for credits when available.',
  },
] as const;

export { API_SPEC };
