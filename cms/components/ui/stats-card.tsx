type Props = {
  title: string;
  value: string | number;
  tone?: 'default' | 'success' | 'warning';
};

export default function StatsCard({ title, value, tone = 'default' }: Props) {
  const toneClass =
    tone === 'success'
      ? 'from-emerald-500/10 to-emerald-100/30 dark:to-emerald-900/10'
      : tone === 'warning'
        ? 'from-amber-500/10 to-amber-100/30 dark:to-amber-900/10'
        : 'from-sky-500/10 to-sky-100/30 dark:to-sky-900/10';

  return (
    <article className={`rounded-2xl border border-slate-200 bg-linear-to-br ${toneClass} p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800`}>
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}
