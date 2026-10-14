// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { API_SPEC, APPROVAL_FREE_READS } from '../api-spec.js';
import { IDEMPOTENCY_KEY_HEADER } from '../request.js';
import { apiPathProblem, findRoute, matchesEndpointPath } from '../routes.js';
import type { EndpointInfo, ExploreParams, TweetclawParams } from '../types.js';

const DEFAULT_EXPLORE_LIMIT = 25;
const MAX_EXPLORE_LIMIT = 100;
const MAX_IDEMPOTENCY_KEY_LENGTH = 255;
const VISIBLE_ASCII_FIRST = '!';
const VISIBLE_ASCII_LAST = '~';

const specEndpoints = API_SPEC.filter((endpoint) => endpoint.agentProhibited !== true);

function normalizeMethod(method = 'GET'): string {
  return method.toUpperCase();
}

function normalizeLimit(limit?: number): number {
  return limit === undefined || !Number.isFinite(limit)
    ? DEFAULT_EXPLORE_LIMIT
    : Math.min(Math.max(Math.trunc(limit), 1), MAX_EXPLORE_LIMIT);
}

function findEndpoint(method: string, path: string): EndpointInfo | undefined {
  return findRoute(method, path)?.endpoint;
}

function normalizeQuery(query?: Readonly<Record<string, boolean | number | string>>): Readonly<Record<string, string>> | undefined {
  return query === undefined
    ? undefined
    : Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)]));
}

function isVisibleAscii(value: string): boolean {
  for (const character of value) {
    if (character < VISIBLE_ASCII_FIRST || character > VISIBLE_ASCII_LAST) return false;
  }
  return true;
}

function requiresIdempotencyKey(endpoint: Readonly<EndpointInfo>): boolean {
  return endpoint.parameters.some(
    (parameter) =>
      parameter.in === 'header' && parameter.name === IDEMPOTENCY_KEY_HEADER && parameter.required,
  );
}

function validateWriteIdempotencyKey(
  endpoint: Readonly<EndpointInfo>,
  idempotencyKey: string | undefined,
): void {
  if (!requiresIdempotencyKey(endpoint)) return;
  if (
    idempotencyKey === undefined
    || idempotencyKey.length === 0
    || idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH
    || !isVisibleAscii(idempotencyKey)
  ) {
    throw new Error(
      'idempotencyKey is invalid. Use 1-255 visible ASCII characters and reuse it only for an identical retry.',
    );
  }
}

function requestNeedsApproval(method: string, path: string): boolean {
  if (method !== 'GET') {
    return true;
  }

  const endpoint = findEndpoint(method, path);
  return endpoint !== undefined
    && !APPROVAL_FREE_READS.has(`${endpoint.method} ${endpoint.path}`);
}

function resolveCatalogRequest(
  params: Readonly<TweetclawParams>,
  options?: Readonly<{ mppMode?: boolean }>,
): {
  readonly body?: unknown;
  readonly endpoint: EndpointInfo;
  readonly idempotencyKey?: string;
  readonly method: string;
  readonly path: string;
  readonly query?: Readonly<Record<string, string>>;
} {
  const method = normalizeMethod(params.method);
  const { body, idempotencyKey, path } = params;
  const pathProblem = apiPathProblem(path);
  if (pathProblem !== undefined) {
    throw new Error(pathProblem);
  }
  const endpoint = findEndpoint(method, path);
  if (endpoint === undefined) {
    throw new Error(`Endpoint is not in the TweetClaw catalog. Choose a route returned by explore: ${method} ${path}`);
  }
  if (options?.mppMode === true && endpoint.mpp === undefined) {
    throw new Error(`Endpoint does not support MPP. Choose an MPP-eligible read route: ${method} ${endpoint.path}`);
  }
  validateWriteIdempotencyKey(endpoint, idempotencyKey);

  const query = normalizeQuery(params.query);
  return {
    body,
    endpoint,
    ...(idempotencyKey === undefined ? {} : { idempotencyKey }),
    method,
    path,
    ...(query === undefined ? {} : { query }),
  };
}

function endpointMatchesQuery(endpoint: Readonly<EndpointInfo>, query: string): boolean {
  const normalized = query.toLowerCase();
  const { category, method, parameters, path, responseShape, summary } = endpoint;
  const haystack = [
    category,
    method,
    path,
    responseShape,
    summary,
    ...parameters.flatMap((parameter) => [
      parameter.description,
      parameter.name,
      parameter.type,
    ]),
  ].join(' ').toLowerCase();

  return haystack.includes(normalized);
}

function exploreCatalog(params: Readonly<ExploreParams> = {}): readonly EndpointInfo[] {
  const method = params.method === undefined ? undefined : normalizeMethod(params.method);
  const query = params.query?.trim();
  const category = params.category?.trim().toLowerCase();
  const path = params.path?.trim();
  const limit = normalizeLimit(params.limit);

  return specEndpoints
    .filter((endpoint) => method === undefined || endpoint.method === method)
    .filter((endpoint) => category === undefined || endpoint.category.toLowerCase() === category)
    .filter((endpoint) => params.free === undefined || endpoint.free === params.free)
    .filter((endpoint) => params.mpp === undefined || (endpoint.mpp !== undefined) === params.mpp)
    .filter((endpoint) => path === undefined || matchesEndpointPath(endpoint.path, path) || endpoint.path.includes(path))
    .filter((endpoint) => query === undefined || query.length === 0 || endpointMatchesQuery(endpoint, query))
    .slice(0, limit);
}

export {
  exploreCatalog,
  findEndpoint,
  matchesEndpointPath,
  normalizeMethod,
  requestNeedsApproval,
  resolveCatalogRequest,
  specEndpoints,
};
