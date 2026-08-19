import { useLayoutEffect, type ReactNode } from "react";
import { useTrackerStore, type Theme } from "@/lib/store";

const LIGHT_THEME = "#f3efe6";
const DARK_THEME = "#08090b";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTrackerStore((s) => s.theme);
  const setTheme = useTrackerStore((s) => s.setTheme);

  useLayoutEffect(() => {
    useTrackerStore.persist.rehydrate();
    let stored: Theme | null = null;
    try {
      const t = localStorage.getItem("brk-theme");
      if (t === "light" || t === "dark") stored = t;
    } catch {
      /* ignore */
    }
    if (stored && stored !== theme) {
      setTheme(stored);
      return;
    }
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", theme === "light" ? LIGHT_THEME : DARK_THEME);
  }, [theme, setTheme]);

  return <>{children}</>;
}
