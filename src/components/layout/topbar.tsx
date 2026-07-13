'use client';

import { useTransition } from 'react';
import { signOut } from '@/features/auth/actions';
import { useUIStore } from '@/stores/ui-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, Bell, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from './theme-toggle';

interface TopbarProps {
  userName: string;
  userEmail: string;
  role: string;
}

export function Topbar({ userName, userEmail, role }: TopbarProps) {
  const { toggleSidebar } = useUIStore();
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      try {
        await signOut();
      } catch (error) {
        toast.error('Failed to sign out. Please try again.');
      }
    });
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-10 transition-colors">
      {/* Left side: Mobile menu toggle */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:hidden text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Active
        </span>
      </div>

      {/* Right side: Theme Toggle + Notifications + User menu */}
      <div className="flex items-center gap-3">
        {/* Animated Theme Toggle */}
        <ThemeToggle />

        {/* Mock Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500 ring-2 ring-white dark:ring-slate-900" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold uppercase shadow-inner">
              {userName.substring(0, 2)}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-800 dark:text-slate-200 shadow-lg">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs leading-none text-slate-500 dark:text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer gap-2 py-2 text-xs">
              <Shield className="w-4 h-4 text-violet-500 dark:text-violet-400" />
              <span className="capitalize">Role: {role}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem
              disabled={isPending}
              onClick={handleSignOut}
              className="focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 text-rose-500 dark:text-rose-400 cursor-pointer gap-2 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{isPending ? 'Signing out...' : 'Sign out'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
