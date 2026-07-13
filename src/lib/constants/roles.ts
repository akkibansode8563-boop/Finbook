export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  manager: 3,
  staff: 2,
  viewer: 1,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const userScore = ROLE_HIERARCHY[userRole] || 0;
  const requiredScore = ROLE_HIERARCHY[requiredRole] || 0;
  return userScore >= requiredScore;
}
