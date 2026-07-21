# OpenClaw Setup Guide

Use this guide when installing, configuring, or verifying TweetClaw in OpenClaw. It is optimized for agent retrieval and keeps the setup path short, current, and public-safe.

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## What TweetClaw Adds

TweetClaw is the `@xquik/tweetclaw` OpenClaw plugin for Xquik X/Twitter workflows. It registers 2 structured tools:

- `explore`: free local catalog search with no network request.
- `tweetclaw`: live endpoint invoker for catalog-listed Xquik API paths.

The plugin can install before credentials exist. Without credentials, `explore` remains usable and live calls return setup guidance.

## Install

Install the verified ClawHub listing:

```bash
openclaw plugins install clawhub:@xquik/tweetclaw
```

OpenClaw records ClawHub as the tracked source and retains the exact npm package as fallback metadata. Use `openclaw plugins install npm:@xquik/tweetclaw` when you need the npm fallback. Avoid repo-folder installs for release verification because they do not represent the published artifact.

Current source metadata targets OpenClaw `2026.7.1` or newer. Update OpenClaw before testing source builds or freshly packed artifacts from this repository.

If OpenClaw runs with `OPENCLAW_NIX_MODE=1`, plugin lifecycle mutators are
disabled. Install or update TweetClaw through your Nix OpenClaw source instead
of `openclaw plugins install` or `openclaw plugins update`.

## Update

For routine upgrades, keep the tracked install source and update the installed plugin id:

```bash
openclaw plugins update tweetclaw
```

For reproducible production installs, pin a published npm version:

```bash
openclaw plugins install npm:@xquik/tweetclaw@<version> --pin
```

OpenClaw keeps pinned npm records on the selected version during later `plugins update tweetclaw` runs. Move back to the default npm release line with `openclaw plugins update @xquik/tweetclaw` when you want the current stable package again.

## Verify Runtime Loading

After install or update, inspect the runtime and bundled skill:

```bash
openclaw plugins inspect tweetclaw --runtime --json
openclaw skills info tweetclaw
```

Expected result:

- The `tweetclaw` plugin loads.
- The `explore` tool is available.
- The optional `tweetclaw` tool is available when the OpenClaw tool profile allows it.
- The `before_tool_call` approval hook is registered for risky `tweetclaw` calls.
- The `xtrends` command is registered.
- The TweetClaw skill is visible to the agent.

Managed Gateways with config reload enabled can restart automatically after an install or update. If the Gateway is unmanaged or reload is disabled, run `openclaw gateway restart` before runtime inspection.

For packaged release checks, validate the installed artifact instead of the source checkout:

```bash
npm pack
openclaw plugins install npm-pack:./xquik-tweetclaw-<version>.tgz
openclaw plugins inspect tweetclaw --runtime --json
```

`openclaw plugins build --entry ./dist/index.js --check` and `openclaw plugins validate --entry ./dist/index.js` are the generated metadata lane for simple `defineToolPlugin` packages. TweetClaw uses `definePluginEntry` because it registers tools, a command, an approval hook, and an event-polling service, so the package smoke above is the authoritative local release proof.

Maintainers should also run the deterministic source gate after building:

```bash
npm run check-openclaw-platform-fitness
```

That gate checks package metadata, the OpenClaw host peer, runtime entrypoints,
manifest tool ownership, optional-tool metadata, command aliases, approval-hook
shape, setup docs, workflow docs, and the packaged skill.

For slow install or inspect debugging, keep machine-readable output and send
lifecycle timings to stderr:

```bash
OPENCLAW_PLUGIN_LIFECYCLE_TRACE=1 openclaw plugins inspect tweetclaw --runtime --json
```

## Enable The Optional Tool

Many OpenClaw profiles keep a coding-focused tool set by default. If the skill is visible but the agent cannot call TweetClaw tools, add the 2 tool names to `tools.alsoAllow`:

```bash
openclaw config set tools.alsoAllow '["explore", "tweetclaw"]'
```

Use `tools.alsoAllow` instead of replacing the whole tool profile unless strict allowlist mode is intentional.

## Approval Model

OpenClaw optional tools and plugin permission requests solve different problems.
TweetClaw uses both:

- `tweetclaw` is optional so the model does not see the live endpoint invoker
  until the user opts in.
- The plugin approval hook runs after the model selects `tweetclaw` and before
  OpenClaw executes the call.

TweetClaw requests approval for write-like, private, paid, recurring,
extraction, monitor, webhook, and account-scoped calls. Approval prompts offer
one-time approval or deny; they do not offer persistent trust for future
social-account actions.

## Credential Modes

TweetClaw has 3 modes:

| Mode | Required config | Use it for |
|------|-----------------|------------|
| Explore-only | none | Install checks, docs, and endpoint discovery |
| API key | `plugins.entries.tweetclaw.config.apiKey` | Account-backed workflows plus 33 prepaid public paid-read routes |
| MPP | `plugins.entries.tweetclaw.config.tempoSigningKey` | 7 direct pay-per-use read routes with no Xquik account |

Store credentials in OpenClaw plugin config. Never paste API keys, signing keys, passwords, cookies, account IDs, or payment material into chat, docs, issues, logs, screenshots, or tool arguments.

API key mode:

```bash
openclaw config set plugins.entries.tweetclaw.config.apiKey "$XQUIK_API_KEY"
```

MPP mode:

```bash
npm i mppx@0.8.12 viem@2.55.4
openclaw config set plugins.entries.tweetclaw.config.tempoSigningKey "$MPP_SIGNING_KEY"
```

## Base URL

The default API base URL is `https://xquik.com`. Only change it for a trusted Xquik-compatible HTTPS API:

```bash
openclaw config set plugins.entries.tweetclaw.config.baseUrl "https://xquik.com"
```

TweetClaw rejects non-HTTPS URLs and URLs with embedded credentials.

## Event Polling

Polling is optional runtime behavior for monitor events the user already created. It does not create monitors, scan targets, post content, or change account state.

Disable polling in isolated install tests unless notification delivery is under test:

```bash
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled false
```

The default interval is 60 seconds. The config schema and runtime normalize the interval to a minimum of 5 seconds:

```bash
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

## First Checks

Use `explore` before live calls:

```json
{ "query": "tweet search", "limit": 5 }
```

For MPP mode, filter for eligible endpoints:

```json
{ "mpp": true, "method": "GET", "limit": 25 }
```

For live calls, pass only catalog-listed `/api/v1/...` paths. Put query parameters in the `query` object, not inside the path string.

## Troubleshooting

If install fails, verify OpenClaw is at least `2026.7.1` for current source builds and install the published package.

If tools are not visible, inspect runtime loading with `--runtime --json` and set `tools.alsoAllow` for `explore` and `tweetclaw`.

If live calls return setup guidance, configure either `apiKey` or `tempoSigningKey`.

If an MPP call is rejected, use `explore` with `mpp: true`. Direct MPP covers tweet lookup, user lookup, follower check, article lookup, trends, X trends, and community info. Other paid reads require an API key with prepaid credits. Media download requires account-backed access.

If a path is rejected, remove embedded query strings and fragments from the path, then provide query fields through the structured `query` object.
