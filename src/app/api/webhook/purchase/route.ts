import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { grantReferralReward } from '@/lib/supabase';
import { verifyHmacSha256Signature } from '@/lib/webhook-signature';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイドではService Role Keyを使用
);

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-utage-signature');
    const timestamp = request.headers.get('x-utage-timestamp');
    const secret = process.env.UTAGE_WEBHOOK_SECRET;

    if (!secret) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 500 });
      }
      console.warn('UTAGE_WEBHOOK_SECRET is not configured. Skipping signature check in non-production.');
    } else {
      if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
      }

      const isValid = verifyHmacSha256Signature({
        rawBody,
        secret,
        signature,
        timestamp,
      });

      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const body = JSON.parse(rawBody);
    
    // Utageから送られてくるデータ
    // 実際のフィールド名はUtageの仕様に合わせて調整が必要
    const {
      email,
      name,
      product_name,
      amount,
      transaction_id,
    } = body;

    console.log('Purchase webhook received:', { email, product_name, amount });

    // プラン判定
    let plan = 'free';
    if (product_name?.includes('Pro') || amount >= 9800) {
      plan = 'pro';
    } else if (product_name?.includes('Basic') || amount >= 980) {
      plan = 'basic';
    }

    // 年間プラン判定
    const isAnnual = product_name?.includes('年額') || amount >= 9800 && !product_name?.includes('Pro');

    // Supabaseにユーザー情報を保存/更新
    const { error } = await supabase
      .from('salesreport_users')
      .upsert({
        email,
        name,
        plan,
        is_annual: isAnnual,
        subscribed_at: new Date().toISOString(),
        transaction_id,
        product_name,
        amount,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('User plan updated:', { email, plan });

    // 紹介報酬を付与（紹介経由の場合）
    let referralReward = null;
    try {
      const rewardResult = await grantReferralReward(email);
      if (rewardResult.success) {
        referralReward = {
          referrerEmail: rewardResult.referrerEmail,
          reward: rewardResult.reward,
        };
        console.log('Referral reward granted:', referralReward);
      }
    } catch (referralError) {
      console.error('Referral reward error:', referralError);
      // 紹介報酬の失敗は購入処理を止めない
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase recorded',
      plan,
      referralReward,
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GETリクエストはヘルスチェック用
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'purchase webhook' });
}
