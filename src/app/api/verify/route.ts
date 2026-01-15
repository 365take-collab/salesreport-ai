import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 確認コード生成
function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

// メール送信（Utage Webhookまたは外部サービス経由）
async function sendVerificationEmail(email: string, code: string) {
  // Utage Webhook経由でメール送信
  const webhookUrl = process.env.UTAGE_VERIFICATION_WEBHOOK_URL;
  
  if (webhookUrl) {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        verification_code: code,
      }),
    });
  }
  
  // ログ出力（開発用）
  console.log(`Verification code for ${email}: ${code}`);
}

// 確認コード送信
export async function POST(request: NextRequest) {
  try {
    const { email, action } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // 確認コード生成・保存
      const code = generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分有効

      // Supabaseに保存
      const { error: upsertError } = await supabase
        .from('salesreport_users')
        .upsert({
          email,
          verification_code: code,
          verification_expires_at: expiresAt.toISOString(),
          email_verified: false,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        return NextResponse.json(
          { error: 'Failed to save verification code' },
          { status: 500 }
        );
      }

      // メール送信
      await sendVerificationEmail(email, code);

      return NextResponse.json({
        success: true,
        message: 'Verification code sent',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 確認コード検証
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Supabaseから確認
    const { data: user, error } = await supabase
      .from('salesreport_users')
      .select('verification_code, verification_expires_at')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // コード検証
    if (user.verification_code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // 有効期限チェック
    if (new Date(user.verification_expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }

    // 認証完了
    await supabase
      .from('salesreport_users')
      .update({
        email_verified: true,
        verification_code: null,
        verification_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
