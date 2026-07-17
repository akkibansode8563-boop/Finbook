CREATE SEQUENCE IF NOT EXISTS customer_code_seq START WITH 1001;--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS loan_number_seq START WITH 1001;--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START WITH 1001;--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "system_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requested_by" uuid NOT NULL,
	"action_type" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"request_notes" text NOT NULL,
	"request_data" jsonb,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejection_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "system_approvals" ADD CONSTRAINT "system_approvals_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_approvals" ADD CONSTRAINT "system_approvals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customers_full_name_idx" ON "customers" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "customers_code_idx" ON "customers" USING btree ("customer_code");--> statement-breakpoint
CREATE INDEX "loans_status_idx" ON "loans" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loans_number_idx" ON "loans" USING btree ("loan_number");--> statement-breakpoint
CREATE INDEX "loans_disbursement_date_idx" ON "loans" USING btree ("disbursement_date");--> statement-breakpoint
CREATE INDEX "payments_receipt_number_idx" ON "payments" USING btree ("receipt_number");--> statement-breakpoint
CREATE INDEX "payments_payment_date_idx" ON "payments" USING btree ("payment_date");--> statement-breakpoint
CREATE INDEX "payments_reversed_idx" ON "payments" USING btree ("reversed");--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_principal_amount_check" CHECK ("loans"."principal_amount" > 0);