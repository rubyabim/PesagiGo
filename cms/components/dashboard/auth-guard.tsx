'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/core/auth-store';

const publicRoutes = new Set(['/', '/login', '/register', '/reset-password']);

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hydrated, token, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const isPublic = publicRoutes.has(pathname);

    if (!token && !isPublic) {
      router.replace('/');
      return;
    }

    if (token && isPublic) {
      router.replace('/admin');
    }
  }, [hydrated, token, pathname, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-100 dark:bg-slate-950">
        <p className="text-sm text-slate-500">Loading session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
