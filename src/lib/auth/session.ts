import { createClient } from '../supabase/server';
import { db } from '../db/client';
import { users } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUserProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  try {
    const profile = await db.query.users.findFirst({
      where: eq(users.authId, user.id),
    });
    return profile || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Enforces authentication and retrieves both the auth session user and database profile.
 * Redirects to login if either are missing or the profile is deactivated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentUserProfile();
  if (!profile || !profile.isActive || profile.deletedAt) {
    redirect('/login?error=unauthorized');
  }

  return { user, profile };
}
