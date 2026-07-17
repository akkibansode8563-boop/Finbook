'use server';

import { db } from '@/lib/db/client';
import { systemApprovals } from '../../../drizzle/schema';
import { requireAdmin, requireRole } from '@/lib/auth/rbac';
import { eq, and, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAuditEvent } from '../audit/logger';
import { reversePayment } from '../payments/repository';
import { restoreCustomer } from '../customers/repository';
import { restoreLoan } from '../loans/repository';

/**
 * Creates a pending approval request for a sensitive operation.
 */
export async function createApprovalRequestAction(data: {
  actionType: 'payment_reversal' | 'loan_write_off' | 'large_cash_adjustment' | 'settlement_modification';
  entityType: 'payments' | 'loans' | 'settlements';
  entityId: string;
  requestNotes: string;
  requestData?: any;
}) {
  const { profile } = await requireRole('staff'); // Staff, manager, or admin can request

  try {
    const [request] = await db.insert(systemApprovals).values({
      requestedBy: profile.id,
      actionType: data.actionType,
      entityType: data.entityType,
      entityId: data.entityId,
      requestNotes: data.requestNotes,
      requestData: data.requestData || null,
      status: 'pending',
    }).returning();

    await logAuditEvent({
      action: 'create',
      entityType: 'system_approvals',
      entityId: request.id,
      newValue: request,
    });

    revalidatePath('/approvals');
    return { success: true, request };
  } catch (error: any) {
    console.error('Failed to create approval request:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Retrieves all pending or historical approval requests.
 */
export async function getApprovalRequestsAction(statusFilter?: 'pending' | 'approved' | 'rejected') {
  await requireRole('viewer'); // Viewers can view

  try {
    const query = db.query.systemApprovals.findMany({
      where: statusFilter ? eq(systemApprovals.status, statusFilter) : undefined,
      with: {
        requestedByUser: true,
        approvedByUser: true,
      },
      orderBy: desc(systemApprovals.createdAt),
    });

    return { success: true, requests: await query };
  } catch (error: any) {
    console.error('Failed to fetch approval requests:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Approves a request and executes the associated sensitive business operation.
 */
export async function approveRequestAction(approvalId: string) {
  const { profile } = await requireAdmin(); // RESTRICTED TO ADMINS ONLY

  try {
    return await db.transaction(async (tx) => {
      const [request] = await tx.select()
        .from(systemApprovals)
        .where(and(eq(systemApprovals.id, approvalId), eq(systemApprovals.status, 'pending')));

      if (!request) {
        throw new Error('Pending approval request not found');
      }

      // Execute the business operation transactionally based on actionType
      if (request.actionType === 'payment_reversal') {
        // Run payment reversal
        await reversePayment(request.entityId, request.requestNotes, profile.id);
      } else if (request.actionType === 'loan_write_off') {
        // Loan write-off logic (marks loan as written off)
        // We'll update the loans table directly or use repository
        const { loans } = await import('../../../drizzle/schema');
        await tx.update(loans)
          .set({ status: 'written_off', closedAt: new Date(), updatedAt: new Date() })
          .where(eq(loans.id, request.entityId));
      } else if (request.actionType === 'large_cash_adjustment') {
        // Large cash adjustment or manual ledger override (not implemented, but placeholders can log it)
      }

      // Update approval request status to approved
      const [updatedRequest] = await tx.update(systemApprovals)
        .set({
          status: 'approved',
          approvedBy: profile.id,
          approvedAt: new Date(),
        })
        .where(eq(systemApprovals.id, approvalId))
        .returning();

      // Log the event to audit log
      await logAuditEvent({
        action: 'update',
        entityType: 'system_approvals',
        entityId: approvalId,
        oldValue: request,
        newValue: updatedRequest,
        tx,
      });

      revalidatePath('/approvals');
      revalidatePath('/payments');
      revalidatePath('/loans');
      return { success: true, request: updatedRequest, error: null };
    });
  } catch (error: any) {
    console.error('Failed to approve request:', error);
    return { success: false, request: null, error: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Rejects a request with a reason.
 */
export async function rejectRequestAction(approvalId: string, rejectionReason: string) {
  const { profile } = await requireAdmin(); // RESTRICTED TO ADMINS ONLY

  try {
    const [request] = await db.select()
      .from(systemApprovals)
      .where(and(eq(systemApprovals.id, approvalId), eq(systemApprovals.status, 'pending')));

    if (!request) {
      throw new Error('Pending approval request not found');
    }

    const [updatedRequest] = await db.update(systemApprovals)
      .set({
        status: 'rejected',
        approvedBy: profile.id,
        approvedAt: new Date(),
        rejectionReason,
      })
      .where(eq(systemApprovals.id, approvalId))
      .returning();

    await logAuditEvent({
      action: 'update',
      entityType: 'system_approvals',
      entityId: approvalId,
      oldValue: request,
      newValue: updatedRequest,
    });

    revalidatePath('/approvals');
    return { success: true, request: updatedRequest, error: null };
  } catch (error: any) {
    console.error('Failed to reject request:', error);
    return { success: false, request: null, error: error.message || 'An unexpected error occurred.' };
  }
}
