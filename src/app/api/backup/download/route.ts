import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { sql } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/rbac';
import { logAuditEvent } from '@/features/audit/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Authorize - only Admins can export database backups
    const { profile } = await requireAdmin();

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

    let sqlOutput = `-- FinBook Postgres SQL Data Backup\n`;
    sqlOutput += `-- Generated on ${new Date().toISOString()}\n`;
    sqlOutput += `-- Executing Operator: ${profile.name} (${profile.email})\n\n`;
    sqlOutput += `BEGIN;\n\n`;

    // Disable triggers/foreign key checks during restore for clean insert
    sqlOutput += `SET CONSTRAINTS ALL DEFERRED;\n\n`;

    for (const table of tables) {
      sqlOutput += `-- Data for table "${table}"\n`;
      
      // Fetch table columns information using pg_catalog
      const columnsResult = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table}
        ORDER BY ordinal_position
      `);
      
      const columns = columnsResult.map((c: any) => c.column_name);
      
      if (columns.length === 0) continue;

      // Fetch all records for the table
      const rows = await db.execute(sql.raw(`SELECT * FROM "${table}"`));

      if (rows.length > 0) {
        sqlOutput += `TRUNCATE TABLE "${table}" CASCADE;\n`;
        
        for (const row of rows) {
          const colNames = columns.map(c => `"${c}"`).join(', ');
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) {
              return 'NULL';
            }
            if (typeof val === 'object') {
              return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            }
            if (typeof val === 'boolean') {
              return val ? 'TRUE' : 'FALSE';
            }
            if (val instanceof Date) {
              return `'${val.toISOString()}'`;
            }
            // Escape single quotes for SQL string
            return `'${String(val).replace(/'/g, "''")}'`;
          }).join(', ');
          
          sqlOutput += `INSERT INTO "${table}" (${colNames}) VALUES (${values});\n`;
        }
      }
      sqlOutput += `\n`;
    }

    sqlOutput += `COMMIT;\n`;

    // Log the backup download action in audit trail
    await logAuditEvent({
      action: 'create',
      entityType: 'backup',
      entityId: '00000000-0000-0000-0000-000000000000',
      newValue: { fileName: `finbook_backup_${Date.now()}.sql`, format: 'sql' },
    });

    const response = new NextResponse(sqlOutput, {
      headers: {
        'Content-Type': 'application/sql',
        'Content-Disposition': `attachment; filename="finbook_backup_${new Date().toISOString().split('T')[0]}.sql"`,
      },
    });

    return response;
  } catch (error: any) {
    console.error('Database backup failed:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate database SQL backup.' },
      { status: 500 }
    );
  }
}
