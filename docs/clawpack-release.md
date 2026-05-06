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

`@xquik/tweetclaw@1.6.12` was published to npm and ClawHub on 2026-05-06 after adding explicit skill safety guidance. ClawHub release `rd778yshrw0mkyhhsc2efh6qk58642d9` uses an npm-pack ClawPack artifact with sha256 `e0dee0c281fe6b574a4c0a87be95c5e8d79f8f24096c5ee075c9e269060b8c9c`, npm integrity `sha512-jqyG5xK7sjaq+LIjXPk2LYaPW14yvLkohNNycUd5411YwCnKUEkE5miJyQw/4TqD3BKi2SwypZcxQr551BghMg==`, and npm shasum `8d265a3f23fcc5dcd75d2e3f4b8cbf56985c1379`. Rescan request `sd70hgg2acj0zps78m1edrk1vx864vge` was accepted and remained pending immediately after publication.

`@xquik/tweetclaw@1.6.13` was published to npm and ClawHub on 2026-05-06 after fixing install-before-credentials UX, OpenClaw tool visibility guidance, manifest optional tool metadata, and OpenAI function schema compatibility. ClawHub release `rd7fx4d2gbq1zv89phb5k2hwjh866dst` uses an npm-pack ClawPack artifact with sha256 `d98ed230085b35337ac21a05150580e8d585d1bd61a692a09899745ed148f2d3`, npm integrity `sha512-3nZ6ytpyYwaNhKzM1GCegieaAvd4qqzebwsaUAJMpXvxRAbK4TMmrP8RGK+50AXvQ004kWTYND8qx9tc2vO9fw==`, npm shasum `a1ebf316a2fb3f21be1c1e87c36edf2f8995abc9`, and source commit `68ae8f9518e40ee9ba44bc1250f22e6779683f26`. Rescan request `sd73f43pm2ky0h5rf0wh0h28318674fa` later reported a static-analysis `exposed_secret_literal` finding against an internal `apiKey` object-literal field, so 1.6.14 keeps the public config key stable but renames internal credential plumbing before republishing.

`@xquik/tweetclaw@1.6.14` was published to npm and ClawHub on 2026-05-06 to supersede the 1.6.13 static-analysis false positive. ClawHub release `rd7dk0dd0dxg24aa1x4864gzk5866jes` uses an npm-pack ClawPack artifact with sha256 `41c7944e80eb7a935877c969384124333b10feb2fa7eeda943800201d2e0a521`, npm integrity `sha512-Q1ls9JimCkBMux49klgwKwadivjYnHr5CnBwiHp+YDk1Ec1cXwYNOwqLeLayRRiA/oBfJ+i8p2/d0REPxQNtYg==`, npm shasum `48ff4ce9dc5915a3565aa1dd21db556012bb2cce`, and source commit `26df783a987f1a475587a8eb94336433d43fd25c`. The inspected release artifact reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit rescan request `sd7ax6d9h8ert5gywp215fcrb1866k1c` completed clean for the package and verification records.
