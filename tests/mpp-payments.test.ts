// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { createServer } from 'node:http';
import { Challenge, Credential, Receipt } from 'mppx';
import { Mppx } from 'mppx/client';
import { generatePrivateKey } from 'viem/accounts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { register } from '../src/index.js';
import type { IncomingMessage, Server } from 'node:http';
import type { AddressInfo } from 'node:net';

type RegistrationApi = Parameters<typeof register>[0];
type RegisteredTool = Parameters<RegistrationApi['registerTool']>[0];
type RegisteredCommand = Parameters<RegistrationApi['registerCommand']>[0];

interface Seen {
  readonly path: string;
  readonly payment?: string;
}

interface Answer {
  readonly body?: unknown;
  readonly headers?: Readonly<Record<string, string>>;
  readonly status: number;
}

interface LocalServer {
  readonly seen: Seen[];
  readonly server: Server;
}

interface Offer {
  readonly amount: string;
  readonly currency: string;
  readonly methodDetails?: Readonly<Record<string, unknown>>;
  readonly recipient: string;
}

const XQUIK_HOST = 'xquik.com';
const OTHER_HOST = 'other.test';
const RPC_HOST = 'rpc.tempo.xyz';
const TEMPO_MAINNET = 4217;
const TRENDS_OFFER: Offer = {
  amount: '150',
  currency: '0x20c000000000000000000000b9537d11c60e8b50',
  methodDetails: { chainId: TEMPO_MAINNET },
  recipient: '0xbe6c07f6fce303483458a7ddc929eb50a8ae6574',
};
const ARTICLE_AMOUNT = '750';
const OTHER_ADDRESS = '0x1111111111111111111111111111111111111111';
const TRENDS = { total: 1, trends: [{ name: 'Fake trend', rank: 1 }], woeid: 1 };
const RECEIPT_REFERENCE = `0x${'cd'.repeat(32)}`;

const servers: LocalServer[] = [];
const ports = new Map<string, number>();
const blockedHosts: string[] = [];

function paymentOf(request: IncomingMessage): string | undefined {
  const { authorization } = request.headers;
  return authorization?.startsWith('Payment ') === true
    ? Credential.deserialize<{ type: string }>(authorization).payload.type
    : undefined;
}

async function listen(host: string, respond: (request: IncomingMessage, body: string) => Answer): Promise<LocalServer> {
  const seen: Seen[] = [];
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer) => { chunks.push(chunk); });
    request.on('end', () => {
      const payment = paymentOf(request);
      seen.push({ path: request.url ?? '', ...(payment === undefined ? {} : { payment }) });
      const answer = respond(request, Buffer.concat(chunks).toString('utf8'));
      response.writeHead(answer.status, { 'content-type': 'application/json', ...answer.headers });
      response.end(JSON.stringify(answer.body ?? {}));
    });
  });
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve); });
  const { port } = server.address() as AddressInfo;
  ports.set(host, port);
  const local = { seen, server };
  servers.push(local);
  return local;
}

function paymentRequired(realm: string, offer: Offer): Answer {
  const challenge = Challenge.from({
    expires: new Date(Date.now() + 60_000).toISOString(),
    intent: 'charge',
    method: 'tempo',
    realm,
    request: { ...offer },
    secretKey: 'local-test-server',
  });
  return {
    body: { error: 'payment_required' },
    headers: { 'www-authenticate': Challenge.serialize(challenge) },
    status: 402,
  };
}

function paidAnswer(): Answer {
  const receipt = Receipt.from({
    method: 'tempo',
    reference: RECEIPT_REFERENCE,
    status: 'success',
    timestamp: new Date().toISOString(),
  });
  return { body: TRENDS, headers: { 'payment-receipt': Receipt.serialize(receipt) }, status: 200 };
}

async function chargingServer(host: string, offer: Offer): Promise<LocalServer> {
  return listen(host, (request) => (paymentOf(request) === undefined ? paymentRequired(host, offer) : paidAnswer()));
}

const RPC_RESULTS: Readonly<Record<string, unknown>> = {
  eth_chainId: `0x${TEMPO_MAINNET.toString(16)}`,
  eth_estimateGas: '0x30d40',
  eth_getBlockByNumber: { baseFeePerGas: '0x3b9aca00', number: '0x10', timestamp: '0x6705e000', transactions: [] },
  eth_maxPriorityFeePerGas: '0x3b9aca00',
};

async function chainServer(): Promise<LocalServer> {
  return listen(RPC_HOST, (_request, body) => {
    const call = JSON.parse(body) as { readonly id: number; readonly method: string };
    const result = RPC_RESULTS[call.method];
    return {
      body: result === undefined
        ? { error: { code: -32_601, message: 'Method not found' }, id: call.id, jsonrpc: '2.0' }
        : { id: call.id, jsonrpc: '2.0', result },
      status: 200,
    };
  });
}

function payments(local: LocalServer): readonly Seen[] {
  return local.seen.filter((request) => request.payment !== undefined);
}

function loadPlugin(config: Readonly<Record<string, unknown>> = {}): {
  readonly call: (params: Readonly<Record<string, unknown>>) => Promise<{ readonly isError: boolean; readonly text: string }>;
  readonly trendsCommand: () => Promise<string>;
} {
  const tools: RegisteredTool[] = [];
  const commands: RegisteredCommand[] = [];
  register({
    logger: { error: () => {}, info: () => {}, warn: () => {} },
    on: () => {},
    pluginConfig: { tempoSigningKey: generatePrivateKey(), ...config },
    registerCommand: (command) => { commands.push(command); },
    registerService: () => {},
    registerTool: (tool) => { tools.push(tool); },
  });
  return {
    call: async (params) => {
      const result = await tools.find((tool) => tool.name === 'tweetclaw')?.execute('call_1', params);
      return { isError: result?.isError === true, text: result?.content[0]?.text ?? '' };
    },
    trendsCommand: async () => {
      const result = await commands.find((command) => command.name === 'xtrends')?.handler({});
      return result?.text ?? '';
    },
  };
}

beforeEach(() => {
  const networkFetch = globalThis.fetch;
  vi.stubGlobal('fetch', async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const port = ports.get(url.host);
    if (port === undefined) {
      blockedHosts.push(url.host);
      throw new Error(`The test reaches localhost only. It stopped a request to ${url.host}.`);
    }
    const local = `http://127.0.0.1:${String(port)}${url.pathname}${url.search}`;
    const answer = await networkFetch(input instanceof Request ? new Request(local, input) : local, init);
    return new Response(answer.body, { headers: answer.headers, status: answer.status });
  });
});

afterEach(async () => {
  Mppx.restore();
  vi.unstubAllGlobals();
  ports.clear();
  await Promise.all(servers.splice(0).map(async ({ server }) => new Promise((resolve) => { server.close(resolve); })));
  expect(blockedHosts.splice(0)).toStrictEqual([]);
});

describe('MPP payments', () => {
  it('pays the listed price for a route on the Xquik host', async () => {
    expect.assertions(3);
    const xquik = await chargingServer(XQUIK_HOST, TRENDS_OFFER);
    await chainServer();
    const result = await loadPlugin().call({ path: '/api/v1/x/trends', query: { count: 1 } });
    expect(result).toStrictEqual({ isError: false, text: JSON.stringify(TRENDS, undefined, 2) });
    expect(xquik.seen).toStrictEqual([
      { path: '/api/v1/x/trends?count=1' },
      { path: '/api/v1/x/trends?count=1', payment: 'transaction' },
    ]);
    expect(payments(xquik)).toHaveLength(1);
  });

  it('pays a price below the listed one', async () => {
    expect.assertions(2);
    const xquik = await chargingServer(XQUIK_HOST, { ...TRENDS_OFFER, amount: '100' });
    await chainServer();
    const result = await loadPlugin().call({ path: '/api/v1/x/trends' });
    expect(result.isError).toBe(false);
    expect(payments(xquik)).toHaveLength(1);
  });

  it('pays through the trends command', async () => {
    expect.assertions(2);
    const xquik = await chargingServer(XQUIK_HOST, TRENDS_OFFER);
    await chainServer();
    const text = await loadPlugin().trendsCommand();
    expect(text).toContain('Fake trend');
    expect(xquik.seen).toStrictEqual([{ path: '/api/v1/trends' }, { path: '/api/v1/trends', payment: 'transaction' }]);
  });

  it.each([
    ['a price above the listed one', { ...TRENDS_OFFER, amount: '151' }],
    ['the price of another route', { ...TRENDS_OFFER, amount: ARTICLE_AMOUNT }],
    ['another recipient', { ...TRENDS_OFFER, recipient: OTHER_ADDRESS }],
    ['another currency', { ...TRENDS_OFFER, currency: OTHER_ADDRESS }],
    [
      'a second recipient',
      { ...TRENDS_OFFER, methodDetails: { chainId: TEMPO_MAINNET, splits: [{ amount: '50', recipient: OTHER_ADDRESS }] } },
    ],
  ])('pays nothing when the server asks for %s', async (_case, offer) => {
    expect.assertions(2);
    const xquik = await chargingServer(XQUIK_HOST, offer);
    await chainServer();
    const result = await loadPlugin().call({ path: '/api/v1/x/trends' });
    expect(result.isError).toBe(true);
    expect(payments(xquik)).toStrictEqual([]);
  });

  it('pays once when the server asks again', async () => {
    expect.assertions(2);
    const xquik = await listen(XQUIK_HOST, () => paymentRequired(XQUIK_HOST, TRENDS_OFFER));
    await chainServer();
    const result = await loadPlugin().call({ path: '/api/v1/x/trends' });
    expect(result.isError).toBe(true);
    expect(payments(xquik)).toHaveLength(1);
  });

  it('pays nothing for a route without a listed price', async () => {
    expect.assertions(2);
    const xquik = await chargingServer(XQUIK_HOST, TRENDS_OFFER);
    const result = await loadPlugin().call({ path: '/api/v1/x/tweets/search', query: { q: 'ai' } });
    expect(result.isError).toBe(true);
    expect(xquik.seen).toStrictEqual([]);
  });

  it('pays nothing after a redirect', async () => {
    expect.assertions(3);
    const xquik = await listen(XQUIK_HOST, () => ({ headers: { location: `https://${OTHER_HOST}/pay` }, status: 302 }));
    const other = await chargingServer(OTHER_HOST, TRENDS_OFFER);
    const result = await loadPlugin().call({ path: '/api/v1/x/trends' });
    expect(result.isError).toBe(true);
    expect(payments(xquik)).toStrictEqual([]);
    expect(other.seen).toStrictEqual([]);
  });

  it('pays nothing on a base URL that is not the Xquik host', async () => {
    expect.assertions(2);
    const other = await chargingServer(OTHER_HOST, TRENDS_OFFER);
    const result = await loadPlugin({ baseUrl: `https://${OTHER_HOST}` }).call({ path: '/api/v1/x/trends' });
    expect(result.text).toContain('TweetClaw pays on the Xquik host only.');
    expect(other.seen).toStrictEqual([]);
  });

  it('pays nothing for a request the plugin did not make', async () => {
    expect.assertions(3);
    await chargingServer(XQUIK_HOST, TRENDS_OFFER);
    await chainServer();
    const other = await chargingServer(OTHER_HOST, TRENDS_OFFER);
    await loadPlugin().call({ path: '/api/v1/x/trends' });
    const response = await fetch(`https://${OTHER_HOST}/data`);
    const xquikResponse = await fetch(`https://${XQUIK_HOST}/api/v1/x/trends`);
    expect(response.status).toBe(402);
    expect(xquikResponse.status).toBe(402);
    expect(other.seen).toStrictEqual([{ path: '/data' }]);
  });

  it('leaves the global fetch as it found it', async () => {
    expect.assertions(2);
    await chargingServer(XQUIK_HOST, TRENDS_OFFER);
    await chainServer();
    const before = globalThis.fetch;
    const plugin = loadPlugin();
    const afterLoad = globalThis.fetch;
    await plugin.call({ path: '/api/v1/x/trends' });
    expect(afterLoad).toBe(before);
    expect(globalThis.fetch).toBe(before);
  });
});
