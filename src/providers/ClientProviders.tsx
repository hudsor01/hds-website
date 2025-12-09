'use client';

import { QueryProvider } from '@/providers/QueryProvider';
import { cleanupAccessibilityFeatures, initAccessibilityFeatures } from '@/utils/accessibility';
import { ThemeProvider } from 'next-themes';
import { useEffect, type ReactNode } from 'react';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Initialize accessibility features on mount and cleanup on unmount
  // Per MDN: Proper cleanup prevents memory leaks in SPAs
  // Reference: https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#memory_concerns
  useEffect(() => {
    initAccessibilityFeatures();

    return () => {
      cleanupAccessibilityFeatures();
    };
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}
