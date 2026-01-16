import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { grantReferralReward } from '@/lib/supabase';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイドではService Role Keyを使用
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Utageから送られてくるデータ
    // 実際のフィールド名はUtageの仕様に合わせて調整が必要
    const {
      email,
      name,
      product_name,
      product_id,
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
    const { data, error } = await supabase
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
