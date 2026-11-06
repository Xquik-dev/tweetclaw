# TweetClaw, the Twitter Bot Plugin for OpenClaw

Use this OpenClaw Twitter plugin by Xquik to search tweets, export followers & post.
Every write waits for your approval.

Xquik is the world's fastest and cheapest X Twitter scraper service with the most complete X data.
Most other Apify Actors charge before filtering or deduplication.
Xquik charges only for delivered, unique, filter-matching results and never pads rows.
Xquik is independent and not affiliated with X Corp.

<!-- trust:win:start -->
The Xquik REST API read 45 tweets per second at $0.15 per 1,000 on 2026-10-15. The fastest of 4 rival Actors read 12.5 per second. The cheapest cost $0.173 per 1,000. [Compare each run](https://xquik.com/benchmarks#benchmark-x-tweet-scraper).
<!-- trust:win:end -->

## Install the OpenClaw Twitter plugin

```bash
openclaw plugins install clawhub:@xquik/tweetclaw
```

OpenClaw records the verified ClawHub publisher scope and package as the update source.

Create an API key for account-backed X automation at [dashboard.xquik.com](https://dashboard.xquik.com/).
Then store it through OpenClaw.

```bash
openclaw config set plugins.entries.tweetclaw.config.apiKey "$XQUIK_API_KEY"
```

Add both tools without replacing the current profile.

```bash
openclaw config set tools.alsoAllow '["explore", "tweetclaw"]'
```

## Run a Twitter bot & Twitter automation from OpenClaw

Ask your agent in plain words.
The bot posts only what you approve.

```text
Reply to my latest post with a thank-you note
Post "Launch day" from my connected X account
```

Next, read the [TweetClaw guide](https://docs.xquik.com/guides/tweetclaw) or the [OpenClaw setup guide](docs/openclaw-setup.md).

<!-- trust:start -->

## Benchmarks & usage

[![@xquik/tweetclaw downloads on npm](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fnpm-xquik-tweetclaw.json)](https://www.npmjs.com/package/@xquik/tweetclaw)
[![tweetclaw downloads on ClawHub](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fclawhub-tweetclaw.json)](https://clawhub.ai/xquik/skills/tweetclaw)
[![tweetclaw Skill installs on skills.sh](https://img.shields.io/endpoint?url=https%3A%2F%2Fxquik.com%2Fbadges%2Fskills-tweetclaw.json)](https://skills.sh/xquik-dev/tweetclaw)
[![OpenSSF Best Practices](https://www.bestpractices.dev/projects/13730/badge)](https://www.bestpractices.dev/projects/13730)

- 11,000+ downloads of @xquik/tweetclaw on npm ([source](https://www.npmjs.com/package/@xquik/tweetclaw)) <!-- trust:npm-xquik-tweetclaw 11875 -->
- 2,700+ downloads of tweetclaw on ClawHub ([source](https://clawhub.ai/xquik/skills/tweetclaw)) <!-- trust:clawhub-tweetclaw 2783 -->
- 83 installs of this repo's Skills on skills.sh ([source](https://skills.sh/xquik-dev/tweetclaw)) <!-- trust:skills-tweetclaw 83 -->
- This repo meets the OpenSSF Best Practices passing criteria ([source](https://www.bestpractices.dev/projects/13730)) <!-- trust:openssf-tweetclaw 1 -->

Checked on 2026-11-06. See each number with its date & source on [xquik.com/benchmarks](https://xquik.com/benchmarks) or as [JSON](https://xquik.com/trust.json).

<!-- trust:end -->

## Scrape tweets & export followers

Reads run through the same `tweetclaw` tool.
Extractions export followers and following accounts.

```text
Search tweets about "AI agents" from the last day
Export the followers of @NASA
```

## Common OpenClaw tasks

Use `explore` before every live call.
It returns the current supported route.

| Customer question | Catalog query | Next step |
| --- | --- | --- |
| How can I search tweets? | `search tweets by query` | Call the listed read route. |
| How can I read an X timeline? | `list recent tweets posted by a user` | Approve private timelines. |
| How can I export followers? | `run extraction` | Choose followers, then approve. |
| How can I scrape following accounts? | `run extraction` | Choose following, then approve. |
| How can I monitor an account or keyword? | `create monitor` | Approve recurring usage. |
| How can I post or reply? | `create tweet` | Approve each write. |

See the [agent workflow guide](docs/agent-workflows.md) for longer jobs.

## Install options

Use `openclaw plugins install npm:@xquik/tweetclaw` when you need the npm fallback.

For normal upgrades, reuse the tracked install source.

```bash
openclaw plugins update tweetclaw
```

Pin a published npm version for reproducible production installs.

```bash
openclaw plugins install npm:@xquik/tweetclaw@<version> --pin
```

Pinned installs stay pinned during updates.
Run `openclaw plugins update @xquik/tweetclaw` to return to the stable release line.

Source builds require OpenClaw `2026.7.1` or newer.

`OPENCLAW_NIX_MODE=1` turns off the plugin install and update commands.
Install or update TweetClaw through your Nix OpenClaw source instead.

Install TweetClaw before you add credentials if you want.
The free `explore` catalog works at once.
Live calls return setup guidance.

Agents with skill directories can install the packaged `SKILL.md` through [Skills.sh](https://www.skills.sh/xquik-dev/tweetclaw).
Use the OpenClaw command above for the plugin runtime.

```bash
npx skills add xquik-dev/tweetclaw
```

TweetClaw is an OpenClaw plugin, not an MCP server.
For remote MCP clients, add `https://xquik.com/mcp`.
Then follow the [client compatibility guide](https://docs.xquik.com/mcp/overview#client-compatibility).

## Configure

Keep API keys out of chats, documentation, logs & shell history.

### Credits for pay per use without a subscription

Top up credits from the Xquik dashboard.
An API key can spend prepaid credits on public paid reads without a subscription.
TweetClaw does not create checkout sessions or charge saved payment methods from the agent.

### Direct MPP for accountless pay per use

Machine Payments Protocol (MPP) pays for single lookups with no account or API key.
Create an MPP account with `mppx account create`.

```bash
npm i mppx@0.13.4 viem@2.57.5
openclaw config set plugins.entries.tweetclaw.config.tempoSigningKey "$MPP_SIGNING_KEY"
```

Keep the signing key in local OpenClaw config.
Never put it in prompts or logs.

`explore` marks each MPP route with its price per call.
[API coverage](#api-coverage) counts them.
Other paid reads use prepaid credits.
Media downloads and galleries require account-backed access.

### Optional settings

```bash
openclaw config set plugins.entries.tweetclaw.config.baseUrl "https://xquik.com"
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled true
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

Change `baseUrl` only for a self-hosted Xquik-compatible API.
TweetClaw requires an HTTPS base URL with no embedded credentials.

## OpenClaw trust model

TweetClaw uses 2 OpenClaw gates, which stop unattended publishing.

- Optional tool exposure. `explore` is a safe local catalog search that OpenClaw always loads. `tweetclaw` can read private data, spend credits or change X accounts. It stays off until you add it to `tools.alsoAllow`.
- Per-call approval. Writes, private reads, paid calls & account-scoped calls trigger a plugin approval prompt. Recurring jobs do too. TweetClaw offers one-time approval or deny for those calls.

## Tools

### `explore` (free, no network)

Search the bundled API catalog without a network request.

### `tweetclaw` (invoke API endpoints)

Invoke catalog-listed endpoints with structured fields.
The runtime injects authentication.
X writes also require `idempotencyKey`.

Can your agent see the skill but not call TweetClaw tools?
Add `explore` and `tweetclaw` to `tools.alsoAllow`.

OpenClaw shows an approval prompt before each write-like `tweetclaw` call.
Review the structured request before you approve a post, DM, monitor, extraction or webhook.

## Commands

These commands answer at once, without the LLM.

| Command | Description |
| --- | --- |
| `/xstatus` | Account info, subscription status, usage & credit balance |
| `/xtrends` | Curated topics with an API key. Worldwide X trends with MPP. |
| `/xtrends tech` | API-key mode shows curated topics in 1 category. |
| `/xtrends 23424977` | MPP mode shows X trends for 1 WOEID. |

## Event notifications

With polling on, TweetClaw checks your monitors every 60 seconds.
It delivers new tweet, reply, quote & retweet events.

Set up a monitor first.
Ask your agent in plain words.

```text
Monitor @elonmusk for new tweets, replies, and retweets
```

## Read response fields

TweetClaw keeps every allowed Xquik response field.
Optional fields stay absent when X omits them.
Request `next_cursor` while `has_next_page` is true.

Bookmark, like, follow, block, mute & notification state of the fetching account stays private.

See [Read Data Richness](https://docs.xquik.com/guides/tweet-profile-api-fields) for exact tweet, profile & media fields.

## Pricing & access

TweetClaw uses Xquik billing for account-backed automation and optional MPP reads.
See [Billing & Pricing](https://docs.xquik.com/guides/billing) for current plans, eligible endpoints, and live prices.

## API coverage

<!-- api-coverage:start (npm run generate-api-contract writes this block) -->
The live [Xquik OpenAPI spec](https://xquik.com/openapi.json) lists 223 operations. An operation is 1 method on 1 path.

Agents can call 183 of them through `tweetclaw`. TweetClaw leaves out the other 40.

| Left out | Operations |
| --- | --- |
| Account settings, API keys, billing & support, which stay in the dashboard | 21 |
| X account connection, guest wallet checkout & support file downloads | 10 |
| Documentation search outside `/api/v1` | 8 |
| Event streams, which the tool cannot read | 1 |

21 of the 183 accept MPP. Run `explore` with `mpp` set to `true` to list them.
<!-- api-coverage:end -->

| Category | Examples | Access |
| --- | --- | --- |
| Account | Account status | Account-backed |
| Analysis | Sentiment, brand, news, market signals, viral score, custom questions | Account-backed |
| Composition | Compose, drafts, writing styles, radar | Account-backed |
| Credits | Check balance | Account-backed |
| Extraction | Extraction tools, giveaway draws, exports | Account-backed |
| Media | Authenticated media download, gallery links | Account-backed |
| Monitoring | Create monitors, view events, manage webhooks, Telegram links | Account-backed |
| Twitter | Search, lookups, timelines, articles, trends, lists, communities, Spaces, jobs, bookmarks, notifications | Account-backed or MPP where eligible |
| X accounts | List connected account handles for explicit user-selected actions | Account-backed |
| X write | Post, reply, like, retweet, follow, remove follower, DM, upload media, profile, communities | Account-backed with approval |

## Questions

### Do I need an X developer account?

No. Public reads need only an Xquik API key.
Private reads & X account actions need a connected X account.

### Is TweetClaw the official X API?

No. Xquik runs its own REST API.
TweetClaw calls that API, not the official X API.

## More Xquik tools

- [X (Twitter) scraper API & Twitter MCP server](https://github.com/Xquik-dev/x-twitter-scraper) with REST, MCP & Skill setup.
- Twitter API SDKs for [TypeScript](https://github.com/Xquik-dev/x-twitter-scraper-typescript), [Python](https://github.com/Xquik-dev/x-twitter-scraper-python), [Go](https://github.com/Xquik-dev/x-twitter-scraper-go) & [Ruby](https://github.com/Xquik-dev/x-twitter-scraper-ruby).
- Twitter API SDKs for [Java](https://github.com/Xquik-dev/x-twitter-scraper-java), [Kotlin](https://github.com/Xquik-dev/x-twitter-scraper-kotlin), [C#](https://github.com/Xquik-dev/x-twitter-scraper-csharp) & [PHP](https://github.com/Xquik-dev/x-twitter-scraper-php).
- [Twitter CLI & X CLI](https://github.com/Xquik-dev/x-twitter-scraper-cli) for terminal workflows.
- [Twitter advanced search operators](https://github.com/Xquik-dev/x-twitter-advanced-search) with tested examples.
- [Hermes Agent Twitter plugin](https://github.com/Xquik-dev/hermes-tweet) and the [Twitter API documentation source](https://github.com/Xquik-dev/xquik-docs).
- Twitter integrations for [n8n](https://github.com/Xquik-dev/n8n-nodes-xquik), [Prefect](https://github.com/Xquik-dev/prefect-xquik), [Haystack](https://github.com/Xquik-dev/xquik-haystack) & [Paperclip](https://github.com/Xquik-dev/paperclip-plugin-xquik).
- Twitter integrations for [Terraform](https://github.com/Xquik-dev/terraform-provider-x-twitter-scraper), [Convex](https://github.com/Xquik-dev/xquik-convex), [Supabase](https://github.com/Xquik-dev/xquik-supabase) & [Strapi](https://github.com/Xquik-dev/strapi-plugin-xquik).
- Twitter MCP for [AI agents](https://github.com/Xquik-dev/xquik-mcp), [VS Code](https://github.com/Xquik-dev/xquik-vscode) & [Raycast](https://github.com/Xquik-dev/xquik-raycast).
- [Xquik X API & Twitter scraper](https://xquik.com) and the [Twitter API documentation](https://docs.xquik.com/api-reference/overview).

## License

[MIT](LICENSE)

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.
