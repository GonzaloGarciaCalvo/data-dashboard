"use client";

import { useDashboardStore } from "@/stores/dashboard";
import { ChartGrouping } from "@/types";
import { useEffect } from "react";

const groupOptions: { label: string; value: ChartGrouping }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
];

export function ChartGroupSelector() {
  const { period, manualMonths, chartGrouping, setChartGrouping } =
    useDashboardStore();
  // Determine available groupings based on period
  const available =
    period === "all" || period === "annual" || period === "quarterly"
      ? (["quarter", "month", "week"] as ChartGrouping[])
      : period === "monthly" || period === "current"
        ? (["week", "day"] as ChartGrouping[])
        : period === "manual" && manualMonths <= 1
          ? (["week", "day"] as ChartGrouping[])
          : (["month", "week", "day"] as ChartGrouping[]);

  // Reset grouping to first available option if current is not available
  useEffect(() => {
    if (!available.includes(chartGrouping) && available.length > 0) {
      setChartGrouping(available[0]);
    }
  }, [available, chartGrouping, setChartGrouping]);

  return (
    <select
      value={chartGrouping}
      onChange={(e) => setChartGrouping(e.target.value as ChartGrouping)}
      className="px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {groupOptions
        .filter((opt) => available.includes(opt.value))
        .map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
    </select>
  );
}
