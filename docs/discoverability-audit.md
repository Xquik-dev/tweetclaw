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
- npm: `@xquik/tweetclaw@1.6.27`, shasum `6a75ea6b07628fb39d96974d649afc34eb05232d`, modified `2026-05-08T02:08:21.040Z`.
- GitHub release: `v1.6.27`, published `2026-05-08T02:33:51Z`, tag and release source commit `88b7879ed62c1a47ed33833afabe4654d9d86d9c`.
- ClawHub package: latest `1.6.26`, owner `kriptoburak`, family `code-plugin`, artifact `npm-pack`, package scan clean, verification scan clean, static scan clean on engine `v2.4.22` after accepted rescan request `sd794yd3eeb4av48t4tta8cyt186by6p`. ClawHub publish for `1.6.27` is blocked by owner-scope validation requiring an `@xquik` package to publish under owner `xquik`.
- ClawHub release: `rd72xygfzsrwgzvqx9aaggrkwx86ak8c`, source commit `76e3db4b14b08937b6a8611d36ce531394499111`, sha256 `1869312b2c46aae9d3cb06634a6040d2a1d2e1b4f09c9d6bb5d3cc7e5fc4d27e`.
- GitHub repo metadata as of 2026-05-08 13:36 UTC: public, MIT, default branch `master`, 37 stars, 3 forks, description mentions OpenClaw, structured Xquik endpoints, and 99 agent-callable endpoints; topics include OpenClaw, TweetClaw, Xquik, X/Twitter, MCP, pay-per-use, skills, automation, ClawHub, Context7, social media, and data extraction.
- Open GitHub issues and PRs in `Xquik-dev/tweetclaw`: none as of 2026-05-08 13:36 UTC.

## Current Context7 State

- Library: https://context7.com/xquik-dev/tweetclaw
- Benchmark: https://context7.com/xquik-dev/tweetclaw?tab=benchmark
- Ownership: claimed and verified, managed from `context7.json`.
- Current observed benchmark on 2026-05-08 13:36 UTC: score `85.4`, 180 snippets, 8 pages, 0 parse failures, last update `2026-05-08T12:23:05.519Z`, source SHA `bab14665a783eb24633e5c51a7cb83d0e4868908`.
- Static HTML exposes top-level benchmark numbers but not category-level findings. The benchmark page and generated `llms.txt` still include old 32-endpoint and MPP media-download snippets from generated version-cache content even though current repository files have only the current 31-endpoint guidance and `src/api-spec.ts` marks `/api/v1/x/media/download` as authenticated-only and not MPP-eligible.
- Context7 public page data still lists old finalized tag versions `v1.6.12`, `v1.6.13`, `v1.6.14`, and `v1.6.15`. Official Context7 docs say previous tag versions are managed from the Versions tab, so the next useful fix is removing those old versions in the Context7 web UI, not another TweetClaw source patch.
- 2026-05-08 04:30 UTC: the documented public Context7 API shape is `GET /api/v2/context` with `libraryId=/xquik-dev/tweetclaw`. That API now works for TweetClaw and returns correct current docs for 31-endpoint MPP and non-MPP media downloads, but it also still returns stale generated `llms.txt` APIDOC snippets that say 32 endpoints and imply MPP media download support.
- No documented public Context7 owner API for deleting old configured versions was found in the current API docs; the documented refresh API only triggers reprocessing.
- Current fix path: inspect Context7 web UI version settings and generated `llms.txt` cache behavior before changing source again, because Context7 has parsed current source but still surfaces stale snippets from old generated/version content.
- Active source map for retrieval: `docs/context7-agent-guide.md`, `docs/openclaw-setup.md`, `docs/agent-workflows.md`, `skills/tweetclaw/SKILL.md`, `openclaw.plugin.json`, `package.json`, and `src/api-spec.ts`.
- Latest release-source Context7 refresh workflow: https://github.com/Xquik-dev/tweetclaw/actions/runs/25532613893 returned success and Context7 parsed source `88b7879ed62c1a47ed33833afabe4654d9d86d9c`. Follow-up docs workflows https://github.com/Xquik-dev/tweetclaw/actions/runs/25532901864, https://github.com/Xquik-dev/tweetclaw/actions/runs/25533496996, and https://github.com/Xquik-dev/tweetclaw/actions/runs/25533999540 completed with `user-has-active-task` warnings.
- Docs-only follow-up refreshes hit HTTP 429 at https://github.com/Xquik-dev/tweetclaw/actions/runs/25523777952, https://github.com/Xquik-dev/tweetclaw/actions/runs/25523821197, https://github.com/Xquik-dev/tweetclaw/actions/runs/25524732104, https://github.com/Xquik-dev/tweetclaw/actions/runs/25525682256, https://github.com/Xquik-dev/tweetclaw/actions/runs/25525721660, https://github.com/Xquik-dev/tweetclaw/actions/runs/25526577045, https://github.com/Xquik-dev/tweetclaw/actions/runs/25527556582, and https://github.com/Xquik-dev/tweetclaw/actions/runs/25528273046. The workflow now treats Context7 429s as retry-later warnings so rate limits do not leave unrelated repo commits red.
- Follow-up refreshes https://github.com/Xquik-dev/tweetclaw/actions/runs/25528883982, https://github.com/Xquik-dev/tweetclaw/actions/runs/25528923632, and https://github.com/Xquik-dev/tweetclaw/actions/runs/25529996280 returned `user-has-active-task`. Workflows https://github.com/Xquik-dev/tweetclaw/actions/runs/25529918016, https://github.com/Xquik-dev/tweetclaw/actions/runs/25530596401, https://github.com/Xquik-dev/tweetclaw/actions/runs/25530803341, https://github.com/Xquik-dev/tweetclaw/actions/runs/25530939642, https://github.com/Xquik-dev/tweetclaw/actions/runs/25531878278, and https://github.com/Xquik-dev/tweetclaw/actions/runs/25532613893 accepted refreshes. The 2026-05-08 02:15 UTC check confirms Context7 parsed source `88b7879ed62c1a47ed33833afabe4654d9d86d9c`; treat remaining stale 32-endpoint snippets as cache/config drift until proven otherwise.

## Current Compatibility Findings

- OpenClaw npm latest and beta are both `2026.5.7` as of 2026-05-08 13:36 UTC.
- OpenClaw `v2026.5.7` is now the default latest GitHub release, published at `2026-05-07T20:57:43Z`. Compare `v2026.5.6...v2026.5.7` showed 76 commits focused on release hardening, managed plugin dependency handling, channel commands, cron/task repair, and package metadata, with no required TweetClaw manifest, schema, or route change.
- Official OpenClaw manifest docs still place native plugin discovery metadata in `openclaw.plugin.json` and install-on-demand metadata in `package.json#openclaw.install`.
- OpenClaw plugin build docs still support published package installs and ClawHub-first bare package resolution.
- GitHub docs continue to frame README files and topics as primary repo discovery and evaluation surfaces.
- Xquik public `llms.txt` and billing page say MPP covers 31 X-API read-only endpoints as of 2026-05-08 13:36 UTC. The billing page says media downloads require API key or session-cookie authentication because they create gallery links, although search snippets may still lag. Local Xquik source remains source of truth: `lib/mpp/pricing.test.ts` asserts 31 eligible routes and `POST /api/v1/x/media/download` is not MPP eligible; TweetClaw 1.6.25 clarifies that user media MPP means timeline reads, not media file download.

## Open External Work To Monitor

### OpenClaw And OpenClaw-Agent Surfaces

| Target | Status | Link | Next action |
| --- | --- | --- | --- |
| jensrot/awesome-openclaw | TweetClaw PR open, mergeable, no comments as of 2026-05-07 19:21 UTC | https://github.com/jensrot/awesome-openclaw/pull/3 | Monitor only |
| composio-community/awesome-openclaw-plugins | TweetClaw PR open, mergeable, no comments as of 2026-05-08 00:28 UTC | https://github.com/composio-community/awesome-openclaw-plugins/pull/5 | Monitor only |
| composio-community/awesome-openclaw-plugins | CC0 license hygiene PR open, mergeable, no comments as of 2026-05-08 00:28 UTC | https://github.com/composio-community/awesome-openclaw-plugins/pull/7 | Monitor only |
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
| mergisi/awesome-openclaw-agents | X/Twitter Ops Desk agent PR open, clean, no comments/reviews/checks as of 2026-05-08 00:28 UTC | https://github.com/mergisi/awesome-openclaw-agents/pull/69 | Monitor only |
| philipbankier/awesome-agent-skills | TweetClaw OpenClaw plugin PR open, no comments/reviews, mergeability recalculating as of 2026-05-08 10:01 UTC | https://github.com/philipbankier/awesome-agent-skills/pull/12 | Monitor only |
| ythx-101/x-tweet-fetcher | MIT license-file PR open, mergeable, no comments or reviews as of 2026-05-08 10:01 UTC | https://github.com/ythx-101/x-tweet-fetcher/pull/68 | Monitor only |
| clawdbot-ai/awesome-openclaw-skills-zh | Xquik PR open, mergeable, no comments as of 2026-05-07 19:45 UTC | https://github.com/clawdbot-ai/awesome-openclaw-skills-zh/pull/26 | Monitor, no duplicate TweetClaw PR while open |
| nowork-studio/openclaw-social-media-skills | TweetClaw checks PR open | https://github.com/nowork-studio/openclaw-social-media-skills/pull/1 | Monitor only |
| ununununium/openclaw-social-media-skills | TweetClaw checks PR open | https://github.com/ununununium/openclaw-social-media-skills/pull/1 | Monitor only |
| hiveminderbot/openclaw-social-scheduler | Dependency hygiene PR open, mergeable as of 2026-05-08 00:28 UTC | https://github.com/hiveminderbot/openclaw-social-scheduler/pull/1 | Monitor; consider repo metadata or integration guidance only after hygiene lands |
| zuocharles/openclaw-social-media-skill | Optional TweetClaw X workflows PR open | https://github.com/zuocharles/openclaw-social-media-skill/pull/1 | Monitor only |
| benminer/openclaw-twitter-skill | TweetClaw plugin option PR open | https://github.com/benminer/openclaw-twitter-skill/pull/1 | Monitor only |
| adminlove520/openclaw-twitter-skill | TweetClaw companion workflows PR open | https://github.com/adminlove520/openclaw-twitter-skill/pull/1 | Monitor only |
| NIANS336/openclaw-x-twitter-auto | Safer TweetClaw workflows PR open | https://github.com/NIANS336/openclaw-x-twitter-auto/pull/1 | Monitor only |
| thomasbln/openclaw-marketing-agent | Optional Xquik signal source PR open | https://github.com/thomasbln/openclaw-marketing-agent/pull/1 | Monitor only |
| arlobottman/openclaw-twitter | Twitter skill guidance PR open | https://github.com/arlobottman/openclaw-twitter/pull/1 | Monitor only |
| zhaoxinyi02/ClawPanel-Plugins | Safety PR open; TweetClaw listing not submitted | https://github.com/zhaoxinyi02/ClawPanel-Plugins/pull/1 | Wait for maintainer format |
| X-RayLuan/openclaw-social-media-marketing | Optional TweetClaw X lane PR open | https://github.com/X-RayLuan/openclaw-social-media-marketing/pull/1 | Monitor only |
| zxfzvip/openclaw-twitter-tech-news | Credential redaction PR open | https://github.com/zxfzvip/openclaw-twitter-tech-news/pull/1 | Monitor; consider TweetClaw only after safety path lands |
| cberktavsan/x-advisor | Local development clone URL PR open, mergeable as of 2026-05-08 00:28 UTC | https://github.com/cberktavsan/x-advisor/pull/1 | Monitor only |
| ThisIsJeron/awesome-openclaw-plugins | Category placement PR open, mergeable as of 2026-05-08 00:28 UTC | https://github.com/ThisIsJeron/awesome-openclaw-plugins/pull/13 | Monitor only |
| pearl799/twitter-agent | Optional TweetClaw setup-path issue opened after reading README, SKILL, repo metadata, issues, PRs, and duplicate terms; no license file, so no PR yet | https://github.com/pearl799/twitter-agent/issues/1 | Monitor for maintainer interest before docs PR |

### MCP And Xquik Ecosystem Surfaces

| Target | Status | Link | Next action |
| --- | --- | --- | --- |
| abordage/awesome-mcp | Xquik MCP description update PR open and previously green | https://github.com/abordage/awesome-mcp/pull/32 | Monitor only |
| appcypher/awesome-mcp-servers | Branch pushed; PR creation blocked by cross-fork permission; issues disabled | https://github.com/kriptoburak/appcypher-awesome-mcp-servers/tree/codex/add-xquik-mcp-listing | Human or credential with PR permission must open it |
| docker/mcp-registry | Xquik remote MCP PR open | https://github.com/docker/mcp-registry/pull/3229 | Monitor only |
| The-Web-Scraping-Playbook/awesome-twitter-scrapers | Xquik PR already open | https://github.com/The-Web-Scraping-Playbook/awesome-twitter-scrapers/pull/1 | Monitor only |
| AIWerk/mcp-bridge | Xquik docs MCP server submission issue open | https://github.com/AIWerk/mcp-bridge/issues/5 | Monitor; prepare recipe only if requested |
| rohunvora/x-research-skill | License-file metadata issue opened after no-duplicate audit; Xquik backend PR already open | https://github.com/rohunvora/x-research-skill/issues/9 | Monitor only |

## Already Listed Or Completed

- ThisIsJeron/awesome-openclaw-plugins: TweetClaw PR 8 merged; PR 13 is open to move the existing listing into Social Media & Content.
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
- ClawHub package page for the published plugin is https://clawhub.ai/kriptoburak/xquik-tweetclaw; the skill page remains https://clawhub.ai/xquik/tweetclaw.

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
- seantunley/openclaw-social-pipeline: read README, package metadata, docs, issue list, PR list, and repository metadata on 2026-05-07. No license file despite README and package MIT metadata, no contribution templates, one prior merged install-doc PR, and no TweetClaw/Xquik references. No placement PR opened because the repo is a full publishing pipeline; useful future path is license hygiene after maintainer confirms copyright text or a maintainer-requested companion integration note.
- Lala0Land/openclaw-social-skills: read README, issue list, closed PR 1, repository metadata, and searched for TweetClaw/Xquik terms on 2026-05-07. The repo is directly relevant but has no license file despite a README license link, no templates, and a closed prior listing PR; no TweetClaw PR opened because changing a top-10 ranked list would be low-context without maintainer interest.
- RAFOLIE/openclaw-mcp-twitter-reader: read README, package metadata, issue list, PR list, repository metadata, and searched for TweetClaw/Xquik terms on 2026-05-07. No license file despite README MIT note, no contribution templates, zero issues/PRs, and the project is a Chinese MCP/CLI browser-reading helper rather than an OpenClaw plugin catalog. No TweetClaw placement opened; useful future path is license hygiene or maintainer-requested API-backed alternative guidance.
- www222fff/openclaw-social-skills: read README, `comment-x/SKILL.md`, issue list, PR list, repository metadata, and searched for TweetClaw/Xquik terms on 2026-05-07. The X comment skill instructs autonomous posting without confirmation, so no TweetClaw placement was opened; useful future path is a safety-first confirmation or approval-boundary patch if the maintainer accepts guardrail contributions.
- MrsHorrid/openclaw-social-scheduler: read README, root file list, issue list, PR list, repository metadata, and searched for TweetClaw/Xquik terms on 2026-05-07. The repo has no license file despite a README MIT note and has open public security reports for exposed secret-like material; no TweetClaw placement was opened. Future path is maintainer-led secret cleanup or a private-safe safety patch that never repeats the exposed values.
- NanoRisk6/openclaw-twitter-helper: read README, root file list, `.env.example`, issue list, PR list, repository metadata, and searched for TweetClaw/Xquik terms on 2026-05-07. MIT license and placeholder-only env example are present; no contribution templates; no issues or PRs. No TweetClaw placement opened because this is a standalone OAuth CLI, and an alternative-tools section would be promotional without maintainer interest.
- saprative/tweetclaw: read README, SKILL.md, package metadata, root files, `.gitignore`, license, issue list, PR list, template state, and searched for TweetClaw/Xquik terms on 2026-05-08. MIT license is present, no contribution templates, no issues or PRs, and the repo is a same-name standalone Twitter API v2 posting skill with local `.env` credentials. No TweetClaw/Xquik placement opened because a same-name alternative reference would be confusing and promotional without maintainer interest; useful future paths are maintainer-requested credential-boundary docs or package metadata hygiene.
- Polystichumlonchitissumatran261/tweetclaw: re-audited on 2026-05-08 after new activity. The repo is not a fork, has issues disabled, no license, a one-line README, and a ZIP containing `Launcher.cmd`, `lua51.exe`, and `rest.txt`; no TweetClaw/Xquik placement or safety PR path is available.
- seph1709/openclaw-skills: read README, repository metadata, root files, issue list, PR list, and searched for TweetClaw/Xquik terms on 2026-05-08. The repo has no license and is a personal owner-built skill collection, not a catalog with third-party placement rules; no TweetClaw/Xquik PR opened.
- natan89/awesome-openclaw-skills: read README, CONTRIBUTING, repository metadata, root files, PR history, and searched for TweetClaw/Xquik terms on 2026-05-08. Issues are disabled, README points users to a ZIP download, and CONTRIBUTING limits entries to skills already published in the official OpenClaw skills repo; no TweetClaw PR opened.
- rohunvora/x-research-skill: read README, root files, issue list, PR list, repository metadata, and searched for TweetClaw/Xquik terms on 2026-05-08. The repo already has open Xquik backend PR 8, so no duplicate TweetClaw/Xquik PR was opened. Opened issue 9 asking the maintainer to add a license file that matches the README MIT notice because GitHub reports no detected license.

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

2026-05-08 13:36 UTC:

- Local repo clean at `bab1466` before edits; no open TweetClaw repo issues or PRs.
- npm latest remains `@xquik/tweetclaw@1.6.27`; GitHub release `v1.6.27` remains live; ClawHub latest remains `1.6.26`, clean, and `1.6.27` is still blocked by owner-scope validation.
- OpenClaw npm latest and beta remain `2026.5.7`; GitHub default latest remains `v2026.5.7`, with no required TweetClaw manifest or route change.
- Context7 benchmark now reflects source `bab14665a783eb24633e5c51a7cb83d0e4868908` with score `85.4`, 180 snippets, 8 pages, and 0 parse failures. The old finalized versions `v1.6.12` through `v1.6.15` still appear and stale 32-endpoint/media-download snippets remain, so the next useful action is Context7 Versions-tab cleanup or documented owner-side cache removal.
- Xquik public `llms.txt` and billing page still show the current 31-endpoint MPP rule; billing says media downloads require API key or session-cookie authentication because they create gallery links.
- `npm audit --audit-level=moderate --json` reported 0 vulnerabilities. `npm outdated --json` showed only dev/tooling updates; no package metadata was changed because OpenClaw 2026.5.7 has no material TweetClaw API impact.
- External placement action: opened https://github.com/pearl799/twitter-agent/issues/1 suggesting an optional TweetClaw setup path after confirming no duplicate TweetClaw/Xquik references and no open issues/PRs. Used an issue instead of a PR because the repo has no detected license file.
