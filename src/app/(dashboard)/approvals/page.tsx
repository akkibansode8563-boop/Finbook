import { getApprovalRequestsAction } from '@/features/approvals/actions';
import { requireRole } from '@/lib/auth/rbac';
import { PageHeader } from '@/components/layout/page-header';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { ApprovalsClient } from './approvals-client';

export default async function ApprovalsPage() {
  // Staff, Managers, and Admins can access approvals
  await requireRole('staff');

  const res = await getApprovalRequestsAction();
  const requests = res.requests || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'System Approvals' }]} />

      <PageHeader
        title="Transaction Approvals & Workflows"
        description="Review, authorize, or reject sensitive operations such as payment reversals, loan write-offs, and ledger adjustments."
      />

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <ApprovalsClient initialRequests={requests} />
      </div>
    </div>
  );
}
