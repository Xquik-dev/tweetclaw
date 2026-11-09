// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import assert from 'node:assert/strict';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { truncateResponse, truncateText } from '../src/truncate.js';

const MAX_RESPONSE_CHARS = 24_000;
const FUZZ_RUNS = 250;

// A random head, then a random unit repeated to a random length. Drawing every character of a 50,000 character string took
// most of the test's 5 second budget on a loaded runner, and the property depends on the length and the retained prefix.
function sizedText(minLength: number, maxLength: number): fc.Arbitrary<string> {
  return fc
    .tuple(fc.string({ maxLength: 256 }), fc.string({ minLength: 1, maxLength: 64 }), fc.integer({ min: minLength, max: maxLength }))
    .map(([head, unit, length]) => (head + unit.repeat(Math.ceil(length / unit.length))).slice(0, length));
}

describe('truncate fuzz properties', () => {
  it('bounds arbitrary text without changing its retained prefix', () => {
    expect.assertions(1);
    let completedRuns = 0;

    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ maxLength: 256 }),
          sizedText(23_990, 24_010),
          sizedText(24_001, 50_000),
        ),
        (text) => {
          const output = truncateText(text);
          if (text.length <= MAX_RESPONSE_CHARS) {
            assert.equal(output, text);
          } else {
            assert.equal(output.slice(0, MAX_RESPONSE_CHARS), text.slice(0, MAX_RESPONSE_CHARS));
            assert.match(output, /\n\n--- RESPONSE TRUNCATED ---\n/u);
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
