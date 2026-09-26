// src/components/providers/QueryProvider.tsx
'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes: instant client navigation without refetching delay
            gcTime: 1000 * 60 * 10, // 10 minutes memory retention
            refetchOnWindowFocus: false, // Prevent distracting lag when switching tabs
            retry: 1, // Minimize retry delay on errors
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
