// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

const MAX_RESPONSE_CHARS = 24_000;
const CHARS_PER_TOKEN = 4;
const MAX_TOKENS = 6000;

function truncateText(text: string): string {
  if (text.length <= MAX_RESPONSE_CHARS) {
    return text;
  }
  const approximateTokens = Math.ceil(text.length / CHARS_PER_TOKEN);
  const formatted = approximateTokens.toLocaleString('en-US');
  return `${text.slice(0, MAX_RESPONSE_CHARS)}\n\n--- TRUNCATED ---\nResponse was ~${formatted} tokens (limit: ${MAX_TOKENS.toLocaleString('en-US')}). Use more specific queries or filters to reduce response size.`;
}

function stringifyContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (content === undefined) {
    return 'undefined';
  }
  return JSON.stringify(content, undefined, 2);
}

function truncateResponse(content: unknown): string {
  return truncateText(stringifyContent(content));
}

export { truncateResponse, truncateText };
