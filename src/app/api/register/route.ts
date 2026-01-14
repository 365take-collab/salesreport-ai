import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUsageCount } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    // Supabaseが設定されていない場合はスキップ
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        isNew: true,
        usageCount: 0,
        message: 'メールアドレスを登録しました（テストモード）',
      });
    }

    const result = await registerUser(email);

    if (!result.success) {
      return NextResponse.json(
        { error: '登録に失敗しました。もう一度お試しください。' },
        { status: 500 }
      );
    }

    const usageCount = await getUsageCount(email);

    // Utage Webhook連携（オプション）
    if (process.env.UTAGE_WEBHOOK_URL && result.isNew) {
      try {
        await fetch(process.env.UTAGE_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'salesreport-ai' }),
        });
      } catch (webhookError) {
        console.error('Utage webhook error:', webhookError);
      }
    }

    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      usageCount,
      message: result.isNew 
        ? 'メールアドレスを登録しました！' 
        : 'おかえりなさい！',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 500 }
    );
  }
}
