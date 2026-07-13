/**
 * Formats a date string (YYYY-MM-DD, ISO string) or Date object into DD/MM/YYYY format.
 * Uses a regex check for YYYY-MM-DD to avoid timezone/DST offset day-shifts.
 */
export function formatDateDDMMYYYY(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  
  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [_, yyyy, mm, dd] = match;
      return `${dd}/${mm}/${yyyy}`;
    }
  }
  
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '—';
  
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  
  return `${dd}/${mm}/${yyyy}`;
}
