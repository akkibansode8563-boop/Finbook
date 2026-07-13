import { getCustomerById } from '@/features/customers/repository';
import { db } from '@/lib/db/client';
import { loans } from '../../../../../drizzle/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency } from '@/lib/utils/currency';
import { DeleteCustomerButton } from '@/features/customers/components/delete-customer-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button, buttonVariants } from '@/components/ui/button';
import { DataTable } from '@/components/shared/data-table';
import { cn } from '@/lib/utils';
import { 
  Phone, Mail, Calendar, MapPin, Briefcase, 
  Wallet, Pencil, Plus, Landmark, FileText, 
  ShieldAlert, BookOpen, Clock, BadgeAlert 
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDateDDMMYYYY } from '@/lib/utils/date';

interface DetailPageProps {
  params: Promise<{ customerId: string }>;
}

export default async function CustomerDetailPage({ params }: DetailPageProps) {
  const { customerId } = await params;
  
  // 1. Fetch customer with nested details
  const customer = await getCustomerById(customerId);
  if (!customer) {
    notFound();
  }

  // 2. Fetch associated loans
  const customerLoans = await db.select()
    .from(loans)
    .where(and(eq(loans.customerId, customerId), isNull(loans.deletedAt)));

  // Loans columns
  const loanColumns = [
    {
      header: 'Loan Number',
      accessorKey: 'loanNumber',
      render: (row: any) => (
        <span className="font-mono text-xs text-violet-400 bg-violet-600/10 px-2.5 py-1 rounded-md border border-violet-500/15">
          {row.loanNumber}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'principalAmount',
      render: (row: any) => (
        <span className="text-slate-900 dark:text-white font-semibold">{formatCurrency(row.principalAmount)}</span>
      ),
    },
    {
      header: 'Interest Rate',
      accessorKey: 'interestRate',
      render: (row: any) => (
        <span className="text-slate-700 dark:text-slate-300">{row.interestRate}% ({row.interestType})</span>
      ),
    },
    {
      header: 'Tenure',
      render: (row: any) => (
        <span className="text-slate-700 dark:text-slate-300">{row.tenureValue} {row.tenureUnit}</span>
      ),
    },
    {
      header: 'Disbursement',
      accessorKey: 'disbursementDate',
      render: (row: any) => formatDateDDMMYYYY(row.disbursementDate),
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
            'h-8 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          )}
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Customers', href: '/customers' },
          { label: customer.fullName },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title={customer.fullName}
        description={`Registered Code: ${customer.customerCode}`}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/customers/${customer.id}/edit`}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'gap-2 h-10 px-4 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
            <DeleteCustomerButton customerId={customer.id} customerName={customer.fullName} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Summary Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-sm sticky top-20">
            <CardHeader className="text-center pb-4 border-b border-slate-200 dark:border-slate-800/60">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold mx-auto shadow-lg uppercase select-none">
                {customer.fullName.substring(0, 2)}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4">{customer.fullName}</h2>
              <span className="text-xs text-slate-500 font-mono">{customer.customerCode}</span>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{customer.phone}</span>
              </div>
              {customer.altPhone && (
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 pl-7 text-xs">
                  <span>Alt: {customer.altPhone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{customer.email || 'No email registered'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Born: {formatDateDDMMYYYY(customer.dob)}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Occupation: {customer.occupation || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <Wallet className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Monthly Income: <strong className="text-emerald-400 font-semibold">{formatCurrency(customer.monthlyIncome)}</strong></span>
              </div>
              <div className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customer.address || 'No address registered'}</span>
              </div>
              {customer.notes && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/60 mt-4">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Internal Notes</span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/40">{customer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Tab Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="loans" className="w-full">
            <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 p-1 rounded-xl h-11 w-full flex justify-start select-none">
              <TabsTrigger value="loans" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Loans ({customerLoans.length})
              </TabsTrigger>
              <TabsTrigger value="kyc" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                KYC Docs ({customer.identityDocuments.length})
              </TabsTrigger>
              <TabsTrigger value="bank" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Bank Accounts ({customer.bankDetails.length})
              </TabsTrigger>
              <TabsTrigger value="guarantors" className="rounded-lg text-xs font-semibold px-4 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                Guarantors ({customer.guarantors.length})
              </TabsTrigger>
            </TabsList>

            {/* 1. Loans tab */}
            <TabsContent value="loans" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-slate-900 dark:text-white text-base">Financing Loans</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Active disbursements and loan accounts history.</CardDescription>
                  </div>
                  <Link
                    href={`/loans/new?customerId=${customer.id}`}
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'sm' }),
                      'bg-violet-600 hover:bg-violet-700 text-white gap-1'
                    )}
                  >
                    <Plus className="w-4 h-4" /> Originate Loan
                  </Link>
                </CardHeader>
                <CardContent className="px-0 sm:px-6">
                  <DataTable
                    columns={loanColumns}
                    data={customerLoans}
                    emptyTitle="No loans originated"
                    emptyDescription="This customer does not have any active or past loan accounts. Click Originate Loan to create one."
                    emptyIcon={<BookOpen className="w-12 h-12 text-slate-600" />}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 2. KYC Tab */}
            <TabsContent value="kyc" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white text-base">Identity Verifications</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Official registration documents for verification checks.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.identityDocuments.map((doc) => (
                      <div key={doc.id} className="p-4 rounded-xl border border-slate-850 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{doc.docType.replace('_', ' ')}</span>
                          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{doc.docNumber}</p>
                          {doc.fileUrl && (
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 hover:underline block pt-2">
                              View Attached Proof
                            </a>
                          )}
                        </div>
                        <StatusBadge status={doc.verified ? 'paid' : 'pending'} />
                      </div>
                    ))}
                    {customer.identityDocuments.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
                        No identity documents uploaded.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Bank details Tab */}
            <TabsContent value="bank" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white text-base">Bank Payout Accounts</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Verified accounts mapped for EMI withdrawals and bank transfers.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customer.bankDetails.map((bank) => (
                      <div key={bank.id} className="p-4 rounded-xl border border-slate-850 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 space-y-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">{bank.bankName}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Holder: {bank.accountHolderName}</span>
                          </div>
                          {bank.isPrimary && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs border-t border-slate-200 dark:border-slate-800/60 pt-3">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Account No.</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{bank.accountNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">IFSC Code</span>
                            <span className="font-mono text-slate-700 dark:text-slate-300">{bank.ifscCode}</span>
                          </div>
                          {bank.upiId && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">UPI ID</span>
                              <span className="text-slate-700 dark:text-slate-300">{bank.upiId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {customer.bankDetails.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-slate-500 text-xs">
                        No bank accounts registered.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 4. Guarantors Tab */}
            <TabsContent value="guarantors" className="mt-4">
              <Card className="bg-slate-100 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/80">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white text-base">Linked Guarantors</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">References supporting loan verification checks.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customer.guarantors.map((g) => (
                      <div key={g.id} className="p-4 rounded-xl border border-slate-850 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white block">{g.fullName}</span>
                            <span className="text-xs text-violet-400 block font-medium capitalize mt-0.5">Relation: {g.relation || 'Co-signer'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span>{g.phone}</span>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs md:border-l md:border-slate-200 dark:border-slate-800/80 md:pl-4">
                          {g.address && (
                            <div className="flex gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                              <span className="text-slate-500 dark:text-slate-400 leading-relaxed">{g.address}</span>
                            </div>
                          )}
                          {(g.idProofType || g.idProofNumber) && (
                            <div className="flex gap-2">
                              <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                              <span className="font-mono text-slate-500 dark:text-slate-400">
                                {g.idProofType}: {g.idProofNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {customer.guarantors.length === 0 && (
                      <div className="text-center py-8 text-slate-500 text-xs">
                        No co-signers or guarantors registered.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
