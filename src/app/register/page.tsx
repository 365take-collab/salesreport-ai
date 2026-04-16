import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/40">
        <span className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
          Checkout canceled
        </span>
        <div className="space-y-3">
          <h1 className="text-3xl font-bold sm:text-4xl">決済はまだ完了していません</h1>
          <p className="text-base leading-7 text-slate-200">
            Stripe の決済画面から戻りました。登録情報は保持されているので、トップページに戻ればそのまま再開できます。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
          >
            トップに戻って再開する
          </Link>
          <Link
            href="/legal"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
          >
            特商法・利用情報を見る
          </Link>
        </div>
      </div>
    </main>
  );
}
