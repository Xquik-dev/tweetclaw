import type { EventPollerOptions } from '../types.js';

const MAX_BACKOFF_SECONDS = 300;
const BACKOFF_BASE = 2;
const MS_PER_SECOND = 1000;

interface EventsResponse {
  readonly events: ReadonlyArray<Record<string, unknown>>;
  readonly hasMore?: boolean;
  readonly nextCursor?: string;
}

function isEventsResponse(value: unknown): value is EventsResponse {
  return typeof value === 'object' && value !== null && 'events' in value;
}

interface EventPollerHandle {
  readonly start: () => void;
  readonly stop: () => void;
}

function extractCursor(events: ReadonlyArray<Readonly<Record<string, unknown>>>): string | undefined {
  const lastEvent = events.at(-1);
  return typeof lastEvent?.['id'] === 'string' ? lastEvent['id'] : undefined;
}

function createEventPoller(options: EventPollerOptions): EventPollerHandle {
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  let cursor: string | undefined = undefined;
  let consecutiveErrors = 0;
  let stopped = false;

  async function poll(): Promise<void> {
    try {
      const query: Record<string, string> = {};
      if (cursor !== undefined) {
        query['after'] = cursor;
      }
      const hasQuery = Object.keys(query).length > 0;
      const result: unknown = await options.request(
        '/api/v1/events',
        hasQuery ? { query } : undefined,
      );

      if (!isEventsResponse(result)) {
        return;
      }

      if (result.events.length > 0) {
        options.onEvents(result.events);
        const newCursor = extractCursor(result.events);
        if (newCursor !== undefined) {
          cursor = newCursor;
        }
      }

      consecutiveErrors = 0;
    } catch {
      consecutiveErrors += 1;
    }
  }

  function getNextInterval(): number {
    if (consecutiveErrors === 0) {
      return options.intervalSeconds * MS_PER_SECOND;
    }
    const backoffSeconds = Math.min(
      Math.pow(BACKOFF_BASE, consecutiveErrors) * options.intervalSeconds,
      MAX_BACKOFF_SECONDS,
    );
    return backoffSeconds * MS_PER_SECOND;
  }

  async function loop(): Promise<void> {
    await poll();
    if (stopped) {
      return;
    }
    timer = setTimeout(() => { void loop(); }, getNextInterval());
  }

  return {
    start(): void {
      stopped = false;
      timer = setTimeout(() => { void loop(); }, options.intervalSeconds * MS_PER_SECOND);
    },
    stop(): void {
      stopped = true;
      if (timer !== undefined) {
        clearTimeout(timer);
        timer = undefined;
      }
    },
  };
}

export { createEventPoller };
