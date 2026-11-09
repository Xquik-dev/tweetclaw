# Changelog

All notable public changes appear in this file.

## [1.10.0] - 2026-11-09

### Added

- Let agents call 9 more operations. Agents can now call 192 of the 223 in the live OpenAPI spec.
- Read monitor events from the event stream. A call waits up to 25 seconds for new events and returns them with the `lastEventId` to resume from.
- Change account settings, open & answer support tickets and read 1 connected X account.

### Changed

- Leave out only API keys, checkout & X account connection, which stay in the dashboard.

## [1.9.0] - 2026-11-09

### Added

- Catalog 8 more operations. Agents can now call 183 of the 223 in the live OpenAPI spec.
- Add bookmarks, blocks, mutes, the follower audit & monitor updates by username.
- Add Twitter bot & scraping guides to the README.

### Changed

- Take the latest descriptions from the spec, including the API key `connectsXAccounts` note.
- Lead the README with the OpenClaw install & dated proof.
- Move the security policy to the repository root. It states the bug bounty reward & real response times.

### Security

- Watch dependencies with Dependabot.

## [1.8.0] - 2026-11-05

### Added

- Catalog 22 more operations. Agents can now call 175 of the 212 in the live OpenAPI spec.
- Add post monitors with their metrics, and the activity feed.
- Add sports games with box scores, plays, rosters, player props, posts & audience.
- Add the shadowban check, Community analytics & news story versions.
- Mark 21 MPP routes, up from 13. Sports games & Community analytics now accept MPP.

### Changed

- Take the latest descriptions from the spec. Analysis settings mention `images`, and extraction jobs return their `url`.
- Show live trust & usage numbers, the p99 server read time & the Convex Component badge in the README.

### Security

- Refuse the 3 API key update & revoke operations, which the API serves only to dashboard sessions.
- Pin minimatch 11.0.4, undici 8.12.3 & zod 4.6.7 so `npm audit` reports no advisory.

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
[1.8.0]: https://github.com/Xquik-dev/tweetclaw/releases/tag/v1.8.0
