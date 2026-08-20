// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { truncateResponse, truncateText } from '../src/truncate.js';

describe('truncateText', () => {
  it('passes through text under limit', () => {
    expect.assertions(1);
    const short = 'hello world';
    expect(truncateText(short)).toBe(short);
  });

  it('passes through text exactly at limit', () => {
    expect.assertions(1);
    const exact = 'x'.repeat(24_000);
    expect(truncateText(exact)).toBe(exact);
  });

  it('truncates text over limit with notice', () => {
    expect.assertions(3);
    const long = 'a'.repeat(30_000);
    const result = truncateText(long);
    expect(result).toContain('--- RESPONSE TRUNCATED ---');
    expect(result).toContain('7,500');
    expect(result).toContain('Limit: 6,000');
  });

  it('includes correct token count estimation', () => {
    expect.assertions(1);
    const text = 'b'.repeat(48_000);
    const result = truncateText(text);
    expect(result).toContain('12,000');
  });
});

describe('truncateResponse', () => {
  it('stringifies objects', () => {
    expect.assertions(1);
    const result = truncateResponse({ key: 'value' });
    expect(result).toContain('"key": "value"');
  });

  it('returns string content as-is', () => {
    expect.assertions(1);
    expect(truncateResponse('hello')).toBe('hello');
  });

  it('handles undefined', () => {
    expect.assertions(1);
    const value: unknown = undefined;
    expect(truncateResponse(value)).toBe('undefined');
  });

  it('truncates large objects', () => {
    expect.assertions(1);
    const large = { data: 'x'.repeat(30_000) };
    const result = truncateResponse(large);
    expect(result).toContain('--- RESPONSE TRUNCATED ---');
  });
});
