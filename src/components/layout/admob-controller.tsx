'use client';
import {
  AdMob,
} from '@capacitor-community/admob';
import { useEffect } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';
import { Capacitor } from '@capacitor/core';

export function AdMobController({
  setAdHeight,
}: {
  setAdHeight: (height: number) => void;
}) {
  const { initialize, showBanner } = useAdMob();
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    if (!isInitialized || isPremium || !Capacitor.isNativePlatform()) {
      // No ad will be shown, so ensure ad height is 0
      setAdHeight(0);
      return;
    }

    const initAds = async () => {
      try {
        await initialize();
        await showBanner();
        // Since we now use a margin, we can set a fixed height for layout purposes if needed,
        // but for now we will rely on the margin to push content.
        // A standard banner is 50px high.
        setAdHeight(50); 
      } catch (error) {
        console.error('Error initializing or showing ads:', error);
        setAdHeight(0);
      }
    };

    initAds();

    // Cleanup on component unmount
    return () => {
      AdMob.hideBanner();
    };
  }, [isInitialized, isPremium, initialize, showBanner, setAdHeight]);

  return null; // This component does not render anything
}
