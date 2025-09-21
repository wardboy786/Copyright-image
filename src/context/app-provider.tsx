'use client';

import { createContext, type ReactNode } from 'react';
import { useScans, type UseScansReturn } from '@/hooks/use-scans';

export const AppContext = createContext<UseScansReturn | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const scansData = useScans();

  return (
    <AppContext.Provider value={scansData}>
      {children}
    </AppContext.Provider>
  );
}
