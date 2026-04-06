import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cliente, Producto, Tiempo, Hecho, KPICalculado } from '@/types';
import { calcularKPIs, obtenerDatosGraficoVentasPorFecha, obtenerDatosGraficoVentasPorCliente, obtenerDatosGraficoVentasPorProducto } from '@/lib/kpis/calculator';

interface DashboardState {
  // Datos cargados
  clientes: Cliente[];
  productos: Producto[];
  tiempos: Tiempo[];
  hechos: Hecho[];
  
  // KPIs calculados
  kpis: KPICalculado[];
  
  // Datos para gráficos
  ventasPorFecha: { fecha: string; ventas: number; costos: number; margen: number }[];
  ventasPorCliente: { name: string; value: number }[];
  ventasPorProducto: { name: string; value: number }[];
  
  // Estado de carga
  isLoading: boolean;
  error: string | null;
  
  // Acciones
  setClientes: (clientes: Cliente[]) => void;
  setProductos: (productos: Producto[]) => void;
  setTiempos: (tiempos: Tiempo[]) => void;
  setHechos: (hechos: Hecho[]) => void;
  calcularTodo: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState = {
  clientes: [],
  productos: [],
  tiempos: [],
  hechos: [],
  kpis: [],
  ventasPorFecha: [],
  ventasPorCliente: [],
  ventasPorProducto: [],
  isLoading: false,
  error: null,
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setClientes: (clientes) => {
        set({ clientes });
        get().calcularTodo();
      },
      
      setProductos: (productos) => {
        set({ productos });
        get().calcularTodo();
      },
      
      setTiempos: (tiempos) => {
        set({ tiempos });
      },
      
      setHechos: (hechos) => {
        set({ hechos });
        get().calcularTodo();
      },
      
      calcularTodo: () => {
        const { clientes, productos, hechos } = get();
        
        if (hechos.length === 0) {
          return;
        }
        
        // Calcular KPIs
        const kpis = calcularKPIs(hechos);
        
        // Calcular datos para gráficos
        const ventasPorFecha = obtenerDatosGraficoVentasPorFecha(hechos);
        const ventasPorCliente = obtenerDatosGraficoVentasPorCliente(hechos, clientes);
        const ventasPorProducto = obtenerDatosGraficoVentasPorProducto(hechos, productos);
        
        set({
          kpis,
          ventasPorFecha,
          ventasPorCliente,
          ventasPorProducto,
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
        clientes: state.clientes,
        productos: state.productos,
        tiempos: state.tiempos,
        hechos: state.hechos,
        kpis: state.kpis,
        ventasPorFecha: state.ventasPorFecha,
        ventasPorCliente: state.ventasPorCliente,
        ventasPorProducto: state.ventasPorProducto,
      }),
    }
  )
);