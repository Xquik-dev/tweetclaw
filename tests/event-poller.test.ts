import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createEventPoller } from '../src/services/event-poller.js';
import type { RequestFunction } from '../src/types.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createEventPoller', () => {
  it('starts and stops without error', () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => ({ events: [] });
    const poller = createEventPoller({
      intervalSeconds: 60,
      onEvents: () => {},
      request: mockRequest,
    });
    poller.stop();
    poller.start();
    poller.stop();
    poller.stop();
    expect(true).toBe(true);
  });

  it('polls events after interval', async () => {
    expect.assertions(2);
    let callCount = 0;
    const mockRequest: RequestFunction = async () => {
      callCount += 1;
      return { events: [{ eventType: 'tweet.new', id: 'evt_1', xUsername: 'test' }] };
    };
    const receivedEvents: unknown[] = [];
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: (events) => { receivedEvents.push(...events); },
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1500);
    poller.stop();
    expect(callCount).toBeGreaterThanOrEqual(1);
    expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
  });

  it('tracks cursor from last event', async () => {
    expect.assertions(1);
    const cursors: Array<string | undefined> = [];
    const mockRequest: RequestFunction = async (_path, options) => {
      cursors.push(options?.query?.after);
      return { events: [{ eventType: 'tweet.new', id: 'evt_42', xUsername: 'test' }] };
    };
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: () => {},
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1500);
    await vi.advanceTimersByTimeAsync(1500);
    poller.stop();
    expect(cursors.includes('evt_42')).toBe(true);
  });

  it('continues polling after errors with backoff', async () => {
    expect.assertions(1);
    let callCount = 0;
    const mockRequest: RequestFunction = async () => {
      callCount += 1;
      if (callCount <= 2) {
        throw new Error('network error');
      }
      return { events: [] };
    };
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: () => {},
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(10_000);
    poller.stop();
    expect(callCount).toBeGreaterThanOrEqual(3);
  });

  it('does not deliver empty events', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => ({ events: [] });
    let delivered = false;
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: () => { delivered = true; },
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1500);
    poller.stop();
    expect(delivered).toBe(false);
  });

  it('handles non-event response gracefully', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => 'not an events response';
    let delivered = false;
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: () => { delivered = true; },
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1500);
    poller.stop();
    expect(delivered).toBe(false);
  });

  it('handles events without id field for cursor', async () => {
    expect.assertions(2);
    let callCount = 0;
    const mockRequest: RequestFunction = async () => {
      callCount += 1;
      if (callCount === 1) {
        return { events: [{ eventType: 'test', noIdHere: true }] };
      }
      return { events: [{ eventType: 'test2', id: 42 }] };
    };
    const receivedEvents: unknown[] = [];
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: (events) => { receivedEvents.push(...events); },
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1500);
    await vi.advanceTimersByTimeAsync(1500);
    poller.stop();
    expect(callCount).toBeGreaterThanOrEqual(2);
    expect(receivedEvents.length).toBeGreaterThanOrEqual(1);
  });

  it('handles stop during active poll', async () => {
    expect.assertions(1);
    let resolveRequest: (() => void) | undefined;
    const mockRequest: RequestFunction = async () => {
      await new Promise<void>((resolve) => { resolveRequest = resolve; });
      return { events: [] };
    };
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: () => {},
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1000);
    poller.stop();
    if (resolveRequest !== undefined) {
      resolveRequest();
    }
    await vi.advanceTimersByTimeAsync(100);
    expect(true).toBe(true);
  });

  it('stops cleanly and does not poll after stop', async () => {
    expect.assertions(1);
    let callCount = 0;
    const mockRequest: RequestFunction = async () => {
      callCount += 1;
      return { events: [] };
    };
    const poller = createEventPoller({
      intervalSeconds: 1,
      onEvents: () => {},
      request: mockRequest,
    });
    poller.start();
    await vi.advanceTimersByTimeAsync(1500);
    const countAfterFirstPoll = callCount;
    poller.stop();
    await vi.advanceTimersByTimeAsync(5000);
    expect(callCount).toBe(countAfterFirstPoll);
  });
});
