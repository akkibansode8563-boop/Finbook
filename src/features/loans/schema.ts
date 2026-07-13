import { z } from 'zod';

export const loanSchema = z.object({
  customerId: z.string().uuid('Please select a valid customer'),
  principalAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Principal amount must be a positive number',
  }),
  interestType: z.enum(['flat', 'reducing']),
  interestRate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Interest rate must be a valid percentage',
  }),
  interestPeriod: z.enum(['day', 'month', 'year']),
  loanFrequency: z.enum(['daily', 'weekly', 'monthly', 'yearly', 'custom']),
  paymentType: z.enum(['emi', 'interest_only', 'custom', 'one_time_settlement']),
  allocationMethod: z.enum(['interest_first', 'principal_first', 'manual']),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  startDate: z.string().min(1, 'Repayment start date is required'),
  tenureValue: z.number().int().positive('Tenure must be a positive integer'),
  tenureUnit: z.enum(['days', 'weeks', 'months', 'years']),
  lateFeeType: z.enum(['flat', 'percent']),
  lateFeeValue: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Late fee must be a valid number',
  }),
  gracePeriodDays: z.number().int().nonnegative('Grace period cannot be negative'),
  notes: z.string().optional().nullable(),
});

export type LoanFormInput = z.infer<typeof loanSchema>;
export type LoanFormSchema = typeof loanSchema;
