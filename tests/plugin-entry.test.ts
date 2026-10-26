// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { expect, it } from 'vitest';
import plugin, { registerHost } from '../src/index.js';

type PluginHost = Parameters<typeof registerHost>[0];

function createHost(pluginConfig?: Readonly<Record<string, unknown>>): {
  readonly api: PluginHost;
  readonly commands: Set<string>;
  readonly hooks: Set<string>;
  readonly services: Set<string>;
} {
  const commands = new Set<string>();
  const hooks = new Set<string>();
  const services = new Set<string>();
  const api: PluginHost = {
    logger: { error: expect.unreachable, info: () => {}, warn: () => {} },
    ...(pluginConfig === undefined ? {} : { pluginConfig }),
    on: (name) => { hooks.add(name); },
    registerCommand: (command) => { commands.add(command.name); },
    registerService: (service) => { services.add(service.id); },
    registerTool: () => {},
  };
  return { api, commands, hooks, services };
}

it('hands the host register function to the SDK entry', () => {
  expect(plugin.register).toBe(registerHost);
});

it.each([
  { config: undefined, commands: ['xtrends'] },
  { config: { apiKey: 'test-key', pollingEnabled: false }, commands: ['xstatus', 'xtrends'] },
])('registers SDK commands from host config $config', ({ config, commands }) => {
  const host = createHost(config);
  registerHost(host.api);
  expect(host.commands).toStrictEqual(new Set(commands));
});

it('registers the SDK before-tool hook', () => {
  const host = createHost();
  registerHost(host.api);
  expect(host.hooks).toStrictEqual(new Set(['before_tool_call']));
});

it('registers SDK polling when configured without disabling polling', () => {
  const host = createHost({ apiKey: 'test-key' });
  registerHost(host.api);
  expect(host.services).toStrictEqual(new Set(['tweetclaw-poller']));
});
