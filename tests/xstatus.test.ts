// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

import { describe, expect, it } from 'vitest';
import { formatAccountStatus, handleXStatus } from '../src/commands/xstatus.js';
import type { RequestFunction } from '../src/types.js';

describe('formatAccountStatus', () => {
  it('formats complete account info', () => {
    expect.assertions(5);
    const result = formatAccountStatus({
      email: 'test@example.com',
      locale: 'en',
      subscription: { isActive: true, plan: 'pro' },
      usage: { percent: 45, remaining: 550 },
      xUsername: 'testuser',
    });
    expect(result).toContain('@testuser');
    expect(result).toContain('test@example.com');
    expect(result).toContain('Active (pro)');
    expect(result).toContain('45%');
    expect(result).toContain('550');
  });

  it('formats inactive subscription', () => {
    expect.assertions(1);
    const result = formatAccountStatus({
      subscription: { isActive: false },
    });
    expect(result).toContain('Inactive');
  });

  it('formats partial usage fields independently', () => {
    expect.assertions(3);
    const remainingOnly = formatAccountStatus({ usage: { remaining: 5 } });
    const percentOnly = formatAccountStatus({ usage: { percent: 25 } });
    expect(remainingOnly).toContain('Remaining: 5');
    expect(remainingOnly).not.toContain('Usage:');
    expect(percentOnly).toContain('Usage: 25%');
  });

  it('handles missing fields gracefully', () => {
    expect.assertions(1);
    const result = formatAccountStatus({});
    expect(result).toContain('Xquik account status');
  });
});

describe('handleXStatus', () => {
  it('calls /api/v1/account and formats response', async () => {
    expect.assertions(2);
    const mockRequest: RequestFunction = async (path) => {
      expect(path).toBe('/api/v1/account');
      return { email: 'user@test.com', xUsername: 'demo' };
    };
    const result = await handleXStatus(mockRequest);
    expect(result).toContain('@demo');
  });

  it('propagates request errors', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => {
      throw new Error('auth failed');
    };
    await expect(handleXStatus(mockRequest)).rejects.toThrow('auth failed');
  });

  it('returns fallback when response is not an object', async () => {
    expect.assertions(1);
    const mockRequest: RequestFunction = async () => 'not an object';
    const result = await handleXStatus(mockRequest);
    expect(result).toBe('Xquik account status');
  });
});
