'use client';

import { useDashboardStore } from '@/stores/dashboard';
import { CSVUploader } from '@/components/dashboard/csv-uploader';
import { KPIGrid } from '@/components/dashboard/kpi-grid';
import { VentasPorFechaChart, VentasPorClienteChart, VentasPorProductoChart } from '@/components/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Upload, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { reset, clientes, productos, hechos } = useDashboardStore();

  const hasData = hechos.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Data Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {hasData && (
              <Button type="button" variant="outline" size="sm" onClick={reset}>
                <LogOut className="h-4 w-4 mr-2" />
                Limpiar Datos
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 min-h-screen p-4">
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
            >
              <Upload className="h-5 w-5" />
              Cargar Datos
            </button>
            <button 
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 text-left text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Settings className="h-5 w-5" />
              Configuración
            </button>
          </nav>
          
          {/* Stats en sidebar */}
          {hasData && (
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">Datos Cargados</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Clientes:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{clientes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Productos:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{productos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Registros:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{hechos.length}</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {!hasData ? (
            // Estado inicial - Solo mostrar uploader
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Bienvenido al Data Dashboard
                </h2>
                <p className="text-slate-600 dark:text-slate-300">
                  Comienza cargando tus archivos CSV para visualizar tus datos y KPIs.
                </p>
              </div>
              <CSVUploader />
              
              {/* Info sobre formato esperado */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Archivos Esperados</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>• <strong className="text-slate-700 dark:text-slate-200">Clientes:</strong> IDCliente, Nombre, Región, Segmento</li>
                    <li>• <strong className="text-slate-700 dark:text-slate-200">Productos:</strong> IDProducto, Categoría, Marca</li>
                    <li>• <strong className="text-slate-700 dark:text-slate-200">Tiempos:</strong> (opcional) IDTiempo, Fecha, Mes, Trimestre, Año</li>
                    <li>• <strong className="text-slate-700 dark:text-slate-200">Hechos:</strong> Fecha, IDCliente, IDProducto, Ventas, Costos, Unidades</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Dashboard con datos
            <div className="space-y-6">
              {/* KPIs */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">KPIs</h2>
                <KPIGrid />
              </section>

              {/* Gráficos */}
              <section>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Análisis de Ventas</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <VentasPorFechaChart />
                  <VentasPorClienteChart />
                </div>
                <div className="mt-6">
                  <VentasPorProductoChart />
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}