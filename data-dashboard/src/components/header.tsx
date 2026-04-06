'use client';

import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  hasData: boolean;
  onClearData: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ hasData, onClearData, sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button 
            type="button"
            className="md:hidden p-2 -ml-2"
            onClick={onToggleSidebar}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <LayoutDashboard className="h-8 w-8 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Data Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          {hasData && (
            <Button type="button" variant="outline" size="sm" onClick={onClearData}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Clear Data</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}