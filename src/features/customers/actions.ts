'use server';

import { requireStaff } from '@/lib/auth/rbac';
import { customerSchema, type CustomerFormInput } from './schema';
import {
  createCustomer,
  updateCustomer,
  softDeleteCustomer
} from './repository';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCustomerAction(formData: CustomerFormInput) {
  const { profile } = await requireStaff();

  const result = customerSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
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
    console.error('Failed to create customer:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function updateCustomerAction(customerId: string, formData: CustomerFormInput) {
  const { profile } = await requireStaff();

  const result = customerSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
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
    console.error('Failed to update customer:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}

export async function deleteCustomerAction(customerId: string) {
  await requireStaff();

  try {
    await softDeleteCustomer(customerId);
    revalidatePath('/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete customer:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
