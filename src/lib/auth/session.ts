import { db } from '../db/client';
import { users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Mock profile matching the User table schema
const MOCK_PROFILE = {
  id: '00000000-0000-0000-0000-000000000000',
  authId: '00000000-0000-0000-0000-000000000000',
  name: 'Admin Developer',
  email: 'admin@finbook.local',
  role: 'admin' as const,
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z'),
  deletedAt: null,
};

// Mock user matching Supabase Auth User properties
const MOCK_USER = {
  id: '00000000-0000-0000-0000-000000000000',
  email: 'admin@finbook.local',
};

export async function getSession() {
  return { access_token: 'mock-token', user: MOCK_USER };
}

export async function getCurrentUser() {
  return MOCK_USER;
}

export async function getCurrentUserProfile() {
  try {
    // Self-healing database insert so the mock user ID is present for foreign key references
    const existing = await db.query.users.findFirst({
      where: eq(users.id, MOCK_PROFILE.id),
    });
    if (!existing) {
      await db.insert(users).values(MOCK_PROFILE);
    }
  } catch (error) {
    console.error('Failed to seed mock user in database:', error);
  }
  return MOCK_PROFILE;
}

/**
 * Bypasses authentication check and returns mock admin user/profile instantly.
 */
export async function requireAuth() {
  const profile = await getCurrentUserProfile();
  return { user: MOCK_USER, profile };
}
