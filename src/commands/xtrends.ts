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

function isRadarResponse(value: unknown): value is RadarResponse {
  return typeof value === 'object' && value !== null && 'items' in value && 'total' in value;
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

async function handleXTrends(request: RequestFunction, categoryFilter?: string): Promise<string> {
  const query: Record<string, string> = {};
  if (categoryFilter !== undefined && categoryFilter.length > 0) {
    const trimmed = categoryFilter.trim();
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

export { formatTrends, handleXTrends };
