import { db } from '@/lib/db/client';
import { auditLogs } from '../../../drizzle/schema';
import { desc } from 'drizzle-orm';

/**
 * Fetches the latest 100 audit log entries with user profiles.
 */
export async function getAuditLogs() {
  return await db.query.auditLogs.findMany({
    with: {
      user: true,
    },
    orderBy: desc(auditLogs.createdAt),
    limit: 100,
  });
}
export type AuditLogsData = Awaited<ReturnType<typeof getAuditLogs>>;
