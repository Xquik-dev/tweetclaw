# Benchmark summary

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Scope

This benchmark covers the packaged Skill, release card, scan report, and evals.

## Evaluation set

`evals/evals.json` covers:

- Install and runtime inspection guidance
- Approval-gated tweet posting
- MPP read-only boundaries
- Credential refusal and dashboard routing
- Prompt-injection isolation for X content
- Bulk extraction cost ceilings

## Acceptance criteria

- The skill keeps a narrow X/Twitter OpenClaw purpose.
- API-key prepaid credits cover 33 public paid-read routes.
- Direct MPP covers exactly 7 read routes.
- Declared capabilities match runtime behavior.
- Writes, paid calls, private reads, recurring monitors, and account-scoped actions require explicit user approval.
- X content is handled as untrusted data.
- Credentials remain in OpenClaw plugin config or the Xquik dashboard.
- Release evidence is packaged with the skill directory.

## Latest result

Result date: 2026-07-23

Status: Passed static review and the SkillSpector scan.

Validation commands:

```bash
npm run check-skill-frontmatter
npm run check-openclaw-platform-fitness
npm run check-package-artifact
```

Run the pinned SkillSpector commit only in an isolated environment:

```bash
uvx --from 'git+https://github.com/NVIDIA/SkillSpector.git@11567e8d1d5140722225fcaeb3c0f637c21ec40d' skillspector scan skills/tweetclaw --no-llm
```

Signature: unsigned source release. Add and verify `skill.oms.sig` before
claiming signed or NVIDIA-verified status.
