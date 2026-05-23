'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import StatsCard from '@/components/ui/stats-card';
import { ApiService } from '@/lib/services/api-service';
// admin dashboard: ringkasan operasional admin, informasi penting, larangan, berita, statistik booking dan revenue. Fokus pada tampilan yang bersih dan informatif untuk memudahkan admin dalam mengelola platform.
export default function AdminOverviewPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: ApiService.dashboardStats,
  });
// fetch announcements, rules, and news for the dashboard sections
  const announcementsQuery = useQuery({
    queryKey: ['announcements'],
    queryFn: ApiService.getAnnouncements,
  });

  const rulesQuery = useQuery({
    queryKey: ['rules'],
    queryFn: ApiService.getRules,
  });

  const newsQuery = useQuery({
    queryKey: ['news'],
    queryFn: ApiService.getNews,
  });

  const analytics = statsQuery.data?.analytics?.length
    ? statsQuery.data.analytics.filter((item) => item.label.toLowerCase() !== 'payments')
    : [
        { label: 'Bookings', value: statsQuery.data?.totalBookings ?? 0 },
        { label: 'Revenue', value: statsQuery.data?.revenue ?? 0 },
      ];

  if (statsQuery.isLoading || announcementsQuery.isLoading || rulesQuery.isLoading || newsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <section className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
        <section className="grid gap-3 md:grid-cols-2">
          <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
          <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
        </section>
        <section className="h-75 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
        <section className="grid gap-3 lg:grid-cols-3">
          <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
          <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
          <div className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-white p-4" />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ringkasan operasional admin: informasi penting, larangan, berita,
          statistik booking dan revenue.
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <StatsCard
          title="Total Bookings"
          value={statsQuery.data?.totalBookings ?? 0}
        />
        <StatsCard
          title="Revenue"
          value={`Rp ${Number(statsQuery.data?.revenue ?? 0).toLocaleString('id-ID')}`}
          tone="warning"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-lg font-semibold">Analytics</h2>
        <div className="h-75">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Informasi Penting</h3>
            <Link href="/admin/announcements" className="text-xs text-sky-600 underline">
              Kelola
            </Link>
          </div>
          <div className="space-y-2">
            {(announcementsQuery.data ?? []).slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-sky-200 bg-sky-50 p-2 text-sm text-sky-800 dark:border-sky-900/40 dark:bg-sky-950/20 dark:text-sky-200"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="line-clamp-2 text-xs">{item.content}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Larangan</h3>
            <Link href="/admin/rules" className="text-xs text-sky-600 underline">
              Kelola
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {(rulesQuery.data ?? []).slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
              >
                <p className="font-medium">{item.title}</p>
                <p className="line-clamp-1 text-xs">{item.description}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Berita Terbaru</h3>
            <Link href="/admin/news" className="text-xs text-sky-600 underline">
              Kelola
            </Link>
          </div>
          <div className="space-y-2">
            {(newsQuery.data ?? []).slice(0, 4).map((item) => (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 p-2 dark:border-slate-700"
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="line-clamp-2 text-xs text-slate-500">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
