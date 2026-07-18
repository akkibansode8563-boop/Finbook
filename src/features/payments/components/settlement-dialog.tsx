'use client';

import { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { settlementSchema, type SettlementFormInput } from '../schema';
import { createSettlementAction } from '../actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';
import { Scale } from 'lucide-react';

interface SettlementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: string;
  outstandingBalance: number;
  onSuccess?: () => void;
}

export function SettlementDialog({
  isOpen,
  onClose,
  loanId,
  outstandingBalance,
  onSuccess,
}: SettlementDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettlementFormInput>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      loanId,
      settlementDate: new Date().toISOString().split('T')[0],
      settlementAmount: '',
      waivedAmount: '0.00',
      reason: '',
    },
  });

  const settlementAmountVal = watch('settlementAmount');

  // Auto-calculate waive amount: outstandingBalance - settlementAmount
  useEffect(() => {
    const amt = parseFloat(settlementAmountVal || '0');
    if (isNaN(amt) || amt < 0) {
      setValue('waivedAmount', '0.00');
    } else {
      const waived = Math.max(0, outstandingBalance - amt);
      setValue('waivedAmount', waived.toFixed(2));
    }
  }, [settlementAmountVal, outstandingBalance, setValue]);

  const onSubmit = (data: SettlementFormInput) => {
    startTransition(async () => {
      const result = await createSettlementAction(data);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Loan account settled successfully and ledger cleared!');
        onClose();
        onSuccess?.();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <span>Settle Loan Account</span>
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
            Resolve this account by recording a final compromise payoff and waiving the remaining balance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="p-3.5 rounded-xl bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Total Outstanding Balance</span>
            <strong className="text-rose-400 font-bold text-sm">{formatCurrency(outstandingBalance)}</strong>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="settlementDate" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Settlement Date *</Label>
            <Input id="settlementDate" type="date" {...register('settlementDate')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
            {errors.settlementDate && <p className="text-[11px] text-rose-400 font-medium">{errors.settlementDate.message}</p>}
          </div>

          {/* Payoff Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="settlementAmount" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Compromise Payoff Amount (INR) *</Label>
            <Input
              id="settlementAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('settlementAmount')}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
            />
            {errors.settlementAmount && <p className="text-[11px] text-rose-400 font-medium">{errors.settlementAmount.message}</p>}
          </div>

          {/* Waived Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="waivedAmount" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Waived / Written-off Balance (Auto)</Label>
            <Input
              id="waivedAmount"
              type="number"
              step="0.01"
              readOnly
              {...register('waivedAmount')}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10 text-slate-500 font-mono font-semibold"
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Settlement Reason *</Label>
            <Input
              id="reason"
              placeholder="e.g. Compromise settlement due to financial distress"
              {...register('reason')}
              className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
            />
            {errors.reason && <p className="text-[11px] text-rose-400 font-medium">{errors.reason.message}</p>}
          </div>

          <DialogFooter className="mt-6 gap-2 sm:justify-end">
            <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !settlementAmountVal}
              className="bg-primary hover:bg-primary/95 text-white font-semibold shadow-sm"
            >
              {isPending ? 'Processing...' : 'Settle Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export type SettlementDialogWrapper = typeof SettlementDialog;
