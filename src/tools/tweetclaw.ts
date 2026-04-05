import { createProxiedRequest } from '../request.js';
import { errorResult, runInSandbox, specEndpoints, successResult } from './executor.js';
import type { FetchFunction, RequestFunction, ToolResult } from '../types.js';

const EXECUTE_DESCRIPTION = `Execute X (Twitter) API calls: post tweets, reply, like, retweet, follow, DM, update profile, upload media, search tweets, look up users, extract data, run giveaways, monitor accounts, compose tweets, and more. Write an async arrow function.

The sandbox provides:
\`\`\`typescript
// xquik.request(path, options?) - auth is injected automatically
declare const xquik: {
  request(path: string, options?: {
    method?: string;  // default: 'GET'
    body?: unknown;
    query?: Record<string, string>;
  }): Promise<unknown>;
};
declare const spec: { endpoints: EndpointInfo[] };
\`\`\`

Auth is injected automatically - never pass API keys.
First use "explore" to find endpoints, then write code here to call them.

## Important rules
- TWEET ACTIONS: SENDING a tweet ("tweet this", "post this") uses POST /api/v1/x/tweets. DRAFTING a tweet ("help me write", "compose") uses the 3-step compose flow. Never use compose when the user has text and wants to send it.
- CALL ORDERING: NEVER combine free and paid endpoints in Promise.all. Call free endpoints first (radar, styles, compose), then paid ones separately. If a paid call fails with 402, still use free data already fetched.
- WRITE ACTIONS: All require the "account" parameter (X username, e.g. "@myaccount"). Follow/unfollow/DM use numeric user ID in path - look up the user first via GET /api/v1/x/users/:username.
- CURRENT EVENTS: Use /api/v1/radar (free) for trending topics. Never use web search for trends.
- SUBSCRIPTION ERRORS: On 402, call POST /api/v1/subscribe (free) to get checkout URL.

## Workflows

### 1. Send a tweet (Subscription required)
\`\`\`javascript
async () => {
  // First, find connected accounts
  const { accounts } = await xquik.request('/api/v1/x/accounts');
  // Post the tweet directly
  return xquik.request('/api/v1/x/tweets', {
    method: 'POST',
    body: { account: accounts[0].xUsername, text: 'Hello world!' }
  });
}
\`\`\`

### 2. Reply to a tweet
\`\`\`javascript
async () => {
  return xquik.request('/api/v1/x/tweets', {
    method: 'POST',
    body: { account: '@myaccount', text: 'Great point!', reply_to_tweet_id: '1234567890' }
  });
}
\`\`\`

### 3. Like, retweet, follow (follow requires user ID lookup)
\`\`\`javascript
async () => {
  // Like a tweet (tweet ID in path)
  await xquik.request('/api/v1/x/tweets/1234567890/like', {
    method: 'POST', body: { account: '@myaccount' }
  });
  // Retweet
  await xquik.request('/api/v1/x/tweets/1234567890/retweet', {
    method: 'POST', body: { account: '@myaccount' }
  });
  // Follow - requires numeric user ID, look up first
  const user = await xquik.request('/api/v1/x/users/elonmusk');
  await xquik.request(\`/api/v1/x/users/\${user.id}/follow\`, {
    method: 'POST', body: { account: '@myaccount' }
  });
}
\`\`\`

### 4. Undo actions (unlike, unfollow, delete tweet)
\`\`\`javascript
async () => {
  await xquik.request('/api/v1/x/tweets/1234567890/like', {
    method: 'DELETE', body: { account: '@myaccount' }
  });
  await xquik.request('/api/v1/x/users/44196397/follow', {
    method: 'DELETE', body: { account: '@myaccount' }
  });
  await xquik.request('/api/v1/x/tweets/1234567890', {
    method: 'DELETE', body: { account: '@myaccount' }
  });
}
\`\`\`

### 5. Send DM (uses recipient user ID in path)
\`\`\`javascript
async () => {
  return xquik.request('/api/v1/x/dm/44196397', {
    method: 'POST',
    body: { account: '@myaccount', text: 'Hey, check this out!' }
  });
}
\`\`\`

### 6. Upload media via URL and tweet with image
\`\`\`javascript
async () => {
  const media = await xquik.request('/api/v1/x/media', {
    method: 'POST',
    body: { account: '@myaccount', url: 'https://example.com/photo.jpg' }
  });
  return xquik.request('/api/v1/x/tweets', {
    method: 'POST',
    body: { account: '@myaccount', text: 'Check this out!', media_ids: [media.mediaId] }
  });
}
\`\`\`

### 7. Update profile, avatar, or banner
\`\`\`javascript
async () => {
  // Update bio, name, location, URL
  await xquik.request('/api/v1/x/profile', {
    method: 'PATCH',
    body: { account: '@myaccount', name: 'New Name', bio: 'Building cool stuff' }
  });
  // Update avatar (url must be HTTPS, max 700 KB)
  await xquik.request('/api/v1/x/profile/avatar', {
    method: 'PATCH',
    body: { account: '@myaccount', url: 'https://example.com/avatar.jpg' }
  });
  // Update banner (max 2 MB)
  return xquik.request('/api/v1/x/profile/banner', {
    method: 'PATCH',
    body: { account: '@myaccount', url: 'https://example.com/banner.jpg' }
  });
}
\`\`\`

### 8. Search tweets with pagination (Subscription required)
\`\`\`javascript
async () => {
  // Use limit param for more than 20 results (max 200)
  return xquik.request('/api/v1/x/tweets/search', {
    query: { q: 'from:elonmusk', limit: '50' }
  });
}
\`\`\`

### 9. Look up a user or tweet
\`\`\`javascript
async () => {
  // User profile (name, bio, followers, following, verified, location)
  const user = await xquik.request('/api/v1/x/users/elonmusk');
  // Single tweet with full metrics
  const tweet = await xquik.request('/api/v1/x/tweets/1234567890');
  // Check if A follows B
  const follows = await xquik.request('/api/v1/x/followers/check', {
    query: { source: 'userA', target: 'userB' }
  });
  return { user, tweet, follows };
}
\`\`\`

### 10. Monitor an account + set up webhook
\`\`\`javascript
async () => {
  // Create monitor for new tweets, replies, follower changes
  const monitor = await xquik.request('/api/v1/monitors', {
    method: 'POST',
    body: { username: 'elonmusk', eventTypes: ['tweet.new', 'tweet.reply', 'follower.gained'] }
  });
  // Set up webhook to receive events (save the secret!)
  const webhook = await xquik.request('/api/v1/webhooks', {
    method: 'POST',
    body: { url: 'https://your-server.com/webhook', eventTypes: ['tweet.new', 'tweet.reply'] }
  });
  return { monitor, webhook };
}
\`\`\`

### 11. Run a giveaway draw from tweet replies
\`\`\`javascript
async () => {
  return xquik.request('/api/v1/draws', {
    method: 'POST',
    body: {
      tweetUrl: 'https://x.com/user/status/1234567890',
      winnerCount: 3,
      backupCount: 2,
      uniqueAuthorsOnly: true,
      mustRetweet: true,
      mustFollowUsername: 'myaccount',
      filterMinFollowers: 50
    }
  });
}
\`\`\`

### 12. Extract bulk data (followers, replies, communities)
\`\`\`javascript
async () => {
  // Always estimate cost first
  const estimate = await xquik.request('/api/v1/extractions/estimate', {
    method: 'POST',
    body: { toolType: 'follower_explorer', targetUsername: 'elonmusk', resultsLimit: 1000 }
  });
  if (!estimate.allowed) return { error: 'Would exceed quota', estimate };
  // Create extraction job
  const job = await xquik.request('/api/v1/extractions', {
    method: 'POST',
    body: { toolType: 'follower_explorer', targetUsername: 'elonmusk', resultsLimit: 1000 }
  });
  return job;
  // 23 tool types: reply_extractor, repost_extractor, quote_extractor, thread_extractor,
  // article_extractor, follower_explorer, following_explorer, verified_follower_explorer,
  // mention_extractor, post_extractor, community_extractor, community_moderator_explorer,
  // community_post_extractor, community_search, list_member_extractor, list_post_extractor,
  // list_follower_explorer, space_explorer, people_search, tweet_search_extractor,
  // favoriters, user_likes, user_media
}
\`\`\`

### 13. Browse trending topics (FREE)
\`\`\`javascript
async () => {
  return xquik.request('/api/v1/radar');
}
\`\`\`

### 14. Analyze a user's writing style
\`\`\`javascript
async () => {
  // Returns cached style if available (free for all users)
  // Auto-refreshes from X if cache is older than 7 days (subscription required)
  return xquik.request('/api/v1/styles', {
    method: 'POST',
    body: { username: 'dbdevletbahceli' }
  });
}
\`\`\`

### 15. Download media and get gallery link (Subscription required)
\`\`\`javascript
async () => {
  // Returns galleryUrl only (shareable gallery page with all media)
  return xquik.request('/api/v1/x/media/download', {
    method: 'POST',
    body: { tweetInput: '1234567890' } // tweet ID or full URL
  });
}
\`\`\`

### 16. Set up Telegram alerts for monitor events (FREE)
\`\`\`javascript
async () => {
  return xquik.request('/api/v1/integrations', {
    method: 'POST',
    body: {
      type: 'telegram',
      chatId: '123456789',
      eventTypes: ['tweet.new', 'tweet.reply', 'draw.completed', 'extraction.completed']
    }
  });
}
\`\`\`

### 17. Community actions (create, join, leave)
\`\`\`javascript
async () => {
  // Join a community
  await xquik.request('/api/v1/x/communities/99999/join', {
    method: 'POST', body: { account: '@myaccount' }
  });
  // Leave a community
  await xquik.request('/api/v1/x/communities/99999/join', {
    method: 'DELETE', body: { account: '@myaccount' }
  });
}
\`\`\`

### 18. Subscribe (FREE - returns checkout URL)
\`\`\`javascript
async () => {
  return xquik.request('/api/v1/subscribe', { method: 'POST' });
}
\`\`\`

### 19. Draft & optimize tweet text (3-step compose flow, FREE)
\`\`\`javascript
async () => {
  // Use this ONLY when the user wants help WRITING tweet text.
  // To SEND a tweet, use POST /api/v1/x/tweets instead.
  // Step 1: Get algorithm data
  const compose = await xquik.request('/api/v1/compose', {
    method: 'POST',
    body: { step: 'compose', topic: 'AI agents' }
  });
  return compose; // Returns contentRules, followUpQuestions, scorerWeights
  // After user answers: call with body { step: 'refine', goal, tone, topic }
  // After drafting: call with body { step: 'score', draft }
}
\`\`\`

## Cost
- Free: /api/v1/compose, /api/v1/styles (cached lookup/save/delete/compare), /api/v1/drafts, /api/v1/radar, /api/v1/subscribe, /api/v1/account, /api/v1/api-keys, /api/v1/bot/*, /api/v1/integrations/*, /api/v1/x/accounts, /api/v1/automations/*, /api/v1/support/*
- MPP pay-per-use (no account/subscription needed, 16 endpoints): GET /api/v1/x/tweets/:id ($0.00015/call), GET /api/v1/x/tweets/search ($0.00015/tweet), GET /api/v1/x/tweets/:id/quotes ($0.00015/tweet), GET /api/v1/x/tweets/:id/replies ($0.00015/tweet), GET /api/v1/x/tweets/:id/retweeters ($0.00015/user), GET /api/v1/x/tweets/:id/favoriters ($0.00015/user), GET /api/v1/x/tweets/:id/thread ($0.00015/tweet), GET /api/v1/x/users/:username ($0.00015/call), GET /api/v1/x/users/:id/tweets ($0.00015/tweet), GET /api/v1/x/users/:id/likes ($0.00015/tweet), GET /api/v1/x/users/:id/media ($0.00015/tweet), GET /api/v1/x/followers/check ($0.00075/call), GET /api/v1/x/articles/:tweetId ($0.00075/call), POST /api/v1/x/media/download ($0.00015/media), GET /api/v1/trends ($0.00045/call), GET /api/v1/x/trends ($0.00045/call)
- Subscription required: /api/v1/styles (X API refresh when cache >7 days), /api/v1/x/profile, /api/v1/x/communities, /api/v1/x/dm, /api/v1/extractions, /api/v1/draws, /api/v1/monitors, /api/v1/events, /api/v1/webhooks, /api/v1/styles/:username/performance, /api/v1/trending/:source
- Write actions (subscription required): POST /api/v1/x/tweets, DELETE /api/v1/x/tweets/:id, POST|DELETE /api/v1/x/tweets/:id/like, POST /api/v1/x/tweets/:id/retweet, POST|DELETE /api/v1/x/users/:id/follow, POST /api/v1/x/dm/:userId, POST /api/v1/x/media, PATCH /api/v1/x/profile, PATCH /api/v1/x/profile/avatar, PATCH /api/v1/x/profile/banner, POST|DELETE /api/v1/x/communities, POST|DELETE /api/v1/x/communities/:id/join
- IMPORTANT: Always attempt the request. Never assume subscription status. The API returns a clear error if subscription is missing.
- MPP MODE: When configured with a signing key (no API key), the mppx SDK auto-handles 402 challenges by paying on-chain. Only the 16 MPP-eligible endpoints work in this mode.

## Error handling
- If response contains "subscription is inactive" or status 402, call POST /api/v1/subscribe to get checkout URL
- NEVER combine free and paid calls in Promise.all - a 402 on one call kills all results. Call free endpoints first, then paid ones separately
- If a paid call fails, still use free data already fetched (radar, styles, compose). Never discard free data or fall back to web search
- API errors include status code and message`;

const EXECUTION_TIMEOUT_MS = 30_000;
const MS_PER_SECOND = 1000;

interface TweetclawOptions {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly code: string;
  readonly fetchFunction?: FetchFunction | undefined;
  readonly timeoutMs?: number | undefined;
}

async function handleTweetclaw(options: Readonly<TweetclawOptions>): Promise<ToolResult> {
  const { apiKey, baseUrl, code, fetchFunction, timeoutMs = EXECUTION_TIMEOUT_MS } = options;
  try {
    const request: RequestFunction = createProxiedRequest(baseUrl, apiKey, fetchFunction);

    const result: unknown = await Promise.race([
      runInSandbox(code, { xquik: { request }, spec: { endpoints: specEndpoints } }),
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error(`Execution timed out after ${String(timeoutMs / MS_PER_SECOND)}s`));
        }, timeoutMs);
      }),
    ]);

    return successResult(result);
  } catch (error: unknown) {
    return errorResult(error);
  }
}

export { EXECUTE_DESCRIPTION, handleTweetclaw };
