import { getAllPayments } from '@/features/payments/repository';
import { formatDateDDMMYYYY } from '@/lib/utils/date';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { buttonVariants } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, Receipt, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default async function PaymentsLogPage() {
  const receipts = await getAllPayments();

  const columns = [
    {
      header: 'Receipt ID',
      accessorKey: 'receiptNumber',
      render: (row: any) => (
        <span className="font-mono text-xs text-violet-400 bg-violet-600/10 px-2.5 py-1 rounded-md border border-violet-500/15">
          {row.receiptNumber}
        </span>
      ),
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
      header: 'Loan Account',
      render: (row: any) => (
        <Link href={`/loans/${row.loan.id}`} className="font-mono text-xs text-slate-700 dark:text-slate-300 hover:text-violet-400 hover:underline">
          {row.loan.loanNumber}
        </Link>
      ),
    },
    {
      header: 'Amount Paid',
      accessorKey: 'amount',
      render: (row: any) => (
        <span className="text-emerald-400 font-bold font-mono tabular-nums">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Date Collected',
      accessorKey: 'paymentDate',
      render: (row: any) => formatDateDDMMYYYY(row.paymentDate),
    },
    {
      header: 'Mode',
      accessorKey: 'paymentMode',
      render: (row: any) => <span className="capitalize text-slate-700 dark:text-slate-300">{row.paymentMode.replace('_', ' ')}</span>,
    },
    {
      header: 'Allocations Split',
      render: (row: any) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs font-mono tabular-nums">
          P: {formatCurrency(row.principalComponent)} | I: {formatCurrency(row.interestComponent)} | F: {formatCurrency(row.lateFeeComponent)}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (row: any) => (
        <StatusBadge status={row.reversed ? 'overdue' : 'paid'} />
      ),
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <Link
          href={`/loans/${row.loan.id}`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-8 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          )}
        >
          <Eye className="w-4 h-4 mr-1" /> View Loan
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Payments' }]} />

      <PageHeader
        title="Repayments Receipt Journal"
        description="Monitor all transaction receipts, collection modes, and ledger offsets."
        actions={
          <Link
            href="/payments/new"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/10 gap-2 h-10 px-4'
            )}
          >
            <Plus className="w-4 h-4" /> Collect Repayment Cash
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={receipts}
        emptyTitle="No payments recorded"
        emptyDescription="The system has not logged any collections transactions yet. Click Collect Repayment Cash to record one."
        emptyIcon={<Receipt className="w-12 h-12 text-slate-600" />}
        emptyAction={
          <Link
            href="/payments/new"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-violet-600 hover:bg-violet-700 text-white'
            )}
          >
            Record Payment
          </Link>
        }
      />
    </div>
  );
}
