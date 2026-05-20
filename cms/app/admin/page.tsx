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
