CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'staff', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."doc_category" AS ENUM('kyc', 'agreement', 'collateral', 'other');--> statement-breakpoint
CREATE TYPE "public"."doc_type" AS ENUM('aadhaar', 'pan', 'voter_id', 'passport', 'other');--> statement-breakpoint
CREATE TYPE "public"."allocation_method" AS ENUM('interest_first', 'principal_first', 'manual');--> statement-breakpoint
CREATE TYPE "public"."installment_status" AS ENUM('pending', 'paid', 'partial', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."interest_period" AS ENUM('day', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."interest_type" AS ENUM('flat', 'reducing');--> statement-breakpoint
CREATE TYPE "public"."late_fee_type" AS ENUM('flat', 'percent');--> statement-breakpoint
CREATE TYPE "public"."loan_frequency" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('active', 'closed', 'overdue', 'settled', 'defaulted', 'written_off');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('emi', 'interest_only', 'custom', 'one_time_settlement');--> statement-breakpoint
CREATE TYPE "public"."tenure_unit" AS ENUM('days', 'weeks', 'months', 'years');--> statement-breakpoint
CREATE TYPE "public"."payment_mode" AS ENUM('cash', 'bank_transfer', 'upi', 'cheque', 'other');--> statement-breakpoint
CREATE TYPE "public"."txn_type" AS ENUM('disbursement', 'payment', 'interest_accrual', 'late_fee', 'discount', 'adjustment', 'settlement', 'reversal');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'restore');--> statement-breakpoint
CREATE TYPE "public"."rounding_rule" AS ENUM('nearest', 'up', 'down');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_auth_id_unique" UNIQUE("auth_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "customer_bank_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"bank_name" varchar(255) NOT NULL,
	"account_holder_name" varchar(255) NOT NULL,
	"account_number" varchar(100) NOT NULL,
	"ifsc_code" varchar(50) NOT NULL,
	"upi_id" varchar(100),
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" text NOT NULL,
	"category" "doc_category" DEFAULT 'other' NOT NULL,
	"uploaded_by" uuid NOT NULL,
	"uploaded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_identity_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"doc_type" "doc_type" NOT NULL,
	"doc_number" varchar(100) NOT NULL,
	"file_url" text,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_code" varchar(100) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"alt_phone" varchar(50),
	"email" varchar(255),
	"dob" date,
	"address" text,
	"occupation" varchar(255),
	"monthly_income" numeric(15, 2),
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "customers_customer_code_unique" UNIQUE("customer_code"),
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "guarantors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"address" text,
	"relation" varchar(100),
	"id_proof_type" varchar(100),
	"id_proof_number" varchar(100),
	"id_proof_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loan_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"installment_no" integer NOT NULL,
	"due_date" date NOT NULL,
	"principal_due" numeric(15, 2) NOT NULL,
	"interest_due" numeric(15, 2) NOT NULL,
	"total_due" numeric(15, 2) NOT NULL,
	"principal_paid" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"interest_paid" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"late_fee_due" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"status" "installment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_number" varchar(100) NOT NULL,
	"customer_id" uuid NOT NULL,
	"principal_amount" numeric(15, 2) NOT NULL,
	"interest_type" "interest_type" NOT NULL,
	"interest_rate" numeric(5, 2) NOT NULL,
	"interest_period" "interest_period" DEFAULT 'month' NOT NULL,
	"loan_frequency" "loan_frequency" DEFAULT 'monthly' NOT NULL,
	"payment_type" "payment_type" DEFAULT 'emi' NOT NULL,
	"allocation_method" "allocation_method" DEFAULT 'interest_first' NOT NULL,
	"disbursement_date" date NOT NULL,
	"start_date" date NOT NULL,
	"tenure_value" integer NOT NULL,
	"tenure_unit" "tenure_unit" DEFAULT 'months' NOT NULL,
	"end_date" date NOT NULL,
	"late_fee_type" "late_fee_type" DEFAULT 'flat' NOT NULL,
	"late_fee_value" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"grace_period_days" integer DEFAULT 0 NOT NULL,
	"status" "loan_status" DEFAULT 'active' NOT NULL,
	"closed_at" timestamp with time zone,
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "loans_loan_number_unique" UNIQUE("loan_number")
);
--> statement-breakpoint
CREATE TABLE "late_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"installment_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"reason" text,
	"applied_date" date NOT NULL,
	"waived" boolean DEFAULT false NOT NULL,
	"waived_by" uuid,
	"waived_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"receipt_number" varchar(100) NOT NULL,
	"loan_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"payment_date" date NOT NULL,
	"entered_date" timestamp with time zone DEFAULT now() NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"payment_mode" "payment_mode" NOT NULL,
	"allocation_method" "allocation_method" NOT NULL,
	"principal_component" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"interest_component" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"late_fee_component" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"discount_component" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"is_backdated" boolean DEFAULT false NOT NULL,
	"reference_note" text,
	"reversed" boolean DEFAULT false NOT NULL,
	"reversed_reason" text,
	"entered_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "payments_receipt_number_unique" UNIQUE("receipt_number")
);
--> statement-breakpoint
CREATE TABLE "settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"settlement_date" date NOT NULL,
	"outstanding_before" numeric(15, 2) NOT NULL,
	"settlement_amount" numeric(15, 2) NOT NULL,
	"waived_amount" numeric(15, 2) NOT NULL,
	"reason" text,
	"approved_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loan_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"txn_type" "txn_type" NOT NULL,
	"reference_table" varchar(100) NOT NULL,
	"reference_id" uuid NOT NULL,
	"debit" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"credit" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"running_balance" numeric(15, 2) NOT NULL,
	"description" text,
	"entry_date" date NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(50),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_name" varchar(255) NOT NULL,
	"logo_url" varchar(500),
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"timezone" varchar(100) DEFAULT 'Asia/Kolkata' NOT NULL,
	"financial_year_start_month" integer DEFAULT 4 NOT NULL,
	"default_late_fee_type" "late_fee_type" DEFAULT 'flat' NOT NULL,
	"default_late_fee_value" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"default_allocation_method" "allocation_method" DEFAULT 'interest_first' NOT NULL,
	"interest_rounding_rule" "rounding_rule" DEFAULT 'nearest' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customer_bank_details" ADD CONSTRAINT "customer_bank_details_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_documents" ADD CONSTRAINT "customer_documents_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_identity_documents" ADD CONSTRAINT "customer_identity_documents_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guarantors" ADD CONSTRAINT "guarantors_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loan_schedule" ADD CONSTRAINT "loan_schedule_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loans" ADD CONSTRAINT "loans_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_fees" ADD CONSTRAINT "late_fees_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_fees" ADD CONSTRAINT "late_fees_installment_id_loan_schedule_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."loan_schedule"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "late_fees" ADD CONSTRAINT "late_fees_waived_by_users_id_fk" FOREIGN KEY ("waived_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_entered_by_users_id_fk" FOREIGN KEY ("entered_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_loan_id_loans_id_fk" FOREIGN KEY ("loan_id") REFERENCES "public"."loans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;