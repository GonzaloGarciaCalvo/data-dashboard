'use client';

import { BarChart3, Upload, Settings } from 'lucide-react';

interface SidebarProps {
  hasData: boolean;
  customers: { length: number };
  products: { length: number };
  sales: { length: number };
  sidebarOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ hasData, customers, products, sales, sidebarOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-slate-800 
        border-r border-slate-200 dark:border-slate-700 
        min-h-screen p-4
        transform transition-transform duration-200
        md:transform-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="space-y-2">
          <button 
            type="button"
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors bg-slate-100 dark:bg-slate-700"
          >
            <BarChart3 className="h-5 w-5" />
            Dashboard
          </button>
          <button 
            type="button"
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            onClick={onClose}
          >
            <Upload className="h-5 w-5" />
            Load Data
          </button>
          <button 
            type="button"
            className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </nav>
        
        {/* Stats in sidebar */}
        {hasData && (
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Loaded Data</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Customers:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{customers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Products:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{products.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Records:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{sales.length}</span>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}