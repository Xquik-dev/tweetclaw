import type { FetchFunction, RequestFunction, RequestOptions } from './types.js';

const FETCH_TIMEOUT_MS = 30_000;
const CONTENT_TYPE_HEADER = 'content-type';
const API_KEY_HEADER = 'x-api-key';
const AUTHORIZATION_HEADER = 'authorization';
const BEARER_PREFIX = 'Bearer ';
const API_KEY_PREFIX = 'xq_';
const API_V1_PREFIX = '/api/v1/';
const SUPPORT_TICKETS_PREFIX = '/api/v1/support/tickets';
const MAX_SAFE_ERROR_CODE_LENGTH = 80;

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

function createBaseUrl(baseUrl: string): URL {
  try {
    return new URL(baseUrl);
  } catch {
    throw new Error('Base URL must be a valid HTTPS URL.');
  }
}

function parseBaseUrl(baseUrl: string): URL {
  const url = createBaseUrl(baseUrl);
  if (url.protocol !== 'https:') {
    throw new Error('Base URL must use HTTPS.');
  }
  if (url.username.length > 0 || url.password.length > 0) {
    throw new Error('Base URL must not include credentials.');
  }
  return url;
}

function buildFetchUrl(baseUrl: string, path: string, query?: Readonly<Record<string, string>>): string {
  const url = new URL(path, parseBaseUrl(baseUrl));
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

function normalizeProhibitedPath(path: string): string {
  let end = path.length;
  while (end > 1 && path.charAt(end - 1) === '/') {
    end -= 1;
  }
  return end === path.length ? path : path.slice(0, end);
}

function isSupportTicketPath(method: string, path: string): boolean {
  return SUPPORT_TICKET_METHODS.has(method)
    && (path === SUPPORT_TICKETS_PREFIX || path.startsWith(`${SUPPORT_TICKETS_PREFIX}/`));
}

function isProhibitedRequest(method: string, path: string): boolean {
  const upperMethod = method.toUpperCase();
  const normalizedPath = normalizeProhibitedPath(path);
  const matchesStaticPath = PROHIBITED_PATHS.some(
    ([blockedMethod, blockedPath]) => upperMethod === blockedMethod && normalizedPath === blockedPath,
  );
  const matchesPattern = PROHIBITED_PATH_PATTERNS.some(
    ([blockedMethod, pattern]) => upperMethod === blockedMethod && pattern.test(normalizedPath),
  );
  return matchesStaticPath || matchesPattern || isSupportTicketPath(upperMethod, normalizedPath);
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
  if ('code' in value && typeof value.code === 'string') {
    return value.code;
  }
  return undefined;
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
  if (code === undefined) {
    return `API request failed: ${status}`;
  }
  return `API request failed: ${status} (${code})`;
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
    const json: unknown = await readResponseJson(response);
    if (!response.ok) {
      throw new Error(formatApiError(response, json));
    }
    return json;
  };
}

export { buildAuthHeader, buildFetchHeaders, buildFetchUrl, createProxiedRequest, isProhibitedRequest };
