// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { MPP_OFFERS } from './api-spec.js';
import { apiPathProblem, canonicalPath, findRoute, matchesEndpointPath } from './routes.js';
import type { EndpointInfo, FetchFunction, PayingFetch, RequestFunction, RequestOptions } from './types.js';

const FETCH_TIMEOUT_MS = 30_000;
const CONTENT_TYPE_HEADER = 'content-type';
const API_KEY_HEADER = 'x-api-key';
const AUTHORIZATION_HEADER = 'authorization';
const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
const BEARER_PREFIX = 'Bearer ';
const API_KEY_PREFIX = 'xq_';
const REDIRECT_STATUS_FIRST = 300;
const REDIRECT_STATUS_LAST = 399;
const MAX_SAFE_ERROR_CODE_LENGTH = 80;

function buildAuthHeader(credential: string): Record<string, string> {
  return credential.startsWith(API_KEY_PREFIX)
    ? { [API_KEY_HEADER]: credential }
    : { [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${credential}` };
}

function buildFetchHeaders(
  credential: string,
  hasBody: boolean,
  idempotencyKey?: string,
): Record<string, string> {
  const auth = credential === '' ? {} : buildAuthHeader(credential);
  const contentType = hasBody ? { [CONTENT_TYPE_HEADER]: 'application/json' } : {};
  const idempotency = idempotencyKey === undefined
    ? {}
    : { [IDEMPOTENCY_KEY_HEADER]: idempotencyKey };
  return { ...auth, ...contentType, ...idempotency };
}

function createBaseUrl(baseUrl: string): URL {
  try {
    return new URL(baseUrl);
  } catch {
    throw new Error('Base URL is invalid. Enter an HTTPS URL.');
  }
}

function parseBaseUrl(baseUrl: string): URL {
  const url = createBaseUrl(baseUrl);
  if (url.protocol !== 'https:') {
    throw new Error('Base URL is not HTTPS. Use an HTTPS URL.');
  }
  if (url.username.length > 0 || url.password.length > 0) {
    throw new Error('Base URL contains credentials. Remove them.');
  }
  return url;
}

function buildFetchUrl(baseUrl: string, path: string, query?: Readonly<Record<string, string>>): string {
  const base = parseBaseUrl(baseUrl);
  const url = new URL(path, base);
  if (url.origin !== base.origin) {
    throw new Error('Path names another host. Use a catalog-listed API path.');
  }
  if (query !== undefined) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

const REFUSED_PATH_FAMILIES: ReadonlyArray<{ readonly path: string; readonly readable?: true }> = [
  { path: '/api/v1/account', readable: true },
  { path: '/api/v1/api-keys' },
  { path: '/api/v1/credits', readable: true },
  { path: '/api/v1/guest-wallets' },
  { path: '/api/v1/subscribe' },
  { path: '/api/v1/support' },
  { path: '/api/v1/x/account-connection-attempts' },
  { path: '/api/v1/x/account-connection-challenges' },
  { path: '/api/v1/x/accounts', readable: true },
];

const SESSION_ONLY_REFUSALS: ReadonlyArray<{ readonly method: string; readonly path: string }> = [
  { method: 'GET', path: '/api/v1/api-keys' },
  { method: 'POST', path: '/api/v1/api-keys' },
  { method: 'DELETE', path: '/api/v1/api-keys/:id' },
  { method: 'POST', path: '/api/v1/credits/quick-topup' },
  { method: 'GET', path: '/api/v1/x/account-connection-attempts/:id' },
  { method: 'POST', path: '/api/v1/x/account-connection-challenges/:id/submit' },
  { method: 'POST', path: '/api/v1/x/accounts' },
  { method: 'DELETE', path: '/api/v1/x/accounts/:id' },
  { method: 'POST', path: '/api/v1/x/accounts/:id/reauth' },
  { method: 'POST', path: '/api/v1/x/accounts/bulk-retry' },
];

function isInRefusedFamily(method: string, path: string): boolean {
  const target = canonicalPath(path);
  return REFUSED_PATH_FAMILIES.some((family) =>
    target === family.path
      ? !(family.readable === true && method === 'GET')
      : target.startsWith(`${family.path}/`));
}

function isSessionOnly(method: string, path: string): boolean {
  return SESSION_ONLY_REFUSALS.some(
    (operation) => operation.method === method && matchesEndpointPath(operation.path, path),
  );
}

function isStaticallyRefused(method: string, path: string): boolean {
  const upperMethod = method.toUpperCase();
  return isInRefusedFamily(upperMethod, path) || isSessionOnly(upperMethod, path);
}

type Verdict = { readonly endpoint: EndpointInfo } | { readonly refusal: string };

const BLOCKED_FOR_AGENTS =
  'Endpoint is blocked for agents. Complete account, credential, billing, or support administration at dashboard.xquik.com.';

function judgeRequest(method: string, path: string): Verdict {
  const pathProblem = apiPathProblem(path);
  if (pathProblem !== undefined) return { refusal: pathProblem };
  if (isStaticallyRefused(method, path)) return { refusal: BLOCKED_FOR_AGENTS };
  const route = findRoute(method, path);
  if (route === undefined) {
    return { refusal: `Endpoint is not in the TweetClaw catalog. Choose a route returned by explore: ${method} ${path}` };
  }
  return route.endpoint === undefined ? { refusal: BLOCKED_FOR_AGENTS } : { endpoint: route.endpoint };
}

function isProhibitedRequest(method: string, path: string): boolean {
  return 'refusal' in judgeRequest(method.toUpperCase(), path);
}

function fetchFor(
  endpoint: EndpointInfo,
  fetchFunction: FetchFunction | undefined,
  payFor: PayingFetch | undefined,
): FetchFunction {
  const offer = MPP_OFFERS.get(endpoint);
  return payFor === undefined || offer === undefined ? fetchFunction ?? globalThis.fetch : payFor(offer);
}

async function readResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isAsciiLetter(character: string): boolean {
  const lower = character.toLowerCase();
  return lower >= 'a' && lower <= 'z';
}

function isAsciiDigit(character: string): boolean {
  return character >= '0' && character <= '9';
}

function isSafeErrorCodeCharacter(character: string): boolean {
  return isAsciiLetter(character)
    || isAsciiDigit(character)
    || character === '_'
    || character === '.'
    || character === ':'
    || character === '-';
}

function isSafeErrorCode(value: string): boolean {
  if (
    value.length === 0
    || value.length > MAX_SAFE_ERROR_CODE_LENGTH
    || !isAsciiLetter(value.slice(0, 1))
  ) {
    return false;
  }
  for (const character of value) {
    if (!isSafeErrorCodeCharacter(character)) {
      return false;
    }
  }
  return true;
}

function stringErrorCode(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  if ('error' in value && typeof value.error === 'string') {
    return value.error;
  }
  return 'code' in value && typeof value.code === 'string' ? value.code : undefined;
}

function safeErrorCode(value: unknown): string | undefined {
  const code = stringErrorCode(value);
  return code !== undefined && isSafeErrorCode(code) ? code : undefined;
}

function formatApiError(response: Response, payload: unknown): string {
  const status = response.statusText.length > 0
    ? `${String(response.status)} ${response.statusText}`
    : String(response.status);
  const code = safeErrorCode(payload);
  return code === undefined ? `Xquik API returned ${status}.` : `Xquik API returned ${status} (${code}).`;
}

function assertNoRedirect(response: Response): void {
  if (response.status >= REDIRECT_STATUS_FIRST && response.status <= REDIRECT_STATUS_LAST) {
    throw new Error('Xquik API answered with a redirect. TweetClaw follows none, so the credential stays on this host.');
  }
}

function createProxiedRequest(
  baseUrl: string,
  credential: string,
  fetchFunction?: FetchFunction,
  payFor?: PayingFetch,
): RequestFunction {
  return async (path: string, options?: Readonly<RequestOptions>): Promise<unknown> => {
    const method = (options?.method ?? 'GET').toUpperCase();
    const verdict = judgeRequest(method, path);
    if ('refusal' in verdict) {
      throw new Error(verdict.refusal);
    }
    const activeFetch = fetchFor(verdict.endpoint, fetchFunction, payFor);
    const hasBody = options?.body !== undefined;
    const response = await activeFetch(buildFetchUrl(baseUrl, canonicalPath(path), options?.query), {
      ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
      headers: buildFetchHeaders(credential, hasBody, options?.idempotencyKey),
      method,
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    assertNoRedirect(response);
    const json: unknown = await readResponseJson(response);
    if (!response.ok) {
      throw new Error(formatApiError(response, json));
    }
    return json;
  };
}

export {
  buildAuthHeader,
  buildFetchHeaders,
  buildFetchUrl,
  createProxiedRequest,
  IDEMPOTENCY_KEY_HEADER,
  isProhibitedRequest,
  isStaticallyRefused,
};
