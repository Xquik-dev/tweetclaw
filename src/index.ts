import { handleXStatus } from './commands/xstatus.js';
import { handleXTrends } from './commands/xtrends.js';
import { initMpp } from './mpp.js';
import { createProxiedRequest } from './request.js';
import { createEventPoller } from './services/event-poller.js';
import { handleExplore, SEARCH_DESCRIPTION } from './tools/explore.js';
import { EXECUTE_DESCRIPTION, handleTweetclaw } from './tools/tweetclaw.js';
import type { FetchFunction, PluginConfig } from './types.js';

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
      readonly execute: (toolCallId: string, params: { readonly code: string }) => Promise<ToolResult>;
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

const CODE_PARAMETER = {
  properties: {
    code: { description: 'Async arrow function to execute', type: 'string' },
  },
  required: ['code'],
  type: 'object',
};

const WRITE_METHOD_PATTERN = /\bmethod\s*:\s*['"`](?:DELETE|PATCH|POST|PUT)['"`]/iu;
const HIGH_IMPACT_PATH_PATTERNS = [
  /\/api\/v1\/credits\/(?:quick-topup|topup)/u,
  /\/api\/v1\/draws/u,
  /\/api\/v1\/extractions/u,
  /\/api\/v1\/monitors/u,
  /\/api\/v1\/subscribe/u,
  /\/api\/v1\/webhooks/u,
  /\/api\/v1\/x\/communities/u,
  /\/api\/v1\/x\/dm\//u,
  /\/api\/v1\/x\/media/u,
  /\/api\/v1\/x\/profile/u,
  /\/api\/v1\/x\/tweets['"`]/u,
] as const;

function toolCallCode(event: BeforeToolCallEvent): string | undefined {
  if (typeof event.params !== 'object' || event.params === null) {
    return undefined;
  }

  const { code } = event.params as { readonly code?: unknown };
  return typeof code === 'string' ? code : undefined;
}

function requiresTweetclawApproval(code: string): boolean {
  if (WRITE_METHOD_PATTERN.test(code)) {
    return true;
  }

  return HIGH_IMPACT_PATH_PATTERNS.some((pattern) => pattern.test(code));
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

      const code = toolCallCode(event);
      if (code === undefined || !requiresTweetclawApproval(code)) {
        return undefined;
      }

      return {
        requireApproval: {
          description:
            'TweetClaw is about to run code that can change X accounts, create jobs, or start a checkout flow. Review the tool call before allowing it.',
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

export default function register(api: OpenClawApi, fetchFunction?: FetchFunction): void {
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
      execute: async (_toolCallId, { code }) => handleExplore(code),
      name: 'explore',
      parameters: CODE_PARAMETER,
    },
    { name: 'explore' },
  );

  api.registerTool(
    {
      description: EXECUTE_DESCRIPTION,
      execute: async (_toolCallId, { code }) => handleTweetclaw({ apiKey: credential, baseUrl, code, fetchFunction }),
      name: 'tweetclaw',
      parameters: CODE_PARAMETER,
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
          const eventType: string = isPollerEvent(event) && typeof event.eventType === 'string'
            ? event.eventType
            : 'unknown';
          const username: string = isPollerEvent(event) && typeof event.xUsername === 'string'
            ? event.xUsername
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
