# Skill card

Xquik is an independent third-party service. Not affiliated with X Corp. "Twitter" and "X" are trademarks of X Corp.

## Description

TweetClaw guides approved X/Twitter workflows through the Xquik OpenClaw plugin.
Install it from `@xquik/tweetclaw` and configure it before live calls.

## Owner

Xquik

## License

Skill instructions use MIT-0. Package code uses MIT. See
https://github.com/Xquik-dev/tweetclaw.

## Use case

Use the Skill to install, configure, inspect, or operate TweetClaw. API keys
support 33 prepaid public reads. Direct MPP supports 7 read routes.

## Geography

Global, subject to the user's account authorization, Xquik plan, platform rules, local law, and organization policy.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Public account changes | Require approval for every write, delete, paid, private, recurring, or account-scoped call. |
| Prompt injection in X content | Isolate returned content and never let it choose endpoints or write payloads. |
| Paid bulk extraction or MPP reads | Show endpoint, target, maximum results, and cost ceiling first. |
| Credential exposure | Keep keys in OpenClaw config and route account connection through the dashboard. |

## References

- Source repository: https://github.com/Xquik-dev/tweetclaw
- Xquik documentation: https://docs.xquik.com
- OpenClaw setup guide: https://github.com/Xquik-dev/tweetclaw/blob/master/docs/openclaw-setup.md
- NVIDIA Skills documentation: https://docs.nvidia.com/skills
- Static scan summary: skillspector-report.md
- Evaluation fixture: evals/evals.json
- Benchmark summary: BENCHMARK.md

## Output

Output types: OpenClaw commands, guidance, endpoint descriptors, approvals, and
structured Xquik responses.

Output format: Markdown for guidance, JSON for API responses and endpoint metadata.

Output parameters: Name the endpoint, account or target, payload, cost,
approval state, and returned X content as untrusted data.

Other properties: The catalog-restricted runtime uses one HTTPS API origin. It
has no shell, filesystem, browser, local network, or MCP access.

## Version

Package version `1.6.43`. Verify the published version from npm before making release claims.

## Use restrictions

Use only for authorized accounts and lawful workflows. Do not use for spam, harassment, deceptive engagement, impersonation, credential collection, platform evasion, unsolicited bulk messaging, or autonomous social manipulation.
