import { getGlobalLedgerEntries } from '@/features/ledger/queries';
import { formatDateDDMMYYYY } from '@/lib/utils/date';
import { requireManager } from '@/lib/auth/rbac';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { formatCurrency } from '@/lib/utils/currency';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { ExportButton } from '@/components/shared/export-button';

export default async function GlobalLedgerPage() {
  // Enforce manager or admin access
  await requireManager();

  const entries = await getGlobalLedgerEntries();

  const ledgerHeaders = [
    { label: 'Entry Date', key: 'entryDate' },
    { label: 'Customer Name', key: 'customer.fullName' },
    { label: 'Customer Code', key: 'customer.customerCode' },
    { label: 'Loan Number', key: 'loan.loanNumber' },
    { label: 'Transaction Type', key: 'txnType' },
    { label: 'Debit (INR)', key: 'debit' },
    { label: 'Credit (INR)', key: 'credit' },
    { label: 'Running Balance (INR)', key: 'runningBalance' },
    { label: 'Description', key: 'description' },
  ];

  const columns = [
    {
      header: 'Entry Date',
      accessorKey: 'entryDate',
      render: (row: any) => formatDateDDMMYYYY(row.entryDate),
    },
    {
      header: 'Customer',
      render: (row: any) => (
        <Link href={`/customers/${row.customer.id}`} className="text-slate-900 dark:text-white hover:text-violet-500 font-semibold hover:underline transition-colors">
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
        <span className={cn(parseFloat(row.debit) > 0 ? 'text-rose-400 font-medium' : 'text-slate-500', "font-mono tabular-nums")}>
          {parseFloat(row.debit) > 0 ? `+${formatCurrency(row.debit)}` : '—'}
        </span>
      ),
    },
    {
      header: 'Credit (-)',
      accessorKey: 'credit',
      render: (row: any) => (
        <span className={cn(parseFloat(row.credit) > 0 ? 'text-emerald-400 font-medium' : 'text-slate-500', "font-mono tabular-nums")}>
          {parseFloat(row.credit) > 0 ? `-${formatCurrency(row.credit)}` : '—'}
        </span>
      ),
    },
    {
      header: 'Balance',
      accessorKey: 'runningBalance',
      render: (row: any) => (
        <span className="text-slate-900 dark:text-white font-bold font-mono tabular-nums">{formatCurrency(row.runningBalance)}</span>
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
        actions={
          <ExportButton
            data={entries}
            headers={ledgerHeaders}
            filename={`General_Ledger_${new Date().toISOString().split('T')[0]}`}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold shadow-lg border-slate-700 h-10 px-4"
          />
        }
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
