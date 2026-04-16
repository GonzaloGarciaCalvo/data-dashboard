'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { InitialState } from '@/components/dashboard/InitialState';
import { DashboardWithData } from '@/components/dashboard/DashboardWithData';
import { useDashboardStore } from '@/stores/dashboard';
import { mockedCustomers, mockedProducts, mockedSales, mockedTimes } from '@/lib/mockedData';

export default function DemoPage() {
  const { setCustomers, setProducts, setSales, setTimes, reset } = useDashboardStore();

  useEffect(() => {
    // Reset store to clear any existing data
    //reset();
    
    // Set mock data in order that minimizes unnecessary recalculations
    // Setting times doesn't trigger calculateAll, so we do it first
    setTimes(mockedTimes);
    setCustomers(mockedCustomers);
    setProducts(mockedProducts);
    setSales(mockedSales);
    return () => reset();
  }, [setCustomers, setProducts, setSales, setTimes, reset]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header 
        hasData={true}
        onClearData={reset}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        <Sidebar 
          hasData={true}
          customers={mockedCustomers}
          products={mockedProducts}
          sales={mockedSales}
          sidebarOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <DashboardWithData />
        </main>
      </div>
    </div>
  );
}