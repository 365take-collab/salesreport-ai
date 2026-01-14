import { NextRequest, NextResponse } from 'next/server';
import { getUsageCount, incrementUsage } from '@/lib/supabase';

const FREE_LIMIT = 3; // 無料プランの月間制限

// 使用回数を取得
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    // Supabaseが設定されていない場合
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        usageCount: 0,
        limit: FREE_LIMIT,
        remaining: FREE_LIMIT,
        canUse: true,
      });
    }

    const usageCount = await getUsageCount(email);
    const remaining = Math.max(0, FREE_LIMIT - usageCount);

    return NextResponse.json({
      usageCount,
      limit: FREE_LIMIT,
      remaining,
      canUse: usageCount < FREE_LIMIT,
    });

  } catch (error) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: '使用回数の確認に失敗しました' },
      { status: 500 }
    );
  }
}

// 使用回数をインクリメント
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    // Supabaseが設定されていない場合
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        usageCount: 1,
        limit: FREE_LIMIT,
        remaining: FREE_LIMIT - 1,
        canUse: true,
      });
    }

    const currentCount = await getUsageCount(email);

    if (currentCount >= FREE_LIMIT) {
      return NextResponse.json({
        success: false,
        usageCount: currentCount,
        limit: FREE_LIMIT,
        remaining: 0,
        canUse: false,
        message: '今月の無料利用回数を超えました。アップグレードしてください。',
      });
    }

    const result = await incrementUsage(email);
    const remaining = Math.max(0, FREE_LIMIT - result.count);

    return NextResponse.json({
      success: true,
      usageCount: result.count,
      limit: FREE_LIMIT,
      remaining,
      canUse: result.count < FREE_LIMIT,
    });

  } catch (error) {
    console.error('Usage increment error:', error);
    return NextResponse.json(
      { error: '使用回数の更新に失敗しました' },
      { status: 500 }
    );
  }
}
