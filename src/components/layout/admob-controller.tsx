'use client';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAppContext } from '@/hooks/use-app-context';
import { AdMob } from '@capacitor-community/admob';

export function AdMobController() {
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    if (!isInitialized || isPremium || !Capacitor.isNativePlatform()) {
      return;
    }

    const initAds = async () => {
      // Dynamically import the native-specific hook to ensure the correct one is bundled.
      const useAdMobNative = (await import('@/hooks/use-admob')).default;
      const { initialize, showBanner } = useAdMobNative();
      
      try {
        await initialize();
        await showBanner();
      } catch (error) {
        console.error('Error initializing or showing ads:', error);
      }
    };

    initAds();

    // Cleanup on component unmount
    return () => {
      AdMob.hideBanner();
    };
  }, [isInitialized, isPremium]);

  return null; // This component does not render anything
}
