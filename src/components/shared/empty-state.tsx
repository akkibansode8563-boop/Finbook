import { ReactNode } from 'react';
import { FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  icon = <FileText className="w-12 h-12 text-slate-500" />,
  action,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 backdrop-blur-sm max-w-lg mx-auto mt-6">
      <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action && <div className="shrink-0">{action}</div>}
    </Card>
  );
}
