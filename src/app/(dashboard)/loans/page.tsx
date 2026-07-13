import { getAllLoans } from '@/features/loans/repository';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { buttonVariants } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, Coins, Eye } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function LoansPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const statusFilter = params.status || '';

  const loansList = await getAllLoans(statusFilter);

  const columns = [
    {
      header: 'Loan ID',
      accessorKey: 'loanNumber',
      render: (row: any) => (
        <span className="font-mono text-xs text-violet-400 bg-violet-600/10 px-2.5 py-1 rounded-md border border-violet-500/15">
          {row.loanNumber}
        </span>
      ),
    },
    {
      header: 'Customer',
      render: (row: any) => (
        <Link href={`/customers/${row.customer.id}`} className="text-white hover:text-violet-400 hover:underline font-semibold transition-colors">
          {row.customer.fullName}
        </Link>
      ),
    },
    {
      header: 'Principal',
      accessorKey: 'principalAmount',
      render: (row: any) => (
        <span className="text-emerald-400 font-semibold">{formatCurrency(row.principalAmount)}</span>
      ),
    },
    {
      header: 'Interest Rate',
      render: (row: any) => (
        <span className="text-slate-700 dark:text-slate-300">{row.interestRate}% ({row.interestType})</span>
      ),
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
    },
    {
      header: 'Maturity Date',
      accessorKey: 'endDate',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (row: any) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <Link
          href={`/loans/${row.id}`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white gap-1.5'
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Manage</span>
        </Link>
      ),
    },
  ];

  const statuses = [
    { label: 'All Accounts', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Settled', value: 'settled' },
    { label: 'Closed', value: 'closed' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Loans' }]} />

      <PageHeader
        title="Financing Loans Registry"
        description="Monitor lending accounts, trace repayment plans, and manage defaults."
        actions={
          <Link
            href="/loans/new"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-lg shadow-violet-500/10 gap-2 h-10 px-4'
            )}
          >
            <Plus className="w-4 h-4" /> Originate Credit Line
          </Link>
        }
      />

      {/* Filter Tabs Header */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-855 pb-4 select-none">
        {statuses.map((s) => {
          const isActive = statusFilter === s.value;
          return (
            <Link
              key={s.value}
              href={s.value ? `/loans?status=${s.value}` : '/loans'}
              className={cn(
                buttonVariants({ variant: isActive ? 'default' : 'ghost', size: 'sm' }),
                isActive
                  ? 'bg-violet-600 text-white hover:bg-violet-700 h-8'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:bg-slate-900 h-8'
              )}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {/* Loans Data Table */}
      <DataTable
        columns={columns}
        data={loansList}
        emptyTitle="No loans registered"
        emptyDescription="We couldn't find any loans matching that status filter. Click Originate Credit Line to create one."
        emptyIcon={<Coins className="w-12 h-12 text-slate-600" />}
        emptyAction={
          <Link
            href="/loans/new"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-violet-600 hover:bg-violet-700 text-white'
            )}
          >
            Originate Loan
          </Link>
        }
      />
    </div>
  );
}
