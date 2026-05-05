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

### jensrot/awesome-openclaw

Status: PR open.

Repository: https://github.com/jensrot/awesome-openclaw

Pull request: https://github.com/jensrot/awesome-openclaw/pull/3

Rules observed:

- CONTRIBUTING asks for high-quality OpenClaw resources, concise `[Name](Link) - Description.` entries, direct working links, appropriate category placement, and alphabetical order.
- PR template requires correct section, formatting, alphabetical order, duplicate search, and link validation.
- License is CC0-1.0.

Findings:

- `tweetclaw`, `xquik`, and `x-twitter-scraper` were not present in README.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- README has a Plugins section with similar OpenClaw plugin entries.

Action:

- Opened PR 3, `Add TweetClaw plugin`, adding one concise TweetClaw entry to the Plugins section.
- PR is open and mergeable as of 2026-05-06. Future runs should monitor it and avoid duplicate submissions unless the maintainer asks for changes.

### composio-community/awesome-openclaw-plugins

Status: PR already open.

Repository: https://github.com/composio-community/awesome-openclaw-plugins

Findings:

- PR 5, `Add Social Media section with tweetclaw`, is open as of 2026-05-06.
- No separate issue matching TweetClaw or Xquik was found.

Action:

- Do not open another TweetClaw PR here.
- Future runs may monitor PR 5, but should avoid repeated status comments unless there is concrete maintainer feedback.

### ThisIsJeron/awesome-openclaw-plugins

Status: already listed.

Repository: https://github.com/ThisIsJeron/awesome-openclaw-plugins

Rules observed:

- CONTRIBUTING asks for one plugin per PR, valid `openclaw.plugin.json`, installable plugins, concise descriptions, proper category placement, and no spam.
- README uses one-line plugin entries with install commands.

Findings:

- TweetClaw is already listed in README under Utility Plugins.
- PR 8, `Add TweetClaw X/Twitter automation plugin`, merged on 2026-04-08.

Action:

- Do not open another TweetClaw PR here.

### vincentkoc/awesome-openclaw

Status: do not duplicate.

Repository: https://github.com/vincentkoc/awesome-openclaw

Findings:

- PR 12, `feat(readme): add TweetClaw X/Twitter automation plugin`, was closed unmerged on 2026-03-25.
- Issue 11 for TweetClaw was closed on 2026-03-25.
- Issue 68, `feat(list): add Xquik-dev/tweetclaw`, is open as of 2026-05-06.
- PR 9 for `x-twitter-scraper` was closed unmerged on 2026-03-11, and issue 8 was closed on 2026-04-18.

Action:

- Do not open another TweetClaw or x-twitter-scraper PR here.
- Only revisit if issue 68 receives maintainer feedback that asks for a concrete change.

### alvinreal/awesome-openclaw

Status: PR already open.

Repository: https://github.com/alvinreal/awesome-openclaw

Findings:

- PR 25, `Add Xquik-dev/tweetclaw to Plugins & Channel Integrations`, is open as of 2026-05-06.
- No separate issue matching TweetClaw or Xquik was found.

Action:

- Do not open another TweetClaw PR here.

### EthanYolo01/Awesome-OpenClaw

Status: PR already open.

Repository: https://github.com/EthanYolo01/Awesome-OpenClaw

Findings:

- PR 6, `Add TweetClaw X/Twitter plugin to Skills & Plugins`, is open as of 2026-05-06.
- No separate issue matching TweetClaw or Xquik was found.

Action:

- Do not open another TweetClaw PR here.

### SamurAIGPT/awesome-openclaw

Status: already listed.

Repository: https://github.com/SamurAIGPT/awesome-openclaw

Findings:

- PR 64, `Add TweetClaw OpenClaw plugin for X/Twitter automation`, merged on 2026-03-13.
- PR 58, `Add x-twitter-scraper - X API skill with 40+ tools & MCP server`, merged on 2026-03-10.
- PR 111, `Add tweetclaw (X/Twitter automation plugin)`, was closed on 2026-04-22, after TweetClaw was already listed.
- README currently contains TweetClaw and Xquik references.

Action:

- Do not submit another TweetClaw or x-twitter-scraper entry here.

### thewh1teagle/awesome-openclaw

Status: already listed.

Repository: https://github.com/thewh1teagle/awesome-openclaw

Findings:

- PR 10, `Add tweetclaw to Social`, merged on 2026-05-02.

Action:

- Do not open another TweetClaw PR here.

### OpenClaw-Korea/awesome-openclaw

Status: candidate, not submitted yet.

Repository: https://github.com/OpenClaw-Korea/awesome-openclaw

Rules observed:

- README links to organization contribution guidelines and asks for relevant OpenClaw resources, working links, and short descriptions.
- README has an empty Skills & Plugins section inviting PRs.
- README has both English and Korean versions, so a high-quality contribution should update both files or follow the maintainer's bilingual pattern.

Findings:

- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- Local README search found no TweetClaw or Xquik entry.

Action:

- Good future candidate if a bilingual entry can be made carefully.
- Do not submit an English-only drive-by PR without checking the shared organization contribution guidelines first.

### rylena/awesome-openclaw

Status: candidate, not submitted yet.

Repository: https://github.com/rylena/awesome-openclaw

Findings:

- README is a large consolidated guide plus generated skills catalog.
- Local search found no TweetClaw or Xquik entry.
- No matching TweetClaw or Xquik PRs/issues were found in this run.

Action:

- Potential future target, but needs deeper format and generation-source review before any PR.

### ZeroLu/awesome-openclaw

Status: low-fit candidate.

Repository: https://github.com/ZeroLu/awesome-openclaw

Findings:

- README focuses on tutorials, skills, and use cases rather than plugin discovery.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.

Action:

- Do not prioritize unless a useful tutorial or use-case contribution is created, not a plain plugin listing.

### duanecilliers/awesome-openclaw

Status: no action.

Repository: https://github.com/duanecilliers/awesome-openclaw

Findings:

- Repository cloned as empty on 2026-05-06.

Action:

- Do not submit until the repository has content and contribution expectations.

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
- PR 436, `Add skill: kriptoburak/tweetclaw`, is open as of 2026-05-06.

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
- `@xquik/tweetclaw@1.6.9` was published to npm on 2026-05-06 after enabling `noPropertyAccessFromIndexSignature` and updating dynamic record access. The published tarball was verified with `dist/index.js` and `skills/tweetclaw/SKILL.md` present and `src/tools/executor.ts` absent.
- `@xquik/tweetclaw@1.6.10` was published to npm on 2026-05-06 after adding `openclaw.install.npmSpec` and `defaultChoice` metadata for OpenClaw onboarding/install flows. The published tarball was verified with `dist/index.js` and `skills/tweetclaw/SKILL.md` present and `src/tools/executor.ts` absent.
- `@xquik/tweetclaw@1.6.11` was published to npm on 2026-05-06 after adding the ClawPack release workflow and overriding `ip-address` to `10.2.0` so the current OpenClaw transitive install tree audits cleanly. The published tarball was verified with `dist/index.js`, `openclaw.plugin.json`, and `skills/tweetclaw/SKILL.md` present.
- `clawhub package inspect @xquik/tweetclaw --json` still reports ClawHub latest `1.6.2` with `artifact.kind: "legacy-zip"` and stale `111 endpoints` summary copy as of 2026-05-06.
- `node scripts/clawpack.mjs dry-run` successfully built a ClawPack npm-pack tarball for `@xquik/tweetclaw@1.6.11` with 57 files, sha256 `7499c0a94f4dc07bf62aa0d671e973a0d66dc08152d1433abaf39a75505e21de`, npm integrity `sha512-QhOfuQZKMjR9ByLGg4kQWtHrbd6CWOAQetz7rrg+nSUPKdnElpAwq/CWn12yN3i1lLo8IdMvGuBiq32B2yZkLw==`, and npm shasum `d6a3582b7c062d3ba7d33490d874de597dd814ef`.
- `clawhub package publish <tarball> --dry-run --family code-plugin` succeeds for the generated tarball. Publishing the repo folder directly dry-runs as `bundle-plugin`, so future runs must publish the generated tarball with `--family code-plugin`.
- Local ClawHub auth is not configured. `clawhub whoami` returns `Not logged in`, so ClawPack publication requires owner login or a ClawHub token before it can be completed.
- ClawHub browser auth was completed as `kriptoburak` on 2026-05-06.
- `@xquik/tweetclaw@1.6.11` was published to ClawHub as release `rd740m3et9cr2kj9tqjpaq8xdn8642kd` on 2026-05-06 using the generated ClawPack tarball, `--family code-plugin`, and owner `kriptoburak`.
- Post-publish ClawHub inspection reports latest `1.6.11`, `artifact.kind: "npm-pack"`, `artifact.format: "tgz"`, 57 files, sha256 `7499c0a94f4dc07bf62aa0d671e973a0d66dc08152d1433abaf39a75505e21de`, npm integrity `sha512-QhOfuQZKMjR9ByLGg4kQWtHrbd6CWOAQetz7rrg+nSUPKdnElpAwq/CWn12yN3i1lLo8IdMvGuBiq32B2yZkLw==`, npm shasum `d6a3582b7c062d3ba7d33490d874de597dd814ef`, npm tarball `xquik-tweetclaw-1.6.11.tgz`, and OpenClaw compatibility `2026.5.4`.
- ClawHub rescan request `sd7d44dr8az6j800gkgqdvfxmd864nsk` was accepted for `1.6.11`; the package later reported `scanStatus: clean`.
- The VirusTotal, static analysis, and ClawScan security pages all point to plugin `1.6.11` and artifact hash `7499c0a94f4dc07bf62aa0d671e973a0d66dc08152d1433abaf39a75505e21de` as of 2026-05-06. VirusTotal reports no malicious or suspicious engine hits, static analysis reports no suspicious patterns, and ClawScan reports a benign review.

Action:

- Keep future package versions newer than the latest published npm version before publishing more safety or compatibility fixes.
- Monitor future ClawHub package versions for stale scanner pages. If a future scan stays pending or fails, use owner rescan/moderation workflows instead of opening duplicate packages.
