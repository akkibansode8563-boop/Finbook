'use server';

import { requireStaff, requireManager } from '@/lib/auth/rbac';
import { paymentSchema, settlementSchema, type PaymentFormInput, type SettlementFormInput } from './schema';
import { createPayment, createSettlement } from './repository';
import { allocatePayment } from './allocation/allocator';
import { db } from '@/lib/db/client';
import { loanSchedule, ledgerEntries } from '../../../drizzle/schema';
import { eq, and, ne, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function recordPaymentAction(formData: PaymentFormInput) {
  const { profile } = await requireStaff();

  const result = paymentSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const {
    loanId,
    customerId,
    amount,
    paymentDate,
    paymentMode,
    allocationMethod,
    isBackdated,
    referenceNote,
    manualPrincipal,
    manualInterest,
    manualLateFee,
  } = result.data;

  try {
    // 1. Fetch outstanding installments of the loan
    const unpaidSchedules = await db.select()
      .from(loanSchedule)
      .where(
        and(
          eq(loanSchedule.loanId, loanId),
          ne(loanSchedule.status, 'paid')
        )
      )
      .orderBy(loanSchedule.installmentNo);

    // 2. Perform chronological allocation
    const paymentVal = parseFloat(amount);

    const manualSplit = allocationMethod === 'manual' ? {
      principal: parseFloat(manualPrincipal || '0'),
      interest: parseFloat(manualInterest || '0'),
      lateFee: parseFloat(manualLateFee || '0'),
    } : undefined;

    const allocation = allocatePayment(
      paymentVal,
      allocationMethod,
      unpaidSchedules,
      manualSplit
    );

    // 3. Write to Database
    const payment = await createPayment(
      {
        loanId,
        customerId,
        amount,
        paymentMode,
        allocationMethod,
        principalComponent: String(allocation.totals.principalPaid),
        interestComponent: String(allocation.totals.interestPaid),
        lateFeeComponent: String(allocation.totals.lateFeePaid),
        discountComponent: '0.00',
        isBackdated,
        referenceNote,
        reversed: false,
        reversedReason: null,
        paymentDate,
        enteredBy: profile.id,
      },
      allocation.splits
    );

    revalidatePath('/payments');
    revalidatePath('/loans');
    revalidatePath(`/loans/${loanId}`);
    revalidatePath(`/customers/${customerId}`);

    return { success: true, paymentId: payment.id };
  } catch (error: any) {
    console.error('Failed to record payment:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function createSettlementAction(formData: SettlementFormInput) {
  const { profile } = await requireManager();

  const result = settlementSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { loanId, settlementDate, settlementAmount, waivedAmount } = result.data;

  try {
    // Get last ledger running balance to verify outstanding
    const [lastLedgerRaw] = await db.select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.loanId, loanId))
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(1);

    const outstandingBefore = lastLedgerRaw ? parseFloat(lastLedgerRaw.runningBalance) : 0;

    await createSettlement({
      loanId,
      settlementDate,
      outstandingBefore: String(outstandingBefore),
      settlementAmount,
      waivedAmount,
      reason: result.data.reason,
      approvedBy: profile.id,
    });

    revalidatePath('/loans');
    revalidatePath(`/loans/${loanId}`);
    revalidatePath(`/customers/${profile.id}`);

    return { success: true };
  } catch (error: any) {
    console.error('Failed to settle loan:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function getUnpaidInstallmentsAction(loanId: string) {
  await requireStaff();
  try {
    const schedules = await db.select()
      .from(loanSchedule)
      .where(and(eq(loanSchedule.loanId, loanId), ne(loanSchedule.status, 'paid')))
      .orderBy(loanSchedule.installmentNo);
    return { success: true, schedules };
  } catch (error: any) {
    return { error: error.message };
  }
}
