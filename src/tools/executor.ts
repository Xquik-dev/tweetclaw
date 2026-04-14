import vm from 'node:vm';
import { API_SPEC } from '../api-spec.js';
import { truncateResponse } from '../truncate.js';
import type { ToolResult } from '../types.js';

const specEndpoints: ReadonlyArray<Readonly<Record<string, unknown>>> = API_SPEC
  .filter((endpoint) => endpoint.agentProhibited !== true)
  .map((endpoint): Readonly<Record<string, unknown>> => ({ ...endpoint }));

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.constructor.name}: ${error.message}`;
  }
  return String(error);
}

function isAsyncFunctionConstructor(
  value: unknown,
): value is new (...parameters: readonly string[]) => (...parameters: readonly unknown[]) => Promise<unknown> {
  return typeof value === 'function';
}

function getConstructorFromPrototype(proto: unknown): unknown {
  if (typeof proto !== 'object' || proto === null) {
    return undefined;
  }
  return 'constructor' in proto ? proto.constructor : undefined;
}

function resolveAsyncFunctionConstructor(prototype?: unknown): new (
  ...parameters: readonly string[]
) => (...parameters: readonly unknown[]) => Promise<unknown> {
  const asyncPrototype: unknown = prototype ?? Object.getPrototypeOf(async (): Promise<void> => {});
  const candidate: unknown = getConstructorFromPrototype(asyncPrototype);
  if (!isAsyncFunctionConstructor(candidate)) {
    throw new Error('AsyncFunction constructor not found');
  }
  return candidate;
}

const BLOCKED_PROPS: ReadonlySet<string | symbol> = new Set(['constructor', '__proto__', 'prototype']);

function isBlockedProperty(property: string | symbol): boolean {
  return BLOCKED_PROPS.has(property);
}

function wrapValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object' && typeof value !== 'function') return value;
  return createSafeProxy(value);
}

async function wrapAsync(promise: Promise<unknown>): Promise<unknown> {
  const resolved: unknown = await promise;
  return wrapValue(resolved);
}

function createCallableProxy(bound: (...a: readonly unknown[]) => unknown): unknown {
  const handler: ProxyHandler<typeof bound> = {
    apply(_target: typeof bound, _thisArgument: unknown, argumentsList: unknown[]): unknown {
      const result: unknown = bound(...argumentsList);
      if (result instanceof Promise) {
        return wrapAsync(result);
      }
      return wrapValue(result);
    },
    get(_target: typeof bound, property: string | symbol): unknown {
      if (isBlockedProperty(property)) return undefined;
      return Reflect.get(_target, property);
    },
  };
  return new Proxy(bound, handler);
}

function createSafeProxy(target: unknown): unknown {
  if (target === null || target === undefined) return target;
  if (typeof target !== 'object' && typeof target !== 'function') return target;

  const handler: ProxyHandler<Record<string | symbol, unknown>> = {
    get(t: Record<string | symbol, unknown>, property: string | symbol): unknown {
      if (isBlockedProperty(property)) return undefined;
      const value: unknown = Reflect.get(t, property);
      if (typeof value === 'function') {
        const bound: (...a: readonly unknown[]) => unknown = value.bind(t);
        return createCallableProxy(bound);
      }
      return wrapValue(value);
    },
  };
  return new Proxy(target as Record<string | symbol, unknown>, handler);
}

function runInSandbox(code: string, globals: Readonly<Record<string, unknown>>): unknown {
  const rawContext: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(globals)) {
    const value: unknown = globals[key];
    const safeValue: unknown = typeof value === 'object' && value !== null
      ? createSafeProxy(value)
      : value;
    Reflect.set(rawContext, key, safeValue);
  }
  const context: vm.Context = vm.createContext(rawContext);
  return vm.runInNewContext(`(${code})()`, context);
}

function successResult(content: unknown): ToolResult {
  return { content: [{ text: truncateResponse(content), type: 'text' as const }] };
}

function errorResult(error: unknown): ToolResult {
  return { content: [{ text: extractErrorMessage(error), type: 'text' as const }], isError: true };
}

export {
  BLOCKED_PROPS,
  createSafeProxy,
  errorResult,
  extractErrorMessage,
  getConstructorFromPrototype,
  resolveAsyncFunctionConstructor,
  runInSandbox,
  specEndpoints,
  successResult,
  wrapValue,
};
