import type { FetchFunction, RequestFunction, RequestOptions } from './types.js';

const FETCH_TIMEOUT_MS = 30_000;
const CONTENT_TYPE_HEADER = 'content-type';
const API_KEY_HEADER = 'x-api-key';
const AUTHORIZATION_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';
const API_KEY_PREFIX = 'xq_';
const API_V1_PREFIX = '/api/v1/';
const SUPPORT_TICKETS_PREFIX = '/api/v1/support/tickets';

function buildAuthHeader(credential: string): Record<string, string> {
  if (credential.startsWith(API_KEY_PREFIX)) {
    return { [API_KEY_HEADER]: credential };
  }
  return { [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${credential}` };
}

function buildFetchHeaders(credential: string, hasBody: boolean): Record<string, string> {
  const auth = credential === '' ? {} : buildAuthHeader(credential);
  if (hasBody) {
    return { ...auth, [CONTENT_TYPE_HEADER]: 'application/json' };
  }
  return auth;
}

function buildFetchUrl(baseUrl: string, path: string, query?: Readonly<Record<string, string>>): string {
  const url = new URL(path, baseUrl);
  if (query !== undefined) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

const PROHIBITED_PATHS: ReadonlyArray<readonly [string, string]> = [
  ['PATCH', '/api/v1/account'],
  ['PUT', '/api/v1/account/x-identity'],
  ['GET', '/api/v1/api-keys'],
  ['POST', '/api/v1/api-keys'],
  ['POST', '/api/v1/credits/topup'],
  ['GET', '/api/v1/credits/topup/status'],
  ['POST', '/api/v1/credits/quick-topup'],
  ['POST', '/api/v1/subscribe'],
  ['POST', '/api/v1/x/accounts'],
  ['POST', '/api/v1/x/accounts/'],
  ['POST', '/api/v1/x/accounts/bulk-retry'],
];

const PROHIBITED_PATH_PATTERNS: ReadonlyArray<readonly [string, RegExp]> = [
  ['DELETE', /^\/api\/v1\/api-keys\/[^/]+\/?$/u],
  ['DELETE', /^\/api\/v1\/x\/accounts\/[^/]+\/?$/u],
  ['GET', /^\/api\/v1\/x\/accounts\/[^/]+\/?$/u],
  ['POST', /^\/api\/v1\/x\/accounts\/[^/]+\/reauth\/?$/u],
];

const SUPPORT_TICKET_METHODS: ReadonlySet<string> = new Set(['GET', 'PATCH', 'POST']);

function isSupportTicketPath(method: string, path: string): boolean {
  return SUPPORT_TICKET_METHODS.has(method)
    && (path === SUPPORT_TICKETS_PREFIX || path.startsWith(`${SUPPORT_TICKETS_PREFIX}/`));
}

function isProhibitedRequest(method: string, path: string): boolean {
  const upperMethod = method.toUpperCase();
  const matchesStaticPath = PROHIBITED_PATHS.some(
    ([blockedMethod, blockedPath]) => upperMethod === blockedMethod && path === blockedPath,
  );
  const matchesPattern = PROHIBITED_PATH_PATTERNS.some(
    ([blockedMethod, pattern]) => upperMethod === blockedMethod && pattern.test(path),
  );
  return matchesStaticPath || matchesPattern || isSupportTicketPath(upperMethod, path);
}

function validateRequestPath(method: string, path: string): void {
  if (!path.startsWith(API_V1_PREFIX)) {
    throw new Error(`Path must start with /api/v1/ but got: ${path}`);
  }
  if (isProhibitedRequest(method, path)) {
    throw new Error(
      'Agent-prohibited endpoint. Account connection and re-authentication must be done through the Xquik dashboard at dashboard.xquik.com, not through the agent.',
    );
  }
}

function createProxiedRequest(
  baseUrl: string,
  credential: string,
  fetchFunction: FetchFunction = fetch,
): RequestFunction {
  return async (path: string, options?: Readonly<RequestOptions>): Promise<unknown> => {
    const method = options?.method ?? 'GET';
    validateRequestPath(method, path);
    const hasBody = options?.body !== undefined;
    const response = await fetchFunction(buildFetchUrl(baseUrl, path, options?.query), {
      ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
      headers: buildFetchHeaders(credential, hasBody),
      method,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    const json: unknown = await response.json();
    if (!response.ok) {
      throw new Error(
        `API request failed: ${String(response.status)} ${response.statusText} - ${JSON.stringify(json)}`,
      );
    }
    return json;
  };
}

export { buildAuthHeader, buildFetchHeaders, buildFetchUrl, createProxiedRequest, isProhibitedRequest };
