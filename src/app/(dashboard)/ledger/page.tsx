import { getGlobalLedgerEntries } from '@/features/ledger/queries';
import { requireManager } from '@/lib/auth/rbac';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { formatCurrency } from '@/lib/utils/currency';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

export default async function GlobalLedgerPage() {
  // Enforce manager or admin access
  await requireManager();

  const entries = await getGlobalLedgerEntries();

  const columns = [
    {
      header: 'Entry Date',
      accessorKey: 'entryDate',
    },
    {
      header: 'Customer',
      render: (row: any) => (
        <Link href={`/customers/${row.customer.id}`} className="text-white hover:text-violet-400 font-semibold hover:underline transition-colors">
          {row.customer.fullName}
        </Link>
      ),
    },
    {
      header: 'Loan ID',
      render: (row: any) => (
        <Link href={`/loans/${row.loan.id}`} className="font-mono text-xs text-violet-400 bg-violet-600/10 px-2.5 py-1 rounded-md border border-violet-500/15">
          {row.loan.loanNumber}
        </Link>
      ),
    },
    {
      header: 'Tx Type',
      accessorKey: 'txnType',
      render: (row: any) => <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{row.txnType.replace('_', ' ')}</span>,
    },
    {
      header: 'Debit (+)',
      accessorKey: 'debit',
      render: (row: any) => (
        <span className={parseFloat(row.debit) > 0 ? 'text-rose-400 font-medium' : 'text-slate-500'}>
          {parseFloat(row.debit) > 0 ? `+${formatCurrency(row.debit)}` : '—'}
        </span>
      ),
    },
    {
      header: 'Credit (-)',
      accessorKey: 'credit',
      render: (row: any) => (
        <span className={parseFloat(row.credit) > 0 ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
          {parseFloat(row.credit) > 0 ? `-${formatCurrency(row.credit)}` : '—'}
        </span>
      ),
    },
    {
      header: 'Balance',
      accessorKey: 'runningBalance',
      render: (row: any) => (
        <span className="text-white font-bold font-mono">{formatCurrency(row.runningBalance)}</span>
      ),
    },
    {
      header: 'Description',
      accessorKey: 'description',
      className: 'text-slate-500 dark:text-slate-400 text-xs max-w-xs truncate',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Ledger' }]} />

      <PageHeader
        title="General Accounting Ledger"
        description="Immutable record of all financial events, disbursements, payments, and settlements."
      />

      <DataTable
        columns={columns}
        data={entries}
        emptyTitle="Ledger is empty"
        emptyDescription="There are no transactional entries recorded in the system yet."
        emptyIcon={<BookOpen className="w-12 h-12 text-slate-600" />}
      />
    </div>
  );
}
