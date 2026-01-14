import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // サーバーサイドではService Role Keyを使用
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Utageから送られてくるデータ
    const {
      email,
      product_name,
      reason,
    } = body;

    console.log('Cancel webhook received:', { email, product_name, reason });

    // Supabaseでユーザーのプランをfreeに戻す
    const { data, error } = await supabase
      .from('users')
      .update({
        plan: 'free',
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    console.log('User plan cancelled:', { email });

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription cancelled',
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GETリクエストはヘルスチェック用
export async function GET() {
  return NextResponse.json({ status: 'ok', endpoint: 'cancel webhook' });
}
