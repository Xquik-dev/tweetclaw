// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { readEventStream } from '../src/event-stream.js';

const FUZZ_RUNS = 200;
const encoder = new TextEncoder();

function streamOf(chunks: readonly string[], options: Readonly<{ close: boolean }> = { close: true }): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller): void {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      if (options.close) controller.close();
    },
  });
}

function splitAt(text: string, cuts: readonly number[]): string[] {
  const points = [...new Set(cuts.map((cut) => cut % (text.length + 1)))].toSorted((left, right) => left - right);
  const pieces: string[] = [];
  let start = 0;
  for (const point of points) {
    pieces.push(text.slice(start, point));
    start = point;
  }
  pieces.push(text.slice(start));
  return pieces.filter((piece) => piece.length > 0);
}

const event = fc.record({
  data: fc.dictionary(fc.string({ maxLength: 8 }), fc.oneof(fc.integer(), fc.string({ maxLength: 16 })), { maxKeys: 3 }),
  event: fc.stringMatching(/^[a-z][a-z.]{0,15}$/u),
  id: fc.integer({ max: 1_000_000_000, min: 1 }).map(String),
});

describe('readEventStream', () => {
  it('returns every queued event, however the frames split into chunks', async () => {
    expect.assertions(1);
    let completedRuns = 0;
    await fc.assert(
      fc.asyncProperty(fc.array(event, { maxLength: 8, minLength: 1 }), fc.array(fc.nat(), { maxLength: 6 }), fc.boolean(), async (events, cuts, crlf) => {
        const newline = crlf ? '\r\n' : '\n';
        const text = [
          `retry: 3000${newline}${newline}`,
          `: heartbeat${newline}${newline}`,
          ...events.map((item) => [`id: ${item.id}`, `event: ${item.event}`, `data: ${JSON.stringify(item.data)}`, '', ''].join(newline)),
        ].join('');
        const result = await readEventStream(streamOf(splitAt(text, cuts), { close: false }), { waitMs: 1000 });
        completedRuns += 1;
        return JSON.stringify(result) === JSON.stringify({ events, lastEventId: events.at(-1)?.id });
      }),
      { numRuns: FUZZ_RUNS },
    );
    expect(completedRuns).toBe(FUZZ_RUNS);
  });

  it('returns no events and keeps the sent ID when none arrive in the window', async () => {
    expect.assertions(1);
    const result = await readEventStream(streamOf(['retry: 3000\n\n'], { close: false }), { lastEventId: '42', waitMs: 5 });
    expect(result).toStrictEqual({ events: [], lastEventId: '42' });
  });

  it('joins multi-line data and keeps text that is not JSON', async () => {
    expect.assertions(1);
    const result = await readEventStream(streamOf(['data: first\ndata: second\n\n']), { waitMs: 1000 });
    expect(result).toStrictEqual({ events: [{ data: 'first\nsecond', event: 'message' }] });
  });

  it('closes the stream once it returns', async () => {
    expect.assertions(1);
    let cancelled = false;
    const body = new ReadableStream<Uint8Array>({
      cancel(): void {
        cancelled = true;
      },
      start(controller): void {
        controller.enqueue(encoder.encode('id: 1\nevent: tweet.new\ndata: {}\n\n'));
      },
    });
    await readEventStream(body, { waitMs: 1000 });
    expect(cancelled).toBe(true);
  });

  it('returns no events for an empty body', async () => {
    expect.assertions(1);
    await expect(readEventStream(null, { waitMs: 1000 })).resolves.toStrictEqual({ events: [] });
  });
});
