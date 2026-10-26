// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { handleXStatus } from './commands/xstatus.js';
import { handleXTrends } from './commands/xtrends.js';
import { initMpp } from './mpp.js';
import { createProxiedRequest } from './request.js';
import { createEventPoller } from './services/event-poller.js';
import { normalizeMethod, requestNeedsApproval, specEndpoints } from './tools/catalog.js';
import { handleExplore, SEARCH_DESCRIPTION } from './tools/explore.js';
import { errorResult } from './tools/result.js';
import { EXECUTE_DESCRIPTION, handleTweetclaw } from './tools/tweetclaw.js';
import type {
  ExploreParams,
  FetchFunction,
  PayingFetch,
  PluginConfig,
  ToolResult,
  TweetclawParams,
} from './types.js';
import type {
  AnyAgentTool,
  OpenClawPluginApi,
  PluginCommandContext,
  PluginLogger,
} from 'openclaw/plugin-sdk/plugin-entry';

interface PollerEvent {
  readonly eventType?: string;
}

function isPollerEvent(value: unknown): value is PollerEvent {
  return typeof value === 'object' && value !== null;
}

const DEFAULT_POLLING_INTERVAL_SECONDS = 60;
const MIN_POLLING_INTERVAL_SECONDS = 5;
const DEFAULT_BASE_URL = 'https://xquik.com';
const SENSITIVE_SCHEMA_KEY = 'x-sensitive';
const MPP_ROUTE_COUNT = specEndpoints.filter((endpoint) => endpoint.mpp !== undefined).length;
const MISSING_CREDENTIALS_MESSAGE =
  'TweetClaw is not configured. Add an Xquik API key for account-backed workflows or a Tempo signing key for MPP reads before live calls.';

const CONFIG_SCHEMA = {
  additionalProperties: false,
  properties: {
    apiKey: {
      description:
        'Xquik API key for account-backed automation and prepaid public read routes. Not affiliated with X Corp.',
      minLength: 1,
      type: 'string',
      [SENSITIVE_SCHEMA_KEY]: true,
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
        'Optional MPP signing key for direct read routes. OpenClaw stores it as sensitive config and hides it from the agent. Not affiliated with X Corp.',
      pattern: '^0x[0-9a-fA-F]{64}$',
      type: 'string',
      [SENSITIVE_SCHEMA_KEY]: true,
    },
  },
  type: 'object',
};

type CommandContext = Readonly<Partial<Pick<PluginCommandContext, 'args' | 'commandBody' | 'senderId'>>>;

interface BeforeToolCallEvent {
  readonly params?: unknown;
  readonly toolName?: string;
}

interface BeforeToolCallResult {
  readonly requireApproval: {
    readonly allowedDecisions: Array<'allow-once' | 'deny'>;
    readonly description: string;
    readonly pluginId: string;
    readonly severity: 'warning';
    readonly timeoutBehavior: 'deny';
    readonly timeoutMs: number;
    readonly title: string;
  };
}

type BeforeToolCallHandler = (
  event: BeforeToolCallEvent,
) => BeforeToolCallResult | Promise<BeforeToolCallResult | undefined> | undefined;

type BeforeToolCallRegistration = (
  name: 'before_tool_call',
  handler: BeforeToolCallHandler,
  options?: { readonly priority?: number },
) => void;

type CredentialMode = 'api-key' | 'mpp' | 'none';
type XquikRequest = ReturnType<typeof createProxiedRequest>;
type MppInitialization = Promise<Error | PayingFetch | undefined>;

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
  readonly logger: Readonly<PluginLogger>;
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
    tool: Readonly<Pick<AnyAgentTool, 'description' | 'label' | 'name'>> & {
      readonly execute: (toolCallId: string, params: unknown) => Promise<ToolResult>;
      readonly parameters: Readonly<AnyAgentTool['parameters']>;
    },
    options?: { readonly name?: string; readonly optional?: boolean },
  ) => void;
  readonly on?: BeforeToolCallRegistration;
  readonly registerHook?: BeforeToolCallRegistration;
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
  return typeof value !== 'object' || value === null ? undefined : Object.fromEntries(Object.entries(value));
}

function normalizePollingInterval(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(Math.trunc(value), MIN_POLLING_INTERVAL_SECONDS)
    : undefined;
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
  return params.path.length === 0 ? undefined : params;
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
  return signingValue === undefined
    ? { accountValue: '', mode: 'none', signingValue: '' }
    : { accountValue: '', mode: 'mpp', signingValue };
}

async function initializeMpp(
  api: OpenClawApi,
  signingValue: string,
  baseFetch: FetchFunction,
): Promise<Error | PayingFetch> {
  try {
    const payFor = await initMpp(signingValue, baseFetch);
    api.logger.info(`TweetClaw: MPP ready for ${String(MPP_ROUTE_COUNT)} direct read routes.`);
    return payFor;
  } catch {
    api.logger.error('TweetClaw: MPP setup failed. Check config and optional packages.');
    return new Error('Check the signing key and install mppx and viem.');
  }
}

async function readyPayer(initialization: MppInitialization): Promise<PayingFetch | undefined> {
  const state = await initialization;
  if (state instanceof Error) {
    throw new Error(`MPP unavailable. ${state.message}`);
  }
  return state;
}

async function registerMppMode(
  api: OpenClawApi,
  credentialMode: CredentialMode,
  signingValue: string,
  baseFetch: FetchFunction,
): MppInitialization {
  if (credentialMode !== 'mpp') return undefined;

  api.logger.info(`TweetClaw: Direct MPP mode enabled for ${String(MPP_ROUTE_COUNT)} read routes.`);
  return initializeMpp(api, signingValue, baseFetch);
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
      label: 'Explore Xquik endpoints',
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
        let payFor: PayingFetch | undefined;
        try {
          payFor = await readyPayer(options.mppInitialization);
        } catch (error: unknown) {
          return errorResult(error);
        }
        return handleTweetclaw({
          baseUrl: options.baseUrl,
          credential: options.credential,
          fetchFunction: options.fetchFunction,
          mppMode: options.credentialMode === 'mpp',
          params: asTweetclawParams(params),
          payFor,
        });
      },
      name: 'tweetclaw',
      label: 'Call Xquik',
      parameters: TWEETCLAW_PARAMETERS,
    },
    { name: 'tweetclaw', optional: true },
  );
}

function registerCommands(
  api: OpenClawApi,
  credentialMode: CredentialMode,
  createRequest: (payFor?: PayingFetch) => XquikRequest,
  mppInitialization: MppInitialization,
): void {
  if (credentialMode === 'api-key') {
    api.registerCommand({
      description: 'Show Xquik account status & usage',
      handler: async () => {
        const text = await handleXStatus(createRequest());
        return { text };
      },
      name: 'xstatus',
    });
  }

  api.registerCommand({
    acceptsArgs: true,
    description: 'Show trending topics on X',
    handler: async ({ args }) => {
      const request = createRequest(await readyPayer(mppInitialization));
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

  const baseFetch: FetchFunction = async (input, init) => (fetchFunction ?? globalThis.fetch)(input, init);
  const mppInitialization = registerMppMode(api, credential.mode, credential.signingValue, baseFetch);
  const createRequest = (payFor?: PayingFetch): XquikRequest =>
    createProxiedRequest(baseUrl, credential.accountValue, fetchFunction, payFor);
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
  registerCommands(api, credential.mode, createRequest, mppInitialization);
  registerPoller(api, config, credential.mode, createRequest());
  api.logger.info('TweetClaw: Plugin registered.');
}

type PluginHost = Readonly<Pick<OpenClawPluginApi, 'on' | 'registerCommand' | 'registerService' | 'registerTool'>> & {
  readonly logger: Readonly<PluginLogger>;
  readonly pluginConfig?: Readonly<Record<string, unknown>>;
};

function registerHost(api: PluginHost): void {
  register({
    logger: api.logger,
    ...(api.pluginConfig === undefined ? {} : { pluginConfig: api.pluginConfig }),
    registerCommand: api.registerCommand,
    registerService: api.registerService,
    registerTool: api.registerTool,
    on: (name, handler, options): void => { api.on(name, handler, options); },
  });
}

const plugin: ReturnType<typeof definePluginEntry> = definePluginEntry({
  configSchema: { jsonSchema: CONFIG_SCHEMA },
  description: 'Twitter bot plugin that runs on Xquik',
  id: 'tweetclaw',
  name: 'TweetClaw',
  register: registerHost,
});

export { register, registerHost };
export default plugin;
