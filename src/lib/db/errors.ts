/**
 * User-friendly PostgreSQL database error parser.
 * Maps unique constraints, check constraints, and foreign keys to readable validation messages.
 */
export function handleDatabaseError(error: any): { error: string } {
  // Extract database error code and constraint name
  const code = error.code || error.cause?.code || '';
  const constraint = error.constraint || error.cause?.constraint || '';
  const message = error.message || '';

  // Unique constraint violation (Postgres error code 23505)
  if (code === '23505' || message.includes('23505') || message.includes('unique constraint')) {
    if (constraint === 'customers_phone_unique' || message.includes('customers_phone_unique')) {
      return { error: 'A customer with this phone number is already registered.' };
    }
    if (constraint === 'customers_customer_code_unique' || message.includes('customers_customer_code_unique')) {
      return { error: 'A customer with this customer code already exists.' };
    }
    if (constraint === 'loans_loan_number_unique' || message.includes('loans_loan_number_unique')) {
      return { error: 'A loan with this loan number already exists.' };
    }
    if (constraint === 'payments_receipt_number_unique' || message.includes('payments_receipt_number_unique')) {
      return { error: 'A payment receipt with this number already exists.' };
    }
    if (constraint === 'users_email_unique' || message.includes('users_email_unique')) {
      return { error: 'A user with this email address already exists.' };
    }
    return { error: 'A record with duplicate unique details already exists in the system.' };
  }

  // Check constraint violation (Postgres error code 23514)
  if (code === '23514' || message.includes('23514') || message.includes('check constraint')) {
    if (constraint === 'loans_principal_amount_check' || message.includes('loans_principal_amount_check')) {
      return { error: 'Loan principal amount must be greater than zero.' };
    }
    return { error: 'Database check constraint validation failed.' };
  }

  // Foreign key violation (Postgres error code 23503)
  if (code === '23503' || message.includes('23503') || message.includes('foreign key constraint')) {
    return { error: 'The requested action violates database entity relationships.' };
  }

  console.error('Unhandled Database Error:', error);
  return { error: 'A database error occurred while processing your request.' };
}
