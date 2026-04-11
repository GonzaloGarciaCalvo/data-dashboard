'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore, shouldShowMonthlyVariation } from '@/stores/dashboard';
import { DollarSign, TrendingUp, Package, Percent, Calculator } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Total Sales': DollarSign,
  'Total Costs': DollarSign,
  'Gross Margin': TrendingUp,
  'Margin %': Percent,
  'Units Sold': Package,
  'Average Sale': Calculator,
  'Monthly Variation': TrendingUp,
};

const colorMap: Record<string, string> = {
  'Total Sales': 'text-green-500 dark:text-green-400',
  'Total Costs': 'text-red-500 dark:text-red-400',
  'Gross Margin': 'text-blue-500 dark:text-blue-400',
  'Margin %': 'text-purple-500 dark:text-purple-400',
  'Units Sold': 'text-orange-500 dark:text-orange-400',
  'Average Sale': 'text-indigo-500 dark:text-indigo-400',
  'Monthly Variation': 'text-cyan-500 dark:text-cyan-400',
};

export function KPIGrid() {
  const { kpis, sales, period, manualMonths } = useDashboardStore();

  if (sales.length === 0) {
    return (
      <Card className="p-6 text-center bg-white dark:bg-black border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-400">No data loaded. Upload CSV files to see KPIs.</p>
      </Card>
    );
  }

  if (kpis.length === 0) {
    return (
      <Card className="p-6 text-center bg-white dark:bg-black border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-400">Calculating KPIs...</p>
      </Card>
    );
  }

  // Filter KPIs based on period - hide Monthly Variation for manual/current/monthly
  const showMV = shouldShowMonthlyVariation(period, manualMonths);
  const filteredKpis = showMV ? kpis : kpis.filter(k => k.name !== 'Monthly Variation');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredKpis.map((kpi) => {
        const Icon = iconMap[kpi.name] || DollarSign;
        const colorClass = colorMap[kpi.name] || 'text-slate-500 dark:text-slate-400';
        
        return (
          <Card 
            key={kpi.name} 
            className="hover:shadow-md transition-shadow overflow-hidden bg-white dark:bg-black border-slate-200 dark:border-slate-800"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">
                {kpi.name}
              </CardTitle>
              <Icon className={`h-5 w-5 shrink-0 ${colorClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate" title={kpi.formattedValue}>
                {kpi.formattedValue}
              </div>
              {kpi.variation !== undefined && (
                <p className={`text-xs mt-1 truncate ${kpi.variation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {kpi.variation >= 0 ? '+' : ''}{kpi.variation}% vs previous period
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}