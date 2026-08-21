# TweetClaw: OpenClaw Twitter Search, Followers & Automation

> **Xquik is an independent third-party service.** Not affiliated with X Corp.
> "Twitter" and "X" are trademarks of X Corp.

[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/13730/badge)](https://www.bestpractices.dev/projects/13730)
[![npm](https://img.shields.io/npm/v/@xquik%2Ftweetclaw.svg)](https://registry.npmjs.org/@xquik%2ftweetclaw)
[![npm downloads](https://img.shields.io/npm/dm/@xquik/tweetclaw.svg)](https://registry.npmjs.org/@xquik%2ftweetclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![GitHub stars](https://img.shields.io/github/stars/Xquik-dev/tweetclaw.svg)
[![Ask DeepWiki](https://deepwiki.com/badge.svg?url=https%3A%2F%2Fgithub.com%2FXquik-dev%2Ftweetclaw)](https://deepwiki.com/Xquik-dev/tweetclaw)
[![Context7](https://img.shields.io/badge/Context7-agent_docs-059669)](https://context7.com/xquik-dev/tweetclaw)
[![Skills.sh](https://www.skills.sh/b/xquik-dev/tweetclaw)](https://www.skills.sh/xquik-dev/tweetclaw)
[![Skills.sh x-twitter-scraper Skill](https://www.skills.sh/b/xquik-dev/x-twitter-scraper)](https://www.skills.sh/xquik-dev/x-twitter-scraper)
<a href="https://nothumansearch.ai/site/xquik.com" target="_blank" rel="noopener"><img src="https://nothumansearch.ai/badge/xquik.com.svg" alt="NHS Agentic Readiness Score" height="28"></a>
[![Apify Actor](https://apify.com/actor-badge?actor=xquik/x-tweet-scraper)](https://apify.com/xquik/x-tweet-scraper)

TweetClaw connects [OpenClaw](https://github.com/openclaw/openclaw) to Xquik for
Twitter search, follower exports, monitoring, media, and approved X actions. Use
Xquik MCP with remote MCP clients and an SDK in application code.

## Common OpenClaw tasks

Use `explore` before every live call. It returns the current supported route.

| Customer Question | Catalog Query | Next Step |
| --- | --- | --- |
| How can I search tweets? | `search tweets by query` | Call the listed read route. |
| How can I read an X timeline? | `list recent tweets posted by a user` | Approve private timelines. |
| How can I export followers? | `run extraction` | Choose followers, then approve. |
| How can I scrape following accounts? | `run extraction` | Choose following, then approve. |
| How can I monitor an account or keyword? | `create monitor` | Approve recurring usage. |
| How can I post or reply? | `create tweet` | Approve each write. |

## Read response fields

TweetClaw keeps every allowed Xquik response field. Optional fields remain absent
when X omits them. Request `next_cursor` while `has_next_page` is true.

Fetching-account bookmark, like, follow, block, mute, and notification state stays private.

See [Read Data Richness](https://docs.xquik.com/guides/read-data-richness)
for exact tweet, profile, and media fields.

## Install

```bash
openclaw plugins install clawhub:@xquik/tweetclaw
```

OpenClaw records the verified ClawHub publisher scope and package as the update source.

Use `openclaw plugins install npm:@xquik/tweetclaw` when you need the npm fallback.

For normal upgrades, reuse the tracked install source:

```bash
openclaw plugins update tweetclaw
```

For reproducible production installs, pin a published npm version:

```bash
openclaw plugins install npm:@xquik/tweetclaw@<version> --pin
```

Pinned installs stay pinned during updates. Run
`openclaw plugins update @xquik/tweetclaw` to return to the stable release line.

Source builds require OpenClaw `2026.7.1` or newer.

If your OpenClaw install runs with `OPENCLAW_NIX_MODE=1`, plugin lifecycle
mutators are disabled. Install or update TweetClaw through your Nix OpenClaw
source instead of `openclaw plugins install` or `openclaw plugins update`.

Install TweetClaw before adding credentials if needed. The free `explore`
catalog works immediately; live calls return setup guidance.

Agents with skill directories can install the packaged `SKILL.md` through
[Skills.sh](https://www.skills.sh/xquik-dev/tweetclaw). Use the OpenClaw command
above for the plugin runtime.

```bash
npx skills add xquik-dev/tweetclaw
```

TweetClaw is an OpenClaw plugin, not an MCP server. For remote MCP clients, add
`https://xquik.com/mcp`, then follow the [current client compatibility
path](https://docs.xquik.com/mcp/overview#client-compatibility). OAuth-capable
clients complete OAuth 2.1. Clients that support custom bearer headers can use
an Xquik API key. ChatGPT custom apps require OAuth.

> **Codex OAuth compatibility:** Affected Codex releases discard the RFC 9207
> `iss` callback value even though Xquik returns it. If Codex reports
> `Authorization server response missing required issuer: expected https://xquik.com`,
> use `XQUIK_API_KEY` through the Codex `bearer_token_env_var` setting. Follow the
> [Codex OAuth troubleshooting guide](https://docs.xquik.com/guides/troubleshooting#codex-oauth-issuer-validation-error)
> and track [openai/codex#31573](https://github.com/openai/codex/issues/31573).

## Pricing & access

TweetClaw uses Xquik billing for account-backed automation and optional MPP
reads. See [Billing & Pricing](https://docs.xquik.com/guides/billing). Check it
for current plans, eligible endpoints, and live prices.

## Configure

### API key: account-backed X automation

Create an API key at [dashboard.xquik.com](https://dashboard.xquik.com/), then
store it through OpenClaw:

```bash
openclaw config set plugins.entries.tweetclaw.config.apiKey "$XQUIK_API_KEY"
```

Keep the key out of chats, documentation, logs, and shell history.

### Credits: pay per use without a subscription

Top up credits from the Xquik dashboard. An API key can spend prepaid credits across 33 public paid-read routes without a subscription. TweetClaw does not create checkout sessions or charge saved payment methods from the agent.

### Direct MPP: accountless pay per use

Machine Payments Protocol (MPP) covers 7 direct MPP routes without an account,
API key, or subscription. Create an MPP account with `mppx account create`.

```bash
npm i mppx@0.8.12 viem@2.55.4
openclaw config set plugins.entries.tweetclaw.config.tempoSigningKey "$MPP_SIGNING_KEY"
```

Keep the signing key in local OpenClaw config. Never put it in prompts or logs.

Direct MPP covers tweet lookup, user lookup, follower check, article lookup,
trends, X trends, and community info. Other paid reads use prepaid credits.
Media downloads and galleries require account-backed access.

### Enable live API calls

OpenClaw always loads the local `explore` catalog. The `tweetclaw` API tool is
optional because it can read private data, spend credits, or change X accounts.
Add both tools without replacing the current profile:

```bash
openclaw config set tools.alsoAllow '["explore", "tweetclaw"]'
```

Verify runtime registration and packed releases with the [OpenClaw setup guide](docs/openclaw-setup.md).

### Optional settings

```bash
openclaw config set plugins.entries.tweetclaw.config.baseUrl "https://xquik.com"
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled true
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

Only change `baseUrl` for a self-hosted Xquik-compatible API. TweetClaw requires an HTTPS base URL with no embedded credentials.

## OpenClaw trust model

TweetClaw uses 2 OpenClaw gates:

- Optional tool exposure: `explore` is always safe local catalog search, while
  `tweetclaw` stays optional until the user allows it with `tools.alsoAllow`.
- Per-call approval: write-like, private, paid, recurring, extraction, monitor,
  webhook, and account-scoped calls trigger a plugin approval prompt. TweetClaw
  offers one-time approval or deny for those calls so a social-account action is
  reviewed each time.

These gates prevent unattended publishing. Examples include Twitter search before
drafting, reply review before draws, follower exports, approved media posts,
user-created monitors, and reviewed webhook automation.

## Tools

### `explore` (free, no network)

Search the bundled API catalog without a network request.

### `tweetclaw` (invoke API endpoints)

Invoke catalog-listed endpoints with structured fields. The runtime injects
authentication. X writes also require `idempotencyKey`.

This tool is optional in OpenClaw. If your agent can see the skill but cannot call TweetClaw tools, add `explore` and `tweetclaw` to `tools.alsoAllow` so your normal tool profile stays intact.

OpenClaw approval prompts are enforced before write-like `tweetclaw` tool calls. Review the structured request before approving any post, delete, follow, DM, monitor, extraction, webhook, or profile-change action. Risky calls offer one-time approval or deny so future social-account actions still require review.

## Commands

Instant responses, no LLM needed:

| Command | Description |
|---------|-------------|
| `/xstatus` | Account info, subscription status, usage, credit balance |
| `/xtrends` | Curated topics with an API key. Worldwide X trends with MPP. |
| `/xtrends tech` | API-key mode: curated topics in one category. |
| `/xtrends 23424977` | MPP mode: X trends for one WOEID. |

## Event notifications

When polling is enabled, TweetClaw checks user-created monitors every 60 seconds
and delivers new tweet, reply, quote, or retweet events.

Set up a monitor first:

```
You: "Monitor @elonmusk for new tweets, replies, and retweets"
```

## API coverage

102 agent-callable endpoints across 9 categories. Dashboard-only flows stay blocked.

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

## References

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

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.
