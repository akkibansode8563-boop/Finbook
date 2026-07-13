'use server';

import { db } from '@/lib/db/client';
import { users, auditLogs } from '../../../drizzle/schema';
import { requireAdmin } from '@/lib/auth/rbac';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import type { UserRole } from '@/lib/constants/roles';

/**
 * Updates a user's access role. Restricted to admins.
 * Prevents admins from changing their own role to safeguard system configuration.
 */
export async function updateUserRoleAction(targetUserId: string, newRole: UserRole) {
  const { profile } = await requireAdmin();

  // Prevent self-demotion
  if (targetUserId === profile.id) {
    return { error: 'You cannot demote or change your own role.' };
  }

  try {
    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);
    if (!targetUser) {
      return { error: 'User profile not found.' };
    }

    const [updated] = await db.update(users)
      .set({
        role: newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, targetUserId))
      .returning();

    // Log event to audit log
    await db.insert(auditLogs).values({
      userId: profile.id,
      action: 'update',
      entityType: 'users',
      entityId: targetUserId,
      oldValue: targetUser,
      newValue: updated,
      ipAddress: 'ServerAction',
    });

    revalidatePath('/users');
    return { success: true, user: updated };
  } catch (error: any) {
    console.error('Failed to update user role:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
export type UpdateUserRoleAction = typeof updateUserRoleAction;
