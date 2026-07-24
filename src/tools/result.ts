// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { truncateResponse } from '../truncate.js';
import type { ToolResult } from '../types.js';

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.constructor.name}: ${error.message}`;
  }
  return String(error);
}

function successResult(content: unknown): ToolResult {
  return { content: [{ text: truncateResponse(content), type: 'text' }] };
}

function errorResult(error: unknown): ToolResult {
  return { content: [{ text: extractErrorMessage(error), type: 'text' }], isError: true };
}

export { errorResult, extractErrorMessage, successResult };
