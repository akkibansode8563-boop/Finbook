import { pgTable, uuid, varchar, numeric, timestamp, date, text, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { customers } from './customers';
import { loans } from './loans';

// Transaction Type Enum
export const txnTypeEnum = pgEnum('txn_type', [
  'disbursement',
  'payment',
  'interest_accrual',
  'late_fee',
  'discount',
  'adjustment',
  'settlement',
  'reversal',
]);

export const ledgerEntries = pgTable('ledger_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  loanId: uuid('loan_id').references(() => loans.id, { onDelete: 'cascade' }).notNull(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  txnType: txnTypeEnum('txn_type').notNull(),
  referenceTable: varchar('reference_table', { length: 100 }).notNull(), // e.g. 'payments', 'late_fees', 'settlements'
  referenceId: uuid('reference_id').notNull(), // Polymorphic ID matching the reference table row
  debit: numeric('debit', { precision: 15, scale: 2 }).default('0.00').notNull(),
  credit: numeric('credit', { precision: 15, scale: 2 }).default('0.00').notNull(),
  runningBalance: numeric('running_balance', { precision: 15, scale: 2 }).notNull(),
  description: text('description'),
  entryDate: date('entry_date').notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
