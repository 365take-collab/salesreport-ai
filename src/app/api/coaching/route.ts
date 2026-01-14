import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// プロのセールス知識データベース
const SALES_WISDOM = [
  {
    situation: "クロージングが弱い",
    quote: "クロージングに遠慮なんていらない！怖気づかずに、一気にいく！",
    advice: "「買ってください」と明確に言うこと。遠慮は敵。"
  },
  {
    situation: "価格で負ける",
    quote: "価格について自分自身が邪魔にならないのは非常に難しい。あなたの顧客は全く異なる視点で同じ価格を見ている。",
    advice: "自分の価格に自信を持つこと。顧客はあなたより価格を気にしていない。"
  },
  {
    situation: "反論に弱い",
    quote: "スキルが不足していて自信がない場合、割引に頼りがちになる。最初の反論を受けた瞬間にすぐに降参する傾向が顕著になる。",
    advice: "反論は「降参」ではなく「対話の機会」。価値を再提示する。"
  },
  {
    situation: "フォローアップが弱い",
    quote: "1日目〜7日目は毎日送る。鉄は熱いうちに打て。",
    advice: "商談後、24時間以内にフォローアップを送ること。"
  },
  {
    situation: "オファーが不明確",
    quote: "オファーがなければ、ダイレクトレスポンスではない。",
    advice: "「○○を△△円で提供します」と明確に伝えること。"
  },
  {
    situation: "緊急性がない",
    quote: "供給が限られており、見込み客は手に入れることができないかもしれないと思わせることで、相手を行動へと駆り立てる。",
    advice: "限定性・緊急性を作る。「あと3名」「今週末まで」など。"
  }
];

const SYSTEM_PROMPT = `あなたは世界トップレベルのセールス理論を熟知した営業コーチです。

以下の基準で商談を採点し、改善フィードバックを提供してください：

【採点基準（100点満点）】

## 1. オファー設計（30点）
- オファーの明確さ（10点）：明確に「○○を△△円で」と伝えているか
- 価格の論理的理由（10点）：なぜその価格なのか説明しているか
- テイクアウェイセリング（10点）：限定性・緊急性を作っているか（数量限定、期間限定など）

## 2. クロージング（30点）
- ベネフィットの繰り返し（6点）：「あなたが得られるのは...」で主要ベネフィットを繰り返しているか
- 保証の提示（6点）：リスクリバーサル（返金保証など）を大胆に提示しているか
- 購入を求める（6点）：明確に「買ってください」「お申し込みください」と言っているか
- 具体的な次のステップ（6点）：「今すぐ○○してください」と具体的に伝えているか
- YES set（一貫性）（6点）：「〜ですよね？」の連続で一貫性を作っているか

## 3. 価格交渉対応（20点）
- 価格への自信（10点）：自分の価格に自信を持っているか、すぐに値下げしていないか
- 反論への対応（10点）：反論に対して「降参」せず、価値を再提示しているか

## 4. フォローアップ（20点）
- 次回アポの確保（10点）：商談終了時に次のアクションを約束しているか
- フォローアップ計画（10点）：いつ、どのように連絡するかを明確にしているか

【出力形式】
必ず以下のJSON形式で出力してください：

{
  "totalScore": 数値（0-100）,
  "categories": {
    "offer": {
      "score": 数値（0-30）,
      "details": {
        "clarity": 数値（0-10）,
        "priceReason": 数値（0-10）,
        "takeaway": 数値（0-10）
      }
    },
    "closing": {
      "score": 数値（0-30）,
      "details": {
        "benefitRepeat": 数値（0-6）,
        "guarantee": 数値（0-6）,
        "askForSale": 数値（0-6）,
        "nextStep": 数値（0-6）,
        "yesSet": 数値（0-6）
      }
    },
    "priceNegotiation": {
      "score": 数値（0-20）,
      "details": {
        "confidence": 数値（0-10）,
        "objectionHandling": 数値（0-10）
      }
    },
    "followUp": {
      "score": 数値（0-20）,
      "details": {
        "nextAppointment": 数値（0-10）,
        "followUpPlan": 数値（0-10）
      }
    }
  },
  "goodPoints": ["良かった点1", "良かった点2", "良かった点3"],
  "improvementPoints": ["改善点1", "改善点2", "改善点3"],
  "improvedScript": "具体的な改善スクリプト例（現在の言い方→改善後の言い方）",
  "weakestArea": "最も弱いエリア（offer/closing/priceNegotiation/followUp）"
}

JSONのみを出力してください。説明文は不要です。`;

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json(
        { error: '商談内容を入力してください' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'APIキーが設定されていません' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `以下の商談内容を分析してください:\n\n${transcript}` },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let analysis;
    
    try {
      analysis = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: '分析結果の解析に失敗しました' },
        { status: 500 }
      );
    }

    // 最も弱いエリアに基づいてアドバイスを選択
    const weakestArea = analysis.weakestArea || 'closing';
    let salesWisdom;
    
    switch (weakestArea) {
      case 'offer':
        salesWisdom = SALES_WISDOM.find(q => q.situation === 'オファーが不明確') 
          || SALES_WISDOM.find(q => q.situation === '緊急性がない');
        break;
      case 'closing':
        salesWisdom = SALES_WISDOM.find(q => q.situation === 'クロージングが弱い');
        break;
      case 'priceNegotiation':
        salesWisdom = SALES_WISDOM.find(q => q.situation === '価格で負ける')
          || SALES_WISDOM.find(q => q.situation === '反論に弱い');
        break;
      case 'followUp':
        salesWisdom = SALES_WISDOM.find(q => q.situation === 'フォローアップが弱い');
        break;
      default:
        salesWisdom = SALES_WISDOM[0];
    }

    return NextResponse.json({
      ...analysis,
      danKennedyQuote: salesWisdom || SALES_WISDOM[0]
    });

  } catch (error) {
    console.error('Error analyzing sales:', error);
    return NextResponse.json(
      { error: '分析に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}
