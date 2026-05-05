import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { handleXStatus } from './commands/xstatus.js';
import { handleXTrends } from './commands/xtrends.js';
import { initMpp } from './mpp.js';
import { createProxiedRequest } from './request.js';
import { createEventPoller } from './services/event-poller.js';
import { normalizeMethod, requestNeedsApproval } from './tools/catalog.js';
import { handleExplore, SEARCH_DESCRIPTION } from './tools/explore.js';
import { EXECUTE_DESCRIPTION, handleTweetclaw } from './tools/tweetclaw.js';
import type { ExploreParams, FetchFunction, PluginConfig, TweetclawParams } from './types.js';

interface PollerEvent {
  readonly eventType?: string;
  readonly xUsername?: string;
}

function isPollerEvent(value: unknown): value is PollerEvent {
  return typeof value === 'object' && value !== null;
}

function isPluginConfig(value: unknown): value is PluginConfig {
  if (typeof value !== 'object' || value === null) return false;
  return 'apiKey' in value || 'tempoSigningKey' in value;
}

const DEFAULT_POLLING_INTERVAL_SECONDS = 60;

const CONFIG_SCHEMA = {
  additionalProperties: false,
  anyOf: [
    { required: ['apiKey'] },
    { required: ['tempoSigningKey'] },
  ],
  properties: {
    apiKey: {
      description: 'Xquik API key (get one at dashboard.xquik.com). Required for account-backed X automation.',
      minLength: 1,
      type: 'string',
    },
    baseUrl: { default: 'https://xquik.com', type: 'string' },
    pollingEnabled: { default: true, type: 'boolean' },
    pollingInterval: {
      default: 60,
      description: 'Event polling interval in seconds',
      type: 'number',
    },
    tempoSigningKey: {
      description: 'MPP signing key for pay-per-use mode. No account needed. 32 read-only X-API endpoints.',
      minLength: 1,
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
    category: { description: 'Endpoint category filter', type: 'string' },
    free: { description: 'Filter by free or paid endpoints', type: 'boolean' },
    limit: { default: 25, description: 'Maximum endpoint descriptors to return', maximum: 100, minimum: 1, type: 'number' },
    method: { description: 'HTTP method filter', enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], type: 'string' },
    mpp: { description: 'Filter by MPP eligibility', type: 'boolean' },
    path: { description: 'Exact or partial API path filter', type: 'string' },
    query: { description: 'Keyword search across endpoint metadata', type: 'string' },
  },
  type: 'object',
};

const TWEETCLAW_PARAMETERS = {
  additionalProperties: false,
  properties: {
    body: { description: 'JSON request body', type: ['object', 'array', 'string', 'number', 'boolean', 'null'] },
    method: { default: 'GET', description: 'HTTP method', enum: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'], type: 'string' },
    path: { description: 'Concrete /api/v1/... endpoint path from the catalog', type: 'string' },
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
  const { body, method, path, query: rawQuery } = value;
  if (typeof path !== 'string') {
    return { path: '' };
  }

  const query = asQueryParams(rawQuery);
  return {
    ...(body === undefined ? {} : { body }),
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
      'TweetClaw: OpenClaw approval hooks are unavailable. Keep explicit user approval before write actions.',
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
          description:
            'TweetClaw is about to invoke an endpoint that can change X accounts, create jobs, or expose private data. Review the tool call before allowing it.',
          pluginId: 'tweetclaw',
          severity: 'warning',
          timeoutBehavior: 'deny',
          timeoutMs: 60_000,
          title: 'Approve TweetClaw Action',
        },
      };
    },
    { priority: 50 },
  );
}

function register(api: OpenClawApi, fetchFunction?: FetchFunction): void {
  const config: unknown = api.pluginConfig;
  if (!isPluginConfig(config)) {
    api.logger.warn(
      'TweetClaw: No API key or signing key configured. See the README for setup instructions.',
    );
    return;
  }

  const { apiKey, baseUrl = 'https://xquik.com', tempoSigningKey } = config;
  const isMppMode = apiKey === undefined && tempoSigningKey !== undefined;
  const credential = apiKey ?? '';

  if (isMppMode) {
    void (async (): Promise<void> => {
      try {
        await initMpp(tempoSigningKey);
        api.logger.info('TweetClaw: MPP initialized - payment account ready');
      } catch (error: unknown) {
        api.logger.error(`TweetClaw: MPP init failed - ${error instanceof Error ? error.message : String(error)}`);
      }
    })();
    api.logger.info('TweetClaw: MPP mode - pay-per-use (32 X-API endpoints, no subscription needed)');
  }

  const request = createProxiedRequest(baseUrl, credential, fetchFunction);
  registerWriteApprovalHook(api);

  // --- Tools (2-tool approach, execute inside tool object) ---
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
      execute: async (_toolCallId, params) => handleTweetclaw({
        apiKey: credential,
        baseUrl,
        fetchFunction,
        mppMode: isMppMode,
        params: asTweetclawParams(params),
      }),
      name: 'tweetclaw',
      parameters: TWEETCLAW_PARAMETERS,
    },
    { name: 'tweetclaw', optional: true },
  );

  // --- Commands (instant, no LLM) ---
  if (!isMppMode) {
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
      const text = await handleXTrends(request, args);
      return { text };
    },
    name: 'xtrends',
  });

  // --- Background event poller (requires API key, not available in MPP mode) ---
  const { pollingEnabled, pollingInterval } = config;
  if (!isMppMode && pollingEnabled !== false) {
    const poller = createEventPoller({
      intervalSeconds: pollingInterval ?? DEFAULT_POLLING_INTERVAL_SECONDS,
      onEvents: (events) => {
        for (const event of events) {
          const eventType: string = isPollerEvent(event) && typeof event['eventType'] === 'string'
            ? event['eventType']
            : 'unknown';
          const username: string = isPollerEvent(event) && typeof event['xUsername'] === 'string'
            ? event['xUsername']
            : '';
          api.logger.info(`[TweetClaw] ${eventType} from @${username}`);
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

  api.logger.info('TweetClaw: Plugin registered successfully');
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
