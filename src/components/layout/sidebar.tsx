'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { hasPermission, type UserRole } from '@/lib/constants/roles';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Banknote,
  Receipt,
  BookOpen,
  BarChart3,
  UserCog,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  Coins
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  userName: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  requiredRole: UserRole;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, requiredRole: 'viewer' },
  { name: 'Customers', href: '/customers', icon: Users, requiredRole: 'viewer' },
  { name: 'Loans', href: '/loans', icon: Banknote, requiredRole: 'viewer' },
  { name: 'Payments', href: '/payments', icon: Receipt, requiredRole: 'viewer' },
  { name: 'Ledger', href: '/ledger', icon: BookOpen, requiredRole: 'manager' },
  { name: 'Reports', href: '/reports', icon: BarChart3, requiredRole: 'manager' },
  { name: 'Users', href: '/users', icon: UserCog, requiredRole: 'admin' },
  { name: 'Audit Logs', href: '/audit-logs', icon: History, requiredRole: 'admin' },
  { name: 'Settings', href: '/settings', icon: Settings, requiredRole: 'admin' },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const filteredItems = navItems.filter((item) => hasPermission(role, item.requiredRole));

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 70 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 overflow-y-auto z-20 shrink-0 transition-colors"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-950/40 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-lg tracking-tight select-none">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent font-extrabold"
              >
                FINBOOK
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-4 space-y-1 select-none">
        {filteredItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative border',
                isActive
                  ? 'bg-violet-500/10 dark:bg-violet-600/15 text-violet-600 dark:text-violet-400 border-violet-500/20'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white border-transparent'
              )}
            >
              <item.icon className={cn('w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0', isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white')} />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {/* Tooltip for collapsed sidebar */}
              {!sidebarOpen && (
                <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xl border border-slate-200 dark:border-slate-800 pointer-events-none transition-all origin-left z-30 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold uppercase shadow-md shrink-0">
            {userName.substring(0, 2)}
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col truncate min-w-0"
              >
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{userName}</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-violet-500 dark:text-violet-400" />
                  <span className="capitalize">{role}</span>
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
