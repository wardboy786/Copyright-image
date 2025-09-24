'use client';
import {
  AdMob,
  BannerAdPluginEvents,
  type AdMobBannerSize,
} from '@capacitor-community/admob';
import { useEffect } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';
import { type PluginListenerHandle } from '@capacitor/core';
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

    let listener: PluginListenerHandle | null = null;

    const initAds = async () => {
      try {
        await initialize();
        await showBanner();
      } catch (error) {
        console.error('Error initializing or showing ads:', error);
        setAdHeight(0);
      }
    };

    initAds();

    // Cleanup on component unmount
    return () => {
      if (listener) {
        listener.remove();
      }
      AdMob.hideBanner();
    };
  }, [isInitialized, isPremium, initialize, showBanner, setAdHeight]);

  return null; // This component does not render anything
}
