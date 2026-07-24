// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      'openclaw/plugin-sdk/plugin-entry': new URL('tests/openclaw-plugin-entry.ts', import.meta.url).pathname,
    },
  },
  test: {
    coverage: {
      exclude: ['src/types.ts', 'src/mpp.ts'],
      include: ['src/**/*.ts'],
      thresholds: {
        branches: 100,
        functions: 100,
        lines: 100,
        statements: 100,
      },
    },
  },
});
