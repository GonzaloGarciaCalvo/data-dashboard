"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-slate-900 dark:text-white mb-2">
          {label}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function SalesByProductChart() {
  const { salesByProduct } = useDashboardStore();

  if (salesByProduct.length === 0) {
    return (
      <Card className="p-6 text-center bg-white dark:bg-black border-slate-200 dark:border-slate-800">
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </Card>
    );
  }

  return (
    <Card
      className="bg-white dark:bg-black border-slate-200 dark:border-slate-800"
      data-testid="sales-by-product"
    >
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">
          Sales by Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesByProduct}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-slate-200 dark:stroke-slate-800"
            />
            <XAxis
              dataKey="name"
              className="text-slate-600 dark:text-slate-400"
            />
            <YAxis className="text-slate-600 dark:text-slate-400" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
