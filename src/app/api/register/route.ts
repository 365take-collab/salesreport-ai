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

    // Utage フォーム連携（新規登録時のみ）
    if (result.isNew) {
      try {
        const utageFormUrl = 'https://utage-system.com/r/SH7RQHstnrbE/store';
        const formData = new URLSearchParams();
        formData.append('mail', email);
        
        await fetch(utageFormUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
      } catch (webhookError) {
        console.error('Utage form submission error:', webhookError);
        // Utage送信失敗してもアプリは続行
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
