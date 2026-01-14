import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
export async function registerUser(email: string): Promise<{ success: boolean; isNew: boolean }> {
  // 既存ユーザーをチェック
  const { data: existing } = await supabase
    .from('salesreport_users')
    .select('email')
    .eq('email', email)
    .single();

  if (existing) {
    return { success: true, isNew: false };
  }

  // 新規登録
  const { error } = await supabase
    .from('salesreport_users')
    .insert({
      email,
      usage_count: 0,
      last_reset: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Registration error:', error);
    return { success: false, isNew: false };
  }

  return { success: true, isNew: true };
}
