'use client';

import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-amber-400">
            SalesReport AI
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">特定商取引法に基づく表記</h1>
        
        <div className="space-y-6">
          <table className="w-full">
            <tbody className="divide-y divide-slate-700">
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top w-1/3">販売業者</td>
                <td className="py-4 text-white">LaunchX</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">運営責任者</td>
                <td className="py-4 text-white">川村健志</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">所在地</td>
                <td className="py-4 text-white">
                  〒160-0022<br />
                  東京都新宿区新宿 1-36-2<br />
                  新宿第七葉山ビル 3F
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">電話番号</td>
                <td className="py-4 text-white">
                  請求があれば遅滞なく開示いたします。<br />
                  <span className="text-slate-400 text-sm">※お問い合わせはメールにてお願いいたします</span>
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">メールアドレス</td>
                <td className="py-4 text-white">support@launchx.jp</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">販売URL</td>
                <td className="py-4 text-white">https://salesreport-ai.vercel.app</td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">販売価格</td>
                <td className="py-4 text-white">
                  <ul className="space-y-1">
                    <li>Free: 無料（月3回まで）</li>
                    <li>Basic: 月額980円（税込）/ 年額9,800円（税込）</li>
                    <li>Pro: 月額9,800円（税込）/ 年額98,000円（税込）</li>
                    <li>Enterprise: 月額29,800円（税込）〜</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">商品代金以外の必要料金</td>
                <td className="py-4 text-white">
                  インターネット接続料金、通信料金等はお客様のご負担となります。
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">支払方法</td>
                <td className="py-4 text-white">
                  クレジットカード決済（VISA、Mastercard、American Express、JCB）
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">支払時期</td>
                <td className="py-4 text-white">
                  クレジットカード決済：お申し込み時に即時決済<br />
                  ※7日間無料トライアル後、自動的に課金が開始されます
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">サービス提供時期</td>
                <td className="py-4 text-white">
                  お申し込み完了後、即時ご利用いただけます。
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">返品・キャンセル</td>
                <td className="py-4 text-white">
                  <p className="mb-2">
                    <strong className="text-green-400">30日間満足保証</strong><br />
                    有料プラン開始から30日以内であれば、理由を問わず全額返金いたします。
                  </p>
                  <p className="mb-2">
                    <strong>無料トライアル中のキャンセル</strong><br />
                    7日間の無料トライアル期間中にキャンセルした場合、料金は発生しません。
                  </p>
                  <p>
                    <strong>解約</strong><br />
                    いつでもマイページから解約可能です。解約後も契約期間終了まではサービスをご利用いただけます。
                  </p>
                </td>
              </tr>
              <tr>
                <td className="py-4 pr-4 text-slate-400 align-top">動作環境</td>
                <td className="py-4 text-white">
                  <ul className="space-y-1">
                    <li>対応ブラウザ: Google Chrome、Safari、Firefox、Microsoft Edge（最新版推奨）</li>
                    <li>インターネット接続が必要です</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      <footer className="border-t border-slate-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500 text-sm">
          © 2025 SalesReport AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
