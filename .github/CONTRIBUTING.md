# Contribute

This repository publishes the TweetClaw plugin and bundled Skill. Change
runtime code, the packaged Skill, setup guidance, checks, or documentation here.

Change the upstream Xquik API in its source repository.

## Set up

```bash
npm ci
npm run check:all
```

## Change rules

- Keep each pull request focused.
- Preserve approval, credential, payment, privacy, and endpoint boundaries.
- Update `SKILL.md` for agent-facing behavior.
- Update public guides when setup or API coverage changes.
- Do not hand-edit `generated-api-contract.json` or release history.
- Run `npm run check:all` before every commit and push.

## Submit

Sign the commit, open a pull request, and resolve every blocking comment.
A different person must approve non-trivial changes.

Report vulnerabilities through [the security policy](SECURITY.md).
