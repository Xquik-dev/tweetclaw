// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import PACKAGE from '../package.json' with { type: 'json' };
import type { FetchFunction, MppOffer, PayingFetch } from './types.js';

type MppModuleName = 'mppx/client' | 'viem/accounts';
type ModuleLoader = (name: MppModuleName) => Promise<Record<string, unknown>>;

const TEMPO_SIGNING_KEY_PATTERN = /^0x[0-9a-fA-F]{64}$/u;
const MPP_CLIENT_MODULE: MppModuleName = 'mppx/client';
const VIEM_ACCOUNTS_MODULE: MppModuleName = 'viem/accounts';
const MPP_ORIGIN = 'https://xquik.com';
const MPP_RECIPIENT = '0xbe6c07f6fce303483458a7ddc929eb50a8ae6574';
const MPP_METHOD = 'tempo';
const MPP_INTENT = 'charge';
const WHOLE_AMOUNT_PATTERN = /^\d+$/u;
const REFUSED_OFFER =
  'MPP payment refused. The server asked for more than the listed price, or for another currency or recipient.';
const INSTALL_HINT =
  `Run npm i mppx@${PACKAGE.peerDependencies.mppx} viem@${PACKAGE.peerDependencies.viem}.`;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCallable(value: unknown): value is (...args: readonly unknown[]) => unknown {
  return typeof value === 'function';
}

async function loadDynamicModule(name: string): Promise<Record<string, unknown>> {
  if (name !== MPP_CLIENT_MODULE && name !== VIEM_ACCOUNTS_MODULE) {
    throw new Error('MPP module is not allowed.');
  }

  const mod: unknown = await import(name);
  if (!isRecord(mod)) {
    throw new Error(`MPP module failed to load: ${name}`);
  }
  return mod;
}

function createModuleLoader(): ModuleLoader {
  return loadDynamicModule;
}

function lowerCased(value: unknown): string | undefined {
  return typeof value === 'string' ? value.toLowerCase() : undefined;
}

function asksForSplits(request: Readonly<Record<string, unknown>>): boolean {
  const details = request['methodDetails'];
  return isRecord(details) && details['splits'] !== undefined;
}

function isWithinOffer(amount: unknown, offer: Readonly<MppOffer>): boolean {
  return typeof amount === 'string'
    && WHOLE_AMOUNT_PATTERN.test(amount)
    && BigInt(amount) <= BigInt(offer.amount);
}

function isListedRequest(request: Readonly<Record<string, unknown>>, offer: Readonly<MppOffer>): boolean {
  return isWithinOffer(request['amount'], offer)
    && lowerCased(request['currency']) === offer.currency
    && lowerCased(request['recipient']) === MPP_RECIPIENT
    && !asksForSplits(request);
}

function assertListedOffer(challenge: unknown, offer: Readonly<MppOffer>): void {
  const request = isRecord(challenge) ? challenge['request'] : undefined;
  const listed = isRecord(challenge)
    && challenge['method'] === MPP_METHOD
    && challenge['intent'] === MPP_INTENT
    && isRecord(request)
    && isListedRequest(request, offer);
  if (!listed) throw new Error(REFUSED_OFFER);
}

function xquikOnly(baseFetch: FetchFunction): FetchFunction {
  return async (input, init) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    if (url.origin !== MPP_ORIGIN) {
      throw new Error('MPP payment refused. TweetClaw pays on the Xquik host only.');
    }
    return baseFetch(input, init);
  };
}

function asFetch(client: unknown): FetchFunction {
  const pay = isRecord(client) ? client['fetch'] : undefined;
  if (!isCallable(pay)) throw new Error('mppx export is invalid: Mppx.create');
  return async (input, init) => {
    const response = await pay(input, init);
    if (!(response instanceof Response)) throw new TypeError('mppx returned no response.');
    return response;
  };
}

async function initMpp(
  tempoSigningKey: string,
  baseFetch: FetchFunction,
  loadModule?: ModuleLoader,
): Promise<PayingFetch> {
  if (!TEMPO_SIGNING_KEY_PATTERN.test(tempoSigningKey)) {
    throw new Error('MPP signing key is invalid. Use a 0x-prefixed 32-byte hex key.');
  }

  const load = loadModule ?? createModuleLoader();
  const mppxMod = await load(MPP_CLIENT_MODULE).catch((): never => {
    throw new Error(`mppx is missing. ${INSTALL_HINT}`);
  });
  const viemMod = await load(VIEM_ACCOUNTS_MODULE).catch((): never => {
    throw new Error(`viem is missing. ${INSTALL_HINT}`);
  });
  if (!isCallable(viemMod['privateKeyToAccount'])) throw new Error('viem export is missing: privateKeyToAccount');
  const { tempo } = mppxMod;
  if (!isCallable(tempo)) throw new Error('mppx export is missing: tempo');
  if (!isRecord(mppxMod['Mppx'])) throw new Error('mppx export is missing: Mppx');
  const createClient: unknown = mppxMod['Mppx']['create'];
  if (!isCallable(createClient)) throw new Error('mppx export is invalid: Mppx.create');
  let account: unknown;
  try {
    account = viemMod['privateKeyToAccount'](tempoSigningKey);
  } catch {
    throw new Error('MPP signing key is invalid. Use a 0x-prefixed 32-byte hex key.');
  }

  return (offer) => asFetch(createClient({
    fetch: xquikOnly(baseFetch),
    // 1 payment for 1 request. A second challenge ends the request. https://github.com/wevm/mppx/blob/mppx@0.13.4/src/client/internal/Fetch.ts#L240
    maxPaymentRetries: 1,
    methods: [tempo({ account, expectedRecipients: [MPP_RECIPIENT] })],
    onChallenge: (challenge: unknown, helpers: unknown): unknown => {
      assertListedOffer(challenge, offer);
      const createCredential = isRecord(helpers) ? helpers['createCredential'] : undefined;
      if (!isCallable(createCredential)) throw new Error('mppx export is invalid: createCredential');
      return createCredential();
    },
    polyfill: false,
  }));
}

export { createModuleLoader, initMpp, isCallable, isRecord };
export type { ModuleLoader };
