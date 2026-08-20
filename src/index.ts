// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { handleXStatus } from './commands/xstatus.js';
import { handleXTrends } from './commands/xtrends.js';
import { initMpp } from './mpp.js';
import { createProxiedRequest } from './request.js';
import { createEventPoller } from './services/event-poller.js';
import { normalizeMethod, requestNeedsApproval } from './tools/catalog.js';
import { handleExplore, SEARCH_DESCRIPTION } from './tools/explore.js';
import { errorResult } from './tools/result.js';
import { EXECUTE_DESCRIPTION, handleTweetclaw } from './tools/tweetclaw.js';
import type { ExploreParams, FetchFunction, PluginConfig, TweetclawParams } from './types.js';

interface PollerEvent {
  readonly eventType?: string;
}

function isPollerEvent(value: unknown): value is PollerEvent {
  return typeof value === 'object' && value !== null;
}

const DEFAULT_POLLING_INTERVAL_SECONDS = 60;
const MIN_POLLING_INTERVAL_SECONDS = 5;
const DEFAULT_BASE_URL = 'https://xquik.com';
const MISSING_CREDENTIALS_MESSAGE =
  'TweetClaw is not configured. Add an Xquik API key for account-backed workflows or a Tempo signing key for MPP reads before live calls.';

const CONFIG_SCHEMA = {
  additionalProperties: false,
  properties: {
    apiKey: {
      description:
        'Xquik API key for account-backed automation and 33 prepaid public read routes. Not affiliated with X Corp.',
      minLength: 1,
      type: 'string',
    },
    baseUrl: {
      default: 'https://xquik.com',
      description: 'HTTPS base URL for Xquik or a compatible self-hosted instance.',
      pattern: '^https://',
      type: 'string',
    },
    pollingEnabled: { default: true, type: 'boolean' },
    pollingInterval: {
      default: 60,
      description: 'Seconds between event checks',
      minimum: 5,
      type: 'number',
    },
    tempoSigningKey: {
      description:
        'Optional read-only MPP signing key for 7 direct routes. OpenClaw stores it as sensitive config and hides it from the agent. Not affiliated with X Corp.',
      pattern: '^0x[0-9a-fA-F]{64}$',
      type: 'string',
    },
  },
  type: 'object',
};

interface ToolResult {
  readonly content: ReadonlyArray<{ readonly text: string; readonly type: string }>;
  readonly isError?: true;
}

interface CommandContext {
  readonly args?: string;
  readonly commandBody?: string;
  readonly senderId?: string;
}

interface BeforeToolCallEvent {
  readonly params?: unknown;
  readonly toolName?: string;
}

interface ToolApprovalRequest {
  readonly allowedDecisions?: readonly ['allow-once', 'deny'];
  readonly description: string;
  readonly pluginId?: string;
  readonly severity?: 'critical' | 'info' | 'warning';
  readonly timeoutBehavior?: 'allow' | 'deny';
  readonly timeoutMs?: number;
  readonly title: string;
}

interface BeforeToolCallResult {
  readonly requireApproval?: ToolApprovalRequest;
}

type BeforeToolCallHandler = (
  event: BeforeToolCallEvent,
) => BeforeToolCallResult | Promise<BeforeToolCallResult | undefined> | undefined;

type CredentialMode = 'api-key' | 'mpp' | 'none';
type XquikRequest = ReturnType<typeof createProxiedRequest>;
type MppInitialization = Promise<Error | undefined>;

interface RegisterToolsOptions {
  readonly baseUrl: string;
  readonly credential: string;
  readonly credentialMode: CredentialMode;
  readonly fetchFunction?: FetchFunction;
  readonly mppInitialization: MppInitialization;
}

interface CredentialState {
  readonly accountValue: string;
  readonly mode: CredentialMode;
  readonly signingValue: string;
}

interface OpenClawApi {
  readonly logger: {
    readonly debug?: (message: string) => void;
    readonly error: (message: string) => void;
    readonly info: (message: string) => void;
    readonly warn: (message: string) => void;
  };
  readonly pluginConfig?: Readonly<Record<string, unknown>>;
  readonly registerCommand: (options: {
    readonly acceptsArgs?: boolean;
    readonly description: string;
    readonly handler: (context: CommandContext) => Promise<{ readonly text: string }>;
    readonly name: string;
  }) => void;
  readonly registerService: (options: {
    readonly id: string;
    readonly start: (context?: unknown) => void;
    readonly stop?: (context?: unknown) => void;
  }) => void;
  readonly registerTool: (
    tool: {
      readonly description: string;
      readonly execute: (toolCallId: string, params: unknown) => Promise<ToolResult>;
      readonly name: string;
      readonly parameters: unknown;
    },
    options?: { readonly name?: string; readonly optional?: boolean },
  ) => void;
  readonly on?: (
    name: 'before_tool_call',
    handler: BeforeToolCallHandler,
    options?: { readonly priority?: number },
  ) => void;
  readonly registerHook?: (
    name: 'before_tool_call',
    handler: BeforeToolCallHandler,
    options?: { readonly priority?: number },
  ) => void;
}

const EXPLORE_PARAMETERS = {
  properties: {
    category: { description: 'Filter by endpoint category', type: 'string' },
    free: { description: 'Filter by free or paid endpoints', type: 'boolean' },
    limit: { default: 25, description: 'Maximum results', maximum: 100, minimum: 1, type: 'number' },
    method: { description: 'HTTP method filter', enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], type: 'string' },
    mpp: { description: 'Filter by MPP support', type: 'boolean' },
    path: { description: 'Exact or partial API path filter', type: 'string' },
    query: { description: 'Search summaries, paths, response fields, and parameters', type: 'string' },
  },
  type: 'object',
};

const TWEETCLAW_PARAMETERS = {
  additionalProperties: false,
  properties: {
    body: {
      description: 'JSON request body',
      items: {},
      type: ['object', 'array', 'string', 'number', 'boolean', 'null'],
    },
    idempotencyKey: {
      description: 'Unique 1-255 character key for an X write. Reuse it only for an identical retry.',
      maxLength: 255,
      minLength: 1,
      pattern: '^[!-~]+$',
      type: 'string',
    },
    method: { default: 'GET', description: 'HTTP method', enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], type: 'string' },
    path: { description: 'Catalog-listed /api/v1/... endpoint path', type: 'string' },
    query: {
      additionalProperties: { type: ['string', 'number', 'boolean'] },
      description: 'Query parameters',
      type: 'object',
    },
  },
  required: ['path'],
  type: 'object',
};

function asObject(value: unknown): Readonly<Record<string, unknown>> | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  return Object.fromEntries(Object.entries(value));
}

function normalizePollingInterval(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }
  return Math.max(Math.trunc(value), MIN_POLLING_INTERVAL_SECONDS);
}

function asPluginConfig(value: unknown): PluginConfig {
  const config = asObject(value);
  if (config === undefined) return {};

  const { apiKey, baseUrl, pollingEnabled, pollingInterval, tempoSigningKey } = config;
  const normalizedPollingInterval = normalizePollingInterval(pollingInterval);
  return {
    ...(typeof apiKey === 'string' && apiKey.length > 0 ? { apiKey } : {}),
    ...(typeof baseUrl === 'string' && baseUrl.length > 0 ? { baseUrl } : {}),
    ...(typeof pollingEnabled === 'boolean' ? { pollingEnabled } : {}),
    ...(normalizedPollingInterval === undefined ? {} : { pollingInterval: normalizedPollingInterval }),
    ...(typeof tempoSigningKey === 'string' && tempoSigningKey.length > 0 ? { tempoSigningKey } : {}),
  };
}

function asExploreParams(params: unknown): Readonly<ExploreParams> {
  const value = asObject(params);
  if (value === undefined) return {};
  const { category, free, limit, method, mpp, path, query } = value;

  return {
    ...(typeof category === 'string' ? { category } : {}),
    ...(typeof free === 'boolean' ? { free } : {}),
    ...(typeof limit === 'number' ? { limit } : {}),
    ...(typeof method === 'string' ? { method } : {}),
    ...(typeof mpp === 'boolean' ? { mpp } : {}),
    ...(typeof path === 'string' ? { path } : {}),
    ...(typeof query === 'string' ? { query } : {}),
  };
}

function asQueryParams(value: unknown): Readonly<Record<string, boolean | number | string>> | undefined {
  const query = asObject(value);
  if (query === undefined) return undefined;

  const entries = Object.entries(query).filter(
    (entry): entry is [string, boolean | number | string] =>
      ['boolean', 'number', 'string'].includes(typeof entry[1]),
  );
  return Object.fromEntries(entries);
}

function asTweetclawParams(params: unknown): Readonly<TweetclawParams> {
  const value = asObject(params);
  if (value === undefined) {
    return { path: '' };
  }
  const { body, idempotencyKey, method, path, query: rawQuery } = value;
  if (typeof path !== 'string') {
    return { path: '' };
  }

  const query = asQueryParams(rawQuery);
  return {
    ...(body === undefined ? {} : { body }),
    ...(typeof idempotencyKey === 'string' ? { idempotencyKey } : {}),
    ...(typeof method === 'string' ? { method } : {}),
    path,
    ...(query === undefined ? {} : { query }),
  };
}

function toolCallParams(event: BeforeToolCallEvent): Readonly<TweetclawParams> | undefined {
  const params = asTweetclawParams(event.params);
  if (params.path.length === 0) {
    return undefined;
  }
  return params;
}

function requiresTweetclawApproval(params: Readonly<TweetclawParams>): boolean {
  return requestNeedsApproval(normalizeMethod(params.method), params.path);
}

function registerWriteApprovalHook(api: OpenClawApi): void {
  const registerHook = api.on ?? api.registerHook;
  if (registerHook === undefined) {
    api.logger.warn(
      'TweetClaw: Approval hook unavailable. Require explicit approval before risky calls.',
    );
    return;
  }

  registerHook.call(
    api,
    'before_tool_call',
    (event): BeforeToolCallResult | undefined => {
      if (event.toolName !== 'tweetclaw') {
        return undefined;
      }

      const params = toolCallParams(event);
      if (params === undefined || !requiresTweetclawApproval(params)) {
        return undefined;
      }

      return {
        requireApproval: {
          allowedDecisions: ['allow-once', 'deny'],
          description:
            'This call may spend credits, change X, create a job, or expose private data. Review it before allowing.',
          pluginId: 'tweetclaw',
          severity: 'warning',
          timeoutBehavior: 'deny',
          timeoutMs: 60_000,
          title: 'Approve TweetClaw action',
        },
      };
    },
    { priority: 50 },
  );
}

function resolveCredentialState(config: Readonly<PluginConfig>): CredentialState {
  const accountValue = config.apiKey;
  if (accountValue !== undefined) {
    return { accountValue, mode: 'api-key', signingValue: '' };
  }

  const signingValue = config.tempoSigningKey;
  if (signingValue !== undefined) {
    return { accountValue: '', mode: 'mpp', signingValue };
  }

  return { accountValue: '', mode: 'none', signingValue: '' };
}

async function initializeMpp(api: OpenClawApi, signingValue: string): Promise<Error | undefined> {
  try {
    await initMpp(signingValue);
    api.logger.info('TweetClaw: MPP ready for 7 direct read routes.');
    return undefined;
  } catch {
    api.logger.error('TweetClaw: MPP setup failed. Check config and optional packages.');
    return new Error('Check the signing key and install mppx and viem.');
  }
}

async function waitForMppInitialization(initialization: MppInitialization): Promise<void> {
  const error = await initialization;
  if (error !== undefined) {
    throw new Error(`MPP unavailable. ${error.message}`);
  }
}

async function registerMppMode(
  api: OpenClawApi,
  credentialMode: CredentialMode,
  signingValue: string,
): MppInitialization {
  if (credentialMode !== 'mpp') return undefined;

  api.logger.info('TweetClaw: Direct MPP mode enabled for 7 read routes.');
  return initializeMpp(api, signingValue);
}

function registerTools(api: OpenClawApi, options: RegisterToolsOptions): void {
  api.registerTool(
    {
      description: SEARCH_DESCRIPTION,
      execute: async (_toolCallId, params) => {
        await Promise.resolve();
        return handleExplore(asExploreParams(params));
      },
      name: 'explore',
      parameters: EXPLORE_PARAMETERS,
    },
    { name: 'explore' },
  );

  api.registerTool(
    {
      description: EXECUTE_DESCRIPTION,
      execute: async (_toolCallId, params) => {
        if (options.credentialMode === 'none') {
          await Promise.resolve();
          return errorResult(new Error(MISSING_CREDENTIALS_MESSAGE));
        }
        try {
          await waitForMppInitialization(options.mppInitialization);
        } catch (error: unknown) {
          return errorResult(error);
        }
        return handleTweetclaw({
          baseUrl: options.baseUrl,
          credential: options.credential,
          fetchFunction: options.fetchFunction,
          mppMode: options.credentialMode === 'mpp',
          params: asTweetclawParams(params),
        });
      },
      name: 'tweetclaw',
      parameters: TWEETCLAW_PARAMETERS,
    },
    { name: 'tweetclaw', optional: true },
  );
}

function registerCommands(
  api: OpenClawApi,
  credentialMode: CredentialMode,
  request: XquikRequest,
  mppInitialization: MppInitialization,
): void {
  if (credentialMode === 'api-key') {
    api.registerCommand({
      description: 'Show Xquik account status & usage',
      handler: async () => {
        const text = await handleXStatus(request);
        return { text };
      },
      name: 'xstatus',
    });
  }

  api.registerCommand({
    acceptsArgs: true,
    description: 'Show trending topics on X',
    handler: async ({ args }) => {
      await waitForMppInitialization(mppInitialization);
      const text = await handleXTrends(request, args, credentialMode === 'mpp');
      return { text };
    },
    name: 'xtrends',
  });
}

function registerPoller(api: OpenClawApi, config: Readonly<PluginConfig>, credentialMode: CredentialMode, request: XquikRequest): void {
  if (credentialMode !== 'api-key' || config.pollingEnabled === false) return;

  const poller = createEventPoller({
    intervalSeconds: config.pollingInterval ?? DEFAULT_POLLING_INTERVAL_SECONDS,
    onEvents: (events) => {
      for (const event of events) {
        const eventType: string = isPollerEvent(event) && typeof event['eventType'] === 'string'
          ? event['eventType']
          : 'unknown';
        api.logger.info(`TweetClaw: ${eventType} event received.`);
      }
    },
    request,
  });

  api.registerService({
    id: 'tweetclaw-poller',
    start: () => { poller.start(); },
    stop: () => { poller.stop(); },
  });
}

function register(api: OpenClawApi, fetchFunction?: FetchFunction): void {
  const config = asPluginConfig(api.pluginConfig);
  const { baseUrl = DEFAULT_BASE_URL } = config;
  const credential = resolveCredentialState(config);

  const mppInitialization = registerMppMode(api, credential.mode, credential.signingValue);
  const request = createProxiedRequest(baseUrl, credential.accountValue, fetchFunction);
  registerWriteApprovalHook(api);

  if (credential.mode === 'none') {
    api.logger.warn(
      'TweetClaw: No API key or signing key configured. Add one before live calls.',
    );
  }

  const toolOptions: RegisterToolsOptions = {
    baseUrl,
    credential: credential.accountValue,
    credentialMode: credential.mode,
    ...(fetchFunction === undefined ? {} : { fetchFunction }),
    mppInitialization,
  };
  registerTools(api, toolOptions);
  registerCommands(api, credential.mode, request, mppInitialization);
  registerPoller(api, config, credential.mode, request);
  api.logger.info('TweetClaw: Plugin registered.');
}

const plugin = definePluginEntry({
  configSchema: CONFIG_SCHEMA,
  description: 'Structured X/Twitter automation through Xquik',
  id: 'tweetclaw',
  name: 'TweetClaw',
  register,
});

export { register };
export default plugin;
