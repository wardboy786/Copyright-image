'use client';

import { createContext, type ReactNode } from 'react';
import { useScans, type UseScansReturn } from '@/hooks/use-scans';
import { Toaster } from '@/components/ui/toaster';

export const AppContext = createContext<UseScansReturn | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const scansData = useScans();

  return (
    <AppContext.Provider value={scansData}>
      {children}
      <Toaster />
    </AppContext.Provider>
  );
}
