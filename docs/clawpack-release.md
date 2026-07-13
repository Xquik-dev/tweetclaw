# Release TweetClaw

Use this checklist to validate TweetClaw before publishing a package. Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Verify release metadata

Keep `package.json`, `openclaw.plugin.json`, and `server.json` on the same version. Keep npm as the canonical install source until every public registry serves the same package.

The release must describe 33 prepaid public paid-read routes and exactly 7 direct Machine Payments Protocol (MPP) routes. The direct routes are tweet lookup, user lookup, follower check, article lookup, trends, X trends, and community info.

## Run release checks

Run all source, package, and dependency checks:

```bash
npm ci
npm run check:all
npm audit --audit-level=moderate
```

The checks must pass before packing or publishing.

## Inspect the package artifact

Create and inspect the exact artifact that users will install:

```bash
npm pack
openclaw plugins install npm-pack:./xquik-tweetclaw-your_version_here.tgz
openclaw plugins inspect tweetclaw --runtime --json
openclaw skills info tweetclaw
```

Confirm the artifact contains `dist/`, `openclaw.plugin.json`, and the complete `skills/tweetclaw/` directory. Confirm `explore`, optional `tweetclaw`, the approval hook, and `xtrends` load from the packed artifact.

## Verify public readbacks

After publishing, verify the registry version, package metadata, integrity, repository link, and install command. Create a GitHub release only after the package readback matches the source version and tagged commit.

Do not commit credentials, local authentication output, temporary package files, audit logs, or publishing transcripts.
