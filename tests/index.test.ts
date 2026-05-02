import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import register from '../src/index.js';
import * as mpp from '../src/mpp.js';
import type { ToolResult } from '../src/types.js';

interface RegisteredTool {
  readonly description: string;
  readonly execute: (toolCallId: string, params: { readonly code: string }) => Promise<ToolResult>;
  readonly name: string;
  readonly parameters: unknown;
}

interface RegisteredCommand {
  readonly acceptsArgs?: boolean;
  readonly description: string;
  readonly handler: (context: { readonly args?: string }) => Promise<{ readonly text: string }>;
  readonly name: string;
}

interface RegisteredService {
  readonly id: string;
  readonly start: () => void;
  readonly stop?: () => void;
}

interface RegisteredHook {
  readonly handler: (
    event: {
      readonly params?: unknown;
      readonly toolName?: string;
    },
  ) =>
    | Promise<
        | {
            readonly requireApproval?: {
              readonly description: string;
              readonly severity?: string;
              readonly timeoutBehavior?: string;
              readonly title: string;
            };
          }
        | undefined
      >
    | {
        readonly requireApproval?: {
          readonly description: string;
          readonly severity?: string;
          readonly timeoutBehavior?: string;
          readonly title: string;
        };
      }
    | undefined;
  readonly name: string;
  readonly priority?: number;
}

function createMockFetch(response: unknown): typeof fetch {
  return async () => new Response(JSON.stringify(response));
}

function createMockApi(
  pluginConfig?: unknown,
  hookMode: 'none' | 'on' | 'registerHook' = 'on',
): {
  readonly api: Parameters<typeof register>[0];
  readonly commands: RegisteredCommand[];
  readonly hooks: RegisteredHook[];
  readonly infos: string[];
  readonly services: RegisteredService[];
  readonly tools: RegisteredTool[];
  readonly warnings: string[];
} {
  const tools: RegisteredTool[] = [];
  const commands: RegisteredCommand[] = [];
  const hooks: RegisteredHook[] = [];
  const services: RegisteredService[] = [];
  const warnings: string[] = [];
  const infos: string[] = [];
  const addHook = (
    name: string,
    handler: RegisteredHook['handler'],
    options?: { readonly priority?: number },
  ) => {
    if (options?.priority === undefined) {
      hooks.push({ handler, name });
      return;
    }
    hooks.push({ handler, name, priority: options.priority });
  };

  const baseApi: Parameters<typeof register>[0] = {
    logger: {
      error: () => {},
      info: (message: string) => { infos.push(message); },
      warn: (message: string) => { warnings.push(message); },
    },
    pluginConfig: pluginConfig as Readonly<Record<string, unknown>> | undefined,
    registerCommand: (options) => { commands.push(options); },
    registerService: (options) => { services.push(options); },
    registerTool: (tool) => { tools.push(tool); },
  };
  let api: Parameters<typeof register>[0] = baseApi;
  if (hookMode === 'on') {
    api = { ...baseApi, on: addHook };
  } else if (hookMode === 'registerHook') {
    api = { ...baseApi, registerHook: addHook };
  }

  return { api, commands, hooks, infos, services, tools, warnings };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('register', () => {
  it('warns and returns when no API key or signing key configured', () => {
    expect.assertions(3);
    const { api, tools, warnings } = createMockApi();
    register(api);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('No API key or signing key');
    expect(tools).toHaveLength(0);
  });

  it('registers 2 tools with valid API key', () => {
    expect.assertions(3);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    expect(tools).toHaveLength(2);
    expect(tools[0]?.name).toBe('explore');
    expect(tools[1]?.name).toBe('tweetclaw');
  });

  it('registers 2 commands', () => {
    expect.assertions(3);
    const { api, commands } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    expect(commands).toHaveLength(2);
    expect(commands[0]?.name).toBe('xstatus');
    expect(commands[1]?.name).toBe('xtrends');
  });

  it('registers event poller service by default', () => {
    expect.assertions(2);
    const { api, services } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    expect(services).toHaveLength(1);
    expect(services[0]?.id).toBe('tweetclaw-poller');
  });

  it('requires OpenClaw approval for write-like tweetclaw tool calls', async () => {
    expect.assertions(7);
    const { api, hooks } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const [hook] = hooks;
    const writeResult = await hook?.handler({
      params: {
        code: `async () => xquik.request('/api/v1/x/tweets', {
          method: 'POST',
          body: { account: '@demo', text: 'hello' }
        })`,
      },
      toolName: 'tweetclaw',
    });
    const readResult = await hook?.handler({
      params: { code: `async () => xquik.request('/api/v1/account')` },
      toolName: 'tweetclaw',
    });
    const otherToolResult = await hook?.handler({
      params: {
        code: `async () => xquik.request('/api/v1/x/tweets', { method: 'POST' })`,
      },
      toolName: 'explore',
    });
    const invalidCodeResult = await hook?.handler({
      params: { code: 123 },
      toolName: 'tweetclaw',
    });

    expect(hooks).toHaveLength(1);
    expect(hook?.name).toBe('before_tool_call');
    expect(hook?.priority).toBe(50);
    expect(writeResult?.requireApproval?.severity).toBe('warning');
    expect(readResult).toBeUndefined();
    expect(otherToolResult).toBeUndefined();
    expect(invalidCodeResult).toBeUndefined();
  });

  it('uses registerHook when OpenClaw exposes the legacy hook method', () => {
    expect.assertions(3);
    const { api, hooks, warnings } = createMockApi(
      { apiKey: 'xq_test123' },
      'registerHook',
    );
    register(api);
    expect(hooks).toHaveLength(1);
    expect(hooks[0]?.name).toBe('before_tool_call');
    expect(warnings).toHaveLength(0);
  });

  it('warns when OpenClaw approval hooks are unavailable', () => {
    expect.assertions(2);
    const { api, hooks, warnings } = createMockApi({ apiKey: 'xq_test123' }, 'none');
    register(api);
    expect(hooks).toHaveLength(0);
    expect(warnings[0]).toContain('approval hooks are unavailable');
  });

  it('skips event poller when pollingEnabled is false', () => {
    expect.assertions(1);
    const { api, services } = createMockApi({ apiKey: 'xq_test123', pollingEnabled: false });
    register(api);
    expect(services).toHaveLength(0);
  });

  it('uses custom baseUrl from config', () => {
    expect.assertions(1);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123', baseUrl: 'https://custom.example.com' });
    register(api);
    expect(tools).toHaveLength(2);
  });

  it('uses custom pollingInterval from config', () => {
    expect.assertions(1);
    const { api, services } = createMockApi({ apiKey: 'xq_test123', pollingInterval: 120 });
    register(api);
    expect(services).toHaveLength(1);
  });

  it('warns when apiKey and tempoSigningKey are both missing from config object', () => {
    expect.assertions(2);
    const { api, warnings } = createMockApi({});
    register(api);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('No API key or signing key');
  });

  it('poller service can start and stop', () => {
    expect.assertions(1);
    const { api, services } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const [pollerService] = services;
    pollerService?.start();
    pollerService?.stop?.();
    expect(true).toBe(true);
  });

  it('explore tool execute runs code against spec', async () => {
    expect.assertions(1);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const explore = tools.find((tool) => tool.name === 'explore');
    const result = await explore?.execute('call_1', { code: 'async () => spec.endpoints.length' });
    const count = Number(result?.content[0]?.text);
    expect(count).toBeGreaterThan(40);
  });

  it('tweetclaw tool execute runs code', async () => {
    expect.assertions(1);
    const mockFetch = createMockFetch({ email: 'test@example.com' });
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api, mockFetch);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const result = await tweetclaw?.execute('call_2', {
      code: `async () => xquik.request('/api/v1/account')`,
    });
    expect(result?.content[0]?.text).toContain('test@example.com');
  });

  it('xstatus command handler returns formatted account', async () => {
    expect.assertions(1);
    const mockFetch = createMockFetch({ email: 'user@test.com', xUsername: 'demo' });
    const { api, commands } = createMockApi({ apiKey: 'xq_test123' });
    register(api, mockFetch);
    const xstatus = commands.find((command) => command.name === 'xstatus');
    const result = await xstatus?.handler({});
    expect(result?.text).toContain('@demo');
  });

  it('xtrends command handler returns formatted trends', async () => {
    expect.assertions(1);
    const mockFetch = createMockFetch({ items: [{ title: 'AI Agents' }], total: 1 });
    const { api, commands } = createMockApi({ apiKey: 'xq_test123' });
    register(api, mockFetch);
    const xtrends = commands.find((command) => command.name === 'xtrends');
    const result = await xtrends?.handler({ args: 'tech' });
    expect(result?.text).toContain('AI Agents');
  });

  it('registers tools in MPP mode with signing key and no apiKey', () => {
    expect.assertions(4);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue(new Error('skip'));
    const { api, tools, infos, services } = createMockApi({ tempoSigningKey: '0xabc123' });
    register(api);
    vi.restoreAllMocks();
    expect(tools).toHaveLength(2);
    expect(tools[0]?.name).toBe('explore');
    expect(infos.some((m) => m.includes('MPP mode'))).toBe(true);
    expect(services).toHaveLength(0);
  });

  it('registers only xtrends command in MPP mode (no xstatus)', () => {
    expect.assertions(2);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue(new Error('skip'));
    const { api, commands } = createMockApi({ tempoSigningKey: '0xabc123' });
    register(api);
    vi.restoreAllMocks();
    expect(commands).toHaveLength(1);
    expect(commands[0]?.name).toBe('xtrends');
  });

  it('logs MPP init failure', async () => {
    expect.assertions(1);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue(new Error('MPP requires mppx'));
    const errors: string[] = [];
    const { api } = createMockApi({ tempoSigningKey: '0xabc123' });
    const apiWithErrors = {
      ...api,
      logger: { ...api.logger, error: (m: string) => { errors.push(m); } },
    };
    register(apiWithErrors);
    await vi.advanceTimersByTimeAsync(100);
    vi.restoreAllMocks();
    expect(errors.some((m) => m.includes('MPP init failed'))).toBe(true);
  });

  it('logs MPP success when initMpp succeeds', async () => {
    expect.assertions(1);
    vi.spyOn(mpp, 'initMpp').mockResolvedValue();
    const infos: string[] = [];
    const { api } = createMockApi({ tempoSigningKey: '0xabc123' });
    const apiWithInfos = {
      ...api,
      logger: { ...api.logger, info: (m: string) => { infos.push(m); } },
    };
    register(apiWithInfos);
    await vi.advanceTimersByTimeAsync(100);
    vi.restoreAllMocks();
    expect(infos.some((m) => m.includes('MPP initialized'))).toBe(true);
  });

  it('logs non-Error MPP init failures', async () => {
    expect.assertions(1);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue('string error');
    const errors: string[] = [];
    const { api } = createMockApi({ tempoSigningKey: '0xabc123' });
    const apiWithErrors = {
      ...api,
      logger: { ...api.logger, error: (m: string) => { errors.push(m); } },
    };
    register(apiWithErrors);
    await vi.advanceTimersByTimeAsync(100);
    vi.restoreAllMocks();
    expect(errors.some((m) => m.includes('string error'))).toBe(true);
  });

  it('event poller logs events with known types', async () => {
    expect.assertions(1);
    const mockFetch = createMockFetch({
      events: [{ eventType: 'monitor_event', id: 'evt_1', xUsername: 'testuser' }],
    });
    const { api, infos, services } = createMockApi({ apiKey: 'xq_test123', pollingInterval: 1 });
    register(api, mockFetch);
    const [pollerService] = services;
    pollerService?.start();
    await vi.advanceTimersByTimeAsync(1500);
    pollerService?.stop?.();
    expect(infos.some((message) => message.includes('monitor_event'))).toBe(true);
  });

  it('event poller handles events without type or username', async () => {
    expect.assertions(1);
    const mockFetch = createMockFetch({
      events: [{ id: 'evt_2' }],
    });
    const { api, infos, services } = createMockApi({ apiKey: 'xq_test123', pollingInterval: 1 });
    register(api, mockFetch);
    const [pollerService] = services;
    pollerService?.start();
    await vi.advanceTimersByTimeAsync(1500);
    pollerService?.stop?.();
    expect(infos.some((message) => message.includes('unknown'))).toBe(true);
  });
});
