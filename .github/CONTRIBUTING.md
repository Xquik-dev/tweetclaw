# Contribute

## Scope

This repository publishes the TweetClaw OpenClaw plugin and bundled Skill.
Changes may cover:

- Plugin behavior under `src/`
- The packaged Skill under `skills/tweetclaw/`
- OpenClaw and Xquik setup guidance
- Tests, release checks, and documentation

Change the upstream Xquik API in its source repository.

## Set up

```bash
npm ci
npm run check:all
```

## Change rules

- Keep each pull request focused.
- Delete more handwritten lines than each commit adds.
- Preserve approval, credential, payment, privacy, and endpoint boundaries.
- Update `SKILL.md` for agent-facing behavior.
- Update public guides when setup or API coverage changes.
- Do not hand-edit `generated-api-contract.json` or release history.
- Run `npm run check:all` before every commit and push.

## Submit

Sign the commit, open a pull request, and resolve every blocking comment.
A different person must approve non-trivial changes.

Report vulnerabilities through [the security policy](SECURITY.md).
