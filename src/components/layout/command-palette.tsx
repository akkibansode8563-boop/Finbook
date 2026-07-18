'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Keyboard, UserPlus, FilePlus2, Banknote, 
  Landmark, Settings, History, ClipboardList, BookOpen 
} from 'lucide-react';

interface Command {
  id: string;
  name: string;
  category: string;
  href: string;
  icon: React.ComponentType<any>;
}

const COMMANDS: Command[] = [
  { id: 'dashboard', name: 'Go to Dashboard', category: 'Navigation', href: '/dashboard', icon: Landmark },
  { id: 'ledger', name: 'View General Ledger', category: 'Navigation', href: '/ledger', icon: BookOpen },
  { id: 'customers-list', name: 'View Customers Registry', category: 'Customers', href: '/customers', icon: ClipboardList },
  { id: 'customer-new', name: 'Register New Customer', category: 'Customers', href: '/customers/new', icon: UserPlus },
  { id: 'loans-list', name: 'View Active Loans', category: 'Loans', href: '/loans', icon: ClipboardList },
  { id: 'loan-new', name: 'Originate New Credit Line', category: 'Loans', href: '/loans/new', icon: FilePlus2 },
  { id: 'payment-new', name: 'Record Repayment Receipt', category: 'Payments', href: '/payments/new', icon: Banknote },
  { id: 'audit-logs', name: 'View System Audit Logs', category: 'Admin', href: '/audit-logs', icon: History },
  { id: 'settings', name: 'System Configuration Settings', category: 'Admin', href: '/settings', icon: Settings },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredCommands = COMMANDS.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredCommands.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleSelect(filteredCommands[selectedIndex].href);
      }
    }
  };

  return (
    <>
      {/* Floating shortcut tip */}
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 text-[11px] text-muted-foreground font-medium select-none cursor-pointer transition-colors shadow-sm"
      >
        <Search className="w-3.5 h-3.5 text-slate-400" />
        <span>Search actions...</span>
        <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-0.5 rounded border border-slate-250 dark:border-slate-800 bg-slate-105 dark:bg-slate-950 px-1 font-mono text-[9px] font-bold text-muted-foreground opacity-100">
          <span>⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh]">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-2xl flex flex-col mx-4"
            >
              {/* Input field */}
              <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800 h-14 shrink-0 bg-slate-50 dark:bg-slate-950">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Type a command or shortcut..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 border-none outline-none focus:ring-0"
                  autoFocus
                />
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-250 dark:border-slate-800 bg-slate-105 dark:bg-slate-950 px-1.5 font-mono text-[10px] font-bold text-slate-400 opacity-100">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="max-h-[300px] overflow-y-auto p-2 space-y-0.5 bg-slate-100 dark:bg-slate-900">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => handleSelect(cmd.href)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-primary text-white' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-850'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span>{cmd.name}</span>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isSelected ? 'text-primary-foreground/80' : 'text-slate-400 dark:text-slate-500'}`}>
                          {cmd.category}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <Keyboard className="w-8 h-8 text-slate-500/50" />
                    <span>No actions match your search query.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
