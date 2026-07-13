import { z } from 'zod';

export const paymentSchema = z.object({
  loanId: z.string().uuid('Please select a valid loan account'),
  customerId: z.string().uuid('Please select a valid customer profile'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Payment amount must be a positive number',
  }),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMode: z.enum(['cash', 'bank_transfer', 'upi', 'cheque', 'other']),
  allocationMethod: z.enum(['interest_first', 'principal_first', 'manual']),
  isBackdated: z.boolean(),
  referenceNote: z.string().optional().nullable(),
  
  // Manual split overrides (validated conditionally if allocationMethod is 'manual')
  manualPrincipal: z.string(),
  manualInterest: z.string(),
  manualLateFee: z.string(),
  manualDiscount: z.string(),
});

export const settlementSchema = z.object({
  loanId: z.string().uuid('Please select a valid loan account'),
  settlementDate: z.string().min(1, 'Settlement date is required'),
  settlementAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Settlement amount cannot be negative',
  }),
  waivedAmount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Waived amount cannot be negative',
  }),
  reason: z.string().min(5, 'Reason for settlement must be at least 5 characters long'),
});

export type PaymentFormInput = z.infer<typeof paymentSchema>;
export type SettlementFormInput = z.infer<typeof settlementSchema>;
