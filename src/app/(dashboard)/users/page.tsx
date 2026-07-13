import { requireAdmin } from '@/lib/auth/rbac';
import { db } from '@/lib/db/client';
import { users } from '../../../../drizzle/schema';
import { desc } from 'drizzle-orm';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { DataTable } from '@/components/shared/data-table';
import { RoleSelector } from './role-selector';
import { UserCog } from 'lucide-react';

export default async function UsersManagementPage() {
  // Guard access: Admins only
  const { profile: adminProfile } = await requireAdmin();

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  const columns = [
    {
      header: 'Full Name',
      accessorKey: 'name',
      render: (row: any) => <span className="font-semibold text-slate-900 dark:text-white">{row.name}</span>,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      render: (row: any) => <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{row.email}</span>,
    },
    {
      header: 'Access Permissions',
      render: (row: any) => (
        <RoleSelector
          userId={row.id}
          currentRole={row.role}
          isSelf={row.id === adminProfile.id}
        />
      ),
    },
    {
      header: 'Joined Date',
      accessorKey: 'createdAt',
      render: (row: any) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs">
          {new Date(row.createdAt).toLocaleDateString('en-IN')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Users' }]} />

      <PageHeader
        title="Staff & RBAC Accounts"
        description="Verify system access logs, define employee roles, and assign operational security clearance."
      />

      <DataTable
        columns={columns}
        data={allUsers}
        emptyTitle="No users found"
        emptyDescription="There are no user profiles registered in the database."
        emptyIcon={<UserCog className="w-12 h-12 text-slate-600" />}
      />
    </div>
  );
}
