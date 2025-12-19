'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      suppressHydrationWarning

      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-10 h-10 flex-center rounded-lg bg-muted/50 border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all duration-150"
      aria-label={`Switch theme to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch theme to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun suppressHydrationWarning className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon suppressHydrationWarning className="w-5 h-5 text-cyan-400" />
      )}
    </button>
  );
}
