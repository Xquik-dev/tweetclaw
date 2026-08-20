# Set up TweetClaw in OpenClaw

Install, configure, and verify the TweetClaw OpenClaw plugin.

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Plugin tools

TweetClaw registers 2 structured tools:

- `explore`: free local catalog search with no network request.
- `tweetclaw`: live endpoint invoker for catalog-listed Xquik API paths.

Without credentials, `explore` works and live calls return setup guidance.

## Install

Install the verified ClawHub listing:

```bash
openclaw plugins install clawhub:@xquik/tweetclaw
```

OpenClaw tracks the ClawHub package and keeps npm fallback metadata. Use
`openclaw plugins install npm:@xquik/tweetclaw` for the fallback. Release checks
must use a packed artifact, not a repository folder.

Source builds require OpenClaw `2026.7.1` or newer.

If OpenClaw runs with `OPENCLAW_NIX_MODE=1`, plugin lifecycle mutators are
disabled. Install or update TweetClaw through your Nix OpenClaw source instead
of `openclaw plugins install` or `openclaw plugins update`.

## Update

Update through the tracked source:

```bash
openclaw plugins update tweetclaw
```

For reproducible production installs, pin a published npm version:

```bash
openclaw plugins install npm:@xquik/tweetclaw@<version> --pin
```

Pinned installs stay pinned. Run `openclaw plugins update @xquik/tweetclaw` to
return to the stable release line.

## Verify runtime loading

After install or update, inspect the runtime and bundled skill:

```bash
openclaw plugins inspect tweetclaw --runtime --json
openclaw skills info tweetclaw
```

Confirm:

- The `tweetclaw` plugin loads.
- The `explore` tool is available.
- The optional `tweetclaw` tool is available when the OpenClaw tool profile allows it.
- The `before_tool_call` approval hook is registered for risky `tweetclaw` calls.
- The `xtrends` command is registered.
- The TweetClaw skill is visible to the agent.

If the Gateway does not reload automatically, run `openclaw gateway restart`.

For packaged release checks, validate the installed artifact instead of the source checkout:

```bash
npm pack
openclaw plugins install npm-pack:./xquik-tweetclaw-<version>.tgz
openclaw plugins inspect tweetclaw --runtime --json
```

Generated metadata checks target simple `defineToolPlugin` packages. TweetClaw
uses `definePluginEntry` for tools, commands, approvals, and polling. The packed
artifact smoke test is the local release proof.

Maintainers should also run the deterministic source gate after building:

```bash
npm run check-openclaw-platform-fitness
```

The gate checks package metadata, runtime entries, tool ownership, approvals,
commands, documentation, and the packaged Skill.

For slow install or inspect debugging, keep machine-readable output and send
lifecycle timings to stderr:

```bash
OPENCLAW_PLUGIN_LIFECYCLE_TRACE=1 openclaw plugins inspect tweetclaw --runtime --json
```

## Enable live API calls

If the Skill is visible but its tools are not, add both names:

```bash
openclaw config set tools.alsoAllow '["explore", "tweetclaw"]'
```

Use `tools.alsoAllow` to preserve the current tool profile.

## Approval model

TweetClaw uses 2 distinct gates:

- `tweetclaw` is optional so the model does not see the live endpoint invoker
  until the user opts in.
- The plugin approval hook runs after the model selects `tweetclaw` and before
  OpenClaw executes the call.

TweetClaw requests approval for write-like, private, paid, recurring,
extraction, monitor, webhook, and account-scoped calls. Approval prompts offer
one-time approval or deny; they do not offer persistent trust for future
social-account actions.

## Credential modes

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

## Event polling

Polling is optional runtime behavior for monitor events the user already created. It does not create monitors, scan targets, post content, or change account state.

Disable polling in isolated install tests unless notification delivery is under test:

```bash
openclaw config set plugins.entries.tweetclaw.config.pollingEnabled false
```

The default interval is 60 seconds. The config schema and runtime normalize the interval to a minimum of 5 seconds:

```bash
openclaw config set plugins.entries.tweetclaw.config.pollingInterval 60
```

## First checks

Use `explore` before live calls:

```json
{ "query": "tweet search", "limit": 5 }
```

For MPP mode, filter for eligible endpoints:

```json
{ "mpp": true, "method": "GET", "limit": 25 }
```

For live calls, pass only catalog-listed `/api/v1/...` paths. Put query parameters in the `query` object, not inside the path string.

## Fix setup problems

If install fails, verify OpenClaw is at least `2026.7.1` for current source builds and install the published package.

If tools are not visible, inspect runtime loading with `--runtime --json` and set `tools.alsoAllow` for `explore` and `tweetclaw`.

If live calls return setup guidance, configure either `apiKey` or `tempoSigningKey`.

If an MPP call is rejected, use `explore` with `mpp: true`. Direct MPP covers tweet lookup, user lookup, follower check, article lookup, trends, X trends, and community info. Other paid reads require an API key with prepaid credits. Media download requires account-backed access.

If a path is rejected, remove embedded query strings and fragments from the path, then provide query fields through the structured `query` object.
