import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 6桁の認証コードを生成
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ユーザーの使用回数を取得
export async function getUsageCount(email: string): Promise<number> {
  const { data, error } = await supabase
    .from('salesreport_users')
    .select('usage_count, last_reset')
    .eq('email', email)
    .single();

  if (error || !data) {
    return 0;
  }

  // 月が変わっていたらリセット
  const lastReset = new Date(data.last_reset);
  const now = new Date();
  if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    await supabase
      .from('salesreport_users')
      .update({ usage_count: 0, last_reset: now.toISOString() })
      .eq('email', email);
    return 0;
  }

  return data.usage_count || 0;
}

// メール認証状態を確認
export async function isEmailVerified(email: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('salesreport_users')
    .select('email_verified')
    .eq('email', email)
    .single();

  if (error || !data) {
    return false;
  }

  return data.email_verified === true;
}

// 認証コードを検証
export async function verifyCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase
    .from('salesreport_users')
    .select('verification_code, verification_expires_at')
    .eq('email', email)
    .single();

  if (error || !data) {
    return { success: false, message: 'ユーザーが見つかりません' };
  }

  // 有効期限チェック
  if (data.verification_expires_at && new Date(data.verification_expires_at) < new Date()) {
    return { success: false, message: '認証コードの有効期限が切れています。再送信してください。' };
  }

  // コード一致チェック
  if (data.verification_code !== code) {
    return { success: false, message: '認証コードが正しくありません' };
  }

  // 認証成功 → email_verified = true に更新
  const { error: updateError } = await supabase
    .from('salesreport_users')
    .update({ 
      email_verified: true,
      verification_code: null,
      verification_expires_at: null
    })
    .eq('email', email);

  if (updateError) {
    return { success: false, message: '認証の更新に失敗しました' };
  }

  return { success: true, message: 'メール認証が完了しました！' };
}

// 認証コードを再送信（更新）
export async function updateVerificationCode(email: string): Promise<{ success: boolean; code: string }> {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分後

  const { error } = await supabase
    .from('salesreport_users')
    .update({ 
      verification_code: code,
      verification_expires_at: expiresAt.toISOString()
    })
    .eq('email', email);

  if (error) {
    return { success: false, code: '' };
  }

  return { success: true, code };
}

// 使用回数をインクリメント
export async function incrementUsage(email: string): Promise<{ success: boolean; count: number }> {
  const currentCount = await getUsageCount(email);
  
  const { error } = await supabase
    .from('salesreport_users')
    .update({ usage_count: currentCount + 1 })
    .eq('email', email);

  if (error) {
    return { success: false, count: currentCount };
  }

  return { success: true, count: currentCount + 1 };
}

// ユーザー登録（メールアドレスのみ）
// ※ 一時的にメール認証をスキップ（本番リリース前にResend導入で対応予定）
export async function registerUser(email: string): Promise<{ success: boolean; isNew: boolean; verificationCode?: string; needsVerification?: boolean }> {
  // 既存ユーザーをチェック
  const { data: existing } = await supabase
    .from('salesreport_users')
    .select('email, email_verified, streak_count, last_used_at')
    .eq('email', email)
    .single();

  if (existing) {
    // 既存ユーザー → 認証済みとして扱う（一時的にスキップ）
    if (!existing.email_verified) {
      await supabase
        .from('salesreport_users')
        .update({ email_verified: true })
        .eq('email', email);
    }
    return { success: true, isNew: false, needsVerification: false };
  }

  // 新規登録（認証済みとして登録 - 一時的にスキップ）
  const { error } = await supabase
    .from('salesreport_users')
    .insert({
      email,
      usage_count: 0,
      last_reset: new Date().toISOString(),
      created_at: new Date().toISOString(),
      email_verified: true, // 一時的にスキップ
      streak_count: 0,
      last_used_at: null,
      sales_score: 0,
    });

  if (error) {
    console.error('Registration error:', error);
    return { success: false, isNew: false };
  }

  return { success: true, isNew: true, needsVerification: false };
}

// ストリーク（連続使用日数）を更新
export async function updateStreak(email: string): Promise<{ streak: number; isNewDay: boolean }> {
  const { data } = await supabase
    .from('salesreport_users')
    .select('streak_count, last_used_at')
    .eq('email', email)
    .single();

  if (!data) {
    return { streak: 0, isNewDay: false };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastUsed = data.last_used_at ? new Date(data.last_used_at) : null;
  const lastUsedDay = lastUsed ? new Date(lastUsed.getFullYear(), lastUsed.getMonth(), lastUsed.getDate()) : null;

  let newStreak = data.streak_count || 0;
  let isNewDay = false;

  if (!lastUsedDay) {
    // 初回使用
    newStreak = 1;
    isNewDay = true;
  } else {
    const diffDays = Math.floor((today.getTime() - lastUsedDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // 同日 → ストリーク維持
      isNewDay = false;
    } else if (diffDays === 1) {
      // 連続 → ストリーク+1
      newStreak = (data.streak_count || 0) + 1;
      isNewDay = true;
    } else {
      // 2日以上空いた → リセット
      newStreak = 1;
      isNewDay = true;
    }
  }

  if (isNewDay) {
    await supabase
      .from('salesreport_users')
      .update({ 
        streak_count: newStreak,
        last_used_at: now.toISOString()
      })
      .eq('email', email);
  }

  return { streak: newStreak, isNewDay };
}

// 営業スコアを計算・更新
export async function updateSalesScore(email: string): Promise<number> {
  const { data } = await supabase
    .from('salesreport_users')
    .select('usage_count, streak_count, referral_count')
    .eq('email', email)
    .single();

  if (!data) {
    return 0;
  }

  // スコア計算式（Duolingo/Grammarly式）
  // 使用回数 × 10 + ストリーク × 5 + 紹介人数 × 50
  const score = 
    (data.usage_count || 0) * 10 + 
    (data.streak_count || 0) * 5 + 
    (data.referral_count || 0) * 50;

  await supabase
    .from('salesreport_users')
    .update({ sales_score: score })
    .eq('email', email);

  return score;
}

// ユーザーのダッシュボードデータを取得
export async function getUserDashboard(email: string): Promise<{
  usageCount: number;
  streak: number;
  salesScore: number;
  referralCount: number;
  emailVerified: boolean;
}> {
  const { data } = await supabase
    .from('salesreport_users')
    .select('usage_count, streak_count, sales_score, referral_count, email_verified, last_reset')
    .eq('email', email)
    .single();

  if (!data) {
    return {
      usageCount: 0,
      streak: 0,
      salesScore: 0,
      referralCount: 0,
      emailVerified: false,
    };
  }

  // 月が変わっていたらリセット
  const lastReset = new Date(data.last_reset);
  const now = new Date();
  let usageCount = data.usage_count || 0;
  
  if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
    await supabase
      .from('salesreport_users')
      .update({ usage_count: 0, last_reset: now.toISOString() })
      .eq('email', email);
    usageCount = 0;
  }

  return {
    usageCount,
    streak: data.streak_count || 0,
    salesScore: data.sales_score || 0,
    referralCount: data.referral_count || 0,
    emailVerified: data.email_verified || false,
  };
}
