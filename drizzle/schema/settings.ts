import { pgTable, uuid, varchar, integer, numeric, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { lateFeeTypeEnum, allocationMethodEnum } from './loans';

export const roundingRuleEnum = pgEnum('rounding_rule', ['nearest', 'up', 'down']);

export const orgSettings = pgTable('org_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  orgName: varchar('org_name', { length: 255 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  timezone: varchar('timezone', { length: 100 }).default('Asia/Kolkata').notNull(),
  financialYearStartMonth: integer('financial_year_start_month').default(4).notNull(), // April
  defaultLateFeeType: lateFeeTypeEnum('default_late_fee_type').default('flat').notNull(),
  defaultLateFeeValue: numeric('default_late_fee_value', { precision: 15, scale: 2 }).default('0.00').notNull(),
  defaultAllocationMethod: allocationMethodEnum('default_allocation_method').default('interest_first').notNull(),
  interestRoundingRule: roundingRuleEnum('interest_rounding_rule').default('nearest').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
