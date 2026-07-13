import { pgTable, uuid, varchar, numeric, timestamp, date, boolean, text, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';
import { customers } from './customers';
import { loans, loanSchedule, allocationMethodEnum } from './loans';

// Payment mode enum
export const paymentModeEnum = pgEnum('payment_mode', ['cash', 'bank_transfer', 'upi', 'cheque', 'other']);

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  receiptNumber: varchar('receipt_number', { length: 100 }).unique().notNull(),
  loanId: uuid('loan_id').references(() => loans.id, { onDelete: 'cascade' }).notNull(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  paymentDate: date('payment_date').notNull(),
  enteredDate: timestamp('entered_date', { withTimezone: true }).defaultNow().notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMode: paymentModeEnum('payment_mode').notNull(),
  allocationMethod: allocationMethodEnum('allocation_method').notNull(),
  principalComponent: numeric('principal_component', { precision: 15, scale: 2 }).default('0.00').notNull(),
  interestComponent: numeric('interest_component', { precision: 15, scale: 2 }).default('0.00').notNull(),
  lateFeeComponent: numeric('late_fee_component', { precision: 15, scale: 2 }).default('0.00').notNull(),
  discountComponent: numeric('discount_component', { precision: 15, scale: 2 }).default('0.00').notNull(),
  isBackdated: boolean('is_backdated').default(false).notNull(),
  referenceNote: text('reference_note'),
  reversed: boolean('reversed').default(false).notNull(),
  reversedReason: text('reversed_reason'),
  enteredBy: uuid('entered_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const lateFees = pgTable('late_fees', {
  id: uuid('id').defaultRandom().primaryKey(),
  loanId: uuid('loan_id').references(() => loans.id, { onDelete: 'cascade' }).notNull(),
  installmentId: uuid('installment_id').references(() => loanSchedule.id, { onDelete: 'set null' }),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  reason: text('reason'),
  appliedDate: date('applied_date').notNull(),
  waived: boolean('waived').default(false).notNull(),
  waivedBy: uuid('waived_by').references(() => users.id),
  waivedReason: text('waived_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const settlements = pgTable('settlements', {
  id: uuid('id').defaultRandom().primaryKey(),
  loanId: uuid('loan_id').references(() => loans.id, { onDelete: 'cascade' }).notNull(),
  settlementDate: date('settlement_date').notNull(),
  outstandingBefore: numeric('outstanding_before', { precision: 15, scale: 2 }).notNull(),
  settlementAmount: numeric('settlement_amount', { precision: 15, scale: 2 }).notNull(),
  waivedAmount: numeric('waived_amount', { precision: 15, scale: 2 }).notNull(),
  reason: text('reason'),
  approvedBy: uuid('approved_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});
