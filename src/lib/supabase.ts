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
export async function registerUser(email: string): Promise<{ success: boolean; isNew: boolean; verificationCode?: string; needsVerification?: boolean }> {
  // 既存ユーザーをチェック
  const { data: existing } = await supabase
    .from('salesreport_users')
    .select('email, email_verified')
    .eq('email', email)
    .single();

  if (existing) {
    // 既存ユーザーで未認証の場合は認証コードを再生成
    if (!existing.email_verified) {
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分後

      await supabase
        .from('salesreport_users')
        .update({ 
          verification_code: code,
          verification_expires_at: expiresAt.toISOString()
        })
        .eq('email', email);

      return { success: true, isNew: false, verificationCode: code, needsVerification: true };
    }
    return { success: true, isNew: false, needsVerification: false };
  }

  // 新規登録（認証コード付き）
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分後

  const { error } = await supabase
    .from('salesreport_users')
    .insert({
      email,
      usage_count: 0,
      last_reset: new Date().toISOString(),
      created_at: new Date().toISOString(),
      email_verified: false,
      verification_code: code,
      verification_expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error('Registration error:', error);
    return { success: false, isNew: false };
  }

  return { success: true, isNew: true, verificationCode: code, needsVerification: true };
}
