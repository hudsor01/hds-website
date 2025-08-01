'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setMounted } = useThemeStore();

  useEffect(() => {
    setMounted(true);
  }, [setMounted]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="hudson-theme"
      themes={['light', 'dark']}
      value={{
        light: 'light',
        dark: 'dark',
      }}
    >
      {children}
    </NextThemesProvider>
  );
}