'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      suppressHydrationWarning

      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      variant="outline"
      size="icon-lg"
      className="relative bg-muted/50 border-border/50 hover:bg-muted/50 hover:border-primary/30"
      aria-label={`Switch theme to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch theme to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun suppressHydrationWarning className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon suppressHydrationWarning className="w-5 h-5 text-cyan-400" />
      )}
    </Button>
  );
}
