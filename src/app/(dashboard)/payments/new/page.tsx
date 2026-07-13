import { getAllLoans } from '@/features/loans/repository';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { PaymentFormClient } from './payment-form-client';

interface PageProps {
  searchParams: Promise<{ loanId?: string }>;
}

export default async function CollectPaymentPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const loanId = params.loanId;

  // Fetch loans list to map in dropdown
  const loansList = await getAllLoans();

  const mappedLoans = loansList.map((l) => ({
    id: l.id,
    loanNumber: l.loanNumber,
    customer: {
      id: l.customer.id,
      fullName: l.customer.fullName,
      customerCode: l.customer.customerCode,
    },
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Payments', href: '/payments' },
          { label: 'Collect Payment' },
        ]}
      />

      <PageHeader
        title="Record Repayment Receipt"
        description="Select a credit line, input payment details, and preview allocation splits."
      />

      <div className="max-w-4xl mx-auto">
        <PaymentFormClient 
          loans={mappedLoans} 
          preselectedLoanId={loanId} 
        />
      </div>
    </div>
  );
}
