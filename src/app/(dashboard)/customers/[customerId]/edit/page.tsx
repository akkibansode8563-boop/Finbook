import { getCustomerById } from '@/features/customers/repository';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { EditFormClient } from './edit-form-client';
import { notFound } from 'next/navigation';

interface EditPageProps {
  params: Promise<{ customerId: string }>;
}

export default async function EditCustomerPage({ params }: EditPageProps) {
  const { customerId } = await params;
  const customer = await getCustomerById(customerId);

  if (!customer) {
    notFound();
  }

  // Pre-format database model to match Zod schema validation structure
  const initialData = {
    fullName: customer.fullName,
    phone: customer.phone,
    altPhone: customer.altPhone || '',
    email: customer.email || '',
    dob: customer.dob || '',
    address: customer.address || '',
    occupation: customer.occupation || '',
    monthlyIncome: String(customer.monthlyIncome || '0'),
    notes: customer.notes || '',
    identityDocuments: customer.identityDocuments.map((doc) => ({
      docType: doc.docType,
      docNumber: doc.docNumber,
      fileUrl: doc.fileUrl || '',
    })),
    bankDetails: customer.bankDetails.map((bank) => ({
      bankName: bank.bankName,
      accountHolderName: bank.accountHolderName,
      accountNumber: bank.accountNumber,
      ifscCode: bank.ifscCode,
      upiId: bank.upiId || '',
      isPrimary: bank.isPrimary,
    })),
    guarantors: customer.guarantors.map((g) => ({
      fullName: g.fullName,
      phone: g.phone,
      address: g.address || '',
      relation: g.relation || '',
      idProofType: g.idProofType || '',
      idProofNumber: g.idProofNumber || '',
      idProofUrl: g.idProofUrl || '',
    })),
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Customers', href: '/customers' },
          { label: customer.fullName, href: `/customers/${customer.id}` },
          { label: 'Edit Profile' },
        ]}
      />

      <PageHeader
        title="Edit Customer Profile"
        description={`Modify KYC, contact, or bank accounts for ${customer.fullName}.`}
      />

      <div className="max-w-4xl mx-auto">
        <EditFormClient customerId={customer.id} initialData={initialData} />
      </div>
    </div>
  );
}
