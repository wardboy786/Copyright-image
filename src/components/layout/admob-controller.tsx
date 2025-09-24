'use client';
import { AdMob, BannerAdSize } from '@capacitor-community/admob';
import { useEffect } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';
import { PluginListenerHandle } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';

export function AdMobController({
    setAdHeight
}: {
    setAdHeight: (height: number) => void;
}) {
  const { initialize, showBanner } = useAdMob();
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    if (!isInitialized || isPremium || !Capacitor.isNativePlatform()) {
      setAdHeight(0);
      return;
    }

    let listener: PluginListenerHandle | null = null;

    const initAds = async () => {
      try {
        await initialize();
        
        // Listen for banner ad size changes using the correct event name
        listener = await AdMob.addListener('bannerAdSizeChanged', (size: BannerAdSize) => {
          if (size && typeof size.height === 'number') {
            setAdHeight(size.height);
          } else {
            setAdHeight(0);
          }
        });

        await showBanner();

      } catch (error) {
          console.error("Error initializing or showing ads:", error);
          setAdHeight(0);
      }
    };

    initAds();

    // Cleanup on component unmount
    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [isInitialized, isPremium, initialize, showBanner, setAdHeight]);

  return null; // This component does not render anything
}
