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

  bant: `あなたは営業日報を作成するアシスタントです。
以下の商談メモから、BANT形式の営業日報を作成してください。

【形式】
━━━━━━━━━━━━━━━━━━━━━━━━
📊 BANT分析レポート

■ 基本情報
  訪問先: 
  担当者: 

■ BANT分析
  【Budget（予算）】
  ・予算規模: 
  ・予算確保状況: 

  【Authority（決裁権）】
  ・決裁者: 
  ・決裁プロセス: 

  【Need（ニーズ）】
  ・顕在ニーズ: 
  ・潜在ニーズ: 
  ・課題: 

  【Timeline（導入時期）】
  ・希望時期: 
  ・スケジュール感: 

■ 受注確度: ○○%
■ 次のアクション:
━━━━━━━━━━━━━━━━━━━━━━━━

営業戦略の立案に役立つよう、BANT情報を詳しく分析してください。`,

  report: `あなたは営業日報を作成するアシスタントです。
以下の商談メモから、会社向けの正式な報告書形式の営業日報を作成してください。

【形式】
━━━━━━━━━━━━━━━━━━━━━━━━
営業活動報告書

報告日: 本日
報告者: 

1. 訪問概要
  訪問先: 
  訪問日時: 
  面談者: 
  訪問目的: 

2. 商談内容
  2.1 先方の状況
  
  2.2 提案内容
  
  2.3 先方の反応・要望

3. 結果と評価
  商談結果: 
  受注見込: 

4. 今後の対応
  次回アクション: 
  期限: 

5. 所見・課題

以上
━━━━━━━━━━━━━━━━━━━━━━━━

正式な報告書として、丁寧かつ詳細に記載してください。`,

  sales: `あなたは営業日報を作成するアシスタントです。
以下の商談メモから、営業チーム向けの日報を作成してください。

【形式】
━━━━━━━━━━━━━━━━━━━━━━━━
📝 営業日報

【訪問先】
・会社名: 
・担当者: 
・部署・役職: 

【商談サマリー】
（3行以内で要約）

【詳細】
・背景: 
・課題: 
・提案: 
・反応: 

【競合情報】


【案件ステータス】
・フェーズ: 
・確度: ○%
・予算: 

【ネクストアクション】
・タスク: 
・期限: 

【コメント・気づき】

━━━━━━━━━━━━━━━━━━━━━━━━

営業チームが情報を共有しやすい形式で記載してください。`,
};

export async function POST(req: NextRequest) {
  try {
    const { input, format, customPrompt } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: '商談メモを入力してください' },
        { status: 400 }
      );
    }

    // OpenAIクライアントを取得
    let openai: OpenAI;
    try {
      openai = getOpenAIClient();
    } catch (e) {
      console.error('OpenAI client error:', e);
      return NextResponse.json(
        { error: 'APIキーが設定されていません。管理者に連絡してください。' },
        { status: 500 }
      );
    }

    // カスタムプロンプトがある場合はそれを使用（Proプラン用）
    let systemPrompt: string;
    if (customPrompt) {
      systemPrompt = `あなたは営業日報を作成するアシスタントです。
以下のカスタムフォーマットに従って、営業日報を作成してください。

【カスタムフォーマット】
${customPrompt}

フォーマットに従って、簡潔かつ正確に日報を作成してください。`;
    } else {
      systemPrompt = PROMPTS[format as keyof typeof PROMPTS] || PROMPTS.simple;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下の商談メモから日報を作成してください:\n\n${input}` },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const report = completion.choices[0]?.message?.content || '日報の生成に失敗しました。';

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: '日報の生成に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
