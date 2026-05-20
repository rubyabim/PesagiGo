import AuthGuard from '@/components/dashboard/auth-guard';
import AdminShell from '@/components/dashboard/admin-shell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
