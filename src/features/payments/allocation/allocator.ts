export interface InstallmentForAllocation {
  id: string;
  installmentNo: number;
  principalDue: string;
  interestDue: string;
  principalPaid: string;
  interestPaid: string;
  lateFeeDue: string;
}

export interface AllocationResult {
  splits: {
    installmentId: string;
    installmentNo: number;
    principalAllocated: number;
    interestAllocated: number;
    lateFeeAllocated: number;
  }[];
  totals: {
    principalPaid: number;
    interestPaid: number;
    lateFeePaid: number;
  };
  remainingPayment: number;
}

/**
 * Allocates a payment amount chronologically across a set of installments.
 * Supports 'interest_first' and 'principal_first' priorities.
 */
export function allocatePayment(
  paymentAmount: number,
  method: 'interest_first' | 'principal_first' | 'manual',
  installments: InstallmentForAllocation[],
  manualSplit?: { principal: number; interest: number; lateFee: number }
): AllocationResult {
  let remaining = paymentAmount;
  
  const result: AllocationResult = {
    splits: [],
    totals: {
      principalPaid: 0,
      interestPaid: 0,
      lateFeePaid: 0,
    },
    remainingPayment: 0,
  };

  // If manual split is selected, we just allocate exactly what was specified to the chronological outstanding components
  if (method === 'manual' && manualSplit) {
    let pRem = manualSplit.principal;
    let iRem = manualSplit.interest;
    let fRem = manualSplit.lateFee;

    for (const inst of installments) {
      const pOutstanding = Math.max(0, parseFloat(inst.principalDue) - parseFloat(inst.principalPaid));
      const iOutstanding = Math.max(0, parseFloat(inst.interestDue) - parseFloat(inst.interestPaid));
      const fOutstanding = Math.max(0, parseFloat(inst.lateFeeDue));

      const fAlloc = Math.min(fRem, fOutstanding);
      fRem -= fAlloc;

      const iAlloc = Math.min(iRem, iOutstanding);
      iRem -= iAlloc;

      const pAlloc = Math.min(pRem, pOutstanding);
      pRem -= pAlloc;

      if (fAlloc > 0 || iAlloc > 0 || pAlloc > 0) {
        result.splits.push({
          installmentId: inst.id,
          installmentNo: inst.installmentNo,
          principalAllocated: parseFloat(pAlloc.toFixed(2)),
          interestAllocated: parseFloat(iAlloc.toFixed(2)),
          lateFeeAllocated: parseFloat(fAlloc.toFixed(2)),
        });

        result.totals.principalPaid += pAlloc;
        result.totals.interestPaid += iAlloc;
        result.totals.lateFeePaid += fAlloc;
      }
    }

    result.remainingPayment = pRem + iRem + fRem;
    result.totals.principalPaid = parseFloat(result.totals.principalPaid.toFixed(2));
    result.totals.interestPaid = parseFloat(result.totals.interestPaid.toFixed(2));
    result.totals.lateFeePaid = parseFloat(result.totals.lateFeePaid.toFixed(2));
    result.remainingPayment = parseFloat(result.remainingPayment.toFixed(2));

    return result;
  }

  // Chronological Auto-Allocation
  // Sort installments in ascending order to pay the oldest first
  const sorted = [...installments].sort((a, b) => a.installmentNo - b.installmentNo);

  for (const inst of sorted) {
    if (remaining <= 0) break;

    const pOutstanding = Math.max(0, parseFloat(inst.principalDue) - parseFloat(inst.principalPaid));
    const iOutstanding = Math.max(0, parseFloat(inst.interestDue) - parseFloat(inst.interestPaid));
    const fOutstanding = Math.max(0, parseFloat(inst.lateFeeDue));

    let fAlloc = 0;
    let iAlloc = 0;
    let pAlloc = 0;

    // 1. Always satisfy late fees first in auto mode
    if (fOutstanding > 0 && remaining > 0) {
      fAlloc = Math.min(remaining, fOutstanding);
      remaining -= fAlloc;
    }

    // 2. Allocate according to priority method
    if (method === 'interest_first') {
      // Interest then Principal
      if (iOutstanding > 0 && remaining > 0) {
        iAlloc = Math.min(remaining, iOutstanding);
        remaining -= iAlloc;
      }
      if (pOutstanding > 0 && remaining > 0) {
        pAlloc = Math.min(remaining, pOutstanding);
        remaining -= pAlloc;
      }
    } else {
      // Principal then Interest (principal_first)
      if (pOutstanding > 0 && remaining > 0) {
        pAlloc = Math.min(remaining, pOutstanding);
        remaining -= pAlloc;
      }
      if (iOutstanding > 0 && remaining > 0) {
        iAlloc = Math.min(remaining, iOutstanding);
        remaining -= iAlloc;
      }
    }

    if (fAlloc > 0 || iAlloc > 0 || pAlloc > 0) {
      result.splits.push({
        installmentId: inst.id,
        installmentNo: inst.installmentNo,
        principalAllocated: parseFloat(pAlloc.toFixed(2)),
        interestAllocated: parseFloat(iAlloc.toFixed(2)),
        lateFeeAllocated: parseFloat(fAlloc.toFixed(2)),
      });

      result.totals.principalPaid += pAlloc;
      result.totals.interestPaid += iAlloc;
      result.totals.lateFeePaid += fAlloc;
    }
  }

  // Format decimal values to prevent floating point inaccuracies
  result.totals.principalPaid = parseFloat(result.totals.principalPaid.toFixed(2));
  result.totals.interestPaid = parseFloat(result.totals.interestPaid.toFixed(2));
  result.totals.lateFeePaid = parseFloat(result.totals.lateFeePaid.toFixed(2));
  result.remainingPayment = parseFloat(remaining.toFixed(2));

  return result;
}
