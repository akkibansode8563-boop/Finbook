'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by waiting until mounted on the client
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9 border border-transparent rounded-full" disabled>
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 border border-slate-200 dark:border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-100/80 dark:bg-slate-850 flex items-center justify-center overflow-hidden transition-colors cursor-pointer"
    >
      <span className="sr-only">Toggle theme</span>
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: 15, opacity: 0, rotate: 40 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: -40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="text-brass"
          >
            <Moon className="w-[18px] h-[18px] fill-current" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 15, opacity: 0, rotate: -40 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -15, opacity: 0, rotate: 40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="text-amber-500"
          >
            <Sun className="w-[18px] h-[18px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
