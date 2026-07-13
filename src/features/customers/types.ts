import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  customers,
  customerIdentityDocuments,
  guarantors,
  customerBankDetails,
  customerDocuments,
} from '../../../drizzle/schema/customers';

export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;

export type CustomerIdentityDocument = InferSelectModel<typeof customerIdentityDocuments>;
export type NewCustomerIdentityDocument = InferInsertModel<typeof customerIdentityDocuments>;

export type Guarantor = InferSelectModel<typeof guarantors>;
export type NewGuarantor = InferInsertModel<typeof guarantors>;

export type CustomerBankDetails = InferSelectModel<typeof customerBankDetails>;
export type NewCustomerBankDetails = InferInsertModel<typeof customerBankDetails>;

export type CustomerDocument = InferSelectModel<typeof customerDocuments>;
export type NewCustomerDocument = InferInsertModel<typeof customerDocuments>;

export interface CustomerWithDetails extends Customer {
  identityDocuments: CustomerIdentityDocument[];
  guarantors: Guarantor[];
  bankDetails: CustomerBankDetails[];
  documents: CustomerDocument[];
}
