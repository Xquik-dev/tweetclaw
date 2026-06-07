# ClawPack Release Notes

Compact release memory for TweetClaw npm, OpenClaw, and ClawHub publishing.

This Markdown file is intentionally small. Full pre-compaction release history
was moved losslessly to `docs/clawpack-release.archive.txt` on 2026-06-07 after
the user added a 15 KiB total Markdown memory cap. Search this file first, then
the archive, before any release or ClawHub decision.

## Size Rule

- Automation-owned Markdown memory scope is this file plus
  `docs/discoverability-audit.md`.
- Their combined size must stay under 15 KiB.
- Use `npm run check-memory-md-size` before committing prompt, audit, or release
  memory changes.
- Move historical detail into non-Markdown archives without deleting information.

## Current Release State

- npm latest: `@xquik/tweetclaw@1.6.31`
- Published: 2026-05-14 20:04 UTC
- Source commit: `9a645f87b01f4c8440429394c83a2ca4e09fcb9a`
- npm shasum: `c878edab8c3cd1344aa81757ac450385377bb43f`
- npm integrity:
  `sha512-4Nr536Z+8yZQYDdp9avKLC5K8TEcN0yB5dskYf0y87prZdxwmyTY6iVpFceHgh9/iEDt5ncYdCT75B9o6rDo9A==`
- GitHub release:
  https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.6.31
- Install metadata uses `defaultChoice: "npm"` with
  `npmSpec: "@xquik/tweetclaw@1.6.31"`.
- `openclaw.install.clawhubSpec` must stay absent until ClawHub publishes the
  current scoped package.

## OpenClaw Release Fitness

- Current source metadata targets OpenClaw `2026.6.1`.
- Required metadata fields:
  `openclaw.compat.pluginApi`, `openclaw.compat.minGatewayVersion`,
  `openclaw.build.openclawVersion`, `openclaw.build.pluginSdkVersion`,
  `openclaw.install.minHostVersion`, and required host peer.
- `npm run check-openclaw-platform-fitness` blocks stale package, manifest,
  runtime, setup-doc, workflow-doc, and packaged-skill drift before release-like
  validation.
- Known blocker: `npm audit --audit-level=moderate` reports moderate `hono`
  advisories under `node_modules/openclaw/node_modules/hono` from published
  `openclaw@2026.6.1` shrinkwrap. Root overrides did not rewrite that nested
  shrinkwrap. Treat as upstream OpenClaw stable-package blocker.

## ClawHub State

- ClawHub browsing page: https://clawhub.ai/plugins/@xquik/tweetclaw
- Latest ClawHub version remains `1.6.26`.
- Owner: `kriptoburak`
- Family: `code-plugin`
- Artifact kind: `npm-pack`
- Package, verification, and static scans were clean for the last accepted
  package rescan.
- Old route https://clawhub.ai/kriptoburak/xquik-tweetclaw still resolves but is
  stale and must not be used as canonical install link.
- ClawHub publish for `1.6.27` through `1.6.30` remains blocked by owner-scope
  validation: owner `xquik` reports the package belongs to another publisher,
  while owner `kriptoburak` rejects the `@xquik` scope.
- Do not run ClawHub publish again until the `@xquik/tweetclaw` owner record is
  migrated or ClawHub grants a scope exception.

## Release Gate

Run before release-like claims:

```bash
npm run check-memory-md-size
npm run check-openclaw-platform-fitness
npm run check:all
npm audit --audit-level=moderate
```

Then run isolated `npm-pack:` install plus runtime inspect:

```bash
openclaw plugins install npm-pack:./xquik-tweetclaw-<version>.tgz
OPENCLAW_PLUGIN_LIFECYCLE_TRACE=1 openclaw plugins inspect tweetclaw --runtime --json
```

Record expected upstream or target-owned blockers before committing.
