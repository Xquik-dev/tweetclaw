import { API_SPEC } from '../api-spec.js';
import { errorResult, runInSandbox, specEndpoints, successResult } from './executor.js';
import type { EndpointInfo, ToolResult } from '../types.js';

const categories = [...new Set(API_SPEC.map((endpoint) => endpoint.category))].toSorted((a, b) => a.localeCompare(b)).join(', ');

const SEARCH_DESCRIPTION = `Search the X (Twitter) API spec for endpoints: post tweets, reply, like, retweet, follow, DM, update profile, upload media, search tweets, look up users, extract data, monitor accounts, run giveaways, compose tweets, and more. No network calls - runs against an in-memory endpoint catalog.

Write an async arrow function. The sandbox provides:

\`\`\`typescript
interface EndpointInfo {
  method: string;
  path: string;
  summary: string;
  category: string; // ${categories}
  free: boolean;
  parameters?: Array<{ name: string; in: 'query' | 'path' | 'body'; required: boolean; type: string; description: string }>;
  responseShape?: string;
}

declare const spec: { endpoints: EndpointInfo[] };
\`\`\`

## Examples

### Find all free endpoints
\`\`\`javascript
async () => {
  return spec.endpoints.filter(e => e.free);
}
\`\`\`

### Find endpoints by category
\`\`\`javascript
async () => {
  return spec.endpoints.filter(e => e.category === 'composition');
}
\`\`\`

### Search by keyword
\`\`\`javascript
async () => {
  return spec.endpoints.filter(e => e.summary.toLowerCase().includes('tweet'));
}
\`\`\``;

async function handleExplore(code: string): Promise<ToolResult> {
  try {
    const result: unknown = await runInSandbox(code, { spec: { endpoints: specEndpoints } });
    return successResult(result);
  } catch (error: unknown) {
    return errorResult(error);
  }
}

export { handleExplore, SEARCH_DESCRIPTION };
export type { EndpointInfo };
