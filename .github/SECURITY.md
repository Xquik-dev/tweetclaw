# Security policy

## Report a vulnerability

Do not publish vulnerability details in an issue.

Email [security@xquik.com](mailto:security@xquik.com) with:

- Affected version and component
- Minimal reproduction steps
- Impact and required access

Expect an acknowledgment within 72 hours. We will set a disclosure timeline
after confirming the issue.

## Credential handling

- Never commit or publish API keys and signing keys.
- Store keys in OpenClaw config or an approved secret store.
- Rotate any exposed or suspected key immediately.
- Use separate keys for each agent and environment.

## Scope

In scope:

- The plugin source and bundled npm artifact
- The TweetClaw Skill
- API key and request-boundary handling
- The optional MPP integration
- Dependencies and release metadata

Report upstream Xquik API issues to the same private address. Contact third-party
registries about defects in their own services.
