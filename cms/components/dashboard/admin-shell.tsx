'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Gauge,
  Home,
  LogOut,
  Map,
  Megaphone,
  Menu,
  Mountain,
  QrCode,
  Settings,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/lib/core/auth-store';
import clsx from 'clsx';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/mountain', label: 'Gunung Pesagi', icon: Mountain },
  { href: '/admin/schedules', label: 'Jadwal Pendakian', icon: CalendarDays },
  { href: '/admin/sessions', label: 'Sesi Pendakian', icon: ClipboardList },
  { href: '/admin/quotas', label: 'Kuota Tiket', icon: Gauge },
  { href: '/admin/bookings', label: 'Booking/Pesanan', icon: Ticket },
  { href: '/admin/payments', label: 'Pembayaran', icon: CreditCard },
  { href: '/admin/tickets', label: 'Tiket & QR Code', icon: QrCode },
  { href: '/admin/hikers', label: 'Pendaki', icon: Users },
  { href: '/admin/announcements', label: 'Informasi', icon: Megaphone },
  { href: '/admin/rules', label: 'Panduan', icon: Map },
  { href: '/admin/help', label: 'Bantuan', icon: CircleHelp },
  { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
  { href: '/admin/weather', label: 'Cuaca', icon: BarChart3 },
];

function SidebarContent({
  pathname,
  userName,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  userName: string;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0c1421] text-slate-100">
      <div className="px-4 py-5">
        <p className="text-[11px] font-bold tracking-wide text-white">PesagiGo Admin</p>
        <div className="mt-6 flex items-center gap-3">
          <Image
            src="/pesagi-hero.svg"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-emerald-300/50 object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-[11px] text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(`${item.href}/`));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={clsx(
                'flex h-9 items-center gap-2 rounded-md px-3 text-[12px] font-medium transition',
                active
                  ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#2563eb]'
                  : 'text-slate-300 hover:bg-white/7 hover:text-white',
              )}
            >
              <Icon size={14} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-[12px] font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={14} />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const logout = () => {
    clearAuth();
    router.replace('/');
  };

  const userName = user?.fullName ?? 'Admin';

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <SidebarContent pathname={pathname} userName={userName} onLogout={logout} />
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-slate-200 bg-white px-3 shadow-sm lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700"
              aria-label="Buka navigasi"
            >
              <Menu size={18} />
            </button>
            <p className="text-sm font-bold">PesagiGo Admin</p>
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-red-600"
              aria-label="Keluar"
            >
              <LogOut size={16} />
            </button>
          </header>

          <main className="mx-auto w-full max-w-[1600px] p-3 lg:p-5">{children}</main>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/55 lg:hidden" role="presentation" onClick={() => setMobileNavOpen(false)}>
          <aside
            className="h-full w-[82%] max-w-xs shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="absolute left-[calc(min(82%,20rem)-2.75rem)] top-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-800"
                aria-label="Tutup navigasi"
              >
                <X size={17} />
              </button>
            </div>
            <SidebarContent pathname={pathname} userName={userName} onLogout={logout} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
