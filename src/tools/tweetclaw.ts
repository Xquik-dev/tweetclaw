// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { createProxiedRequest } from '../request.js';
import { resolveCatalogRequest, specEndpoints } from './catalog.js';
import { errorResult, successResult } from './result.js';
import type { FetchFunction, RequestFunction, ToolResult, TweetclawParams } from '../types.js';

const EXECUTE_DESCRIPTION = `Invoke one Xquik API endpoint from the bundled TweetClaw catalog.

Use "explore" first to find the endpoint, then call this tool with structured parameters:
- path: concrete /api/v1/... path
- method: GET, POST, PATCH, PUT, or DELETE
- query: query parameters as an object
- body: JSON request body
- idempotencyKey: unique key required for X write actions

Auth is injected automatically. Never pass API keys, signing keys, passwords, cookies, or TOTP secrets.

## Important rules
- Only endpoints listed in the bundled catalog can be invoked. Unknown paths are rejected.
- The plugin only calls the configured Xquik API base URL and only /api/v1 paths.
- Account connection, re-authentication, API-key administration, subscription checkout, credit top-up, and support-ticket actions are dashboard-only.
- TWEET ACTIONS: SENDING a tweet ("tweet this", "post this") uses POST /api/v1/x/tweets. DRAFTING a tweet ("help me write", "compose") uses the compose flow.
- WRITE ACTIONS: Show the exact endpoint and payload to the user before approval. All write-like calls trigger an OpenClaw approval prompt.
- IDEMPOTENCY: Generate one unique key for each intended X write. Reuse it only to retry the exact same write.
- MPP MODE: When configured with a signing key and no API key, only MPP-eligible read endpoints are allowed.
- CURRENT EVENTS: Use /api/v1/radar for curated trends.

## Example: Send a tweet
{
  "path": "/api/v1/x/tweets",
  "method": "POST",
  "idempotencyKey": "post-2026-07-22-001",
  "body": { "account": "@myaccount", "text": "Hello world!" }
}

## Example: Search tweets
{
  "path": "/api/v1/x/tweets/search",
  "method": "GET",
  "query": { "q": "AI agents", "limit": 50 }
}`;

const EXECUTION_TIMEOUT_MS = 30_000;
const MS_PER_SECOND = 1000;

function createExecutionTimeout(timeoutMs: number): {
  readonly cancel: () => void;
  readonly promise: Promise<never>;
} {
  const controller = new AbortController();
  const promise = new Promise<never>((_resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Execution timed out after ${String(timeoutMs / MS_PER_SECOND)}s`));
    }, timeoutMs);
    controller.signal.addEventListener('abort', () => { clearTimeout(timeoutId); }, { once: true });
  });

  return {
    cancel: (): void => { controller.abort(); },
    promise,
  };
}

interface TweetclawOptions {
  readonly baseUrl: string;
  readonly credential: string;
  readonly fetchFunction?: FetchFunction | undefined;
  readonly mppMode?: boolean | undefined;
  readonly params: Readonly<TweetclawParams>;
  readonly timeoutMs?: number | undefined;
}

async function handleTweetclaw(options: Readonly<TweetclawOptions>): Promise<ToolResult> {
  const {
    baseUrl,
    credential,
    fetchFunction,
    mppMode = false,
    params,
    timeoutMs = EXECUTION_TIMEOUT_MS,
  } = options;

  try {
    const requestInfo = resolveCatalogRequest(params, { mppMode });
    const request: RequestFunction = createProxiedRequest(baseUrl, credential, fetchFunction);
    const timeout = createExecutionTimeout(timeoutMs);

    try {
      const result: unknown = await Promise.race([
        request(requestInfo.path, {
          ...(requestInfo.body === undefined ? {} : { body: requestInfo.body }),
          ...(requestInfo.idempotencyKey === undefined
            ? {}
            : { idempotencyKey: requestInfo.idempotencyKey }),
          method: requestInfo.method,
          ...(requestInfo.query === undefined ? {} : { query: requestInfo.query }),
        }),
        timeout.promise,
      ]);

      return successResult(result);
    } finally {
      timeout.cancel();
    }
  } catch (error: unknown) {
    return errorResult(error);
  }
}

export { EXECUTE_DESCRIPTION, handleTweetclaw, specEndpoints };
