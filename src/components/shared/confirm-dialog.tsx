'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-bold">{title}</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm mt-1">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 gap-2 sm:justify-end">
          <Button variant="ghost" onClick={onClose} className="hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-white">
            {cancelLabel}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            className={isDestructive ? '' : 'bg-primary hover:bg-primary/95 text-white'}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
