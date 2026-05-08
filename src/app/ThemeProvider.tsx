"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggleTheme: () => {}, setTheme: () => {} });

export function useTheme() { return useContext(ThemeContext); }

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bioathlete-theme") as Theme | null;
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setThemeState(saved || preferred);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("bioathlete-theme", theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => setThemeState(t => t === "light" ? "dark" : "light"), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);

  // Prevent flash of wrong theme
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ─── Theme Toggle Button Component ─── */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Basculer en mode ${theme === "light" ? "sombre" : "clair"}`}
      className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-lg transition-all duration-500 cursor-pointer ${className}`}
      style={{
        background: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        color: theme === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
      }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
