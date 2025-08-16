"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Theme Provider
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      setTheme(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;
    
    const root = window.document.documentElement;
    
    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        setResolvedTheme(systemTheme);
        root.classList.toggle("dark", systemTheme === "dark");
      } else {
        setResolvedTheme(theme);
        root.classList.toggle("dark", theme === "dark");
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  const toggleTheme = () => {
    if (theme === "light") {
      handleSetTheme("dark");
    } else if (theme === "dark") {
      handleSetTheme("system");
    } else {
      handleSetTheme("light");
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme: handleSetTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Theme Toggle Button
interface ThemeToggleProps {
  variant?: "icon" | "button" | "select";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ThemeToggle({
  variant = "icon",
  size = "md",
  showLabel = false,
  className,
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  if (variant === "select") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showLabel && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
        )}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    );
  }

  if (variant === "button") {
    return (
      <motion.button
        onClick={toggleTheme}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "light" && <SunIcon className={iconSizes[size]} />}
            {theme === "dark" && <MoonIcon className={iconSizes[size]} />}
            {theme === "system" && <ComputerDesktopIcon className={iconSizes[size]} />}
          </motion.div>
        </AnimatePresence>
        {showLabel && (
          <span className="capitalize">
            {theme === "system" ? "Auto" : theme}
          </span>
        )}
      </motion.button>
    );
  }

  // Icon variant (default)
  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "relative flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === "light" ? "dark" : theme === "dark" ? "system" : "light"} theme`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" && <SunIcon className={iconSizes[size]} />}
          {theme === "dark" && <MoonIcon className={iconSizes[size]} />}
          {theme === "system" && <ComputerDesktopIcon className={iconSizes[size]} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// Theme-aware component wrapper
interface ThemeAwareProps {
  children: React.ReactNode;
  lightContent?: React.ReactNode;
  darkContent?: React.ReactNode;
  className?: string;
}

export function ThemeAware({
  children,
  lightContent,
  darkContent,
  className,
}: ThemeAwareProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedTheme}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {resolvedTheme === "light" && lightContent ? lightContent : children}
          {resolvedTheme === "dark" && darkContent ? darkContent : children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Color scheme utilities
export const colorSchemes = {
  light: {
    background: "bg-white",
    foreground: "text-gray-900",
    muted: "text-gray-600",
    border: "border-gray-200",
    card: "bg-gray-50",
    accent: "text-cyan-600",
    accentBg: "bg-cyan-50",
  },
  dark: {
    background: "bg-gray-900",
    foreground: "text-gray-100",
    muted: "text-gray-400",
    border: "border-gray-800",
    card: "bg-gray-800",
    accent: "text-cyan-400",
    accentBg: "bg-cyan-500/10",
  },
};

// Theme-aware color utility
export function useThemeColors() {
  const { resolvedTheme } = useTheme();
  return colorSchemes[resolvedTheme];
}

// CSS variable definitions for theme
export const themeVariables = `
  /* Light theme */
  :root {
    --background: 255 255 255;
    --foreground: 17 24 39;
    --muted: 107 114 128;
    --muted-foreground: 75 85 99;
    --border: 229 231 235;
    --input: 249 250 251;
    --card: 249 250 251;
    --card-foreground: 17 24 39;
    --primary: 6 182 212;
    --primary-foreground: 255 255 255;
    --secondary: 243 244 246;
    --secondary-foreground: 17 24 39;
    --accent: 6 182 212;
    --accent-foreground: 255 255 255;
    --destructive: 239 68 68;
    --destructive-foreground: 255 255 255;
    --ring: 6 182 212;
    --radius: 0.5rem;
  }

  /* Dark theme */
  .dark {
    --background: 17 24 39;
    --foreground: 249 250 251;
    --muted: 107 114 128;
    --muted-foreground: 156 163 175;
    --border: 55 65 81;
    --input: 31 41 55;
    --card: 31 41 55;
    --card-foreground: 249 250 251;
    --primary: 34 211 238;
    --primary-foreground: 17 24 39;
    --secondary: 55 65 81;
    --secondary-foreground: 249 250 251;
    --accent: 34 211 238;
    --accent-foreground: 17 24 39;
    --destructive: 239 68 68;
    --destructive-foreground: 255 255 255;
    --ring: 34 211 238;
  }
`;

// Theme-aware animation variants
export const themeAnimationVariants = {
  light: {
    background: { backgroundColor: "rgb(255, 255, 255)" },
    card: { backgroundColor: "rgb(249, 250, 251)" },
    text: { color: "rgb(17, 24, 39)" },
  },
  dark: {
    background: { backgroundColor: "rgb(17, 24, 39)" },
    card: { backgroundColor: "rgb(31, 41, 55)" },
    text: { color: "rgb(249, 250, 251)" },
  },
};

// System theme detection utility
export function getSystemTheme(): ResolvedTheme {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

// Theme transition component
interface ThemeTransitionProps {
  children: React.ReactNode;
  duration?: number;
}

export function ThemeTransition({ children }: ThemeTransitionProps) {

  return (
    <div
      className="min-h-screen"
    >
      {children}
    </div>
  );
}

// Theme preference detection and persistence
export class ThemeManager {
  private static instance: ThemeManager;
  private storageKey = "ui-theme";
  private theme: Theme = "system";
  private listeners: Set<(theme: Theme, resolvedTheme: ResolvedTheme) => void> = new Set();

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private constructor() {
    if (typeof window !== "undefined") {
      this.init();
    }
  }

  private init() {
    // Load from storage
    const stored = localStorage.getItem(this.storageKey) as Theme;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      this.theme = stored;
    }

    // Apply initial theme
    this.applyTheme();

    // Listen for system changes
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
      if (this.theme === "system") {
        this.applyTheme();
      }
    });
  }

  private applyTheme() {
    const root = document.documentElement;
    const resolvedTheme = this.getResolvedTheme();
    
    root.classList.toggle("dark", resolvedTheme === "dark");
    
    // Notify listeners
    this.listeners.forEach(callback => callback(this.theme, resolvedTheme));
  }

  private getResolvedTheme(): ResolvedTheme {
    if (this.theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return this.theme as ResolvedTheme;
  }

  setTheme(theme: Theme) {
    this.theme = theme;
    localStorage.setItem(this.storageKey, theme);
    this.applyTheme();
  }

  getTheme(): Theme {
    return this.theme;
  }

  getResolvedThemeValue(): ResolvedTheme {
    return this.getResolvedTheme();
  }

  subscribe(callback: (theme: Theme, resolvedTheme: ResolvedTheme) => void) {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }
}

const ThemeSystem = {
  ThemeProvider,
  ThemeToggle,
  ThemeAware,
  useTheme,
  useThemeColors,
  ThemeTransition,
  ThemeManager,
};

export default ThemeSystem;