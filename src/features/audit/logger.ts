import { db } from '@/lib/db/client';
import { auditLogs } from '../../../drizzle/schema';
import { getCurrentUserProfile } from '@/lib/auth/session';
import { headers } from 'next/headers';

interface LogAuditParams {
  action: 'create' | 'update' | 'delete' | 'restore';
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  tx?: any; // Allow passing transaction context if running inside a db transaction
}

/**
 * Centralized audit trail recorder.
 * Automatically resolves request IP address, User Agent, and authenticated user profile.
 */
export async function logAuditEvent({
  action,
  entityType,
  entityId,
  oldValue = null,
  newValue = null,
  tx = db
}: LogAuditParams) {
  try {
    let profile: any = null;
    try {
      profile = await getCurrentUserProfile();
    } catch (e) {
      console.warn('Audit logger: No active user profile session context found.', e);
    }

    let ipAddress = '127.0.0.1';
    let userAgent = 'System / Internal';

    try {
      const headersList = await headers();
      const forwardedFor = headersList.get('x-forwarded-for');
      if (forwardedFor) {
        ipAddress = forwardedFor.split(',')[0].trim();
      }
      const agent = headersList.get('user-agent');
      if (agent) {
        userAgent = agent;
      }
    } catch (e) {
      // headers() throws if called outside of request context (e.g. background job, seed script)
    }

    await tx.insert(auditLogs).values({
      userId: profile?.id || null,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Audit Log failed to record:', error);
  }
}
