import { exploreCatalog, specEndpoints } from './catalog.js';
import { errorResult, successResult } from './result.js';
import type { EndpointInfo, ExploreParams, ToolResult } from '../types.js';

const categories = [...new Set(specEndpoints.map((endpoint) => endpoint.category))]
  .toSorted((a, b) => a.localeCompare(b))
  .join(', ');

const SEARCH_DESCRIPTION = `Search the X (Twitter) API endpoint catalog. No network calls and no code execution.

Use structured filters:
- query: keyword search across summaries, paths, response shapes, and parameters
- category: one of ${categories}
- method: GET, POST, PATCH, PUT, or DELETE
- path: exact or partial API path
- free: true for free endpoints, false for paid endpoints
- mpp: true for MPP-eligible endpoints only
- limit: 1-100 results, default 25

Returns endpoint descriptors with method, path, summary, category, parameters, cost, and response shape.`;

async function handleExplore(params: Readonly<ExploreParams> = {}): Promise<ToolResult> {
  try {
    const result = await Promise.resolve(exploreCatalog(params));
    return successResult(result);
  } catch (error: unknown) {
    return errorResult(error);
  }
}

export { handleExplore, SEARCH_DESCRIPTION };
export type { EndpointInfo };
