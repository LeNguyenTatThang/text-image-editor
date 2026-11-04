"use client";

import { createContext, useContext, useEffect, useCallback, useSyncExternalStore } from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const THEME_KEY = "rv-editor-theme";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  return saved === "light" || saved === "dark" ? saved : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function setStoredTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  listeners.forEach((listener) => listener());
}

const ThemeContext = createContext<ThemeContextValue>({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setStoredTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
