// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { API_SPEC, BLOCKED_OPERATIONS } from './api-spec.js';
import type { EndpointInfo } from './types.js';

interface Route {
  readonly endpoint?: EndpointInfo;
  readonly method: string;
  readonly path: string;
}

const API_V1_PREFIX = '/api/v1/';
const PATH_VALUE_PREFIX = ':';
const PARSER_ORIGIN = 'https://tweetclaw.invalid';

function canonicalPath(path: string): string {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

function pathSegments(path: string): readonly string[] {
  return canonicalPath(path).split('/');
}

function unescapeSegment(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment);
  } catch {
    return undefined;
  }
}

function hasDotSegment(segment: string): boolean {
  const unescaped = unescapeSegment(segment);
  return unescaped === undefined
    || unescaped.split(/[/\\]/u).some((part) => part === '.' || part === '..');
}

function isPlainPath(path: string): boolean {
  return new URL(path, PARSER_ORIGIN).pathname === path
    && !path.split('/').some((segment) => hasDotSegment(segment));
}

function apiPathProblem(path: string): string | undefined {
  if (!path.startsWith(API_V1_PREFIX)) {
    return `Path is outside /api/v1/. Use a catalog-listed API path: ${path}`;
  }
  if (path.includes('?') || path.includes('#')) {
    return 'Pass query parameters through the query object, not in the path.';
  }
  return isPlainPath(path) ? undefined : 'Path is not sent as written. Use a plain catalog path.';
}

function matchesEndpointPath(endpointPath: string, requestPath: string): boolean {
  if (endpointPath === requestPath) return true;
  const endpointSegments = pathSegments(endpointPath);
  const requestSegments = pathSegments(requestPath);
  if (endpointSegments.length !== requestSegments.length) return false;

  return endpointSegments.every((segment, index) => {
    const requestSegment = String(requestSegments.at(index));
    return segment.startsWith(PATH_VALUE_PREFIX) ? requestSegment.length > 0 : segment === requestSegment;
  });
}

function pathValueCount(path: string): number {
  return pathSegments(path).filter((segment) => segment.startsWith(PATH_VALUE_PREFIX)).length;
}

function catalogRoute(endpoint: EndpointInfo): Route {
  const { method, path } = endpoint;
  return endpoint.agentProhibited === true ? { method, path } : { endpoint, method, path };
}

const ROUTES: readonly Route[] = [...API_SPEC.map((endpoint) => catalogRoute(endpoint)), ...BLOCKED_OPERATIONS]
  .toSorted((left, right) => pathValueCount(left.path) - pathValueCount(right.path));

function findRoute(method: string, path: string): Route | undefined {
  return apiPathProblem(path) === undefined
    ? ROUTES.find((route) => route.method === method && matchesEndpointPath(route.path, path))
    : undefined;
}

export { apiPathProblem, canonicalPath, findRoute, matchesEndpointPath };
