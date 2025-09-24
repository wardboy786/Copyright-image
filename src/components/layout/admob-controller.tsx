'use client';
import { AdMob } from '@capacitor-community/admob';
import { useEffect } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';
import { Capacitor } from '@capacitor/core';

export function AdMobController() {
  const { initialize, showBanner } = useAdMob();
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    if (!isInitialized || isPremium || !Capacitor.isNativePlatform()) {
      return;
    }

    const initAds = async () => {
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
  }, [isInitialized, isPremium, initialize, showBanner]);

  return null; // This component does not render anything
}
