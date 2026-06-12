# TweetClaw

[![npm](https://img.shields.io/npm/v/@xquik/tweetclaw)](https://registry.npmjs.org/@xquik%2ftweetclaw)
[![npm downloads](https://img.shields.io/npm/dm/@xquik/tweetclaw.svg)](https://registry.npmjs.org/@xquik%2ftweetclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![GitHub stars](https://img.shields.io/github/stars/Xquik-dev/tweetclaw)
[![Ask DeepWiki](https://deepwiki.com/badge.svg?url=https%3A%2F%2Fgithub.com%2FXquik-dev%2Ftweetclaw)](https://deepwiki.com/Xquik-dev/tweetclaw)
[![Context7](https://img.shields.io/badge/Context7-agent_docs-059669)](https://context7.com/xquik-dev/tweetclaw)
[![Skills.sh](https://skills.sh/b/xquik-dev/tweetclaw)](https://skills.sh/xquik-dev/tweetclaw)
[![Skills.sh x-twitter-scraper Skill](https://skills.sh/b/xquik-dev/x-twitter-scraper)](https://skills.sh/xquik-dev/x-twitter-scraper)
[![ClawHub](https://img.shields.io/badge/ClawHub-TweetClaw-2563eb)](https://clawhub.ai/plugins/@xquik/tweetclaw)
[![Smithery](https://smithery.ai/badge/github/Xquik-dev/tweetclaw)](https://smithery.ai/servers/github/Xquik-dev/tweetclaw)
<a href="https://nothumansearch.ai/site/xquik.com" target="_blank" rel="noopener"><img src="https://nothumansearch.ai/badge/xquik.com.svg" alt="NHS Agentic Readiness Score" height="28"></a>
[![Apify Actor](https://apify.com/actor-badge?actor=xquik/x-tweet-scraper)](https://apify.com/xquik/x-tweet-scraper)

Search tweets, search tweet replies, post tweets, post tweet replies, export
followers, monitor X/Twitter, manage media, send direct messages, and run
giveaway draws from [OpenClaw](https://github.com/openclaw/openclaw).

Use TweetClaw as an OpenClaw tweet scraper and X/Twitter automation plugin. Search tweets, search tweet replies, post tweets, post tweet replies, scrape tweets, run follower export, perform user lookup, handle media upload and media download, send direct messages, monitor tweets, deliver webhooks, and run giveaway draws. Powered by [Xquik](https://xquik.com), the all-in-one X automation platform.

## Install

```bash
openclaw plugins install npm:@xquik/tweetclaw
```

This command installs the official npm package `@xquik/tweetclaw` with OpenClaw's explicit npm source selector. Bare `@xquik/tweetclaw` installs still work during OpenClaw's launch cutover, but `npm:` keeps the source deterministic because npm is the canonical install source while the [ClawHub discovery page](https://clawhub.ai/plugins/@xquik/tweetclaw) lags behind the npm release.

For normal upgrades, reuse the tracked install source:

```bash
openclaw plugins update tweetclaw
```

For reproducible production installs, pin a published npm version:

```bash
openclaw plugins install npm:@xquik/tweetclaw@<version> --pin
```

OpenClaw keeps pinned records on the selected version during later `plugins update tweetclaw` runs. Move back to the default npm release line with `openclaw plugins update @xquik/tweetclaw` when you want the current stable package again.

Current source metadata targets OpenClaw `2026.6.6` or newer. Update OpenClaw before testing source builds or freshly packed artifacts from this repository.

If your OpenClaw install runs with `OPENCLAW_NIX_MODE=1`, plugin lifecycle
mutators are disabled. Install or update TweetClaw through your Nix OpenClaw
source instead of `openclaw plugins install` or `openclaw plugins update`.

TweetClaw can be installed before credentials are configured. Until you add an API key or MPP signing key, the free `explore` catalog remains available and live API calls return setup guidance instead of failing plugin installation.

Agent-skill installers can also discover TweetClaw through [Skills.sh](https://skills.sh/xquik-dev/tweetclaw). This installs the packaged `SKILL.md` for agents that use skills directories; use the OpenClaw command above for the plugin runtime.

```bash
npx skills add xquik-dev/tweetclaw
```

> **Note:** `@xquik/tweetclaw` is the only official npm package. Any other scope (for example `@intentsolutionsio/tweetclaw`) is an unofficial redistribution and may ship stale metadata or outdated endpoint counts.

## Pricing

TweetClaw uses Xquik billing for account-backed automation, credit top-ups, and
optional MPP pay-per-use reads. See [Billing & Pricing](https://docs.xquik.com/guides/billing)
for the current plans, eligible endpoints, and operation costs.

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

MPP-eligible read endpoints include tweet lookup, tweet search, user lookup,
user tweets, follower checks, articles, trends, quotes, replies, retweeters,
favoriters, threads, user likes, user media timeline reads, communities, lists,
users batch lookup, people search, followers, following, mentions, and verified
followers. See the billing guide for current endpoint eligibility and costs.

Media downloads and gallery creation are not MPP-eligible. The user media endpoint returns a user's media-tweet timeline; it does not download files or create gallery links.

### Enable the optional action tool

OpenClaw loads `explore` as the safe catalog tool. The live endpoint invoker, `tweetclaw`, is registered as an optional tool because it can perform paid reads, private reads, and write actions.

OpenClaw's local onboarding default is often `tools.profile: "coding"`, which excludes external plugin tools from agent runs until they are explicitly allowed. If the agent can see the TweetClaw skill but cannot call the tools, add the tool names to `tools.alsoAllow` so you keep the normal coding tools and opt into TweetClaw.

```bash
openclaw config set tools.alsoAllow '["explore", "tweetclaw"]'
```

Verify runtime registration after install or update:

```bash
openclaw plugins inspect tweetclaw --runtime --json
openclaw skills info tweetclaw
```

The runtime inspection should show the loaded `tweetclaw` plugin, the `explore`
tool, the optional `tweetclaw` tool, the `before_tool_call` approval hook, and
the `xtrends` command. A managed Gateway with reload enabled can restart
automatically after install or update; otherwise run `openclaw gateway restart`
before inspecting live runtime surfaces. Use
`OPENCLAW_PLUGIN_LIFECYCLE_TRACE=1 openclaw plugins inspect tweetclaw --runtime --json`
when install or runtime inspection is slow; OpenClaw keeps JSON output parseable
while printing lifecycle timing to stderr.

For release-like local checks, pack and install the artifact rather than a repo folder so OpenClaw loads the published `dist/index.js` entry:

```bash
npm pack
openclaw plugins install npm-pack:./xquik-tweetclaw-<version>.tgz
openclaw plugins inspect tweetclaw --runtime --json
```

Maintainers should run `npm run check-openclaw-platform-fitness` after `npm run build`. The gate keeps package metadata, OpenClaw compatibility fields, manifest tool ownership, optional-tool metadata, approval hooks, runtime entries, docs, and the packaged skill aligned.

### Optional settings

```bash
openclaw config set plugins.entries.tweetclaw.config.baseUrl "https://xquik.com"
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled true
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

Only change `baseUrl` for a self-hosted Xquik-compatible API. TweetClaw requires an HTTPS base URL with no embedded credentials.

## OpenClaw Trust Model

TweetClaw uses 2 OpenClaw gates:

- Optional tool exposure: `explore` is always safe local catalog search, while
  `tweetclaw` stays optional until the user allows it with `tools.alsoAllow`.
- Per-call approval: write-like, private, paid, recurring, extraction, monitor,
  webhook, and account-scoped calls trigger a plugin approval prompt. TweetClaw
  offers one-time approval or deny for those calls so a social-account action is
  reviewed each time.

That shape makes TweetClaw useful for source-backed social workflows without
turning an agent into an unattended publisher. Good OpenClaw use cases include
searching tweets before a draft, checking tweet replies before a giveaway draw,
exporting followers for review, collecting user lookup context, uploading media
for an approved post, monitoring tweets after the user creates a monitor, and
using webhooks for reviewed follow-up automation.

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

OpenClaw approval prompts are enforced before write-like `tweetclaw` tool calls. Review the structured request before approving any post, delete, follow, DM, monitor, extraction, webhook, or profile-change action. Risky calls offer one-time approval or deny so future social-account actions still require review.

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

| Category | Examples | Access |
|----------|---------|--------|
| **Account** | Account status | Account-backed |
| **Composition** | Compose, drafts, writing styles, radar | Account-backed |
| **Credits** | Check balance | Account-backed |
| **Extraction** | 23 extraction tools, giveaway draws, exports | Account-backed |
| **Media** | Upload media via URL, authenticated media download, gallery links | Account-backed |
| **Monitoring** | Create monitors, view events, manage webhooks | Account-backed |
| **Twitter** | Search, lookups, timelines, articles, trends, bookmarks, notifications | Account-backed or MPP where eligible |
| **X Accounts** | List connected account handles for explicit user-selected actions | Account-backed |
| **X Write** | Post, reply, like, retweet, follow, remove follower, DM, profile, communities | Account-backed with approval |

Media download requires authenticated access and is not MPP-eligible. MPP only includes media-tweet timeline reads, not file download or gallery creation.

## Links

- [Xquik Platform](https://xquik.com)
- [API Documentation](https://docs.xquik.com)
- [Billing & Pricing](https://docs.xquik.com/guides/billing)
- [Context7 Agent Docs](https://context7.com/xquik-dev/tweetclaw)
- [OpenClaw Setup Guide](docs/openclaw-setup.md)
- [Agent Workflow Guide](docs/agent-workflows.md)
- Framework guides: [Mastra](https://docs.xquik.com/guides/mastra), [CrewAI](https://docs.xquik.com/guides/crewai), [LangChain](https://docs.xquik.com/guides/langchain), [Pydantic AI](https://docs.xquik.com/guides/pydantic-ai), [Google ADK](https://docs.xquik.com/guides/google-adk), [Microsoft Agent Framework](https://docs.xquik.com/guides/microsoft-agent-framework), [n8n](https://docs.xquik.com/guides/n8n), [Zapier](https://docs.xquik.com/guides/zapier), [Make](https://docs.xquik.com/guides/make), [Pipedream](https://docs.xquik.com/guides/pipedream), [Composio migration](https://docs.xquik.com/guides/composio-migration)
- [npm Registry Metadata](https://registry.npmjs.org/@xquik%2ftweetclaw)
- [OpenClaw](https://github.com/openclaw/openclaw)

## License

MIT
