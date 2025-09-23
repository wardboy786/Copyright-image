'use client';

import { useAdmob } from '@/hooks/use-admob';
import { useEffect } from 'react';

/**
 * This component is dynamically imported with SSR disabled.
 * It's responsible for initializing and managing AdMob ads on the client-side.
 */
export function AdmobController() {
  const { initialize: initializeAdmob, isInitialized: isAdmobInitialized, showBanner } = useAdmob();

  useEffect(() => {
    // Initialize AdMob
    initializeAdmob();
  }, [initializeAdmob]);

  useEffect(() => {
    // Show banner ad once AdMob is initialized
    if (isAdmobInitialized) {
      showBanner();
    }
  }, [isAdmobInitialized, showBanner]);

  // This component does not render anything to the DOM
  return null;
}
