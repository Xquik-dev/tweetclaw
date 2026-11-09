// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

const FRAME_END = /\r\n\r\n|\n\n|\r\r/u;
const LINE_END = /\r\n|\n|\r/u;
const DEFAULT_EVENT = 'message';
const QUEUED_READ_MS = 0;

interface StreamedEvent {
  readonly data: unknown;
  readonly event: string;
  readonly id?: string;
}

interface EventStreamRead {
  readonly events: readonly StreamedEvent[];
  readonly lastEventId?: string;
}

interface Frame {
  readonly data: readonly string[];
  readonly event: string;
  readonly id?: string;
}

type Chunk = Awaited<ReturnType<ReadableStreamDefaultReader<Uint8Array>['read']>>;

function parseData(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function addField(frame: Frame, line: string): Frame {
  const colon = line.indexOf(':');
  if (colon === 0) return frame;
  const field = colon === -1 ? line : line.slice(0, colon);
  const raw = colon === -1 ? '' : line.slice(colon + 1);
  const value = raw.startsWith(' ') ? raw.slice(1) : raw;
  if (field === 'data') return { ...frame, data: [...frame.data, value] };
  if (field === 'event') return { ...frame, event: value };
  return field === 'id' ? { ...frame, id: value } : frame;
}

function parseFrame(text: string): Frame {
  let frame: Frame = { data: [], event: DEFAULT_EVENT };
  for (const line of text.split(LINE_END)) frame = addField(frame, line);
  return frame;
}

function toEvent(frame: Frame): StreamedEvent | undefined {
  if (frame.data.length === 0) return undefined;
  return {
    data: parseData(frame.data.join('\n')),
    event: frame.event,
    ...(frame.id === undefined ? {} : { id: frame.id }),
  };
}

function settleAfter(ms: number): { readonly cancel: () => void; readonly done: Promise<undefined> } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const done = new Promise<undefined>((resolve) => {
    timer = setTimeout(resolve, ms, undefined);
  });
  return { cancel: (): void => { clearTimeout(timer); }, done };
}

async function readQueued(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<Chunk | undefined> {
  const timer = settleAfter(QUEUED_READ_MS);
  try {
    return await Promise.race([reader.read(), timer.done]);
  } finally {
    timer.cancel();
  }
}

class FrameReader {
  readonly #events: StreamedEvent[] = [];
  #buffer = '';
  #lastEventId: string | undefined;

  constructor(lastEventId: string | undefined) {
    this.#lastEventId = lastEventId;
  }

  public get count(): number {
    return this.#events.length;
  }

  public add(text: string): void {
    const frames = (this.#buffer + text).split(FRAME_END);
    this.#buffer = frames.splice(-1).join('');
    for (const frameText of frames) {
      const frame = parseFrame(frameText);
      if (frame.id !== undefined) this.#lastEventId = frame.id;
      const event = toEvent(frame);
      if (event !== undefined) this.#events.push(event);
    }
  }

  public result(): EventStreamRead {
    return {
      events: this.#events,
      ...(this.#lastEventId === undefined ? {} : { lastEventId: this.#lastEventId }),
    };
  }
}

async function readEventStream(
  body: ReadableStream<Uint8Array> | null,
  options: Readonly<{ lastEventId?: string; waitMs: number }>,
): Promise<EventStreamRead> {
  const frames = new FrameReader(options.lastEventId);
  if (body === null) return frames.result();
  const decoder = new TextDecoder();
  const reader = body.getReader();
  const window = settleAfter(options.waitMs);
  try {
    for (;;) {
      const chunk = frames.count === 0 ? await Promise.race([reader.read(), window.done]) : await readQueued(reader);
      if (chunk === undefined || chunk.done) break;
      frames.add(decoder.decode(chunk.value, { stream: true }));
    }
  } finally {
    window.cancel();
    await reader.cancel();
  }
  return frames.result();
}

export { readEventStream };
export type { EventStreamRead, StreamedEvent };
