# AgentRegistry (aregistry.ai) Submission Steps

Xquik MCP can be registered as a remote StreamableHTTP endpoint on aregistry.ai.
The `@xquik/tweetclaw` npm package is already published, which gives an additional
registration vector.

## Prerequisites

Install the arctl CLI:

```bash
curl -fsSL https://raw.githubusercontent.com/agentregistry-dev/agentregistry/main/scripts/get-arctl | bash
```

Verify installation:

```bash
arctl version
```

## Option A: Register as Remote MCP Server

Register the hosted StreamableHTTP endpoint directly:

```bash
arctl mcp publish xquik \
  --type remote \
  --url https://xquik.com/mcp \
  --transport streamable-http \
  --description "Real-time X (Twitter) data platform via structured Xquik endpoints. Tweet search, user lookup, follower extraction, write actions, monitoring, giveaway draws, and trending topics."
```

## Option B: Register the npm Package

Since @xquik/tweetclaw is on npm, it can also be registered as an npm-based entry:

```bash
arctl mcp publish xquik-tweetclaw \
  --type npm \
  --package @xquik/tweetclaw \
  --description "X/Twitter automation via Xquik. OpenClaw plugin with 99 agent-callable endpoints via 2 structured tools."
```

## After Publishing

The entry will appear at https://aregistry.ai and be discoverable via:

```bash
arctl list --search xquik
```

The web UI is also available at http://localhost:12121 after running any arctl command.

## Notes

- aregistry.ai supports npm, PyPI, OCI/Docker, and remote HTTP endpoints
- Each entry supports versioning, environment variables, and automated quality scores
- Integrates with Kubernetes, AWS AgentCore, and Google Vertex AI for deployment
