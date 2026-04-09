# TweetClaw

[![npm](https://img.shields.io/npm/v/@xquik/tweetclaw)](https://www.npmjs.com/package/@xquik/tweetclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![GitHub stars](https://img.shields.io/github/stars/Xquik-dev/tweetclaw)

Post tweets, reply, like, retweet, follow, DM & more - directly from your chat. Full X/Twitter automation for [OpenClaw](https://github.com/openclaw/openclaw).

Powered by [Xquik](https://xquik.com), the all-in-one X automation platform. **Reads from $0.00015/call - 33x cheaper than the official X API.**

## Pricing

TweetClaw uses Xquik's credit-based pricing. 1 credit = $0.00015.

### vs Official X API

| | Xquik (via TweetClaw) | X API Basic | X API Pro |
|---|---|---|---|
| **Monthly cost** | **$20** | $100 | $5,000 |
| **Cost per tweet read** | **$0.00015** | ~$0.01 | ~$0.005 |
| **Cost per user lookup** | **$0.00015** | ~$0.01 | ~$0.005 |
| **Write actions** | **$0.0015** | Limited | Limited |
| **Bulk extraction** | **$0.00015/result** | Not available | Not available |
| **Monitoring + webhooks** | **Free** | Not available | Not available |
| **Giveaway draws** | **$0.00015/entry** | Not available | Not available |

### Per-Operation Costs

| Operation | Credits | Cost |
|-----------|---------|------|
| Read (tweet, search, timeline, bookmarks, etc.) | 1 | $0.00015 |
| Read (user profile, verified followers, followers you know) | 1 | $0.00015 |
| Read (favoriters) | 1 | $0.00015 |
| Read (trends) | 3 | $0.00045 |
| Follow check, article | 7 | $0.00105 |
| Write (tweet, like, retweet, follow, DM, etc.) | 10 | $0.0015 |
| Extraction (tweets, replies, quotes, mentions, posts, likes, media, search, favoriters, retweeters, community members, people search, list members, list followers) | 1/result | $0.00015/result |
| Extraction (followers, following, verified followers) | 1/result | $0.00015/result |
| Extraction (articles) | 5/result | $0.00075/result |
| Draw | 1/entry | $0.00015/entry |
| Monitors, webhooks, radar, compose, drafts, integrations | 0 | **Free** |

### Pay-Per-Use (No Subscription)

Two options:

- **Credits**: Top up credits via the API ($10 minimum). 1 credit = $0.00015. Works with all 121 endpoints.
- **MPP**: 32 read-only X-API endpoints accept anonymous on-chain payments via Machine Payments Protocol. No account needed. SDK: `npm i mppx viem`.

### Free Operations

Tweet composition, style analysis, drafts, curated radar (7 sources), account management, integrations, automations, support tickets - all free, no credits consumed.

## Install

```bash
openclaw plugins install @xquik/tweetclaw
```

## Configure

### Option A: API key (full access, 121 endpoints)

Get an API key at [dashboard.xquik.com](https://dashboard.xquik.com/). Store it in an environment variable and configure TweetClaw to use it:

```bash
openclaw config set plugins.entries.tweetclaw.config.apiKey "$XQUIK_API_KEY"
```

**Security**: Always reference your key via an environment variable — never paste raw keys into shell commands or config files.

### Option B: Credits (pay-per-use, no subscription)

Top up credits from the Xquik dashboard or via `POST /credits/topup`. All 121 endpoints available. 1 credit = $0.00015.

### Option C: MPP pay-per-use (no account needed, 32 read-only endpoints)

MPP (Machine Payments Protocol) lets agents pay per API call without an account, API key, or subscription. 32 read-only endpoints. Create an MPP account with `mppx account create`. The signing key stays local and is only used to sign payment proofs.

```bash
npm i mppx viem
openclaw config set plugins.entries.tweetclaw.config.tempoSigningKey "$MPP_SIGNING_KEY"
```

**Security**: Always store your signing key in an environment variable — never paste raw keys into shell commands or config files.

MPP-eligible endpoints: tweet lookup ($0.00015), tweet search ($0.00015/tweet), user lookup ($0.00015), user tweets ($0.00015/tweet), follower check ($0.00105), article lookup ($0.00105), media download ($0.00015/media), trends ($0.00045), X trends ($0.00045), quotes ($0.00015/tweet), replies ($0.00015/tweet), retweeters ($0.00015/user), favoriters ($0.00015/user), thread ($0.00015/tweet), user likes ($0.00015/tweet), user media ($0.00015/tweet), community info ($0.00015), community members ($0.00015/user), community moderators ($0.00015/user), community tweets ($0.00015/tweet), community search ($0.00015/community), communities tweets ($0.00015/tweet), list followers ($0.00015/user), list members ($0.00015/user), list tweets ($0.00015/tweet), users batch ($0.00015/user), users search ($0.00015/user), user followers ($0.00015/user), followers you know ($0.00015/user), user following ($0.00015/user), user mentions ($0.00015/tweet), verified followers ($0.00015/user).

### Optional settings

```bash
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled true
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

## Tools

TweetClaw uses Xquik's 2-tool approach to cover the entire API:

### `explore` (free, no network)

Search the API spec to find endpoints. No API calls are made.

```
You: "What endpoints are available for tweet composition?"

AI uses explore → filters spec by category "composition"
→ Returns matching endpoints with parameters and response shapes
```

### `tweetclaw` (execute API calls)

Execute authenticated API calls. Auth is injected automatically - the LLM never sees your API key.

```
You: "Post a tweet saying 'Hello from TweetClaw!'"

AI uses tweetclaw → finds connected account, posts tweet
→ Returns { tweetId, success: true }
```

```
You: "Search tweets about AI agents"

AI uses explore → finds /api/v1/x/tweets/search
AI uses tweetclaw → calls the endpoint with auth
→ Returns tweet results
```

## Commands

Instant responses, no LLM needed:

| Command | Description |
|---------|-------------|
| `/xstatus` | Account info, subscription status, usage, credit balance |
| `/xtrends` | Trending topics from curated sources |
| `/xtrends tech` | Trending topics filtered by category |

## Event Notifications

When polling is enabled (default), TweetClaw checks for new events every 60 seconds and delivers them to your chat:

- **Monitor alerts**: New tweets, replies, quotes, retweets from monitored accounts
- **Follower changes**: Gained or lost followers on monitored accounts

Set up a monitor first:

```
You: "Monitor @elonmusk for new tweets and follower changes"
```

## API Coverage

121 endpoints across 12 categories:

| Category | Examples | Cost |
|----------|---------|------|
| **Write Actions** | Post tweets, reply, like, retweet, follow, unfollow, DM, update profile, avatar, banner | 10 credits |
| **Media** | Upload media via URL, download tweet media, get gallery links | 1-2 credits |
| **Twitter** | Search tweets, look up users, user tweets/likes/media, favoriters, mutual followers, check follows, articles, bookmarks, notifications, timeline, DM history | 1-5 credits |
| **Composition** | Compose, refine, score tweets; manage drafts; analyze writing styles | Free |
| **Extraction** | Run extraction jobs (23 tool types: replies, followers, communities, favoriters, user_likes, user_media, etc.) | 1-5 credits/result |
| **Draws** | Run giveaway draws on tweets, export results | 1 credit/entry |
| **Monitoring** | Create monitors, view events, manage webhooks | Free |
| **Automations** | Create flows, add steps, test runs, inbound webhooks | Free |
| **Account** | Manage API keys, subscription, connected X accounts | Free |
| **Credits** | Check balance, top up credits | Free |
| **Trends** | X trending topics, curated radar from 7 sources | 3 credits / Free |
| **Support** | Create tickets, reply, track status | Free |

## Links

- [Xquik Platform](https://xquik.com)
- [API Documentation](https://docs.xquik.com)
- [Billing & Pricing](https://docs.xquik.com/guides/billing)
- [npm Package](https://www.npmjs.com/package/@xquik/tweetclaw)
- [OpenClaw](https://github.com/openclaw/openclaw)

## License

MIT
