// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { expect, it } from 'vitest';
import plugin from '../src/index.js';

function createHost(pluginConfig) {
  const commands = new Set();
  const hooks = new Set();
  const services = new Set();
  return { commands, hooks, services, api: {
    logger: { error: expect.unreachable, info() {}, warn() {} },
    pluginConfig,
    registerCommand(command) { commands.add(command.name); },
    registerService(service) { services.add(service.id); },
    registerTool() {},
    on(name) { hooks.add(name); },
  } };
}

it.each([
  { config: undefined, commands: ['xtrends'] },
  { config: { apiKey: 'test-key', pollingEnabled: false }, commands: ['xstatus', 'xtrends'] },
])('registers SDK commands from host config $config', ({ config, commands }) => {
  const host = createHost(config);
  plugin.register(host.api);
  expect(host.commands).toStrictEqual(new Set(commands));
});

it('registers the SDK before-tool hook', () => {
  const host = createHost();
  plugin.register(host.api);
  expect(host.hooks).toStrictEqual(new Set(['before_tool_call']));
});

it('registers SDK polling when configured without disabling polling', () => {
  const host = createHost({ apiKey: 'test-key' });
  plugin.register(host.api);
  expect(host.services).toStrictEqual(new Set(['tweetclaw-poller']));
});
