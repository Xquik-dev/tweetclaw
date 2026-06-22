# SkillSpector Static Scan Summary

Scan target: `skills/tweetclaw`

Scanner: NVIDIA SkillSpector v2.2.3 from https://github.com/NVIDIA/SkillSpector

Command:

```bash
uvx --from git+https://github.com/NVIDIA/SkillSpector.git skillspector scan skills/tweetclaw --no-llm
```

Latest recorded scan: 2026-06-22 06:17 UTC.

Latest recorded result: score `0/100`, severity `LOW`, recommendation `SAFE`.

Findings: none.

Executable scripts in skill directory: none.

Scanned components:

- `BENCHMARK.md`
- `SKILL.md`
- `evals/evals.json`
- `skill-card.md`
- `skillspector-report.md`

Notes:

- This summary records the static scan result for the reviewed skill directory after the NVIDIA Skills hardening pass on 2026-06-21.
- Re-run the command before publishing a new signed skill artifact or claiming verified status.
- If a future scan reports critical or high findings, block release until the finding is fixed or formally accepted in the release record.
