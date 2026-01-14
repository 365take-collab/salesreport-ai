import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PROMPTS = {
  simple: `あなたは営業日報を作成するアシスタントです。
以下の商談メモから、シンプルな箇条書き形式の営業日報を作成してください。

【形式】
■ 訪問先: 
■ 担当者: 
■ 内容:
  - 
  - 
■ 次のアクション:

簡潔に、要点だけをまとめてください。`,

  detailed: `あなたは営業日報を作成するアシスタントです。
以下の商談メモから、詳細な営業日報を作成してください。

【形式】
━━━━━━━━━━━━━━━━━━━━━━━━
■ 基本情報
  訪問先: 
  担当者: 
  日時: 本日

■ 商談内容
  【背景・目的】
  
  【提案内容】
  
  【先方の反応】

■ 結果・所感

■ 次のアクション
  - 
━━━━━━━━━━━━━━━━━━━━━━━━

詳しく、上司が状況を把握できるように書いてください。`,

  narrative: `あなたは営業日報を作成するアシスタントです。
以下の商談メモから、自然な文章形式の営業日報を作成してください。

【形式】
本日、〇〇株式会社の〇〇様と打ち合わせを行いました。

（ここに商談の内容を自然な文章で記載）

次回のアクションとして、〇〇を予定しています。

読みやすい文章で、上司に報告するような形式で書いてください。`,

  weekly: `あなたは営業週報を作成するアシスタントです。
以下の商談メモから、週報形式でまとめてください。

【形式】
━━━━━━━━━━━━━━━━━━━━━━━━
📅 週報: ○月○日〜○月○日

■ 今週の活動サマリー
  訪問件数: ○件
  商談件数: ○件
  
■ 主な商談内容
  1. 
  2.
  
■ 成果・進捗
  
■ 課題・懸念事項

■ 来週の予定・目標
━━━━━━━━━━━━━━━━━━━━━━━━

週の振り返りとして、成果と課題を明確にまとめてください。`,

  executive: `あなたは経営層向けの営業レポートを作成するアシスタントです。
以下の商談メモから、エグゼクティブ向けの簡潔なレポートを作成してください。

【形式】
━━━━━━━━━━━━━━━━━━━━━━━━
📊 エグゼクティブサマリー

【結論】
（1行で結論を記載）

【概要】
・顧客: 
・案件規模: 
・確度: ○○%
・次のマイルストーン:

【リスク/課題】
・

【アクション依頼】
・
━━━━━━━━━━━━━━━━━━━━━━━━

経営層が1分で状況を把握できるよう、簡潔かつインパクトのある形式で書いてください。`,
};

export async function POST(req: NextRequest) {
  try {
    const { input, format } = await req.json();

    if (!input || !format) {
      return NextResponse.json(
        { error: '入力データが不足しています' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 500 }
      );
    }

    const systemPrompt = PROMPTS[format as keyof typeof PROMPTS] || PROMPTS.simple;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下の商談メモから日報を作成してください:\n\n${input}` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const report = completion.choices[0]?.message?.content || '日報の生成に失敗しました。';

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: '日報の生成に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
