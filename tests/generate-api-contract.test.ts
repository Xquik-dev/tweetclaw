// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

type JsonObject = Record<string, unknown>;

interface GeneratedOperation {
  readonly agentProhibited?: boolean;
  readonly category: string;
  readonly free: boolean;
  readonly method: string;
  readonly mpp?: { readonly amount: string; readonly currency: string; readonly price: string };
  readonly parameters: readonly JsonObject[];
  readonly path: string;
  readonly responseShape: string;
  readonly sensitive?: boolean;
  readonly summary: string;
}

interface StoredContract {
  readonly approvalFreeReads: readonly string[];
  readonly blockedOperations: readonly JsonObject[];
  readonly counts: JsonObject;
  readonly operations: ReadonlyArray<Omit<GeneratedOperation, 'parameters' | 'responseShape'> & {
    readonly parameters: readonly number[];
    readonly responseShape: number;
  }>;
  readonly parameters: readonly JsonObject[];
  readonly responseShapes: readonly string[];
  readonly sessionOnlyOperations: readonly JsonObject[];
}

interface GeneratorRun {
  readonly status: number | null;
  readonly stderr: string;
  readonly stdout: string;
}

const ROOT = '.tmp/generate-api-contract-test';
const REFERENCE_KEY = '$ref';
const README_WITH_BLOCK = [
  '# Fixture',
  '',
  '<!-- api-coverage:start (npm run generate-api-contract writes this block) -->',
  'stale',
  '<!-- api-coverage:end -->',
  '',
  'Text after the block.',
  '',
].join('\n');

const TWEET_PRICE_SENTENCE = ['Each tweet costs', '1', 'credit.'].join(' ');
const MEDIA_PRICE_SENTENCE = ['Media adds', '2', 'credits per started MB.'].join(' ');

const OK_RESPONSE = {
  content: { 'application/json': { schema: { properties: { ok: { type: 'boolean' } }, type: 'object' } } },
  description: 'OK',
};
function reference(pointer: string): JsonObject {
  return { [REFERENCE_KEY]: pointer };
}

function schema(name: string): JsonObject {
  return reference(`#/components/schemas/${name}`);
}

const PAID = reference('#/components/responses/PaymentRequired');

function stub(tag: string, extra: JsonObject = {}): JsonObject {
  return { description: `${tag} stub.`, responses: { '200': OK_RESPONSE }, tags: [tag], ...extra };
}

const POLICY_PATHS: JsonObject = {
  '/api/v1/account': { patch: stub('Account') },
  '/api/v1/account/x-identity': { put: stub('Account') },
  '/api/v1/credits/topup': { post: stub('Subscribe') },
  '/api/v1/credits/topup/status': { get: stub('Subscribe') },
  '/api/v1/radar': { get: stub('Composition') },
  '/api/v1/subscribe': { post: stub('Subscribe') },
  '/api/v1/support/tickets': { get: stub('Support'), post: stub('Support') },
  '/api/v1/support/tickets/{id}': { get: stub('Support'), patch: stub('Support') },
  '/api/v1/support/tickets/{id}/messages': { post: stub('Support') },
  '/api/v1/x/account-connection-attempts/{id}': { get: stub('X Accounts') },
  '/api/v1/x/accounts/bulk-retry': { post: stub('X Accounts') },
  '/api/v1/x/accounts/{id}': { delete: stub('X Accounts'), get: stub('X Accounts') },
  '/api/v1/x/bookmarks': {
    get: stub('Tweets', { description: 'Returns your bookmarks.', responses: { '200': OK_RESPONSE, '402': PAID } }),
  },
  '/api/v1/x/bookmarks/folders': { get: stub('Tweets') },
  '/api/v1/x/dm/{userId}/history': { get: stub('Users') },
  '/api/v1/x/notifications': { get: stub('Users') },
  '/api/v1/x/timeline': { get: stub('Tweets') },
};

const CRAFTED_PATHS: JsonObject = {
  '/api/v1/api-keys': { get: stub('API Keys', { security: [{ cookieSession: [] }] }) },
  '/api/v1/compose': {
    post: stub('Composition', {
      requestBody: {
        content: {
          'application/json': {
            schema: {
              oneOf: [schema('ComposeDraft'), schema('ComposeScore')],
            },
          },
        },
      },
    }),
  },
  '/api/v1/drafts/{id}': {
    delete: stub('Composition', { responses: { '204': { description: 'Deleted' } } }),
  },
  '/api/v1/events/stream': {
    get: stub('Events', {
      responses: { '200': { content: { 'text/event-stream': { schema: { type: 'string' } } }, description: 'Events' } },
    }),
  },
  '/api/v1/launch/pads': { get: stub('Launch Pads') },
  '/api/v1/x/accounts': { post: stub('X Accounts', { security: [{ cookieSession: [] }] }) },
  '/api/v1/x/analysis/sentiment': { post: stub('Analysis', { responses: { '200': OK_RESPONSE, '402': PAID } }) },
  '/api/v1/x/articles/{tweetId}': {
    get: stub('Articles', {
      'x-payment-info': { offers: [{ amount: '750', currency: '0x20C000000000000000000000B9537D11C60E8B50', intent: 'charge', method: 'tempo' }] },
    }),
  },
  '/api/v1/x/tweets': {
    post: {
      description: `Publishes a post. ${MEDIA_PRICE_SENTENCE}`,
      parameters: [{
        description: 'Use one unique value per write.',
        in: 'header',
        name: 'Idempotency-Key',
        required: true,
        schema: { type: 'string' },
      }],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              allOf: [
                { properties: { account: { description: 'X account.', type: 'string' } }, required: ['account'] },
                { properties: { media: { items: { type: 'string' }, type: 'array' }, text: { type: 'string' } } },
              ],
            },
          },
          'multipart/form-data': { schema: { type: 'object' } },
        },
      },
      responses: {
        '200': { content: { 'application/json': { schema: schema('WriteAction') } }, description: 'Done' },
        '202': { content: { 'application/json': { schema: schema('WriteAction') } }, description: 'Queued' },
        '402': PAID,
      },
      tags: ['X Write'],
      'x-write-action': 'create_tweet',
    },
  },
  '/api/v1/x/tweets/{id}': {
    get: {
      description: `Returns one tweet.\n${TWEET_PRICE_SENTENCE} Follow next_cursor.`,
      parameters: [
        { description: 'Tweet ID or URL.', in: 'path', name: 'id', required: true, schema: { type: 'string' } },
        reference('#/components/parameters/Sort'),
        { deprecated: true, description: 'Old cursor.', in: 'query', name: 'after', schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          content: {
            'application/json': {
              schema: {
                properties: {
                  author: schema('User'),
                  tweet: schema('Tweet'),
                },
                required: ['tweet'],
                type: 'object',
              },
            },
          },
          description: 'Tweet',
        },
        '402': PAID,
      },
      security: [{ apiKey: [] }, {}],
      tags: ['Tweets'],
      'x-payment-info': { offers: [{ amount: '150', currency: '0x20C000000000000000000000B9537D11C60E8B50', intent: 'charge', method: 'tempo' }] },
    },
    parameters: [
      { description: 'Path-level ID.', in: 'path', name: 'id', required: true, schema: { type: 'string' } },
      { description: 'Fields to keep.', in: 'query', name: 'fields', schema: { type: 'string' } },
    ],
  },
  '/ask': { get: stub('Agent Discovery') },
};

const FIXTURE_SPEC: JsonObject = {
  components: {
    parameters: {
      Sort: {
        description: 'Sort order.',
        in: 'query',
        name: 'sort',
        schema: { enum: ['Latest', 'Top'], type: 'string' },
      },
    },
    responses: { PaymentRequired: { description: 'Payment required' } },
    schemas: {
      ComposeDraft: {
        properties: { step: { description: 'Workflow step.', type: 'string' }, topic: { type: 'string' } },
        required: ['step', 'topic'],
        type: 'object',
      },
      ComposeScore: {
        properties: { draft: { type: 'string' }, hasLink: { type: 'boolean' }, step: { type: 'string' } },
        required: ['step', 'draft'],
        type: 'object',
      },
      Media: { properties: { type: { type: 'string' }, url: { type: 'string' } }, required: ['url'], type: 'object' },
      Tweet: {
        properties: {
          author: schema('User'),
          id: { type: 'string' },
          media: { items: schema('Media'), type: 'array' },
          quoted: schema('Tweet'),
          tags: { items: { type: 'string' }, type: 'array' },
          text: { type: 'string' },
        },
        required: ['id', 'text'],
        type: 'object',
      },
      User: {
        properties: { id: { type: 'string' }, pinned: schema('Tweet'), username: { type: 'string' } },
        required: ['id'],
        type: 'object',
      },
      WriteAction: {
        allOf: [
          { properties: { id: { type: 'string' } }, required: ['id'] },
          { properties: { status: { type: 'string' } } },
        ],
      },
    },
    securitySchemes: {
      apiKey: { in: 'header', name: 'x-api-key', type: 'apiKey' },
      cookieSession: { in: 'cookie', name: 'session', type: 'apiKey' },
    },
  },
  openapi: '3.1.0',
  paths: { ...POLICY_PATHS, ...CRAFTED_PATHS },
  security: [{ apiKey: [] }],
};

const EXPECTED_COVERAGE = [
  '<!-- api-coverage:start (npm run generate-api-contract writes this block) -->',
  'The live [Xquik OpenAPI spec](https://xquik.com/openapi.json) lists 31 operations. An operation is 1 method on 1 path.',
  '',
  'Agents can call 13 of them through `tweetclaw`. TweetClaw leaves out the other 18.',
  '',
  '| Left out | Operations |',
  '| --- | --- |',
  '| Account settings, API keys, billing & support, which stay in the dashboard | 15 |',
  '| X account connection, guest wallet checkout & support file downloads | 1 |',
  '| Documentation search outside `/api/v1` | 1 |',
  '| Event streams, which the tool cannot read | 1 |',
  '',
  '2 of the 13 accept MPP. Run `explore` with `mpp` set to `true` to list them.',
  '<!-- api-coverage:end -->',
].join('\n');

function writeSpec(spec: JsonObject): void {
  writeFileSync('.tmp/generate-api-contract-test/spec.json', JSON.stringify(spec));
}

function writeReadme(readme: string): void {
  writeFileSync('.tmp/generate-api-contract-test/README.md', readme);
}

function readReadme(): string {
  return readFileSync('.tmp/generate-api-contract-test/README.md', 'utf8');
}

function readContractFile(): string {
  return readFileSync('.tmp/generate-api-contract-test/generated-api-contract.json', 'utf8');
}

function generate(...flags: readonly string[]): GeneratorRun {
  const run = spawnSync(
    process.execPath,
    ['scripts/generate-api-contract.mjs', '--root', ROOT, ...flags, `${ROOT}/spec.json`],
    { encoding: 'utf8' },
  );
  return { status: run.status, stderr: run.stderr, stdout: run.stdout };
}

function withPaths(change: (paths: Record<string, JsonObject>) => void): JsonObject {
  const spec = structuredClone(FIXTURE_SPEC) as { paths: Record<string, JsonObject> };
  change(spec.paths);
  return spec;
}

function readContract(): Omit<StoredContract, 'operations' | 'parameters' | 'responseShapes'> & {
  readonly operations: ReadonlyMap<string, GeneratedOperation>;
} {
  const stored: StoredContract = JSON.parse(readContractFile());
  const { approvalFreeReads, blockedOperations, counts, sessionOnlyOperations } = stored;
  const operations = new Map<string, GeneratedOperation>();
  for (const operation of stored.operations) {
    operations.set(`${operation.method} ${operation.path}`, {
      ...operation,
      parameters: operation.parameters.map((position) => stored.parameters[position] ?? {}),
      responseShape: stored.responseShapes[operation.responseShape] ?? '',
    });
  }
  return { approvalFreeReads, blockedOperations, counts, operations, sessionOnlyOperations };
}

function generated(): ReturnType<typeof readContract> {
  generate();
  return readContract();
}

beforeEach(() => {
  mkdirSync('.tmp/generate-api-contract-test', { recursive: true });
  writeSpec(FIXTURE_SPEC);
  writeReadme(README_WITH_BLOCK);
});

afterEach(() => {
  rmSync('.tmp/generate-api-contract-test', { force: true, recursive: true });
});

describe('generate-api-contract', () => {
  it('counts 1 operation per method and path, and says what it leaves out', () => {
    expect.assertions(4);
    const run = generate();
    const contract = readContract();
    expect(run).toStrictEqual({
      status: 0,
      stderr: '',
      stdout: [
        'generate-api-contract: the spec does not publish GET /api/v1/credits/topup/redirect. It stays excluded.',
        'generate-api-contract: the spec does not publish GET /api/v1/guest-wallets/status. It stays excluded.',
        'generate-api-contract: the spec does not publish POST /api/v1/guest-wallets. It stays excluded.',
        'generate-api-contract: the spec does not publish POST /api/v1/guest-wallets/topups. It stays excluded.',
        'generate-api-contract: the spec does not publish POST /api/v1/x/account-connection-challenges/{id}/submit. It stays excluded.',
        'generate-api-contract: the spec does not publish POST /api/v1/x/accounts/{id}/reauth. It stays excluded.',
        'generate-api-contract: the spec does not publish GET /api/v1/support/attachments/{id}. It stays excluded.',
        'generate-api-contract: wrote the catalog. 13 of 31 spec operations are agent-callable.',
        '',
      ].join('\n'),
    });
    expect(contract.counts).toStrictEqual({
      callable: 13,
      cataloged: 28,
      agentProhibited: 15,
      eventStreams: 1,
      excluded: 1,
      mpp: 2,
      outsideApiV1: 1,
      specOperations: 31,
    });
    expect([...contract.operations.keys()]).not.toStrictEqual(
      expect.arrayContaining(['GET /ask', 'GET /api/v1/events/stream', 'POST /api/v1/x/accounts']),
    );
    expect(contract.blockedOperations).toStrictEqual(expect.arrayContaining([
      { method: 'GET', path: '/api/v1/events/stream' },
      { method: 'POST', path: '/api/v1/x/accounts' },
      { method: 'POST', path: '/api/v1/x/accounts/:id/reauth' },
    ]));
  });

  it('writes the README coverage block and keeps the text around it', () => {
    expect.assertions(1);
    generate();
    expect(readReadme()).toBe(`# Fixture\n\n${EXPECTED_COVERAGE}\n\nText after the block.\n`);
  });

  it('describes a read from its spec entry', () => {
    expect.assertions(1);
    expect(generated().operations.get('GET /api/v1/x/tweets/:id')).toStrictEqual({
      category: 'twitter',
      free: false,
      method: 'GET',
      mpp: { amount: '150', currency: '0x20c000000000000000000000b9537d11c60e8b50', price: '$0.00015/call' },
      parameters: [
        { description: 'Tweet ID or URL.', in: 'path', name: 'id', required: true, type: 'string' },
        { description: 'Fields to keep.', in: 'query', name: 'fields', required: false, type: 'string' },
        { description: 'Sort order. One of Latest, Top.', in: 'query', name: 'sort', required: false, type: 'string' },
        { description: 'Deprecated. Old cursor.', in: 'query', name: 'after', required: false, type: 'string' },
      ],
      path: '/api/v1/x/tweets/:id',
      responseShape:
        '{ author?: User { id, pinned?: Tweet { author?: User, id, media?: [Media], quoted?: Tweet, tags?: [string], text }, username? }, tweet: Tweet }',
      summary: 'Returns one tweet. Follow next_cursor.',
    });
  });

  it('describes a write with its approval notice, body fields, and required key', () => {
    expect.assertions(1);
    expect(generated().operations.get('POST /api/v1/x/tweets')).toStrictEqual({
      category: 'x-write',
      free: false,
      method: 'POST',
      parameters: [
        { description: 'Use one unique value per write.', in: 'header', name: 'Idempotency-Key', required: true, type: 'string' },
        { description: 'X account.', in: 'body', name: 'account', required: true, type: 'string' },
        { description: 'media', in: 'body', name: 'media', required: false, type: 'string[]' },
        { description: 'text', in: 'body', name: 'text', required: false, type: 'string' },
      ],
      path: '/api/v1/x/tweets',
      responseShape: 'WriteAction { id, status? }',
      summary: 'Publishes a post. Requires one-time approval after showing the exact target and payload.',
    });
  });

  it('requires only the body fields that every alternative requires', () => {
    expect.assertions(1);
    const compose = generated().operations.get('POST /api/v1/compose');
    expect(compose?.parameters.map((parameter) => [parameter['name'], parameter['required']])).toStrictEqual([
      ['step', true],
      ['topic', false],
      ['draft', false],
      ['hasLink', false],
    ]);
  });

  it.each([
    ['GET /api/v1/x/articles/:tweetId', '$0.00075/call'],
    ['GET /api/v1/x/tweets/:id', '$0.00015/call'],
  ])('prices %s from its MPP offer', (key, price) => {
    expect.assertions(1);
    expect(generated().operations.get(key)?.mpp?.price).toBe(price);
  });

  it('marks dashboard-only operations from the policy and from browser-only auth', () => {
    expect.assertions(3);
    const { operations } = generated();
    expect(operations.get('PATCH /api/v1/account')?.agentProhibited).toBe(true);
    expect(operations.get('GET /api/v1/api-keys')?.agentProhibited).toBe(true);
    expect(operations.get('GET /api/v1/radar')?.agentProhibited).toBeUndefined();
  });

  it('lists every /api/v1 operation that accepts only a browser session, left out ones too', () => {
    expect.assertions(1);
    expect(generated().sessionOnlyOperations).toStrictEqual([
      { method: 'GET', path: '/api/v1/api-keys' },
      { method: 'POST', path: '/api/v1/x/accounts' },
    ]);
  });

  it('marks private reads and tells the agent to wait for a request', () => {
    expect.assertions(2);
    const bookmarks = generated().operations.get('GET /api/v1/x/bookmarks');
    expect(bookmarks?.sensitive).toBe(true);
    expect(bookmarks?.summary).toBe('Returns your bookmarks. Requires explicit user request.');
  });

  it.each([
    ['GET /api/v1/radar', 'composition', true],
    ['POST /api/v1/subscribe', 'credits', true],
    ['POST /api/v1/x/analysis/sentiment', 'analysis', false],
    ['GET /api/v1/launch/pads', 'launch-pads', true],
    ['DELETE /api/v1/drafts/:id', 'composition', true],
  ])('files %s under %s', (key, category, free) => {
    expect.assertions(2);
    const operation = generated().operations.get(key);
    expect(operation?.category).toBe(category);
    expect(operation?.free).toBe(free);
  });

  it('names an empty answer by its status', () => {
    expect.assertions(1);
    expect(generated().operations.get('DELETE /api/v1/drafts/:id')?.responseShape).toBe('204 No Content');
  });

  it('lists the free reads that run without approval', () => {
    expect.assertions(1);
    expect(generated().approvalFreeReads).toStrictEqual(['GET /api/v1/radar']);
  });

  it('passes the check right after it writes', () => {
    expect.assertions(2);
    generate();
    const check = generate('--check');
    expect(check.status).toBe(0);
    expect(check.stdout).toContain('the catalog matches the spec. 13 of 31 spec operations are agent-callable.');
  });

  it('fails the check and names each operation the spec added, changed, or dropped', () => {
    expect.assertions(3);
    generate();
    const before = readContractFile();
    writeSpec(withPaths((paths) => {
      paths['/api/v1/x/lists/{id}'] = { get: stub('Lists') };
      paths['/api/v1/launch/pads'] = { get: stub('Launch Pads', { description: 'Lists launch pads.' }) };
      delete paths['/api/v1/x/analysis/sentiment'];
    }));
    const check = generate('--check');
    expect(check.status).toBe(1);
    expect(check.stderr).toBe([
      'generate-api-contract: the catalog is behind the spec.',
      '  the spec changes GET /api/v1/launch/pads',
      '  the spec adds GET /api/v1/x/lists/:id',
      '  the spec drops POST /api/v1/x/analysis/sentiment',
      'Run `npm run generate-api-contract`, review the diff, and commit it.',
      '',
    ].join('\n'));
    expect(readContractFile()).toBe(before);
  });

  it('fails the check when someone edits the README block by hand', () => {
    expect.assertions(2);
    generate();
    writeReadme(readReadme().replace('lists 31 operations', 'lists 33 operations'));
    const check = generate('--check');
    expect(check.status).toBe(1);
    expect(check.stderr).toContain('the README coverage block differs');
  });

  it.each([
    [
      'the README has no coverage block',
      FIXTURE_SPEC,
      '# No block\n',
      'README.md has no api-coverage block. Restore its start and end markers.',
    ],
    [
      'an MPP offer has no whole amount',
      withPaths((paths) => {
        paths['/api/v1/launch/pads'] = {
          get: stub('Launch Pads', { 'x-payment-info': { offers: [{ amount: '1.5', currency: '0xabc', intent: 'charge' }] } }),
        };
      }),
      README_WITH_BLOCK,
      'GET /api/v1/launch/pads has an MPP offer TweetClaw cannot price.',
    ],
    [
      'the policy names an operation the spec lacks',
      withPaths((paths) => { delete paths['/api/v1/x/timeline']; }),
      README_WITH_BLOCK,
      'catalog-policy.mjs lists GET /api/v1/x/timeline in privateReads, and the catalog has no such operation.',
    ],
    [
      'a read that skips approval is not free',
      withPaths((paths) => {
        paths['/api/v1/radar'] = { get: stub('Composition', { responses: { '200': OK_RESPONSE, '402': PAID } }) };
      }),
      README_WITH_BLOCK,
      'catalog-policy.mjs lets GET /api/v1/radar run without approval, and it is not a free, callable GET.',
    ],
    [
      'an operation uses a method the tool cannot send',
      withPaths((paths) => { paths['/api/v1/launch/pads'] = { head: stub('Launch Pads') }; }),
      README_WITH_BLOCK,
      'HEAD /api/v1/launch/pads uses a method the tool cannot send.',
    ],
    [
      'a parameter travels in a cookie',
      withPaths((paths) => {
        paths['/api/v1/launch/pads'] = {
          get: stub('Launch Pads', { parameters: [{ in: 'cookie', name: 'session', schema: { type: 'string' } }] }),
        };
      }),
      README_WITH_BLOCK,
      'GET /api/v1/launch/pads takes session in cookie.',
    ],
    [
      'an operation has no tag',
      withPaths((paths) => { paths['/api/v1/launch/pads'] = { get: { responses: { '200': OK_RESPONSE } } }; }),
      README_WITH_BLOCK,
      'GET /api/v1/launch/pads has no tag.',
    ],
    [
      'a reference points nowhere',
      withPaths((paths) => {
        paths['/api/v1/launch/pads'] = { get: stub('Launch Pads', { parameters: [reference('#/components/parameters/Gone')] }) };
      }),
      README_WITH_BLOCK,
      'OpenAPI reference is missing: #/components/parameters/Gone',
    ],
  ])('stops and writes nothing when %s', (_case, spec, readme, message) => {
    expect.assertions(3);
    writeSpec(spec);
    writeReadme(readme);
    const run = generate();
    expect(run.status).toBe(1);
    expect(run.stderr).toContain(message);
    expect(readReadme()).toBe(readme);
  });
});
