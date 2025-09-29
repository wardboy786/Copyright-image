'use client';

import { AppContext } from '@/hooks/use-app-context';
import { useScans } from '@/hooks/use-scans';
import { usePurchase } from './purchase-context';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const scansData = useScans();
  const { isInitialized: isPurchaseInitialized } = usePurchase();
  const { isInitialized: isScansInitialized } = scansData;

  // The useScans hook and useBilling are now separated.
  // We will show the splash screen until all core services, including scans and billing,
  // have been initialized. This prevents race conditions.
  const isFullyInitialized = isScansInitialized && isPurchaseInitialized;

  return (
    <AppContext.Provider value={{...scansData, isInitialized: isFullyInitialized }}>
      {children}
    </AppContext.Provider>
  );
}
