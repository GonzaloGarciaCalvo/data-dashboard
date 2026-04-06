'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/stores/dashboard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function VentasPorFechaChart() {
  const { ventasPorFecha } = useDashboardStore();

  if (ventasPorFecha.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Ventas por Fecha</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ventasPorFecha}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="fecha" className="text-slate-600 dark:text-slate-400" />
            <YAxis className="text-slate-600 dark:text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="ventas" stroke="#22c55e" name="Ventas" strokeWidth={2} />
            <Line type="monotone" dataKey="costos" stroke="#ef4444" name="Costos" strokeWidth={2} />
            <Line type="monotone" dataKey="margen" stroke="#3b82f6" name="Margen" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function VentasPorClienteChart() {
  const { ventasPorCliente } = useDashboardStore();

  if (ventasPorCliente.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Ventas por Cliente</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={ventasPorCliente}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {ventasPorCliente.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function VentasPorProductoChart() {
  const { ventasPorProducto } = useDashboardStore();

  if (ventasPorProducto.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-slate-500 dark:text-slate-400">No hay datos disponibles</p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Ventas por Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ventasPorProducto}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis dataKey="name" className="text-slate-600 dark:text-slate-400" />
            <YAxis className="text-slate-600 dark:text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}