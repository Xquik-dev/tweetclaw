import { resolveAsyncFunctionConstructor } from './tools/executor.js';

type ModuleLoader = (name: string) => Promise<Record<string, unknown>>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCallable(value: unknown): value is (...args: readonly unknown[]) => unknown {
  return typeof value === 'function';
}

function createModuleLoader(): ModuleLoader {
  const loader = resolveAsyncFunctionConstructor();
  const dynamicImport = new loader('n', 'return import(n)');
  return async (name: string): Promise<Record<string, unknown>> => {
    const mod: unknown = await dynamicImport(name);
    if (!isRecord(mod)) {
      throw new Error(`Failed to load ${name}`);
    }
    return mod;
  };
}

async function initMpp(tempoSigningKey: string, loadModule?: ModuleLoader): Promise<void> {
  const load = loadModule ?? createModuleLoader();
  const mppxMod = await load('mppx/client').catch((): never => {
    throw new Error('MPP requires mppx package. Run: npm i mppx viem');
  });
  const viemMod = await load('viem/accounts').catch((): never => {
    throw new Error('MPP requires viem package. Run: npm i mppx viem');
  });
  if (!isCallable(viemMod.privateKeyToAccount)) throw new Error('viem missing privateKeyToAccount');
  if (!isCallable(mppxMod.tempo)) throw new Error('mppx missing tempo');
  if (!isRecord(mppxMod.Mppx)) throw new Error('mppx missing Mppx');
  const createMethod: unknown = mppxMod.Mppx.create;
  if (!isCallable(createMethod)) throw new Error('mppx Mppx.create is not a function');
  const account: unknown = viemMod.privateKeyToAccount(tempoSigningKey);
  const method: unknown = mppxMod.tempo({ account });
  createMethod({ methods: [method] });
}

export { createModuleLoader, initMpp, isCallable, isRecord };
export type { ModuleLoader };
