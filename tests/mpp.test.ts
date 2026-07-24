// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it, vi } from 'vitest';
import { createModuleLoader, initMpp, isCallable, isRecord } from '../src/mpp.js';
import type { ModuleLoader } from '../src/mpp.js';

const VALID_SIGNING_KEY = `0x${'1'.repeat(64)}`;

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
    await expect(loader('mppx/client')).rejects.toThrow();
    await expect(loader('viem/accounts')).rejects.toThrow();
    const untypedLoader = loader as (name: string) => Promise<Record<string, unknown>>;
    await expect(untypedLoader('untrusted/module')).rejects.toThrow('Unsupported MPP module.');
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

    await expect(initMpp('not-a-signing-key', loader)).rejects.toThrow(
      'Invalid MPP signing key configuration.',
    );
    expect(loadCount).toBe(0);
  });

  it('throws when mppx is not installed', async () => {
    expect.assertions(1);
    const loader = mockLoader({});
    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow('MPP requires mppx package');
  });

  it('throws when viem is not installed', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow('MPP requires viem package');
  });

  it('calls Mppx.create with tempo account when modules are available', async () => {
    expect.assertions(3);
    const mockCreate = vi.fn();
    const mockTempo = vi.fn().mockReturnValue('mock-method');
    const mockPkta = vi.fn().mockReturnValue('mock-account');
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: mockCreate }, tempo: mockTempo },
      'viem/accounts': { privateKeyToAccount: mockPkta },
    });
    await initMpp(VALID_SIGNING_KEY, loader);
    expect(mockPkta).toHaveBeenCalledWith(VALID_SIGNING_KEY);
    expect(mockTempo).toHaveBeenCalledWith({ account: 'mock-account' });
    expect(mockCreate).toHaveBeenCalledWith({ methods: ['mock-method'] });
  });

  it('throws when privateKeyToAccount is not a function', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: 'not-a-function' },
    });
    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow('viem missing privateKeyToAccount');
  });

  it('throws when tempo is not a function', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: vi.fn() }, tempo: 'not-a-function' },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow('mppx missing tempo');
  });

  it('throws when Mppx is not a record', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: 'not-an-object', tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow('mppx missing Mppx');
  });

  it('throws when Mppx.create is not a function', async () => {
    expect.assertions(1);
    const loader = mockLoader({
      'mppx/client': { Mppx: { create: 'not-a-function' }, tempo: vi.fn() },
      'viem/accounts': { privateKeyToAccount: vi.fn() },
    });
    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow('mppx Mppx.create is not a function');
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

    await expect(initMpp(VALID_SIGNING_KEY, loader)).rejects.toThrow(
      'Invalid MPP signing key configuration.',
    );
  });

  it('uses default loader when none provided', async () => {
    expect.assertions(1);
    await expect(initMpp(VALID_SIGNING_KEY)).rejects.toThrow();
  });
});
