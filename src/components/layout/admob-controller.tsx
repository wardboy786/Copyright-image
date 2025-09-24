'use client';
import { AdMob, BannerAdPluginEvents, BannerAdSize } from '@capacitor-community/admob';
import { useEffect } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';
import { PluginListenerHandle } from '@capacitor/core';

export function AdMobController({
    setAdHeight
}: {
    setAdHeight: (height: number) => void;
}) {
  const { initialize, showBanner } = useAdMob();
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    let listener: PluginListenerHandle | null = null;

    const initAds = async () => {
      if (isInitialized && !isPremium) {
        try {
          await initialize();
          await showBanner();

          // Listen for banner ad size changes
          listener = await AdMob.addListener(BannerAdPluginEvents.Size, (info: BannerAdSize) => {
            setAdHeight(info.height);
          });
        } catch (error) {
            console.error("Error initializing or showing ads:", error);
            setAdHeight(0);
        }
      } else {
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
