import { requireAuth } from '@/lib/auth/session';
import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAuth();

  return (
    <DashboardShell
      userProfile={{
        name: profile.name,
        email: profile.email,
        role: profile.role,
      }}
    >
      {children}
    </DashboardShell>
  );
}
