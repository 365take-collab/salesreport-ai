import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIクライアントを遅延初期化
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const WEEKLY_REPORT_PROMPT = `あなたは営業マネージャーのアシスタントです。
1週間分の営業日報から、週次レポートを作成してください。

【週次レポートの形式】
━━━━━━━━━━━━━━━━━━━━━━━━
📊 週次営業レポート

■ 今週のサマリー
  - 訪問件数: 
  - 商談件数: 
  - 受注見込み案件: 
  - 総見込み金額: 

■ 主要な商談
  1. 
  2. 
  3. 

■ 今週の成果
  - 
  - 

■ 課題・懸念事項
  - 
  - 

■ 来週の重点アクション
  1. 
  2. 
  3. 

■ 所感・コメント

━━━━━━━━━━━━━━━━━━━━━━━━

数値は可能な限り具体的に、マネージャーが状況を把握しやすいように記載してください。`;

export async function POST(req: NextRequest) {
  try {
    const { dailyReports } = await req.json();

    if (!dailyReports || !Array.isArray(dailyReports) || dailyReports.length === 0) {
      return NextResponse.json(
        { error: '日報データが必要です' },
        { status: 400 }
      );
    }

    // OpenAIクライアントを取得
    let openai: OpenAI;
    try {
      openai = getOpenAIClient();
    } catch {
      return NextResponse.json(
        { error: 'APIキーが設定されていません。管理者に連絡してください。' },
        { status: 500 }
      );
    }

    // 日報を結合
    const combinedReports = dailyReports
      .map((report: { date: string; content: string }, index: number) => 
        `【${report.date || `Day ${index + 1}`}】\n${report.content}`
      )
      .join('\n\n---\n\n');

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: WEEKLY_REPORT_PROMPT },
        { role: 'user', content: `以下の1週間分の日報から週次レポートを作成してください:\n\n${combinedReports}` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const weeklyReport = completion.choices[0]?.message?.content || '週次レポートの生成に失敗しました。';

    return NextResponse.json({ weeklyReport });
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return NextResponse.json(
      { error: '週次レポートの生成に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
