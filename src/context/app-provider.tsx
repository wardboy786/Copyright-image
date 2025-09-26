'use client';

import { AppContext } from '@/hooks/use-app-context';
import { useScans } from '@/hooks/use-scans';
import { SplashScreen } from '@/components/layout/splash-screen';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const scansData = useScans();
  const { isInitialized } = scansData;

  // The useScans hook now manages the initialization state of the billing service.
  // We will show the splash screen until all core services, including billing,
  // have been initialized. This prevents race conditions.
  if (!isInitialized) {
    // The onAnimationComplete is handled by the SplashScreen's internal timer now
    // We just need to keep it rendered until the context is ready.
    return <SplashScreen onAnimationComplete={() => {}} />;
  }

  return (
    <AppContext.Provider value={scansData}>
      {children}
    </AppContext.Provider>
  );
}
