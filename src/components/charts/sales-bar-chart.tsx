"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStore } from "@/stores/dashboard";

const COLORS = {
  sales: "#22c55e", // green
  costs: "#ef4444", // red
  margin: "#3b82f6", // blue
};

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

export function SalesBarChart() {
  const { salesByDate } = useDashboardStore();

  if (salesByDate.length === 0) {
    return (
      <Card className="p-6 text-center bg-white dark:bg-black border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </Card>
    );
  }

  // Transform data: margin = sales - costs
  // For stacked bars: costs at bottom, margin on top = sales total
  const chartData = salesByDate.map((item) => ({
    date: item.date,
    costs: item.costs,
    margin: item.margin,
    sales: item.sales,
  }));

  return (
    <Card
      className="bg-white dark:bg-black border-slate-200 dark:border-slate-800"
      data-testid="sales-bar-chart"
    >
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">
          Sales (Costs + Margin)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
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
            <Bar
              dataKey="costs"
              fill={COLORS.costs}
              name="Costs"
              stackId="stack"
            />
            <Bar
              dataKey="margin"
              fill={COLORS.margin}
              name="Margin"
              stackId="stack"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
