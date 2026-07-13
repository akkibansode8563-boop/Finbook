'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { recordPaymentAction } from '@/features/payments/actions';
import { PaymentForm } from '@/features/payments/components/payment-form';
import { toast } from 'sonner';

interface PaymentFormClientProps {
  loans: {
    id: string;
    loanNumber: string;
    customer: {
      id: string;
      fullName: string;
      customerCode: string;
    };
  }[];
  preselectedLoanId?: string;
}

export function PaymentFormClient({ loans, preselectedLoanId }: PaymentFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: any) => {
    startTransition(async () => {
      const result = await recordPaymentAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Payment receipt recorded successfully and ledger credited!');
        router.push(`/loans/${data.loanId}`);
        router.refresh();
      }
    });
  };

  return (
    <PaymentForm
      loans={loans}
      preselectedLoanId={preselectedLoanId}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}
