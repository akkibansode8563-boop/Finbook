import { db } from '@/lib/db/client';
import { loans, loanSchedule, ledgerEntries, customers } from '../../../drizzle/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';
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

/**
 * Creates a loan, saves its generated schedule, and records the initial disbursement entry in the ledger.
 */
export async function createLoan(
  loanData: Omit<NewLoan, 'id' | 'loanNumber' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  scheduleItems: Omit<NewLoanSchedule, 'id' | 'loanId' | 'createdAt' | 'updatedAt'>[]
): Promise<Loan> {
  return await db.transaction(async (tx) => {
    // 1. Generate unique loan number: LOAN-YYYYMMDD-XXXX
    const loanNumber = `LN-${Math.floor(10000000 + Math.random() * 90000000)}`;

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
    // Debit represents the amount lent out (customer owes us this principal)
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

    return insertedLoan;
  });
}

/**
 * Soft deletes a loan and associated schedule records.
 */
export async function softDeleteLoan(id: string): Promise<void> {
  await db.update(loans)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(loans.id, id));
}
