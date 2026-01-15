import { NextRequest, NextResponse } from 'next/server';
import { registerUser, getUsageCount, isEmailVerified } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, source } = await req.json();

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
        needsVerification: false,
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
    const verified = await isEmailVerified(email);

    // 認証コードをメールで送信（Utage経由）
    if (result.needsVerification && result.verificationCode) {
      try {
        // 認証コード送信用のUtageフォームに送信
        // ※ Utageで認証コード送信用のシナリオを作成し、そのフォームURLを設定
        const utageVerificationFormUrl = process.env.UTAGE_VERIFICATION_FORM_URL || 'https://utage-system.com/r/SH7RQHstnrbE/store';
        const formData = new URLSearchParams();
        formData.append('mail', email);
        formData.append('verification_code', result.verificationCode);
        
        await fetch(utageVerificationFormUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
      } catch (webhookError) {
        console.error('Verification email error:', webhookError);
        // メール送信失敗してもアプリは続行
      }
    }

    // 新規登録時のUtage連携（通常のウェルカムメール用）
    if (result.isNew && source !== 'lead_magnet') {
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
      }
    }

    return NextResponse.json({
      success: true,
      isNew: result.isNew,
      usageCount,
      needsVerification: result.needsVerification && !verified,
      emailVerified: verified,
      message: result.isNew 
        ? '認証コードをメールに送信しました。メールをご確認ください。' 
        : verified 
          ? 'おかえりなさい！' 
          : '認証コードをメールに再送信しました。',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '登録に失敗しました' },
      { status: 500 }
    );
  }
}
