'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerAction } from '@/features/customers/actions';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { toast } from 'sonner';

interface EditFormClientProps {
  customerId: string;
  initialData: any;
}

export function EditFormClient({ customerId, initialData }: EditFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: any) => {
    startTransition(async () => {
      const result = await updateCustomerAction(customerId, data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Customer profile updated successfully!');
        router.push(`/customers/${customerId}`);
        router.refresh();
      }
    });
  };

  return (
    <CustomerForm 
      initialData={initialData} 
      onSubmit={handleSubmit} 
      isSubmitting={isPending} 
    />
  );
}
