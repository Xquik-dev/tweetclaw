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
