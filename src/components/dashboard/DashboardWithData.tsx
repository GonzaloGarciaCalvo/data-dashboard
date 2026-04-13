import { KPIGrid } from '@/components/dashboard/kpi-grid';
import { SalesAnalysis } from '@/components/charts/sales-analysis';

export function DashboardWithData() {
  return (
    <div className="space-y-6">
      {/* KPIs */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">KPIs</h2>
        <KPIGrid />
      </section>

      {/* Charts */}
      <SalesAnalysis />
    </div>
  );
}