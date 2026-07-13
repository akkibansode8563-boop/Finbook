import { z } from 'zod';

export const customerIdentityDocumentSchema = z.object({
  docType: z.enum(['aadhaar', 'pan', 'voter_id', 'passport', 'other']),
  docNumber: z.string().min(2, 'Document number is required'),
  fileUrl: z.string().optional().nullable(),
});

export const guarantorSchema = z.object({
  fullName: z.string().min(2, 'Guarantor name is required'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  address: z.string().optional().nullable(),
  relation: z.string().optional().nullable(),
  idProofType: z.string().optional().nullable(),
  idProofNumber: z.string().optional().nullable(),
  idProofUrl: z.string().optional().nullable(),
});

export const customerBankDetailsSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountNumber: z.string().min(5, 'Enter a valid account number'),
  ifscCode: z.string().min(4, 'Enter a valid IFSC code'),
  upiId: z.string().optional().nullable(),
  isPrimary: z.boolean(),
});

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number'),
  altPhone: z.string().optional().nullable(),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  dob: z.string().optional().nullable(), // date string e.g., '1990-01-01'
  address: z.string().min(5, 'Address must be at least 5 characters'),
  occupation: z.string().optional().nullable(),
  monthlyIncome: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Monthly income must be a valid number',
  }),
  notes: z.string().optional().nullable(),
  
  // Nested lists for origination wizard validation
  identityDocuments: z.array(customerIdentityDocumentSchema),
  bankDetails: z.array(customerBankDetailsSchema),
  guarantors: z.array(guarantorSchema),
});

export type CustomerFormInput = z.infer<typeof customerSchema>;
export type CustomerIdentityDocumentInput = z.infer<typeof customerIdentityDocumentSchema>;
export type GuarantorInput = z.infer<typeof guarantorSchema>;
export type CustomerBankDetailsInput = z.infer<typeof customerBankDetailsSchema>;
