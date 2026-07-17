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
  { name: 'Approvals', href: '/approvals', icon: Shield, requiredRole: 'staff' },
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
      className="hidden md:flex flex-col h-screen sticky top-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground overflow-y-auto z-20 shrink-0 transition-colors"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border shrink-0 bg-sidebar/50 backdrop-blur-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-foreground text-lg tracking-tight select-none">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <Coins className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-foreground font-display font-semibold tracking-wide"
              >
                FINBOOK
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative',
                isActive
                  ? 'bg-accent/40 text-primary ledger-rule'
                  : 'hover:bg-muted/80 hover:text-foreground text-muted-foreground border-transparent'
              )}
            >
              <item.icon className={cn('w-5 h-5 transition-transform duration-200 group-hover:scale-110 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
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
                <div className="absolute left-16 scale-0 group-hover:scale-100 bg-popover text-popover-foreground text-xs font-semibold px-3 py-1.5 rounded-md shadow-xl border border-border pointer-events-none transition-all origin-left z-30 whitespace-nowrap">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold uppercase shadow-sm shrink-0">
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
                <span className="text-sm font-medium text-foreground truncate">{userName}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Shield className="w-3 h-3 text-primary" />
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
