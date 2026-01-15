import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 履歴を取得
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }

    // Supabaseが設定されていない場合
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        history: [],
        total: 0,
        message: 'テストモード：履歴機能は本番環境で利用可能です',
      });
    }

    const { data, error, count } = await supabase
      .from('salesreport_history')
      .select('*', { count: 'exact' })
      .eq('email', email)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json(
        { error: '履歴の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      history: data || [],
      total: count || 0,
    });

  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json(
      { error: '履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}

// 履歴を保存
export async function POST(req: NextRequest) {
  try {
    const { email, input, output, format, type } = await req.json();

    if (!email || !output) {
      return NextResponse.json(
        { error: '必要なデータが不足しています' },
        { status: 400 }
      );
    }

    // Supabaseが設定されていない場合
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        message: 'テストモード：履歴は保存されません',
      });
    }

    const { data, error } = await supabase
      .from('salesreport_history')
      .insert({
        email,
        input,
        output,
        format: format || 'simple',
        type: type || 'report', // 'report' or 'coaching' or 'weekly'
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('History save error:', error);
      return NextResponse.json(
        { error: '履歴の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
    });

  } catch (error) {
    console.error('History save error:', error);
    return NextResponse.json(
      { error: '履歴の保存に失敗しました' },
      { status: 500 }
    );
  }
}

// 履歴を削除
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const email = req.nextUrl.searchParams.get('email');

    if (!id || !email) {
      return NextResponse.json(
        { error: 'IDとメールアドレスが必要です' },
        { status: 400 }
      );
    }

    // Supabaseが設定されていない場合
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({
        success: true,
        message: 'テストモード',
      });
    }

    const { error } = await supabase
      .from('salesreport_history')
      .delete()
      .eq('id', id)
      .eq('email', email);

    if (error) {
      console.error('History delete error:', error);
      return NextResponse.json(
        { error: '履歴の削除に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('History delete error:', error);
    return NextResponse.json(
      { error: '履歴の削除に失敗しました' },
      { status: 500 }
    );
  }
}
