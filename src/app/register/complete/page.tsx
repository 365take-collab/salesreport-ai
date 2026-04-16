import Link from 'next/link';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function RegisterCompletePage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const params = (await searchParams) ?? {};
  const sessionId = Array.isArray(params.session_id)
    ? params.session_id[0]
    : params.session_id;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-emerald-400/30 bg-emerald-400/10 p-8 shadow-2xl shadow-slate-950/40">
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200">
          Purchase complete
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold sm:text-4xl">決済が完了しました</h1>
          <p className="text-base leading-7 text-slate-100">
            購入内容の反映と webhook 処理には数分かかる場合があります。少し待ってからトップページに戻ると、最新の状態を確認できます。
          </p>
        </div>
        {sessionId ? (
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-200">
            session_id: <span className="font-mono text-emerald-200">{sessionId}</span>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            トップに戻る
          </Link>
          <Link
            href="/weekly"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
          >
            週次ダッシュボードを開く
          </Link>
        </div>
      </div>
    </main>
  );
}
