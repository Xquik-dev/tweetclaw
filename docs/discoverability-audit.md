# Discoverability Audit

Persistent state for TweetClaw GitHub discoverability, Context7 quality, external placement, release hygiene, and no-duplicate outreach. Keep this file compact: preserve current status, blockers, PR/issue links, and next actions; remove repeated heartbeat logs.

## Recurring Rules

- Treat GitHub repo marketability, discoverability, SEO, trust, and quality as a primary recurring objective.
- Before external outreach, read the target README, contribution rules, license, templates, open and closed PRs/issues, and search for `tweetclaw`, `xquik`, `x-twitter-scraper`, and `@xquik/tweetclaw`.
- Prefer one useful repo-native contribution over many thin listings.
- Do not duplicate open PRs, merged PRs, declined submissions, maintainer decisions, or generated catalog entries.
- Keep external PRs narrow, factual, credential-free, placeholder-only, and in the target repo's style.
- Use Markdown body files or stdin with real newlines for external PRs/issues/comments, then read back the body and verify no literal `\n` sequences.
- If a target exposes secret-like examples, prefer a narrow safety patch or private disclosure path and never repeat the value.
- For generated catalogs, identify the upstream source before opening direct generated-output PRs.
- Compact this audit whenever repeated run history starts hiding the current action state.

## Current TweetClaw State

- GitHub repo: https://github.com/Xquik-dev/tweetclaw
- npm: `@xquik/tweetclaw@1.6.25`, shasum `911d99756bd393b6c134e6b23d81bc8603c49a71`, modified `2026-05-07T21:10:49.147Z`.
- ClawHub package: latest `1.6.25`, owner `kriptoburak`, family `code-plugin`, artifact `npm-pack`, package scan clean, verification scan clean, static scan clean on engine `v2.4.22` after accepted rescan request `sd7ds0wqjw6h641y9r835ehreh869fqq`.
- ClawHub release: `rd7836qrymyw45xjzba2t1jzqh869ceh`, source commit `d276e7301571a866c8b837651ec6c3956f86bc75`, sha256 `0462d82fa1b6b350381a4bf7c7d96fc034d6701cb273248cb3a0fe71e5b62bfd`.
- GitHub repo metadata as of 2026-05-07 21:01 UTC: public, MIT, default branch `master`, 37 stars, 3 forks, description mentions OpenClaw, structured Xquik endpoints, and 99 agent-callable endpoints; topics include OpenClaw, X/Twitter, MCP, pay-per-use, skills, automation, and TweetClaw.
- Open GitHub issues and PRs in `Xquik-dev/tweetclaw`: none as of 2026-05-07 21:01 UTC.

## Current Context7 State

- Library: https://context7.com/xquik-dev/tweetclaw
- Benchmark: https://context7.com/xquik-dev/tweetclaw?tab=benchmark
- Ownership: claimed and verified, managed from `context7.json`.
- Current observed benchmark on 2026-05-07 21:41 UTC: score `87`, 175 snippets, 8 pages, 0 parse failures, last update `2026-05-07T21:41:53.677Z`, source SHA `8d343b4bd411d5c7a7db3f51ec80f4051b3ae26a`.
- Static HTML exposes top-level benchmark numbers but not category-level findings. Context API retrieval still returned one stale generated `llms.txt` `initMpp` snippet describing 32 read-only endpoints, even though current repo docs and Context7 rules say 31.
- Current fix path: remove the redundant default-branch override and exclude `mpp.ts` from Context7 parsing because it is a small implementation helper, not endpoint coverage documentation. Keep MPP setup and limits sourced from `docs/context7-agent-guide.md`, `docs/openclaw-setup.md`, `docs/agent-workflows.md`, the skill, and `src/api-spec.ts`. Final poll still showed Context7 settings from the previous config, so next run should check whether this is cache lag or a web-UI config override.
- Active source map for retrieval: `docs/context7-agent-guide.md`, `docs/openclaw-setup.md`, `docs/agent-workflows.md`, `skills/tweetclaw/SKILL.md`, `openclaw.plugin.json`, `package.json`, and `src/api-spec.ts`.
- Latest known successful Context7 workflow after docs changes: https://github.com/Xquik-dev/tweetclaw/actions/runs/25523606088

## Current Compatibility Findings

- OpenClaw npm latest is `2026.5.6`; beta is `2026.5.7` as of 2026-05-07 21:01 UTC.
- OpenClaw `v2026.5.7` release page exists and was published at `2026-05-07T20:57:43Z`, but `gh release view --repo openclaw/openclaw` still returns `v2026.5.6` as the default latest release. Compare `v2026.5.6...v2026.5.7` showed plugin install, release-publish, channel, cron, and provider maintenance with no required TweetClaw manifest or route change.
- Official OpenClaw manifest docs still place native plugin discovery metadata in `openclaw.plugin.json` and install-on-demand metadata in `package.json#openclaw.install`.
- OpenClaw plugin build docs still support published package installs and ClawHub-first bare package resolution.
- GitHub docs continue to frame README files and topics as primary repo discovery and evaluation surfaces.
- Xquik docs drift reappeared on 2026-05-07 20:37 UTC: public billing search text says 32 MPP endpoints and lists media download. Local Xquik source remains source of truth: `lib/mpp/pricing.test.ts` asserts 31 eligible routes and `POST /api/v1/x/media/download` is not MPP eligible; TweetClaw 1.6.25 clarifies that user media MPP means timeline reads, not media file download.

## Open External Work To Monitor

### OpenClaw And OpenClaw-Agent Surfaces

| Target | Status | Link | Next action |
| --- | --- | --- | --- |
| jensrot/awesome-openclaw | TweetClaw PR open, mergeable, no comments as of 2026-05-07 19:21 UTC | https://github.com/jensrot/awesome-openclaw/pull/3 | Monitor only |
| composio-community/awesome-openclaw-plugins | TweetClaw PR open, mergeable, no comments as of 2026-05-07 20:37 UTC | https://github.com/composio-community/awesome-openclaw-plugins/pull/5 | Monitor only |
| composio-community/awesome-openclaw-plugins | CC0 license hygiene PR open, mergeable, no comments as of 2026-05-07 20:37 UTC | https://github.com/composio-community/awesome-openclaw-plugins/pull/7 | Monitor only |
| alvinreal/awesome-openclaw | TweetClaw PR already open | https://github.com/alvinreal/awesome-openclaw/pull/25 | Monitor only |
| alvinreal/awesome-openclaw-tips | Optional plugin tool allowlist tip PR open | https://github.com/alvinreal/awesome-openclaw-tips/pull/2 | Monitor only |
| TravisLeeeeee/awesome-openclaw-personas | X/Twitter Growth persona TweetClaw guidance PR open | https://github.com/TravisLeeeeee/awesome-openclaw-personas/pull/2 | Monitor only |
| EthanYolo01/Awesome-OpenClaw | TweetClaw PR already open | https://github.com/EthanYolo01/Awesome-OpenClaw/pull/6 | Monitor only |
| OpenClaw-Korea/awesome-openclaw | Bilingual TweetClaw PR open | https://github.com/OpenClaw-Korea/awesome-openclaw/pull/1 | Monitor only |
| rylena/awesome-openclaw | TweetClaw social skill PR open | https://github.com/rylena/awesome-openclaw/pull/2 | Monitor only |
| ZeroLu/awesome-openclaw | Bilingual TweetClaw social media PR open | https://github.com/ZeroLu/awesome-openclaw/pull/3 | Monitor only |
| VoltAgent/awesome-openclaw-skills | TweetClaw skill PR open | https://github.com/VoltAgent/awesome-openclaw-skills/pull/436 | Monitor only |
| BlockRunAI/awesome-OpenClaw-Money-Maker | TweetClaw monetization use-case PR open | https://github.com/BlockRunAI/awesome-OpenClaw-Money-Maker/pull/12 | Monitor only |
| OthmaneBlial/awesome-openclaw-examples | X/Twitter Ops Desk starter PR open | https://github.com/OthmaneBlial/awesome-openclaw-examples/pull/1 | Monitor only |
| EvoLinkAI/awesome-openclaw-usecases-moltbook | TweetClaw social workflows PR open | https://github.com/EvoLinkAI/awesome-openclaw-usecases-moltbook/pull/9 | Monitor only |
| AIPMAndy/awesome-openclaw-skills-CN | x-twitter-scraper PR open; TweetClaw should wait | https://github.com/AIPMAndy/awesome-openclaw-skills-CN/pull/4 | Monitor, no duplicate |
| AlexAnys/awesome-openclaw-usecases-zh | X/Twitter TweetClaw/Xquik use-case PR open | https://github.com/AlexAnys/awesome-openclaw-usecases-zh/pull/41 | Monitor only |
| codeaashu/awesome-openclaw-Skills | TweetClaw PR open | https://github.com/codeaashu/awesome-openclaw-Skills/pull/2 | Monitor only |
| LeoYeAI/openclaw-master-skills | TweetClaw submission issue open; x-twitter-scraper PR 4 also open but conflicting | https://github.com/LeoYeAI/openclaw-master-skills/issues/38 | Monitor only |
| geekjourneyx/awesome-openclaw | Community skill PR open | https://github.com/geekjourneyx/awesome-openclaw/pull/2 | Monitor only |
| sean1888/clawmart | Featured skill PR open | https://github.com/sean1888/clawmart/pull/1 | Monitor only |
| phoenix-assistant/openclaw-skill-marketplace | TweetClaw manifest example PR open | https://github.com/phoenix-assistant/openclaw-skill-marketplace/pull/1 | Monitor only |
| TheClawFirm/clawfactory | Submission-path issue open | https://github.com/TheClawFirm/clawfactory/issues/1 | Wait for maintainer path |
| mergisi/awesome-openclaw-agents | X/Twitter Ops Desk agent PR open, clean, no comments/reviews/checks as of 2026-05-07 20:37 UTC | https://github.com/mergisi/awesome-openclaw-agents/pull/69 | Monitor only |
| clawdbot-ai/awesome-openclaw-skills-zh | Xquik PR open, mergeable, no comments as of 2026-05-07 19:45 UTC | https://github.com/clawdbot-ai/awesome-openclaw-skills-zh/pull/26 | Monitor, no duplicate TweetClaw PR while open |
| nowork-studio/openclaw-social-media-skills | TweetClaw checks PR open | https://github.com/nowork-studio/openclaw-social-media-skills/pull/1 | Monitor only |
| ununununium/openclaw-social-media-skills | TweetClaw checks PR open | https://github.com/ununununium/openclaw-social-media-skills/pull/1 | Monitor only |
| zuocharles/openclaw-social-media-skill | Optional TweetClaw X workflows PR open | https://github.com/zuocharles/openclaw-social-media-skill/pull/1 | Monitor only |
| benminer/openclaw-twitter-skill | TweetClaw plugin option PR open | https://github.com/benminer/openclaw-twitter-skill/pull/1 | Monitor only |
| adminlove520/openclaw-twitter-skill | TweetClaw companion workflows PR open | https://github.com/adminlove520/openclaw-twitter-skill/pull/1 | Monitor only |
| NIANS336/openclaw-x-twitter-auto | Safer TweetClaw workflows PR open | https://github.com/NIANS336/openclaw-x-twitter-auto/pull/1 | Monitor only |
| thomasbln/openclaw-marketing-agent | Optional Xquik signal source PR open | https://github.com/thomasbln/openclaw-marketing-agent/pull/1 | Monitor only |
| arlobottman/openclaw-twitter | Twitter skill guidance PR open | https://github.com/arlobottman/openclaw-twitter/pull/1 | Monitor only |
| zhaoxinyi02/ClawPanel-Plugins | Safety PR open; TweetClaw listing not submitted | https://github.com/zhaoxinyi02/ClawPanel-Plugins/pull/1 | Wait for maintainer format |
| X-RayLuan/openclaw-social-media-marketing | Optional TweetClaw X lane PR open | https://github.com/X-RayLuan/openclaw-social-media-marketing/pull/1 | Monitor only |
| zxfzvip/openclaw-twitter-tech-news | Credential redaction PR open | https://github.com/zxfzvip/openclaw-twitter-tech-news/pull/1 | Monitor; consider TweetClaw only after safety path lands |

### MCP And Xquik Ecosystem Surfaces

| Target | Status | Link | Next action |
| --- | --- | --- | --- |
| abordage/awesome-mcp | Xquik MCP description update PR open and previously green | https://github.com/abordage/awesome-mcp/pull/32 | Monitor only |
| appcypher/awesome-mcp-servers | Branch pushed; PR creation blocked by cross-fork permission; issues disabled | https://github.com/kriptoburak/appcypher-awesome-mcp-servers/tree/codex/add-xquik-mcp-listing | Human or credential with PR permission must open it |
| docker/mcp-registry | Xquik remote MCP PR open | https://github.com/docker/mcp-registry/pull/3229 | Monitor only |
| The-Web-Scraping-Playbook/awesome-twitter-scrapers | Xquik PR already open | https://github.com/The-Web-Scraping-Playbook/awesome-twitter-scrapers/pull/1 | Monitor only |
| AIWerk/mcp-bridge | Xquik docs MCP server submission issue open | https://github.com/AIWerk/mcp-bridge/issues/5 | Monitor; prepare recipe only if requested |

## Already Listed Or Completed

- ThisIsJeron/awesome-openclaw-plugins: TweetClaw PR 8 merged.
- SamurAIGPT/awesome-openclaw: TweetClaw and Xquik entries merged; later duplicate PR 111 closed.
- thewh1teagle/awesome-openclaw: TweetClaw PR 10 merged.
- punkpeye/awesome-mcp-servers: Xquik MCP server PR 4464 merged; TweetClaw is not an MCP server.
- Official MCP Registry: `com.xquik/mcp` active and latest as of 2026-05-06.
- hridaydutta123/awesome-twitter-tools: Xquik entry current after merged PRs 24, 25, 26, and 32.
- agent-matrix/catalog: `com.xquik/mcp` already listed.
- dvcrn/openclaw-skills-marketplace: generated entries already include TweetClaw and Xquik skill variants.
- hesamsheikh/awesome-openclaw-usecases: TweetClaw use case merged in PR 72.
- rohitg00/awesome-openclaw: default branch already lists TweetClaw; stale PR 89 remains open.
- cogine-ai/awesome-openclaw-zh: TweetClaw social use case merged via PR 8.
- MCP Directory and PulseMCP: Xquik already listed; MCP.Directory has stale endpoint copy and no supported automated update route found.
- Glama and MCP.so: Xquik already listed but visible copy may be stale; no documented public update route found.

## Do Not Duplicate

- vincentkoc/awesome-openclaw: prior TweetClaw PR 12 and issue 11 closed; issue 68 remains open.
- alvinreal/awesome-openclaw: PR 25 already open.
- EthanYolo01/Awesome-OpenClaw: PR 6 already open.
- VoltAgent/awesome-openclaw-skills: x-twitter-scraper already listed; TweetClaw PR 436 open.
- sundial-org/awesome-openclaw-skills: x-twitter-scraper PR 16 open; wait before TweetClaw.
- clawdbot-ai/awesome-openclaw-skills-zh: PR 26 already covers Xquik family in the same category.
- AIPMAndy/awesome-openclaw-skills-CN: x-twitter-scraper PR 4 open; TweetClaw should wait for official skill-path requirements.
- AlexAnys/awesome-openclaw-usecases-zh: PR 41 already covers X/Twitter automation.
- codeaashu/awesome-openclaw-Skills: TweetClaw PR 2 open.
- LeoYeAI/openclaw-master-skills: issue 38 already submitted TweetClaw.

## Audited No-Action Or Blocked Candidates

- duanecilliers/awesome-openclaw: repository cloned empty on 2026-05-06.
- serenakeyitan/awesome-openclaw-roles: possible Twitter/X fit, but missing license/contribution files make automated vendor listing ambiguous.
- habitoai/awesome-mcp-servers: inactive since 2025-04-02; no PR opened.
- andypiper/awesome-modern-twitter-api: archived and narrowly scoped to Twitter API v2.
- MCPRepository `/servers/xquik`: 404 at checked URL.
- Smithery `@xquik-dev/x-twitter-scraper`: 404 at checked URL.
- af0nx/openclaw-twitterbot: broad OpenClaw snapshot; future path could be a narrow docs patch only if maintainer appears active beyond dependency updates.
- Polystichumlonchitissumatran261/tweetclaw: no license, issues disabled, no usable integration surface.
- hundevmode/twitter-x-apify-actors-openclaw-skill: Apify-specific; revisit only if maintainer invites non-Apify companion workflows.
- Lobstash/twitter-plugin: read README, contribution text, license status, templates, issues, and PRs on 2026-05-07. No license file despite README MIT note, no contribution templates, zero issues/PRs, tracked dependencies, and no TweetClaw/Xquik references; no placement PR opened.
- FranciscoBuiltDat/openclaw-tweet-summarizer-lite: read README, SECURITY.md, SKILL.md, package metadata, scripts, issue list, PR list, and repository metadata on 2026-05-07. No license file despite README badge, no contribution templates, zero issues/PRs, and the workflow depends on user session cookies. No TweetClaw placement opened because a companion listing would be promotional without maintainer interest; future useful path is a maintainer-requested credential-boundary or alternative-integration note.

## Package And Release Notes

- Keep future package versions newer than npm latest before publishing package-affecting safety, compatibility, docs-in-package, or metadata fixes.
- Use `npm run check:all`, `npm pack --dry-run --json`, and `node scripts/clawpack.mjs dry-run` before releases.
- Use `node scripts/clawpack.mjs publish` for ClawHub package releases; do not publish the repo folder directly.
- After ClawHub publish, inspect latest and version-specific package JSON, request a rescan, and record artifact kind, digest metadata, scan status, source repo/ref/commit, and blockers in `docs/clawpack-release.md`.
- Do not publish a renamed `xquik` plugin alias from a TweetClaw artifact unless the publisher explicitly approves a real alias package identity.

## Hygiene Notes

- `.gitignore` covers env files, registry tokens, local OpenClaw/ClawHub/Context7 state, package archives, dependency/build output, logs, caches, local agents, editors, and security scan artifacts.
- `scripts/check-versions.mjs` guards version sync and protected public wording without publishing the blocked terms.
- Public hygiene scans should cover Git-tracked plus non-ignored untracked files.
- Use file paths and counts when reporting potential secret-like local files; never print file contents.

## Last Run Summary

2026-05-07 21:35 UTC:

- Local repo clean at `c14e620` before edits; no open TweetClaw repo issues or PRs.
- npm `@xquik/tweetclaw@1.6.25`, ClawHub latest, package scan, verification scan, and version-specific static scan still matched the clean 1.6.25 baseline.
- OpenClaw npm latest remains `2026.5.6`, beta remains `2026.5.7`, and GitHub default latest still resolves to `v2026.5.6`; `v2026.5.7` exists but does not require a TweetClaw bump.
- Context7 benchmark improved to `87` on source SHA `8d343b4`, with 175 snippets, 8 pages, 0 parse failures, and one stale generated `initMpp` snippet still saying 32 endpoints.
- Context7 fix applied: remove the redundant default-branch override and exclude `mpp.ts` from parsing so the implementation helper stops generating endpoint-coverage prose.
- PR rechecks: mergisi/awesome-openclaw-agents PR 69 clean/open; composio-community/awesome-openclaw-plugins PRs 5 and 7 clean/open.
- External candidate audited: FranciscoBuiltDat/openclaw-tweet-summarizer-lite; no useful placement PR opened because a TweetClaw companion note would be promotional without maintainer interest.
