'use server';

import { requireStaff } from '@/lib/auth/rbac';
import { customerSchema, type CustomerFormInput } from './schema';
import {
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  restoreCustomer
} from './repository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { handleDatabaseError } from '@/lib/db/errors';

export async function createCustomerAction(formData: CustomerFormInput): Promise<{ success: boolean; customerId?: string; error?: string }> {
  const { profile } = await requireStaff();

  const result = customerSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { identityDocuments, bankDetails, guarantors, ...basicData } = result.data;

  try {
    const newCust = await createCustomer(
      {
        ...basicData,
        createdBy: profile.id,
        dob: basicData.dob || null,
        // Convert monthly income string to numeric format for DB compatibility
        monthlyIncome: basicData.monthlyIncome ? String(basicData.monthlyIncome) : '0',
      },
      {
        bankDetails,
        identityDocuments,
        guarantors
      }
    );

    revalidatePath('/customers');
    return { success: true, customerId: newCust.id };
  } catch (error: any) {
    return { success: false, ...handleDatabaseError(error) };
  }
}

export async function updateCustomerAction(customerId: string, formData: CustomerFormInput): Promise<{ success: boolean; error?: string }> {
  const { profile } = await requireStaff();

  const result = customerSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { identityDocuments, bankDetails, guarantors, ...basicData } = result.data;

  try {
    await updateCustomer(
      customerId,
      {
        ...basicData,
        dob: basicData.dob || null,
        monthlyIncome: basicData.monthlyIncome ? String(basicData.monthlyIncome) : '0',
      },
      {
        bankDetails,
        identityDocuments,
        guarantors
      }
    );

    revalidatePath('/customers');
    revalidatePath(`/customers/${customerId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, ...handleDatabaseError(error) };
  }
}

export async function deleteCustomerAction(customerId: string): Promise<{ success: boolean; error?: string }> {
  await requireStaff();

  try {
    await softDeleteCustomer(customerId);
    revalidatePath('/customers');
    revalidatePath('/audit-logs');
    return { success: true };
  } catch (error: any) {
    return { success: false, ...handleDatabaseError(error) };
  }
}

export async function restoreCustomerAction(customerId: string): Promise<{ success: boolean; error?: string }> {
  await requireStaff();

  try {
    await restoreCustomer(customerId);
    revalidatePath('/customers');
    revalidatePath('/audit-logs');
    return { success: true };
  } catch (error: any) {
    return { success: false, ...handleDatabaseError(error) };
  }
}
