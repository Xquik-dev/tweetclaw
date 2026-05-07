# ClawPack Release

TweetClaw should publish to ClawHub as a ClawPack npm-pack artifact, not the legacy ZIP path. OpenClaw prefers ClawPack metadata when ClawHub provides it, verifies the downloaded bytes and digest headers, and records npm integrity, shasum, tarball name, and ClawPack digest fields for future updates.

## Current Finding

As of 2026-05-07 00:05 UTC, `npx --yes clawhub@0.12.2 package inspect @xquik/tweetclaw --json` reports ClawHub latest as `1.6.20` with `artifact.kind: "npm-pack"`, owner `kriptoburak`, `code-plugin` family, OpenClaw compatibility `2026.5.4`, package `scanStatus: "clean"`, and verification `scanStatus: "clean"` after explicit rescan request `sd7e9jw78zcqgtgr10gs71ps0n866f4k` completed clean. Version-specific inspect reports the `1.6.20` static scan clean with no findings on engine `v2.4.22`. The legacy ZIP warning remains resolved for the current package listing.

Future releases should keep using `node scripts/clawpack.mjs dry-run` and `node scripts/clawpack.mjs publish` so ClawHub receives the generated npm-pack tarball instead of the repo folder. npm auth and ClawHub auth remain separate. Use local auth only through CLI config or token environment variables, and never print or commit tokens.

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

`@xquik/tweetclaw@1.6.15` was published to npm and ClawHub on 2026-05-06 after normalizing packaged skill frontmatter and adding `npm run check-skill-frontmatter` to release gates. ClawHub release `rd76g2a13y6vg6t0dqfpc7sv0h866has` uses an npm-pack ClawPack artifact with sha256 `2b01dd7a190bec0d37a11b93bf78cf0636702b62689029043cf53be123b01a3a`, npm integrity `sha512-Hj7pEI2cpiVxK+QupkGg0NPuTYiPLTv+7YJ9cx3QooC/jKHSBeGWBErbgewN++8q0bDIMB6Hduv/6MriIQatiA==`, npm shasum `c8ec2e38b74b4ea34e0640c8ce718f84c04229fc`, and source commit `29f6c9e2395015799f55013270f5df50eba85dc4`. Version-specific inspect reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd715z79aa1j5k2t0zy55hgfq1867gj9` completed clean for package and verification records.

`@xquik/tweetclaw@1.6.16` was published to npm and ClawHub on 2026-05-06 after replacing a stale README optional-tool note that recommended `tools.allow` with `tools.alsoAllow` guidance for `explore` and `tweetclaw`. ClawHub release `rd7dy2n83gjxwr9hxec5hvravs867e6f` uses an npm-pack ClawPack artifact with sha256 `19951648c36bae7b9b1a0dc1f8092f46ffb7867d1809b87ed84aa8b6cc72dd25`, npm integrity `sha512-ihMPIiAx2p9r1g0E1XVKRtsY69i2oBIssCxM1ny5pPnAFx7vn3LN71f280QbpI797r6Gi0lrPiwEcSXvIYpj5g==`, npm shasum `5fe53ca2981f1567fe035e070a7460cd1cdf5296`, and source commit `44102cab7efde1ef6dd82d8386742d75d4087057`. Version-specific inspect reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd7c1d6v41q3w252n121v5dzbs866k1t` completed clean for top-level package and verification records.

`@xquik/tweetclaw@1.6.17` was published to npm and ClawHub on 2026-05-06 after aligning MPP route coverage with the current Xquik pay-per-use route set, documenting the media endpoint as non-MPP, adding media input aliases, and expanding the public hygiene guard to cover non-ignored untracked files. ClawHub release `rd79ppmfpxp8ex39w4ax7z5411866g1h` uses an npm-pack ClawPack artifact with sha256 `2fdfc2c6ad9bd165d627f8695a37bc827f8f10d371b1347e6905fc9d7267f304`, npm integrity `sha512-IM3arf9REuplZjldHviQUNAWsW+QATnhOztXKeq4RfsX/0aR/WJPrNBfYiNZImh10YixeTkLDzLJgNJcdfRAHg==`, npm shasum `d24835d0d1a6ce3120ded85b9b9c5b36e58a605b`, and source commit `edb5c19c96818f54e7be238f738ae72f6254e9c7`. Version-specific inspect reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd7cfzryk628v1g0nrzgyz9ew5866t0b` completed clean for top-level package and verification records.

`@xquik/tweetclaw@1.6.18` was published to npm and ClawHub on 2026-05-06 after requiring HTTPS, credential-free API base URLs for self-hosted Xquik-compatible deployments. ClawHub release `rd77y9s34jhmc1xqzfw8pbvbw1866m2j` uses an npm-pack ClawPack artifact with sha256 `7d52b5f5616afef666cef84c35970e04b645103c62b6657ccd1a3f8d09efb77b`, npm integrity `sha512-dqJ1vTIM82bzA10keF4qMiTBSHsi3biEVdaOhDbmgbU23ENbGkWw4i8JUpmOW3wTPS6FQA8VUYwaYL0KKX0oVA==`, npm shasum `3a67ee9a4aac7d14e1510611d43e59b7ab8456a4`, and source commit `0d640f8ea696ac3c8226994afcf08021f69d0817`. Version-specific inspect reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd7c2kxtqnmarrxbd3bqcffqvn866ewv` completed clean for top-level package and verification records.

`@xquik/tweetclaw@1.6.19` was published to npm and ClawHub on 2026-05-06 after redacting upstream API error response bodies from OpenClaw-facing failures while retaining safe short error codes. ClawHub release `rd7bveeghd6xsc71nwp30kvjgn867844` uses an npm-pack ClawPack artifact with sha256 `54dc1c6021eb5976fa7836db6ec1b7c64c2ed062f4246f928ad8786255e105c1`, npm integrity `sha512-VKXPFP9houJUTTqez8b28sih01w3ozitgspEPhtrpkAo46vk/70WnOezU4pZzuysHTF7hqTwVb007oVubcmrcg==`, npm shasum `8a44fff6bd167ff4789578a59680a111b70e0c5f`, and source commit `7f1cecadba01d0ec479e13feb29e2489f42f2e3c`. Version-specific inspect reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd7fzwy0r5r6ajjbpyg5nvz805866cmh` completed clean for top-level package and verification records.

`@xquik/tweetclaw@1.6.20` was published to npm and ClawHub on 2026-05-06 after clearing the TweetClaw execution timeout after successful API calls, avoiding delayed process shutdown in real tool smoke tests. ClawHub release `rd7akgmr7v2gn3avb7352pscnh866qsx` uses an npm-pack ClawPack artifact with sha256 `73d9c4591f79c281f8024c5d672c4b3ac5711a20571966953059ce9c6fd4c9c8`, npm integrity `sha512-SrSNxx2IliyIia+TakMXqlkM7fILXvCfA2fnLOQbKAk8kaXO0+6JHWdcUa5oaIpOmF7x39PXkXmaLM1v5fZ8yw==`, npm shasum `661aea3bf9a3371e696564aaff2044e6a5e5064c`, and source commit `6b3ecbc62eec513fa51e42a03b96c4c3ec09f600`. Version-specific inspect reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd7e9jw78zcqgtgr10gs71ps0n866f4k` completed clean for top-level package and verification records.
