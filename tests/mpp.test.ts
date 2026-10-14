// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { describe, expect, it, vi } from 'vitest';
import { createModuleLoader, initMpp, isCallable, isRecord } from '../src/mpp.js';
import type { ModuleLoader } from '../src/mpp.js';

const VALID_SIGNING_KEY = `0x${'1'.repeat(64)}`;
const OFFER = { amount: '150', currency: '0x20c000000000000000000000b9537d11c60e8b50' };
const baseFetch: typeof fetch = async () => new Response('{}');

describe('isRecord', () => {
  it('returns true for plain objects', () => {
    expect.assertions(1);
    expect(isRecord({})).toBe(true);
  });

  it('returns false for null', () => {
    expect.assertions(1);
    expect(isRecord(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect.assertions(2);
    expect(isRecord('string')).toBe(false);
    expect(isRecord(42)).toBe(false);
  });

  it('returns true for arrays', () => {
    expect.assertions(1);
    expect(isRecord([])).toBe(true);
  });
});

describe('isCallable', () => {
  it('returns true for functions', () => {
    expect.assertions(1);
    expect(isCallable(() => {})).toBe(true);
  });

  it('returns false for non-functions', () => {
    expect.assertions(3);
    expect(isCallable({})).toBe(false);
    expect(isCallable('string')).toBe(false);
    expect(isCallable(null)).toBe(false);
  });
});

describe('createModuleLoader', () => {
  it('returns a function', () => {
    expect.assertions(1);
    const loader = createModuleLoader();
    expect(typeof loader).toBe('function');
  });

  it('restricts dynamic loading to the two optional MPP modules', async () => {
    expect.assertions(3);
    const loader = createModuleLoader();
    await expect(loader('mppx/client')).resolves.toHaveProperty('Mppx.create');
    await expect(loader('viem/accounts')).resolves.toHaveProperty('privateKeyToAccount');
    const untypedLoader = loader as (name: string) => Promise<Record<string, unknown>>;
    await expect(untypedLoader('untrusted/module')).rejects.toThrow('MPP module is not allowed.');
  });
});

function mockLoader(modules: Readonly<Record<string, Record<string, unknown>>>): ModuleLoader {
  return async (name): Promise<Record<string, unknown>> => {
    const mod: Record<string, unknown> | undefined = modules[name];
    if (mod === undefined) throw new Error(`Module not found: ${name}`);
    return mod;
  };
}

describe('initMpp', () => {
  it('rejects malformed signing keys before loading optional modules', async () => {
    expect.assertions(2);
    let loadCount = 0;
    const loader: ModuleLoader = async (): Promise<Record<string, unknown>> => {
      loadCount += 1;
      return {};
    };

    await expect(initMpp('not-a-signing-key', baseFetch, loader)).rejects.toThrow(
      'MPP signing key is invalid.',
    );
    expect(loadCount).toBe(0);
  });

  it('throws when mppx is not installed', async () => {
    expect.assertions(1);
    const loader = mockLoader({});
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow('mppx is missing');
  });

  it('throws when viem is not installed', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow('viem is missing');
  });

  it('makes a client that pays 1 offer and leaves the global fetch alone', async () => {
    expect.assertions(4);
    const paidResponse = new Response('{"paid":true}');
    const mockCreate = vi.fn().mockReturnValue({ fetch: async () => paidResponse });
    const mockTempo = vi.fn().mockReturnValue('mock-method');
    const mockPkta = vi.fn().mockReturnValue('mock-account');
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: mockCreate }, tempo: mockTempo },
      'viem/accounts': { privateKeyToAccount: mockPkta },
    });
    const payFor = await initMpp(VALID_SIGNING_KEY, baseFetch, loader);
    await expect(payFor(OFFER)('https://xquik.com/api/v1/trends')).resolves.toBe(paidResponse);
    expect(mockPkta).toHaveBeenCalledWith(VALID_SIGNING_KEY);
    expect(mockTempo).toHaveBeenCalledWith({
      account: 'mock-account',
      expectedRecipients: ['0xbe6c07f6fce303483458a7ddc929eb50a8ae6574'],
    });
    expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      maxPaymentRetries: 1,
      methods: ['mock-method'],
      polyfill: false,
    }));
  });

  it.each([
    ['no client', undefined],
    ['a client without a fetch', {}],
    ['a fetch that returns no response', { fetch: async () => 'not a response' }],
  ])('stops when mppx gives %s', async (_case, client) => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: () => client }, tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    const payFor = await initMpp(VALID_SIGNING_KEY, baseFetch, loader);
    await expect((async () => payFor(OFFER)('https://xquik.com/api/v1/trends'))()).rejects.toThrow('mppx');
  });

  it('throws when privateKeyToAccount is not a function', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: 'not-a-function' },
    });
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow('viem export is missing: privateKeyToAccount');
  });

  it('throws when tempo is not a function', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: 'not-a-function' },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow('mppx export is missing: tempo');
  });

  it('throws when Mppx is not a record', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: 'not-an-object', tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow('mppx export is missing: Mppx');
  });

  it('throws when Mppx.create is not a function', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: 'not-a-function' }, tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow('mppx export is invalid: Mppx.create');
  });

  it('replaces account-derivation errors with a fixed secret-free message', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: vi.fn() },
      'viem/accounts': {
        privateKeyToAccount: (): never => {
          throw new Error('provider error containing supplied key material');
        },
      },
    });

    await expect(initMpp(VALID_SIGNING_KEY, baseFetch, loader)).rejects.toThrow(
      'MPP signing key is invalid.',
    );
  });

  it('uses the installed modules when no loader is given', async () => {
    expect.assertions(2);
    const before = globalThis.fetch;
    await expect(initMpp(VALID_SIGNING_KEY, baseFetch)).resolves.toBeTypeOf('function');
    expect(globalThis.fetch).toBe(before);
  });
});
