'use client';

import { SalesByDateChart } from './sales-by-date-chart';
import { SalesByCustomerChart } from './sales-by-customer-chart';
import { SalesByProductChart } from './sales-by-product-chart';

export function SalesAnalysis() {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Sales Analysis</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesByDateChart />
        <SalesByCustomerChart />
      </div>
      <div className="mt-6">
        <SalesByProductChart />
      </div>
    </section>
  );
}