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
