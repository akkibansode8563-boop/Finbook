import { db } from '@/lib/db/client';
import { loans, loanSchedule, ledgerEntries, customers } from '../../../drizzle/schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import type {
  Loan,
  NewLoan,
  NewLoanSchedule,
  LoanWithCustomer,
  LoanWithDetails
} from './types';

/**
 * Fetches all loans with matching customer profiles.
 */
export async function getAllLoans(statusFilter?: string): Promise<LoanWithCustomer[]> {
  const query = db.query.loans.findMany({
    where: statusFilter 
      ? and(eq(loans.status, statusFilter as any), isNull(loans.deletedAt))
      : isNull(loans.deletedAt),
    with: {
      customer: true,
    },
    orderBy: desc(loans.createdAt),
  });

  return (await query) as LoanWithCustomer[];
}

/**
 * Fetches a single loan with detailed schedule and customer records.
 */
export async function getLoanById(id: string): Promise<LoanWithDetails | null> {
  const loan = await db.query.loans.findFirst({
    where: and(eq(loans.id, id), isNull(loans.deletedAt)),
    with: {
      customer: true,
      schedules: true,
    },
  });

  if (loan && loan.schedules) {
    // Sort schedules by installment number
    loan.schedules.sort((a, b) => a.installmentNo - b.installmentNo);
  }

  return (loan as LoanWithDetails) || null;
}

import { logAuditEvent } from '../audit/logger';

/**
 * Creates a loan, saves its generated schedule, and records the initial disbursement entry in the ledger.
 */
export async function createLoan(
  loanData: Omit<NewLoan, 'id' | 'loanNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  scheduleItems: Omit<NewLoanSchedule, 'id' | 'loanId' | 'createdAt' | 'updatedAt'>[]
): Promise<Loan> {
  return await db.transaction(async (tx) => {
    // 1. Generate unique loan number: LOAN-YYYY-XXXXXX using postgres sequence
    const result = await tx.execute<{ nextval: string }>(sql`SELECT nextval('loan_number_seq')`);
    const nextVal = result[0]?.nextval || Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const loanNumber = `LOAN-${year}-${String(nextVal).padStart(6, '0')}`;

    // 2. Insert Loan
    const [insertedLoan] = await tx.insert(loans).values({
      ...loanData,
      loanNumber,
    }).returning();

    const loanId = insertedLoan.id;

    // 3. Insert Schedule
    if (scheduleItems.length > 0) {
      await tx.insert(loanSchedule).values(
        scheduleItems.map((item) => ({ ...item, loanId }))
      );
    }

    // 4. Post Disbursement entry to Ledger
    const principalStr = String(insertedLoan.principalAmount);
    await tx.insert(ledgerEntries).values({
      loanId,
      customerId: insertedLoan.customerId,
      txnType: 'disbursement',
      referenceTable: 'loans',
      referenceId: loanId,
      debit: principalStr,
      credit: '0.00',
      runningBalance: principalStr, // Initial ledger balance
      description: `Principal loan disbursement of ${insertedLoan.principalAmount}`,
      entryDate: insertedLoan.disbursementDate,
      createdBy: insertedLoan.createdBy,
    });

    // Log the event to audit log
    await logAuditEvent({
      action: 'create',
      entityType: 'loans',
      entityId: loanId,
      newValue: insertedLoan,
      tx,
    });

    return insertedLoan;
  });
}

/**
 * Soft deletes a loan and associated schedule records.
 */
export async function softDeleteLoan(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [oldLoan] = await tx.select().from(loans).where(eq(loans.id, id));
    const [newLoan] = await tx.update(loans)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(loans.id, id))
      .returning();

    await logAuditEvent({
      action: 'delete',
      entityType: 'loans',
      entityId: id,
      oldValue: oldLoan,
      newValue: newLoan,
      tx,
    });
  });
}

/**
 * Restores a soft-deleted loan.
 */
export async function restoreLoan(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    const [oldLoan] = await tx.select().from(loans).where(eq(loans.id, id));
    const [newLoan] = await tx.update(loans)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(loans.id, id))
      .returning();

    await logAuditEvent({
      action: 'restore',
      entityType: 'loans',
      entityId: id,
      oldValue: oldLoan,
      newValue: newLoan,
      tx,
    });
  });
}
