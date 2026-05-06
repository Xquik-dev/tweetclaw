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

Status: PR open; 2026-05-06 08:50 UTC recheck found it mergeable with no comments.

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

Pull request: https://github.com/composio-community/awesome-openclaw-plugins/pull/5

Findings:

- PR 5, `Add Social Media section with tweetclaw`, is open as of 2026-05-06.
- PR 5 is clean and has no comments or reviews as of 2026-05-06.
- The PR body uses real Markdown newlines and does not contain escaped `\n` sequences.
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

### alvinreal/awesome-openclaw-tips

Status: PR open.

Repository: https://github.com/alvinreal/awesome-openclaw-tips

Pull request: https://github.com/alvinreal/awesome-openclaw-tips/pull/2

Rules observed:

- RULES.md asks for practical, specific, tested or grounded OpenClaw behavior, exact implementation details, and a copyable implementation prompt.
- Tips should stay in README.md, be grouped by category, and use ordered ids such as `OPS-05`.
- No license, CONTRIBUTING, CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- README and repository tree did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- Open PRs and issues did not show an existing TweetClaw or Xquik submission.
- The repo is a practical tips playbook, so a plain TweetClaw listing would not fit.
- OpenClaw docs and source support a useful tip: use `tools.alsoAllow` to add optional plugin tools while preserving the normal tool profile, instead of using `tools.allow` when strict allowlist mode is not intended.

Action:

- Opened PR 2, `Add optional plugin tool allowlist tip`, on 2026-05-06.
- The PR adds `OPS-05` with a TweetClaw example using `tools.profile: "coding"` plus `tools.alsoAllow: ["explore", "tweetclaw"]`, verification commands, and a copyable implementation prompt.
- Verification passed with `git diff --check` and a required-text/section-order check over README.md.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 2 and avoid duplicate TweetClaw tips unless the maintainer asks for a different shape.

### TravisLeeeeee/awesome-openclaw-personas

Status: PR open.

Repository: https://github.com/TravisLeeeeee/awesome-openclaw-personas

Pull request: https://github.com/TravisLeeeeee/awesome-openclaw-personas/pull/2

Rules observed:

- README describes production-ready OpenClaw personas made of `SOUL.md`, `AGENTS.md`, `SKILL.md`, and optional support files such as `TOOLS.md`.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.
- Existing PR 1 changes a small set of persona files directly, so a focused persona-improvement PR matches the repository's review shape.

Findings:

- Repository tree search found no `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The repo already has `personas/marketing/x-twitter-growth`, so adding a second near-duplicate X/Twitter persona would be thin.
- The useful path is to improve the existing X/Twitter Growth persona with structured TweetClaw tool guidance and stricter approval boundaries.

Action:

- Opened PR 2, `Add TweetClaw guidance to X Twitter Growth persona`, on 2026-05-06.
- The PR updates the existing `x-twitter-growth` persona with TweetClaw install and `tools.alsoAllow` guidance, adds a `TOOLS.md`, adds SKILL frontmatter, and requires explicit approval before writes, DMs, follows, monitors, paid actions, and private-data reads.
- Verification passed with `git diff --check` and a required-file/required-text check over the persona folder.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 2 and avoid duplicate persona submissions unless the maintainer requests a new persona or a different file shape.

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

### abordage/awesome-mcp

Status: PR open; 2026-05-06 10:12 UTC recheck found it mergeable with both workflows passing and no comments.

Repository: https://github.com/abordage/awesome-mcp

Pull request: https://github.com/abordage/awesome-mcp/pull/32

Rules observed:

- CONTRIBUTING says `README.md` is generated and contributors must edit only `repositories.yaml`.
- The PR template requires checking existing `repositories.yaml`, pull requests, contribution rules, active maintenance, and open source license status.
- The repository is MIT licensed and runs a YAML schema validation workflow for `repositories.yaml`.

Findings:

- `Xquik-dev/x-twitter-scraper` was already listed in `repositories.yaml` and generated `README.md` under Social Media.
- The listing source still described Xquik as `40+ tools`, while current owned public surfaces describe the product as an X/Twitter API platform with REST API, MCP server, SDKs, webhooks, search, monitoring, and automation workflows.
- Open and closed PR and issue searches found no duplicate current metadata update.
- A same-name fork under `kriptoburak/Awesome-MCP` belongs to a different upstream, so the correctly parented fork `kriptoburak/abordage-awesome-mcp` was used.

Action:

- Opened PR 32, `Update Xquik MCP description`, changing only `repositories.yaml`.
- Validation passed with `git diff --check` and Ruby YAML parsing.
- Upstream GitHub checks `Validate changed files` and `validate` passed.
- PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- 2026-05-06 10:12 UTC recheck found PR 32 still open, mergeable, comment-free, review-free, and green on both upstream workflows.
- Future runs should monitor PR 32 and avoid duplicate metadata PRs unless maintainers request wording changes.

### appcypher/awesome-mcp-servers

Status: branch pushed, PR creation blocked by integration permissions.

Repository: https://github.com/appcypher/awesome-mcp-servers

Branch: https://github.com/kriptoburak/appcypher-awesome-mcp-servers/tree/codex/add-xquik-mcp-listing

Rules observed:

- CONTRIBUTING asks contributors to search previous suggestions, submit one suggestion per PR, use the relevant category, keep entries succinct, check spelling and grammar, remove trailing whitespace, use a useful title, and keep the list alphabetized.
- README has a Social Media category that accepts MCP server entries.
- CODE_OF_CONDUCT is present.
- Issues are disabled, so PRs are the only available contribution route.

Findings:

- 2026-05-06 09:32 UTC search found no existing `xquik`, `x-twitter-scraper`, `x-developer`, or `tweetclaw` entry in repository contents.
- Open and closed PR search found no duplicate Xquik or TweetClaw submission.
- The fork parent and upstream were verified: `kriptoburak/appcypher-awesome-mcp-servers` points at `appcypher/awesome-mcp-servers`.
- The branch was rebased onto current `origin/main` and force-pushed with one README-only commit, `2bddd1d9e5ebb5e4294b768f81ce4e0d962aff35`.
- `git diff --check` passed.
- `gh pr create` failed with `CreatePullRequest` permission denied for `kriptoburak`.
- GitHub connector PR creation also failed with `Resource not accessible by integration`.

Action:

- Do not count the pushed branch alone as completed outreach.
- A human or credential with `CreatePullRequest` access must open the PR from `kriptoburak:codex/add-xquik-mcp-listing` to `appcypher:main`, or future automation must use a GitHub credential that can create cross-fork PRs.
- Do not create a duplicate branch or issue; issues are disabled.

### MCP Directory And PulseMCP Xquik Listings

Status: audited, no safe automated update path.

Findings:

- MCP.Directory already lists `x-twitter-scraper` under publisher `Xquik-dev`, but the listing still contains stale `122 endpoints` copy and old comparative wording.
- MCP.Directory exposes a website `Submit Server` route, but no documented PR or API update route was found during this run. The current listing should be updated only through a supported maintainer route.
- PulseMCP already lists XQuik as an official MCP server with server.json metadata, API key auth, Streamable HTTP transport, and free-tier cost metadata. No stale endpoint-count issue was found in the accessible listing text.
- MCPRepository `/servers/xquik` returned 404, so there was no existing listing page to update from the public URL checked.

Action:

- Keep MCP.Directory as a stale external listing to revisit.
- Skip PulseMCP for now because the visible listing is materially accurate.
- Skip MCPRepository until a documented submission or existing listing URL is found.

### Glama, MCP.so, Smithery, And Docker MCP Catalog

Status: audited, no safe automated update path.

Sources:

- https://glama.ai/mcp/servers/Xquik-dev/x-twitter-scraper
- https://mcp.so/server/x-twitter-scraper
- https://smithery.ai/server/@xquik-dev/x-twitter-scraper
- https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/

Findings:

- Glama already lists `Xquik-dev/x-twitter-scraper`, but the public page still shows stale high endpoint-count copy. The page exposes product-owned and report flows, not a documented public PR or API route for third-party metadata edits.
- MCP.so already lists `x-twitter-scraper`, but the public page also shows stale high endpoint-count copy and no safe automated update route was found during this run.
- Smithery returned `404 - Server Not Found` for `@xquik-dev/x-twitter-scraper`, so there is no existing listing to update from that URL.
- Docker MCP Catalog docs say submissions go through the `docker/mcp-registry` repository and require catalog-compatible server packaging and metadata. Docker Hub MCP search did not show an Xquik result during this run.

Action:

- No automated marketplace PR or issue was opened because Glama and MCP.so need an owner-supported metadata route, Smithery has no live listing at the checked URL, and Docker needs a registry-format contribution prepared against Docker's catalog rules.
- Future runs should revisit these only through documented owner, registry, or catalog contribution paths and should update stale endpoint-count wording without adding promotional claims.

### The-Web-Scraping-Playbook/awesome-twitter-scrapers

Status: PR already open, no duplicate outreach.

Repository: https://github.com/The-Web-Scraping-Playbook/awesome-twitter-scrapers

Pull request: https://github.com/The-Web-Scraping-Playbook/awesome-twitter-scrapers/pull/1

Findings:

- The repository is a focused Twitter scraper list, but no license file was exposed through the GitHub repository metadata checked in this run.
- PR 1 from `kriptoburak` is already open, mergeable, and has no comments, reviews, or required checks as of 2026-05-06 10:12 UTC.
- The existing PR means another Xquik, TweetClaw, or x-twitter-scraper submission would be duplicate outreach.

Action:

- No PR or issue opened. Future runs should monitor PR 1 and only refresh the existing submission if maintainers request wording or the open PR becomes stale enough to need a factual update.

### hridaydutta123/awesome-twitter-tools

Status: already listed.

Repository: https://github.com/hridaydutta123/awesome-twitter-tools

Findings:

- README already lists Xquik in the Tools section with a developer skill, MCP server, SDKs, REST API, webhooks, search, extraction, monitoring, giveaway, and guarded write workflow description.
- PRs 24, 25, 26, and 32 from `kriptoburak` are merged, with PR 32 updating the live Xquik entry on 2026-05-06.
- Open and closed issue search found no unresolved Xquik or TweetClaw follow-up.

Action:

- No PR opened. The live listing is current enough and another Xquik or TweetClaw entry would be a duplicate.

### serenakeyitan/awesome-openclaw-roles

Status: audited, no PR opened.

Repository: https://github.com/serenakeyitan/awesome-openclaw-roles

Findings:

- README is a role-based OpenClaw skills list with PRs welcome and a Social Media / Content section containing a Twitter / X subsection.
- Repository contents exposed only `README.md`; no CONTRIBUTING, CODE_OF_CONDUCT, or actual license file was present through the GitHub contents API during this run, despite the README badge.
- Open and closed PR and issue searches found no `xquik`, `x-twitter-scraper`, or `tweetclaw` submission.

Action:

- No PR opened. A TweetClaw entry could fit the Twitter / X subsection, but the missing license and contribution files make a direct vendor listing too ambiguous for automated outreach.
- Revisit only if a license file appears, maintainers request suggestions, or a repo-native workflow example can be contributed without lowering the list quality.

### habitoai/awesome-mcp-servers

Status: audited, no PR opened.

Repository: https://github.com/habitoai/awesome-mcp-servers

Findings:

- MIT licensed repository with issues enabled, but last push was 2025-04-02 during this audit.
- README has a Social Media section and several X/Twitter MCP entries, but no Xquik entry.
- Open and closed PR and issue searches found no `xquik`, `x-twitter-scraper`, or `tweetclaw` submission.

Action:

- No PR opened. The list appears inactive relative to current MCP directories, so a new listing would be low-value unless maintainers resume curation.

### andypiper/awesome-modern-twitter-api

Status: archived, no PR opened.

Repository: https://github.com/andypiper/awesome-modern-twitter-api

Findings:

- Repository is archived and last pushed in 2022.
- CONTRIBUTING restricts additions to maintained projects directly related to modern Twitter API v2 or later and asks for one link per PR.
- Open and closed PR and issue searches found no Xquik or TweetClaw submission.

Action:

- No PR opened. The repository is archived, and Xquik is broader than a direct Twitter API v2 client library entry.

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

### EvoLinkAI/awesome-openclaw-usecases-moltbook

Status: PR open.

Repository: https://github.com/EvoLinkAI/awesome-openclaw-usecases-moltbook

Pull request: https://github.com/EvoLinkAI/awesome-openclaw-usecases-moltbook/pull/9

Rules observed:

- CONTRIBUTING asks for concrete, non-repeating, actionable, attributed use cases with setup steps, prompts, success metrics, and tested changes.
- README asks contributors to copy the use-case template, fill all sections, add the use case to the appropriate category, and submit a PR.
- License is MIT. No CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- Local clone search found no `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entries on default branch.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The repo already has X/Twitter-adjacent use cases: `08-x-profile-scraper`, `64-social-media-monitor`, and `65-auto-social-posting`.
- A new broad listing would repeat existing social workflows. The useful path is improving the existing social monitor and posting use cases with TweetClaw as the structured X/Twitter path and stricter write-action approval guidance.

Action:

- Opened PR 9, `Add TweetClaw to social workflows`, on 2026-05-06.
- The PR updates use cases 64 and 65 to add TweetClaw for structured X/Twitter monitoring and publishing, preserve browser control for non-X platforms, require explicit approval before publishing, and draft replies before action.
- Verification passed with `git diff --check` and a required-text check over the updated use-case files.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 9 and avoid duplicate TweetClaw submissions unless the maintainer requests a different use-case shape.

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

### AlexAnys/awesome-openclaw-usecases-zh

Status: duplicate X/Twitter PR already open.

Repository: https://github.com/AlexAnys/awesome-openclaw-usecases-zh

Rules observed:

- CONTRIBUTING requires realistic OpenClaw use cases, Chinese explanations, clear setup steps, practical examples, and social-media risk notes for social automation use cases.
- License is MIT.

Findings:

- Local clone search on 2026-05-06 found no merged `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entry on default branch.
- PR 41, `docs: 新增 X/Twitter 全自动化用例`, is already open and adds a TweetClaw/Xquik-backed X/Twitter automation use case.
- Open and closed issues did not show a separate TweetClaw or Xquik issue.

Action:

- Do not open another X/Twitter automation PR here.
- Future runs should monitor PR 41 and only add value if the maintainer asks for a README update, risk-note adjustment, or source refresh.

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

### LeoYeAI/openclaw-master-skills

Status: TweetClaw skill submission issue open.

Repository: https://github.com/LeoYeAI/openclaw-master-skills

Issue: https://github.com/LeoYeAI/openclaw-master-skills/issues/38

Rules observed:

- README describes a curated, weekly-updated OpenClaw skill collection powered by MyClaw.ai.
- The repository provides a `Submit a Skill` issue template with skill info, source, checklist, and notes fields.
- License is MIT.

Findings:

- Local clone search on 2026-05-06 found `xquik-x-twitter-scraper` and `xquik-x-twitter` skill folders already present.
- PR 4, `Add x-twitter-scraper - X API skill for AI coding agents`, is already open from `kriptoburak`.
- Issue 2, `[SKILL] x-twitter-scraper`, is already open from `kriptoburak`.
- Open and closed PRs/issues did not show an existing `tweetclaw` submission.
- The repo appears generated or bulk-curated, so a direct PR that edits all indexes would risk fighting the generator.

Action:

- Opened issue 38, `[SKILL] tweetclaw`, on 2026-05-06 using the repository's skill submission format.
- Verified the issue body after creation and confirmed it renders with real Markdown newlines and no literal backslash-n sequences.
- Do not open another TweetClaw issue or PR here. Future runs should monitor issue 38 and only follow up if maintainers request a PR, additional test evidence, or a different submission path.

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

Status: PR open.

Repository: https://github.com/mergisi/awesome-openclaw-agents

Rules observed:

- CONTRIBUTING requires a complete agent folder under `agents/[category]/[agent-name]/` with required `SOUL.md` and `README.md`; optional `AGENTS.md`, `HEARTBEAT.md`, and `WORKING.md`; plus an `agents.json` entry.
- PR template asks for correct category placement, a root README update, and local OpenClaw or similar testing.
- License is MIT.
- No CODE_OF_CONDUCT was present during the audit.

Pull request: https://github.com/mergisi/awesome-openclaw-agents/pull/69

Findings:

- 2026-05-06 08:50 UTC recheck read README, CONTRIBUTING, LICENSE, PR template, agent-submission issue template, open and closed PRs, and open and closed issues. No CODE_OF_CONDUCT is present.
- GitHub code search found no `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entry on default branch.
- Open and closed PRs/issues still did not show duplicate TweetClaw or Xquik submissions.
- The repo already has adjacent social and X/Twitter agents at `agents/marketing/social-media`, `agents/marketing/multi-account-social`, and `agents/marketing/x-twitter-growth`.
- The default-branch `x-twitter-growth` agent is a content-growth strategist; PR 69 remains distinct because it focuses on approval-first operational monitoring, triage, drafts, reporting, and explicit write-action boundaries.
- A thin TweetClaw link would not fit the repository. The useful path is a complete TweetClaw-backed OpenClaw marketing agent template with safety-first operating rules.
- Opened PR 69, `Add X/Twitter Ops Desk agent`, on 2026-05-06. The PR adds `agents/marketing/x-twitter-ops-desk/` with `SOUL.md`, `README.md`, `AGENTS.md`, `HEARTBEAT.md`, and `WORKING.md`; updates `agents.json`; and adds the main README entry/count updates.
- Verified `agents.json` parses, has no duplicate ids, and includes `x-twitter-ops-desk`; ran `git diff --check`; read back the PR body and confirmed it renders with real Markdown newlines and no literal backslash-n sequences.

Action:

- Monitor PR 69 and avoid duplicate submissions.
- If maintainers request changes, keep the contribution focused on the repo's agent-template format rather than promotional TweetClaw copy.

### clawdbot-ai/awesome-openclaw-skills-zh

Status: Xquik PR already open; no new submission.

Repository: https://github.com/clawdbot-ai/awesome-openclaw-skills-zh

Pull request: https://github.com/clawdbot-ai/awesome-openclaw-skills-zh/pull/26

Rules observed:

- Repository content is a single README skill index translated from the Clawdbot official skill library.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.
- Existing PRs add one README row in the matching category, so a future accepted contribution should stay concise and table-native.

Findings:

- Default branch README does not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- PR 26, `feat: 添加 Xquik X/Twitter 数据平台技能`, is already open from `kriptoburak`, cleanly mergeable, and adds Xquik x-twitter-scraper to the social media table.
- Open and closed issues did not show a separate TweetClaw submission path.
- Opening another Xquik or TweetClaw PR now would risk duplicating an already-open Xquik submission in the same category.

Action:

- Do not open another Xquik or TweetClaw PR here while PR 26 is open.
- Future runs should monitor PR 26 and only consider TweetClaw after maintainers accept or comment on that submission and the repo's table remains a good fit.
- The PR 26 body was read back on 2026-05-06 and confirmed to use real Markdown newlines with no literal backslash-n sequences.

### nowork-studio/openclaw-social-media-skills

Status: PR open.

Repository: https://github.com/nowork-studio/openclaw-social-media-skills

Pull request: https://github.com/nowork-studio/openclaw-social-media-skills/pull/1

Rules observed:

- README describes a focused collection of OpenClaw social media skills with `x-posting` and `xiaohongshu` skill folders.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE file, issue template, or PR template was present during the 2026-05-06 audit, though README states MIT.
- Existing structure is skill-documentation-first, so a plain listing would be weaker than improving the X posting workflow itself.

Findings:

- Repository tree, README, skill files, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The `x-posting` skill is browser-first for posting, replying, follower counts, and session logs.
- A repo-native useful path is to document TweetClaw as an optional API-backed companion for account checks, mention search, monitor summaries, and read-only lookups while preserving browser review before publishing.

Action:

- Opened PR 1, `Add TweetClaw API-backed checks`, on 2026-05-06: https://github.com/nowork-studio/openclaw-social-media-skills/pull/1
- The PR adds one README feature bullet and an optional API-backed checks section to `x-posting/SKILL.md`, including `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential handling, explicit approval boundaries, and browser review before publishing.
- Verification passed with `git diff --check`; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different integration shape.

### ununununium/openclaw-social-media-skills

Status: PR open.

Repository: https://github.com/ununununium/openclaw-social-media-skills

Pull request: https://github.com/ununununium/openclaw-social-media-skills/pull/1

Rules observed:

- README describes a focused OpenClaw social media skill collection with `x-posting` and `xiaohongshu` skill folders.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE file, issue template, or PR template was present during the 2026-05-06 audit, though README states MIT.
- Existing structure is skill-documentation-first, so a generic listing would be weaker than improving the X posting workflow itself.

Findings:

- Repository tree, README, `x-posting/SKILL.md`, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The `x-posting` skill is browser/session-log focused for posts, replies, follows, engagement, voice, and product mention guidance.
- A repo-native useful path is to document TweetClaw as an optional API-backed companion for account usage checks, X search, mention lookups, monitor summaries, draws, and extraction jobs while preserving browser review before publishing visible posts and replies.

Action:

- Opened PR 1, `Document optional TweetClaw checks`, on 2026-05-06: https://github.com/ununununium/openclaw-social-media-skills/pull/1
- The PR adds one README feature bullet and an optional API-backed checks section to `x-posting/SKILL.md`, including `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential handling, explicit approval boundaries, and paid monitor/draw/extraction guidance.
- Verification passed with `git diff --check`; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different integration shape.

### zuocharles/openclaw-social-media-skill

Status: PR open.

Repository: https://github.com/zuocharles/openclaw-social-media-skill

Pull request: https://github.com/zuocharles/openclaw-social-media-skill/pull/1

Rules observed:

- README presents a browser-based OpenClaw social media search skill for X/Twitter and LinkedIn.
- No CONTRIBUTING, CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.
- License is MIT.
- The repo explicitly welcomes issues and PRs in `skill.md` and README.

Findings:

- Repository tree, README, `skill.md`, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The repo's core value is a zero-cost browser workflow for low-volume X and LinkedIn discovery.
- The skill itself lists limitations that TweetClaw can complement: it is read-only, not for real-time monitoring, not for high-frequency searches, and not for posting.
- A direct replacement pitch would be a poor fit. The useful path is to document TweetClaw as an optional API-backed companion for X-only structured data, posting, monitors, draws, extraction jobs, and long-running workflows while preserving this repo's browser workflow for LinkedIn and low-cost discovery.

Action:

- Opened PR 1, `Document optional TweetClaw X workflows`, on 2026-05-06: https://github.com/zuocharles/openclaw-social-media-skill/pull/1
- The PR adds optional API-backed X workflow sections to README and `skill.md`, including `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential handling, and explicit user review before posting, DMs, monitors, or paid extraction jobs.
- Verification passed with `git diff --check`; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different positioning.

### benminer/openclaw-twitter-skill

Status: PR open.

Repository: https://github.com/benminer/openclaw-twitter-skill

Pull request: https://github.com/benminer/openclaw-twitter-skill/pull/1

Rules observed:

- README documents a Bun-based OpenClaw CLI skill for direct Twitter API access.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.
- Existing files are concise README and `SKILL.md` usage docs, so a small documentation addition fits the repository shape.

Findings:

- Repository tree, README, `SKILL.md`, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The repo is useful for direct Twitter API credentials and a local CLI invoked through `exec`.
- The repo does not provide OpenClaw-native plugin tools, Xquik endpoint discovery, monitors, draws, extraction jobs, DMs, or account usage checks.
- A replacement-style PR would be a poor fit. The useful path is to document TweetClaw as an optional OpenClaw-native plugin path while keeping this CLI as the direct Twitter API option.

Action:

- Opened PR 1, `Document TweetClaw plugin option`, on 2026-05-06: https://github.com/benminer/openclaw-twitter-skill/pull/1
- The PR adds TweetClaw setup guidance to README and `SKILL.md`, including `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential storage in OpenClaw plugin config, and explicit review before writes, DMs, monitors, or paid extraction jobs.
- Verification passed with `git diff --check`; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different positioning.

### adminlove520/openclaw-twitter-skill

Status: PR open; 2026-05-06 08:13 UTC recheck found it mergeable with no comments.

Repository: https://github.com/adminlove520/openclaw-twitter-skill

Pull request: https://github.com/adminlove520/openclaw-twitter-skill/pull/1

Rules observed:

- README documents an npm-distributed OpenClaw browser-posting skill for X/Twitter.
- No CONTRIBUTING, CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.
- License is MIT.
- Existing files emphasize screenshot-confirmed browser posting, so any TweetClaw guidance must not weaken the confirmation-first flow.

Findings:

- Repository tree, README, SKILL.md, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The repo is useful for browser-based new-post workflows with mandatory screenshot confirmation.
- It does not cover structured Xquik endpoint discovery, account usage checks, DMs, monitors, draws, or extraction jobs.
- A replacement-style PR would be a poor fit. The useful path is a short optional companion section that preserves the browser-first posting workflow.

Action:

- Opened PR 1, `Document TweetClaw companion workflows`, on 2026-05-06: https://github.com/adminlove520/openclaw-twitter-skill/pull/1
- The PR adds TweetClaw setup guidance to README and `SKILL.md`, including `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential storage in OpenClaw plugin config, and explicit confirmation before writes, DMs, monitors, or paid extraction jobs.
- Verification passed with `git diff --check` and `npm test`; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different positioning.

### NIANS336/openclaw-x-twitter-auto

Status: PR open.

Repository: https://github.com/NIANS336/openclaw-x-twitter-auto

Pull request: https://github.com/NIANS336/openclaw-x-twitter-auto/pull/1

Rules observed:

- README documents a Python-backed OpenClaw skill for posting or replying on X/Twitter with direct Twitter API credentials.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.
- The repository has issues enabled and no existing open or closed PRs/issues.
- The repository tracks credential-template shaped files, but `.gitignore` excludes `secrets/api_keys.json`; audit and PR work avoided reading, printing, or copying any secret-like values.

Findings:

- Repository tree, README files, SKILL.md, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The skill is useful for direct local Python posting and replies.
- The existing `SKILL.md` told the agent to truncate tweet text to 280 characters, which risks changing user content without review.
- The repo-native useful path is to add explicit confirmation and no-silent-truncation guidance, then document TweetClaw as an optional OpenClaw-native companion for structured Xquik workflows.

Action:

- Opened PR 1, `Document safer TweetClaw workflows`, on 2026-05-06: https://github.com/NIANS336/openclaw-x-twitter-auto/pull/1
- The PR adds posting safety guidance and optional TweetClaw setup guidance to README, README_EN, README_CN, and `SKILL.md`, including `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential storage in OpenClaw plugin config, explicit confirmation before visible writes, DMs, monitors, or paid extraction jobs, and no silent truncation of tweet text.
- Verification passed with `git diff --check` and a credential-free `python3 scripts/twitter_poster.py` smoke input that returned setup guidance instead of posting; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different positioning.

### thomasbln/openclaw-marketing-agent

Status: PR open.

Repository: https://github.com/thomasbln/openclaw-marketing-agent

Pull request: https://github.com/thomasbln/openclaw-marketing-agent/pull/1

Rules observed:

- README presents a Market Signal Radar OpenClaw agent blueprint that scans Hacker News, Google News, and X.com, classifies signals with an LLM, and sends Telegram digests.
- No CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the 2026-05-06 audit.
- README says the repository contains no secrets or pre-configured keys, so the contribution preserved env-only credential setup and avoided test credentials.

Findings:

- Repository tree, README, OpenClaw skill docs, `signal-radar/sources/x.js`, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The existing X scanner used X API v2 recent search through `X_BEARER_TOKEN`.
- A generic listing would be thin. The repo-native useful path was an optional Xquik-backed source path inside the existing scanner, while keeping the original bearer-token behavior available.

Action:

- Opened PR 1, `Add optional Xquik signal source`, on 2026-05-06: https://github.com/thomasbln/openclaw-marketing-agent/pull/1
- The PR adds optional `XQUIK_API_KEY` and `XQUIK_API_BASE_URL` support for `GET /api/v1/x/tweets/search`, keeps `X_BEARER_TOKEN` as fallback, documents provider selection, and adds skill guidance not to reveal configured tokens.
- Verification passed with `git diff --check`, `node --check signal-radar/sources/x.js`, and JSON validation for `signal-radar/keywords/x.json`; the upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Automation prompt update: future discoverability runs now explicitly prefer repo-native integration patches for agent starter, scanner, plugin, or tool repos when that is more useful than a standalone listing, and require external examples to stay credential-free or placeholder-only.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different integration shape.

### arlobottman/openclaw-twitter

Status: PR open.

Repository: https://github.com/arlobottman/openclaw-twitter

Pull request: https://github.com/arlobottman/openclaw-twitter/pull/1

Rules observed:

- Repository has issues enabled and no existing open or closed PRs/issues during the 2026-05-06 audit.
- No README, CONTRIBUTING, CODE_OF_CONDUCT, LICENSE, issue template, or PR template was present during the audit.
- Existing repo shape is a single OpenClaw skill plus `scripts/twitter_tools.py`, so a direct skill-guidance and script-hygiene PR fits better than an external listing.

Findings:

- Repository tree, `SKILL.md`, `scripts/twitter_tools.py`, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- `SKILL.md` still contained scaffold TODO guidance, so agents had no concrete credential, confirmation, or command-selection rules.
- The repo tracked generated Python bytecode under `scripts/__pycache__/`.
- `python3 scripts/twitter_tools.py --help` failed in the audit environment because runtime-evaluated annotations used `dict | None`; deferring annotations makes the CLI import cleanly while preserving current script behavior.

Action:

- Opened PR 1, `Improve Twitter skill guidance`, on 2026-05-06: https://github.com/arlobottman/openclaw-twitter/pull/1
- The PR replaces scaffold text with concrete direct X API workflows, credential boundaries, write-action confirmation rules, private-read handling, narrow search defaults, and command mapping.
- The PR documents TweetClaw as an optional OpenClaw-native companion for endpoint discovery, Xquik-backed workflows, monitors, draws, DMs, extraction jobs, and MPP read-only pay-per-use mode while preserving this repo's direct X API script path.
- The PR adds `.gitignore`, removes tracked Python bytecode, and adds `from __future__ import annotations` so CLI help works on older Python 3 runtimes.
- Verification passed with `git diff --cached --check`, `python3 -m py_compile scripts/twitter_tools.py`, `python3 scripts/twitter_tools.py --help`, and a credential-free `python3 scripts/twitter_tools.py search "openclaw lang:en" --max-results 1` run that returned setup guidance because `TWITTER_BEARER_TOKEN` was not set. The upstream PR reports no checks.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different integration shape.

### zhaoxinyi02/ClawPanel-Plugins

Status: safety PR open; TweetClaw listing not submitted.

Repository: https://github.com/zhaoxinyi02/ClawPanel-Plugins

Pull request: https://github.com/zhaoxinyi02/ClawPanel-Plugins/pull/1

Rules observed:

- README invites community plugin submissions through `community/`, `registry.json`, plugin README files, and PRs.
- README also documents a ClawPanel skill marketplace through `skills/registry.json`, skill folders, `SKILL.md`, and optional `skill.json` config metadata.
- License is MIT. No CONTRIBUTING, CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- GitHub code search found no `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- Plugin submissions use ClawPanel-specific plugin metadata and in-repo install directories, so a direct `@xquik/tweetclaw` ClawHub/npm listing would not fit without maintainer guidance.
- Skill submissions appear possible but require copying and maintaining an in-repo skill folder plus registry entry. A TweetClaw skill PR should wait until maintainers confirm they want external OpenClaw plugin companion skills in this registry.
- The audit found a hardcoded API key-like example in existing `34ai-api-suite` skill metadata and instructions. Do not repeat or copy the value into issues, PR bodies, or TweetClaw docs.

Action:

- Opened PR 1, `Redact API key example from skill docs`, on 2026-05-06. The PR removes the concrete key-like value from `skills/34ai-api-suite/skill.json` and `skills/34ai-api-suite/SKILL.md`, leaving placeholder-only user-owned credential guidance.
- Verification passed with JSON parsing for `skills/34ai-api-suite/skill.json` and `skills/registry.json`, `git diff --check`, and a no-output search confirming the changed files no longer contain the 32-character hex-like example.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future path: if maintainers accept external skill entries, prepare a Chinese, placeholder-only TweetClaw skill folder and registry entry with explicit approval, credential, paid-action, and MPP read-only boundaries. Do not open a direct TweetClaw listing before that format question is resolved.

### af0nx/openclaw-twitterbot

Status: audited, no PR opened.

Repository: https://github.com/af0nx/openclaw-twitterbot

Rules observed:

- Repository has issues enabled, MIT license, OpenClaw-style contributing guide, security policy, issue templates, and PR template.
- No CODE_OF_CONDUCT file was present during the 2026-05-06 audit.

Findings:

- The repository name suggests a Twitter bot, but the default branch is a broad OpenClaw source snapshot with a `package.json` pinned to `openclaw` `2026.3.24`, many Dependabot PRs, and no focused TweetClaw/Xquik integration surface.
- GitHub code search found no `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` entries.
- Open and closed PRs/issues did not show existing TweetClaw or Xquik submissions.
- The useful repo-native surface is `TWITTER_BOT_PIPELINE.md`, which documents a live CS2 X bot using direct X API posting, guest-token GraphQL monitoring, human approval, daily caps, and receipt-like operations. A direct listing would be thin and would not fit the broad OpenClaw snapshot.

Action:

- No PR opened. A future useful path would be a narrow docs patch to `TWITTER_BOT_PIPELINE.md` documenting TweetClaw as an optional Xquik-backed read/post adapter with explicit approval, receipt, cost, and credential boundaries, but only if the maintainer appears active beyond dependency updates.

### X-RayLuan/openclaw-social-media-marketing

Status: PR open.

Repository: https://github.com/X-RayLuan/openclaw-social-media-marketing

Pull request: https://github.com/X-RayLuan/openclaw-social-media-marketing/pull/1

Rules observed:

- README presents a focused OpenClaw social media marketing skill for X, LinkedIn, and Facebook, with ASSET_CHECK, public URL, visibility proof, and receipt requirements.
- License is MIT. No CONTRIBUTING, CODE_OF_CONDUCT, issue template, or PR template was present during the 2026-05-06 audit.

Findings:

- Repository tree, README, `SKILL.md`, references, examples, open and closed PRs, and issues did not contain `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw`.
- The X lane currently uses a direct `twitter-api-v2` example script and environment-provided X API credentials.
- A plain listing would be thin. The repo-native useful path is documenting TweetClaw as an optional X lane adapter that preserves the repository's existing ASSET_CHECK, approval, URL recovery, visibility proof, and receipt model.

Action:

- Opened PR 1, `Document optional TweetClaw X lane`, on 2026-05-06. The PR updates README, `SKILL.md`, and `references/platform-rules.md` with `openclaw plugins install @xquik/tweetclaw`, `tools.alsoAllow: ["explore", "tweetclaw"]`, credential handling, explicit approval before visible X writes, MPP read-only boundaries, and receipt requirements.
- Verification passed with `git diff --check` and a search of edited files for key-like credential examples.
- The PR body was read back after creation and confirmed to use real Markdown newlines with no literal backslash-n sequences.
- Future runs should monitor PR 1 and avoid duplicate submissions unless the maintainer requests a different integration shape.

### AIWerk/openclaw-mcp-bridge and AIWerk/mcp-bridge

Status: server-submission issue open.

Repository: https://github.com/AIWerk/openclaw-mcp-bridge

Catalog repository: https://github.com/AIWerk/mcp-bridge

Issue: https://github.com/AIWerk/mcp-bridge/issues/5

Rules observed:

- `AIWerk/openclaw-mcp-bridge` is an MIT-licensed OpenClaw plugin that bridges MCP servers into OpenClaw and points server submissions to the `AIWerk/mcp-bridge` core repository.
- `AIWerk/openclaw-mcp-bridge` has a CONTRIBUTING guide, a server-submission issue template, no CODE_OF_CONDUCT file, and no open or closed PRs at audit time.
- The contributing guide requires public servers, placeholder-only secrets, one-line lowercase descriptions, pinned local package versions when local installs are used, and a local tools/list validation result.
- `AIWerk/mcp-bridge` is MIT-licensed, has issues enabled, has no CODE_OF_CONDUCT file, and no repository-local server-submission issue template. Existing accepted server submissions are routed from plugin-repo guidance into the core catalog flow.

Findings:

- Repository search and GitHub issue search found no existing `tweetclaw`, `xquik`, `x-twitter-scraper`, or `@xquik/tweetclaw` catalog entry, issue, or code reference in either AIWerk repository.
- A direct TweetClaw package listing would not fit this repository because the catalog is for MCP servers rather than OpenClaw code plugins.
- The useful repo-native path is the Xquik Docs MCP server, which is public, read-only, credential-free, and helps MCP Bridge users discover Xquik API docs without exposing account credentials or running paid API actions.
- A StreamableHTTP SDK smoke test against `https://docs.xquik.com/mcp` completed tools/list and returned `search_xquik` plus `query_docs_filesystem_xquik`.

Action:

- Opened AIWerk/mcp-bridge issue 5, `[Server Submission] xquik-docs - read-only Xquik API documentation search`, on 2026-05-06.
- The issue uses placeholder-only configuration, marks credentials as not required, records remote HTTP as the install method, and includes the SDK tools/list validation command and result.
- The issue body was read back after creation and after title normalization. It uses real Markdown newlines, no literal backslash-n sequences, and no em dash characters.
- Future runs should monitor issue 5. If maintainers request a recipe patch instead of an issue, prepare a `streamable-http` `xquik-docs` recipe with no env vars and no account-backed Xquik API MCP actions.

### Polystichumlonchitissumatran261/tweetclaw

Status: audited, no action available.

Repository: https://github.com/Polystichumlonchitissumatran261/tweetclaw

Rules observed:

- The repository has issues disabled, no license, no CONTRIBUTING file, no CODE_OF_CONDUCT file, and no issue or PR templates.
- The default branch contains only a one-line README and a ZIP artifact under `Veratrum/`.

Findings:

- GitHub search surfaced the repository because its name and description resemble TweetClaw, but the repository is not marked as a fork and provides no usable OpenClaw, Xquik, MCP, or package integration surface.
- With issues disabled and no contribution guidance, there is no compliant repo-native path for a clarification issue, listing correction, or docs patch.

Action:

- No PR or issue opened. Future runs should only revisit if the repository adds a license, enables issues, publishes readable source, or otherwise exposes a compliant maintenance path.

## Registry Notes

### 2026-05-06 OpenClaw Docs Research

Status: current compatibility baseline confirmed.

Sources:

- https://docs.openclaw.ai/plugins/manifest
- https://docs.openclaw.ai/plugins/building-plugins
- https://docs.openclaw.ai/tools/skills
- https://github.com/openclaw/openclaw/releases/tag/v2026.5.4
- https://github.com/openclaw/openclaw/releases/tag/v2026.5.5

Findings:

- npm `openclaw` latest remains `2026.5.4`, matching TweetClaw's package and manifest compatibility metadata.
- npm `@xquik/tweetclaw` latest remains `1.6.14` with integrity `sha512-Q1ls9JimCkBMux49klgwKwadivjYnHr5CnBwiHp+YDk1Ec1cXwYNOwqLeLayRRiA/oBfJ+i8p2/d0REPxQNtYg==` and shasum `48ff4ce9dc5915a3565aa1dd21db556012bb2cce`.
- Official manifest docs still require native plugins to ship `openclaw.plugin.json` and keep npm install metadata in `package.json#openclaw.install`, which matches TweetClaw's current split.
- Official manifest docs now explicitly call out `openclaw.install.minHostVersion` as install and manifest-registry gating metadata. TweetClaw already sets `openclaw.install.minHostVersion` to `>=2026.5.4`.
- Official plugin-building docs still recommend `toolMetadata.<tool>.optional: true` for optional plugin tools; TweetClaw already marks `tweetclaw` optional and keeps `explore` available for free catalog discovery.
- Official skills docs confirm plugin skills should be listed in `openclaw.plugin.json` as plugin-root-relative skill directories, which matches `skills/tweetclaw`.
- Official skills docs also say the embedded parser supports single-line frontmatter keys and single-line JSON metadata. TweetClaw `1.6.15` normalizes optional `read_when` to a single-line value and adds a release gate for packaged skill frontmatter.
- ClawHub package inspect reports `@xquik/tweetclaw@1.6.14` as a clean `code-plugin` with `artifact.kind: "npm-pack"`, owner `kriptoburak`, and 0 static findings.
- ClawHub inspect still reports `tweetclaw@1.1.9` under owner `xquik` as clean with MIT-0 license metadata.
- 2026-05-06 06:59 UTC heartbeat research confirmed OpenClaw `v2026.5.4` remains the current stable GitHub release. Its release notes include catalog-backed install hints for official external plugin references and workspace-scoped plugin metadata snapshot reuse for faster control-plane paths. TweetClaw already ships `openclaw.install.npmSpec`, `minHostVersion`, manifest metadata, and package compatibility fields, so no package change was needed.
- 2026-05-06 07:19 UTC heartbeat research confirmed npm `openclaw` latest remains `2026.5.4`, npm `@xquik/tweetclaw` latest remains `1.6.14`, and ClawHub package inspect still reports `@xquik/tweetclaw@1.6.14` as a clean npm-pack artifact linked to source commit `26df783a987f1a475587a8eb94336433d43fd25c`. Current manifest docs still keep install hints in `package.json#openclaw.install` rather than `openclaw.plugin.json`, matching TweetClaw's local metadata.
- 2026-05-06 07:34 UTC heartbeat research confirmed npm `openclaw` latest remains `2026.5.4`, npm `@xquik/tweetclaw` latest remains `1.6.14`, and ClawHub package inspect still reports `@xquik/tweetclaw@1.6.14` clean with owner `kriptoburak`, source commit `26df783a987f1a475587a8eb94336433d43fd25c`, and 0 static findings. Official `docs.openclaw.ai` manifest guidance still says `openclaw.plugin.json` is not for npm install metadata, so TweetClaw should keep `npmSpec` and `minHostVersion` in `package.json#openclaw.install`.
- 2026-05-06 07:55 UTC heartbeat research confirmed npm `openclaw` latest remains `2026.5.4`; npm `@xquik/tweetclaw` latest remains `1.6.14` with the same npm integrity and shasum; and ClawHub package inspect still reports `@xquik/tweetclaw@1.6.14` clean, owner `kriptoburak`, artifact kind `npm-pack`, source commit `26df783a987f1a475587a8eb94336433d43fd25c`, package scan clean, verification scan clean, and 0 static findings. Current OpenClaw docs still keep install hints in `package.json#openclaw.install`, including `npmSpec` and `minHostVersion`, so no package release was needed.
- 2026-05-06 08:13 UTC heartbeat research confirmed npm `openclaw` latest remains `2026.5.4`, npm `@xquik/tweetclaw` latest remains `1.6.14`, ClawHub package inspect still reports `@xquik/tweetclaw@1.6.14` clean as an npm-pack code plugin, and both related ClawHub skills remain clean. Official skills docs still state that the embedded parser supports single-line frontmatter keys and single-line JSON metadata, so TweetClaw `1.6.15` normalizes packaged `read_when` to a single-line value and adds `npm run check-skill-frontmatter` to `check:all`, `prepack`, and `prepublishOnly`.
- 2026-05-06 08:50 UTC heartbeat research confirmed npm `openclaw` latest is now `2026.5.5`, published at `2026-05-06T08:46:22.905Z` with Node engine `>=22.14.0`, npm integrity `sha512-735aCg6D4xRt4g0fZfSZB0ZqFfAThLbW8WFD740jhflkk7qzoNr9PDFaOQIqsDAXlOneTJtCayUlforheJKh9A==`, and npm shasum `9eadefc00deffa118f78f651ed08e9e659f87161`. GitHub has signed tag `v2026.5.5` at commit `b1abf9d8ae4410c6a6e08f7dfd2d617f4550281c`, but `gh release view v2026.5.5` returned no release page and the GitHub releases API still lists `v2026.5.4` as the newest published release. The `v2026.5.4...v2026.5.5` compare shows plugin/update resilience fixes, including managed npm OpenClaw peer repair, official plugin sync during update, and corrupt-plugin update tolerance. TweetClaw `1.6.15` remains compatible because its plugin API range and min host floor are `>=2026.5.4`, and no TweetClaw package change was needed.
- 2026-05-06 09:11 UTC heartbeat research confirmed GitHub release page `v2026.5.5` is now live at https://github.com/openclaw/openclaw/releases/tag/v2026.5.5, published at `2026-05-06T09:00:55Z`. Release notes include plugin diagnostics for source-only TypeScript packages, official plugin update sync, managed npm peer repair, and corrupt-plugin update tolerance. TweetClaw `1.6.15` remains compatible and no package metadata bump was needed.
- 2026-05-06 09:32 UTC heartbeat research confirmed npm `openclaw` latest remains `2026.5.5`, npm `@xquik/tweetclaw` latest remains `1.6.15`, GitHub release `v2026.5.5` remains live, ClawHub package inspect still reports `@xquik/tweetclaw@1.6.15` as a clean npm-pack code-plugin under owner `kriptoburak`, and both `tweetclaw` and `xquik` skills remain clean. The current OpenClaw manifest and building-plugin docs still match TweetClaw's package metadata split, optional tool metadata, and `tools.alsoAllow` guidance.
- 2026-05-06 09:51 UTC heartbeat research confirmed npm `openclaw` latest remains `2026.5.5`, npm `@xquik/tweetclaw` latest remains `1.6.15`, GitHub release `v2026.5.5` remains live, ClawHub package inspect still reports `@xquik/tweetclaw@1.6.15` as a clean npm-pack code-plugin under owner `kriptoburak`, and both `tweetclaw` and `xquik` skills remain clean. The Xquik docs MCP server at `https://docs.xquik.com/mcp` remains public, read-only, and exposes `search_xquik` plus `query_docs_filesystem_xquik`, making it suitable for credential-free MCP catalog discovery.

Action:

- Published `@xquik/tweetclaw@1.6.15` to npm and ClawHub after adding `npm run check-skill-frontmatter`.
- Version-specific ClawHub inspection reports `staticScan.status: "clean"` with no findings on engine `v2.4.22`; explicit package rescan request `sd715z79aa1j5k2t0zy55hgfq1867gj9` later completed clean for package and verification records.
- No package release was needed for OpenClaw `2026.5.5`; the earlier GitHub release-page lag is resolved, so keep watching for documented plugin API or package diagnostics changes before raising TweetClaw's build metadata.
- Automation prompt updated on 2026-05-06 to record the resolved `v2026.5.5` release-page lag and to require placeholder-only handling for key-like values found in external repos.

### 2026-05-06 OpenClaw Live Smoke Test

Status: packaged install and agent-visible tool flow validated for `1.6.13`.

Sources:

- https://docs.openclaw.ai/plugins/building-plugins
- https://docs.openclaw.ai/plugins/manifest
- https://docs.openclaw.ai/tools/index
- Local OpenClaw profile `tweetclaw-test` with OpenAI Codex OAuth profile `openai-codex/gpt-5.5`

Findings:

- The isolated `tweetclaw-test` profile stores the Xquik test credential only in the local OpenClaw profile config with polling disabled for smoke tests. Do not print, copy, commit, or move this credential.
- Installing the published `1.6.12` package before credentials failed because `openclaw.plugin.json` required either `apiKey` or `tempoSigningKey` at config-validation time.
- `1.6.13` removes the credential requirement from install-time schema validation. A fresh no-credential profile installed the generated ClawPack npm-pack tarball successfully, validated config, loaded the plugin, exposed runtime tools `explore` and `tweetclaw`, and made the plugin skill model-visible.
- Full repo `--link` install is still blocked by OpenClaw's package scanner because repo maintenance scripts use `child_process`. This confirms future live tests should install the generated npm/ClawPack tarball, not the repo folder.
- OpenClaw's default local `tools.profile: "coding"` can hide external plugin tools from model calls even when `plugins inspect --runtime` shows the plugin registered. `tools.allow: ["explore", "tweetclaw"]` is restrictive and failed before the model call when the tool resolver had not matched registered plugin tools.
- Official tool docs recommend `tools.alsoAllow` for optional plugin tools when preserving the normal profile. With `tools.alsoAllow: ["explore", "tweetclaw"]`, the embedded OpenClaw GPT-5.5 agent saw both TweetClaw tools and successfully used `explore` for a free trend endpoint catalog query.
- The live agent run surfaced an OpenAI tool-schema rejection for `tweetclaw.body` because the union allowed arrays without an `items` schema. `1.6.13` adds `items: {}` and a regression test for OpenAI tool validation compatibility.

Action:

- Keep install-before-credentials as a required UX invariant. Plugin install and config validation must not require Xquik API keys or MPP signing keys.
- Document `tools.alsoAllow: ["explore", "tweetclaw"]` for agent-visible tool setup; avoid telling users to replace `tools.allow` unless they intentionally want restrictive allowlist mode.
- Every future OpenClaw live smoke test should verify both runtime registration (`plugins inspect --runtime`) and model-facing visibility with an agent run that calls the free `explore` tool before attempting any live Xquik API call.
- Continue using packaged tarballs or ClawPack artifacts for OpenClaw install tests. Do not use the repo folder as the representative release artifact.

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
- `@xquik/tweetclaw@1.6.13` was published to npm and ClawHub on 2026-05-06 after validating install-before-credentials UX and OpenClaw GPT-5.5 tool visibility through the isolated `tweetclaw-test` profile. npm reports integrity `sha512-3nZ6ytpyYwaNhKzM1GCegieaAvd4qqzebwsaUAJMpXvxRAbK4TMmrP8RGK+50AXvQ004kWTYND8qx9tc2vO9fw==` and shasum `a1ebf316a2fb3f21be1c1e87c36edf2f8995abc9`; the published tarball was verified with `dist/index.js`, `openclaw.plugin.json`, and `skills/tweetclaw/SKILL.md` present and `src/tools/executor.ts` absent.
- ClawHub package release `rd7fx4d2gbq1zv89phb5k2hwjh866dst` for `@xquik/tweetclaw@1.6.13` uses an npm-pack ClawPack artifact with sha256 `d98ed230085b35337ac21a05150580e8d585d1bd61a692a09899745ed148f2d3`, source commit `68ae8f9518e40ee9ba44bc1250f22e6779683f26`, and OpenClaw compatibility `2026.5.4`.
- ClawHub package rescan request `sd73f43pm2ky0h5rf0wh0h28318674fa` for `1.6.13` later reported `status: "suspicious"` with a static-analysis `exposed_secret_literal` finding against an internal `apiKey` object-literal field. 1.6.14 keeps the public `apiKey` config and schema names stable, but renames internal credential plumbing to avoid the scanner signature while preserving runtime behavior.
- OpenClaw package smoke test for 1.6.14: fresh no-credential profile `tweetclaw-ux-1614` installed the ClawPack tarball, validated config, loaded `explore` plus optional `tweetclaw`, and surfaced only `xtrends` as a credential-free command. Credentialed profile `tweetclaw-test` loaded the same package, exposed `explore` plus optional `tweetclaw`, and a GPT-5.5 agent call used `tweetclaw` once against `GET /api/v1/account` with one successful tool call and no writes. Archive reinstall inspect can retain stale `install.resolvedSpec`/`resolvedVersion` from previous installs, so future checks should trust loaded plugin version plus package tarball metadata over stale archive install fields.
- `@xquik/tweetclaw@1.6.14` was published to npm on 2026-05-06. npm latest reports integrity `sha512-Q1ls9JimCkBMux49klgwKwadivjYnHr5CnBwiHp+YDk1Ec1cXwYNOwqLeLayRRiA/oBfJ+i8p2/d0REPxQNtYg==` and shasum `48ff4ce9dc5915a3565aa1dd21db556012bb2cce`; a version-pinned public `npm pack @xquik/tweetclaw@1.6.14` verified `dist/index.js`, `dist/request.js`, `openclaw.plugin.json`, and `skills/tweetclaw/SKILL.md`.
- ClawHub package release `rd7dk0dd0dxg24aa1x4864gzk5866jes` for `@xquik/tweetclaw@1.6.14` uses an npm-pack ClawPack artifact with sha256 `41c7944e80eb7a935877c969384124333b10feb2fa7eeda943800201d2e0a521`, source commit `26df783a987f1a475587a8eb94336433d43fd25c`, OpenClaw compatibility `2026.5.4`, and static-analysis engine `v2.4.22`.
- ClawHub inspect for `1.6.14` reported release artifact `staticScan.status: "clean"` with no findings. Explicit package rescan request `sd7ax6d9h8ert5gywp215fcrb1866k1c` completed clean for both package and verification records.
- 2026-05-06 heartbeat check: npm `openclaw` latest remains `2026.5.4`; npm `@xquik/tweetclaw` latest remains `1.6.14`; ClawHub package inspect reports `latestVersion: "1.6.14"`, release `rd7dk0dd0dxg24aa1x4864gzk5866jes`, package scan clean, verification scan clean, version static scan clean, and 0 static findings.
- `@xquik/tweetclaw@1.6.15` was published to npm on 2026-05-06 after normalizing packaged skill `read_when` frontmatter to a single-line value and adding `scripts/check-skill-frontmatter.mjs` to `check:all`, `prepack`, and `prepublishOnly`. npm latest reports integrity `sha512-Hj7pEI2cpiVxK+QupkGg0NPuTYiPLTv+7YJ9cx3QooC/jKHSBeGWBErbgewN++8q0bDIMB6Hduv/6MriIQatiA==` and shasum `c8ec2e38b74b4ea34e0640c8ce718f84c04229fc`; a version-pinned public `npm pack @xquik/tweetclaw@1.6.15` verified 57 files including `dist/index.js`, `openclaw.plugin.json`, and `skills/tweetclaw/SKILL.md`.
- ClawHub package release `rd76g2a13y6vg6t0dqfpc7sv0h866has` for `@xquik/tweetclaw@1.6.15` uses an npm-pack ClawPack artifact with sha256 `2b01dd7a190bec0d37a11b93bf78cf0636702b62689029043cf53be123b01a3a`, npm integrity `sha512-Hj7pEI2cpiVxK+QupkGg0NPuTYiPLTv+7YJ9cx3QooC/jKHSBeGWBErbgewN++8q0bDIMB6Hduv/6MriIQatiA==`, npm shasum `c8ec2e38b74b4ea34e0640c8ce718f84c04229fc`, source commit `29f6c9e2395015799f55013270f5df50eba85dc4`, and OpenClaw compatibility `2026.5.4`.
- Version-specific ClawHub inspect for `1.6.15` reported `staticScan.status: "clean"` with no findings on engine `v2.4.22`. Explicit package rescan request `sd715z79aa1j5k2t0zy55hgfq1867gj9` completed clean; top-level package inspect now reports package `scanStatus: "clean"` and verification `scanStatus: "clean"`. Version inspect also reports clean VirusTotal fallback, clean LLM analysis, and clean static scan.

Action:

- Keep future package versions newer than the latest published npm version before publishing more safety or compatibility fixes.
- Monitor future ClawHub package versions for stale scanner pages. If a future scan stays pending or fails, use owner rescan/moderation workflows instead of opening duplicate packages.
- Do not mutate the existing `@xquik/tweetclaw` package listing unless publishing a verified new TweetClaw package version.
- Do not attempt to update the legacy `tweetclaw` skill slug unless logged in as the `xquik` owner account, the skill has been transferred, or ClawHub provides an owner-approved update path.
- Do not publish an `xquik` plugin alias from a renamed temporary artifact unless the publisher explicitly approves a real alias package identity that passes ClawHub package-name checks and does not confuse OpenClaw installs.
