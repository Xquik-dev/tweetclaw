// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { exploreCatalog, specEndpoints } from './catalog.js';
import { errorResult, successResult } from './result.js';
import type { EndpointInfo, ExploreParams, ToolResult } from '../types.js';

const categories = [...new Set(specEndpoints.map((endpoint) => endpoint.category))]
  .toSorted((a, b) => a.localeCompare(b))
  .join(', ');

const SEARCH_DESCRIPTION = `Search the X (Twitter) API catalog without network calls or code execution.

Filters.
- query searches summaries, paths, response fields, and parameters
- category takes one of ${categories}
- method takes GET, POST, PATCH, PUT, or DELETE
- path takes an exact or partial API path
- free takes true for free endpoints or false for paid endpoints
- mpp takes true for MPP-supported endpoints only
- limit takes 1-100 results and defaults to 25

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
