import { db } from '@/lib/db/client';
import { ledgerEntries } from '../../../drizzle/schema';
import { desc } from 'drizzle-orm';

/**
 * Fetches global ledger entries for audit logging.
 */
export async function getGlobalLedgerEntries() {
  return await db.query.ledgerEntries.findMany({
    with: {
      customer: true,
      loan: true,
    },
    orderBy: desc(ledgerEntries.createdAt),
  });
}
export type GlobalLedgerEntries = Awaited<ReturnType<typeof getGlobalLedgerEntries>>;
