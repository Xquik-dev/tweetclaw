import type { EndpointInfo, EndpointParameter } from './types.js';

const RESPONSE_SUCCESS = '{ success: true }';
const DESCRIPTION_PAGINATION_CURSOR = 'Pagination cursor';
const DESCRIPTION_STYLE_USERNAME = 'X username of cached style';
const DESCRIPTION_EXPORT_FORMAT = 'Export format (csv, json, md, md-document, pdf, txt, xlsx)';
const CATEGORY_BOT = 'bot';
const DESCRIPTION_PLATFORM_USER_ID = 'Platform user ID';
const CATEGORY_INTEGRATIONS = 'integrations';
const CATEGORY_X_ACCOUNTS = 'x-accounts';

const PAGINATION_PARAMS: readonly EndpointParameter[] = [
  { description: 'Max items per page', in: 'query', name: 'limit', required: false, type: 'number' },
  { description: DESCRIPTION_PAGINATION_CURSOR, in: 'query', name: 'after', required: false, type: 'string' },
];

const EXTRACTION_SEARCH_PARAMS: readonly EndpointParameter[] = [
  { description: 'Filter tweets by author username (tweet_search_extractor)', in: 'body', name: 'fromUser', required: false, type: 'string' },
  { description: 'Filter tweets to a specific user (tweet_search_extractor)', in: 'body', name: 'toUser', required: false, type: 'string' },
  { description: 'Filter tweets mentioning a user (tweet_search_extractor)', in: 'body', name: 'mentioning', required: false, type: 'string' },
  { description: 'Language code filter, e.g. en, tr (tweet_search_extractor)', in: 'body', name: 'language', required: false, type: 'string' },
  { description: 'Start date YYYY-MM-DD (tweet_search_extractor)', in: 'body', name: 'sinceDate', required: false, type: 'string' },
  { description: 'End date YYYY-MM-DD (tweet_search_extractor)', in: 'body', name: 'untilDate', required: false, type: 'string' },
  { description: 'Filter by media type: images, videos, gifs, media (tweet_search_extractor)', in: 'body', name: 'mediaType', required: false, type: 'string' },
  { description: 'Minimum likes threshold (tweet_search_extractor)', in: 'body', name: 'minFaves', required: false, type: 'number' },
  { description: 'Minimum retweets threshold (tweet_search_extractor)', in: 'body', name: 'minRetweets', required: false, type: 'number' },
  { description: 'Minimum replies threshold (tweet_search_extractor)', in: 'body', name: 'minReplies', required: false, type: 'number' },
  { description: 'Only verified authors (tweet_search_extractor)', in: 'body', name: 'verifiedOnly', required: false, type: 'boolean' },
  { description: 'Control reply inclusion (tweet_search_extractor): include, exclude, only', in: 'body', name: 'replies', required: false, type: 'string' },
  { description: 'Control retweet inclusion (tweet_search_extractor): include, exclude, only', in: 'body', name: 'retweets', required: false, type: 'string' },
  { description: 'Exact phrase match (tweet_search_extractor)', in: 'body', name: 'exactPhrase', required: false, type: 'string' },
  { description: 'Comma-separated words to exclude (tweet_search_extractor)', in: 'body', name: 'excludeWords', required: false, type: 'string' },
  { description: 'Raw X search operators (tweet_search_extractor)', in: 'body', name: 'advancedQuery', required: false, type: 'string' },
];

const PARAM_STYLE_USERNAME: EndpointParameter =
  { description: DESCRIPTION_STYLE_USERNAME, in: 'path', name: 'username', required: true, type: 'string' };

const PARAM_EXPORT_FORMAT: EndpointParameter =
  { description: DESCRIPTION_EXPORT_FORMAT, in: 'query', name: 'format', required: false, type: 'string' };

const PARAM_DRAW_ID: EndpointParameter =
  { description: 'Draw public ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_EXTRACTION_ID: EndpointParameter =
  { description: 'Extraction public ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_INTEGRATION_ID: EndpointParameter =
  { description: 'Integration ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_X_ACCOUNT: EndpointParameter =
  { description: 'X account (@username or account ID)', in: 'body', name: 'account', required: true, type: 'string' };

const PARAM_X_ACCOUNT_ID: EndpointParameter =
  { description: 'X account ID', in: 'path', name: 'id', required: true, type: 'string' };

const DESCRIPTION_EVENT_TYPES = 'tweet.new, tweet.reply, tweet.quote, tweet.retweet, follower.gained, follower.lost';

const PARAM_EVENT_TYPES_REQUIRED: EndpointParameter =
  { description: `Event types: ${DESCRIPTION_EVENT_TYPES}`, in: 'body', name: 'eventTypes', required: true, type: 'string[]' };

const PARAM_EVENT_TYPES_OPTIONAL: EndpointParameter =
  { description: `Updated event types: ${DESCRIPTION_EVENT_TYPES}`, in: 'body', name: 'eventTypes', required: false, type: 'string[]' };

const PARAM_MONITOR_ID: EndpointParameter =
  { description: 'Monitor ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_WEBHOOK_ID: EndpointParameter =
  { description: 'Webhook ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_TWEET_ID: EndpointParameter =
  { description: 'Tweet ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_COMMUNITY_ID: EndpointParameter =
  { description: 'Community ID', in: 'path', name: 'id', required: true, type: 'string' };

const PARAMS_TWEET_ACTION: readonly EndpointParameter[] = [PARAM_TWEET_ID, PARAM_X_ACCOUNT];
const PARAMS_COMMUNITY_ACTION: readonly EndpointParameter[] = [PARAM_COMMUNITY_ID, PARAM_X_ACCOUNT];

const PARAM_USER_ID_FOLLOW: EndpointParameter =
  { description: 'User ID to follow', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_USER_ID_UNFOLLOW: EndpointParameter =
  { description: 'User ID to unfollow', in: 'path', name: 'id', required: true, type: 'string' };

const PARAM_MEDIA_URL: EndpointParameter =
  { description: 'URL to download media from (alternative to file, HTTPS only)', in: 'body', name: 'url', required: false, type: 'string' };

const RESPONSE_COMMUNITY_ACTION = '{ communityId, communityName, success: true }';
const CATEGORY_AUTOMATIONS = 'automations';
const CATEGORY_SUPPORT = 'support';
const CATEGORY_X_WRITE = 'x-write';

const PARAM_AUTOMATION_SLUG: EndpointParameter =
  { description: 'Flow slug', in: 'path', name: 'slug', required: true, type: 'string' };

const PARAM_TICKET_ID: EndpointParameter =
  { description: 'Ticket public ID', in: 'path', name: 'id', required: true, type: 'string' };

const API_SPEC: readonly EndpointInfo[] = [
  // --- Account ---
  {
    category: 'account',
    free: true,
    method: 'GET',
    path: '/api/v1/account',
    responseShape: '{ email, locale, xUsername, subscription, usage }',
    summary: 'Get current account info and subscription status',
  },
  {
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
    category: 'account',
    free: true,
    method: 'GET',
    path: '/api/v1/api-keys',
    responseShape: '{ keys: [{ id, name, prefix, isActive, createdAt, lastUsedAt? }] }',
    summary: 'List all API keys for the account',
  },
  {
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
    category: 'account',
    free: true,
    method: 'POST',
    path: '/api/v1/subscribe',
    responseShape: '{ url }',
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
    responseShape: '{ contentRules, scorerWeights, followUpQuestions, ... }',
    summary: 'Compose, refine, or score a tweet using algorithm data',
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
    parameters: [PARAM_STYLE_USERNAME],
    path: '/api/v1/styles/:username',
    responseShape: '{ xUsername, tweetCount, isOwnAccount, fetchedAt, tweets }',
    summary: 'Get a cached style profile by username',
  },
  {
    category: 'composition',
    free: true,
    method: 'PUT',
    parameters: [
      { description: 'Style label (username key)', in: 'path', name: 'username', required: true, type: 'string' },
      { description: 'Display label for the style', in: 'body', name: 'label', required: true, type: 'string' },
      { description: 'Array of tweet objects with text field', in: 'body', name: 'tweets', required: true, type: 'array' },
    ],
    path: '/api/v1/styles/:username',
    responseShape: '{ xUsername, tweetCount, isOwnAccount, fetchedAt, tweets }',
    summary: 'Create or update a style profile with custom tweets',
  },
  {
    category: 'composition',
    free: true,
    method: 'DELETE',
    parameters: [
      { description: 'X username of style to delete', in: 'path', name: 'username', required: true, type: 'string' },
    ],
    path: '/api/v1/styles/:username',
    responseShape: '204 No Content',
    summary: 'Delete a cached style profile',
  },
  {
    category: 'composition',
    free: false,
    method: 'GET',
    parameters: [PARAM_STYLE_USERNAME],
    path: '/api/v1/styles/:username/performance',
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
    free: false,
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
      { description: 'Winner eligibility filters (follow, like, retweet, etc.)', in: 'body', name: 'filters', required: false, type: 'object' },
    ],
    path: '/api/v1/draws',
    responseShape: '{ id, tweetId, totalEntries, validEntries, winners: [{ position, authorUsername, tweetId, isBackup }] }',
    summary: 'Run a giveaway draw on a tweet',
  },
  {
    category: 'extraction',
    free: false,
    method: 'GET',
    parameters: [PARAM_DRAW_ID],
    path: '/api/v1/draws/:id',
    responseShape: '{ draw: { id, tweetUrl, tweetId, status, totalEntries, validEntries, ... }, winners }',
    summary: 'Get draw details and winners',
  },
  {
    category: 'extraction',
    free: false,
    method: 'GET',
    parameters: [PARAM_DRAW_ID, PARAM_EXPORT_FORMAT],
    path: '/api/v1/draws/:id/export',
    responseShape: 'CSV, XLSX, or Markdown file download',
    summary: 'Export draw results as CSV, XLSX, or Markdown',
  },
  {
    category: 'extraction',
    free: false,
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
      { description: 'Target X username', in: 'body', name: 'targetUsername', required: false, type: 'string' },
      { description: 'Target tweet ID', in: 'body', name: 'targetTweetId', required: false, type: 'string' },
      { description: 'Search query for search tools', in: 'body', name: 'searchQuery', required: false, type: 'string' },
      { description: 'Community ID for community tools', in: 'body', name: 'targetCommunityId', required: false, type: 'string' },
      { description: 'List ID for list tools', in: 'body', name: 'targetListId', required: false, type: 'string' },
      { description: 'Space ID for space_explorer', in: 'body', name: 'targetSpaceId', required: false, type: 'string' },
      { description: 'Max results to return', in: 'body', name: 'resultsLimit', required: false, type: 'number' },
      ...EXTRACTION_SEARCH_PARAMS,
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
      { description: 'Target X username', in: 'body', name: 'targetUsername', required: false, type: 'string' },
      { description: 'Target tweet ID', in: 'body', name: 'targetTweetId', required: false, type: 'string' },
      { description: 'Search query for search tools', in: 'body', name: 'searchQuery', required: false, type: 'string' },
      { description: 'Community ID for community tools', in: 'body', name: 'targetCommunityId', required: false, type: 'string' },
      { description: 'List ID for list tools', in: 'body', name: 'targetListId', required: false, type: 'string' },
      { description: 'Space ID for space_explorer', in: 'body', name: 'targetSpaceId', required: false, type: 'string' },
      { description: 'Max results to return', in: 'body', name: 'resultsLimit', required: false, type: 'number' },
      ...EXTRACTION_SEARCH_PARAMS,
    ],
    path: '/api/v1/extractions/estimate',
    responseShape: '{ estimatedResults?, usagePercent?, projectedPercent?, allowed?, source? }',
    summary: 'Estimate extraction cost before running',
  },
  {
    category: 'extraction',
    free: false,
    method: 'GET',
    parameters: [
      PARAM_EXTRACTION_ID,
      { description: 'Max results per page', in: 'query', name: 'limit', required: false, type: 'number' },
      { description: DESCRIPTION_PAGINATION_CURSOR, in: 'query', name: 'after', required: false, type: 'string' },
    ],
    path: '/api/v1/extractions/:id',
    responseShape: '{ job: { id, toolType, status, ... }, results: [...], hasMore, nextCursor? }',
    summary: 'Get extraction job details and results',
  },
  {
    category: 'extraction',
    free: false,
    method: 'GET',
    parameters: [PARAM_EXTRACTION_ID, PARAM_EXPORT_FORMAT],
    path: '/api/v1/extractions/:id/export',
    responseShape: 'CSV, XLSX, or Markdown file download',
    summary: 'Export extraction results as CSV, XLSX, or Markdown',
  },

  // --- Monitoring ---
  {
    category: 'monitoring',
    free: false,
    method: 'GET',
    path: '/api/v1/monitors',
    responseShape: '{ monitors: [{ id, xUsername, eventTypes, isActive, createdAt }], total }',
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
    responseShape: '{ id, username, eventTypes, createdAt, xUserId }',
    summary: 'Create a new account monitor',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'GET',
    parameters: [PARAM_MONITOR_ID],
    path: '/api/v1/monitors/:id',
    responseShape: '{ id, xUsername, eventTypes, isActive, createdAt }',
    summary: 'Get monitor details by ID',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_MONITOR_ID,
      { description: 'Set active or paused', in: 'body', name: 'isActive', required: false, type: 'boolean' },
      PARAM_EVENT_TYPES_OPTIONAL,
    ],
    path: '/api/v1/monitors/:id',
    responseShape: '{ id, xUsername, eventTypes, isActive, createdAt }',
    summary: 'Update monitor settings or toggle active state',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'DELETE',
    parameters: [PARAM_MONITOR_ID],
    path: '/api/v1/monitors/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Delete a monitor and stop tracking',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'GET',
    parameters: [
      ...PAGINATION_PARAMS,
      { description: 'Filter by monitor ID', in: 'query', name: 'monitorId', required: false, type: 'string' },
      { description: `Filter by event type: ${DESCRIPTION_EVENT_TYPES}`, in: 'query', name: 'eventType', required: false, type: 'string' },
    ],
    path: '/api/v1/events',
    responseShape: '{ events: [{ id, eventType, xUsername, payload, createdAt }], hasMore, nextCursor? }',
    summary: 'List stream events with filters and pagination',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Event ID', in: 'path', name: 'id', required: true, type: 'string' },
    ],
    path: '/api/v1/events/:id',
    responseShape: '{ id, eventType, xUsername, payload, createdAt, xEventId? }',
    summary: 'Get a single event by ID',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'GET',
    path: '/api/v1/webhooks',
    responseShape: '{ webhooks: [{ id, url, eventTypes, isActive, createdAt }] }',
    summary: 'List all webhook endpoints',
  },
  {
    category: 'monitoring',
    free: false,
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
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_WEBHOOK_ID,
      { description: 'Updated delivery URL', in: 'body', name: 'url', required: false, type: 'string' },
      PARAM_EVENT_TYPES_OPTIONAL,
      { description: 'Set active or inactive', in: 'body', name: 'isActive', required: false, type: 'boolean' },
    ],
    path: '/api/v1/webhooks/:id',
    responseShape: '{ id, url, eventTypes, isActive, createdAt }',
    summary: 'Update webhook URL, events, or active state',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'DELETE',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Deactivate a webhook endpoint',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'GET',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id/deliveries',
    responseShape: '{ deliveries: [{ id, status, attempts, statusCode?, createdAt }] }',
    summary: 'List recent deliveries for a webhook',
  },
  {
    category: 'monitoring',
    free: false,
    method: 'POST',
    parameters: [PARAM_WEBHOOK_ID],
    path: '/api/v1/webhooks/:id/test',
    responseShape: '{ success, statusCode, error? }',
    summary: 'Send a test event to a webhook endpoint',
  },

  // --- Twitter ---
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Tweet ID to look up', in: 'path', name: 'tweetId', required: true, type: 'string' },
    ],
    mpp: { intent: 'charge', price: '$0.00015/call' },
    path: '/api/v1/x/tweets/:tweetId',
    responseShape: '{ tweet: { id, text, likeCount, retweetCount, replyCount, viewCount, ... }, author? }',
    summary: 'Look up a single tweet with engagement metrics',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Search query (X search syntax)', in: 'query', name: 'q', required: true, type: 'string' },
      { description: 'Max tweets to return (default 20, max 200)', in: 'query', name: 'limit', required: false, type: 'number' },
    ],
    mpp: { intent: 'session', price: '$0.00015/tweet' },
    path: '/api/v1/x/tweets/search',
    responseShape: '{ tweets: [{ id, text, author?, likeCount?, retweetCount?, media? }], total }',
    summary: 'Search tweets by query with optional limit for pagination',
  },
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'X username to look up', in: 'path', name: 'username', required: true, type: 'string' },
    ],
    mpp: { intent: 'charge', price: '$0.00015/call' },
    path: '/api/v1/x/users/:username',
    responseShape: '{ id, username, name, followers?, following?, verified?, description? }',
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
    mpp: { intent: 'charge', price: '$0.00105/call' },
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
    mpp: { intent: 'charge', price: '$0.00105/call' },
    path: '/api/v1/x/articles/:tweetId',
    responseShape: '{ article: { title, previewText, coverImageUrl, contents, createdAt, likeCount, replyCount, quoteCount, viewCount }, author? }',
    summary: 'Get full content of an X Article (long-form post) by tweet ID',
  },

  // --- Media ---
  {
    category: 'media',
    free: false,
    method: 'POST',
    parameters: [
      { description: 'Tweet URL or ID (single tweet)', in: 'body', name: 'tweetInput', required: false, type: 'string' },
      { description: 'Array of tweet URLs or IDs (bulk, max 50)', in: 'body', name: 'tweetIds', required: false, type: 'string[]' },
    ],
    mpp: { intent: 'session', price: '$0.00015/media' },
    path: '/api/v1/x/media/download',
    responseShape: 'Single: { tweetId, galleryUrl, cacheHit }. Bulk: { galleryUrl, totalTweets, totalMedia }',
    summary: 'Download media from tweets. Single tweetInput or bulk tweetIds. Returns gallery URL.',
  },

  // --- Twitter (Trends) ---
  {
    category: 'twitter',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'WOEID location ID (1 for worldwide)', in: 'query', name: 'woeid', required: false, type: 'number' },
      { description: 'Max number of trends', in: 'query', name: 'count', required: false, type: 'number' },
    ],
    mpp: { intent: 'charge', price: '$0.00045/call' },
    path: '/api/v1/trends',
    responseShape: '{ trends: [{ name, query?, description?, rank? }], total, woeid }',
    summary: 'Get current trending topics on X',
  },
  {
    category: 'trends',
    free: false,
    method: 'GET',
    parameters: [
      { description: 'Source slug (reddit, github, hacker-news, google-trends, wikipedia, startups, polymarket)', in: 'path', name: 'source', required: true, type: 'string' },
      { description: 'Max number of items', in: 'query', name: 'count', required: false, type: 'number' },
    ],
    path: '/api/v1/trending/:source',
    responseShape: '{ items: [{ title, url?, score? }], total, source }',
    summary: 'Get trending items by source',
  },

  // --- Bot ---
  {
    category: CATEGORY_BOT,
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Platform name (telegram)', in: 'body', name: 'platform', required: true, type: 'string' },
      { description: DESCRIPTION_PLATFORM_USER_ID, in: 'body', name: 'platformUserId', required: true, type: 'string' },
    ],
    path: '/api/v1/bot/platform-links',
    responseShape: '{ id, platform, platformUserId, createdAt }',
    summary: 'Link a platform user to an Xquik account',
  },
  {
    category: CATEGORY_BOT,
    free: true,
    method: 'DELETE',
    parameters: [
      { description: 'Platform name (telegram)', in: 'body', name: 'platform', required: true, type: 'string' },
      { description: DESCRIPTION_PLATFORM_USER_ID, in: 'body', name: 'platformUserId', required: true, type: 'string' },
    ],
    path: '/api/v1/bot/platform-links',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Unlink a platform user from an Xquik account',
  },
  {
    category: CATEGORY_BOT,
    free: true,
    method: 'GET',
    parameters: [
      { description: 'Platform name', in: 'query', name: 'platform', required: true, type: 'string' },
      { description: DESCRIPTION_PLATFORM_USER_ID, in: 'query', name: 'platformUserId', required: true, type: 'string' },
    ],
    path: '/api/v1/bot/platform-links/lookup',
    responseShape: '{ userId }',
    summary: 'Look up an Xquik user by platform identity',
  },
  {
    category: CATEGORY_BOT,
    free: true,
    method: 'POST',
    parameters: [
      { description: DESCRIPTION_PLATFORM_USER_ID, in: 'body', name: 'platformUserId', required: true, type: 'string' },
      { description: 'Input token count', in: 'body', name: 'inputTokens', required: true, type: 'number' },
      { description: 'Output token count', in: 'body', name: 'outputTokens', required: true, type: 'number' },
    ],
    path: '/api/v1/bot/usage',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Track bot token usage',
  },

  // --- Integrations ---
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'GET',
    path: '/api/v1/integrations',
    responseShape: '{ integrations: [{ id, type, name, config, eventTypes, isActive, ... }] }',
    summary: 'List all integrations (Telegram push notifications)',
  },
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Integration type (telegram)', in: 'body', name: 'type', required: true, type: 'string' },
      { description: 'Display name', in: 'body', name: 'name', required: true, type: 'string' },
      { description: 'Config with chatId', in: 'body', name: 'config', required: true, type: 'object' },
      { description: 'Event types to subscribe to', in: 'body', name: 'eventTypes', required: true, type: 'string[]' },
    ],
    path: '/api/v1/integrations',
    responseShape: '{ id, type, name, config, eventTypes, isActive, ... }',
    summary: 'Create a new integration for push notifications',
  },
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'GET',
    parameters: [PARAM_INTEGRATION_ID],
    path: '/api/v1/integrations/:id',
    responseShape: '{ id, type, name, config, eventTypes, filters, isActive, ... }',
    summary: 'Get integration details',
  },
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_INTEGRATION_ID,
      { description: 'Display name', in: 'body', name: 'name', required: false, type: 'string' },
      { description: 'Event types', in: 'body', name: 'eventTypes', required: false, type: 'string[]' },
      { description: 'Active status', in: 'body', name: 'isActive', required: false, type: 'boolean' },
      { description: 'Silent notifications', in: 'body', name: 'silentPush', required: false, type: 'boolean' },
    ],
    path: '/api/v1/integrations/:id',
    responseShape: '{ id, type, name, config, eventTypes, isActive, ... }',
    summary: 'Update an integration',
  },
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'DELETE',
    parameters: [PARAM_INTEGRATION_ID],
    path: '/api/v1/integrations/:id',
    responseShape: '{ success: true }',
    summary: 'Delete an integration',
  },
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'GET',
    parameters: [
      PARAM_INTEGRATION_ID,
      { description: 'Max items', in: 'query', name: 'limit', required: false, type: 'number' },
    ],
    path: '/api/v1/integrations/:id/deliveries',
    responseShape: '{ deliveries: [{ id, eventType, status, attempts, createdAt, ... }] }',
    summary: 'List delivery history for an integration',
  },
  {
    category: CATEGORY_INTEGRATIONS,
    free: true,
    method: 'POST',
    parameters: [PARAM_INTEGRATION_ID],
    path: '/api/v1/integrations/:id/test',
    responseShape: '{ success: true }',
    summary: 'Send a test delivery to the integration',
  },

  // --- X Account Management ---
  {
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'GET',
    path: '/api/v1/x/accounts',
    responseShape: '{ accounts: [{ id, xUserId, xUsername, status, createdAt }] }',
    summary: 'List connected X accounts',
  },
  {
    agentProhibited: true,
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'POST',
    parameters: [
      { description: 'X username', in: 'body', name: 'username', required: true, type: 'string' },
      { description: 'Account email', in: 'body', name: 'email', required: true, type: 'string' },
      { description: 'Account password', in: 'body', name: 'password', required: true, type: 'string' },
      { description: 'TOTP secret for 2FA', in: 'body', name: 'totp_secret', required: false, type: 'string' },
    ],
    path: '/api/v1/x/accounts',
    responseShape: '{ id, xUserId, xUsername, status }',
    summary: 'Connect X account (dashboard only — agent-prohibited)',
  },
  {
    category: CATEGORY_X_ACCOUNTS,
    free: true,
    method: 'GET',
    parameters: [PARAM_X_ACCOUNT_ID],
    path: '/api/v1/x/accounts/:id',
    responseShape: '{ id, xUserId, xUsername, status, cookiesObtainedAt, createdAt }',
    summary: 'Get X account details',
  },
  {
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
    parameters: [
      PARAM_X_ACCOUNT_ID,
      { description: 'Account password', in: 'body', name: 'password', required: true, type: 'string' },
      { description: 'TOTP secret for 2FA', in: 'body', name: 'totp_secret', required: false, type: 'string' },
    ],
    path: '/api/v1/x/accounts/:id/reauth',
    responseShape: '{ id, xUsername, status }',
    summary: 'Re-authenticate X account (dashboard only — agent-prohibited)',
  },

  // --- X Write Actions ---
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_X_ACCOUNT,
      { description: 'Tweet text', in: 'body', name: 'text', required: true, type: 'string' },
      { description: 'Tweet ID to reply to', in: 'body', name: 'reply_to_tweet_id', required: false, type: 'string' },
      { description: 'URL to attach', in: 'body', name: 'attachment_url', required: false, type: 'string' },
      { description: 'Community ID to post in', in: 'body', name: 'community_id', required: false, type: 'string' },
      { description: 'Whether this is a long-form note tweet', in: 'body', name: 'is_note_tweet', required: false, type: 'boolean' },
      { description: 'Array of media IDs to attach', in: 'body', name: 'media_ids', required: false, type: 'array' },
    ],
    path: '/api/v1/x/tweets',
    responseShape: '{ tweetId, success: true }',
    summary: 'Create tweet',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Delete tweet',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/like',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Like tweet',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/like',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Unlike tweet',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: PARAMS_TWEET_ACTION,
    path: '/api/v1/x/tweets/:id/retweet',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Retweet',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [PARAM_USER_ID_FOLLOW, PARAM_X_ACCOUNT],
    path: '/api/v1/x/users/:id/follow',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Follow user',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: [PARAM_USER_ID_UNFOLLOW, PARAM_X_ACCOUNT],
    path: '/api/v1/x/users/:id/follow',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Unfollow user',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      { description: 'Recipient user ID', in: 'path', name: 'userId', required: true, type: 'string' },
      PARAM_X_ACCOUNT,
      { description: 'Message text', in: 'body', name: 'text', required: true, type: 'string' },
      { description: 'Array of media IDs to attach', in: 'body', name: 'media_ids', required: false, type: 'array' },
      { description: 'Message ID to reply to', in: 'body', name: 'reply_to_message_id', required: false, type: 'string' },
    ],
    path: '/api/v1/x/dm/:userId',
    responseShape: '{ messageId, success: true }',
    summary: 'Send DM',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_X_ACCOUNT,
      { description: 'Media file to upload', in: 'body', name: 'file', required: false, type: 'binary' },
      PARAM_MEDIA_URL,
      { description: 'Whether this is a long video', in: 'body', name: 'is_long_video', required: false, type: 'boolean' },
    ],
    path: '/api/v1/x/media',
    responseShape: '{ mediaId, success: true }',
    summary: 'Upload media',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_X_ACCOUNT,
      { description: 'Display name', in: 'body', name: 'name', required: false, type: 'string' },
      { description: 'Bio description', in: 'body', name: 'description', required: false, type: 'string' },
      { description: 'Location', in: 'body', name: 'location', required: false, type: 'string' },
      { description: 'Website URL', in: 'body', name: 'url', required: false, type: 'string' },
    ],
    path: '/api/v1/x/profile',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Update profile',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_X_ACCOUNT,
      { description: 'Avatar image file', in: 'body', name: 'file', required: false, type: 'binary' },
      PARAM_MEDIA_URL,
    ],
    path: '/api/v1/x/profile/avatar',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Update avatar',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'PATCH',
    parameters: [
      PARAM_X_ACCOUNT,
      { description: 'Banner image file', in: 'body', name: 'file', required: false, type: 'binary' },
      PARAM_MEDIA_URL,
    ],
    path: '/api/v1/x/profile/banner',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Update banner',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: [
      PARAM_X_ACCOUNT,
      { description: 'Community name', in: 'body', name: 'name', required: true, type: 'string' },
      { description: 'Community description', in: 'body', name: 'description', required: false, type: 'string' },
    ],
    path: '/api/v1/x/communities',
    responseShape: '{ communityId, success: true }',
    summary: 'Create community',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: [
      PARAM_COMMUNITY_ID,
      PARAM_X_ACCOUNT,
      { description: 'Community name for confirmation', in: 'body', name: 'community_name', required: true, type: 'string' },
    ],
    path: '/api/v1/x/communities/:id',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Delete community',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'POST',
    parameters: PARAMS_COMMUNITY_ACTION,
    path: '/api/v1/x/communities/:id/join',
    responseShape: RESPONSE_COMMUNITY_ACTION,
    summary: 'Join community',
  },
  {
    category: CATEGORY_X_WRITE,
    free: false,
    method: 'DELETE',
    parameters: PARAMS_COMMUNITY_ACTION,
    path: '/api/v1/x/communities/:id/join',
    responseShape: RESPONSE_COMMUNITY_ACTION,
    summary: 'Leave community',
  },

  // --- Automations ---
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'GET',
    path: '/api/v1/automations',
    responseShape: '{ items: [{ id, name, slug, triggerType, triggerConfig, isActive, runCount, lastRunAt, createdAt, updatedAt }] }',
    summary: 'List all automation flows',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Flow name', in: 'body', name: 'name', required: true, type: 'string' },
      { description: 'Trigger type: monitor_event, schedule, search, webhook_inbound', in: 'body', name: 'triggerType', required: true, type: 'string' },
      { description: 'Trigger-specific configuration', in: 'body', name: 'triggerConfig', required: true, type: 'object' },
      { description: 'Template slug to scaffold from', in: 'body', name: 'templateSlug', required: false, type: 'string' },
    ],
    path: '/api/v1/automations',
    responseShape: '{ id, name, slug, triggerType, triggerConfig, isActive, createdAt, updatedAt }',
    summary: 'Create a new automation flow',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'GET',
    parameters: [PARAM_AUTOMATION_SLUG],
    path: '/api/v1/automations/:slug',
    responseShape: '{ id, name, slug, triggerType, triggerConfig, isActive, steps, recentRuns, createdAt, updatedAt }',
    summary: 'Get flow details with steps and recent runs',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_AUTOMATION_SLUG,
      { description: 'Current updatedAt for optimistic concurrency', in: 'body', name: 'expectedUpdatedAt', required: true, type: 'string' },
      { description: 'Updated flow name', in: 'body', name: 'name', required: false, type: 'string' },
      { description: 'Updated trigger type', in: 'body', name: 'triggerType', required: false, type: 'string' },
      { description: 'Updated trigger config', in: 'body', name: 'triggerConfig', required: false, type: 'object' },
      { description: 'Activate or deactivate', in: 'body', name: 'isActive', required: false, type: 'boolean' },
    ],
    path: '/api/v1/automations/:slug',
    responseShape: '{ id, name, slug, triggerType, triggerConfig, isActive, createdAt, updatedAt }',
    summary: 'Update flow name, trigger, or active status',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'DELETE',
    parameters: [PARAM_AUTOMATION_SLUG],
    path: '/api/v1/automations/:slug',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Delete a flow and all its steps',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'POST',
    parameters: [
      PARAM_AUTOMATION_SLUG,
      { description: 'Step type: action, condition, extraction', in: 'body', name: 'stepType', required: true, type: 'string' },
      { description: 'Branch: main, if_true, if_false', in: 'body', name: 'branch', required: true, type: 'string' },
      { description: 'Step-specific configuration', in: 'body', name: 'config', required: true, type: 'object' },
      { description: 'Order position in branch', in: 'body', name: 'position', required: false, type: 'number' },
      { description: 'Parent step ID for condition branches', in: 'body', name: 'parentStepId', required: false, type: 'string' },
      { description: 'Action type: create_tweet, follow, like, reply_tweet, retweet, send_dm, send_email, send_telegram, unfollow', in: 'body', name: 'actionType', required: false, type: 'string' },
      { description: 'Extraction tool type', in: 'body', name: 'extractionType', required: false, type: 'string' },
      { description: 'Variable name for extraction output', in: 'body', name: 'outputName', required: false, type: 'string' },
    ],
    path: '/api/v1/automations/:slug/steps',
    responseShape: '{ id, flowId, stepType, actionType, extractionType, branch, config, position, createdAt }',
    summary: 'Add an action, condition, or extraction step to a flow',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_AUTOMATION_SLUG,
      { description: 'Step ID to update', in: 'body', name: 'stepId', required: true, type: 'string' },
      { description: 'Updated step config', in: 'body', name: 'config', required: false, type: 'object' },
      { description: 'Updated step type', in: 'body', name: 'stepType', required: false, type: 'string' },
      { description: 'Updated branch', in: 'body', name: 'branch', required: false, type: 'string' },
      { description: 'Updated position', in: 'body', name: 'position', required: false, type: 'number' },
      { description: 'Updated action type', in: 'body', name: 'actionType', required: false, type: 'string' },
      { description: 'Updated extraction type', in: 'body', name: 'extractionType', required: false, type: 'string' },
      { description: 'Updated output variable name', in: 'body', name: 'outputName', required: false, type: 'string' },
    ],
    path: '/api/v1/automations/:slug/steps',
    responseShape: '{ id, flowId, stepType, actionType, extractionType, branch, config, position, createdAt }',
    summary: 'Update a step configuration or position',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'DELETE',
    parameters: [
      PARAM_AUTOMATION_SLUG,
      { description: 'Step ID to delete', in: 'body', name: 'stepId', required: true, type: 'string' },
    ],
    path: '/api/v1/automations/:slug/steps',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Remove a step from a flow',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'PATCH',
    parameters: [
      PARAM_AUTOMATION_SLUG,
      { description: 'Array of { stepId, positionX, positionY } (max 10)', in: 'body', name: 'positions', required: true, type: 'array' },
    ],
    path: '/api/v1/automations/:slug/steps/positions',
    responseShape: RESPONSE_SUCCESS,
    summary: 'Batch update canvas positions for flow steps',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'POST',
    parameters: [PARAM_AUTOMATION_SLUG],
    path: '/api/v1/automations/:slug/test',
    responseShape: '{ status, result, runId, error? }',
    summary: 'Test run a flow with synthetic trigger data',
  },
  {
    category: CATEGORY_AUTOMATIONS,
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Inbound webhook token', in: 'path', name: 'token', required: true, type: 'string' },
    ],
    path: '/api/v1/webhooks/inbound/:token',
    responseShape: '{ accepted: true, flowId }',
    summary: 'Trigger a flow via inbound webhook (no auth required, token acts as auth)',
  },

  // --- Support ---
  {
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'POST',
    parameters: [
      { description: 'Ticket subject (1-500 chars)', in: 'body', name: 'subject', required: true, type: 'string' },
      { description: 'Initial message (1-10000 chars)', in: 'body', name: 'body', required: true, type: 'string' },
    ],
    path: '/api/v1/support/tickets',
    responseShape: '{ publicId }',
    summary: 'Open a new support ticket',
  },
  {
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'GET',
    path: '/api/v1/support/tickets',
    responseShape: '{ tickets: [{ publicId, subject, status, messageCount, createdAt, updatedAt }] }',
    summary: 'List your support tickets',
  },
  {
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'GET',
    parameters: [PARAM_TICKET_ID],
    path: '/api/v1/support/tickets/:id',
    responseShape: '{ publicId, subject, status, messages: [{ body, sender, createdAt }], createdAt, updatedAt }',
    summary: 'Get a ticket with message history',
  },
  {
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
    category: CATEGORY_SUPPORT,
    free: true,
    method: 'POST',
    parameters: [
      PARAM_TICKET_ID,
      { description: 'Message content (1-10000 chars)', in: 'body', name: 'body', required: true, type: 'string' },
    ],
    path: '/api/v1/support/tickets/:id/messages',
    responseShape: '{ publicId }',
    summary: 'Reply to a support ticket',
  },
] as const;

export { API_SPEC };
