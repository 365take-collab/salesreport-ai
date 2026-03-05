import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
    const {
      email,
      product_name,
      reason,
    } = body;

    console.log('Cancel webhook received:', { email, product_name, reason });

    // Supabaseでユーザーのプランをfreeに戻す
    const { error } = await supabase
      .from('salesreport_users')
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
