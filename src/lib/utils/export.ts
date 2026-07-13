/**
 * Exports JSON data to a CSV file that opens natively in Microsoft Excel.
 * Includes a UTF-8 BOM (Byte Order Mark) to ensure Excel displays currency symbols
 * and foreign characters correctly.
 */
export function exportToCSV(
  data: Record<string, any>[],
  headers: { label: string; key: string }[],
  filename: string
) {
  const csvRows: string[] = [];
  
  // 1. Add Header row
  const headerRow = headers.map(h => `"${String(h.label).replace(/"/g, '""')}"`).join(',');
  csvRows.push(headerRow);
  
  // 2. Add Data rows
  for (const row of data) {
    const dataRow = headers.map(h => {
      // Handle nested property paths like "customer.fullName"
      const keys = h.key.split('.');
      let val: any = row;
      for (const k of keys) {
        val = val ? val[k] : undefined;
      }
      
      const stringVal = val === null || val === undefined ? '' : String(val);
      return `"${stringVal.replace(/"/g, '""')}"`;
    }).join(',');
    csvRows.push(dataRow);
  }
  
  // 3. Create Blob with UTF-8 BOM (\uFEFF)
  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // 4. Trigger browser download
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
