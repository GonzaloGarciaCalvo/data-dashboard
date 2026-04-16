"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/stores/dashboard";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-slate-900 dark:text-white mb-2">
          {label}
        </p>
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

export function SalesByDateChart() {
  const { salesByDate } = useDashboardStore();

  if (salesByDate.length === 0) {
    return (
      <Card className="p-6 text-center bg-white dark:bg-black border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </Card>
    );
  }

  return (
    <Card
      className="bg-white dark:bg-black border-slate-200 dark:border-slate-800"
      data-testid="sales-by-date"
    >
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">
          Sales by Date
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesByDate}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <XAxis
              dataKey="date"
              className="text-slate-600 dark:text-slate-400"
            />
            <YAxis className="text-slate-600 dark:text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#22c55e"
              name="Sales"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="costs"
              stroke="#ef4444"
              name="Costs"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="margin"
              stroke="#3b82f6"
              name="Margin"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
