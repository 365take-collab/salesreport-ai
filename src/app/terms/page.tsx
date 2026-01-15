'use client';

import Link from 'next/link';

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold mb-8">利用規約</h1>
        
        <div className="prose prose-invert prose-slate max-w-none space-y-6 text-slate-300">
          <p className="text-sm text-slate-400">最終更新日: 2025年1月15日</p>
          
          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第1条（適用）</h2>
            <p>本規約は、LaunchX（以下「当社」といいます）が提供するSalesReport AI（以下「本サービス」といいます）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、本サービスを利用するものとします。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第2条（利用登録）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>利用登録は、当社の定める方法によって申請し、当社がこれを承認することで完了します。</li>
              <li>当社は、以下の場合に利用登録を拒否することがあります：
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>虚偽の情報を申告した場合</li>
                  <li>過去に本規約違反により登録抹消された場合</li>
                  <li>その他当社が不適当と判断した場合</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第3条（料金および支払い）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>有料プランの料金は、本サービス上に表示される金額とします。</li>
              <li>支払いは、当社が指定する決済方法により行うものとします。</li>
              <li>7日間の無料トライアル期間中にキャンセルした場合、料金は発生しません。</li>
              <li>30日間満足保証：有料プラン開始から30日以内であれば、理由を問わず全額返金いたします。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第4条（禁止事項）</h2>
            <p>ユーザーは、以下の行為を行ってはなりません：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>法令または公序良俗に違反する行為</li>
              <li>当社または第三者の知的財産権を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセスまたはこれを試みる行為</li>
              <li>他のユーザーになりすます行為</li>
              <li>本サービスを商業目的で再販売する行為</li>
              <li>AIによる生成物を当社の許可なく再配布する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第5条（本サービスの提供の停止等）</h2>
            <p>当社は、以下の場合に本サービスの全部または一部の提供を停止することがあります：</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>システムの保守点検を行う場合</li>
              <li>天災、停電等の不可抗力により提供が困難な場合</li>
              <li>その他当社が必要と判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第6条（知的財産権）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>本サービスに関する知的財産権は当社に帰属します。</li>
              <li>ユーザーが本サービスを利用して生成したコンテンツの著作権はユーザーに帰属します。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第7条（免責事項）</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>当社は、本サービスの内容の正確性、完全性、有用性等について保証しません。</li>
              <li>AIによる生成物の内容について、当社は責任を負いません。</li>
              <li>ユーザーが本サービスを利用して得た情報に基づいて行った判断の結果について、当社は責任を負いません。</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第8条（退会）</h2>
            <p>ユーザーは、当社の定める方法により退会することができます。退会後、ユーザーのデータは当社のプライバシーポリシーに従って処理されます。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第9条（規約の変更）</h2>
            <p>当社は、必要に応じて本規約を変更することがあります。変更後の規約は、本サービス上に掲載した時点で効力を生じます。</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mt-8 mb-4">第10条（準拠法・裁判管轄）</h2>
            <p>本規約の解釈は日本法に準拠し、本サービスに関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
          </section>

          <section className="mt-12 pt-8 border-t border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">お問い合わせ</h2>
            <p>LaunchX</p>
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
