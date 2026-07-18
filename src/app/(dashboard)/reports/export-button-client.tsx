'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ExportButtonProps {
  exportFn: () => Promise<string>;
  filename: string;
}

export function ExportButtonClient({ exportFn, filename }: ExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const csvContent = await exportFn();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Successfully exported ${filename}`);
      } catch (err) {
        console.error(err);
        toast.error('Failed to compile and download report.');
      }
    });
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isPending}
      className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:bg-slate-850 hover:text-white font-semibold gap-1.5 h-10 px-4"
    >
      {isPending ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin text-primary" />
          <span>Compiling...</span>
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 text-primary" />
          <span>Export CSV</span>
        </>
      )}
    </Button>
  );
}
