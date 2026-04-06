'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/stores/dashboard';
import { DollarSign, TrendingUp, Package, Percent, Calculator } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Ventas Totales': DollarSign,
  'Costos Totales': DollarSign,
  'Margen Bruto': TrendingUp,
  'Margen %': Percent,
  'Unidades Vendidas': Package,
  'Promedio por Venta': Calculator,
};

const colorMap: Record<string, string> = {
  'Ventas Totales': 'text-green-600 dark:text-green-400',
  'Costos Totales': 'text-red-600 dark:text-red-400',
  'Margen Bruto': 'text-blue-600 dark:text-blue-400',
  'Margen %': 'text-purple-600 dark:text-purple-400',
  'Unidades Vendidas': 'text-orange-600 dark:text-orange-400',
  'Promedio por Venta': 'text-indigo-600 dark:text-indigo-400',
};

export function KPIGrid() {
  const { kpis, hechos } = useDashboardStore();

  if (hechos.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-700 ">No hay datos cargados. Sube archivos CSV para ver los KPIs.</p>
      </Card>
    );
  }

  if (kpis.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-700 ">Calculando KPIs...</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.nombre] || DollarSign;
        const colorClass = colorMap[kpi.nombre] || 'text-slate-600 dark:text-slate-400';
        
        return (
          <Card key={kpi.nombre} className="hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-medium text-slate-800  truncate">
                {kpi.nombre}
              </CardTitle>
              <Icon className={`h-5 w-5 flex-shrink-0 ${colorClass}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold truncate" title={kpi.formattedValue}>
                {kpi.formattedValue}
              </div>
              {kpi.Variación !== undefined && (
                <p className={`text-xs mt-1 truncate ${kpi.Variación >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {kpi.Variación >= 0 ? '+' : ''}{kpi.Variación}% vs período anterior
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}