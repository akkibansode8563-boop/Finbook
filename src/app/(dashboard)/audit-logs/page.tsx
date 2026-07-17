import { getAuditLogs } from '@/features/audit/queries';
import { requireAdmin } from '@/lib/auth/rbac';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { AuditLogsClient } from './audit-logs-client';

export default async function AuditLogsPage() {
  // Only admins can access audit logs
  await requireAdmin();

  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Audit Logs' }]} />

      <PageHeader
        title="Security & Mutation Audit Logs"
        description="Immutable system-wide ledger of database mutations, administrative edits, and collections logins."
      />

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <AuditLogsClient initialLogs={logs} />
      </div>
    </div>
  );
}
