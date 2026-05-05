# ClawPack Release

TweetClaw should publish to ClawHub as a ClawPack npm-pack artifact, not the legacy ZIP path. OpenClaw prefers ClawPack metadata when ClawHub provides it, verifies the downloaded bytes and digest headers, and records npm integrity, shasum, tarball name, and ClawPack digest fields for future updates.

## Current Finding

As of 2026-05-06, `clawhub package inspect @xquik/tweetclaw --json` reports ClawHub latest as `1.6.2` with `artifact.kind: "legacy-zip"` and stale endpoint copy. Local `node scripts/clawpack.mjs dry-run` successfully builds `@xquik/tweetclaw@1.6.11` as an npm-pack tarball with 57 files.

Local ClawHub auth is not configured. `clawhub whoami` fails until an owner logs in with the ClawHub CLI. The npm token is not enough for this registry action.

## Commands

Run these from `/Users/burak/Developer/tweetclaw`.

```bash
npm run check:all
node scripts/clawpack.mjs dry-run
```

If the dry run shows `family: "code-plugin"` and the intended version, authenticate with ClawHub without printing the token:

```bash
npx --yes clawhub@0.12.2 login --token "$CLAWHUB_TOKEN"
npx --yes clawhub@0.12.2 whoami
```

Then publish the generated ClawPack and request a fresh scan. The helper defaults to owner handle `kriptoburak`; override with `CLAWHUB_OWNER=<handle>` if ownership changes.

```bash
node scripts/clawpack.mjs publish
npx --yes clawhub@0.12.2 package inspect @xquik/tweetclaw --json
npx --yes clawhub@0.12.2 package rescan @xquik/tweetclaw --yes --json
```

Do not publish the repo folder directly. The current CLI dry-run classified the folder source as `bundle-plugin`; publishing the generated tarball with `--family code-plugin` preserves TweetClaw as a native OpenClaw code plugin.

## Verification

After publishing, inspect ClawHub and confirm:

- `latestVersion` equals the local `package.json` version.
- The package family is `code-plugin`.
- The artifact is no longer `legacy-zip`.
- ClawPack metadata is present, including sha256, size, npm integrity, npm shasum, and tarball name.
- The summary and compatibility fields match the current package metadata.

## 2026-05-06 Result

`@xquik/tweetclaw@1.6.11` was published to ClawHub as release `rd740m3et9cr2kj9tqjpaq8xdn8642kd` with `artifact.kind: "npm-pack"`. A rescan was requested as `sd7d44dr8az6j800gkgqdvfxmd864nsk`; the package scan later reported `clean`.
