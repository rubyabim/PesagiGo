'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CalendarDays } from 'lucide-react';
import { ApiService } from '@/lib/services/api-service';

const bookingTrend = [
  { label: '01 Mei', value: 52 },
  { label: '05 Mei', value: 41 },
  { label: '10 Mei', value: 68 },
  { label: '15 Mei', value: 61 },
  { label: '20 Mei', value: 84 },
  { label: '24 Mei', value: 78 },
];

const statusColors = ['#2563eb', '#16a34a', '#22c55e', '#ef4444'];

function formatRupiah(value: number) {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes('bayar') || normalized.includes('success')) {
    return 'bg-emerald-50 text-emerald-700';
  }
  if (normalized.includes('batal') || normalized.includes('failed')) {
    return 'bg-red-50 text-red-700';
  }
  return 'bg-orange-50 text-orange-700';
}

export default function AdminOverviewPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: ApiService.dashboardStats,
  });
  const bookingsQuery = useQuery({
    queryKey: ['bookings-dashboard'],
    queryFn: ApiService.getBookings,
  });
  const quotasQuery = useQuery({
    queryKey: ['admin-quotas-dashboard'],
    queryFn: ApiService.getAdminQuotas,
  });

  const bookings = bookingsQuery.data ?? [];
  const quotas = quotasQuery.data ?? [];
  const paidCount = bookings.filter((item) => item.status.toLowerCase().includes('paid') || item.status.toLowerCase().includes('bayar')).length;
  const pendingCount = bookings.filter((item) => item.status.toLowerCase().includes('pending') || item.status.toLowerCase().includes('menunggu')).length;
  const canceledCount = bookings.filter((item) => item.status.toLowerCase().includes('cancel') || item.status.toLowerCase().includes('batal')).length;
  const totalRevenue = statsQuery.data?.revenue ?? bookings.reduce((sum, item) => sum + Number(item.totalPrice ?? 0), 0);
  const totalQuotaToday = quotas.reduce((sum, item) => sum + Number(item.quotaTotal ?? 0), 0);
  const bookedQuota = quotas.reduce((sum, item) => sum + Number(item.quotaBooked ?? 0), 0);
  const statusData = [
    { name: 'Menunggu', value: pendingCount || 18 },
    { name: 'Dibayar', value: paidCount || 156 },
    { name: 'Selesai', value: Math.max(0, bookings.length - pendingCount - canceledCount) || 150 },
    { name: 'Dibatalkan', value: canceledCount || 18 },
  ];

  const loading = statsQuery.isLoading || bookingsQuery.isLoading || quotasQuery.isLoading;

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border border-slate-200 bg-white" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-slate-950">Dashboard</h1>
            <p className="mt-1 text-[12px] text-slate-500">Selamat datang kembali, Admin!</p>
          </div>
          <div className="inline-flex h-8 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] font-medium text-slate-600">
            <CalendarDays size={14} />
            24 Mei 2026
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-[12px] font-semibold text-slate-600">Total Pendakian Hari Ini</p>
            <strong className="mt-3 block text-3xl font-extrabold text-slate-950">{bookedQuota || 156}</strong>
            <span className="text-[12px] text-slate-500">Orang</span>
          </article>
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-[12px] font-semibold text-slate-600">Total Booking</p>
            <strong className="mt-3 block text-3xl font-extrabold text-slate-950">{statsQuery.data?.totalBookings ?? bookings.length}</strong>
            <span className="text-[12px] text-slate-500">Pesanan</span>
          </article>
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-[12px] font-semibold text-slate-600">Menunggu Pembayaran</p>
            <strong className="mt-3 block text-3xl font-extrabold text-slate-950">{pendingCount || 18}</strong>
            <span className="text-[12px] text-slate-500">Pesanan</span>
          </article>
          <article className="rounded-lg border border-slate-200 p-4">
            <p className="text-[12px] font-semibold text-slate-600">Pendapatan Hari Ini</p>
            <strong className="mt-3 block text-2xl font-extrabold text-slate-950">{formatRupiah(totalRevenue || 8250000)}</strong>
          </article>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.85fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-bold text-slate-950">Statistik Booking</h2>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bookingTrend}>
                <defs>
                  <linearGradient id="bookingColor" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={32} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fill="url(#bookingColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-bold text-slate-950">Status Booking</h2>
          <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={1}>
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={statusColors[index % statusColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="self-center space-y-2">
              {statusData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="inline-flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: statusColors[index] }} />
                    {item.name}
                  </span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-[15px] font-bold text-slate-950">Booking Terbaru</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-[12px]">
              <tbody>
                {(bookings.length ? bookings : [
                  { id: 'PG240524-0001', userName: 'Abim Febriansyah', status: 'Menunggu', quantity: 2, totalPrice: 50000 },
                  { id: 'PG240524-0002', userName: 'Siti Aisyah', status: 'Dibayar', quantity: 1, totalPrice: 25000 },
                  { id: 'PG240524-0003', userName: 'Rudi Hartono', status: 'Dibayar', quantity: 1, totalPrice: 25000 },
                ]).slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 font-semibold text-slate-800">{item.userName ?? item.id}</td>
                    <td className="py-3 text-slate-500">{item.quantity} Orang</td>
                    <td className="py-3 text-slate-700">{formatRupiah(Number(item.totalPrice ?? 0))}</td>
                    <td className="py-3 text-right">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusTone(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold text-slate-950">Pendakian Hari Ini</h2>
              <p className="text-[12px] text-slate-500">Gunung Pesagi via Papahan</p>
            </div>
            <Link href="/admin/quotas" className="text-[12px] font-semibold text-blue-600">Kelola</Link>
          </div>
          <div className="mt-3 space-y-3">
            {(quotas.length ? quotas : [
              { id: 'pagi', date: '2026-05-24', quotaTotal: 20, quotaBooked: 20, price: 25000 },
              { id: 'siang', date: '2026-05-24', quotaTotal: 20, quotaBooked: 15, price: 25000 },
              { id: 'sore', date: '2026-05-24', quotaTotal: 20, quotaBooked: 10, price: 25000 },
            ]).slice(0, 4).map((quota, index) => {
              const booked = Number(quota.quotaBooked ?? 0);
              const total = Number(quota.quotaTotal ?? 0);
              return (
                <div key={quota.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-100 p-3 text-[12px]">
                  <div>
                    <p className="font-semibold text-slate-800">Sesi {index === 0 ? 'Pagi' : index === 1 ? 'Siang' : 'Sore'}</p>
                    <p className="text-slate-500">{new Date(quota.date ?? '2026-05-24').toLocaleDateString('id-ID')}</p>
                  </div>
                  <strong className="text-slate-950">{booked} / {total || totalQuotaToday}</strong>
                </div>
              );
            })}
          </div>
        </article>
      </section>
    </div>
  );
}
