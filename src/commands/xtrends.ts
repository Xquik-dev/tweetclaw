// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import type { RequestFunction } from '../types.js';

interface TrendItem {
  readonly category?: string;
  readonly publishedAt?: string;
  readonly score?: number;
  readonly source?: string;
  readonly title: string;
  readonly url?: string;
}

interface RadarResponse {
  readonly items: readonly TrendItem[];
  readonly total: number;
}

interface XTrendItem {
  readonly description?: string;
  readonly name: string;
  readonly query?: string;
  readonly rank?: number;
}

interface XTrendsResponse {
  readonly total: number;
  readonly trends: readonly XTrendItem[];
  readonly woeid: number;
}

function isRadarResponse(value: unknown): value is RadarResponse {
  return typeof value === 'object' && value !== null && 'items' in value && 'total' in value;
}

function isXTrendsResponse(value: unknown): value is XTrendsResponse {
  return typeof value === 'object'
    && value !== null
    && 'total' in value
    && 'trends' in value
    && 'woeid' in value;
}

function formatTrends(radar: RadarResponse): string {
  const lines: string[] = [];
  lines.push(`--- Trending Topics (${String(radar.total)} items) ---`);

  for (const [index, item] of radar.items.entries()) {
    const position = String(index + 1);
    let line = `${position}. ${item.title}`;
    if (item.source !== undefined) {
      line += ` [${item.source}]`;
    }
    if (item.score !== undefined) {
      line += ` (score: ${String(item.score)})`;
    }
    if (item.url !== undefined) {
      line += `\n   ${item.url}`;
    }
    lines.push(line);
  }

  return lines.join('\n');
}

function formatXTrends(response: XTrendsResponse): string {
  const lines = [`--- X Trends (${String(response.total)} items, WOEID ${String(response.woeid)}) ---`];
  for (const [index, item] of response.trends.entries()) {
    const rank = item.rank ?? index + 1;
    lines.push(`${String(rank)}. ${item.name}`);
    if (item.description !== undefined) {
      lines.push(`   ${item.description}`);
    }
  }
  return lines.join('\n');
}

function mppTrendQuery(filter?: string): Readonly<Record<string, string>> | undefined {
  const trimmed = filter?.trim() ?? '';
  if (trimmed.length === 0) return undefined;
  const woeid = Number(trimmed);
  if (!Number.isSafeInteger(woeid) || woeid < 1) {
    throw new Error('MPP /xtrends accepts a numeric WOEID. Use 1 for worldwide trends.');
  }
  return { woeid: String(woeid) };
}

async function handleXTrends(
  request: RequestFunction,
  filter?: string,
  mppMode = false,
): Promise<string> {
  return mppMode
    ? handleMppTrends(request, filter)
    : handleRadarTrends(request, filter);
}

async function handleMppTrends(request: RequestFunction, filter?: string): Promise<string> {
  const query = mppTrendQuery(filter);
  const result: unknown = await request(
    '/api/v1/trends',
    query === undefined ? undefined : { query },
  );
  return isXTrendsResponse(result)
    ? formatXTrends(result)
    : '--- X Trends (0 items) ---';
}

async function handleRadarTrends(request: RequestFunction, filter?: string): Promise<string> {
  const query: Record<string, string> = {};
  if (filter !== undefined && filter.length > 0) {
    const trimmed = filter.trim();
    if (trimmed.length > 0) {
      query['category'] = trimmed;
    }
  }
  const hasQuery = Object.keys(query).length > 0;
  const result: unknown = await request('/api/v1/radar', hasQuery ? { query } : undefined);
  if (!isRadarResponse(result)) {
    return '--- Trending Topics (0 items) ---';
  }
  return formatTrends(result);
}

export { formatTrends, formatXTrends, handleXTrends, mppTrendQuery };
