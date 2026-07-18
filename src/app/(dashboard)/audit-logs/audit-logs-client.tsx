'use client';

import { useState } from 'react';
import { DataTable } from '@/components/shared/data-table';
import { toast } from 'sonner';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { restoreCustomerAction } from '@/features/customers/actions';
import { restoreLoanAction } from '@/features/loans/actions';

interface AuditLogsClientProps {
  initialLogs: any[];
}

export function AuditLogsClient({ initialLogs }: AuditLogsClientProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (row: any) => {
    if (!confirm(`Are you sure you want to restore this deleted ${row.entityType.replace(/s$/, '')}?`)) {
      return;
    }

    setRestoringId(row.id);
    toast.loading(`Restoring record, please wait...`);

    try {
      let res;
      if (row.entityType === 'customers') {
        res = await restoreCustomerAction(row.entityId);
      } else if (row.entityType === 'loans') {
        res = await restoreLoanAction(row.entityId);
      } else {
        toast.dismiss();
        toast.error('Restoration for this entity type is not supported.');
        setRestoringId(null);
        return;
      }

      toast.dismiss();
      if (res.error) {
        toast.error(`Restoration failed: ${res.error}`);
      } else {
        toast.success(`Record restored successfully!`);
        // We can reload the page or update state to reflect the restore (or the server component will revalidatePath)
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(e.message || 'An error occurred during restore.');
    } finally {
      setRestoringId(null);
    }
  };

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
          <span className="text-slate-900 dark:text-white font-semibold">{row.user?.name || 'System / Auto'}</span>
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
        let badgeStyle = 'bg-secondary text-secondary-foreground border-border';
        if (row.action === 'create') badgeStyle = 'bg-emerald/10 text-emerald border-emerald/20';
        if (row.action === 'update') badgeStyle = 'bg-brass/10 text-brass border-brass/20';
        if (row.action === 'delete') badgeStyle = 'bg-rust/10 text-rust border-rust/20';
        if (row.action === 'restore') badgeStyle = 'bg-primary/10 text-primary border-primary/20';

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
          const oldVal = row.oldValue || {};
          if (row.entityType === 'customers') {
            const name = oldVal.fullName || 'Unknown';
            const code = oldVal.customerCode || 'N/A';
            return (
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-semibold">Deleted Customer profile.</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">Name: {name} ({code})</span>
              </div>
            );
          }
          if (row.entityType === 'loans') {
            const num = oldVal.loanNumber || 'N/A';
            return (
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-semibold">Deleted Loan portfolio.</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">Loan Number: {num}</span>
              </div>
            );
          }
          if (row.entityType === 'payments') {
            const num = oldVal.receiptNumber || 'N/A';
            return (
              <div className="flex flex-col">
                <span className="text-rose-400 text-xs font-semibold">Reversed Payment transaction.</span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">Receipt: {num}</span>
              </div>
            );
          }
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
    {
      header: 'Recovery',
      render: (row: any) => {
        const canRestore = row.action === 'delete' && (row.entityType === 'customers' || row.entityType === 'loans');
        if (!canRestore) return <span className="text-slate-600 text-xs select-none">—</span>;

        return (
          <button
            onClick={() => handleRestore(row)}
            disabled={restoringId !== null}
            className="flex items-center gap-1 text-[10px] uppercase font-bold text-primary hover:text-white bg-primary/10 hover:bg-primary border border-primary/20 py-1 px-2.5 rounded shadow transition cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Restore
          </button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={logs}
      emptyTitle="Audit journal is empty"
      emptyDescription="There are no system mutation events recorded in the log yet."
      emptyIcon={<AlertCircle className="w-12 h-12 text-slate-650" />}
    />
  );
}
