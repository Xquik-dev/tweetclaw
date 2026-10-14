// SPDX-FileCopyrightText: 2026 Xquik Contributors
// SPDX-License-Identifier: MIT

import { truncateResponse } from '../truncate.js';
import type { ToolResult } from '../types.js';

function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? `${error.constructor.name}: ${error.message}` : String(error);
}

function successResult(content: unknown): ToolResult {
  return { content: [{ text: truncateResponse(content), type: 'text' }], details: undefined };
}

function errorResult(error: unknown): ToolResult {
  return { content: [{ text: extractErrorMessage(error), type: 'text' }], details: undefined, isError: true };
}

export { errorResult, extractErrorMessage, successResult };
