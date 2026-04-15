import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, Product, Time, Sale, CalculatedKPI } from '@/types';
import { calculateKPIs, getSalesByDateChartData, getSalesByCustomerChartData, getSalesByProductChartData } from '@/lib/kpis/calculator';

export type PeriodOption = 'annual' | 'quarterly' | 'monthly' | 'current' | 'manual' | 'all';
export type ChartGrouping = 'day' | 'week' | 'month' | 'quarter';

interface DashboardData {
  customers: Customer[];
  products: Product[];
  times: Time[];
  sales: Sale[];
  period: PeriodOption;
  manualMonths: number;
  chartGrouping: ChartGrouping;
  kpis: CalculatedKPI[];
  salesByDate: { date: string; sales: number; costs: number; margin: number }[];
  salesByCustomer: { name: string; value: number }[];
  salesByProduct: { name: string; value: number }[];
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  setCustomers: (customers: Customer[]) => void;
  setProducts: (products: Product[]) => void;
  setTimes: (times: Time[]) => void;
  setSales: (sales: Sale[]) => void;
  setPeriod: (period: PeriodOption) => void;
  setManualMonths: (manualMonths: number) => void;
  setChartGrouping: (chartGrouping: ChartGrouping) => void;
  calculateAll: () => void;
  reset: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

type DashboardState = DashboardData & DashboardActions;

const initialState: DashboardData = {
  customers: [],
  products: [],
  times: [],
  sales: [],
  period: 'all',
  manualMonths: 3,
  chartGrouping: 'day',
  kpis: [],
  salesByDate: [],
  salesByCustomer: [],
  salesByProduct: [],
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>()(
	persist(
		(set, get) => ({
			...initialState,

			setCustomers: (customers) => {
				set({ customers });
				get().calculateAll();
			},

			setProducts: (products) => {
				set({ products });
				get().calculateAll();
			},

			setTimes: (times) => {
				set({ times });
			},

			setSales: (sales) => {
				try {
					set({ sales });
					get().calculateAll();
				} catch (error) {
					console.error("[setSales] ERROR:", error);
					throw error;
				}
			},

			setPeriod: (period: PeriodOption) => {
				set({ period });
				get().calculateAll();
			},

			setManualMonths: (manualMonths: number) => {
				set({ manualMonths });
				get().calculateAll();
			},

			setChartGrouping: (chartGrouping) => {
				set({ chartGrouping });
				get().calculateAll();
			},

			calculateAll: () => {
				const {
					customers,
					products,
					sales,
					times,
					period,
					manualMonths,
					chartGrouping,
				} = get();

				// Filter sales based on period (handle empty sales array)
				const filteredSales = filterSalesByPeriod(sales, period, manualMonths);

				// Calculate KPIs (now passing both sales and times)
				const kpis = calculateKPIs(filteredSales, times);

				// Calculate chart data with grouping
				const salesByDate = getSalesByDateChartData(
					filteredSales,
					chartGrouping
				);
				const salesByCustomer = getSalesByCustomerChartData(
					filteredSales,
					customers
				);
				const salesByProduct = getSalesByProductChartData(
					filteredSales,
					products
				);

				set({
					kpis,
					salesByDate,
					salesByCustomer,
					salesByProduct,
				});
			},

			reset: () => {
				set(initialState);
			},

			setLoading: (isLoading) => set({ isLoading }),

			setError: (error) => set({ error }),
		}),
		{
			name: "dashboard-storage",
			partialize: (state) => ({
				customers: state.customers,
				products: state.products,
				times: state.times,
				sales: state.sales,
				kpis: state.kpis,
				salesByDate: state.salesByDate,
				salesByCustomer: state.salesByCustomer,
				salesByProduct: state.salesByProduct,
			}),
		}
	)
);

// Filter sales based on selected period
function filterSalesByPeriod(
  sales: Sale[],
  period: PeriodOption,
  manualMonths: number
): Sale[] {
  // Filter out null or undefined sales entries
  const validSales = sales.filter((sale): sale is Sale => sale !== null && sale !== undefined);
  if (period === 'all') {
    return validSales;
  }
  if (period === 'annual') {
    const currentYear = new Date().getFullYear().toString();
    return validSales.filter(sale => sale.date.startsWith(currentYear));
  }
  if (period === 'current') {
    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
    return validSales.filter(sale => {
      const [year, month] = sale.date.split('-');
      return year === currentYear && month === currentMonth;
    });
  }
  
  const monthsWithData = getUniqueMonths(validSales);
  
  if (monthsWithData.length === 0) {
    return validSales;
  }
  
  let monthsToInclude: string[];
  
  if (period === 'monthly') {
    monthsToInclude = monthsWithData.slice(-1);
  } else if (period === 'quarterly') {
    monthsToInclude = monthsWithData.slice(-3);
  } else if (period === 'manual') {
    monthsToInclude = monthsWithData.slice(-manualMonths);
  }
  
  // Filter sales to only include those from selected months
  return validSales.filter(sale => {
    const [year, month] = sale.date.split('-');
    const monthKey = `${year}-${month}`;
    return monthsToInclude.includes(monthKey);
  });
}

// Get unique YYYY-MM from sales data, sorted
function getUniqueMonths(sales: Sale[]): string[] {
  const months = new Set<string>();
  
  sales.forEach(sale => {
    const [year, month] = sale.date.split('-');
    months.add(`${year}-${month}`);
  });
  
  return Array.from(months).sort();
}

// Check if monthly variation should be shown
// - all: always show (full dataset)
// - annual: always show (current year)
// - quarterly: always show  
// - manual: show if >= 3 months (at least 2 complete months to compare)
// - monthly (Last Month): don't show (incomplete data)
// - current: don't show (partial data)
export function shouldShowMonthlyVariation(period: PeriodOption, manualMonths: number = 0): boolean {
  if (period === 'manual') {
    return manualMonths >= 3;
  }
  return period === 'all' || period === 'annual' || period === 'quarterly';
}