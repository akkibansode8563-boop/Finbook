import { getDashboardStats } from '@/features/dashboard/queries';
import { requireRole } from '@/lib/auth/rbac';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardCharts } from '@/features/dashboard/components/dashboard-charts';
import { KPIGrid } from '@/features/dashboard/components/kpi-grid';
import { formatCurrency } from '@/lib/utils/currency';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Banknote, Coins, Receipt, Landmark, Users, 
  ArrowUpRight, ArrowDownLeft, AlertCircle, Clock
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  // Guard route for viewer+ access
  const { profile } = await requireRole('viewer');

  const {
    kpis,
    portfolioDistribution,
    trendData,
    recentPayments,
    recentCustomers,
  } = await getDashboardStats();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[]} />

      <PageHeader
        title={`Welcome back, ${profile.name}`}
        description={`Finbook dashboard workspace for role: ${profile.role.toUpperCase()}`}
      />

      {/* KPI Cards Grid */}
      <KPIGrid kpis={kpis} />

      {/* Recharts Analytics Panel */}
      <DashboardCharts
        trendData={trendData}
        portfolioDistribution={portfolioDistribution}
      />

      {/* Bottom Row: Recent Collections & Customer Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Collections */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800/60 pb-3">
            <CardTitle className="text-slate-900 dark:text-white text-base">Recent Payments Collected</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Repayment receipts logged system-wide today.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No recent payments recorded.</div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800/10 transition-all text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="truncate">
                        <Link href={`/customers/${p.customer.id}`} className="font-bold text-slate-900 dark:text-white hover:text-primary hover:underline block">
                          {p.customer.fullName}
                        </Link>
                        <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">Receipt: {p.receiptNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-emerald-400 font-bold block font-mono tabular-nums">{formatCurrency(p.amount)}</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{p.paymentDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card className="bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800/60 pb-3">
            <CardTitle className="text-slate-900 dark:text-white text-base">Recent Customers Registered</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Customer profiles created recently.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCustomers.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No customers registered yet.</div>
            ) : (
              <div className="space-y-4">
                {recentCustomers.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800/10 transition-all text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brass/10 border border-brass/25 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-brass" />
                      </div>
                      <div className="truncate">
                        <Link href={`/customers/${c.id}`} className="font-bold text-slate-900 dark:text-white hover:text-primary hover:underline block">
                          {c.fullName}
                        </Link>
                        <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">Code: {c.customerCode}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold block">{c.phone}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Income: <span className="font-mono tabular-nums">{formatCurrency(c.monthlyIncome)}</span>/mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
