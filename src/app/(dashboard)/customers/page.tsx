import { getAllCustomers } from '@/features/customers/repository';
import { DataTable } from '@/components/shared/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { buttonVariants, Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils/currency';
import { Plus, User, Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || '';

  const customersList = await getAllCustomers(search);

  const columns = [
    {
      header: 'Customer Code',
      accessorKey: 'customerCode',
      render: (row: any) => (
        <span className="font-mono text-xs text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/15">
          {row.customerCode}
        </span>
      ),
    },
    {
      header: 'Full Name',
      accessorKey: 'fullName',
      render: (row: any) => (
        <span className="font-semibold text-slate-900 dark:text-white">{row.fullName}</span>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
    },
    {
      header: 'Email',
      accessorKey: 'email',
      render: (row: any) => (
        <span className="text-slate-500 dark:text-slate-400">{row.email || '—'}</span>
      ),
    },
    {
      header: 'Monthly Income',
      accessorKey: 'monthlyIncome',
      render: (row: any) => (
        <span className="text-emerald-400 font-semibold font-mono tabular-nums">{formatCurrency(row.monthlyIncome)}</span>
      ),
    },
    {
      header: 'Actions',
      render: (row: any) => (
        <Link
          href={`/customers/${row.id}`}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white gap-1.5'
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Profile</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Customers' }]} />

      <PageHeader
        title="Customers Registry"
        description="Search, view profiles, and register new loan customers."
        actions={
          <Link
            href="/customers/new"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm gap-2 h-10 px-4'
            )}
          >
            <Plus className="w-4 h-4" /> Register Customer
          </Link>
        }
      />

      {/* Search Filter Form */}
      <form method="GET" action="/customers" className="flex gap-2 max-w-lg mb-6 bg-slate-100 dark:bg-slate-900/20 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-grow flex items-center">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
          <Input
            name="search"
            defaultValue={search}
            placeholder="Search by name, phone, or customer code..."
            className="pl-9 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 h-9"
          />
        </div>
        <Button type="submit" size="sm" className="bg-slate-800 hover:bg-slate-700 text-white h-9 px-4 shrink-0">
          Search
        </Button>
      </form>

      {/* Customers Data Table */}
      <DataTable
        columns={columns}
        data={customersList}
        emptyTitle="No customers registered"
        emptyDescription="We couldn't find any customers matching that query. Register a new customer profile to get started."
        emptyIcon={<User className="w-12 h-12 text-slate-600" />}
        emptyAction={
          <Link
            href="/customers/new"
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-primary hover:bg-primary/95 text-white'
            )}
          >
            Register Customer
          </Link>
        }
      />
    </div>
  );
}
