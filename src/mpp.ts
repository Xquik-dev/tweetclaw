// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

type MppModuleName = 'mppx/client' | 'viem/accounts';
type ModuleLoader = (name: MppModuleName) => Promise<Record<string, unknown>>;

const TEMPO_SIGNING_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/u;
const MPP_CLIENT_MODULE: MppModuleName = 'mppx/client';
const VIEM_ACCOUNTS_MODULE: MppModuleName = 'viem/accounts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCallable(value: unknown): value is (...args: readonly unknown[]) => unknown {
  return typeof value === 'function';
}

async function loadDynamicModule(name: string): Promise<Record<string, unknown>> {
  if (name !== MPP_CLIENT_MODULE && name !== VIEM_ACCOUNTS_MODULE) {
    throw new Error('Unsupported MPP module.');
  }

  const mod: unknown = await import(name);
  if (!isRecord(mod)) {
    throw new Error(`Failed to load ${name}`);
  }
  return mod;
}

function createModuleLoader(): ModuleLoader {
  return loadDynamicModule;
}

async function initMpp(tempoSigningKey: string, loadModule?: ModuleLoader): Promise<void> {
  if (!TEMPO_SIGNING_KEY_PATTERN.test(tempoSigningKey)) {
    throw new Error('Invalid MPP signing key configuration.');
  }

  const load = loadModule ?? createModuleLoader();
  const mppxMod = await load(MPP_CLIENT_MODULE).catch((): never => {
    throw new Error('MPP requires mppx package. Run: npm i mppx@0.8.12 viem@2.55.4');
  });
  const viemMod = await load(VIEM_ACCOUNTS_MODULE).catch((): never => {
    throw new Error('MPP requires viem package. Run: npm i mppx@0.8.12 viem@2.55.4');
  });
  if (!isCallable(viemMod['privateKeyToAccount'])) throw new Error('viem missing privateKeyToAccount');
  if (!isCallable(mppxMod['tempo'])) throw new Error('mppx missing tempo');
  if (!isRecord(mppxMod['Mppx'])) throw new Error('mppx missing Mppx');
  const createMethod: unknown = mppxMod['Mppx']['create'];
  if (!isCallable(createMethod)) throw new Error('mppx Mppx.create is not a function');
  let account: unknown;
  try {
    account = viemMod['privateKeyToAccount'](tempoSigningKey);
  } catch {
    throw new Error('Invalid MPP signing key configuration.');
  }
  const method: unknown = mppxMod['tempo']({ account });
  createMethod({ methods: [method] });
}

export { createModuleLoader, initMpp, isCallable, isRecord };
export type { ModuleLoader };
