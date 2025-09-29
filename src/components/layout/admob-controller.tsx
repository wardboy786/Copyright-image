'use client';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAppContext } from '@/hooks/use-app-context';
import useAdMob from '@/hooks/use-admob';

const INITIAL_AD_DELAY = 60 * 1000; // 1 minute
const AD_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function AdMobController() {
  const { isPremium, isInitialized } = useAppContext();
  const { initialize, showBanner, prepareInterstitial, showInterstitial } = useAdMob();

  useEffect(() => {
    // Immediately exit if the app is not initialized, user is premium, or not on a native platform.
    if (!isInitialized || isPremium || !Capacitor.isNativePlatform()) {
      return;
    }

    let adTimer: NodeJS.Timeout | null = null;

    const showAndScheduleAd = async () => {
      try {
        await prepareInterstitial();
        await showInterstitial();
      } catch (error) {
        console.error('Error showing interstitial ad:', error);
      } finally {
        // Schedule the next ad
        if (adTimer) clearTimeout(adTimer);
        adTimer = setTimeout(showAndScheduleAd, AD_INTERVAL);
      }
    };

    const initAds = async () => {
      try {
        await initialize();
        await showBanner();
        // Schedule the first ad
        adTimer = setTimeout(showAndScheduleAd, INITIAL_AD_DELAY);
      } catch (error) {
        console.error('Error initializing ads:', error);
      }
    };

    initAds();

    // Cleanup on component unmount
    return () => {
      if (adTimer) clearTimeout(adTimer);
    };
  }, [isInitialized, isPremium, initialize, showBanner, prepareInterstitial, showInterstitial]);

  return null; // This component does not render anything
}
