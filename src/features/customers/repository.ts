import { db } from '@/lib/db/client';
import {
  customers,
  customerBankDetails,
  customerIdentityDocuments,
  guarantors,
  customerDocuments
} from '../../../drizzle/schema';
import { eq, and, isNull, desc, like, or } from 'drizzle-orm';
import type {
  Customer,
  NewCustomer,
  NewCustomerBankDetails,
  NewCustomerIdentityDocument,
  NewGuarantor,
  CustomerWithDetails
} from './types';

/**
 * Fetches all active (non-soft-deleted) customers.
 */
export async function getAllCustomers(searchQuery?: string): Promise<Customer[]> {
  if (searchQuery) {
    return await db.select()
      .from(customers)
      .where(
        and(
          isNull(customers.deletedAt),
          or(
            like(customers.fullName, `%${searchQuery}%`),
            like(customers.phone, `%${searchQuery}%`),
            like(customers.customerCode, `%${searchQuery}%`)
          )
        )
      )
      .orderBy(desc(customers.createdAt));
  }

  return await db.select()
    .from(customers)
    .where(isNull(customers.deletedAt))
    .orderBy(desc(customers.createdAt));
}

/**
 * Fetches a single customer with all relational details loaded.
 */
export async function getCustomerById(id: string): Promise<CustomerWithDetails | null> {
  const customer = await db.query.customers.findFirst({
    where: and(eq(customers.id, id), isNull(customers.deletedAt)),
    with: {
      bankDetails: true,
      identityDocuments: true,
      guarantors: true,
      documents: true,
    },
  });

  return (customer as CustomerWithDetails) || null;
}

/**
 * Atomic customer creation transaction.
 */
export async function createCustomer(
  customerData: Omit<NewCustomer, 'id' | 'customerCode' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  relationsData: {
    bankDetails: Omit<NewCustomerBankDetails, 'id' | 'customerId' | 'createdAt'>[];
    identityDocuments: Omit<NewCustomerIdentityDocument, 'id' | 'customerId' | 'createdAt'>[];
    guarantors: Omit<NewGuarantor, 'id' | 'customerId' | 'createdAt'>[];
  }
): Promise<Customer> {
  return await db.transaction(async (tx) => {
    // Generate code: CUST-XXXXXXXX (8-digit random/timestamp slice)
    const customerCode = `CUST-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const [insertedCustomer] = await tx.insert(customers).values({
      ...customerData,
      customerCode,
    }).returning();

    const customerId = insertedCustomer.id;

    if (relationsData.bankDetails.length > 0) {
      await tx.insert(customerBankDetails).values(
        relationsData.bankDetails.map((bd) => ({ ...bd, customerId }))
      );
    }

    if (relationsData.identityDocuments.length > 0) {
      await tx.insert(customerIdentityDocuments).values(
        relationsData.identityDocuments.map((idoc) => ({ ...idoc, customerId }))
      );
    }

    if (relationsData.guarantors.length > 0) {
      await tx.insert(guarantors).values(
        relationsData.guarantors.map((g) => ({ ...g, customerId }))
      );
    }

    return insertedCustomer;
  });
}

/**
 * Atomic customer update transaction.
 */
export async function updateCustomer(
  customerId: string,
  customerData: Partial<Omit<NewCustomer, 'id' | 'customerCode' | 'createdAt' | 'updatedAt' | 'deletedAt'>>,
  relationsData?: {
    bankDetails: Omit<NewCustomerBankDetails, 'id' | 'customerId' | 'createdAt'>[];
    identityDocuments: Omit<NewCustomerIdentityDocument, 'id' | 'customerId' | 'createdAt'>[];
    guarantors: Omit<NewGuarantor, 'id' | 'customerId' | 'createdAt'>[];
  }
): Promise<void> {
  await db.transaction(async (tx) => {
    // 1. Update basic profile info
    await tx.update(customers)
      .set({ ...customerData, updatedAt: new Date() })
      .where(eq(customers.id, customerId));

    // 2. Refresh lists (delete and insert)
    if (relationsData) {
      // Refresh bank details
      await tx.delete(customerBankDetails).where(eq(customerBankDetails.customerId, customerId));
      if (relationsData.bankDetails.length > 0) {
        await tx.insert(customerBankDetails).values(
          relationsData.bankDetails.map((bd) => ({ ...bd, customerId }))
        );
      }

      // Refresh identity documents
      await tx.delete(customerIdentityDocuments).where(eq(customerIdentityDocuments.customerId, customerId));
      if (relationsData.identityDocuments.length > 0) {
        await tx.insert(customerIdentityDocuments).values(
          relationsData.identityDocuments.map((idoc) => ({ ...idoc, customerId }))
        );
      }

      // Refresh guarantors
      await tx.delete(guarantors).where(eq(guarantors.customerId, customerId));
      if (relationsData.guarantors.length > 0) {
        await tx.insert(guarantors).values(
          relationsData.guarantors.map((g) => ({ ...g, customerId }))
        );
      }
    }
  });
}

/**
 * Soft deletes a customer by setting deleted_at timestamp.
 */
export async function softDeleteCustomer(id: string): Promise<void> {
  await db.update(customers)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(customers.id, id));
}
