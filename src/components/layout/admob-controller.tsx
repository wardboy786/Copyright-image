'use client';
import { useEffect } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';

export function AdMobController() {
  const { initialize, showBanner } = useAdMob();
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    if (isInitialized && !isPremium) {
      const initAndShow = async () => {
        const success = await initialize();
        if (success) {
          showBanner();
        }
      };
      initAndShow();
    }
  }, [isInitialized, isPremium, initialize, showBanner]);

  return null; // This component does not render anything
}
