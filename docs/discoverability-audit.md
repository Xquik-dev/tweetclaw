# Discoverability Audit

Persistent notes for the recurring OpenClaw compatibility poll. Use this file to avoid duplicate external submissions and low-value PRs.

## Submission Rules

- Read the target repository README, contributing guide, code of conduct, license, issue templates, and PR template before proposing any change.
- Search the target repository for `tweetclaw`, `xquik`, and `x-twitter-scraper`.
- Check open and closed PRs before submitting. Do not duplicate an open PR, merged PR, or previously declined submission.
- Only contribute when the target repository is clearly relevant and the entry improves its catalog for users.
- If a thin listing is not a good fit, look for a richer repo-native contribution instead of stopping: improve an existing related entry, update stale safety/install/version metadata, fix broken links, add a useful safety note, contribute to the upstream data source, build a tested runnable starter, or open a concise maintainer-invited issue when a PR is not appropriate.
- For generated catalogs, identify the upstream source and contribution path before marking the repo done.
- For use-case/example repos, prepare real tested artifacts with prompts, smoke test, KPI, sample output, security notes, and rollback before opening a PR.
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

Status: PR open.

Repository: https://github.com/OpenClaw-Korea/awesome-openclaw

Rules observed:

- README links to organization contribution guidelines and asks for relevant OpenClaw resources, working links, and short descriptions.
- README has an empty Skills & Plugins section inviting PRs.
- README has both English and Korean versions, so a high-quality contribution should update both files or follow the maintainer's bilingual pattern.

Findings:

- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- Local README search found no TweetClaw or Xquik entry.

Action:

- Opened PR 1, `Add TweetClaw OpenClaw plugin`, on 2026-05-06: https://github.com/OpenClaw-Korea/awesome-openclaw/pull/1
- The PR adds a bilingual TweetClaw entry to `README.md` and `README.ko.md`, after checking the shared organization contribution guide and confirming no duplicate repo entry, issue, or PR existed.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer asks for changes.

### rylena/awesome-openclaw

Status: PR open.

Repository: https://github.com/rylena/awesome-openclaw

Findings:

- README is a large consolidated guide plus generated skills catalog.
- Local search found no TweetClaw or Xquik entry.
- No matching TweetClaw or Xquik PRs/issues were found in this run.

Action:

- Opened PR 2, `Add TweetClaw social skill`, on 2026-05-06: https://github.com/rylena/awesome-openclaw/pull/2
- The PR adds a focused `Notable Social Skills` subsection rather than editing the generated full skills catalog.
- Future runs should monitor PR 2 and avoid duplicate TweetClaw submissions.

### ZeroLu/awesome-openclaw

Status: PR open.

Repository: https://github.com/ZeroLu/awesome-openclaw

Findings:

- README focuses on tutorials, skills, and use cases rather than plugin discovery.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.

Action:

- Opened PR 3, `Add TweetClaw social media skill`, on 2026-05-06: https://github.com/ZeroLu/awesome-openclaw/pull/3
- The PR adds a Social Media skill category to both English and Simplified Chinese READMEs, matching the repo's bilingual pattern.
- Future runs should monitor PR 3 and avoid duplicate submissions.

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

Status: already listed.

Repository: https://github.com/punkpeye/awesome-mcp-servers

Rules observed:

- CONTRIBUTING asks for one server per line, alphabetical order within category, accurate links, and concise descriptions.
- README has a Social Media category and accepts MCP server entries.

Findings:

- Live clone on 2026-05-06 found `Xquik-dev/x-twitter-scraper` already listed in README under Social Media.
- PR 4464, `Add Xquik x-twitter-scraper MCP server`, merged on 2026-04-12.
- Earlier Xquik MCP PRs 2457, 2958, 3046, and 3341 were closed or superseded.
- TweetClaw is an OpenClaw plugin, not an MCP server, so a separate TweetClaw entry is not appropriate here.

Action:

- Do not add TweetClaw directly.
- Do not open another Xquik MCP PR here unless the existing entry needs a factual metadata update requested by maintainers.

### agent-matrix/catalog

Status: already listed.

Repository: https://github.com/agent-matrix/catalog

Findings:

- GitHub code search found `com.xquik/mcp` already listed at `servers/com-xquik/mcp-com-xquik-mcp-sse-e10bde108a/manifest.json`.
- The same search also found canonical Xquik MCP metadata in `Xquik-dev/x-twitter-scraper/server.json` and the private `Xquik-dev/xquik/server.json`.

Action:

- Do not submit another Xquik MCP entry to this catalog.
- If future metadata changes are needed, update the existing catalog entry in place and follow that repo's contribution rules.

### dvcrn/openclaw-skills-marketplace

Status: already listed in generated marketplace.

Repository: https://github.com/dvcrn/openclaw-skills-marketplace

Rules observed:

- README says the repository is an automatic conversion of an `openclaw-skills` submodule into a Claude Skills marketplace.
- Generated outputs live under `.claude-plugin/`, `plugins/`, and `reports/`, and are rebuilt with `mise run generate`.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- Full clone search on 2026-05-06 found generated entries for `tweetclaw`, `xquik-x-twitter`, and `xquik-x-twitter-scraper` under `reports/generate-marketplace.json` and `plugins/`.
- Open and closed PRs/issues did not show a newer duplicate submission path.
- The repository is generated, so direct PRs should update the upstream corpus or generator output only when maintainers document that flow.

Action:

- Do not open a direct PR here because TweetClaw and Xquik are already present in generated output.
- Revisit only if metadata becomes stale or maintainers document an upstream correction path.

### hesamsheikh/awesome-openclaw-usecases

Status: already listed.

Repository: https://github.com/hesamsheikh/awesome-openclaw-usecases

Rules observed:

- CONTRIBUTING asks for one use case per markdown file, a README category row, concise reproducible detail, actual tested use cases, and no crypto-related use cases.
- License is MIT. Issues were disabled during the 2026-05-06 audit.

Findings:

- README already contains `X/Twitter Automation` in the Social Media section.
- `usecases/x-twitter-automation.md` references TweetClaw, `openclaw plugins install @xquik/tweetclaw`, the GitHub repo, and the npm package.
- PR 72, `Add X/Twitter Automation use case (TweetClaw plugin)`, merged on 2026-03-14.
- PR 63, `Add use case: X/Twitter Data Extraction & Automation`, closed unmerged on 2026-03-14.

Action:

- Do not open another TweetClaw PR here.

### rohitg00/awesome-openclaw

Status: already listed, stale open PR exists.

Repository: https://github.com/rohitg00/awesome-openclaw

Rules observed:

- CONTRIBUTING asks contributors to add resources to README in the existing format, keep descriptions concise, check links, prefer one resource per PR, and run `python3 scripts/validate_static.py` before opening PRs.
- The repository also has a generated website directory, but the README is the main content source.

Findings:

- README already lists TweetClaw with GitHub and npm links.
- `docs/website/directory.html` already contains a TweetClaw card in the Social plugin category.
- PR 89, `Add TweetClaw X/Twitter automation plugin`, is still open from `kriptoburak`, but default branch already contains TweetClaw through later updates.
- PR 84 for `x-twitter-scraper` closed unmerged; PRs 124 and 133 later merged broader resource updates.

Action:

- Do not open another TweetClaw or x-twitter-scraper PR here.
- Future cleanup can close or supersede PR 89 if the publisher wants to reduce stale duplicate PR noise.

### sundial-org/awesome-openclaw-skills

Status: x-twitter-scraper PR already open; TweetClaw not ready for direct submission.

Repository: https://github.com/sundial-org/awesome-openclaw-skills

Rules observed:

- README says the list contains top OpenClaw skills sourced from the ecosystem and organized as a curated skills index.
- No root CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entry on default branch.
- PR 16, `Add x-twitter-scraper to Social Media`, is open from `kriptoburak`, cleanly mergeable, and only touches README.
- The repository includes many copied skill folders and appears closer to a curated/generated top-skills snapshot than a normal plugin directory.

Action:

- Do not open another x-twitter-scraper PR here.
- Do not open a TweetClaw PR unless the maintainer accepts manual additions for currently published ClawHub skills and TweetClaw fits the repo's popularity/curation bar.

### cogine-ai/awesome-openclaw-zh

Status: already listed.

Repository: https://github.com/cogine-ai/awesome-openclaw-zh

Rules observed:

- CONTRIBUTING asks for real used OpenClaw use cases, copyable prompts, clear capability description, usecase template usage, and no obvious high-risk unauthorized scraping.
- License is MIT.

Findings:

- `usecases/social/07-x-twitter-automation-ops.md` already references `@xquik/tweetclaw`, install/config commands, `/xstatus`, `/xtrends`, source repo, README, and upstream use case source.
- `resources/usecases-index.json` records `Xquik-dev/tweetclaw`.
- PR 8, `docs: add 8 source-backed OpenClaw use cases`, merged on 2026-03-25 and included the TweetClaw social use case.

Action:

- Do not open another TweetClaw PR here.

### BlockRunAI/awesome-OpenClaw-Money-Maker

Status: PR open.

Repository: https://github.com/BlockRunAI/awesome-OpenClaw-Money-Maker

Rules observed:

- CONTRIBUTING asks for monetization strategies with clear description, realistic price or income range, difficulty when applicable, tested skills before recommending, reputable sources, and no hype.
- No license file was present, though README shows a CC0 badge.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The list is about making money with OpenClaw. TweetClaw is useful for social media operations, but a plain plugin listing would not meet the repo's strategy, income-range, and tested monetization requirements.

Action:

- Opened PR 12, `Add TweetClaw OpenClaw skill`, on 2026-05-06: https://github.com/BlockRunAI/awesome-OpenClaw-Money-Maker/pull/12
- The PR adds TweetClaw under OpenClaw Skills with a realistic managed social monitoring and content operations monetization range, rather than a generic plugin listing.
- Future runs should monitor PR 12 and avoid duplicate submissions.

### OthmaneBlial/awesome-openclaw-examples

Status: PR open.

Repository: https://github.com/OthmaneBlial/awesome-openclaw-examples

Rules observed:

- CONTRIBUTING requires each example to be reproducible in 2 hours or less, built on public ClawHub skills, safe by default, measurable with a KPI, tested by the contributor, and include setup, prompts, smoke test, sample output, security notes, failure modes, and rollback.
- Rejection criteria include vague workflows, no KPI, no smoke test, no rollback, off-hub skills, and untested submissions.
- License is MIT.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The repo is a good fit for a real TweetClaw starter, but not for a thin listing. A compliant PR needs a runnable starter folder, prompt files, sample output, smoke test, KPI, security notes, and rollback path.

Action:

- Opened PR 1, `Add X/Twitter Ops Desk starter`, on 2026-05-06: https://github.com/OthmaneBlial/awesome-openclaw-examples/pull/1
- The PR adds runnable starter 101 with setup, prompt, scripts, sample output, smoke test, KPI, security notes, failure modes, rollback, catalog updates, and regenerated site data.
- Verification passed with `node scripts/generate_site.mjs --audit-only` after installing the missing local `pandoc` dependency, plus a custom runnable-example count and required-file check.
- Future runs should monitor PR 1 and avoid opening another TweetClaw example unless the maintainer asks for a different scope.

### AIPMAndy/awesome-openclaw-skills-CN

Status: x-twitter-scraper PR already open; no direct TweetClaw submission yet.

Repository: https://github.com/AIPMAndy/awesome-openclaw-skills-CN

Rules observed:

- CONTRIBUTING says entries must point to the official `openclaw/skills` repository, have `SKILL.md`, be concise, be actually useful, avoid duplicates, and exclude crypto, blockchain, DeFi, and finance skills.
- License is Apache-2.0.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entry on default branch.
- PR 4, `添加 x-twitter-scraper 技能`, is open.
- PR 3, `Add x-twitter-scraper`, was closed unmerged.
- Because the repo only accepts links to `github.com/openclaw/skills`, a TweetClaw submission should wait until the corresponding official skill path is confirmed accessible and not just a ClawHub package/npm link.

Action:

- Do not open another x-twitter-scraper PR here.
- Do not open a TweetClaw PR until the official `openclaw/skills` source path for `xquik/tweetclaw` is confirmed and the existing x-twitter-scraper PR outcome is known.

### codeaashu/awesome-openclaw-Skills

Status: TweetClaw PR already open.

Repository: https://github.com/codeaashu/awesome-openclaw-Skills

Rules observed:

- CONTRIBUTING asks for official `openclaw/skills` links, `SKILL.md`, concise descriptions, real community usage, no brand-new skills, and no duplicate skills.
- License is MIT.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entry on default branch.
- PR 2, `Add TweetClaw to Social Media`, is open.

Action:

- Do not open another TweetClaw PR here.
- Monitor PR 2 for maintainer feedback.

### geekjourneyx/awesome-openclaw

Status: PR open.

Repository: https://github.com/geekjourneyx/awesome-openclaw

Rules observed:

- CONTRIBUTING accepts skills, guides, tools, and configs; asks for concise descriptions, working links, existing format, and valid PR checklist.
- CODE_OF_CONDUCT, SECURITY, issue templates, and PR template are present.
- License is MIT.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- README currently focuses on OpenClaw install/config/channels/tools/guides/official resources rather than a third-party skill or plugin directory.

Action:

- Opened PR 2, `Add TweetClaw community skill`, on 2026-05-06: https://github.com/geekjourneyx/awesome-openclaw/pull/2
- The PR adds a small Community Skills section to both English and Simplified Chinese READMEs, using the format described in CONTRIBUTING.
- Future runs should monitor PR 2 and avoid duplicate submissions.

### sean1888/clawmart

Status: PR open.

Repository: https://github.com/sean1888/clawmart

Rules observed:

- README describes a Next.js OpenClaw skill marketplace MVP with planned user auth, skill publishing, payments, and one-click install API.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The app appears to be an unfinished marketplace product, not a curated data repository accepting skill entries.

Action:

- Opened PR 1, `Add TweetClaw featured skill`, on 2026-05-06: https://github.com/sean1888/clawmart/pull/1
- The PR adds TweetClaw as a real featured skill and lets skill cards link to external ClawHub pages.
- Verification passed with `npm run lint`; `npm install` reported existing dependency audit issues unrelated to the PR.
- Future runs should monitor PR 1 and avoid duplicate submissions.

### phoenix-assistant/openclaw-skill-marketplace

Status: PR open.

Repository: https://github.com/phoenix-assistant/openclaw-skill-marketplace

Rules observed:

- README describes a package implementing a skill marketplace registry, CLI, REST API, billing, sandboxing, reviews, and manifest validation.
- No CONTRIBUTING, CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.
- License is MIT.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- Repository source has registry implementation code and tests, but no obvious public seed catalog where third-party skills should be added.

Action:

- Opened PR 1, `Add TweetClaw manifest example`, on 2026-05-06: https://github.com/phoenix-assistant/openclaw-skill-marketplace/pull/1
- The PR adds a real `tweetclaw` skill manifest example and links it from the README manifest section, instead of inventing a seed catalog.
- Verification passed with `npm test` for 42 tests; `npm install` reported existing dependency audit issues unrelated to the PR.
- Future runs should monitor PR 1 and avoid duplicate submissions.

### TheClawFirm/clawfactory

Status: issue open, awaiting submission path.

Repository: https://github.com/TheClawFirm/clawfactory

Rules observed:

- No README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.
- Repository contains a marketplace/backend app with routes, static site files, pipeline docs, and gated downloads.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, or `x-twitter-scraper` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- No documented external skill submission process was found.

Action:

- Opened issue 1, `Clarify OpenClaw skill registry submission path`, on 2026-05-06: https://github.com/TheClawFirm/clawfactory/issues/1
- The issue asks whether the maintainer wants a static registry card PR, form submission, or gate-script run before adding TweetClaw, because the checked-in registry claims vetted entries and no public submission docs were present.
- Do not add a TweetClaw registry card until the maintainer confirms the path or the repo documents its submission process.

### mergisi/awesome-openclaw-agents

Status: richer agent template needed.

Repository: https://github.com/mergisi/awesome-openclaw-agents

Rules observed:

- CONTRIBUTING requires a complete agent folder under `agents/[category]/[agent-name]/` with required `SOUL.md` and `README.md`; optional `AGENTS.md`, `HEARTBEAT.md`, and `WORKING.md`; plus an `agents.json` entry.
- PR template asks for correct category placement, a root README update, and local OpenClaw or similar testing.
- License is MIT.

Findings:

- Local clone search on 2026-05-06 found no `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entry on default branch.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The repo already has adjacent social and X/Twitter agents at `agents/marketing/social-media`, `agents/marketing/multi-account-social`, and `agents/marketing/x-twitter-growth`.
- A thin TweetClaw link would not fit the repository. The useful path is a complete TweetClaw-backed OpenClaw marketing agent template with safety-first operating rules.

Action:

- Do not open a thin listing PR.
- Future run should prepare a full `agents/marketing/x-twitter-ops-desk` style agent template with `SOUL.md`, `README.md`, `AGENTS.md`, `HEARTBEAT.md`, `WORKING.md`, an `agents.json` entry, and a root README table update.
- The template should document TweetClaw install/config, draft-first behavior, explicit write approvals, secrets boundaries, monitoring cadence, rollback, and a smoke test.
- Open a PR only after the template is locally validated against the repo checklist.

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
- The separate legacy skill page at `https://clawhub.ai/xquik/tweetclaw/security/openclaw` reviewed skill version `1.1.8` and reported a `Review` verdict. Its concerns mapped to missing explicit guidance for write-action confirmation, paid and recurring actions, private account data, and credential boundaries.
- `@xquik/tweetclaw@1.6.12` was published to npm on 2026-05-06 after adding explicit `SKILL.md` safety rules for user authorization, write confirmations, paid and recurring workflows, private account reads, content review, anti-spam boundaries, and MPP read-only use. The published tarball was verified with `dist/index.js`, `openclaw.plugin.json`, and `skills/tweetclaw/SKILL.md` present and `src/tools/executor.ts` absent. npm reports integrity `sha512-jqyG5xK7sjaq+LIjXPk2LYaPW14yvLkohNNycUd5411YwCnKUEkE5miJyQw/4TqD3BKi2SwypZcxQr551BghMg==`, shasum `8d265a3f23fcc5dcd75d2e3f4b8cbf56985c1379`, and local sha256 `e0dee0c281fe6b574a4c0a87be95c5e8d79f8f24096c5ee075c9e269060b8c9c`.
- `@xquik/tweetclaw@1.6.12` was published to ClawHub as release `rd778yshrw0mkyhhsc2efh6qk58642d9` on 2026-05-06 using the generated ClawPack tarball, `--family code-plugin`, and source commit `73ed90fd02657d6b3786fdd138e844ba05830419`.
- Post-publish ClawHub inspection reports latest `1.6.12`, `artifact.kind: "npm-pack"`, `artifact.format: "tgz"`, 57 files, sha256 `e0dee0c281fe6b574a4c0a87be95c5e8d79f8f24096c5ee075c9e269060b8c9c`, npm integrity `sha512-jqyG5xK7sjaq+LIjXPk2LYaPW14yvLkohNNycUd5411YwCnKUEkE5miJyQw/4TqD3BKi2SwypZcxQr551BghMg==`, npm shasum `8d265a3f23fcc5dcd75d2e3f4b8cbf56985c1379`, npm tarball `xquik-tweetclaw-1.6.12.tgz`, and OpenClaw compatibility `2026.5.4`.
- ClawHub package rescan request `sd70hgg2acj0zps78m1edrk1vx864vge` was accepted for `1.6.12`; ClawHub inspection later reports `scanStatus: clean`.
- Publishing skill `tweetclaw@1.1.9` failed while logged in as `kriptoburak` because the legacy skill slug is owned by the separate `xquik` ClawHub account. The error was `Slug is already taken. Choose a different slug. Existing skill: /xquik/tweetclaw`.
- The legacy `tweetclaw` skill was restored and unhidden on 2026-05-06 after the publisher decided to keep a TweetClaw skill entry. The owner is `xquik`.
- `tweetclaw@1.1.9` was published under owner `xquik` on 2026-05-06 with the revised safety-first `SKILL.md`, `MIT-0` license metadata, and changelog focused on explicit approvals, credential handling, spending boundaries, private data, and MPP read-only limits. `clawhub inspect tweetclaw --json` reports `moderation.verdict: "clean"`, engine `v2.4.22`, and `legacyReason: "scanner.llm.clean"`.
- Unauthenticated public ClawHub HTML for `https://clawhub.ai/xquik/tweetclaw` and `https://clawhub.ai/xquik/tweetclaw/security/openclaw` may temporarily render stale `1.1.8` scan content even after the registry API reports `1.1.9` clean. Future runs should prefer CLI inspect or authenticated registry state when checking whether the latest skill version is clean.
- Publishing a discovery skill named `xquik` from the same `skills/tweetclaw/SKILL.md` path succeeded on 2026-05-06 as `xquik@1.6.12` under owner `kriptoburak`, then the skill scanner reported `suspicious` because the safety and credential boundaries were too deep in the document for registry review.
- The local `skills/tweetclaw/SKILL.md` metadata and top-level content were updated to make credential boundaries, explicit write approval, paid-action confirmation, recurring monitor controls, private-data handling, and MPP read-only limits visible before workflow examples.
- Publishing the revised discovery skill named `xquik` from the same `skills/tweetclaw/SKILL.md` path succeeded on 2026-05-06 as `xquik@1.6.13` under owner `kriptoburak`; rescan request `sd74jbhxdffn6n18b5f9w6dmsh8651qh` completed clean with engine `v2.4.22`.
- Publishing a separate plugin package named `xquik` from the exact `@xquik/tweetclaw@1.6.12` ClawPack tarball was blocked by ClawHub because `package.json` name must match the published package name. Do not create a renamed package artifact unless the publisher explicitly approves a real alias package identity.
- 2026-05-06 heartbeat check: npm `openclaw` latest remained `2026.5.4`, OpenClaw latest GitHub release remained `v2026.5.4`, and TweetClaw's package `openclaw` metadata already matched the current manifest/package placement guidance. TweetClaw and Xquik MCP v2 API specs both exposed 118 method/path pairs with no method/path drift.

Action:

- Keep future package versions newer than the latest published npm version before publishing more safety or compatibility fixes.
- Monitor future ClawHub package versions for stale scanner pages. If a future scan stays pending or fails, use owner rescan/moderation workflows instead of opening duplicate packages.
- Do not mutate the existing `@xquik/tweetclaw` package listing unless publishing a verified new TweetClaw package version.
- Do not attempt to update the legacy `tweetclaw` skill slug unless logged in as the `xquik` owner account, the skill has been transferred, or ClawHub provides an owner-approved update path.
- Do not publish an `xquik` plugin alias from a renamed temporary artifact unless the publisher explicitly approves a real alias package identity that passes ClawHub package-name checks and does not confuse OpenClaw installs.
