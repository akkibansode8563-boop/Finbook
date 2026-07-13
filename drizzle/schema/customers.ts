import { pgTable, uuid, varchar, boolean, timestamp, numeric, text, date, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const docTypeEnum = pgEnum('doc_type', ['aadhaar', 'pan', 'voter_id', 'passport', 'other']);
export const docCategoryEnum = pgEnum('doc_category', ['kyc', 'agreement', 'collateral', 'other']);

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerCode: varchar('customer_code', { length: 100 }).unique().notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).unique().notNull(),
  altPhone: varchar('alt_phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  dob: date('dob'),
  address: text('address'),
  occupation: varchar('occupation', { length: 255 }),
  monthlyIncome: numeric('monthly_income', { precision: 15, scale: 2 }),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const customerIdentityDocuments = pgTable('customer_identity_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  docType: docTypeEnum('doc_type').notNull(),
  docNumber: varchar('doc_number', { length: 100 }).notNull(),
  fileUrl: text('file_url'),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const guarantors = pgTable('guarantors', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  address: text('address'),
  relation: varchar('relation', { length: 100 }),
  idProofType: varchar('id_proof_type', { length: 100 }),
  idProofNumber: varchar('id_proof_number', { length: 100 }),
  idProofUrl: text('id_proof_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customerBankDetails = pgTable('customer_bank_details', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  bankName: varchar('bank_name', { length: 255 }).notNull(),
  accountHolderName: varchar('account_holder_name', { length: 255 }).notNull(),
  accountNumber: varchar('account_number', { length: 100 }).notNull(),
  ifscCode: varchar('ifsc_code', { length: 50 }).notNull(),
  upiId: varchar('upi_id', { length: 100 }),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const customerDocuments = pgTable('customer_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  category: docCategoryEnum('category').default('other').notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
});
