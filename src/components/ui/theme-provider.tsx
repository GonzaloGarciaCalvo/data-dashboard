// components/ThemeProvider.tsx
"use client";

import { useDashboardStore } from "@/stores/dashboard";
import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useDashboardStore();

  useEffect(() => {
    // Solo para aplicar el tema guardado al cargar la página
    const root = document.documentElement;
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, []);

  return <>{children}</>;
}
