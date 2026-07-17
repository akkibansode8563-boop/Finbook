'use server';

import { db } from '@/lib/db/client';
import { orgSettings, auditLogs } from '../../../drizzle/schema';
import { requireAdmin } from '@/lib/auth/rbac';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Fetches the singleton settings record, inserting a default record if none exists.
 */
export async function getOrgSettings() {
  const [settings] = await db.select().from(orgSettings).limit(1);
  if (!settings) {
    // Insert a default settings record
    const [inserted] = await db.insert(orgSettings).values({
      orgName: 'Finbook Lending Co.',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      financialYearStartMonth: 4,
      defaultLateFeeType: 'flat',
      defaultLateFeeValue: '0.00',
      defaultAllocationMethod: 'interest_first',
      interestRoundingRule: 'nearest',
    }).returning();
    return inserted;
  }
  return settings;
}

/**
 * Updates the organization settings. Restricted to admin users.
 * Logs mutations to the audit log.
 */
export async function updateOrgSettingsAction(data: {
  orgName: string;
  logoUrl?: string | null;
  currency: string;
  timezone: string;
  financialYearStartMonth: number;
  defaultLateFeeType: 'flat' | 'percent';
  defaultLateFeeValue: string;
  defaultAllocationMethod: 'interest_first' | 'principal_first' | 'manual';
  interestRoundingRule: 'nearest' | 'up' | 'down';
}) {
  const { profile } = await requireAdmin();

  try {
    const settings = await getOrgSettings();

    const [updated] = await db.update(orgSettings)
      .set({
        orgName: data.orgName,
        logoUrl: data.logoUrl || null,
        currency: data.currency,
        timezone: data.timezone,
        financialYearStartMonth: data.financialYearStartMonth,
        defaultLateFeeType: data.defaultLateFeeType,
        defaultLateFeeValue: data.defaultLateFeeValue,
        defaultAllocationMethod: data.defaultAllocationMethod,
        interestRoundingRule: data.interestRoundingRule,
        updatedAt: new Date(),
      })
      .where(eq(orgSettings.id, settings.id))
      .returning();

    // Log the event to audit log
    await db.insert(auditLogs).values({
      userId: profile.id,
      action: 'update',
      entityType: 'org_settings',
      entityId: settings.id,
      oldValue: settings,
      newValue: updated,
      ipAddress: 'ServerAction',
    });

    revalidatePath('/settings');
    revalidatePath('/loans/new');

    return { success: true, settings: updated };
  } catch (error: any) {
    console.error('Failed to update organization settings:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
export type OrgSettingsAction = typeof updateOrgSettingsAction;

import { sql } from 'drizzle-orm';
import { logAuditEvent } from '../audit/logger';

/**
 * Restores the database from a raw SQL string transactionally.
 */
export async function restoreDatabaseAction(sqlString: string) {
  const { profile } = await requireAdmin();

  try {
    return await db.transaction(async (tx) => {
      // Split SQL queries by standard line-ending semicolon
      const statements = sqlString.split(';\n');
      
      for (let stmt of statements) {
        stmt = stmt.trim();
        if (!stmt || stmt.startsWith('--')) continue;
        await tx.execute(sql.raw(stmt));
      }

      await logAuditEvent({
        action: 'restore',
        entityType: 'database',
        entityId: '00000000-0000-0000-0000-000000000000',
        newValue: { restoredBy: profile.name },
        tx,
      });

      return { success: true, error: null };
    });
  } catch (error: any) {
    console.error('Failed to restore database backup:', error);
    return { success: false, error: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Exports all database table records as JSON.
 */
export async function exportTableDataAction() {
  await requireAdmin();

  try {
    const tables = [
      'users',
      'org_settings',
      'customers',
      'customer_bank_details',
      'customer_identity_documents',
      'guarantors',
      'customer_documents',
      'loans',
      'loan_schedule',
      'payments',
      'late_fees',
      'settlements',
      'ledger_entries',
      'audit_logs',
      'system_approvals',
    ];

    const data: Record<string, any[]> = {};
    for (const table of tables) {
      data[table] = await db.execute(sql.raw(`SELECT * FROM "${table}"`));
    }

    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Failed to export table data:', error);
    return { success: false, data: null, error: error.message || 'Failed to export database tables.' };
  }
}
