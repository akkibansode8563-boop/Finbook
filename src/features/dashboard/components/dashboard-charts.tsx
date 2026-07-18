'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/currency';

import { motion } from 'framer-motion';

interface ChartProps {
  trendData: {
    month: string;
    disbursed: number;
    collected: number;
  }[];
  portfolioDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function DashboardCharts({ trendData, portfolioDistribution }: ChartProps) {
  const isPieEmpty = portfolioDistribution.every((item) => item.value === 0);

  const customTooltipFormatter = (value: any) => {
    return [formatCurrency(value), ''];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bar Chart: Disbursements vs Collections */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={{ y: -2 }}
        className="lg:col-span-2 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 rounded-xl"
      >
        <Card className="h-full bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-foreground text-base">Collections vs Disbursements Trend</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Comparison of credit capital disbursed vs cash repayments collected over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value >= 100000 ? `${(value / 100000).toFixed(1)}L` : value}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '12px' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={customTooltipFormatter}
              />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
              />
              <Bar
                name="Capital Disbursed"
                dataKey="disbursed"
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                name="Cash Collected"
                dataKey="collected"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      </motion.div>

      {/* Pie Chart: Portfolio Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        whileHover={{ y: -2 }}
        className="transition-all duration-300 hover:shadow-md hover:shadow-primary/5 rounded-xl"
      >
        <Card className="h-full bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-foreground text-base">Lending Portfolio Mix</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Distribution of loan accounts by status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center items-center relative">
          {isPieEmpty ? (
            <div className="text-center p-6">
               <p className="text-slate-500 text-sm">No data available</p>
               <p className="text-slate-600 text-xs mt-1">Originate loans to see status distribution.</p>
            </div>
          ) : (
            <>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {portfolioDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ fontSize: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="grid grid-cols-2 gap-3 w-full px-4 mt-2 text-xs">
                {portfolioDistribution.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
