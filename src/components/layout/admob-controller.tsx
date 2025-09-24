'use client';
import { AdMob } from '@capacitor-community/admob';
import { useEffect, useState } from 'react';
import useAdMob from '@/hooks/use-admob';
import { useAppContext } from '@/hooks/use-app-context';

export function AdMobController({
    setAdHeight
}: {
    setAdHeight: (height: number) => void;
}) {
  const { initialize, showBanner } = useAdMob();
  const { isPremium, isInitialized } = useAppContext();

  useEffect(() => {
    if (isInitialized && !isPremium) {
      const initAndShow = async () => {
        await initialize();
        showBanner();
      };
      initAndShow();

      // Listen for banner ad size changes
      const listener = AdMob.addListener('bannerAdSize', (info) => {
        setAdHeight(info.height);
      });

      return () => {
        listener.remove();
      };
    } else {
        setAdHeight(0);
    }
  }, [isInitialized, isPremium, initialize, showBanner, setAdHeight]);

  return null; // This component does not render anything
}
