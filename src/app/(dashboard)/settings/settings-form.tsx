'use client';

import { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { updateOrgSettingsAction } from '@/features/settings/actions';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

interface SettingsFormProps {
  initialData: {
    orgName: string;
    logoUrl: string | null;
    currency: string;
    timezone: string;
    financialYearStartMonth: number;
    defaultLateFeeType: 'flat' | 'percent';
    defaultLateFeeValue: string;
    defaultAllocationMethod: 'interest_first' | 'principal_first' | 'manual';
    interestRoundingRule: 'nearest' | 'up' | 'down';
  };
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      orgName: initialData.orgName,
      logoUrl: initialData.logoUrl || '',
      currency: initialData.currency,
      timezone: initialData.timezone,
      financialYearStartMonth: String(initialData.financialYearStartMonth),
      defaultLateFeeType: initialData.defaultLateFeeType,
      defaultLateFeeValue: initialData.defaultLateFeeValue,
      defaultAllocationMethod: initialData.defaultAllocationMethod,
      interestRoundingRule: initialData.interestRoundingRule,
    },
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const res = await updateOrgSettingsAction({
        orgName: data.orgName,
        logoUrl: data.logoUrl || null,
        currency: data.currency,
        timezone: data.timezone,
        financialYearStartMonth: parseInt(data.financialYearStartMonth),
        defaultLateFeeType: data.defaultLateFeeType,
        defaultLateFeeValue: data.defaultLateFeeValue,
        defaultAllocationMethod: data.defaultAllocationMethod,
        interestRoundingRule: data.interestRoundingRule,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Organization settings updated successfully!');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white text-base">Organization Profile</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Configure display names, currency, and timezone details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Org Name */}
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Organization Name *</Label>
              <Input id="orgName" {...register('orgName', { required: true })} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
            </div>

            {/* Logo URL */}
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Logo Image URL</Label>
              <Input id="logoUrl" placeholder="https://example.com/logo.png" {...register('logoUrl')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Operating Currency</Label>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="INR">INR (₹) Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD ($) US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR (€) Euro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Timezone */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Timezone</Label>
              <Controller
                control={control}
                name="timezone"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="UTC">UTC / Greenwich</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Repayments & Default rules Card */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white text-base">Lending & Accounting Policy</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Set defaults for late fees, interest rounding, and payment splits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Late Fee Type */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Default Late Fee Type</Label>
              <Controller
                control={control}
                name="defaultLateFeeType"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="flat">Flat Cash Fee</SelectItem>
                      <SelectItem value="percent">Percentage of Due Component</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Late Fee Value */}
            <div className="space-y-1.5">
              <Label htmlFor="defaultLateFeeValue" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Default Late Fee Value</Label>
              <Input id="defaultLateFeeValue" type="number" step="0.01" {...register('defaultLateFeeValue')} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-10" />
            </div>

            {/* Default Allocation Method */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Default Payment Allocation Priority</Label>
              <Controller
                control={control}
                name="defaultAllocationMethod"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="interest_first">Interest Component First</SelectItem>
                      <SelectItem value="principal_first">Principal Component First</SelectItem>
                      <SelectItem value="manual">Manual Collections Split</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Rounding Rule */}
            <div className="space-y-1.5">
              <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Interest Calculation Rounding</Label>
              <Controller
                control={control}
                name="interestRoundingRule"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                      <SelectItem value="nearest">Round to Nearest Integer</SelectItem>
                      <SelectItem value="up">Round Up (Ceil)</SelectItem>
                      <SelectItem value="down">Round Down (Floor)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-850">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 shadow-lg shadow-violet-500/10 h-10"
        >
          {isPending ? 'Saving Settings...' : 'Save Configuration'}
        </Button>
      </div>
    </form>
  );
}
