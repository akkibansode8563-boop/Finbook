import { db } from '@/lib/db/client';
import {
  payments,
  loanSchedule,
  ledgerEntries,
  loans,
  settlements,
  customers
} from '../../../drizzle/schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import type { NewLoan } from '../loans/types';
import { logAuditEvent } from '../audit/logger';

export type NewPayment = typeof payments.$inferInsert;
export type NewSettlement = typeof settlements.$inferInsert;

/**
 * Fetches all payment logs in descending chronological order.
 */
export async function getAllPayments(): Promise<any[]> {
  return await db.query.payments.findMany({
    where: isNull(payments.deletedAt),
    with: {
      customer: true,
      loan: true,
    },
    orderBy: desc(payments.paymentDate),
  });
}

/**
 * Atomic transaction to record payment split details, satisfy installment items,
 * and post credit entries to the ledger.
 */
export async function createPayment(
  paymentData: Omit<NewPayment, 'id' | 'receiptNumber' | 'createdAt'>,
  splits: {
    installmentId: string;
    principalAllocated: number;
    interestAllocated: number;
    lateFeeAllocated: number;
  }[]
): Promise<any> {
  return await db.transaction(async (tx) => {
    // 1. Generate receipt number: PAY-YYYY-XXXXXX using postgres sequence
    const result = await tx.execute<{ nextval: string }>(sql`SELECT nextval('receipt_number_seq')`);
    const nextVal = result[0]?.nextval || Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const receiptNumber = `PAY-${year}-${String(nextVal).padStart(6, '0')}`;

    // 2. Insert Payment Receipt
    const [insertedPayment] = await tx.insert(payments).values({
      ...paymentData,
      receiptNumber,
    }).returning();

    const paymentId = insertedPayment.id;

    // 3. Update Installments Payments Schedule
    for (const split of splits) {
      const [inst] = await tx.select()
        .from(loanSchedule)
        .where(eq(loanSchedule.id, split.installmentId));

      const newPrincipalPaid = (parseFloat(inst.principalPaid) + split.principalAllocated).toFixed(2);
      const newInterestPaid = (parseFloat(inst.interestPaid) + split.interestAllocated).toFixed(2);
      const newLateFeeDue = Math.max(0, parseFloat(inst.lateFeeDue) - split.lateFeeAllocated).toFixed(2);

      const isPaid = 
        parseFloat(newPrincipalPaid) >= parseFloat(inst.principalDue) &&
        parseFloat(newInterestPaid) >= parseFloat(inst.interestDue) &&
        parseFloat(newLateFeeDue) === 0;

      const newStatus = isPaid ? 'paid' : 'partial';

      await tx.update(loanSchedule)
        .set({
          principalPaid: newPrincipalPaid,
          interestPaid: newInterestPaid,
          lateFeeDue: newLateFeeDue,
          status: newStatus as any,
          updatedAt: new Date(),
        })
        .where(eq(loanSchedule.id, split.installmentId));
    }

    // 4. Post Ledger Credit transaction
    const [lastLedger] = await tx.select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.loanId, insertedPayment.loanId))
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(1);

    const prevBalance = lastLedger ? parseFloat(lastLedger.runningBalance) : 0;
    const newBalance = (prevBalance - parseFloat(insertedPayment.amount)).toFixed(2);

    await tx.insert(ledgerEntries).values({
      loanId: insertedPayment.loanId,
      customerId: insertedPayment.customerId,
      txnType: 'payment',
      referenceTable: 'payments',
      referenceId: paymentId,
      debit: '0.00',
      credit: String(insertedPayment.amount),
      runningBalance: newBalance,
      description: `Payment receipt ${receiptNumber} collected.`,
      entryDate: insertedPayment.paymentDate,
      createdBy: insertedPayment.enteredBy,
    });

    // 5. Close Loan if all installments are fully satisfied
    const schedules = await tx.select()
      .from(loanSchedule)
      .where(eq(loanSchedule.loanId, insertedPayment.loanId));

    const allPaid = schedules.every(
      (s) => 
        parseFloat(s.principalPaid) >= parseFloat(s.principalDue) &&
        parseFloat(s.interestPaid) >= parseFloat(s.interestDue) &&
        parseFloat(s.lateFeeDue) === 0
    );

    if (allPaid) {
      await tx.update(loans)
        .set({ status: 'closed', closedAt: new Date(), updatedAt: new Date() })
        .where(eq(loans.id, insertedPayment.loanId));
    }

    // Log the event to audit log
    await logAuditEvent({
      action: 'create',
      entityType: 'payments',
      entityId: paymentId,
      newValue: insertedPayment,
      tx,
    });

    return insertedPayment;
  });
}

/**
 * Reverses a payment: marks as reversed, reverses ledger entry, restores installment paid balances,
 * and reopens the loan if closed.
 */
export async function reversePayment(
  paymentId: string,
  reversedReason: string,
  userId: string
): Promise<any> {
  return await db.transaction(async (tx) => {
    // 1. Fetch payment
    const [payment] = await tx.select()
      .from(payments)
      .where(eq(payments.id, paymentId));

    if (!payment) throw new Error('Payment not found');
    if (payment.reversed) throw new Error('Payment is already reversed');

    // 2. Mark payment as reversed
    const [updatedPayment] = await tx.update(payments)
      .set({
        reversed: true,
        reversedReason,
      })
      .where(eq(payments.id, paymentId))
      .returning();

    // 3. Adjust installments (subtract principal and interest components)
    let remPrincipal = parseFloat(payment.principalComponent);
    let remInterest = parseFloat(payment.interestComponent);

    // Fetch schedules in descending order of installment no (last paid first)
    const schedules = await tx.select()
      .from(loanSchedule)
      .where(eq(loanSchedule.loanId, payment.loanId))
      .orderBy(desc(loanSchedule.installmentNo));

    for (const s of schedules) {
      let principalDeduct = 0;
      let interestDeduct = 0;

      if (remPrincipal > 0 && parseFloat(s.principalPaid) > 0) {
        principalDeduct = Math.min(remPrincipal, parseFloat(s.principalPaid));
        remPrincipal -= principalDeduct;
      }

      if (remInterest > 0 && parseFloat(s.interestPaid) > 0) {
        interestDeduct = Math.min(remInterest, parseFloat(s.interestPaid));
        remInterest -= interestDeduct;
      }

      if (principalDeduct > 0 || interestDeduct > 0) {
        const newPrincipalPaid = (parseFloat(s.principalPaid) - principalDeduct).toFixed(2);
        const newInterestPaid = (parseFloat(s.interestPaid) - interestDeduct).toFixed(2);
        
        // Determine status
        let newStatus: 'pending' | 'partial' | 'paid' = 'pending';
        if (parseFloat(newPrincipalPaid) > 0 || parseFloat(newInterestPaid) > 0) {
          newStatus = 'partial';
        }

        await tx.update(loanSchedule)
          .set({
            principalPaid: newPrincipalPaid,
            interestPaid: newInterestPaid,
            status: newStatus,
            updatedAt: new Date(),
          })
          .where(eq(loanSchedule.id, s.id));
      }
    }

    // 4. Post reversal entry to general ledger (Debit to increase customer balance again)
    const [lastLedger] = await tx.select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.loanId, payment.loanId))
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(1);

    const prevBalance = lastLedger ? parseFloat(lastLedger.runningBalance) : 0;
    const newBalance = (prevBalance + parseFloat(payment.amount)).toFixed(2);

    const [reversalLedger] = await tx.insert(ledgerEntries).values({
      loanId: payment.loanId,
      customerId: payment.customerId,
      txnType: 'reversal',
      referenceTable: 'payments',
      referenceId: paymentId,
      debit: String(payment.amount),
      credit: '0.00',
      runningBalance: newBalance,
      description: `Reversal of payment receipt ${payment.receiptNumber}. Reason: ${reversedReason}`,
      entryDate: new Date().toISOString().split('T')[0],
      createdBy: userId,
    }).returning();

    // 5. Reopen Loan if closed
    const [loan] = await tx.select().from(loans).where(eq(loans.id, payment.loanId));
    if (loan.status === 'closed' || loan.status === 'settled') {
      await tx.update(loans)
        .set({ status: 'active', closedAt: null, updatedAt: new Date() })
        .where(eq(loans.id, payment.loanId));
    }

    // Log the event to audit log
    await logAuditEvent({
      action: 'update',
      entityType: 'payments',
      entityId: paymentId,
      oldValue: payment,
      newValue: updatedPayment,
      tx,
    });

    return updatedPayment;
  });
}

/**
 * Executes a one-time loan settlement override: waives all outstanding due values,
 * updates schedules, sets running balance to zero, and marks loan as settled.
 */
export async function createSettlement(
  settlementData: Omit<NewSettlement, 'id' | 'createdAt'>
): Promise<any> {
  return await db.transaction(async (tx) => {
    // 1. Insert Settlement record
    const [insertedSettlement] = await tx.insert(settlements).values(settlementData).returning();

    const loanId = insertedSettlement.loanId;

    // 2. Fetch loan to resolve customerId
    const [loan] = await tx.select().from(loans).where(eq(loans.id, loanId));

    // 3. Mark all schedules as paid/waived
    const schedules = await tx.select().from(loanSchedule).where(eq(loanSchedule.loanId, loanId));
    
    for (const s of schedules) {
      await tx.update(loanSchedule)
        .set({
          principalPaid: s.principalDue,
          interestPaid: s.interestDue,
          lateFeeDue: '0.00',
          status: 'waived',
          updatedAt: new Date(),
        })
        .where(eq(loanSchedule.id, s.id));
    }

    // 4. Post Credit entry to general ledger representing settlement write-off
    await tx.insert(ledgerEntries).values({
      loanId,
      customerId: loan.customerId,
      txnType: 'settlement',
      referenceTable: 'settlements',
      referenceId: insertedSettlement.id,
      debit: '0.00',
      credit: String(insertedSettlement.outstandingBefore), // Offset entire outstanding
      runningBalance: '0.00', // Set remaining balance to absolute zero
      description: `Account settled. Waived amount: ${insertedSettlement.waivedAmount}. Reason: ${insertedSettlement.reason}`,
      entryDate: insertedSettlement.settlementDate,
      createdBy: insertedSettlement.approvedBy,
    });

    // 5. Update loan status to settled
    await tx.update(loans)
      .set({
        status: 'settled',
        closedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(loans.id, loanId));

    // Log the event to audit log
    await logAuditEvent({
      action: 'create',
      entityType: 'settlements',
      entityId: insertedSettlement.id,
      newValue: insertedSettlement,
      tx,
    });

    return insertedSettlement;
  });
}
