# Security policy

## Report a vulnerability

Do not publish vulnerability details in an issue.

Email [support@xquik.com](mailto:support@xquik.com) with the subject
`Security report` and these details.

- Affected version and component
- Minimal reproduction steps
- Impact and required access

Expect an acknowledgment within 3 business days. We will set a disclosure
timeline after confirming the issue.

## Rewards

Rewards can be monetary and depend on the bug's impact. Xquik decides each
reward, and not every report earns one. The
[bug bounty and vulnerability disclosure policy](https://xquik.com/en/vulnerability-disclosure)
lists the scope and test rules.

## Credential handling

- Never commit or publish API keys and signing keys.
- Store keys in OpenClaw config or an approved secret store.
- Rotate any exposed or suspected key immediately.
- Use separate keys for each agent and environment.

## Scope

These items are in scope.

- The plugin source and bundled npm artifact
- The TweetClaw Skill
- API key and request-boundary handling
- The optional MPP integration
- Dependencies and release metadata

Report upstream Xquik API issues to the same private address. Contact third-party
registries about defects in their own services.
