"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/stores/dashboard";

export default function ThemeInitializer() {

  const { setTheme } = useDashboardStore();

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-storage");
    if (!stored) {
      const browserTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(browserTheme);
    }
  }, []);
  return null;
}
