// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { describe, expect, it, vi } from 'vitest';
import { createProxiedRequest } from '../src/request.js';

vi.mock(import('../src/api-spec.js'), async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    API_SPEC: [
      ...original.API_SPEC,
      {
        agentProhibited: true,
        category: 'Account',
        free: true,
        method: 'GET',
        parameters: [],
        path: '/api/v1/account/sessions',
        responseShape: 'AccountSessions',
        summary: 'Lists the dashboard sessions of the account.',
      },
    ],
  };
});

describe('createProxiedRequest with a prohibited route the static list does not name', () => {
  it('refuses the route from the catalog and sends nothing', async () => {
    expect.assertions(2);
    const sent: string[] = [];
    const mockFetch: typeof fetch = async (input) => {
      sent.push(String(input));
      return new Response('{}');
    };
    const request = createProxiedRequest('https://xquik.com', 'xq_test', mockFetch);
    await expect(request('/api/v1/account/sessions')).rejects.toThrow('Endpoint is blocked for agents');
    expect(sent).toStrictEqual([]);
  });
});
