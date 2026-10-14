# Changelog

All notable public changes appear in this file.

## [1.7.1] - 2026-10-14

### Added

- Catalog 4 more read operations. Agents can now call 156 of the 184 in the live OpenAPI spec.
- Add the Community Notes contributor lookup, with the contributor's notes & deleted notes.
- Add the Twitter trends archive of a place.

### Changed

- Take the latest parameter descriptions from the spec. They cover Community IDs, `from:` in Tweet search & the `near` filter.
- Say in the README that TweetClaw installs as an OpenClaw skill, and link the related Xquik repositories.
- Remove code comments from the source. The lint now fails on a new one.

### Security

- Refuse the 10 operations the API serves only to dashboard sessions, on top of the refused account, API key, billing, support & X account paths.

## [1.7.0] - 2026-10-13

### Added

- Catalog 50 more Xquik API operations. Agents can now call 152 of the 180 in the live OpenAPI spec.
- Add user, tweet, community, list, Space, broadcast, job & trend reads.
- Add 6 AI analysis routes, DM deletion, extraction cancel & Telegram webhook links.
- Mark 13 MPP routes, up from 7. List, broadcast, Space, Space replay, tweet translation & tweet embed lookups now accept MPP.
- Add `npm run generate-api-contract`. It builds the catalog from the live OpenAPI spec.

### Changed

- Generate the catalog from the OpenAPI spec. Summaries, parameters, response shapes & MPP prices now come from the spec.
- Take the MPP price of trends, X trends & the follow check from the spec.
- Match each request to its most specific route.
- Treat a redirect answer as an error, and drop 1 trailing slash from a request path.
- Require `idempotencyKey` only where the spec requires the header. Write status polls no longer need one.
- Count operations in 1 generated README block. Other copy no longer states route counts.
- Register the plugin through the OpenClaw SDK entry, with its schema wrapper, tool labels & result metadata.
- Build against OpenClaw 2026.9.6. Supported hosts stay at 2026.7.1 or newer.
- Pin the optional MPP packages to mppx 0.13.4 & viem 2.57.5.
- Publish npm releases with a token from the macOS Keychain. Release npm or ClawHub alone with `--only`.
- Run the REUSE lint in `check:all`.

### Fixed

- Refuse the event stream route, which the tool cannot read.

### Security

- The request layer now refuses any route outside the catalog and any path that is not sent as written.
- Payments are limited to TweetClaw's own requests, with a price cap for each route.
- Update proxy-addr, the MCP SDK, source-map-js & smol-toml to patched releases.

### Removed

- Remove the Dependabot configuration.

## [1.6.44] - 2026-08-21

- Mark secret config fields for registry discovery and remove repeated tool-call scripts.

## [1.6.43] - 2026-08-21

- Replace catalog jargon, remove repeated setup copy, and align the read filter contract.

## [1.6.42] - 2026-08-20

- Remove volatile route counts from package discovery metadata.
- Replace open-ended catalog examples with concrete wording.

## [1.6.41] - 2026-07-30

### Added

- Preserve complete safe tweet, profile, and media response fields.
- Validate rich response shapes against the canonical OpenAPI contract.

### Changed

- Update the catalog to 120 canonical operations.
- Keep the connection-attempt status route dashboard-only.
- Clarify pagination and incomplete-reply recovery guidance.

### Security

- Exclude fetching-account action, permission, and relationship state.

[1.6.41]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.6.41
[1.6.42]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.6.42
[1.6.43]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.6.43
[1.6.44]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.6.44
[1.7.0]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.7.0
[1.7.1]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.7.1
