'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/stores/dashboard';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { InitialState } from '@/components/dashboard/InitialState';
import { DashboardWithData } from '@/components/dashboard/DashboardWithData';

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