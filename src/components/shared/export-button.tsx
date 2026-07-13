'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportToCSV } from '@/lib/utils/export';

interface ExportButtonProps {
  data: Record<string, any>[];
  headers: { label: string; key: string }[];
  filename: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportButton({
  data,
  headers,
  filename,
  className,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const handleExport = () => {
    exportToCSV(data, headers, filename);
  };

  return (
    <Button
      onClick={handleExport}
      size={size}
      variant={variant}
      className={className}
    >
      <FileSpreadsheet className="w-4 h-4 mr-2" />
      <span>Export to Excel</span>
    </Button>
  );
}
