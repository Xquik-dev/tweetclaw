# Publish TweetClaw

Validate the package before publishing. Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Verify release metadata

Keep `package.json`, `openclaw.plugin.json`, and `CHANGELOG.md` aligned. Publish
through verified ClawHub, with npm as the fallback.

Document 33 prepaid public read routes and exactly 7 direct MPP routes: tweet
lookup, user lookup, follower check, article lookup, trends, X trends, and
community info.

## Run release checks

Run every source, package, and dependency check:

```bash
npm ci
npm run check:all
npm audit --audit-level=moderate
```

All checks must pass before packing or publishing.

## Inspect the package artifact

Create and inspect the exact artifact that users will install:

```bash
npm pack
openclaw plugins install npm-pack:./xquik-tweetclaw-your_version_here.tgz
openclaw plugins inspect tweetclaw --runtime --json
openclaw skills info tweetclaw
```

Confirm the artifact contains `dist/`, `openclaw.plugin.json`, and
`skills/tweetclaw/`. Verify `explore`, optional `tweetclaw`, approvals, and
`xtrends` from the installed archive.

## Verify public readbacks

After publishing, verify the registry version, package metadata, integrity, repository link, and install command. Create a GitHub release only after the package readback matches the source version and tagged commit.

Do not commit credentials, local authentication output, temporary package files, audit logs, or publishing transcripts.
