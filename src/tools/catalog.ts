// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { API_SPEC } from '../api-spec.js';
import type { EndpointInfo, ExploreParams, TweetclawParams } from '../types.js';

const API_V1_PREFIX = '/api/v1/';
const DEFAULT_EXPLORE_LIMIT = 25;
const MAX_EXPLORE_LIMIT = 100;
const MAX_IDEMPOTENCY_KEY_LENGTH = 255;
const VISIBLE_ASCII_FIRST = '!';
const VISIBLE_ASCII_LAST = '~';

const PRIVATE_GET_PATHS = new Set([
  '/api/v1/account',
  '/api/v1/credits',
  '/api/v1/x/accounts',
]);

const PRIVATE_GET_PREFIXES = [
  '/api/v1/drafts',
  '/api/v1/draws',
  '/api/v1/events',
  '/api/v1/extractions',
  '/api/v1/monitors',
  '/api/v1/styles',
  '/api/v1/webhooks',
  '/api/v1/x/accounts/',
  '/api/v1/x/bookmarks',
  '/api/v1/x/dm/',
  '/api/v1/x/notifications',
  '/api/v1/x/timeline',
  '/api/v1/x/write-actions/',
];

const specEndpoints = API_SPEC.filter((endpoint) => endpoint.agentProhibited !== true);

function normalizeMethod(method?: string): string {
  return (method ?? 'GET').toUpperCase();
}

function normalizeLimit(limit?: number): number {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_EXPLORE_LIMIT;
  }
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_EXPLORE_LIMIT);
}

function pathSegments(path: string): readonly string[] {
  const normalized = path.endsWith('/') ? path.slice(0, -1) : path;
  return normalized.split('/');
}

function matchesEndpointPath(endpointPath: string, requestPath: string): boolean {
  if (endpointPath === requestPath) return true;
  const endpointSegments = pathSegments(endpointPath);
  const requestSegments = pathSegments(requestPath);
  if (endpointSegments.length !== requestSegments.length) return false;

  return endpointSegments.every((segment, index) => {
    const requestSegment = String(requestSegments.at(index));
    return segment.startsWith(':') ? requestSegment.length > 0 : segment === requestSegment;
  });
}

function assertSafePath(path: string): void {
  if (!path.startsWith(API_V1_PREFIX)) {
    throw new Error(`Path must start with /api/v1/ but got: ${path}`);
  }
  if (path.includes('?') || path.includes('#')) {
    throw new Error('Pass query parameters through the query object, not in the path.');
  }
}

function findEndpoint(method: string, path: string): EndpointInfo | undefined {
  return specEndpoints.find(
    (endpoint) => endpoint.method === method && matchesEndpointPath(endpoint.path, path),
  );
}

function normalizeQuery(query?: Readonly<Record<string, boolean | number | string>>): Readonly<Record<string, string>> | undefined {
  if (query === undefined) return undefined;
  return Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)]));
}

function isVisibleAscii(value: string): boolean {
  for (const character of value) {
    if (character < VISIBLE_ASCII_FIRST || character > VISIBLE_ASCII_LAST) return false;
  }
  return true;
}

function validateWriteIdempotencyKey(
  endpoint: Readonly<EndpointInfo>,
  idempotencyKey: string | undefined,
): void {
  if (endpoint.category !== 'x-write') return;
  if (
    idempotencyKey === undefined
    || idempotencyKey.length === 0
    || idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH
    || !isVisibleAscii(idempotencyKey)
  ) {
    throw new Error(
      'X writes require a unique 1-255 character idempotencyKey. Reuse it only for the exact same retry.',
    );
  }
}

function requestNeedsApproval(method: string, path: string): boolean {
  if (method !== 'GET') {
    return true;
  }

  const endpoint = findEndpoint(method, path);
  if (endpoint?.free === false || endpoint?.sensitive === true) {
    return true;
  }

  return PRIVATE_GET_PATHS.has(path)
    || PRIVATE_GET_PREFIXES.some((prefix) => path.startsWith(prefix));
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
  assertSafePath(path);
  const endpoint = findEndpoint(method, path);
  if (endpoint === undefined) {
    throw new Error(`Endpoint is not in the TweetClaw catalog: ${method} ${path}`);
  }
  if (options?.mppMode === true && endpoint.mpp === undefined) {
    throw new Error(`Endpoint is not available in MPP mode: ${method} ${endpoint.path}`);
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

function endpointMatchesQuery(endpoint: (typeof API_SPEC)[number], query: string): boolean {
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
