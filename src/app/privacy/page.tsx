'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-8">プライバシーポリシー</h1>
        
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <p className="text-sm text-slate-400">最終更新日: 2025年1月15日</p>
          
          <p>LaunchX（以下「当社」といいます）は、SalesReport AI（以下「本サービス」といいます）における個人情報の取り扱いについて、以下のとおりプライバシーポリシーを定めます。</p>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">1. 収集する情報</h2>
            <p>当社は、以下の情報を収集することがあります：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>アカウント情報</strong>：メールアドレス、氏名</li>
              <li><strong>利用情報</strong>：本サービスの利用履歴、生成したコンテンツ</li>
              <li><strong>決済情報</strong>：決済に必要な情報（クレジットカード情報は決済代行会社が管理）</li>
              <li><strong>技術情報</strong>：IPアドレス、ブラウザ情報、アクセスログ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">2. 情報の利用目的</h2>
            <p>収集した情報は、以下の目的で利用します：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>本サービスの提供・運営</li>
              <li>ユーザーサポートの提供</li>
              <li>サービスの改善・新機能の開発</li>
              <li>利用状況の分析</li>
              <li>お知らせ・マーケティング情報の送信</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">3. 情報の第三者提供</h2>
            <p>当社は、以下の場合を除き、個人情報を第三者に提供しません：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護に必要な場合</li>
              <li>業務委託先に対して必要な範囲で提供する場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">4. 外部サービスとの連携</h2>
            <p>本サービスは、以下の外部サービスを利用しています：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>OpenAI</strong>：AI機能の提供（入力データはOpenAIのAPIに送信されます）</li>
              <li><strong>Supabase</strong>：データベース・認証サービス</li>
              <li><strong>Stripe</strong>：決済処理</li>
              <li><strong>Vercel</strong>：ホスティングサービス</li>
            </ul>
            <p className="mt-2">各サービスのプライバシーポリシーについては、各社のウェブサイトをご確認ください。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">5. データの保管</h2>
            <p>収集した情報は、サービス提供に必要な期間保管します。アカウント削除の申請があった場合、合理的な期間内にデータを削除します。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">6. セキュリティ</h2>
            <p>当社は、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を講じます。ただし、インターネット上の通信は完全に安全ではないことをご了承ください。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">7. Cookie（クッキー）</h2>
            <p>本サービスでは、ユーザー体験の向上のためにCookieを使用しています。ブラウザの設定でCookieを無効にすることができますが、一部の機能が利用できなくなる場合があります。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">8. ユーザーの権利</h2>
            <p>ユーザーは、以下の権利を有します：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>個人情報の開示・訂正・削除を求める権利</li>
              <li>マーケティングメールの配信停止を求める権利</li>
              <li>アカウントの削除を求める権利</li>
            </ul>
            <p className="mt-2">これらの権利を行使する場合は、下記のお問い合わせ先までご連絡ください。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">9. 未成年者の利用</h2>
            <p>本サービスは、18歳未満の方の利用を想定していません。18歳未満の方が利用する場合は、保護者の同意が必要です。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">10. ポリシーの変更</h2>
            <p>当社は、必要に応じて本ポリシーを変更することがあります。重要な変更がある場合は、本サービス上でお知らせします。</p>
          </section>

          <section className="mt-12 pt-8 border-t border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">お問い合わせ</h2>
            <p>個人情報の取り扱いに関するお問い合わせ：</p>
            <p className="mt-2">LaunchX</p>
            <p>メール: support@launchx.jp</p>
          </section>
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
