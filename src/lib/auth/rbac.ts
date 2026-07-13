import { ROLE_HIERARCHY, type UserRole, hasPermission } from '../constants/roles';
import { requireAuth } from './session';
import { redirect } from 'next/navigation';

export { hasPermission };

/**
 * Server-side guard to verify user role before rendering pages or performing server actions.
 */
export async function requireRole(requiredRole: UserRole) {
  const { user, profile } = await requireAuth();

  if (!hasPermission(profile.role, requiredRole)) {
    redirect('/dashboard?error=forbidden');
  }

  return { user, profile };
}

export async function requireAdmin() {
  return requireRole('admin');
}

export async function requireManager() {
  return requireRole('manager');
}

export async function requireStaff() {
  return requireRole('staff');
}
