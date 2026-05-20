'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Home, Megaphone, ShieldAlert, Newspaper, Route, CalendarCheck2, Ticket, Gauge, CloudSun, SunMoon, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/lib/core/auth-store';
import clsx from 'clsx';

const navItems = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/announcements', label: 'Informasi', icon: Megaphone },
  { href: '/admin/rules', label: 'Larangan', icon: ShieldAlert },
  { href: '/admin/news', label: 'Berita', icon: Newspaper },
  { href: '/admin/routes', label: 'Routes', icon: Route },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck2 },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/quotas', label: 'Quotas', icon: Gauge },
  { href: '/admin/weather', label: 'Weather', icon: CloudSun },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto grid min-h-screen w-full max-w-screen-2xl grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/90 md:block">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-500">PesagiGo</p>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition active:scale-[0.98]',
                    pathname === item.href
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-600 hover:bg-sky-50 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="p-3 md:p-6">
          <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
                <p className="font-semibold">{user?.fullName ?? 'Admin'} ({user?.email ?? '-'})</p>
              </div>
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700 dark:hover:bg-slate-800 sm:flex-none"
              >
                <span className="inline-flex items-center gap-2"><SunMoon size={14} />{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
