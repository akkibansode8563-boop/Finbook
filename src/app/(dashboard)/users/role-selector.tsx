'use client';

import { useTransition } from 'react';
import { updateUserRoleAction } from '@/features/users/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import type { UserRole } from '@/lib/constants/roles';

interface RoleSelectorProps {
  userId: string;
  currentRole: UserRole;
  isSelf: boolean;
}

export function RoleSelector({ userId, currentRole, isSelf }: RoleSelectorProps) {
  const [isPending, startTransition] = useTransition();

  const handleRoleChange = (newRole: any) => {
    startTransition(async () => {
      const res = await updateUserRoleAction(userId, newRole as UserRole);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('User access permissions modified successfully!');
      }
    });
  };

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={handleRoleChange}
      disabled={isPending || isSelf}
    >
      <SelectTrigger className="w-36 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 h-8 text-xs font-semibold">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
        <SelectItem value="admin">Administrator</SelectItem>
        <SelectItem value="manager">Manager</SelectItem>
        <SelectItem value="staff">Staff/Collector</SelectItem>
        <SelectItem value="viewer">Auditor/Viewer</SelectItem>
      </SelectContent>
    </Select>
  );
}
