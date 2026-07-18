import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusType = 
  | 'active' | 'closed' | 'overdue' | 'settled' | 'defaulted' | 'written_off'
  | 'pending' | 'paid' | 'partial' | 'waived'
  | 'admin' | 'manager' | 'staff' | 'viewer'
  | 'approved' | 'rejected';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase() as StatusType;

  const styles: Record<StatusType, string> = {
    // Loan status
    active: 'bg-emerald/10 text-emerald border-emerald/20',
    closed: 'bg-secondary text-secondary-foreground border-border',
    overdue: 'bg-rust/10 text-rust border-rust/20',
    settled: 'bg-secondary text-secondary-foreground border-border',
    defaulted: 'bg-rust/10 text-rust border-rust/20',
    written_off: 'bg-brass/10 text-brass border-brass/20',
    
    // Installment/Approval status
    pending: 'bg-brass/10 text-brass border-brass/20',
    paid: 'bg-emerald/10 text-emerald border-emerald/20',
    partial: 'bg-brass/10 text-brass border-brass/20',
    waived: 'bg-secondary text-secondary-foreground border-border',
    approved: 'bg-emerald/10 text-emerald border-emerald/20',
    rejected: 'bg-rust/10 text-rust border-rust/20',
    
    // Roles
    admin: 'bg-primary/10 text-primary border-primary/20 font-bold',
    manager: 'bg-brass/10 text-brass border-brass/20 font-semibold',
    staff: 'bg-primary/10 text-primary border-primary/20',
    viewer: 'bg-secondary text-secondary-foreground border-border',
  };

  const currentStyle = styles[normalized] || 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20';

  return (
    <Badge variant="outline" className={cn('px-2.5 py-0.5 rounded-full text-xs font-medium capitalize shrink-0 select-none', currentStyle, className)}>
      {status.replace('_', ' ')}
    </Badge>
  );
}
