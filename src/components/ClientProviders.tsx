'use client';

import type { ReactNode } from 'react';
import { QueryProvider } from '@/components/QueryProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}