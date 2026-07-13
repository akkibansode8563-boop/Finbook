'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loanSchema, type LoanFormInput } from '../schema';
import { generateRepaymentSchedule } from '../../interest-engine/schedule-generator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils/currency';
import { ArrowRight, ArrowLeft, Coins, Check, Calendar, Info } from 'lucide-react';
import { toast } from 'sonner';
import { formatDateDDMMYYYY } from '@/lib/utils/date';

interface LoanFormProps {
  customers: { id: string; fullName: string; customerCode: string }[];
  preselectedCustomerId?: string;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function LoanForm({
  customers,
  preselectedCustomerId,
  onSubmit,
  isSubmitting = false,
}: LoanFormProps) {
  const [step, setStep] = useState(1);
  const [previewSchedule, setPreviewSchedule] = useState<any[]>([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanFormInput>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      customerId: preselectedCustomerId || '',
      principalAmount: '',
      interestType: 'reducing',
      interestRate: '',
      interestPeriod: 'month',
      loanFrequency: 'monthly',
      paymentType: 'emi',
      allocationMethod: 'interest_first',
      disbursementDate: new Date().toISOString().split('T')[0],
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      tenureValue: 12,
      tenureUnit: 'months',
      lateFeeType: 'flat',
      lateFeeValue: '100',
      gracePeriodDays: 5,
      notes: '',
    },
  });

  const watchedValues = watch();

  const handleNext = () => {
    // Basic validation check before moving to step 2/3
    if (step === 1) {
      if (!watchedValues.customerId) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Generate client-side preview of repayment schedule
      const principal = parseFloat(watchedValues.principalAmount);
      const rate = parseFloat(watchedValues.interestRate);
      const tenure = watchedValues.tenureValue;

      if (!principal || !rate || !tenure) {
        return;
      }

      const schedule = generateRepaymentSchedule({
        principalAmount: principal,
        interestType: watchedValues.interestType,
        interestRate: rate,
        loanFrequency: watchedValues.loanFrequency,
        tenureValue: tenure,
        tenureUnit: watchedValues.tenureUnit,
        startDate: watchedValues.startDate,
      });

      setPreviewSchedule(schedule);
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const selectedCustomer = customers.find((c) => c.id === watchedValues.customerId);

  return (
    <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white text-base">New Loan Origination</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Originate a new credit line and generate repayment schedule installments.</CardDescription>
          </div>
          {/* Step indicators */}
          <div className="flex gap-1.5 select-none">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  step === s
                    ? 'bg-violet-600 border-violet-500 text-white'
                    : step > s
                    ? 'bg-slate-800 border-slate-700 text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-900 text-slate-500'
                }`}
              >
                {step > s ? <Check className="w-3 h-3" /> : s}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Step 1: Customer Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Select Customer *</Label>
              <Controller
                control={control}
                name="customerId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 h-11 w-full">
                      <SelectValue placeholder="Search and select customer profile..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.fullName} ({c.customerCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.customerId && (
                <p className="text-[11px] text-rose-400 font-medium">{errors.customerId.message}</p>
              )}
            </div>

            {selectedCustomer && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 space-y-2">
                <span className="text-[10px] uppercase font-bold text-violet-400">Customer profile Selected</span>
                <h3 className="text-sm font-bold text-white">{selectedCustomer.fullName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Customer Code: {selectedCustomer.customerCode}</p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                disabled={!watchedValues.customerId}
                onClick={handleNext}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Configure Terms</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Loan Terms */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Principal Amount (INR) *</Label>
                <Input
                  type="number"
                  placeholder="100000"
                  {...register('principalAmount')}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
                />
                {errors.principalAmount && (
                  <p className="text-[11px] text-rose-400 font-medium">{errors.principalAmount.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Interest Rate (%) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="12.00"
                  {...register('interestRate')}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
                />
                {errors.interestRate && (
                  <p className="text-[11px] text-rose-400 font-medium">{errors.interestRate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Interest Calculation Mode</Label>
                <Controller
                  control={control}
                  name="interestType"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        <SelectItem value="reducing">Reducing Balance (Standard EMI)</SelectItem>
                        <SelectItem value="flat">Flat Interest Rate</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Repayment Frequency</Label>
                <Controller
                  control={control}
                  name="loanFrequency"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Tenure Value *</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    {...register('tenureValue', { valueAsNumber: true })}
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 w-1/2 h-10"
                  />
                  <Controller
                    control={control}
                    name="tenureUnit"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 w-1/2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.tenureValue && (
                  <p className="text-[11px] text-rose-400 font-medium">{errors.tenureValue.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Late Fee Policy</Label>
                <div className="flex gap-2">
                  <Controller
                    control={control}
                    name="lateFeeType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 w-1/3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                          <SelectItem value="flat">Flat (₹)</SelectItem>
                          <SelectItem value="percent">Percent (%)</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Input
                    placeholder="Fee Value"
                    {...register('lateFeeValue')}
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-grow h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Disbursement Date *</Label>
                <Input type="date" {...register('disbursementDate')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">First Repayment Date *</Label>
                <Input type="date" {...register('startDate')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Grace Period (Days)</Label>
                <Input
                  type="number"
                  {...register('gracePeriodDays', { valueAsNumber: true })}
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Allocation Priority</Label>
                <Controller
                  control={control}
                  name="allocationMethod"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
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

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Internal Notes</Label>
                <Input placeholder="Reference documentation or loan notes" {...register('notes')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800/60">
              <Button type="button" variant="outline" onClick={handleBack} className="bg-slate-100 dark:bg-slate-900 border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Select Customer</span>
              </Button>
              <Button
                type="button"
                disabled={
                  !watchedValues.principalAmount ||
                  !watchedValues.interestRate ||
                  !watchedValues.tenureValue
                }
                onClick={handleNext}
                className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                <span>Preview Installments</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Schedule Preview & Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500">Customer</span>
                <strong className="text-white block mt-0.5">{selectedCustomer?.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Principal Amount</span>
                <strong className="text-emerald-400 block mt-0.5 font-semibold">{formatCurrency(watchedValues.principalAmount)}</strong>
              </div>
              <div>
                <span className="text-slate-500">Interest Calculation</span>
                <strong className="text-white block mt-0.5 capitalize">{watchedValues.interestRate}% ({watchedValues.interestType})</strong>
              </div>
              <div>
                <span className="text-slate-500">Repayment Plan</span>
                <strong className="text-white block mt-0.5 capitalize">
                  {watchedValues.tenureValue} {watchedValues.tenureUnit} ({watchedValues.loanFrequency})
                </strong>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-violet-400" />
                <span>Verify calculated installments before finalizing disbursement.</span>
              </div>

              {/* Installment preview table */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs uppercase text-slate-500 dark:text-slate-400 py-2.5 px-3">No.</TableHead>
                      <TableHead className="text-xs uppercase text-slate-500 dark:text-slate-400 py-2.5 px-3">Due Date</TableHead>
                      <TableHead className="text-xs uppercase text-slate-500 dark:text-slate-400 py-2.5 px-3">Principal</TableHead>
                      <TableHead className="text-xs uppercase text-slate-500 dark:text-slate-400 py-2.5 px-3">Interest</TableHead>
                      <TableHead className="text-xs uppercase text-slate-500 dark:text-slate-400 py-2.5 px-3">Total Installment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/20 divide-y divide-slate-850">
                    {previewSchedule.map((inst) => (
                      <TableRow key={inst.installmentNo} className="hover:bg-slate-100 dark:hover:bg-slate-800/20">
                        <TableCell className="py-2.5 px-3 text-slate-500 dark:text-slate-400 text-xs font-semibold">{inst.installmentNo}</TableCell>
                        <TableCell className="py-2.5 px-3 text-slate-700 dark:text-slate-300 text-xs">{formatDateDDMMYYYY(inst.dueDate)}</TableCell>
                        <TableCell className="py-2.5 px-3 text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(inst.principalDue)}</TableCell>
                        <TableCell className="py-2.5 px-3 text-slate-700 dark:text-slate-300 text-xs">{formatCurrency(inst.interestDue)}</TableCell>
                        <TableCell className="py-2.5 px-3 text-white text-xs font-semibold">{formatCurrency(inst.totalDue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-200 dark:border-slate-800/60">
              <Button type="button" variant="outline" onClick={handleBack} className="bg-slate-100 dark:bg-slate-900 border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                <span>Adjust Terms</span>
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(
                  (data) => onSubmit(data),
                  (errs) => {
                    console.error('Validation Errors:', errs);
                    const firstErrorKey = Object.keys(errs)[0];
                    if (firstErrorKey) {
                      const firstError = errs[firstErrorKey as keyof typeof errs];
                      toast.error(`Validation error on ${firstErrorKey}: ${firstError?.message}`);
                    }
                  }
                )}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 px-6 shadow-lg shadow-emerald-500/10"
              >
                <Coins className="w-4 h-4" />
                <span>{isSubmitting ? 'Originating...' : 'Confirm & Disburse'}</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export type LoanFormWrapper = typeof LoanForm;
