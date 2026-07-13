import { getLoanById } from '@/features/loans/repository';
import { db } from '@/lib/db/client';
import { payments, ledgerEntries, settlements } from '../../../../../drizzle/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency } from '@/lib/utils/currency';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/data-table';
import {
  Coins, User, Calendar, CreditCard, Landmark, 
  Receipt, BookOpen, Clock, FileText, ArrowUpRight, Plus 
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LoanActionsPanel } from './loan-actions-panel';
import { formatDateDDMMYYYY } from '@/lib/utils/date';
import { ExportButton } from '@/components/shared/export-button';

interface DetailPageProps {
  params: Promise<{ loanId: string }>;
}

export default async function LoanDetailPage({ params }: DetailPageProps) {
  const { loanId } = await params;

  // 1. Fetch loan with customer and schedule
  const loan = await getLoanById(loanId);
  if (!loan) {
    notFound();
  }

  // 2. Fetch payments, ledger, and settlements
  const loanPayments = await db.select()
    .from(payments)
    .where(and(eq(payments.loanId, loanId), isNull(payments.deletedAt)))
    .orderBy(desc(payments.paymentDate));

  const loanLedger = await db.select()
    .from(ledgerEntries)
    .where(eq(ledgerEntries.loanId, loanId))
    .orderBy(desc(ledgerEntries.createdAt));

  const loanSettlements = await db.select()
    .from(settlements)
    .where(and(eq(settlements.loanId, loanId), isNull(settlements.deletedAt)));

  // Columns: Repayment Schedule
  const scheduleColumns = [
    {
      header: 'Inst.',
      accessorKey: 'installmentNo',
      className: 'w-10 text-slate-500 dark:text-slate-400 font-semibold text-xs',
    },
    {
      header: 'Due Date',
      accessorKey: 'dueDate',
      render: (row: any) => formatDateDDMMYYYY(row.dueDate),
    },
    {
      header: 'Principal Due',
      render: (row: any) => <span>{formatCurrency(row.principalDue)}</span>,
    },
    {
      header: 'Interest Due',
      render: (row: any) => <span>{formatCurrency(row.interestDue)}</span>,
    },
    {
      header: 'Late Fee Due',
      render: (row: any) => <span className="text-rose-400">{formatCurrency(row.lateFeeDue)}</span>,
    },
    {
      header: 'Total Due',
      render: (row: any) => <span className="text-white font-semibold">{formatCurrency(row.totalDue)}</span>,
    },
    {
      header: 'Paid Components',
      render: (row: any) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs">
          P: {formatCurrency(row.principalPaid)} | I: {formatCurrency(row.interestPaid)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      render: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  // Columns: Payments history
  const paymentColumns = [
    {
      header: 'Receipt ID',
      accessorKey: 'receiptNumber',
      render: (row: any) => (
        <span className="font-mono text-xs text-violet-400">{row.receiptNumber}</span>
      ),
    },
    {
      header: 'Amount Paid',
      accessorKey: 'amount',
      render: (row: any) => (
        <span className="text-emerald-400 font-bold">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Date Paid',
      accessorKey: 'paymentDate',
      render: (row: any) => formatDateDDMMYYYY(row.paymentDate),
    },
    {
      header: 'Mode',
      accessorKey: 'paymentMode',
      render: (row: any) => <span className="capitalize">{row.paymentMode.replace('_', ' ')}</span>,
    },
    {
      header: 'Allocation Split',
      render: (row: any) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs">
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
  ];

  // Columns: Ledger entry
  const ledgerColumns = [
    {
      header: 'Entry Date',
      accessorKey: 'entryDate',
      render: (row: any) => formatDateDDMMYYYY(row.entryDate),
    },
    {
      header: 'Tx Type',
      accessorKey: 'txnType',
      render: (row: any) => <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{row.txnType.replace('_', ' ')}</span>,
    },
    {
      header: 'Debit',
      accessorKey: 'debit',
      render: (row: any) => (
        <span className={parseFloat(row.debit) > 0 ? 'text-rose-400 font-medium' : 'text-slate-500'}>
          {parseFloat(row.debit) > 0 ? `+${formatCurrency(row.debit)}` : '—'}
        </span>
      ),
    },
    {
      header: 'Credit',
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
      <Breadcrumbs
        items={[
          { label: 'Loans', href: '/loans' },
          { label: loan.loanNumber },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title={`Loan Account: ${loan.loanNumber}`}
        description={`Status: ${loan.status.toUpperCase()}`}
        actions={
          <LoanActionsPanel
            loanId={loan.id}
            customerId={loan.customerId}
            outstandingBalance={parseFloat(loanLedger[0]?.runningBalance || '0')}
            status={loan.status}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Loan Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-sm sticky top-20">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800/60 pb-4">
              <span className="text-[10px] uppercase font-bold text-violet-400 tracking-wider">Lending Summary</span>
              <div className="flex justify-between items-center mt-2">
                <h3 className="text-lg font-bold text-white">{formatCurrency(loan.principalAmount)}</h3>
                <StatusBadge status={loan.status} />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Calculation</span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold capitalize">{loan.interestRate}% ({loan.interestType})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tenure</span>
                <span className="text-slate-700 dark:text-slate-300 capitalize">{loan.tenureValue} {loan.tenureUnit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Repayment Period</span>
                <span className="text-slate-700 dark:text-slate-300 capitalize">{loan.loanFrequency}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-3">
                <span className="text-slate-500">Disbursement Date</span>
                <span className="text-slate-700 dark:text-slate-300">{formatDateDDMMYYYY(loan.disbursementDate)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-3">
                <span className="text-slate-500">First Installment Date</span>
                <span className="text-slate-700 dark:text-slate-300">{formatDateDDMMYYYY(loan.startDate)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-800/40 pb-3">
                <span className="text-slate-500">Maturity Date</span>
                <span className="text-slate-700 dark:text-slate-300">{formatDateDDMMYYYY(loan.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Late Fee Policy</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono capitalize">
                  {loan.lateFeeType === 'flat' ? '₹' : ''}
                  {loan.lateFeeValue}
                  {loan.lateFeeType === 'percent' ? '%' : ''}
                </span>
              </div>


              {/* Customer Box */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 mt-6 space-y-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Customer Reference</span>
                <div className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold shrink-0">
                    {loan.customer.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate min-w-0 flex-grow">
                    <Link href={`/customers/${loan.customer.id}`} className="text-sm font-bold text-white hover:text-violet-400 hover:underline transition-colors block truncate">
                      {loan.customer.fullName}
                    </Link>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">{loan.customer.customerCode}</span>
                  </div>
                  <Link href={`/customers/${loan.customer.id}`} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-white shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Detailed logs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="schedule" className="w-full">
            <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 p-1 rounded-xl h-11 w-full flex justify-start select-none">
              <TabsTrigger value="schedule" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Repayment Schedule
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Receipts Log ({loanPayments.length})
              </TabsTrigger>
              <TabsTrigger value="ledger" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                General Ledger ({loanLedger.length})
              </TabsTrigger>
            </TabsList>

            {/* 1. Schedule Tab */}
            <TabsContent value="schedule" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="text-white text-base">Amortization & Schedule</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Repayment installment ledger, late fees, and allocation statuses.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <DataTable
                    columns={scheduleColumns}
                    data={loan.schedules}
                    emptyTitle="No installments"
                    emptyDescription="Repayment schedule has not been generated for this loan account."
                    emptyIcon={<Calendar className="w-12 h-12 text-slate-600" />}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. Receipts Tab */}
            <TabsContent value="payments" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="text-white text-base">Collection Payments History</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Receipts recorded against this loan account.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <DataTable
                    columns={paymentColumns}
                    data={loanPayments}
                    emptyTitle="No payments recorded"
                    emptyDescription="This lending account has not received any repayment transactions yet."
                    emptyIcon={<Receipt className="w-12 h-12 text-slate-600" />}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Ledger Tab */}
            <TabsContent value="ledger" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-4 border-b border-slate-200 dark:border-slate-800/60">
                  <div>
                    <CardTitle className="text-white text-base">Account Ledger Transactions</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">Immutable double-entry balance log of debits and credits.</CardDescription>
                  </div>
                  <ExportButton
                    data={loanLedger}
                    headers={[
                      { label: 'Entry Date', key: 'entryDate' },
                      { label: 'Transaction Type', key: 'txnType' },
                      { label: 'Debit (INR)', key: 'debit' },
                      { label: 'Credit (INR)', key: 'credit' },
                      { label: 'Running Balance (INR)', key: 'runningBalance' },
                      { label: 'Description', key: 'description' },
                    ]}
                    filename={`Loan_Ledger_${loan.loanNumber}_${new Date().toISOString().split('T')[0]}`}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-semibold border-slate-700 h-9"
                  />
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <DataTable
                    columns={ledgerColumns}
                    data={loanLedger}
                    emptyTitle="Ledger is empty"
                    emptyDescription="There are no ledger entries posted for this account yet."
                    emptyIcon={<BookOpen className="w-12 h-12 text-slate-600" />}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
