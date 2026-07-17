import { pgTable, uuid, varchar, text, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const approvalStatusEnum = pgEnum('approval_status', ['pending', 'approved', 'rejected']);

export const systemApprovals = pgTable('system_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestedBy: uuid('requested_by').references(() => users.id).notNull(),
  actionType: varchar('action_type', { length: 100 }).notNull(), // 'payment_reversal', 'loan_write_off', 'large_cash_adjustment', 'settlement_modification'
  entityType: varchar('entity_type', { length: 100 }).notNull(), // 'payments', 'loans', 'settlements'
  entityId: uuid('entity_id').notNull(),
  requestNotes: text('request_notes').notNull(),
  requestData: jsonb('request_data'), // JSON payload containing inputs to perform the action
  status: approvalStatusEnum('status').default('pending').notNull(),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
