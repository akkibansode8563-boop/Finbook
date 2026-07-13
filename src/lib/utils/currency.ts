/**
 * Formats a number or numeric string as Indian Rupees (INR).
 */
export function formatCurrency(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined) return '₹0.00';
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(parsed)) return '₹0.00';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(parsed);
}
