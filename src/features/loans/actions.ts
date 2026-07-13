'use server';

import { requireStaff } from '@/lib/auth/rbac';
import { loanSchema, type LoanFormInput } from './schema';
import { createLoan, softDeleteLoan } from './repository';
import { generateRepaymentSchedule } from '../interest-engine/schedule-generator';
import { revalidatePath } from 'next/cache';

export async function createLoanAction(formData: LoanFormInput) {
  const { profile } = await requireStaff();

  const result = loanSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const {
    customerId,
    principalAmount,
    interestType,
    interestRate,
    interestPeriod,
    loanFrequency,
    paymentType,
    allocationMethod,
    disbursementDate,
    startDate,
    tenureValue,
    tenureUnit,
    lateFeeType,
    lateFeeValue,
    gracePeriodDays,
    notes,
  } = result.data;

  const principal = parseFloat(principalAmount);
  const rate = parseFloat(interestRate);
  
  // 1. Generate installment schedule
  const scheduleItems = generateRepaymentSchedule({
    principalAmount: principal,
    interestType,
    interestRate: rate,
    loanFrequency,
    tenureValue,
    tenureUnit,
    startDate,
  });

  if (scheduleItems.length === 0) {
    return { error: 'Failed to generate schedule. Check tenure and frequency values.' };
  }

  // Calculate end date based on final installment due date
  const endDate = scheduleItems[scheduleItems.length - 1].dueDate;

  // 2. Perform transactional database insertion
  try {
    const newLoan = await createLoan(
      {
        customerId,
        principalAmount: principalAmount,
        interestType,
        interestRate: interestRate,
        interestPeriod,
        loanFrequency,
        paymentType,
        allocationMethod,
        disbursementDate,
        startDate,
        tenureValue,
        tenureUnit,
        endDate,
        lateFeeType,
        lateFeeValue,
        gracePeriodDays,
        status: 'active',
        notes,
        createdBy: profile.id,
      },
      scheduleItems
    );

    revalidatePath('/loans');
    revalidatePath(`/customers/${customerId}`);
    return { success: true, loanId: newLoan.id };
  } catch (error: any) {
    console.error('Failed to originate loan:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteLoanAction(loanId: string) {
  await requireStaff();

  try {
    await softDeleteLoan(loanId);
    revalidatePath('/loans');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete loan:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
