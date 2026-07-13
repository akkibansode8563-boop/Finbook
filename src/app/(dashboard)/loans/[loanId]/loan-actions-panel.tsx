'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { SettlementDialog } from '@/features/payments/components/settlement-dialog';
import { Plus, Scale } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface LoanActionsPanelProps {
  loanId: string;
  customerId: string;
  outstandingBalance: number;
  status: string;
}

export function LoanActionsPanel({ loanId, customerId, outstandingBalance, status }: LoanActionsPanelProps) {
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);
  const router = useRouter();

  const isClosed = status === 'closed' || status === 'settled';

  return (
    <div className="flex gap-2">
      {!isClosed && (
        <>
          <Link
            href={`/payments/new?loanId=${loanId}&customerId=${customerId}`}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'bg-violet-600 hover:bg-violet-700 text-white font-semibold gap-1.5 shadow-lg shadow-violet-500/10 h-10 px-4'
            )}
          >
            <Plus className="w-4 h-4" /> Collect Payment
          </Link>
          
          <Button 
            onClick={() => setIsSettlementOpen(true)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:bg-slate-850 hover:text-white font-semibold gap-1.5 h-10 px-4"
          >
            <Scale className="w-4 h-4" /> Settle Account
          </Button>

          <SettlementDialog
            isOpen={isSettlementOpen}
            onClose={() => setIsSettlementOpen(false)}
            loanId={loanId}
            outstandingBalance={outstandingBalance}
            onSuccess={() => {
              router.refresh();
            }}
          />
        </>
      )}
    </div>
  );
}
