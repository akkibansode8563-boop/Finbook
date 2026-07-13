import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'active' | 'closed' | 'overdue' | 'settled' | 'defaulted' | 'written_off'
  | 'pending' | 'paid' | 'partial' | 'waived'
  | 'admin' | 'manager' | 'staff' | 'viewer';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase() as StatusType;

  const styles: Record<StatusType, string> = {
    // Loan status
    active: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    closed: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20',
    overdue: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    settled: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    defaulted: 'bg-red-500/10 text-red-400 border border-red-500/20',
    written_off: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    
    // Installment status
    pending: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    paid: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    partial: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    waived: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    
    // Roles
    admin: 'bg-violet-500/10 text-violet-400 border border-violet-500/20 font-bold',
    manager: 'bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold',
    staff: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    viewer: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20',
  };

  const currentStyle = styles[normalized] || 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20';

  return (
    <Badge variant="outline" className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 select-none', currentStyle, className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
