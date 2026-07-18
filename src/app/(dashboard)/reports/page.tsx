import { requireRole } from '@/lib/auth/rbac';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, BarChart3, Users, Banknote, Receipt, BookOpen } from 'lucide-react';
import { db } from '@/lib/db/client';
import { customers, loans, payments, ledgerEntries } from '../../../../drizzle/schema';
import { isNull } from 'drizzle-orm';
import { ExportButtonClient } from './export-button-client';

export default async function ReportsPage() {
  // restricted to manager+
  await requireRole('manager');

  // Server Actions for CSV Exports
  const exportCustomers = async () => {
    'use server';
    const list = await db.select().from(customers);
    const headers = ['ID', 'Customer Code', 'Full Name', 'Phone', 'Email', 'Monthly Income', 'Joined Date'];
    const rows = list.map((c) => [
      c.id,
      c.customerCode,
      c.fullName,
      c.phone,
      c.email || '',
      c.monthlyIncome,
      c.createdAt.toISOString(),
    ]);
    return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
  };

  const exportLoans = async () => {
    'use server';
    const list = await db.select().from(loans);
    const headers = ['ID', 'Loan Number', 'Customer ID', 'Principal Amount', 'Interest Rate', 'Interest Type', 'Disbursement Date', 'Status'];
    const rows = list.map((l) => [
      l.id,
      l.loanNumber,
      l.customerId,
      l.principalAmount,
      l.interestRate,
      l.interestType,
      l.disbursementDate,
      l.status,
    ]);
    return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
  };

  const exportPayments = async () => {
    'use server';
    const list = await db.select().from(payments).where(isNull(payments.deletedAt));
    const headers = ['ID', 'Receipt Number', 'Loan ID', 'Amount', 'Payment Date', 'Payment Mode', 'Principal Component', 'Interest Component'];
    const rows = list.map((p) => [
      p.id,
      p.receiptNumber,
      p.loanId,
      p.amount,
      p.paymentDate,
      p.paymentMode,
      p.principalComponent,
      p.interestComponent,
    ]);
    return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
  };

  const exportLedger = async () => {
    'use server';
    const list = await db.select().from(ledgerEntries);
    const headers = ['ID', 'Loan ID', 'Date', 'Transaction Type', 'Debit', 'Credit', 'Running Balance', 'Description'];
    const rows = list.map((e) => [
      e.id,
      e.loanId,
      e.entryDate,
      e.txnType,
      e.debit,
      e.credit,
      e.runningBalance,
      e.description,
    ]);
    return [headers.join(','), ...rows.map((r) => r.map((val) => `"${val}"`).join(','))].join('\n');
  };

  const reportTypes = [
    {
      title: 'Customers Master Registry',
      description: 'Download registered customer profiles, contact numbers, and KYC details.',
      icon: Users,
      color: 'text-brass',
      action: exportCustomers,
      filename: 'customers_registry_report.csv',
    },
    {
      title: 'Active Loans Portfolio',
      description: 'Export all loan accounts, disbursal dates, principal amounts, and statuses.',
      icon: Banknote,
      color: 'text-primary',
      action: exportLoans,
      filename: 'loans_portfolio_report.csv',
    },
    {
      title: 'Collections Receipts Log',
      description: 'Export payment collection history, transaction modes, and allocations split.',
      icon: Receipt,
      color: 'text-emerald-400',
      action: exportPayments,
      filename: 'collections_receipts_report.csv',
    },
    {
      title: 'General Accounting Ledger',
      description: 'Download the complete double-entry ledger database for external auditing.',
      icon: BookOpen,
      color: 'text-rose-400',
      action: exportLedger,
      filename: 'general_ledger_report.csv',
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Reports' }]} />

      <PageHeader
        title="Analytical Reports & Exports"
        description="Compile and download master registry archives as structured CSV spreadsheets."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((rep, idx) => (
          <Card key={idx} className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  <rep.icon className={`w-5 h-5 ${rep.color}`} />
                  <span>{rep.title}</span>
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs pt-1">{rep.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex justify-end">
              <ExportButtonClient exportFn={rep.action} filename={rep.filename} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
