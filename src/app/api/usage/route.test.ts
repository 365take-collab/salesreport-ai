import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: { 'content-type': 'application/json' },
      }),
  },
}));

vi.mock('@/lib/supabase', () => ({
  getUsageCount: vi.fn(),
  incrementUsage: vi.fn(),
  getUserDashboard: vi.fn(),
  updateStreak: vi.fn(),
  updateSalesScore: vi.fn(),
}));

import { GET, POST } from './route';
import {
  getUsageCount,
  incrementUsage,
  getUserDashboard,
  updateStreak,
  updateSalesScore,
} from '@/lib/supabase';

const mockedGetUsageCount = vi.mocked(getUsageCount);
const mockedIncrementUsage = vi.mocked(incrementUsage);
const mockedGetUserDashboard = vi.mocked(getUserDashboard);
const mockedUpdateStreak = vi.mocked(updateStreak);
const mockedUpdateSalesScore = vi.mocked(updateSalesScore);

function createGetRequest(url: string): NextRequest {
  return {
    nextUrl: new URL(url),
  } as NextRequest;
}

function createPostRequest(body: unknown): NextRequest {
  return {
    json: async () => body,
  } as NextRequest;
}

describe('usage route', () => {
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (typeof originalSupabaseUrl === 'undefined') {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      return;
    }

    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  });

  it('GET: email がない場合は 400 を返す', async () => {
    const response = await GET(createGetRequest('http://localhost/api/usage'));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: 'メールアドレスが必要です' });
  });

  it('GET: Supabase 未設定時はデフォルト値を返す', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const response = await GET(
      createGetRequest('http://localhost/api/usage?email=test@example.com')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      usageCount: 0,
      limit: 3,
      remaining: 3,
      canUse: true,
      emailVerified: true,
      streak: 0,
      salesScore: 0,
      referralCount: 0,
    });
    expect(mockedGetUserDashboard).not.toHaveBeenCalled();
  });

  it('GET: Supabase 設定時はダッシュボード情報を返す', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    mockedGetUserDashboard.mockResolvedValue({
      usageCount: 2,
      emailVerified: true,
      streak: 5,
      salesScore: 75,
      referralCount: 1,
      referralCode: 'ABC12345',
      referralCredits: 500,
    });

    const response = await GET(
      createGetRequest('http://localhost/api/usage?email=test@example.com')
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockedGetUserDashboard).toHaveBeenCalledWith('test@example.com');
    expect(body).toMatchObject({
      usageCount: 2,
      limit: 3,
      remaining: 1,
      canUse: true,
      emailVerified: true,
      streak: 5,
      salesScore: 75,
      referralCount: 1,
      referralCode: 'ABC12345',
      referralCredits: 500,
    });
  });

  it('POST: 無料上限に達している場合は利用不可を返す', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    mockedGetUsageCount.mockResolvedValue(3);

    const response = await POST(createPostRequest({ email: 'test@example.com' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: false,
      usageCount: 3,
      limit: 3,
      remaining: 0,
      canUse: false,
    });
    expect(mockedIncrementUsage).not.toHaveBeenCalled();
    expect(mockedUpdateStreak).not.toHaveBeenCalled();
    expect(mockedUpdateSalesScore).not.toHaveBeenCalled();
  });

  it('POST: 通常利用時は使用回数とスコアを更新して返す', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    mockedGetUsageCount.mockResolvedValue(1);
    mockedIncrementUsage.mockResolvedValue({ success: true, count: 2 });
    mockedUpdateStreak.mockResolvedValue({ streak: 4, isNewDay: true });
    mockedUpdateSalesScore.mockResolvedValue(90);

    const response = await POST(createPostRequest({ email: 'test@example.com' }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mockedGetUsageCount).toHaveBeenCalledWith('test@example.com');
    expect(mockedIncrementUsage).toHaveBeenCalledWith('test@example.com');
    expect(mockedUpdateStreak).toHaveBeenCalledWith('test@example.com');
    expect(mockedUpdateSalesScore).toHaveBeenCalledWith('test@example.com');
    expect(body).toMatchObject({
      success: true,
      usageCount: 2,
      limit: 3,
      remaining: 1,
      canUse: true,
      streak: 4,
      isNewDay: true,
      salesScore: 90,
    });
  });
});
