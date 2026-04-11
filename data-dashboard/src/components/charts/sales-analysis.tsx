'use client';

import { SalesByDateChart } from './sales-by-date-chart';
import { SalesByCustomerChart } from './sales-by-customer-chart';
import { SalesByProductChart } from './sales-by-product-chart';
import { SalesBarChart } from './sales-bar-chart';
import { ChartGroupSelector } from '@/components/ui/chart-group-selector';

export function SalesAnalysis() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Sales Analysis</h2>
        <ChartGroupSelector />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesByDateChart />
        <SalesByCustomerChart />
      </div>
      <div className="mt-6">
        <SalesByProductChart />
      </div>
      <div className="mt-6">
        <SalesBarChart />
      </div>
    </section>
  );
}