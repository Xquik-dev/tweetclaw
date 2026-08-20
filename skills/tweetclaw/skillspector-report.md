# SkillSpector static scan

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

Scan target: `skills/tweetclaw`

Scanner: NVIDIA SkillSpector v2.4.1 at commit `11567e8d1d5140722225fcaeb3c0f637c21ec40d` from https://github.com/NVIDIA/SkillSpector

Run the reviewed commit only in an isolated environment. Never execute mutable repository HEAD.

```bash
uvx --from 'git+https://github.com/NVIDIA/SkillSpector.git@11567e8d1d5140722225fcaeb3c0f637c21ec40d' skillspector scan skills/tweetclaw --no-llm
```

Latest recorded scan: 2026-07-23 18:40 UTC.

Latest recorded result: score `0/100`, severity `LOW`, recommendation `SAFE`.

Findings: none.

Executable scripts in skill directory: none.

Scanned components:

- `BENCHMARK.md`
- `SKILL.md`
- `evals/evals.json`
- `skill-card.md`
- `skillspector-report.md`

This report records the post-hardening scan from 2026-07-23. Rerun it before a
signed release or verification claim. Block critical and high findings until
they are fixed or formally accepted in the release record.
