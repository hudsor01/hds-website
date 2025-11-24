'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch by only rendering after mount
  // This is the recommended pattern from next-themes docs
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative w-10 h-10 flex-center rounded-lg bg-gray-800/50 border border-gray-700/50"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative w-10 h-10 flex-center rounded-lg bg-gray-800/50 border border-gray-700/50 hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all duration-200"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-yellow-400" />
      ) : (
        <Moon className="w-5 h-5 text-cyan-400" />
      )}
    </button>
  );
}
