'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStore } from '@/stores/dashboard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }> }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg"
      >
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesByCustomerChart() {
  const { salesByCustomer } = useDashboardStore();

  if (salesByCustomer.length === 0) {
    return (
      <Card className="p-6 text-center bg-white dark:bg-black border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </Card>
    );
  }

  return (
    <Card 
      className="bg-white dark:bg-black border-slate-200 dark:border-slate-800"
      data-testid="sales-by-customer"
    >
      
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Sales by Customer</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={salesByCustomer}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {salesByCustomer.map((entry) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[salesByCustomer.indexOf(entry) % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}