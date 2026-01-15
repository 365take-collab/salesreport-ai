import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// LTV計算ロジック
function calculateLTV(user: {
  plan: string;
  subscribed_at: string | null;
  is_annual: boolean;
  referral_count: number;
}) {
  const monthlyPrices: Record<string, number> = {
    free: 0,
    basic: 980,
    pro: 9800,
    enterprise: 29800,
  };

  const basePrice = monthlyPrices[user.plan] || 0;
  
  // 継続月数を計算
  let months = 1;
  if (user.subscribed_at) {
    const subscribed = new Date(user.subscribed_at);
    const now = new Date();
    months = Math.max(1, Math.floor((now.getTime() - subscribed.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  }

  // 年額プランは12ヶ月分
  if (user.is_annual) {
    months = 12;
  }

  // 紹介による追加価値（紹介1人 = 1ヶ月分の価値）
  const referralValue = user.referral_count * basePrice;

  return basePrice * months + referralValue;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    if (type === 'overview') {
      // 全体のサマリー
      const { data: users, error } = await supabase
        .from('salesreport_users')
        .select('*');

      if (error) throw error;

      const stats = {
        totalUsers: users?.length || 0,
        freeUsers: users?.filter(u => u.plan === 'free').length || 0,
        basicUsers: users?.filter(u => u.plan === 'basic').length || 0,
        proUsers: users?.filter(u => u.plan === 'pro').length || 0,
        enterpriseUsers: users?.filter(u => u.plan === 'enterprise').length || 0,
        totalLTV: 0,
        averageLTV: 0,
        mrr: 0, // Monthly Recurring Revenue
        arr: 0, // Annual Recurring Revenue
        churnRate: 0,
        referralCount: 0,
      };

      // LTV計算
      const ltvs = users?.map(user => calculateLTV({
        plan: user.plan,
        subscribed_at: user.subscribed_at,
        is_annual: user.is_annual || false,
        referral_count: user.referral_count || 0,
      })) || [];

      stats.totalLTV = ltvs.reduce((sum, ltv) => sum + ltv, 0);
      stats.averageLTV = stats.totalUsers > 0 ? stats.totalLTV / stats.totalUsers : 0;

      // MRR計算
      const monthlyPrices: Record<string, number> = { basic: 980, pro: 9800, enterprise: 29800 };
      stats.mrr = users?.reduce((sum, u) => sum + (monthlyPrices[u.plan] || 0), 0) || 0;
      stats.arr = stats.mrr * 12;

      // 解約率計算
      const cancelledUsers = users?.filter(u => u.status === 'cancelled').length || 0;
      const paidUsers = stats.basicUsers + stats.proUsers + stats.enterpriseUsers + cancelledUsers;
      stats.churnRate = paidUsers > 0 ? (cancelledUsers / paidUsers) * 100 : 0;

      // 紹介数
      stats.referralCount = users?.reduce((sum, u) => sum + (u.referral_count || 0), 0) || 0;

      return NextResponse.json(stats);
    }

    if (type === 'users') {
      // ユーザー一覧
      const { data: users, error } = await supabase
        .from('salesreport_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const usersWithLTV = users?.map(user => ({
        ...user,
        ltv: calculateLTV({
          plan: user.plan,
          subscribed_at: user.subscribed_at,
          is_annual: user.is_annual || false,
          referral_count: user.referral_count || 0,
        }),
      }));

      return NextResponse.json(usersWithLTV);
    }

    if (type === 'cohort') {
      // コホート分析（月別ユーザー獲得・継続）
      const { data: users, error } = await supabase
        .from('salesreport_users')
        .select('created_at, plan, status');

      if (error) throw error;

      const cohorts: Record<string, { acquired: number; retained: number; converted: number }> = {};

      users?.forEach(user => {
        const month = user.created_at?.slice(0, 7) || 'unknown';
        if (!cohorts[month]) {
          cohorts[month] = { acquired: 0, retained: 0, converted: 0 };
        }
        cohorts[month].acquired++;
        if (user.status === 'active') cohorts[month].retained++;
        if (user.plan !== 'free') cohorts[month].converted++;
      });

      return NextResponse.json(cohorts);
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
