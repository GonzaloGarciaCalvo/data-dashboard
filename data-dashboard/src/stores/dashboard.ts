import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Customer, Product, Time, Sale, CalculatedKPI } from '@/types';
import { calculateKPIs, getSalesByDateChartData, getSalesByCustomerChartData, getSalesByProductChartData } from '@/lib/kpis/calculator';

interface DashboardState {
  // Loaded data
  customers: Customer[];
  products: Product[];
  times: Time[];
  sales: Sale[];
  
  // Calculated KPIs
  kpis: CalculatedKPI[];
  
  // Chart data
  salesByDate: { date: string; sales: number; costs: number; margin: number }[];
  salesByCustomer: { name: string; value: number }[];
  salesByProduct: { name: string; value: number }[];
  
  // Loading state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCustomers: (customers: Customer[]) => void;
  setProducts: (products: Product[]) => void;
  setTimes: (times: Time[]) => void;
  setSales: (sales: Sale[]) => void;
  calculateAll: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState = {
  customers: [],
  products: [],
  times: [],
  sales: [],
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
        set({ sales });
        get().calculateAll();
      },
      
      calculateAll: () => {
        const { customers, products, sales } = get();
        
        if (sales.length === 0) {
          return;
        }
        
        // Calculate KPIs
        const kpis = calculateKPIs(sales);
        
        // Calculate chart data
        const salesByDate = getSalesByDateChartData(sales);
        const salesByCustomer = getSalesByCustomerChartData(sales, customers);
        const salesByProduct = getSalesByProductChartData(sales, products);
        
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
      name: 'dashboard-storage',
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