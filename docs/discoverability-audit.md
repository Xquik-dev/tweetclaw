# Discoverability Audit

Persistent notes for the recurring OpenClaw compatibility poll. Use this file to avoid duplicate external submissions and low-value PRs.

## Submission Rules

- Read the target repository README, contributing guide, code of conduct, license, issue templates, and PR template before proposing any change.
- Search the target repository for `tweetclaw`, `xquik`, and `x-twitter-scraper`.
- Check open and closed PRs before submitting. Do not duplicate an open PR, merged PR, or previously declined submission.
- Only contribute when the target repository is clearly relevant and the entry improves its catalog for users.
- Keep external PRs narrow, factual, and in the repository's established style.
- Do not submit promotional copy or broad cross-posting PRs.

## Audited Repositories

### VoltAgent/awesome-openclaw-skills

Status: do not duplicate.

Repository: https://github.com/VoltAgent/awesome-openclaw-skills

Rules observed:

- README says the list is sourced from ClawHub and only accepts skills already published in the OpenClaw skills repository.
- PR descriptions should include both ClawHub and GitHub links.
- README asks contributors not to submit very new, unproven skills.

Findings:

- `xquik-x-twitter-scraper` is already listed in README and `categories/search-and-research.md`.
- PR 230, `Add skill: kriptoburak/xquik-x-twitter-scraper`, merged on 2026-03-10.
- PR 255, `Add TweetClaw to Social Media`, closed on 2026-03-14.
- PR 436, `Add skill: kriptoburak/tweetclaw`, is open as of 2026-05-05.

Action:

- Do not open another TweetClaw PR here.
- Do not open another x-twitter-scraper PR here.
- Future runs may monitor PR 436, but should avoid repeated status comments unless there is a concrete maintainer-requested update.

### punkpeye/awesome-mcp-servers

Status: candidate, not ready for PR.

Repository: https://github.com/punkpeye/awesome-mcp-servers

Rules observed:

- CONTRIBUTING asks for one server per line, alphabetical order within category, accurate links, and concise descriptions.
- README has a Social Media category and accepts MCP server entries.

Findings:

- Initial search found no `tweetclaw` or `xquik` entry.
- TweetClaw is an OpenClaw plugin, not an MCP server.
- Xquik has a remote MCP endpoint, so Xquik may fit better than TweetClaw, but it needs a deeper audit of the repo's category format and entry expectations.

Action:

- Do not add TweetClaw directly.
- Consider an Xquik MCP entry only after confirming the published MCP server metadata, category placement, and no duplicate open or closed PR exists.

### agent-matrix/catalog

Status: already listed.

Repository: https://github.com/agent-matrix/catalog

Findings:

- GitHub code search found `com.xquik/mcp` already listed at `servers/com-xquik/mcp-com-xquik-mcp-sse-e10bde108a/manifest.json`.
- The same search also found canonical Xquik MCP metadata in `Xquik-dev/x-twitter-scraper/server.json` and the private `Xquik-dev/xquik/server.json`.

Action:

- Do not submit another Xquik MCP entry to this catalog.
- If future metadata changes are needed, update the existing catalog entry in place and follow that repo's contribution rules.

## Registry Notes

### ClawHub TweetClaw Security Page

Status: stale registry scan.

URL: https://clawhub.ai/plugins/%40xquik%2Ftweetclaw/security/openclaw

Findings:

- The ClawHub security page reviewed `@xquik/tweetclaw` version `1.6.2` on 2026-05-02.
- That review still mentions the old JavaScript executor and broad account-admin exposure.
- Local TweetClaw removed the executor, blocks sensitive account-admin endpoints, and now needs a fresh publish/rescan after the current package version lands.
- The npm registry already has `@xquik/tweetclaw@1.6.5`, but that tarball still contains the old executor file. New local safety fixes must publish under a new version.
- `Xquik-dev/tweetclaw` repository metadata was updated on 2026-05-05 to remove the stale `113 endpoints` description and advertise the current 99 agent-callable endpoints.
- `@xquik/tweetclaw@1.6.6` was published to npm on 2026-05-05. The published tarball was verified with `dist/index.js` present and `src/tools/executor.ts` absent.
- `@xquik/tweetclaw@1.6.7` was published to npm on 2026-05-05 after adding the package artifact gate. The published tarball was verified with `dist/index.js` present and `src/tools/executor.ts` absent.
- `@xquik/tweetclaw@1.6.8` was published to npm on 2026-05-05 after making the package artifact gate derive required files from OpenClaw package and manifest metadata. The published tarball was verified with `dist/index.js` and `skills/tweetclaw/SKILL.md` present and `src/tools/executor.ts` absent.

Action:

- Keep future package versions newer than the latest published npm version before publishing more safety or compatibility fixes.
- After publish, request or trigger a ClawHub rescan so the security page reflects the structured tool implementation.
