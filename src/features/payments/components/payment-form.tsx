'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema, type PaymentFormInput } from '../schema';
import { allocatePayment, type InstallmentForAllocation } from '../allocation/allocator';
import { getUnpaidInstallmentsAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { Receipt, Landmark, Clock, Calendar, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
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
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function PaymentForm({
  loans,
  preselectedLoanId,
  onSubmit,
  isSubmitting = false,
}: PaymentFormProps) {
  const [schedules, setSchedules] = useState<InstallmentForAllocation[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      loanId: preselectedLoanId || '',
      customerId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMode: 'cash',
      allocationMethod: 'interest_first',
      isBackdated: false,
      referenceNote: '',
      manualPrincipal: '0',
      manualInterest: '0',
      manualLateFee: '0',
    },
  });

  const watchedValues = watch();

  // 1. Sync customerId when loanId changes
  const selectedLoan = useMemo(() => {
    return loans.find((l) => l.id === watchedValues.loanId);
  }, [loans, watchedValues.loanId]);

  useEffect(() => {
    if (selectedLoan) {
      setValue('customerId', selectedLoan.customer.id);
    } else {
      setValue('customerId', '');
    }
  }, [selectedLoan, setValue]);

  // 2. Fetch outstanding installments when loanId changes
  useEffect(() => {
    if (!watchedValues.loanId) {
      setSchedules([]);
      return;
    }

    const fetchSchedules = async () => {
      setIsLoadingSchedules(true);
      try {
        const res = await getUnpaidInstallmentsAction(watchedValues.loanId);
        if (res.error) {
          toast.error(res.error);
          setSchedules([]);
        } else if (res.schedules) {
          setSchedules(res.schedules as any[]);
        }
      } catch (err) {
        console.error(err);
        setSchedules([]);
      } finally {
        setIsLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [watchedValues.loanId]);

  // 3. Compute real-time payment split allocation preview
  const allocationPreview = useMemo(() => {
    const paymentVal = parseFloat(watchedValues.amount || '0');
    if (isNaN(paymentVal) || paymentVal <= 0 || schedules.length === 0) {
      return null;
    }

    const manualSplit = watchedValues.allocationMethod === 'manual' ? {
      principal: parseFloat(watchedValues.manualPrincipal || '0'),
      interest: parseFloat(watchedValues.manualInterest || '0'),
      lateFee: parseFloat(watchedValues.manualLateFee || '0'),
    } : undefined;

    try {
      return allocatePayment(
        paymentVal,
        watchedValues.allocationMethod,
        schedules,
        manualSplit
      );
    } catch (err) {
      return null;
    }
  }, [
    watchedValues.amount,
    watchedValues.allocationMethod,
    watchedValues.manualPrincipal,
    watchedValues.manualInterest,
    watchedValues.manualLateFee,
    schedules,
  ]);

  const totalOutstanding = useMemo(() => {
    return schedules.reduce((total, inst) => {
      const pOut = parseFloat(inst.principalDue) - parseFloat(inst.principalPaid);
      const iOut = parseFloat(inst.interestDue) - parseFloat(inst.interestPaid);
      const fOut = parseFloat(inst.lateFeeDue);
      return total + pOut + iOut + fOut;
    }, 0);
  }, [schedules]);

  return (
    <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white text-base">Collect Repayment Cash</CardTitle>
        <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Record payment receipts, allocate splits, and update schedules.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Loan Selector */}
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Select Loan Account *</Label>
              <Controller
                control={control}
                name="loanId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 h-10">
                      <SelectValue placeholder="Search and select loan number..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      {loans.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.loanNumber} — {l.customer.fullName} ({l.customer.customerCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.loanId && <p className="text-[11px] text-rose-400 font-medium">{errors.loanId.message}</p>}
            </div>

            {selectedLoan && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 space-y-2 md:col-span-2 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-violet-400">Customer profile Mapped</span>
                  <h3 className="text-sm font-bold text-white mt-1">{selectedLoan.customer.fullName}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">Code: {selectedLoan.customer.customerCode}</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Remaining Loan Outstanding</span>
                  {isLoadingSchedules ? (
                    <div className="flex justify-end pt-1">
                      <RefreshCw className="w-4 h-4 text-violet-400 animate-spin" />
                    </div>
                  ) : (
                    <strong className="text-emerald-400 block text-sm font-bold mt-1">{formatCurrency(totalOutstanding)}</strong>
                  )}
                </div>
              </div>
            )}

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Payment Amount (INR) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="10000.00"
                {...register('amount')}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
              />
              {errors.amount && <p className="text-[11px] text-rose-400 font-medium">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="paymentDate" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Receipt Date *</Label>
              <Input id="paymentDate" type="date" {...register('paymentDate')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
              {errors.paymentDate && <p className="text-[11px] text-rose-400 font-medium">{errors.paymentDate.message}</p>}
            </div>

            {/* Mode */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Payment Mode *</Label>
              <Controller
                control={control}
                name="paymentMode"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="cash">Cash Collection</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI/QR Code</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="other">Other Payment Mode</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Allocation Priority */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Allocation Method</Label>
              <Controller
                control={control}
                name="allocationMethod"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="interest_first">Interest Component First</SelectItem>
                      <SelectItem value="principal_first">Principal Component First</SelectItem>
                      <SelectItem value="manual">Manual Split Override</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Backdated check */}
            <div className="flex items-center space-x-2 pt-6 px-2">
              <Controller
                control={control}
                name="isBackdated"
                render={({ field }) => (
                  <Checkbox
                    id="isBackdated"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-slate-200 dark:border-slate-800 data-[state=checked]:bg-violet-600"
                  />
                )}
              />
              <label htmlFor="isBackdated" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Backdated Receipt (Manual Override)
              </label>
            </div>

            {/* Reference Note */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="referenceNote" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Reference Note / Tx Reference</Label>
              <Input id="referenceNote" placeholder="UTR Number, Cheque Details, or Cash Receipt ref" {...register('referenceNote')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
            </div>

            {/* Manual Split Panel */}
            {watchedValues.allocationMethod === 'manual' && (
              <div className="md:col-span-2 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Manual Principal</Label>
                  <Input type="number" step="0.01" {...register('manualPrincipal')} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Manual Interest</Label>
                  <Input type="number" step="0.01" {...register('manualInterest')} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase">Manual Fees</Label>
                  <Input type="number" step="0.01" {...register('manualLateFee')} className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
              </div>
            )}
          </div>

          {/* Allocation Preview Table */}
          {allocationPreview && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider block">Auto-calculated Allocation Splits</span>
              <div className="border border-slate-850 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="py-2.5 px-3 text-xs uppercase text-slate-500 dark:text-slate-400">Inst.</TableHead>
                      <TableHead className="py-2.5 px-3 text-xs uppercase text-slate-500 dark:text-slate-400">Fees Paid</TableHead>
                      <TableHead className="py-2.5 px-3 text-xs uppercase text-slate-500 dark:text-slate-400">Interest Paid</TableHead>
                      <TableHead className="py-2.5 px-3 text-xs uppercase text-slate-500 dark:text-slate-400">Principal Paid</TableHead>
                      <TableHead className="py-2.5 px-3 text-xs uppercase text-slate-500 dark:text-slate-400">Total Allocated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/20 divide-y divide-slate-850">
                    {allocationPreview.splits.map((s) => {
                      const total = s.principalAllocated + s.interestAllocated + s.lateFeeAllocated;
                      return (
                        <TableRow key={s.installmentId} className="hover:bg-slate-100 dark:hover:bg-slate-800/10">
                          <TableCell className="py-2 px-3 text-slate-500 dark:text-slate-400 font-semibold text-xs">{s.installmentNo}</TableCell>
                          <TableCell className="py-2 px-3 text-rose-400 text-xs">{formatCurrency(s.lateFeeAllocated)}</TableCell>
                          <TableCell className="py-2 px-3 text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(s.interestAllocated)}</TableCell>
                          <TableCell className="py-2 px-3 text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(s.principalAllocated)}</TableCell>
                          <TableCell className="py-2 px-3 text-emerald-400 font-bold text-xs">{formatCurrency(total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Excess Warning */}
              {allocationPreview.remainingPayment > 0 && (
                <div className="flex gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs items-center leading-relaxed">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>
                    Payment exceeds total outstanding! ₹{allocationPreview.remainingPayment} will remain as unallocated excess cash.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-850">
            <Button
              type="submit"
              disabled={isSubmitting || !watchedValues.amount || parseFloat(watchedValues.amount) <= 0}
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 shadow-lg shadow-violet-500/10"
            >
              {isSubmitting ? 'Recording Collection...' : 'Record Payment Receipt'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
