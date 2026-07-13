'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCustomerAction } from '../actions';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteCustomerButtonProps {
  customerId: string;
  customerName: string;
}

export function DeleteCustomerButton({ customerId, customerName }: DeleteCustomerButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const response = await deleteCustomerAction(customerId);
      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success('Customer profile deleted successfully.');
        setIsOpen(false);
        router.push('/customers');
      }
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        className="gap-2 h-10 px-4 bg-rose-950/40 text-rose-400 border border-rose-500/20 hover:bg-rose-600 hover:text-white"
        disabled={isPending}
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="w-4 h-4" />
        <span>Delete Profile</span>
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Customer Profile?"
        description={`Are you sure you want to delete the profile of "${customerName}"? All associated data will be archived.`}
        confirmLabel={isPending ? 'Deleting...' : 'Delete Profile'}
        isDestructive
      />
    </>
  );
}
