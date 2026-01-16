-- ============================================
-- SalesReport AI 紹介システム スキーマ
-- ============================================
-- Supabaseダッシュボード > SQL Editor で実行してください

-- 1. salesreport_users テーブルに紹介関連カラムを追加
-- ※ 既存のreferral_countに加えて、紹介コードと報酬を追加
ALTER TABLE salesreport_users
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT,
ADD COLUMN IF NOT EXISTS referral_credits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_referral_earnings INTEGER DEFAULT 0;

-- 2. 紹介コードのインデックス
CREATE INDEX IF NOT EXISTS idx_referral_code ON salesreport_users(referral_code);
CREATE INDEX IF NOT EXISTS idx_referred_by ON salesreport_users(referred_by);

-- 3. 紹介トラッキングテーブル（詳細な履歴を保存）
CREATE TABLE IF NOT EXISTS salesreport_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_email TEXT NOT NULL,           -- 紹介者のメール
  referred_email TEXT NOT NULL,           -- 紹介された人のメール
  referral_code TEXT NOT NULL,            -- 使用された紹介コード
  status TEXT DEFAULT 'registered',       -- registered, converted, paid, cancelled
  reward_type TEXT DEFAULT 'credits',     -- credits, cash, free_month
  reward_amount INTEGER DEFAULT 0,        -- 報酬額（credits or 円）
  created_at TIMESTAMPTZ DEFAULT now(),   -- 紹介された日時
  converted_at TIMESTAMPTZ,               -- 有料転換した日時
  paid_at TIMESTAMPTZ,                    -- 報酬支払い日時
  notes TEXT                              -- メモ
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON salesreport_referrals(referrer_email);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON salesreport_referrals(referred_email);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON salesreport_referrals(status);

-- 4. 紹介報酬設定テーブル（管理者が設定変更可能）
CREATE TABLE IF NOT EXISTS salesreport_referral_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  reward_per_signup INTEGER DEFAULT 0,        -- 登録時の報酬（0=なし）
  reward_per_conversion INTEGER DEFAULT 500,  -- 有料転換時の報酬（円 or credits）
  reward_type TEXT DEFAULT 'credits',         -- credits, cash, free_month
  max_referrals_per_month INTEGER DEFAULT 100,-- 月間紹介上限
  referral_discount_percent INTEGER DEFAULT 10, -- 紹介された人への割引（%）
  is_active BOOLEAN DEFAULT true,             -- 紹介プログラム有効/無効
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 初期設定を挿入
INSERT INTO salesreport_referral_settings (id, reward_per_conversion, reward_type)
VALUES (1, 500, 'credits')
ON CONFLICT (id) DO NOTHING;

-- 5. 紹介コード生成用の関数（完全ランダム8文字）
CREATE OR REPLACE FUNCTION generate_referral_code(user_email TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  final_code TEXT;
  i INTEGER;
BEGIN
  -- 完全ランダム8文字のコードを生成（紛らわしい文字0,O,1,Iを除外）
  LOOP
    final_code := '';
    FOR i IN 1..8 LOOP
      final_code := final_code || SUBSTR(chars, FLOOR(RANDOM() * LENGTH(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- 重複チェック
    EXIT WHEN NOT EXISTS (SELECT 1 FROM salesreport_users WHERE referral_code = final_code);
  END LOOP;
  
  RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- 6. 既存ユーザーに紹介コードを自動付与するトリガー
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code(NEW.email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_referral_code ON salesreport_users;
CREATE TRIGGER trigger_auto_referral_code
BEFORE INSERT ON salesreport_users
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- 7. 既存ユーザーに紹介コードを付与（一度だけ実行）
UPDATE salesreport_users
SET referral_code = generate_referral_code(email)
WHERE referral_code IS NULL;

-- 8. 全ユーザーの紹介コードを完全ランダムに再生成（一度だけ実行）
-- ※ 注意: 既にシェアされたリンクは無効になります
-- UPDATE salesreport_users SET referral_code = generate_referral_code();

-- ============================================
-- 確認クエリ
-- ============================================
-- SELECT email, referral_code, referral_count, referral_credits FROM salesreport_users LIMIT 10;
-- SELECT * FROM salesreport_referral_settings;
