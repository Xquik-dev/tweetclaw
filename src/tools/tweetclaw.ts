// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { createProxiedRequest } from '../request.js';
import { resolveCatalogRequest, specEndpoints } from './catalog.js';
import { errorResult, successResult } from './result.js';
import type { FetchFunction, RequestFunction, ToolResult, TweetclawParams } from '../types.js';

const EXECUTE_DESCRIPTION = `Call one Xquik API endpoint from TweetClaw's catalog.

Use "explore" first. Then provide:
- path: concrete /api/v1/... path
- method: GET, POST, PATCH, PUT, or DELETE
- query: query parameters as an object
- body: JSON request body
- idempotencyKey: unique key required for X write actions

TweetClaw injects auth. Never pass keys, passwords, cookies, or TOTP secrets.

Rules:
- Only catalog-listed /api/v1 paths on the configured Xquik base URL can run.
- Use dashboard.xquik.com for accounts, API keys, billing, and support.
- "Tweet this" uses POST /api/v1/x/tweets. "Draft this" uses the compose flow.
- Show the exact endpoint and payload before approval. Write-like calls require approval.
- Create one idempotency key per X write. Reuse it only for an identical retry.
- MPP mode permits only MPP-supported reads.
- Use /api/v1/radar for current events.

Example: send a tweet
{
  "path": "/api/v1/x/tweets",
  "method": "POST",
  "idempotencyKey": "post-2026-07-22-001",
  "body": { "account": "@myaccount", "text": "Hello world!" }
}

Example: search tweets
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
      reject(new Error(`Request timed out after ${String(timeoutMs / MS_PER_SECOND)} seconds. Narrow the request or retry.`));
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
