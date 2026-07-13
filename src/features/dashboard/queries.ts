import { db } from '@/lib/db/client';
import { loans, payments, loanSchedule, customers } from '../../../drizzle/schema';
import { eq, and, isNull, desc, not, sql } from 'drizzle-orm';

/**
 * Compiles high-level KPIs and trends for the dashboard.
 */
export async function getDashboardStats() {
  // 1. Counts of Active and Overdue loans
  const activeLoans = await db.select({
    id: loans.id,
    principalAmount: loans.principalAmount,
    status: loans.status,
  })
  .from(loans)
  .where(and(not(eq(loans.status, 'closed')), not(eq(loans.status, 'settled'))));

  const activeLoansCount = activeLoans.length;
  const overdueLoansCount = activeLoans.filter((l) => l.status === 'overdue').length;

  // 2. Total Disbursed
  const [disbursedRes] = await db.select({
    total: sql<string>`coalesce(sum(cast(${loans.principalAmount} as numeric)), 0)`
  })
  .from(loans);
  const totalDisbursed = parseFloat(disbursedRes?.total || '0');

  // 3. Total Collected
  const [collectedRes] = await db.select({
    total: sql<string>`coalesce(sum(cast(${payments.amount} as numeric)), 0)`
  })
  .from(payments)
  .where(isNull(payments.deletedAt));
  const totalCollected = parseFloat(collectedRes?.total || '0');

  // 4. Total Outstanding (remaining due across unpaid installments)
  const [outstandingRes] = await db.select({
    principalRemaining: sql<string>`coalesce(sum(cast(${loanSchedule.principalDue} as numeric) - cast(${loanSchedule.principalPaid} as numeric)), 0)`,
    interestRemaining: sql<string>`coalesce(sum(cast(${loanSchedule.interestDue} as numeric) - cast(${loanSchedule.interestPaid} as numeric)), 0)`,
    lateFeeRemaining: sql<string>`coalesce(sum(cast(${loanSchedule.lateFeeDue} as numeric)), 0)`,
  })
  .from(loanSchedule)
  .where(not(eq(loanSchedule.status, 'paid')));

  const outstandingPrincipal = parseFloat(outstandingRes?.principalRemaining || '0');
  const outstandingInterest = parseFloat(outstandingRes?.interestRemaining || '0');
  const outstandingLateFee = parseFloat(outstandingRes?.lateFeeRemaining || '0');
  const totalOutstanding = outstandingPrincipal + outstandingInterest + outstandingLateFee;

  // 5. Portfolio Distribution by Status
  const portfolioDistribution = [
    { name: 'Active', value: activeLoans.filter((l) => l.status === 'active').length, color: '#8b5cf6' },
    { name: 'Overdue', value: overdueLoansCount, color: '#f43f5e' },
    { name: 'Closed', value: 0, color: '#10b981' }, // we will count them below
    { name: 'Settled', value: 0, color: '#3b82f6' },
  ];

  // Resolve closed/settled counts
  const allLoans = await db.select({ status: loans.status }).from(loans);
  portfolioDistribution[2].value = allLoans.filter((l) => l.status === 'closed').length;
  portfolioDistribution[3].value = allLoans.filter((l) => l.status === 'settled').length;

  // 6. Monthly Collections vs Disbursements (Last 6 Months)
  // Let's build a timeline of the last 6 months in format YYYY-MM
  const trendData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString('default', { month: 'short' });
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    trendData.push({
      key: yearMonth,
      month: `${monthLabel} ${d.getFullYear()}`,
      disbursed: 0,
      collected: 0,
    });
  }

  // Fetch all loans in last 6 months and compile
  const loansList = await db.select({
    principalAmount: loans.principalAmount,
    disbursementDate: loans.disbursementDate,
  }).from(loans);

  for (const l of loansList) {
    if (!l.disbursementDate) continue;
    const key = l.disbursementDate.substring(0, 7); // YYYY-MM
    const match = trendData.find((t) => t.key === key);
    if (match) {
      match.disbursed += parseFloat(l.principalAmount);
    }
  }

  // Fetch all payments in last 6 months and compile
  const paymentsList = await db.select({
    amount: payments.amount,
    paymentDate: payments.paymentDate,
  }).from(payments).where(isNull(payments.deletedAt));

  for (const p of paymentsList) {
    if (!p.paymentDate) continue;
    const key = p.paymentDate.substring(0, 7); // YYYY-MM
    const match = trendData.find((t) => t.key === key);
    if (match) {
      match.collected += parseFloat(p.amount);
    }
  }

  // 7. Recent Transactions (last 5 payments)
  const recentPayments = await db.query.payments.findMany({
    where: isNull(payments.deletedAt),
    with: {
      customer: true,
      loan: true,
    },
    orderBy: desc(payments.paymentDate),
    limit: 5,
  });

  // Recent Customer Registrations (last 5 customers)
  const recentCustomers = await db.query.customers.findMany({
    orderBy: desc(customers.createdAt),
    limit: 5,
  });

  return {
    kpis: {
      activeLoansCount,
      overdueLoansCount,
      totalDisbursed,
      totalCollected,
      totalOutstanding,
    },
    portfolioDistribution,
    trendData,
    recentPayments,
    recentCustomers,
  };
}
