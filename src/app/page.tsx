'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/stores/dashboard';
import { CSVUploader } from '@/components/dashboard/csv-uploader';
import { KPIGrid } from '@/components/dashboard/kpi-grid';
import { SalesAnalysis } from '@/components/charts/sales-analysis';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function InitialState() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome to Data Dashboard
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Start by loading your CSV files to visualize your data and KPIs.
        </p>
      </div>
      <CSVUploader />
      
      {/* Expected format info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Expected Files</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <li>• <strong className="text-slate-700 dark:text-slate-200">Customers:</strong> customerId, name, region, segment</li>
            <li>• <strong className="text-slate-700 dark:text-slate-200">Products:</strong> productId, category, brand</li>
            <li>• <strong className="text-slate-700 dark:text-slate-200">Times:</strong> (optional) timeId, date, month, quarter, year</li>
            <li>• <strong className="text-slate-700 dark:text-slate-200">Sales:</strong> date, customerId, productId, sales, costs, units</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardWithData() {
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

export default function DashboardPage() {
  const { reset, customers, products, sales } = useDashboardStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasData = sales.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        hasData={hasData}
        onClearData={reset}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        <Sidebar 
          hasData={hasData}
          customers={customers}
          products={products}
          sales={sales}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {hasData ? <DashboardWithData /> : <InitialState />}
        </main>
      </div>
    </div>
  );
}