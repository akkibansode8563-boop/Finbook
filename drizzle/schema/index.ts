import { relations } from 'drizzle-orm';
import { users } from './users';
import { customers, customerIdentityDocuments, guarantors, customerBankDetails, customerDocuments } from './customers';
import { loans, loanSchedule } from './loans';
import { payments, lateFees, settlements } from './payments';
import { ledgerEntries } from './ledger';
import { auditLogs } from './audit';
import { orgSettings } from './settings';

// Export all tables
export * from './users';
export * from './customers';
export * from './loans';
export * from './payments';
export * from './ledger';
export * from './audit';
export * from './settings';

// Relations definitions
export const usersRelations = relations(users, ({ many }) => ({
  customers: many(customers),
  loans: many(loans),
  payments: many(payments),
  ledgerEntries: many(ledgerEntries),
  auditLogs: many(auditLogs),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [customers.createdBy],
    references: [users.id],
  }),
  loans: many(loans),
  identityDocuments: many(customerIdentityDocuments),
  guarantors: many(guarantors),
  bankDetails: many(customerBankDetails),
  documents: many(customerDocuments),
  payments: many(payments),
  ledgerEntries: many(ledgerEntries),
}));

export const customerIdentityDocumentsRelations = relations(customerIdentityDocuments, ({ one }) => ({
  customer: one(customers, {
    fields: [customerIdentityDocuments.customerId],
    references: [customers.id],
  }),
}));

export const guarantorsRelations = relations(guarantors, ({ one }) => ({
  customer: one(customers, {
    fields: [guarantors.customerId],
    references: [customers.id],
  }),
}));

export const customerBankDetailsRelations = relations(customerBankDetails, ({ one }) => ({
  customer: one(customers, {
    fields: [customerBankDetails.customerId],
    references: [customers.id],
  }),
}));

export const customerDocumentsRelations = relations(customerDocuments, ({ one }) => ({
  customer: one(customers, {
    fields: [customerDocuments.customerId],
    references: [customers.id],
  }),
  uploadedBy: one(users, {
    fields: [customerDocuments.uploadedBy],
    references: [users.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  customer: one(customers, {
    fields: [loans.customerId],
    references: [customers.id],
  }),
  createdBy: one(users, {
    fields: [loans.createdBy],
    references: [users.id],
  }),
  schedules: many(loanSchedule),
  payments: many(payments),
  lateFees: many(lateFees),
  settlements: many(settlements),
  ledgerEntries: many(ledgerEntries),
}));

export const loanScheduleRelations = relations(loanSchedule, ({ one }) => ({
  loan: one(loans, {
    fields: [loanSchedule.loanId],
    references: [loans.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  loan: one(loans, {
    fields: [payments.loanId],
    references: [loans.id],
  }),
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
  enteredBy: one(users, {
    fields: [payments.enteredBy],
    references: [users.id],
  }),
}));

export const lateFeesRelations = relations(lateFees, ({ one }) => ({
  loan: one(loans, {
    fields: [lateFees.loanId],
    references: [loans.id],
  }),
  installment: one(loanSchedule, {
    fields: [lateFees.installmentId],
    references: [loanSchedule.id],
  }),
  waivedBy: one(users, {
    fields: [lateFees.waivedBy],
    references: [users.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  loan: one(loans, {
    fields: [settlements.loanId],
    references: [loans.id],
  }),
  approvedBy: one(users, {
    fields: [settlements.approvedBy],
    references: [users.id],
  }),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  loan: one(loans, {
    fields: [ledgerEntries.loanId],
    references: [loans.id],
  }),
  customer: one(customers, {
    fields: [ledgerEntries.customerId],
    references: [customers.id],
  }),
  createdBy: one(users, {
    fields: [ledgerEntries.createdBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));
