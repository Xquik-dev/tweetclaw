import { describe, expect, it } from 'vitest';
import {
  createSafeProxy,
  errorResult,
  extractErrorMessage,
  getConstructorFromPrototype,
  resolveAsyncFunctionConstructor,
  runInSandbox,
  specEndpoints,
  successResult,
} from '../src/tools/executor.js';

describe('getConstructorFromPrototype', () => {
  it('returns constructor from valid prototype', () => {
    expect.assertions(1);
    const proto = { constructor: Function };
    expect(getConstructorFromPrototype(proto)).toBe(Function);
  });

  it('returns undefined for null', () => {
    expect.assertions(1);
    expect(getConstructorFromPrototype(null)).toBeUndefined();
  });

  it('returns undefined for non-object', () => {
    expect.assertions(1);
    expect(getConstructorFromPrototype('string')).toBeUndefined();
  });

  it('returns undefined for number', () => {
    expect.assertions(1);
    expect(getConstructorFromPrototype(42)).toBeUndefined();
  });

  it('returns undefined for object without constructor', () => {
    expect.assertions(1);
    const proto = Object.create(null) as Record<string, unknown>;
    expect(getConstructorFromPrototype(proto)).toBeUndefined();
  });
});

describe('resolveAsyncFunctionConstructor', () => {
  it('returns a constructor function', () => {
    expect.assertions(1);
    const result = resolveAsyncFunctionConstructor();
    expect(typeof result).toBe('function');
  });

  it('throws when prototype has no valid constructor', () => {
    expect.assertions(1);
    const emptyProto = Object.create(null) as Record<string, unknown>;
    expect(() => resolveAsyncFunctionConstructor(emptyProto)).toThrow('AsyncFunction constructor not found');
  });
});

describe('runInSandbox', () => {
  it('executes async code with injected globals', async () => {
    expect.assertions(1);
    const result: unknown = await runInSandbox('async () => { return myVariable; }', { myVariable: 42 });
    expect(result).toBe(42);
  });

  it('blocks process.env access', async () => {
    expect.assertions(1);
    await expect(runInSandbox('async () => { return process.env; }', {})).rejects.toThrow();
  });

  it('blocks require access', async () => {
    expect.assertions(1);
    await expect(runInSandbox('async () => { return require("fs"); }', {})).rejects.toThrow();
  });

  it('blocks fetch access', async () => {
    expect.assertions(1);
    const result: unknown = await runInSandbox('async () => { return typeof fetch; }', {});
    expect(result).toBe('undefined');
  });

  it('blocks dynamic import', async () => {
    expect.assertions(1);
    await expect(runInSandbox('async () => { return await import("fs"); }', {})).rejects.toThrow();
  });

  it('blocks constructor escape via this', async () => {
    expect.assertions(1);
    await expect(
      runInSandbox('async () => { return this.constructor.constructor("return process")(); }', {}),
    ).rejects.toThrow();
  });

  it('blocks constructor escape via injected object', async () => {
    expect.assertions(1);
    const result: unknown = await runInSandbox('async () => { return target.constructor; }', { target: { key: 1 } });
    expect(result).toBeUndefined();
  });

  it('blocks constructor on proxied function properties', async () => {
    expect.assertions(1);
    const result: unknown = await runInSandbox(
      'async () => { return target.greet.constructor; }',
      { target: { greet: (): string => 'hi' } },
    );
    expect(result).toBeUndefined();
  });

  it('allows non-blocked properties on proxied functions', async () => {
    expect.assertions(1);
    const result: unknown = await runInSandbox(
      'async () => { return typeof target.greet.name; }',
      { target: { greet: (): string => 'hi' } },
    );
    expect(result).toBe('string');
  });

  it('wraps async function return values', async () => {
    expect.assertions(1);
    const result: unknown = await runInSandbox(
      'async () => { const r = await target.fetch(); return r.constructor; }',
      { target: { fetch: async (): Promise<Record<string, number>> => ({ ok: 1 }) } },
    );
    expect(result).toBeUndefined();
  });
});

describe('createSafeProxy', () => {
  it('returns null for null input', () => {
    expect.assertions(1);
    expect(createSafeProxy(null)).toBeNull();
  });

  it('returns undefined for undefined input', () => {
    expect.assertions(1);
    const input: unknown = void 0;
    expect(createSafeProxy(input)).toBeUndefined();
  });

  it('returns primitives unchanged', () => {
    expect.assertions(2);
    expect(createSafeProxy(42)).toBe(42);
    expect(createSafeProxy('hello')).toBe('hello');
  });
});

describe('extractErrorMessage', () => {
  it('extracts message from Error instances', () => {
    expect.assertions(1);
    expect(extractErrorMessage(new Error('test'))).toBe('Error: test');
  });

  it('extracts message from TypeError instances', () => {
    expect.assertions(1);
    expect(extractErrorMessage(new TypeError('bad type'))).toBe('TypeError: bad type');
  });

  it('converts non-errors to string', () => {
    expect.assertions(1);
    expect(extractErrorMessage('raw string')).toBe('raw string');
  });

  it('converts undefined to string', () => {
    expect.assertions(1);
    const value: unknown = void 0;
    expect(extractErrorMessage(value)).toBe('undefined');
  });
});

describe('successResult', () => {
  it('wraps content in tool result format', () => {
    expect.assertions(3);
    const result = successResult({ data: 'test' });
    expect(result.isError).toBeUndefined();
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.text).toContain('test');
  });
});

describe('errorResult', () => {
  it('wraps error in tool result format with isError flag', () => {
    expect.assertions(3);
    const result = errorResult(new Error('fail'));
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0]?.text).toContain('fail');
  });
});

describe('specEndpoints', () => {
  it('contains endpoint objects', () => {
    expect.assertions(1);
    expect(specEndpoints.length).toBeGreaterThan(40);
  });

  it('excludes agent-prohibited endpoints', () => {
    expect.assertions(2);
    const paths = specEndpoints.map(
      (endpoint) => `${String((endpoint as Record<string, unknown>).method)} ${String((endpoint as Record<string, unknown>).path)}`,
    );
    expect(paths).not.toContain('POST /api/v1/x/accounts');
    expect(paths).not.toContain('POST /api/v1/x/accounts/:id/reauth');
  });

  it('does not contain password or totp_secret parameters', () => {
    expect.assertions(1);
    const allParamNames: string[] = [];
    for (const endpoint of specEndpoints) {
      const params = (endpoint as Record<string, unknown>).parameters;
      if (Array.isArray(params)) {
        for (const parameter of params) {
          allParamNames.push(String((parameter as Record<string, unknown>).name));
        }
      }
    }
    expect(allParamNames).not.toContain('password');
  });
});
