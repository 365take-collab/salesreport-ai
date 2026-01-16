import { NextRequest, NextResponse } from 'next/server';
import { 
  getReferralCode, 
  validateReferralCode, 
  getReferralHistory,
  generateReferralLink 
} from '@/lib/supabase';

// GET: 紹介コード・紹介リンク・紹介履歴を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const action = searchParams.get('action');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 紹介コードを取得
    const referralCode = await getReferralCode(email);
    const referralLink = generateReferralLink(referralCode);

    // 履歴も取得する場合
    if (action === 'history') {
      const history = await getReferralHistory(email);
      return NextResponse.json({
        success: true,
        referralCode,
        referralLink,
        ...history,
      });
    }

    return NextResponse.json({
      success: true,
      referralCode,
      referralLink,
    });

  } catch (error) {
    console.error('Referral API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 紹介コードを検証
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    const result = await validateReferralCode(code);

    return NextResponse.json({
      success: true,
      valid: result.valid,
      message: result.valid 
        ? '有効な紹介コードです' 
        : '紹介コードが見つかりません',
    });

  } catch (error) {
    console.error('Referral validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
