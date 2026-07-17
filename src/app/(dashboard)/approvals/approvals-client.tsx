'use client';

import { useState } from 'react';
import { approveRequestAction, rejectRequestAction } from '@/features/approvals/actions';
import { DataTable } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { toast } from 'sonner';
import { Check, X, ShieldAlert } from 'lucide-react';

interface ApprovalsClientProps {
  initialRequests: any[];
}

export function ApprovalsClient({ initialRequests }: ApprovalsClientProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this sensitive action? This will immediately execute the transaction.')) {
      return;
    }
    setLoadingId(id);
    try {
      const res = await approveRequestAction(id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Request approved and executed successfully!');
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason === null) return; // user cancelled prompt
    if (!reason.trim()) {
      toast.error('Rejection reason is required.');
      return;
    }

    setLoadingId(id);
    try {
      const res = await rejectRequestAction(id, reason);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Request rejected.');
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', rejectionReason: reason } : r));
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred');
    } finally {
      setLoadingId(null);
    }
  };

  const columns = [
    {
      header: 'Requested At',
      render: (row: any) => (
        <span className="text-slate-500 font-mono text-xs">
          {new Date(row.createdAt).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Requested By',
      render: (row: any) => (
        <div className="flex flex-col">
          <span className="text-slate-900 dark:text-white font-semibold">{row.requestedByUser?.name}</span>
          <span className="text-[10px] text-slate-500 font-mono">{row.requestedByUser?.email}</span>
        </div>
      ),
    },
    {
      header: 'Action / Type',
      render: (row: any) => (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 w-fit">
            {row.actionType.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {row.entityType}: {row.entityId}
          </span>
        </div>
      ),
    },
    {
      header: 'Notes / Explanation',
      render: (row: any) => (
        <div className="max-w-xs text-xs text-slate-700 dark:text-slate-300">
          <p className="italic">"{row.requestNotes}"</p>
          {row.rejectionReason && (
            <p className="mt-1 text-rose-450 text-[10px] font-semibold">
              Rejected Reason: {row.rejectionReason}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (row: any) => {
        return <StatusBadge status={row.status} />;
      },
    },
    {
      header: 'Actions',
      render: (row: any) => {
        if (row.status !== 'pending') return <span className="text-xs text-slate-500">—</span>;

        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleApprove(row.id)}
              disabled={loadingId !== null}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-1 px-3 rounded shadow transition"
            >
              <Check className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => handleReject(row.id)}
              disabled={loadingId !== null}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold py-1 px-3 rounded shadow transition"
            >
              <X className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      emptyTitle="No approval requests found"
      emptyDescription="There are no pending transaction authorization requests."
      emptyIcon={<ShieldAlert className="w-12 h-12 text-slate-600" />}
    />
  );
}
