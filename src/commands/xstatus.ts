// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import type { RequestFunction } from '../types.js';

interface AccountResponse {
  readonly email?: string;
  readonly locale?: string;
  readonly subscription?: {
    readonly isActive?: boolean;
    readonly plan?: string;
  };
  readonly usage?: {
    readonly percent?: number;
    readonly remaining?: number;
  };
  readonly xUsername?: string;
}

function isAccountResponse(value: unknown): value is AccountResponse {
  return typeof value === 'object' && value !== null;
}

function formatSubscriptionLine(subscription: AccountResponse['subscription']): string {
  if (subscription === undefined) {
    return '';
  }
  const status = subscription.isActive === true ? 'Active' : 'Inactive';
  const planSuffix = subscription.plan === undefined ? '' : ` (${subscription.plan})`;
  return `Subscription: ${status}${planSuffix}`;
}

function formatUsageLines(usage: AccountResponse['usage']): readonly string[] {
  if (usage === undefined) {
    return [];
  }
  const lines: string[] = [];
  if (usage.percent !== undefined) {
    lines.push(`Usage: ${String(usage.percent)}%`);
  }
  if (usage.remaining !== undefined) {
    lines.push(`Remaining: ${String(usage.remaining)}`);
  }
  return lines;
}

function formatAccountStatus(account: AccountResponse): string {
  const lines: string[] = [];
  lines.push('--- Xquik Account Status ---');

  if (account.xUsername !== undefined) {
    lines.push(`X Account: @${account.xUsername}`);
  }
  if (account.email !== undefined) {
    lines.push(`Email: ${account.email}`);
  }
  if (account.locale !== undefined) {
    lines.push(`Locale: ${account.locale}`);
  }

  const subscriptionLine = formatSubscriptionLine(account.subscription);
  if (subscriptionLine.length > 0) {
    lines.push(subscriptionLine);
  }

  lines.push(...formatUsageLines(account.usage));

  return lines.join('\n');
}

async function handleXStatus(request: RequestFunction): Promise<string> {
  const result: unknown = await request('/api/v1/account');
  if (!isAccountResponse(result)) {
    return '--- Xquik Account Status ---';
  }
  return formatAccountStatus(result);
}

export { formatAccountStatus, handleXStatus };
