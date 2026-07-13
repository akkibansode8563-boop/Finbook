import type { NewLoanSchedule } from '../loans/types';

interface GenerateScheduleInput {
  principalAmount: number;
  interestType: 'flat' | 'reducing';
  interestRate: number; // Annual Rate percentage, e.g. 12 for 12%
  loanFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  tenureValue: number;
  tenureUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: string; // 'YYYY-MM-DD'
}

/**
 * Computes repayment schedule installments.
 */
export function generateRepaymentSchedule({
  principalAmount,
  interestType,
  interestRate,
  loanFrequency,
  tenureValue,
  tenureUnit,
  startDate,
}: GenerateScheduleInput): Omit<NewLoanSchedule, 'id' | 'loanId' | 'createdAt' | 'updatedAt'>[] {
  const schedule: Omit<NewLoanSchedule, 'id' | 'loanId' | 'createdAt' | 'updatedAt'>[] = [];
  
  // Calculate total installments count
  let installmentsCount = tenureValue;
  if (tenureUnit === 'years') {
    if (loanFrequency === 'monthly') installmentsCount = tenureValue * 12;
    else if (loanFrequency === 'weekly') installmentsCount = tenureValue * 52;
    else if (loanFrequency === 'daily') installmentsCount = tenureValue * 365;
  } else if (tenureUnit === 'months') {
    if (loanFrequency === 'weekly') installmentsCount = tenureValue * 4;
    else if (loanFrequency === 'daily') installmentsCount = tenureValue * 30;
  }

  if (installmentsCount <= 0) {
    installmentsCount = 1;
  }

  const annualRate = interestRate / 100;
  let currentDate = new Date(startDate);

  // Helper to increment date by frequency
  const incrementDate = (date: Date) => {
    const nextDate = new Date(date);
    if (loanFrequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (loanFrequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (loanFrequency === 'daily') {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (loanFrequency === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else {
      // Default fallback or custom (1 month)
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  };

  if (interestType === 'flat') {
    const totalInterest = principalAmount * annualRate;
    const interestPerInstallment = totalInterest / installmentsCount;
    const principalPerInstallment = principalAmount / installmentsCount;

    for (let i = 1; i <= installmentsCount; i++) {
      currentDate = incrementDate(currentDate);
      const dueDateStr = currentDate.toISOString().split('T')[0];

      schedule.push({
        installmentNo: i,
        dueDate: dueDateStr,
        principalDue: principalPerInstallment.toFixed(2),
        interestDue: interestPerInstallment.toFixed(2),
        totalDue: (principalPerInstallment + interestPerInstallment).toFixed(2),
        principalPaid: '0.00',
        interestPaid: '0.00',
        lateFeeDue: '0.00',
        status: 'pending',
      });
    }
  } else {
    // Reducing Balance mode
    // Periodic Interest Rate
    let periodsPerYear = 12;
    if (loanFrequency === 'weekly') periodsPerYear = 52;
    if (loanFrequency === 'daily') periodsPerYear = 365;
    if (loanFrequency === 'yearly') periodsPerYear = 1;

    const r = annualRate / periodsPerYear;
    const n = installmentsCount;

    // Calculate Equated Monthly/Periodic Installment (EMI)
    let emi = principalAmount / n;
    if (r > 0) {
      emi = (principalAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    let remainingPrincipal = principalAmount;

    for (let i = 1; i <= installmentsCount; i++) {
      currentDate = incrementDate(currentDate);
      const dueDateStr = currentDate.toISOString().split('T')[0];

      const interestDue = remainingPrincipal * r;
      let principalDue = emi - interestDue;

      if (i === installmentsCount || remainingPrincipal < principalDue) {
        principalDue = remainingPrincipal;
      }

      remainingPrincipal -= principalDue;

      schedule.push({
        installmentNo: i,
        dueDate: dueDateStr,
        principalDue: principalDue.toFixed(2),
        interestDue: interestDue.toFixed(2),
        totalDue: (principalDue + interestDue).toFixed(2),
        principalPaid: '0.00',
        interestPaid: '0.00',
        lateFeeDue: '0.00',
        status: 'pending',
      });
    }
  }

  return schedule;
}
export type GenerateScheduleFunction = typeof generateRepaymentSchedule;
