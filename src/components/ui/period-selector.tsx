'use client';

import { useDashboardStore, type PeriodOption } from '@/stores/dashboard';

interface PeriodSelectorProps {
  onChange?: (period: PeriodOption) => void;
}

type GroupedOption = {
  label: string;
  value: PeriodOption;
};

const periodOptions: GroupedOption[] = [
  { label: 'All Data', value: 'all' },
  { label: 'Annual', value: 'annual' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Last Month', value: 'monthly' },
  { label: 'Current', value: 'current' },
  { label: 'Manual', value: 'manual' },
];

export function PeriodSelector({ onChange }: PeriodSelectorProps) {
  const { period, setPeriod, manualMonths, setManualMonths, sales } = useDashboardStore();

  // Calculate max available months for manual filter
  const getMaxMonths = (): number => {
    if (sales.length === 0) return 12;
    const months = new Set<string>();
    
    sales.forEach(sale => {
      if (sale && sale.date) {
        const [year, month] = sale.date.split('-');
        months.add(`${year}-${month}`);
      }
    });
    
    return Math.max(months.size, 1);
  };

  const maxMonths = getMaxMonths();

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value as PeriodOption;
    setPeriod(newPeriod);
    onChange?.(newPeriod);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const months = parseInt(e.target.value, 10);
    setManualMonths(months);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={period}
        onChange={handlePeriodChange}
        className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {periodOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {period === 'manual' && (
        <select
          value={manualMonths}
          onChange={handleMonthsChange}
          className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Array.from({ length: maxMonths }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>
              {num} {num === 1 ? 'month' : 'months'}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}