import { getAllCustomers } from '@/features/customers/repository';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { LoanFormClient } from './loan-form-client';

interface PageProps {
  searchParams: Promise<{ customerId?: string }>;
}

export default async function NewLoanPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const customerId = params.customerId;

  const customersList = await getAllCustomers();
  
  // Format for selector
  const mappedCustomers = customersList.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    customerCode: c.customerCode,
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Loans', href: '/loans' },
          { label: 'Originate New' },
        ]}
      />

      <PageHeader
        title="Originate Loan"
        description="Select a registered customer, configure repayment variables, and generate a schedule plan."
      />

      <div className="max-w-4xl mx-auto">
        <LoanFormClient 
          customers={mappedCustomers} 
          preselectedCustomerId={customerId} 
        />
      </div>
    </div>
  );
}
