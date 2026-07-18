'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createLoanAction } from '@/features/loans/actions';
import { LoanForm } from '@/features/loans/components/loan-form';
import { toast } from 'sonner';

import { triggerConfetti } from '@/lib/utils/confetti';

interface LoanFormClientProps {
  customers: { id: string; fullName: string; customerCode: string }[];
  preselectedCustomerId?: string;
}

export function LoanFormClient({ customers, preselectedCustomerId }: LoanFormClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (data: any) => {
    startTransition(async () => {
      const result = await createLoanAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        triggerConfetti();
        toast.success('Loan originated successfully and principal disbursed!');
        router.push(`/loans/${result.loanId}`);
        router.refresh();
      }
    });
  };

  return (
    <LoanForm
      customers={customers}
      preselectedCustomerId={preselectedCustomerId}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
}
