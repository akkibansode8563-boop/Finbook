'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Banknote, Coins, Receipt, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { CountUp } from '@/components/shared/count-up';

interface KPIGridProps {
  kpis: {
    activeLoansCount: number;
    overdueLoansCount: number;
    totalDisbursed: number;
    totalCollected: number;
    totalOutstanding: number;
  };
}

export function KPIGrid({ kpis }: KPIGridProps) {
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 25 } },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {/* Card 1: Active Accounts */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4 }}
        className="bg-card-glass hover:glow-primary rounded-xl transition-all duration-300"
      >
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              <CountUp end={kpis.activeLoansCount} />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Overdue accounts: <span className="text-destructive font-bold font-mono"><CountUp end={kpis.overdueLoansCount} /></span>
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 2: Total Disbursed */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4 }}
        className="bg-card-glass hover:glow-brass rounded-xl transition-all duration-300"
      >
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Disbursed</span>
            <div className="w-8 h-8 rounded-lg bg-brass/10 border border-brass/20 flex items-center justify-center">
              <Landmark className="w-4 h-4 text-brass" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-450 dark:text-emerald-400 font-mono">
              <CountUp end={kpis.totalDisbursed} prefix="₹" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cumulative principal disbursed</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 3: Total Collected */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4 }}
        className="bg-card-glass hover:glow-primary rounded-xl transition-all duration-300"
      >
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-455 dark:text-emerald-400 font-mono">
              <CountUp end={kpis.totalCollected} prefix="₹" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Cumulative repayment collections</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Card 4: Outstanding Balance */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -4 }}
        className="bg-card-glass hover:glow-brass rounded-xl transition-all duration-300"
      >
        <Card className="border-none shadow-none bg-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Outstanding Balance</span>
            <div className="w-8 h-8 rounded-lg bg-rose-600/10 border border-rose-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-rose-450 dark:text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-foreground font-mono">
              <CountUp end={kpis.totalOutstanding} prefix="₹" />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Remaining principal, interest, and fees</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
