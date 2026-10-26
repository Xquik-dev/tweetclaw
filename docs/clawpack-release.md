# Publish TweetClaw

Validate the package before publishing. Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Verify release metadata

Keep `package.json`, `openclaw.plugin.json`, `skills/tweetclaw/skill-card.md`,
and `CHANGELOG.md` aligned. `npm run check-versions` compares them. Publish
through verified ClawHub, with npm as the fallback.

## Refresh the endpoint catalog

`generated-api-contract.json` holds the endpoint catalog. Run
`npm run generate-api-contract` after the Xquik API changes. It builds the
catalog from the live OpenAPI spec and rewrites the API coverage block in
`README.md`. Never edit either by hand.

`scripts/catalog-policy.ts` is the only hand-kept part. It lists the operations
an agent must not call, the private reads, the reads that skip approval, and the
category of each spec tag.

`npm run check-contract-drift` fails when the live spec and the catalog differ.
Run the generator, review the diff, and commit it.

## Run release checks

Run every source, package, dependency, and license check on a clean checkout
of the release commit.

```bash
npm ci
npm run check:all
```

`check:all` ends with the REUSE lint, the catalog drift check and
`npm audit --audit-level=low`. All 3 need network access. The REUSE lint runs
`uvx --from reuse==6.2.0 reuse lint`, so install [uv](https://docs.astral.sh/uv)
first. All checks must pass before packing or publishing.

Regenerate `package-lock.json` with the npm version that `packageManager` names.
That npm needs `--allow-remote=all` to read OpenClaw's bundled dependencies.
`npm ci` needs no flag.

## Inspect the package artifact

Create and inspect the exact artifact that users will install.

```bash
npm pack
openclaw plugins install npm-pack:./xquik-tweetclaw-your_version_here.tgz
openclaw plugins inspect tweetclaw --runtime --json
openclaw skills info tweetclaw
```

Confirm the artifact contains `dist/`, `openclaw.plugin.json`, and
`skills/tweetclaw/`. Verify `explore`, optional `tweetclaw`, approvals, and
`xtrends` from the installed archive.

## Publish

Releases run from a maintainer machine. GitHub Actions and trusted publishing
are not used.

npm publishes with a token from the macOS Keychain. The release never uses the
machine's own npm sign-in and never prints the token. Set it up once.

1. Choose a service name and an account name for the Keychain item. Keep both
   out of this repository.
2. Export `NPM_KEYCHAIN_SERVICE` and `NPM_KEYCHAIN_ACCOUNT` with those names.
3. Run `security add-generic-password -s "$NPM_KEYCHAIN_SERVICE" -a "$NPM_KEYCHAIN_ACCOUNT" -w`
   and paste the npm token when it asks.

ClawHub publishes with the login that `npx clawhub@0.23.3 login` stores in the
ClawHub CLI config file. Export `CLAWHUB_CONFIG_PATH` with that file's path. On
macOS the CLI writes it to `~/Library/Application Support/clawhub/config.json`.
Sign in to GitHub with `gh auth login`. Then release.

1. Merge the version bump to master. Tag that commit `v<version>` and push the
   tag.
2. Check out the tag in a clean checkout.
3. Run `node scripts/release.ts --dry-run`. It builds and validates the npm package,
   the ClawHub package, and the ClawHub Skill without publishing. It also
   confirms the Keychain item exists and the ClawHub login works.
4. Run `npm run release` in a terminal, so npm can ask for 2FA approval. It
   publishes to npm first, then the ClawHub package, then the ClawHub Skill.
   It creates the GitHub release with the legal notice last.

Pass `--only npm` or `--only clawhub` to release 1 registry, as in
`node scripts/release.ts --only npm`. That run needs only that registry's
credential, and it still creates the GitHub release.

The script checks every credential before the first upload. It stops with 1
line that names the variable when `NPM_KEYCHAIN_SERVICE`,
`NPM_KEYCHAIN_ACCOUNT` or `CLAWHUB_CONFIG_PATH` is unset. It also stops when
the checkout has changes or the tag is not the current master commit. A rerun
skips each target that already has the version.

`scripts/with-npm-token.ts` reads the token into a temporary npm user config
with mode 600. The file exists only while `npm publish` runs. The release uses
no provenance and no OIDC.

## Verify public readbacks

After publishing, verify the registry version, package metadata, integrity, repository link, and install command. Create a GitHub release only after the package readback matches the source version and tagged commit.

Do not commit credentials, local authentication output, temporary package files, audit logs, or publishing transcripts.
