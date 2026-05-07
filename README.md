# TweetClaw

[![npm](https://img.shields.io/npm/v/@xquik/tweetclaw)](https://www.npmjs.com/package/@xquik/tweetclaw)
[![npm downloads](https://img.shields.io/npm/dm/@xquik/tweetclaw.svg)](https://www.npmjs.com/package/@xquik/tweetclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![GitHub stars](https://img.shields.io/github/stars/Xquik-dev/tweetclaw)
[![Ask DeepWiki](https://deepwiki.com/badge.svg?url=https%3A%2F%2Fgithub.com%2FXquik-dev%2Ftweetclaw)](https://deepwiki.com/Xquik-dev/tweetclaw)
[![Context7](https://img.shields.io/badge/Context7-agent_docs-059669)](https://context7.com/xquik-dev/tweetclaw)
[![Glama MCP server](https://glama.ai/mcp/servers/Xquik-dev/x-twitter-scraper/badges/score.svg)](https://glama.ai/mcp/servers/Xquik-dev/x-twitter-scraper)
[![Smithery](https://smithery.ai/badge/xquik/x-twitter-scraper)](https://smithery.ai/servers/xquik/x-twitter-scraper)
[![Apify Actor](https://apify.com/actor-badge?actor=xquik/x-tweet-scraper)](https://apify.com/xquik/x-tweet-scraper)

Post tweets, reply, like, retweet, follow, DM & more - directly from your chat. Full X/Twitter automation for [OpenClaw](https://github.com/openclaw/openclaw).

Hermes Agent users should use [Hermes Tweet](https://github.com/Xquik-dev/hermes-tweet), the native Python plugin for the same Xquik API contract.

Powered by [Xquik](https://xquik.com), the all-in-one X automation platform. **Post reads from $0.00015/call - about 33x cheaper than official X API post reads.**

## Pricing

TweetClaw uses Xquik's credit-based pricing. 1 credit = $0.00015.

### vs Official X API

| | Xquik (via TweetClaw) | Official X pay-per-usage | Notes |
|---|---|---|---|
| **Access model** | **$20/month full API, plus pay-per-use options** | No subscriptions or commitments | Basic and Pro are legacy package names |
| **Cost per post read** | **$0.00015** | $0.005 per resource | Xquik is about 33x cheaper |
| **Cost per user lookup** | **$0.00015** | $0.010 per resource | Xquik is about 67x cheaper |
| **Cost per trend read** | **$0.00045** | $0.010 per resource | Xquik is about 22x cheaper |
| **Write actions** | **$0.0015** | $0.015 content or interaction create; $0.200 content create with URL | Xquik is 10x cheaper for matching $0.015 write classes |
| **Bulk extraction** | **$0.00015/result** | Charged per returned resource | Built-in extraction jobs are included with Xquik |
| **Monitoring + webhooks** | **Free** | No direct monitor product in pricing table | Real-time delivery is included |
| **Giveaway draws** | **$0.00015/entry** | No comparable draw product | Draw engine is included |

Source: [official X API pricing](https://docs.x.com/x-api/getting-started/pricing), which lists current pay-per-usage read and write rates.

### Per-Operation Costs

| Operation | Credits | Cost |
|-----------|---------|------|
| Read (tweet, search, timeline, bookmarks, etc.) | 1 | $0.00015 |
| Read (user profile, verified followers, followers you know) | 1 | $0.00015 |
| Read (favoriters) | 1 | $0.00015 |
| Read (trends) | 3 | $0.00045 |
| Follow check, article | 5 | $0.00075 |
| Write (tweet, like, retweet, follow, DM, etc.) | 10 | $0.0015 |
| Extraction (tweets, replies, quotes, mentions, posts, likes, media, search, favoriters, retweeters, community members, people search, list members, list followers) | 1/result | $0.00015/result |
| Extraction (followers, following, verified followers) | 1/result | $0.00015/result |
| Extraction (articles) | 5/result | $0.00075/result |
| Draw | 1/entry | $0.00015/entry |
| Monitors, webhooks, radar, compose, drafts | 0 | **Free** |

### Pay-Per-Use (No Subscription)

Two options:

- **Credits**: Top up credits in the Xquik dashboard. The plugin can read the current balance.
- **MPP**: 31 read-only X-API endpoints accept anonymous on-chain payments via Machine Payments Protocol. No account needed. SDK: `npm i mppx viem`.

### Free Operations

Tweet composition, style analysis, drafts, curated radar (7 sources), and account status checks are free.

## Install

```bash
openclaw plugins install @xquik/tweetclaw
```

TweetClaw can be installed before credentials are configured. Until you add an API key or MPP signing key, the free `explore` catalog remains available and live API calls return setup guidance instead of failing plugin installation.

> **Note:** `@xquik/tweetclaw` is the only official npm package. Any other scope (for example `@intentsolutionsio/tweetclaw`) is an unofficial redistribution and may ship stale metadata or outdated endpoint counts.

## Configure

### Option A: API key (account-backed X automation)

Get an API key at [dashboard.xquik.com](https://dashboard.xquik.com/). Store it in an environment variable and configure TweetClaw to use it:

```bash
openclaw config set plugins.entries.tweetclaw.config.apiKey "$XQUIK_API_KEY"
```

**Security**: Keep the key out of chats, docs, and shell history. Prefer the environment-variable command above so OpenClaw writes the secret to its local config without exposing it in the prompt.

### Option B: Credits (pay-per-use, no subscription)

Top up credits from the Xquik dashboard. TweetClaw does not create checkout sessions or charge saved payment methods from the agent.

### Option C: MPP pay-per-use (no account needed, 31 read-only endpoints)

MPP (Machine Payments Protocol) lets agents pay per API call without an account, API key, or subscription. 31 read-only endpoints. Create an MPP account with `mppx account create`. The signing key stays local and is only used to sign payment proofs.

```bash
npm i mppx viem
openclaw config set plugins.entries.tweetclaw.config.tempoSigningKey "$MPP_SIGNING_KEY"
```

**Security**: Keep the signing key out of chats, docs, and shell history. Prefer the environment-variable command above so OpenClaw writes the secret to its local config without exposing it in the prompt.

MPP-eligible endpoints: tweet lookup ($0.00015), tweet search ($0.00015/tweet), user lookup ($0.00015), user tweets ($0.00015/tweet), follower check ($0.00105), article lookup ($0.00105), trends ($0.00045), X trends ($0.00045), quotes ($0.00015/tweet), replies ($0.00015/tweet), retweeters ($0.00015/user), favoriters ($0.00015/user), thread ($0.00015/tweet), user likes ($0.00015/tweet), user media ($0.00015/tweet), community info ($0.00015), community members ($0.00015/user), community moderators ($0.00015/user), community tweets ($0.00015/tweet), community search ($0.00015/community), communities tweets ($0.00015/tweet), list followers ($0.00015/user), list members ($0.00015/user), list tweets ($0.00015/tweet), users batch ($0.00015/user), users search ($0.00015/user), user followers ($0.00015/user), followers you know ($0.00015/user), user following ($0.00015/user), user mentions ($0.00015/tweet), verified followers ($0.00015/user).

### Enable the optional action tool

OpenClaw loads `explore` as the safe catalog tool. The live endpoint invoker, `tweetclaw`, is registered as an optional tool because it can perform paid reads, private reads, and write actions.

OpenClaw's local onboarding default is often `tools.profile: "coding"`, which excludes external plugin tools from agent runs until they are explicitly allowed. If the agent can see the TweetClaw skill but cannot call the tools, add the tool names to `tools.alsoAllow` so you keep the normal coding tools and opt into TweetClaw.

```bash
openclaw config set tools.alsoAllow '["explore", "tweetclaw"]'
```

Verify runtime registration after install or update:

```bash
openclaw plugins inspect tweetclaw --runtime
openclaw skills info tweetclaw
```

### Optional settings

```bash
openclaw config set plugins.entries.tweetclaw.config.baseUrl "https://xquik.com"
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled true
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

Only change `baseUrl` for a self-hosted Xquik-compatible API. TweetClaw requires an HTTPS base URL with no embedded credentials.

## Tools

TweetClaw uses 2 structured tools for the agent-safe endpoint catalog:

### `explore` (free, no network)

Search the API spec to find endpoints. No API calls are made.

```
You: "What endpoints are available for tweet composition?"

AI uses explore → filters spec by category "composition"
→ Returns matching endpoints with parameters and response shapes
```

### `tweetclaw` (invoke API endpoints)

Invoke catalog-listed API endpoints with structured `path`, `method`, `query`, and `body` fields. Auth is injected automatically - the LLM never sees your API key.

This tool is optional in OpenClaw. If your agent can see the skill but cannot call TweetClaw tools, add `explore` and `tweetclaw` to `tools.alsoAllow` so your normal tool profile stays intact.

OpenClaw approval prompts are enforced before write-like `tweetclaw` tool calls. Review the structured request before approving any post, delete, follow, DM, monitor, extraction, webhook, or profile-change action.

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

Set up a monitor first:

```
You: "Monitor @elonmusk for new tweets, replies, and retweets"
```

## API Coverage

99 agent-callable endpoints across 9 categories. Dashboard-only account-admin, billing, support, and raw credential flows are excluded from the tool catalog and blocked at runtime.

| Category | Examples | Cost |
|----------|---------|------|
| **Account** | Account status | Free |
| **Composition** | Compose, drafts, writing styles, radar | Free / Mixed |
| **Credits** | Check balance | Free |
| **Extraction** | 23 extraction tools, giveaway draws, exports | 1-5 credits/result |
| **Media** | Upload media via URL, download tweet media, get gallery links | 1-2 credits |
| **Monitoring** | Create monitors, view events, manage webhooks | Free |
| **Twitter** | Search, lookups, timelines, articles, trends, bookmarks, notifications | 1-5 credits |
| **X Accounts** | List connected account handles for explicit user-selected actions | Free |
| **X Write** | Post, reply, like, retweet, follow, remove follower, DM, profile, communities | 10 credits |

## Links

- [Xquik Platform](https://xquik.com)
- [API Documentation](https://docs.xquik.com)
- [Billing & Pricing](https://docs.xquik.com/guides/billing)
- [Context7 Agent Docs](https://context7.com/xquik-dev/tweetclaw)
- [OpenClaw Setup Guide](docs/openclaw-setup.md)
- [Agent Workflow Guide](docs/agent-workflows.md)
- Framework guides: [Mastra](https://docs.xquik.com/guides/mastra), [CrewAI](https://docs.xquik.com/guides/crewai), [LangChain](https://docs.xquik.com/guides/langchain), [Pydantic AI](https://docs.xquik.com/guides/pydantic-ai), [Google ADK](https://docs.xquik.com/guides/google-adk), [Microsoft Agent Framework](https://docs.xquik.com/guides/microsoft-agent-framework), [n8n](https://docs.xquik.com/guides/n8n), [Zapier](https://docs.xquik.com/guides/zapier), [Make](https://docs.xquik.com/guides/make), [Pipedream](https://docs.xquik.com/guides/pipedream), [Composio migration](https://docs.xquik.com/guides/composio-migration)
- [npm Package](https://www.npmjs.com/package/@xquik/tweetclaw)
- [Hermes Tweet for Hermes Agent](https://github.com/Xquik-dev/hermes-tweet)
- [OpenClaw](https://github.com/openclaw/openclaw)

## License

MIT
