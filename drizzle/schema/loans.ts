import { pgTable, uuid, varchar, integer, numeric, timestamp, date, text, pgEnum, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users';
import { customers } from './customers';

// Core loan enums
export const interestTypeEnum = pgEnum('interest_type', ['flat', 'reducing']);
export const interestPeriodEnum = pgEnum('interest_period', ['day', 'month', 'year']);
export const loanFrequencyEnum = pgEnum('loan_frequency', ['daily', 'weekly', 'monthly', 'yearly', 'custom']);
export const paymentTypeEnum = pgEnum('payment_type', ['emi', 'interest_only', 'custom', 'one_time_settlement']);
export const allocationMethodEnum = pgEnum('allocation_method', ['interest_first', 'principal_first', 'manual']);
export const tenureUnitEnum = pgEnum('tenure_unit', ['days', 'weeks', 'months', 'years']);
export const lateFeeTypeEnum = pgEnum('late_fee_type', ['flat', 'percent']);
export const loanStatusEnum = pgEnum('loan_status', ['active', 'closed', 'overdue', 'settled', 'defaulted', 'written_off']);
export const installmentStatusEnum = pgEnum('installment_status', ['pending', 'paid', 'partial', 'overdue', 'waived']);

export const loans = pgTable('loans', {
  id: uuid('id').defaultRandom().primaryKey(),
  loanNumber: varchar('loan_number', { length: 100 }).unique().notNull(),
  customerId: uuid('customer_id').references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  principalAmount: numeric('principal_amount', { precision: 15, scale: 2 }).notNull(),
  interestType: interestTypeEnum('interest_type').notNull(),
  interestRate: numeric('interest_rate', { precision: 5, scale: 2 }).notNull(), // e.g. 12.50%
  interestPeriod: interestPeriodEnum('interest_period').default('month').notNull(),
  loanFrequency: loanFrequencyEnum('loan_frequency').default('monthly').notNull(),
  paymentType: paymentTypeEnum('payment_type').default('emi').notNull(),
  allocationMethod: allocationMethodEnum('allocation_method').default('interest_first').notNull(),
  disbursementDate: date('disbursement_date').notNull(),
  startDate: date('start_date').notNull(),
  tenureValue: integer('tenure_value').notNull(),
  tenureUnit: tenureUnitEnum('tenure_unit').default('months').notNull(),
  endDate: date('end_date').notNull(),
  lateFeeType: lateFeeTypeEnum('late_fee_type').default('flat').notNull(),
  lateFeeValue: numeric('late_fee_value', { precision: 15, scale: 2 }).default('0.00').notNull(),
  gracePeriodDays: integer('grace_period_days').default(0).notNull(),
  status: loanStatusEnum('status').default('active').notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  statusIdx: index('loans_status_idx').on(table.status),
  loanNumberIdx: index('loans_number_idx').on(table.loanNumber),
  disbursementDateIdx: index('loans_disbursement_date_idx').on(table.disbursementDate),
  principalAmountCheck: check('loans_principal_amount_check', sql`${table.principalAmount} > 0`),
}));

export const loanSchedule = pgTable('loan_schedule', {
  id: uuid('id').defaultRandom().primaryKey(),
  loanId: uuid('loan_id').references(() => loans.id, { onDelete: 'cascade' }).notNull(),
  installmentNo: integer('installment_no').notNull(),
  dueDate: date('due_date').notNull(),
  principalDue: numeric('principal_due', { precision: 15, scale: 2 }).notNull(),
  interestDue: numeric('interest_due', { precision: 15, scale: 2 }).notNull(),
  totalDue: numeric('total_due', { precision: 15, scale: 2 }).notNull(),
  principalPaid: numeric('principal_paid', { precision: 15, scale: 2 }).default('0.00').notNull(),
  interestPaid: numeric('interest_paid', { precision: 15, scale: 2 }).default('0.00').notNull(),
  lateFeeDue: numeric('late_fee_due', { precision: 15, scale: 2 }).default('0.00').notNull(),
  status: installmentStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
