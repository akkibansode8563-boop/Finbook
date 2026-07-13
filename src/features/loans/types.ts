import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { loans, loanSchedule } from '../../../drizzle/schema/loans';
import { Customer } from '../customers/types';

export type Loan = InferSelectModel<typeof loans>;
export type NewLoan = InferInsertModel<typeof loans>;

export type LoanSchedule = InferSelectModel<typeof loanSchedule>;
export type NewLoanSchedule = InferInsertModel<typeof loanSchedule>;

export interface LoanWithCustomer extends Loan {
  customer: Customer;
}

export interface LoanWithDetails extends Loan {
  customer: Customer;
  schedules: LoanSchedule[];
}
