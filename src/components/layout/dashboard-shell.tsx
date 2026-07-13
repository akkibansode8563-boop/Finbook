'use client';

import { useUIStore } from '@/stores/ui-store';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import type { UserRole } from '@/lib/constants/roles';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface DashboardShellProps {
  children: React.ReactNode;
  userProfile: {
    name: string;
    email: string;
    role: UserRole;
  };
}

export function DashboardShell({ children, userProfile }: DashboardShellProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const pathname = usePathname();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans overflow-hidden transition-colors">
      {/* Mobile Drawer Overlay Backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
 
      {/* Sidebar - Desktop Sticky + Mobile Absolute Drawer */}
      <div 
        className={cn(
          "fixed md:sticky top-0 bottom-0 left-0 z-40 transition-transform duration-300 md:transition-none md:transform-none md:flex shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <Sidebar role={userProfile.role} userName={userProfile.name} />
      </div>
 
      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar userName={userProfile.name} userEmail={userProfile.email} role={userProfile.role} />
 
        {/* Page Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
