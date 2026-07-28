// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import assert from 'node:assert/strict';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { truncateResponse, truncateText } from '../src/truncate.js';

const MAX_RESPONSE_CHARS = 24_000;
const FUZZ_RUNS = 250;

describe('truncate fuzz properties', () => {
  it('bounds arbitrary text without changing its retained prefix', () => {
    expect.assertions(1);
    let completedRuns = 0;

    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ maxLength: 256 }),
          fc.string({ minLength: 23_990, maxLength: 24_010 }),
          fc.string({ minLength: 24_001, maxLength: 50_000 }),
        ),
        (text) => {
          const output = truncateText(text);
          if (text.length <= MAX_RESPONSE_CHARS) {
            assert.equal(output, text);
          } else {
            assert.equal(output.slice(0, MAX_RESPONSE_CHARS), text.slice(0, MAX_RESPONSE_CHARS));
            assert.match(output, /\n\n--- TRUNCATED ---\n/u);
            assert.ok(output.length < MAX_RESPONSE_CHARS + 256);
          }
          completedRuns += 1;
        },
      ),
      { numRuns: FUZZ_RUNS },
    );

    expect(completedRuns).toBe(FUZZ_RUNS);
  });

  it('serializes arbitrary JSON values deterministically', () => {
    expect.assertions(1);
    let completedRuns = 0;

    fc.assert(
      fc.property(fc.jsonValue(), (value) => {
        const expected =
          typeof value === 'string' ? value : truncateText(JSON.stringify(value, undefined, 2));
        assert.equal(truncateResponse(value), expected);
        completedRuns += 1;
      }),
      { numRuns: FUZZ_RUNS },
    );

    expect(completedRuns).toBe(FUZZ_RUNS);
  });
});
