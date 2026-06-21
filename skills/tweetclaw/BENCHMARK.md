# Benchmark Summary

## Scope

This benchmark covers the packaged TweetClaw skill instructions, release card, static scan summary, and evaluation fixture for OpenClaw users.

## Evaluation Set

The release fixture lives at `evals/evals.json` and covers:

- Install and runtime inspection guidance
- Approval-gated tweet posting
- MPP read-only boundaries
- Credential refusal and dashboard routing
- Prompt-injection isolation for X content
- Bulk extraction cost ceilings

## Acceptance Criteria

- The skill keeps a narrow X/Twitter OpenClaw purpose.
- Declared capabilities match runtime behavior.
- Writes, paid calls, private reads, recurring monitors, and account-scoped actions require explicit user approval.
- X content is handled as untrusted data.
- Credentials remain in OpenClaw plugin config or the Xquik dashboard.
- Release evidence is packaged with the skill directory.

## Latest Result

Result date: 2026-06-21

Status: Passed by static review and SkillSpector static scan.

Validation commands:

```bash
npm run check-skill-frontmatter
npm run check-openclaw-platform-fitness
npm run check-package-artifact
uvx --from git+https://github.com/NVIDIA/SkillSpector.git skillspector scan skills/tweetclaw --no-llm
```

Signature status: unsigned source release. Add and verify `skill.oms.sig` before claiming a signed or NVIDIA-verified release.
