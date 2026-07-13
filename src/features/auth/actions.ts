'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/client';
import { users } from '../../../drizzle/schema';
import { loginSchema, registerSchema } from './schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: unknown) {
  const result = loginSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { email, password } = result.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(formData: unknown) {
  const result = registerSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password, role } = result.data;
  const supabase = await createClient();

  // 1. Sign up the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Registration failed: User not created.' };
  }

  // 2. Create the user profile in our database users table
  try {
    await db.insert(users).values({
      authId: data.user.id,
      name,
      email,
      role,
      isActive: true,
    });
  } catch (dbError) {
    console.error('Failed to create user profile in database:', dbError);
    return { error: 'Auth registered successfully, but database profile creation failed.' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
