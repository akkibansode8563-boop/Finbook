import { getOrgSettings } from '@/features/settings/actions';
import { requireAdmin } from '@/lib/auth/rbac';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsForm } from './settings-form';
import { BackupPanel } from './backup-panel';

export default async function SettingsPage() {
  // Only admins can view/edit settings
  await requireAdmin();

  const settings = await getOrgSettings();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Settings' }]} />

      <PageHeader
        title="Organization Settings"
        description="Configure defaults for lending terms, currency parameters, and RBAC accounting rules."
      />

      <div className="max-w-4xl space-y-6">
        <SettingsForm initialData={settings} />
        <BackupPanel />
      </div>
    </div>
  );
}
