// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import manifest from '../openclaw.plugin.json' with { type: 'json' };
import plugin from '../src/index.js';
import * as mpp from '../src/mpp.js';
import type { ToolResult } from '../src/types.js';

const { configSchema, register } = plugin;
const VALID_SIGNING_KEY = `0x${'2'.repeat(64)}`;

interface RegisteredTool {
  readonly description: string;
  readonly execute: (toolCallId: string, params: unknown) => Promise<ToolResult>;
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
              readonly allowedDecisions?: readonly string[];
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
          readonly allowedDecisions?: readonly string[];
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

function requireHook(hooks: readonly RegisteredHook[]): RegisteredHook {
  const [hook] = hooks;
  if (hook === undefined) {
    throw new Error('Expected OpenClaw hook registration');
  }
  return hook;
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
  it('exposes the same config schema as the manifest', () => {
    expect.assertions(1);
    expect(configSchema).toStrictEqual(manifest.configSchema);
  });

  it('declares OpenClaw tool activation and optional tool metadata', () => {
    expect.assertions(4);
    expect(manifest.activation).toStrictEqual({ onCapabilities: ['tool'], onStartup: false });
    expect(manifest.commandAliases).toStrictEqual([
      { kind: 'runtime-slash', name: 'xstatus' },
      { kind: 'runtime-slash', name: 'xtrends' },
    ]);
    expect(manifest.contracts.tools).toStrictEqual(['explore', 'tweetclaw']);
    expect(manifest.toolMetadata.tweetclaw.optional).toBe(true);
  });

  it('loads with configuration guidance when no API key or signing key is configured', async () => {
    expect.assertions(6);
    const { api, tools, warnings } = createMockApi();
    register(api);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const result = await tweetclaw?.execute('call_missing_credentials', {
      path: '/api/v1/account',
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('No API key or signing key');
    expect(tools).toHaveLength(2);
    expect(tools[0]?.name).toBe('explore');
    expect(result?.isError).toBe(true);
    expect(result?.content[0]?.text).toContain('not configured');
  });

  it('registers 2 tools with valid API key', () => {
    expect.assertions(3);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    expect(tools).toHaveLength(2);
    expect(tools[0]?.name).toBe('explore');
    expect(tools[1]?.name).toBe('tweetclaw');
  });

  it('keeps tweetclaw body schema compatible with OpenAI tool validation', () => {
    expect.assertions(1);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const parameters = tweetclaw?.parameters as { readonly properties?: { readonly body?: { readonly items?: unknown } } };
    expect(parameters.properties?.body?.items).toStrictEqual({});
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

  it('requires OpenClaw approval for writes and private reads', async () => {
    expect.assertions(10);
    const { api, hooks } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const hook = requireHook(hooks);
    const writeResult = await hook.handler({
      params: {
        body: { account: '@demo', text: 'hello' },
        method: 'POST',
        path: '/api/v1/x/tweets',
      },
      toolName: 'tweetclaw',
    });
    const privateReadResult = await hook.handler({
      params: { path: '/api/v1/account' },
      toolName: 'tweetclaw',
    });
    const publicReadResult = await hook.handler({
      params: { path: '/api/v1/radar' },
      toolName: 'tweetclaw',
    });
    const otherToolResult = await hook.handler({
      params: { method: 'POST', path: '/api/v1/x/tweets' },
      toolName: 'explore',
    });
    const invalidParamsResult = await hook.handler({
      params: { method: 'POST' },
      toolName: 'tweetclaw',
    });
    const missingParamsResult = await hook.handler({
      toolName: 'tweetclaw',
    });
    const approval = writeResult?.requireApproval;

    expect(hooks).toHaveLength(1);
    expect(hook.name).toBe('before_tool_call');
    expect(hook.priority).toBe(50);
    expect(approval?.allowedDecisions).toStrictEqual(['allow-once', 'deny']);
    expect(approval?.severity).toBe('warning');
    expect(privateReadResult?.requireApproval).toBeDefined();
    expect(publicReadResult).toBeUndefined();
    expect(otherToolResult).toBeUndefined();
    expect(invalidParamsResult).toBeUndefined();
    expect(missingParamsResult).toBeUndefined();
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

  it('normalizes invalid polling intervals before starting the poller', async () => {
    expect.assertions(1);
    let callCount = 0;
    const mockFetch: typeof fetch = async () => {
      callCount += 1;
      return new Response(JSON.stringify({ events: [] }));
    };
    const { api, services } = createMockApi({ apiKey: 'xq_test123', pollingInterval: 0 });
    register(api, mockFetch);
    const [pollerService] = services;
    pollerService?.start();
    await vi.advanceTimersByTimeAsync(1000);
    pollerService?.stop?.();
    expect(callCount).toBe(0);
  });

  it('keeps free catalog exploration available with an empty config object', async () => {
    expect.assertions(4);
    const { api, tools, warnings } = createMockApi({});
    register(api);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain('No API key or signing key');
    expect(tools).toHaveLength(2);
    const explore = tools.find((tool) => tool.name === 'explore');
    const result = await explore?.execute('call_empty_config', { query: 'trends' });
    expect(result?.content[0]?.text).toContain('trends');
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

  it('explore tool executes structured catalog search', async () => {
    expect.assertions(1);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const explore = tools.find((tool) => tool.name === 'explore');
    const result = await explore?.execute('call_1', { query: 'tweet' });
    expect(result?.content[0]?.text).toContain('tweet');
  });

  it('explore tool accepts every structured filter', async () => {
    expect.assertions(1);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const explore = tools.find((tool) => tool.name === 'explore');
    const result = await explore?.execute('call_filters', {
      category: 'twitter',
      free: false,
      limit: 5,
      method: 'GET',
      mpp: true,
      path: '/api/v1/x/tweets/123',
      query: 'tweet',
    });
    expect(result?.content[0]?.text).toContain('/api/v1/x/tweets/:id');
  });

  it('explore tool ignores unsupported filter types', async () => {
    expect.assertions(2);
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api);
    const explore = tools.find((tool) => tool.name === 'explore');
    const nullResult = await explore?.execute('call_null', null);
    const invalidResult = await explore?.execute('call_invalid', {
      category: 1,
      free: 'false',
      limit: '5',
      method: 1,
      mpp: 'true',
      path: 1,
      query: 1,
    });
    expect(nullResult?.content[0]?.text).toContain('/api/v1/');
    expect(invalidResult?.content[0]?.text).toContain('/api/v1/');
  });

  it('tweetclaw tool executes structured catalog request', async () => {
    expect.assertions(1);
    const mockFetch = createMockFetch({ email: 'test@example.com' });
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api, mockFetch);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const result = await tweetclaw?.execute('call_2', {
      path: '/api/v1/account',
    });
    expect(result?.content[0]?.text).toContain('test@example.com');
  });

  it('tweetclaw tool forwards X write idempotency keys', async () => {
    expect.assertions(2);
    const mockFetch: typeof fetch = async (_input, init) => {
      expect(init?.headers).toMatchObject({ 'Idempotency-Key': 'post-001' });
      return new Response(JSON.stringify({ status: 'completed', terminal: true }));
    };
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api, mockFetch);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const result = await tweetclaw?.execute('call_write', {
      body: { account: '@demo', text: 'Hello.' },
      idempotencyKey: 'post-001',
      method: 'POST',
      path: '/api/v1/x/tweets',
    });
    expect(result?.isError).toBeUndefined();
  });

  it('tweetclaw tool ignores unsupported query value types', async () => {
    expect.assertions(1);
    const mockFetch: typeof fetch = async (input) => {
      expect(String(input)).toBe('https://xquik.com/api/v1/x/tweets/search?q=ai');
      return new Response(JSON.stringify({ tweets: [] }));
    };
    const { api, tools } = createMockApi({ apiKey: 'xq_test123' });
    register(api, mockFetch);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    await tweetclaw?.execute('call_3', {
      path: '/api/v1/x/tweets/search',
      query: { ignored: { nested: true }, q: 'ai' },
    });
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
    const { api, tools, infos, services } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
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
    const { api, commands } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
    register(api);
    vi.restoreAllMocks();
    expect(commands).toHaveLength(1);
    expect(commands[0]?.name).toBe('xtrends');
  });

  it('logs MPP init failure', async () => {
    expect.assertions(2);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue(
      new Error('provider error containing supplied key material'),
    );
    const errors: string[] = [];
    const { api } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
    const apiWithErrors = {
      ...api,
      logger: { ...api.logger, error: (m: string) => { errors.push(m); } },
    };
    register(apiWithErrors);
    await vi.advanceTimersByTimeAsync(100);
    vi.restoreAllMocks();
    expect(errors).toStrictEqual(['TweetClaw: MPP init failed. Check local plugin configuration.']);
    expect(errors[0]).not.toContain('provider error');
  });

  it('logs MPP success when initMpp succeeds', async () => {
    expect.assertions(1);
    vi.spyOn(mpp, 'initMpp').mockResolvedValue();
    const infos: string[] = [];
    const { api } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
    const apiWithInfos = {
      ...api,
      logger: { ...api.logger, info: (m: string) => { infos.push(m); } },
    };
    register(apiWithInfos);
    await vi.advanceTimersByTimeAsync(100);
    vi.restoreAllMocks();
    expect(infos.some((m) => m.includes('MPP initialized'))).toBe(true);
  });

  it('logs a fixed message for non-Error MPP init failures', async () => {
    expect.assertions(2);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue('string error');
    const errors: string[] = [];
    const { api } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
    const apiWithErrors = {
      ...api,
      logger: { ...api.logger, error: (m: string) => { errors.push(m); } },
    };
    register(apiWithErrors);
    await vi.advanceTimersByTimeAsync(100);
    vi.restoreAllMocks();
    expect(errors).toStrictEqual(['TweetClaw: MPP init failed. Check local plugin configuration.']);
    expect(errors[0]).not.toContain('string error');
  });

  it('waits for MPP initialization before tool and command requests', async () => {
    expect.assertions(4);
    let finishInitialization: (() => void) | undefined;
    const initialization = new Promise<void>((resolve) => {
      finishInitialization = resolve;
    });
    vi.spyOn(mpp, 'initMpp').mockReturnValue(initialization);
    const mockFetch = vi.fn(createMockFetch({ items: [], total: 0, trends: [], woeid: 1 }));
    const { api, commands, tools } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
    register(api, mockFetch);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const xtrends = commands.find((command) => command.name === 'xtrends');
    const toolRequest = tweetclaw?.execute('call_mpp_wait', { path: '/api/v1/trends' });
    const commandRequest = xtrends?.handler({});

    await Promise.resolve();
    expect(mockFetch).not.toHaveBeenCalled();
    finishInitialization?.();
    await expect(toolRequest).resolves.toBeDefined();
    await expect(commandRequest).resolves.toBeDefined();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    vi.restoreAllMocks();
  });

  it('returns the MPP initialization error before a tool request', async () => {
    expect.assertions(4);
    vi.spyOn(mpp, 'initMpp').mockRejectedValue(
      new Error('provider error containing supplied key material'),
    );
    const mockFetch = vi.fn(createMockFetch({ items: [], total: 0 }));
    const { api, tools } = createMockApi({ tempoSigningKey: VALID_SIGNING_KEY });
    register(api, mockFetch);
    const tweetclaw = tools.find((tool) => tool.name === 'tweetclaw');
    const result = await tweetclaw?.execute('call_mpp_error', { path: '/api/v1/trends' });

    expect(result?.isError).toBe(true);
    expect(result?.content[0]?.text).toContain(
      'MPP unavailable. Check local plugin configuration and optional packages.',
    );
    expect(result?.content[0]?.text).not.toContain('provider error');
    expect(mockFetch).not.toHaveBeenCalled();
    vi.restoreAllMocks();
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
    await vi.advanceTimersByTimeAsync(5500);
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
    await vi.advanceTimersByTimeAsync(5500);
    pollerService?.stop?.();
    expect(infos.some((message) => message.includes('unknown'))).toBe(true);
  });
});
