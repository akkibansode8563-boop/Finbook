import { getAuditLogs } from '@/features/audit/queries';
import { requireAdmin } from '@/lib/auth/rbac';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { History } from 'lucide-react';
import Link from 'next/link';

export default async function AuditLogsPage() {
  // Only admins can access audit logs
  await requireAdmin();

  const logs = await getAuditLogs();

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      render: (row: any) => (
        <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
          {new Date(row.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
        </span>
      ),
    },
    {
      header: 'Operator',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="text-white font-semibold">{row.user?.name || 'System / Auto'}</span>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5">{row.user?.email || '—'}</span>
        </div>
      ),
    },
    {
      header: 'Entity Type',
      accessorKey: 'entityType',
      render: (row: any) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 capitalize">
          {row.entityType.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      render: (row: any) => {
        let badgeStyle = 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20';
        if (row.action === 'create') badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (row.action === 'update') badgeStyle = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
        if (row.action === 'delete') badgeStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (row.action === 'restore') badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';

        return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border select-none shrink-0 ${badgeStyle}`}>
            {row.action}
          </span>
        );
      },
    },
    {
      header: 'Changes & Modifications',
      render: (row: any) => {
        if (row.action === 'create') {
          return <span className="text-emerald-400 text-xs font-medium">Record originated.</span>;
        }
        if (row.action === 'delete') {
          return <span className="text-rose-450/90 text-xs font-medium">Record deleted/archived.</span>;
        }

        const oldVal = row.oldValue;
        const newVal = row.newValue;
        if (oldVal && newVal) {
          const changesList: string[] = [];
          for (const key of Object.keys(newVal)) {
            if (oldVal[key] !== newVal[key] && key !== 'updatedAt') {
              changesList.push(`${key}: "${oldVal[key] || 'null'}" ➔ "${newVal[key]}"`);
            }
          }
          return (
            <span
              className="text-slate-700 dark:text-slate-300 text-xs block font-mono max-w-sm truncate select-all cursor-pointer"
              title={changesList.join(', ')}
            >
              {changesList.join(', ') || 'Internal timestamps updated.'}
            </span>
          );
        }
        return <span className="text-slate-500 text-xs">—</span>;
      },
    },
    {
      header: 'IP Address',
      accessorKey: 'ipAddress',
      render: (row: any) => (
        <span className="font-mono text-xs text-slate-500">{row.ipAddress || '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Audit Logs' }]} />

      <PageHeader
        title="Security & Mutation Audit Logs"
        description="Immutable system-wide ledger of database mutations, administrative edits, and collections logins."
      />

      <DataTable
        columns={columns}
        data={logs}
        emptyTitle="Audit journal is empty"
        emptyDescription="There are no system mutation events recorded in the log yet."
        emptyIcon={<History className="w-12 h-12 text-slate-600" />}
      />
    </div>
  );
}
