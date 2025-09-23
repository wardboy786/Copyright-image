'use client';
import { useEffect } from 'react';
import useAdMob from '@/hooks/native/use-admob';

export function AdMobController() {
  const { initialize, showBanner } = useAdMob();

  useEffect(() => {
    const initAds = async () => {
      try {
        const isInitialized = await initialize();
        if (isInitialized) {
          showBanner();
        }
      } catch (error) {
        console.error("Error initializing AdMob:", error);
      }
    };
    initAds();
  }, [initialize, showBanner]);

  return null; // This component does not render anything
}
