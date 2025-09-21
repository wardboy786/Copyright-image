'use client';

import { AppContext } from '@/hooks/use-app-context';
import { useScans } from '@/hooks/use-scans';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const scansData = useScans();

  return (
    <AppContext.Provider value={scansData}>
      {children}
    </AppContext.Provider>
  );
}
