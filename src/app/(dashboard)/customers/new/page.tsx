'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createCustomerAction } from '@/features/customers/actions';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { toast } from 'sonner';

export default function NewCustomerPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: any) => {
    startTransition(async () => {
      const result = await createCustomerAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Customer registered successfully!');
        router.push(`/customers/${result.customerId}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Customers', href: '/customers' },
          { label: 'Register New' },
        ]}
      />

      <PageHeader
        title="Register Customer"
        description="Add a new customer profile, bank payout details, and guarantor references."
      />

      <div className="max-w-4xl mx-auto">
        <CustomerForm onSubmit={handleSubmit} isSubmitting={isPending} />
      </div>
    </div>
  );
}
